// src/hooks/queries/useExternalApiEndpoints.ts

/**
 * React Query Hooks for External API Endpoints
 *
 * Provides cached data fetching for external API endpoint configuration.
 * Used for dynamic platform ID resolution and data source endpoint lookup.
 *
 * Uses existing platform service functions from:
 * @/services/platform/platform.service
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import {
    getActiveExternalApiEndpoints,
    getExternalApiEndpointByCode,
} from '@/services/platform/platforms.service';
import { ExternalApiEndpoint, ENDPOINT_CODES } from '@/types/platform';

// =============================================================================
// TYPES
// =============================================================================

interface UseExternalApiEndpointsOptions {
    enabled?: boolean;
}

// =============================================================================
// QUERY HOOKS
// =============================================================================

/**
 * useActiveExternalApiEndpoints Hook
 *
 * Fetches all active external API endpoints.
 * Uses aggressive caching since endpoints rarely change.
 *
 * @example
 * ```tsx
 * const { data: endpoints, isLoading } = useActiveExternalApiEndpoints();
 * ```
 */
export function useActiveExternalApiEndpoints(
    options: UseExternalApiEndpointsOptions = {}
) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: queryKeys.externalApiEndpoints.active(),
        queryFn: async () => {
            console.log('🔄 useActiveExternalApiEndpoints: Fetching active endpoints');
            const endpoints = await getActiveExternalApiEndpoints();
            console.log(`✅ useActiveExternalApiEndpoints: Fetched ${endpoints.length} active endpoints`);
            return endpoints;
        },
        enabled,
        staleTime: STALE_TIMES.STATIC,
        gcTime: GC_TIMES.LONG,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
}

/**
 * useExternalApiEndpointByCode Hook
 *
 * Fetches an external API endpoint by its unique code.
 * Useful for looking up specific endpoints like 'INSIGHTIQ_CONTENT_FETCH'.
 *
 * @example
 * ```tsx
 * const { data: endpoint } = useExternalApiEndpointByCode('INSIGHTIQ_CONTENT_FETCH');
 * ```
 */
export function useExternalApiEndpointByCode(
    code: string,
    options: UseExternalApiEndpointsOptions = {}
) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: queryKeys.externalApiEndpoints.byCode(code),
        queryFn: async () => {
            console.log(`🔄 useExternalApiEndpointByCode: Fetching endpoint by code ${code}`);
            const endpoint = await getExternalApiEndpointByCode(code);
            if (endpoint) {
                console.log(`✅ useExternalApiEndpointByCode: Fetched endpoint ${endpoint.endpoint_name}`);
            }
            return endpoint;
        },
        enabled: enabled && !!code,
        staleTime: STALE_TIMES.STATIC,
        gcTime: GC_TIMES.LONG,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
    });
}

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

/**
 * useDataSourceEndpointId Hook
 *
 * Convenience hook to get the endpoint ID for a data source type.
 * Maps simple codes like 'INSIGHTIQ' or 'MANUAL' to their endpoint IDs.
 *
 * @example
 * ```tsx
 * const { endpointId, isLoading } = useDataSourceEndpointId('INSIGHTIQ');
 * ```
 */
export function useDataSourceEndpointId(
    dataSourceCode: 'INSIGHTIQ' | 'MANUAL',
    options: UseExternalApiEndpointsOptions = {}
) {
    const endpointCode = dataSourceCode === 'INSIGHTIQ'
        ? ENDPOINT_CODES.INSIGHTIQ_CONTENT_FETCH
        : ENDPOINT_CODES.INTERNAL_MANUAL_ENTRY;

    const { data: endpoints = [], isLoading, error } = useActiveExternalApiEndpoints(options);

    const endpoint = endpoints.find(
        (e: ExternalApiEndpoint) => e.endpoint_code === endpointCode
    );

    return {
        endpointId: endpoint?.id ?? null,
        endpoint,
        isLoading,
        error,
    };
}

/**
 * useInsightIQEndpoint Hook
 *
 * Convenience hook specifically for InsightIQ content fetch endpoint.
 *
 * @example
 * ```tsx
 * const { endpointId, isLoading } = useInsightIQEndpoint();
 * ```
 */
export function useInsightIQEndpoint(options: UseExternalApiEndpointsOptions = {}) {
    return useDataSourceEndpointId('INSIGHTIQ', options);
}

/**
 * useManualEntryEndpoint Hook
 *
 * Convenience hook specifically for manual entry endpoint.
 *
 * @example
 * ```tsx
 * const { endpointId, isLoading } = useManualEntryEndpoint();
 * ```
 */
export function useManualEntryEndpoint(options: UseExternalApiEndpointsOptions = {}) {
    return useDataSourceEndpointId('MANUAL', options);
}
