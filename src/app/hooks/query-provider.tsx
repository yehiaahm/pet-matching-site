/**
 * TanStack Query Provider Setup
 * Configures React Query for the PetMate application
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactQueryStreamedHydration } from '@tanstack/react-query-next-experimental';
import { logger } from './logger.util';

// Create a client
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Time in milliseconds that data remains fresh
        staleTime: 5 * 60 * 1000, // 5 minutes
        
        // Time in milliseconds that inactive queries will remain in cache
        gcTime: 10 * 60 * 1000, // 10 minutes
        
        // Number of times to retry failed requests
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for other errors
          return failureCount < 3;
        },
        
        // Delay between retries (exponential backoff)
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        
        // Whether to refetch on window focus
        refetchOnWindowFocus: false,
        
        // Whether to refetch on reconnect
        refetchOnReconnect: true,
        
        // Whether to refetch on interval
        refetchInterval: false,
        
        // Custom error handling
        throwOnError: false,
        
        // Logging
        onSuccess: (data, query) => {
          logger.debug('Query successful', { 
            queryKey: query.queryKey, 
            dataSize: Array.isArray(data) ? data.length : 1 
          });
        },
        
        onError: (error, query) => {
          logger.error('Query failed', { 
            queryKey: query.queryKey, 
            error: error.message 
          });
        },
      },
      
      mutations: {
        // Number of times to retry failed mutations
        retry: 1,
        
        // Whether mutations should be retried
        throwOnError: false,
        
        // Logging
        onSuccess: (data, variables, context, mutation) => {
          logger.info('Mutation successful', { 
            mutationKey: mutation.options.mutationKey,
            variables 
          });
        },
        
        onError: (error, variables, context, mutation) => {
          logger.error('Mutation failed', { 
            mutationKey: mutation.options.mutationKey,
            variables,
            error: error.message 
          });
        },
        
        onMutate: (variables, mutation) => {
          logger.debug('Mutation started', { 
            mutationKey: mutation.options.mutationKey,
            variables 
          });
        },
      },
    },
  });
}

interface QueryProviderProps {
  children: React.ReactNode;
  client?: QueryClient;
}

export function QueryProvider({ children, client }: QueryProviderProps) {
  const queryClient = client || createQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryStreamedHydration>
        {children}
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools 
        initialIsOpen={false}
        buttonPosition="bottom-left"
        position="bottom"
      />
    </QueryClientProvider>
  );
}

// Export the query client instance for use in components
export const useQueryClient = () => {
  const queryClient = React.useQueryClient();
  return queryClient;
};
