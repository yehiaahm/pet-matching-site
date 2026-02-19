/**
 * TanStack Query Hooks for Pets
 * Replaces useEffect + fetch with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pet } from '../App';

// API functions
const fetchPets = async (): Promise<Pet[]> => {
  const response = await fetch('/api/v1/pets', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }

  const data = await response.json();
  return data.data || [];
};

const fetchPetById = async (id: string): Promise<Pet> => {
  const response = await fetch(`/api/v1/pets/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pet');
  }

  const data = await response.json();
  return data.data;
};

const createPet = async (petData: Partial<Pet>): Promise<Pet> => {
  const response = await fetch('/api/v1/pets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
    },
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error('Failed to create pet');
  }

  const data = await response.json();
  return data.data;
};

const updatePet = async ({ id, ...petData }: { id: string } & Partial<Pet>): Promise<Pet> => {
  const response = await fetch(`/api/v1/pets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
    },
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error('Failed to update pet');
  }

  const data = await response.json();
  return data.data;
};

const deletePet = async (id: string): Promise<void> => {
  const response = await fetch(`/api/v1/pets/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete pet');
  }
};

// Query Keys
export const queryKeys = {
  all: ['pets'] as const,
  lists: () => [...queryKeys.all, 'list'] as const,
  list: (filters: string) => [...queryKeys.lists(), { filters }] as const,
  details: () => [...queryKeys.all, 'detail'] as const,
  detail: (id: string) => [...queryKeys.details(), id] as const,
};

// Hooks
export function usePets(options?: {
  enabled?: boolean;
  staleTime?: number;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: fetchPets,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    refetchInterval: options?.refetchInterval || false,
    enabled: options?.enabled !== false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function usePet(id: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => fetchPetById(id),
    enabled: !!id && (options?.enabled !== false),
    staleTime: options?.staleTime || 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPet,
    onSuccess: (newPet) => {
      // Invalidate and refetch pets list
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      
      // Add the new pet to the cache
      queryClient.setQueryData(queryKeys.detail(newPet.id), newPet);
      
      toast.success('Pet created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create pet');
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePet,
    onMutate: async ({ id, ...petData }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });

      // Snapshot the previous value
      const previousPet = queryClient.getQueryData(queryKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.detail(id), (old: any) => ({ ...old, ...petData }));

      // Return a context object with the snapshotted value
      return { previousPet };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousPet) {
        queryClient.setQueryData(queryKeys.detail(variables.id), context.previousPet);
      }
      toast.error(error.message || 'Failed to update pet');
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
    onSuccess: () => {
      toast.success('Pet updated successfully!');
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePet,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });

      // Snapshot the previous value
      const previousPet = queryClient.getQueryData(queryKeys.detail(id));

      // Remove the pet from the cache
      queryClient.removeQueries({ queryKey: queryKeys.detail(id) });

      // Return a context object with the snapshotted value
      return { previousPet };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousPet) {
        queryClient.setQueryData(queryKeys.detail(variables), context.previousPet);
      }
      toast.error(error.message || 'Failed to delete pet');
    },
    onSuccess: () => {
      toast.success('Pet deleted successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
    },
  });
}

// Advanced hook for infinite scrolling
export function useInfinitePets(options?: {
  limit?: number;
  enabled?: boolean;
}) {
  const limit = options?.limit || 10;

  return useInfiniteQuery({
    queryKey: queryKeys.lists(),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/v1/pets?page=${pageParam}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pets');
      }

      const data = await response.json();
      return {
        data: data.data || [],
        nextPage: pageParam + 1,
        hasMore: data.data?.length === limit,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextPage : undefined,
    enabled: options?.enabled !== false,
  });
}

// Hook for prefetching pets
export function usePrefetchPet(id: string) {
  const queryClient = useQueryClient();

  return () => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => fetchPetById(id),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

// Hook for optimistic updates
export function useOptimisticPetUpdate() {
  const queryClient = useQueryClient();

  return (id: string, updates: Partial<Pet>) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey: queryKeys.detail(id) });

    // Snapshot the previous value
    const previousPet = queryClient.getQueryData(queryKeys.detail(id));

    // Optimistically update
    queryClient.setQueryData(queryKeys.detail(id), (old: any) => ({ ...old, ...updates }));

    // Return rollback function
    return () => {
      queryClient.setQueryData(queryKeys.detail(id), previousPet);
    };
  };
}
