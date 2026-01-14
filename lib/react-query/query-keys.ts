// src/lib/react-query/query-keys.ts
// Centralized Query Key Factory
// This pattern is recommended by TanStack and used by companies like Vercel, Airbnb

/**
 * Query Key Factory Pattern
 * 
 * Benefits:
 * 1. Type-safe query keys
 * 2. Easy to invalidate related queries
 * 3. Consistent key structure across the app
 * 4. Autocomplete support in IDE
 * 
 * Usage:
 * - queryKeys.statuses.all - All statuses queries
 * - queryKeys.statuses.byModel('campaign_influencer') - Specific model statuses
 * - queryKeys.influencers.byCampaign('campaign-123') - Campaign influencers
 */

export const queryKeys = {
  // ============================================
  // STATUSES
  // ============================================
  statuses: {
    all: ['statuses'] as const,
    byModel: (model: string) => ['statuses', 'model', model] as const,
    byModelAndColumn: (model: string, column: string) => 
      ['statuses', 'model', model, 'column', column] as const,
    clientReview: () => ['statuses', 'model', 'campaign_influencer', 'client_review'] as const,
    listMember: () => ['statuses', 'model', 'list_member'] as const,
  },

  // ============================================
  // INFLUENCERS
  // ============================================
  influencers: {
    all: ['influencers'] as const,
    lists: () => [...queryKeys.influencers.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.influencers.lists(), filters] as const,
    byCampaign: (campaignId: string) => 
      [...queryKeys.influencers.all, 'campaign', campaignId] as const,
    byCampaignList: (campaignListId: string) => 
      [...queryKeys.influencers.all, 'campaign-list', campaignListId] as const,
    detail: (influencerId: string) => 
      [...queryKeys.influencers.all, 'detail', influencerId] as const,
    onboarded: (campaignId: string) => 
      [...queryKeys.influencers.byCampaign(campaignId), 'onboarded'] as const,
    readyToOnboard: (campaignId: string) => 
      [...queryKeys.influencers.byCampaign(campaignId), 'ready-to-onboard'] as const,
  },

  // ============================================
  // CAMPAIGNS
  // ============================================
  campaigns: {
    all: ['campaigns'] as const,
    lists: () => [...queryKeys.campaigns.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => 
      [...queryKeys.campaigns.lists(), filters] as const,
    detail: (campaignId: string) => 
      [...queryKeys.campaigns.all, 'detail', campaignId] as const,
    byClient: (clientId: string) => 
      [...queryKeys.campaigns.all, 'client', clientId] as const,
    current: () => [...queryKeys.campaigns.all, 'current'] as const,
  },

  // ============================================
  // CAMPAIGN LISTS
  // ============================================
  campaignLists: {
    all: ['campaign-lists'] as const,
    byCampaign: (campaignId: string) => 
      [...queryKeys.campaignLists.all, 'campaign', campaignId] as const,
    detail: (listId: string) => 
      [...queryKeys.campaignLists.all, 'detail', listId] as const,
    members: (listId: string) => 
      [...queryKeys.campaignLists.detail(listId), 'members'] as const,
  },

  // ============================================
  // CLIENTS
  // ============================================
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    detail: (clientId: string) => 
      [...queryKeys.clients.all, 'detail', clientId] as const,
  },

  // ============================================
  // USER & AUTH
  // ============================================
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    permissions: () => [...queryKeys.user.all, 'permissions'] as const,
  },

  // ============================================
  // NOTIFICATIONS
  // ============================================
  notifications: {
    all: ['notifications'] as const,
    unread: () => [...queryKeys.notifications.all, 'unread'] as const,
    list: (filters?: Record<string, unknown>) => 
      [...queryKeys.notifications.all, 'list', filters] as const,
  },

  // ============================================
  // AI / CHAT
  // ============================================
  ai: {
    all: ['ai'] as const,
    conversations: {
      all: () => [...queryKeys.ai.all, 'conversations'] as const,
      byCampaign: (campaignId: string) => 
        [...queryKeys.ai.conversations.all(), 'campaign', campaignId] as const,
      detail: (conversationId: string) => 
        [...queryKeys.ai.conversations.all(), 'detail', conversationId] as const,
      messages: (conversationId: string) => 
        [...queryKeys.ai.conversations.detail(conversationId), 'messages'] as const,
    },
  },

  // ============================================
  // ANALYTICS
  // ============================================
  analytics: {
    all: ['analytics'] as const,
    dashboard: () => [...queryKeys.analytics.all, 'dashboard'] as const,
    campaign: (campaignId: string) => 
      [...queryKeys.analytics.all, 'campaign', campaignId] as const,
  },
  // ============================================
  // EXTERNAL API ENDPOINTS
  // ============================================
    externalApiEndpoints: {
      all: ['external-api-endpoints'] as const,
      active: () => ['external-api-endpoints', 'active'] as const,
      byCode: (code: string) => ['external-api-endpoints', 'code', code] as const,
    },

  // ============================================
  // PLATFORMS
  // ============================================
    platforms: {
      all: ['platforms'] as const,
      active: () => ['platforms', 'active'] as const,
    },
} as const;

/**
 * Type helper for extracting query key types
 * Useful for type-safe invalidation
 */
export type QueryKeys = typeof queryKeys;

/**
 * Helper function to create scoped query keys for features
 * Use this when adding new feature-specific keys
 */
export function createQueryKeys<T extends string>(scope: T) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: (filters: Record<string, unknown>) => [scope, 'list', filters] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: string) => [scope, 'detail', id] as const,
  };
}