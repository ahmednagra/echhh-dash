// src/hooks/queries/usePlatformConfig.ts

/**
 * React Query Hook for Platform Configuration
 *
 * Combines platforms and external API endpoints data for dynamic ID resolution.
 * Uses React Query's built-in caching alongside existing platform service.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import {
  getActivePlatforms,
  getActiveExternalApiEndpoints,
  Platform,
} from '@/services/platform/platforms.service';
import { ExternalApiEndpoint, ENDPOINT_CODES } from '@/types/platform';
import type { ContentPlatform } from '@/constants/social-platforms';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformConfig {
  platforms: Platform[];
  endpoints: ExternalApiEndpoint[];
}

interface UsePlatformConfigOptions {
  enabled?: boolean;
}

interface UsePlatformConfigReturn {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  platforms: Platform[];
  endpoints: ExternalApiEndpoint[];
  getPlatformId: (platform: ContentPlatform) => string | null;
  getWorkPlatformId: (platform: ContentPlatform) => string | null;
  getDataSourceEndpointId: (code: 'INSIGHTIQ' | 'MANUAL') => string | null;
  getEndpointByCode: (code: string) => ExternalApiEndpoint | null;
  refetch: () => void;
}

// =============================================================================
// MAIN HOOK
// =============================================================================

/**
 * usePlatformConfig Hook
 *
 * Fetches and caches platform configuration including:
 * - Active platforms
 * - Active external API endpoints
 *
 * Provides helper functions for dynamic ID resolution.
 *
 * @example
 * ```tsx
 * const {
 *   isInitialized,
 *   isLoading,
 *   getPlatformId,
 *   getDataSourceEndpointId,
 * } = usePlatformConfig();
 *
 * // Get platform ID
 * const instagramId = getPlatformId('instagram');
 *
 * // Get data source endpoint ID
 * const insightiqEndpointId = getDataSourceEndpointId('INSIGHTIQ');
 * ```
 */
