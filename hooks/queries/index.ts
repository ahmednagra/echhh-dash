// src/hooks/queries/index.ts
// Central exports for all React Query hooks
// Import from '@/hooks/queries' to access all query hooks

// ============================================
// STATUSES QUERIES
// ============================================
export {
  useStatuses,
  useClientReviewStatuses,
  useListMemberStatuses,
  useCampaignInfluencerStatuses,
  useShortlistedStatuses,
} from './useStatuses';

// ============================================
// CAMPAIGN INFLUENCERS QUERIES
// ============================================
export {
  useCampaignInfluencers,
  useOnboardInfluencers,
  useRemoveFromOnboarded,
  useInvalidateCampaignInfluencers,
} from './useCampaignInfluencers';

// ============================================
// Future exports (add as you implement)
// ============================================
// export { useCampaigns, useCampaign, useCurrentCampaign } from './useCampaigns';
// export { useClients, useClient } from './useClients';
// export { useNotifications, useUnreadNotifications } from './useNotifications';
// export { useUserProfile, useUserPreferences } from './useUser';
// export { useAIConversations, useAIMessages } from './useAI';