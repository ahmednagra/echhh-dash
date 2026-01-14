// src/hooks/queries/useCampaignInfluencers.ts
// React Query hooks for campaign influencer data fetching
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, STALE_TIMES, GC_TIMES } from '@/lib/react-query';
import { 
  getAllCampaignInfluencers, 
  removeOnboardedInfluencers, 
  markInfluencersOnboarded 
} from '@/services/campaign-influencers/campaign-influencers.client';
import { CampaignListMember } from '@/types/campaign-influencers';
import { Campaign } from '@/types/campaign';
import { useMemo } from 'react';

/**
 * Hook Configuration Types
 */
interface UseCampaignInfluencersOptions {
  enabled?: boolean;
}

/**
 * useCampaignInfluencers Hook
 * 
 * Fetches all influencers for a campaign's lists.
 * Provides derived data for onboarded and ready-to-onboard influencers.
 * 
 * @param campaign - The campaign object containing campaign_lists
 * @param options - Query options
 * 
 * @example
 * ```tsx
 * const { 
 *   influencers,
 *   onboardedInfluencers,
 *   readyToOnboardInfluencers,
 *   isLoading,
 *   refetch 
 * } = useCampaignInfluencers(currentCampaign);
 * ```
 */
export function useCampaignInfluencers(
  campaign: Campaign | null | undefined,
  options: UseCampaignInfluencersOptions = {}
) {
  const { enabled = true } = options;
  
  // Extract campaign list ID for the query
  const campaignListId = campaign?.campaign_lists?.[0]?.id;

  // Main query to fetch influencers
  const query = useQuery({
    queryKey: queryKeys.influencers.byCampaignList(campaignListId || ''),
    queryFn: async () => {
      if (!campaignListId) {
        throw new Error('No campaign list ID available');
      }
      
      console.log('🔄 useCampaignInfluencers: Fetching influencers for list:', campaignListId);
      
      // getAllCampaignInfluencers returns CampaignInfluencersResponse
      const response = await getAllCampaignInfluencers(campaignListId);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch influencers');
      }
      
      console.log(`✅ useCampaignInfluencers: Fetched ${response.influencers.length} influencers`);
      
      return response.influencers;
    },
    enabled: enabled && !!campaignListId,
    staleTime: STALE_TIMES.SEMI_DYNAMIC,
    gcTime: GC_TIMES.MEDIUM,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  // Derived data - computed from fetched influencers
  const onboardedInfluencers = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter(
      (influencer: CampaignListMember) => 
        influencer.onboarded_at !== null && influencer.onboarded_at !== undefined
    );
  }, [query.data]);

  const readyToOnboardInfluencers = useMemo(() => {
    if (!query.data) return [];
    return query.data.filter(
      (influencer: CampaignListMember) =>
        influencer.status?.name?.toLowerCase() === 'completed' &&
        (influencer.onboarded_at === null || influencer.onboarded_at === undefined)
    );
  }, [query.data]);

  return {
    // Query state
    influencers: query.data || [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    
    // Derived data
    onboardedInfluencers,
    readyToOnboardInfluencers,
    
    // Actions
    refetch: query.refetch,
    
    // Query metadata
    dataUpdatedAt: query.dataUpdatedAt,
    isStale: query.isStale,
  };
}

/**
 * useOnboardInfluencers Mutation Hook
 * 
 * Marks influencers as onboarded and updates the cache.
 * 
 * @example
 * ```tsx
 * const { mutateAsync: onboardInfluencers, isPending } = useOnboardInfluencers(campaignListId);
 * 
 * const handleOnboard = async () => {
 *   await onboardInfluencers(['influencer-1', 'influencer-2']);
 * };
 * ```
 */
export function useOnboardInfluencers(campaignListId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (influencerIds: string[]) => {
      if (!campaignListId) {
        throw new Error('No campaign list ID available');
      }
      
      console.log('🔄 useOnboardInfluencers: Onboarding influencers:', influencerIds);
      const response = await markInfluencersOnboarded(campaignListId, influencerIds);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to onboard influencers');
      }
      
      console.log('✅ useOnboardInfluencers: Successfully onboarded influencers');
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch the influencers query
      if (campaignListId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.influencers.byCampaignList(campaignListId),
        });
      }
    },
    onError: (error) => {
      console.error('❌ useOnboardInfluencers: Error onboarding influencers:', error);
    },
  });
}

/**
 * useRemoveFromOnboarded Mutation Hook
 * 
 * Removes influencer from onboarded status and updates the cache.
 * 
 * @example
 * ```tsx
 * const { mutateAsync: removeFromOnboarded, isPending } = useRemoveFromOnboarded(campaignListId);
 * 
 * const handleRemove = async () => {
 *   await removeFromOnboarded('influencer-1');
 * };
 * ```
 */
export function useRemoveFromOnboarded(campaignListId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (influencerId: string) => {
      if (!campaignListId) {
        throw new Error('No campaign list ID available');
      }
      
      console.log('🔄 useRemoveFromOnboarded: Removing influencer:', influencerId);
      const response = await removeOnboardedInfluencers(campaignListId, [influencerId]);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to remove influencer');
      }
      
      console.log('✅ useRemoveFromOnboarded: Successfully removed influencer');
      return response;
    },
    onSuccess: () => {
      // Invalidate and refetch the influencers query
      if (campaignListId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.influencers.byCampaignList(campaignListId),
        });
      }
    },
    onError: (error) => {
      console.error('❌ useRemoveFromOnboarded: Error removing influencer:', error);
    },
  });
}

/**
 * Helper hook to invalidate campaign influencers cache
 * Useful when you need to manually refresh the data
 */
export function useInvalidateCampaignInfluencers() {
  const queryClient = useQueryClient();

  return {
    invalidate: (campaignListId: string) => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.influencers.byCampaignList(campaignListId),
      });
    },
    invalidateAll: () => {
      return queryClient.invalidateQueries({
        queryKey: queryKeys.influencers.all,
      });
    },
  };
}