export function usePlatformConfig(
  options: UsePlatformConfigOptions = {}
): UsePlatformConfigReturn {
  const { enabled = true } = options;

  // Fetch platforms
  const platformsQuery = useQuery({
    queryKey: queryKeys.platforms.active(),
    queryFn: async () => {
      console.log('🔄 usePlatformConfig: Fetching active platforms');
      const platforms = await getActivePlatforms();
      console.log(`✅ usePlatformConfig: Fetched ${platforms.length} platforms`);
      return platforms;
    },
    enabled,
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Fetch endpoints
  const endpointsQuery = useQuery({
    queryKey: queryKeys.externalApiEndpoints.active(),
    queryFn: async () => {
      console.log('🔄 usePlatformConfig: Fetching active endpoints');
      const endpoints = await getActiveExternalApiEndpoints();
      console.log(`✅ usePlatformConfig: Fetched ${endpoints.length} endpoints`);
      return endpoints;
    },
    enabled,
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Derived state
  const platforms = platformsQuery.data ?? [];
  const endpoints = endpointsQuery.data ?? [];
  const isLoading = platformsQuery.isLoading || endpointsQuery.isLoading;
  const isInitialized = !isLoading && platforms.length > 0;
  const error = platformsQuery.error ?? endpointsQuery.error ?? null;

  // Platform lookup map (memoized)
  const platformMap = useMemo(() => {
    const map = new Map<string, Platform>();
    platforms.forEach((platform) => {
      map.set(platform.name.toLowerCase(), platform);
    });
    return map;
  }, [platforms]);

  // Endpoint lookup map by code (memoized)
  const endpointCodeMap = useMemo(() => {
    const map = new Map<string, ExternalApiEndpoint>();
    endpoints.forEach((endpoint) => {
      map.set(endpoint.endpoint_code, endpoint);
    });
    return map;
  }, [endpoints]);

  // Helper: Get platform ID by platform name
  const getPlatformId = useCallback(
    (platform: ContentPlatform): string | null => {
      const found = platformMap.get(platform.toLowerCase());
      return found?.id ?? null;
    },
    [platformMap]
  );

  // Helper: Get work platform ID by platform name
  const getWorkPlatformId = useCallback(
    (platform: ContentPlatform): string | null => {
      const found = platformMap.get(platform.toLowerCase());
      return found?.work_platform_id ?? null;
    },
    [platformMap]
  );

  // Helper: Get data source endpoint ID
  const getDataSourceEndpointId = useCallback(
    (code: 'INSIGHTIQ' | 'MANUAL'): string | null => {
      const endpointCode = code === 'INSIGHTIQ'
        ? ENDPOINT_CODES.INSIGHTIQ_CONTENT_FETCH
        : ENDPOINT_CODES.INTERNAL_MANUAL_ENTRY;
      const found = endpointCodeMap.get(endpointCode);
      return found?.id ?? null;
    },
    [endpointCodeMap]
  );

  // Helper: Get endpoint by code
  const getEndpointByCode = useCallback(
    (code: string): ExternalApiEndpoint | null => {
      return endpointCodeMap.get(code) ?? null;
    },
    [endpointCodeMap]
  );

  // Refetch both queries
  const refetch = useCallback(() => {
    platformsQuery.refetch();
    endpointsQuery.refetch();
  }, [platformsQuery, endpointsQuery]);

  return {
    isInitialized,
    isLoading,
    error,
    platforms,
    endpoints,
    getPlatformId,
    getWorkPlatformId,
    getDataSourceEndpointId,
    getEndpointByCode,
    refetch,
  };
}

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * usePlatformId Hook
 *
 * Convenience hook to get a specific platform ID.
 *
 * @example
 * ```tsx
 * const { platformId, isLoading } = usePlatformId('instagram');
 * ```
 */
export function usePlatformId(platform: ContentPlatform) {
  const { getPlatformId, isLoading, isInitialized } = usePlatformConfig();

  return {
    platformId: isInitialized ? getPlatformId(platform) : null,
    isLoading,
    isInitialized,
  };
}

/**
 * useWorkPlatformId Hook
 *
 * Convenience hook to get a specific work platform ID.
 *
 * @example
 * ```tsx
 * const { workPlatformId, isLoading } = useWorkPlatformId('instagram');
 * ```
 */
export function useWorkPlatformId(platform: ContentPlatform) {
  const { getWorkPlatformId, isLoading, isInitialized } = usePlatformConfig();

  return {
    workPlatformId: isInitialized ? getWorkPlatformId(platform) : null,
    isLoading,
    isInitialized,
  };
}

/**
 * useDataSourceEndpoint Hook
 *
 * Convenience hook to get a data source endpoint ID.
 *
 * @example
 * ```tsx
 * const { endpointId, isLoading } = useDataSourceEndpoint('INSIGHTIQ');
 * ```
 */
export function useDataSourceEndpoint(code: 'INSIGHTIQ' | 'MANUAL') {
  const { getDataSourceEndpointId, isLoading, isInitialized } = usePlatformConfig();

  return {
    endpointId: isInitialized ? getDataSourceEndpointId(code) : null,
    isLoading,
    isInitialized,
  };
}

// =============================================================================
// ASYNC HELPERS (For use outside React components)
// =============================================================================

/**
 * fetchPlatformConfig
 *
 * Async function to fetch platform config outside React components.
 * Useful for form submissions or other async operations.
 */
export async function fetchPlatformConfig(): Promise<PlatformConfig> {
  const [platforms, endpoints] = await Promise.all([
    getActivePlatforms(),
    getActiveExternalApiEndpoints(),
  ]);

  return { platforms, endpoints };
}

/**
 * getDynamicPlatformIdAsync
 *
 * Get platform ID asynchronously (for use outside hooks).
 */
export async function getDynamicPlatformIdAsync(
  platform: ContentPlatform
): Promise<string> {
  const { platforms } = await fetchPlatformConfig();

  const found = platforms.find(
    (p) => p.name.toLowerCase() === platform.toLowerCase()
  );

  if (!found) {
    throw new Error(`Platform not found: ${platform}`);
  }

  return found.id;
}

/**
 * getDynamicDataSourceEndpointIdAsync
 *
 * Get data source endpoint ID asynchronously (for use outside hooks).
 */
export async function getDynamicDataSourceEndpointIdAsync(
  code: 'INSIGHTIQ' | 'MANUAL'
): Promise<string> {
  const { endpoints } = await fetchPlatformConfig();

  const endpointCode = code === 'INSIGHTIQ'
    ? ENDPOINT_CODES.INSIGHTIQ_CONTENT_FETCH
    : ENDPOINT_CODES.INTERNAL_MANUAL_ENTRY;
  const found = endpoints.find((e) => e.endpoint_code === endpointCode);

  if (!found) {
    throw new Error(`Data source endpoint not found: ${code} (${endpointCode})`);
  }

  return found.id;
}