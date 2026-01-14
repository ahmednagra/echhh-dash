// src/lib/react-query/query-client.ts
// Centralized QueryClient configuration
// This ensures consistent caching behavior across the application

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

/**
 * Default query options for different data freshness requirements
 * 
 * STATIC: Data that rarely changes (statuses, categories, settings)
 * SEMI_DYNAMIC: Data that changes occasionally (campaign data, influencer lists)
 * DYNAMIC: Data that changes frequently (notifications, live stats)
 * REALTIME: Data that needs constant updates (chat messages, live feeds)
 */
export const STALE_TIMES = {
  STATIC: 30 * 60 * 1000,        // 30 minutes - statuses, categories
  SEMI_DYNAMIC: 5 * 60 * 1000,   // 5 minutes - campaign influencers
  DYNAMIC: 60 * 1000,            // 1 minute - frequently updated data
  REALTIME: 0,                   // Always stale - live data
  INFINITE: Infinity,            // Never stale - user preferences
} as const;

export const GC_TIMES = {
  SHORT: 5 * 60 * 1000,          // 5 minutes
  MEDIUM: 30 * 60 * 1000,        // 30 minutes
  LONG: 60 * 60 * 1000,          // 1 hour
  INFINITE: Infinity,            // Never garbage collected
} as const;

/**
 * Default options for all queries
 * These can be overridden per-query when needed
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Data freshness
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
    
    // Refetch behavior - conservative defaults
    refetchOnWindowFocus: false,  // Don't refetch when user returns to tab
    refetchOnMount: true,         // Refetch when component mounts (if stale)
    refetchOnReconnect: true,     // Refetch when network reconnects
    
    // Retry configuration
    retry: 1,                     // Retry failed requests once
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Network mode
    networkMode: 'online',
  },
  mutations: {
    // Mutation defaults
    retry: 1,
    networkMode: 'online',
  },
};

/**
 * Create and configure the QueryClient
 * This should only be called once in the application
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Singleton QueryClient instance for use in client components
 * Note: For server components, create a new instance per request
 */
let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  // Server: Always create a new QueryClient
  if (typeof window === 'undefined') {
    return createQueryClient();
  }
  
  // Browser: Reuse the same QueryClient
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  
  return browserQueryClient;
}