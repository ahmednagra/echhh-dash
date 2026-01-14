// src/hooks/queries/useStatuses.ts
// React Query hooks for status-related data fetching
'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { getStatuses } from '@/services/statuses/statuses.client';
import { Status } from '@/types/statuses';

/**
 * Hook Configuration Types
 */
interface UseStatusesOptions {
  enabled?: boolean;
}

/**
 * useStatuses Hook
 * 
 * Fetches statuses for a specific model with optional column filtering.
 * Uses aggressive caching since statuses rarely change.
 * 
 * @param model - The model name (e.g., 'campaign_influencer', 'list_member')
 * @param column - Optional column filter (e.g., 'status_id', 'client_review_status_id')
 * @param options - Query options
 * 
 * @example
 * ```tsx
 * // Get all statuses for a model
 * const { data, isLoading } = useStatuses('campaign_influencer');
 * 
 * // Get statuses filtered by column
 * const { data } = useStatuses('campaign_influencer', 'client_review_status_id');
 * ```
 */
export function useStatuses(
  model: string,
  column?: string,
  options: UseStatusesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: column 
      ? queryKeys.statuses.byModelAndColumn(model, column)
      : queryKeys.statuses.byModel(model),
    queryFn: async () => {
      console.log(`🔄 useStatuses: Fetching ${model} statuses${column ? ` (column: ${column})` : ''}`);
      const statuses = await getStatuses(model, column);
      console.log(`✅ useStatuses: Fetched ${statuses.length} statuses for ${model}`);
      return statuses;
    },
    enabled,
    // Statuses are static data - cache aggressively
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    // Don't refetch on window focus for static data
    refetchOnWindowFocus: false,
    refetchOnMount: false,      // Use cached data if available
    refetchOnReconnect: false,  // Don't refetch on network reconnect
  });
}

/**
 * useClientReviewStatuses Hook
 * 
 * Specialized hook for fetching client review statuses.
 * Filters statuses where applies_to_field === 'client_review_status_id'.
 * 
 * IMPORTANT: This hook uses the SAME query key as useStatuses('campaign_influencer')
 * to ensure proper cache sharing. The filtering happens via the `select` option,
 * which transforms data AFTER it's fetched (or retrieved from cache).
 * 
 * This means:
 * - If useStatuses('campaign_influencer') was called first, this hook uses that cached data
 * - If this hook is called first, useStatuses('campaign_influencer') uses this cached data
 * - Only ONE API call is made, regardless of which hook is called first
 * 
 * @param options - Query options
 * 
 * @example
 * ```tsx
 * const { 
 *   data: clientReviewStatuses, 
 *   isLoading: statusesLoading 
 * } = useClientReviewStatuses();
 * ```
 */
export function useClientReviewStatuses(
  options: UseStatusesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    // CRITICAL: Use the SAME query key as useStatuses('campaign_influencer')
    // This ensures both hooks share the same cache entry
    queryKey: queryKeys.statuses.byModel('campaign_influencer'),
    queryFn: async () => {
      console.log('🔄 useStatuses: Fetching campaign_influencer statuses (shared query)');
      const statuses = await getStatuses('campaign_influencer');
      console.log(`✅ useStatuses: Fetched ${statuses.length} statuses`);
      return statuses;
    },
    // Use `select` to filter data AFTER fetching (or from cache)
    // This doesn't affect the cache - it only transforms data for this hook's consumers
    select: (allStatuses: Status[]) => {
      return allStatuses.filter(
        (status: Status) => status.applies_to_field === 'client_review_status_id'
      );
    },
    enabled,
    // Statuses are static data - cache aggressively
    staleTime: STALE_TIMES.STATIC,        // 30 minutes
    gcTime: GC_TIMES.LONG,                // 1 hour
    // CRITICAL: These settings prevent duplicate fetches
    refetchOnWindowFocus: false,          // Don't refetch on tab focus
    refetchOnMount: false,                // Don't refetch if cached data exists
    refetchOnReconnect: false,            // Don't refetch on network reconnect
  });
}

/**
 * useListMemberStatuses Hook
 * 
 * Fetches statuses for list member model.
 * Used in agent dashboards and list management.
 * 
 * @param options - Query options
 */
export function useListMemberStatuses(
  options: UseStatusesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.statuses.listMember(),
    queryFn: async () => {
      const statuses = await getStatuses('list_member');
      return statuses;
    },
    enabled,
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * useCampaignInfluencerStatuses Hook
 * 
 * Fetches all statuses for campaign influencer model.
 * Returns all status types without filtering.
 * 
 * @param options - Query options
 */
export function useCampaignInfluencerStatuses(
  options: UseStatusesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.statuses.byModel('campaign_influencer'),
    queryFn: async () => {
      const statuses = await getStatuses('campaign_influencer');
      return statuses;
    },
    enabled,
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

/**
 * useShortlistedStatuses Hook
 * 
 * Fetches shortlisted statuses for campaign influencer model.
 * 
 * @param options - Query options
 */
export function useShortlistedStatuses(
  options: UseStatusesOptions = {}
) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.statuses.byModelAndColumn('campaign_influencer', 'shortlisted_status_id'),
    queryFn: async () => {
      const statuses = await getStatuses('campaign_influencer', 'shortlisted_status_id');
      return statuses;
    },
    enabled,
    staleTime: STALE_TIMES.STATIC,
    gcTime: GC_TIMES.LONG,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}