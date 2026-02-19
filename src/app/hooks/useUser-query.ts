/**
 * TanStack Query Hooks for User Profiles
 * Replaces useEffect + fetch with React Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

// Types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  preferences: {
    notifications: boolean;
    privacy: 'public' | 'friends' | 'private';
    language: string;
  };
  stats: {
    petsCount: number;
    matchesCount: number;
    rating: number;
    verified: boolean;
    joinDate: string;
  };
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  topRatedUsers: UserProfile[];
}

interface UserPreferences {
  notifications: {
    email: boolean;
    push: boolean;
    messages: boolean;
    matches: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    showLocation: boolean;
    allowMessages: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
  };
}

// API functions
const fetchUserProfile = async (userId: string): Promise<UserProfile> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch(`/api/v1/users/${userId}/profile`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  const data = await response.json();
  return data.data;
};

const fetchCurrentUserProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/users/profile', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch current user profile');
  }

  const data = await response.json();
  return data.data;
};

const updateUserProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/users/profile', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update user profile');
  }

  const data = await response.json();
  return data.data;
};

const uploadAvatar = async (file: File): Promise<{ url: string }> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/v1/users/avatar', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload avatar');
  }

  const data = await response.json();
  return data.data;
};

const fetchUserStats = async (): Promise<UserStats> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/users/stats', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }

  const data = await response.json();
  return data.data;
};

const fetchUserPreferences = async (): Promise<UserPreferences> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/users/preferences', {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user preferences');
  }

  const data = await response.json();
  return data.data;
};

const updateUserPreferences = async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const response = await fetch('/api/v1/users/preferences', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(preferences),
  });

  if (!response.ok) {
    throw new Error('Failed to update user preferences');
  }

  const data = await response.json();
  return data.data;
};

const searchUsers = async (query: string, filters?: {
  location?: string;
  verified?: boolean;
  hasPets?: boolean;
}): Promise<UserProfile[]> => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const params = new URLSearchParams({
    query,
    ...(filters?.location && { location: filters.location }),
    ...(filters?.verified !== undefined && { verified: filters.verified.toString() }),
    ...(filters?.hasPets !== undefined && { hasPets: filters.hasPets.toString() }),
  });

  const response = await fetch(`/api/v1/users/search?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to search users');
  }

  const data = await response.json();
  return data.data || [];
};

// Query Keys
export const userQueryKeys = {
  all: ['users'] as const,
  profiles: () => [...userQueryKeys.all, 'profiles'] as const,
  profile: (userId: string) => [...userQueryKeys.profiles(), userId] as const,
  current: () => [...userQueryKeys.profiles(), 'current'] as const,
  stats: () => [...userQueryKeys.all, 'stats'] as const,
  preferences: () => [...userQueryKeys.all, 'preferences'] as const,
  search: (query: string) => [...userQueryKeys.all, 'search', query] as const,
};

// Hooks
export function useCurrentUserProfile(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: userQueryKeys.current(),
    queryFn: fetchCurrentUserProfile,
    staleTime: options?.staleTime || 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled !== false,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUserProfile(userId: string, options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: userQueryKeys.profile(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId && (options?.enabled !== false),
    staleTime: options?.staleTime || 10 * 60 * 1000, // 10 minutes
  });
}

export function useUserStats(options?: {
  enabled?: boolean;
  refetchInterval?: number | false;
}) {
  return useQuery({
    queryKey: userQueryKeys.stats(),
    queryFn: fetchUserStats,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: options?.refetchInterval || false,
    enabled: options?.enabled !== false,
  });
}

export function useUserPreferences(options?: {
  enabled?: boolean;
  staleTime?: number;
}) {
  return useQuery({
    queryKey: userQueryKeys.preferences(),
    queryFn: fetchUserPreferences,
    staleTime: options?.staleTime || 30 * 60 * 1000, // 30 minutes
    enabled: options?.enabled !== false,
  });
}

export function useSearchUsers(query: string, filters?: {
  location?: string;
  verified?: boolean;
  hasPets?: boolean;
}, options?: {
  enabled?: boolean;
  debounceMs?: number;
}) {
  return useQuery({
    queryKey: userQueryKeys.search(query),
    queryFn: () => searchUsers(query, filters),
    enabled: !!query && query.length >= 2 && (options?.enabled !== false),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry search queries
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onMutate: async (updates) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.current() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData(userQueryKeys.current());

      // Optimistically update to the new value
      queryClient.setQueryData(userQueryKeys.current(), (old: any) => ({ ...old, ...updates }));

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousProfile) {
        queryClient.setQueryData(userQueryKeys.current(), context.previousProfile);
      }
      toast.error(error.message || 'Failed to update profile');
    },
    onSuccess: (updatedProfile) => {
      toast.success('Profile updated successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userQueryKeys.current() });
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (result) => {
      // Update the current user profile with new avatar
      queryClient.setQueryData(userQueryKeys.current(), (old: any) => ({
        ...old,
        avatar: result.url,
      }));

      toast.success('Avatar uploaded successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserPreferences,
    onMutate: async (newPreferences) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: userQueryKeys.preferences() });

      // Snapshot the previous value
      const previousPreferences = queryClient.getQueryData(userQueryKeys.preferences());

      // Optimistically update to the new value
      queryClient.setQueryData(userQueryKeys.preferences(), (old: any) => ({ ...old, ...newPreferences }));

      // Return a context object with the snapshotted value
      return { previousPreferences };
    },
    onError: (error: any, variables, context) => {
      // If the mutation fails, roll back to the previous value
      if (context?.previousPreferences) {
        queryClient.setQueryData(userQueryKeys.preferences(), context.previousPreferences);
      }
      toast.error(error.message || 'Failed to update preferences');
    },
    onSuccess: () => {
      toast.success('Preferences updated successfully!');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: userQueryKeys.preferences() });
    },
  });
}

// Hook for prefetching user profiles
export function usePrefetchUserProfile() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.profile(userId),
      queryFn: () => fetchUserProfile(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
  };
}

// Hook for optimistic updates
export function useOptimisticProfileUpdate() {
  const queryClient = useQueryClient();

  return (updates: Partial<UserProfile>) => {
    // Cancel any outgoing refetches
    queryClient.cancelQueries({ queryKey: userQueryKeys.current() });

    // Snapshot the previous value
    const previousProfile = queryClient.getQueryData(userQueryKeys.current());

    // Optimistically update
    queryClient.setQueryData(userQueryKeys.current(), (old: any) => ({ ...old, ...updates }));

    // Return rollback function
    return () => {
      queryClient.setQueryData(userQueryKeys.current(), previousProfile);
    };
  };
}

// Hook for real-time profile updates
export function useRealtimeProfile(userId?: string) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    // This would integrate with your WebSocket service
    // For now, it's a placeholder for the real-time functionality

    const handleProfileUpdate = (updatedProfile: UserProfile) => {
      // Update profile cache
      if (userId === updatedProfile.id) {
        queryClient.setQueryData(userQueryKeys.current(), updatedProfile);
      }
      queryClient.setQueryData(userQueryKeys.profile(updatedProfile.id), updatedProfile);
    };

    const handleAvatarUpdate = (userId: string, avatarUrl: string) => {
      queryClient.setQueryData(userQueryKeys.profile(userId), (old: any) => ({
        ...old,
        avatar: avatarUrl,
      }));
    };

    // Subscribe to WebSocket events
    // socket.on('profileUpdate', handleProfileUpdate);
    // socket.on('avatarUpdate', handleAvatarUpdate);

    return () => {
      // Unsubscribe from WebSocket events
      // socket.off('profileUpdate', handleProfileUpdate);
      // socket.off('avatarUpdate', handleAvatarUpdate);
    };
  }, [queryClient, userId]);
}

// Hook for caching user data across the app
export function useUserCache() {
  const queryClient = useQueryClient();

  const invalidateUser = React.useCallback((userId: string) => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.profile(userId) });
  }, [queryClient]);

  const invalidateCurrentUser = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.current() });
  }, [queryClient]);

  const invalidateAllUsers = React.useCallback(() => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.profiles() });
  }, [queryClient]);

  const clearUserCache = React.useCallback(() => {
    queryClient.removeQueries({ queryKey: userQueryKeys.profiles() });
  }, [queryClient]);

  return {
    invalidateUser,
    invalidateCurrentUser,
    invalidateAllUsers,
    clearUserCache,
  };
}

// Hook for batch operations
export function useBatchUserOperations() {
  const queryClient = useQueryClient();

  const updateMultipleUsers = React.useCallback(async (updates: Array<{ userId: string; updates: Partial<UserProfile> }>) => {
    // This would call a batch API endpoint
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    const response = await fetch('/api/v1/users/batch-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      throw new Error('Failed to batch update users');
    }

    // Update cache for each user
    updates.forEach(({ userId, updates: userUpdates }) => {
      queryClient.setQueryData(userQueryKeys.profile(userId), (old: any) => ({ ...old, ...userUpdates }));
    });

    return response.json();
  }, [queryClient]);

  return { updateMultipleUsers };
}
