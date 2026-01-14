// src/services/api/endpoints.ts

/**
 * AI Service Base URL
 * This should be configured in your environment variables
 */
const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'development';

let AI_SERVICE_BASE_URL = '';

if (appEnv === 'production') {
  AI_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL_PRO!;
} else if (appEnv === 'development') {
  AI_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL_DEV!;
} else if (appEnv === 'local') { // Added support for 'local' environment
  AI_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL_LOC!;
} else {
  // Fallback for any other environment names to 'local'
  AI_SERVICE_BASE_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL_LOC!;
}
/**
 * AI Endpoints
 *
 * All AI-related endpoints following the new professional structure
 * Matches backend: /api/v1/ai/...
 */
export const AI_ENDPOINTS = {
  // ==========================================================================
  // MESSAGES
  // ==========================================================================
  MESSAGES: {
    /**
     * Send a message to AI
     * POST /api/v1/ai/messages
     */
    SEND: `${AI_SERVICE_BASE_URL}/ai/messages`,
  },

  // ==========================================================================
  // CONVERSATIONS
  // ==========================================================================
  CONVERSATIONS: {
    /**
     * List conversations (with optional campaign_id filter)
     * GET /api/v1/ai/conversations?campaign_id=...
     */
    LIST: `${AI_SERVICE_BASE_URL}/ai/conversations`,

    /**
     * Create a new conversation
     * POST /api/v1/ai/conversations
     */
    CREATE: `${AI_SERVICE_BASE_URL}/ai/conversations`,

    /**
     * Get single conversation
     * GET /api/v1/ai/conversations/:conversationId
     */
    GET: (conversationId: string) =>
      `${AI_SERVICE_BASE_URL}/ai/conversations/${conversationId}`,

    /**
     * Delete conversation
     * DELETE /api/v1/ai/conversations/:conversationId
     */
    DELETE: (conversationId: string) =>
      `${AI_SERVICE_BASE_URL}/ai/conversations/${conversationId}`,

    /**
     * Get conversation messages (cursor-based pagination)
     * GET /api/v1/ai/conversations/:conversationId/messages?limit=50&cursor=...&direction=before
     */
    MESSAGES: (conversationId: string) =>
      `${AI_SERVICE_BASE_URL}/ai/conversations/${conversationId}/messages`,
  },

  // ==========================================================================
  // HEALTH & STATUS
  // ==========================================================================
  HEALTH: {
    /**
     * AI Service health check
     * GET /api/v1/ai/health
     */
    CHECK: `${AI_SERVICE_BASE_URL}/ai/health`,

    /**
     * Get agents status
     * GET /api/v1/ai/agents/status
     */
    AGENTS_STATUS: `${AI_SERVICE_BASE_URL}/ai/agents/status`,
  },
};

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH_TOKEN: '/auth/refresh',
    LOGOUT: '/auth/logout',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me',
    PASSWORD: '/auth/me/password',
  },

  OAUTH: {
    PROVIDERS: '/auth/oauth/providers',
    LOGIN: (provider: string) => `/auth/oauth/${provider}/login`,
    LINK: (provider: string) => `/auth/oauth/${provider}/link`,
    CALLBACK: (provider: string) => `/auth/oauth/callback/${provider}`,
    ACCOUNTS: '/auth/oauth/accounts',
    UNLINK: (accountId: string) => `/auth/oauth/accounts/${accountId}`,
    REFRESH: (accountId: string) => `/auth/oauth/refresh/${accountId}`,
    HEALTH: '/auth/oauth/health',
  },

  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    UPDATE_STATUS: (id: string) => `/users/${id}/status`, // ✅ ADDED THIS
    VERIFY_EMAIL: (id: string) => `/users/${id}/verify-email`, // ✅ ADDED THIS
  },

  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    DETAIL: (id: string) => `/campaigns/${id}`,
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    RESTORE: (id: string) => `/campaigns/${id}/restore`,
    METRICS: (id: string) => `/campaigns/${id}/metrics`,
    // Company-specific campaign endpoints
    COMPANY: (companyId: string) => `/campaigns/company/${companyId}`,
    COMPANY_DELETED: (companyId: string) => `/campaigns/company/${companyId}/deleted`,
    GET_BY_COMPANY: (companyId: string) => `/campaigns/company/${companyId}`,
    // Global deleted campaigns (if needed)
    DELETED: '/campaigns/deleted',
  },
  CAMPAIGN_LISTS: {
    LIST_MEMBERS: (id: string) => `/campaign-influencers`,
    LIST_MEMBER_DETAIL: (id: string) => `/campaign-influencers/${id}`,
    LIST_MEMBER_DELETE: (id: string) => `/campaign-influencers/${id}`,
    LIST_MEMBER_CREATE: '/campaign-influencers',
  },

  // Campaign Influencer endpoints
  // Need to shift CAMPAIGN_LISTS and CAMPAIGN_LIST_MEMBERS to this section
  CAMPAIGN_INFLUENCERS: {
    LIST: (id: string) => `/campaign-influencers`,
    UPDATE: (id: string) => `/campaign-influencers/${id}`,
    UPDATE_STATUS: (id: string) => `/campaign-influencers/${id}/status`,
    UPDATE_NOTES: (id: string) => `/campaign-influencers/${id}/notes`,
    UPDATE_PRICE: (id: string) => `/campaign-influencers/${id}/price`,
    PRICE_APPROVAL: (id: string) =>
      `/campaign-influencers/${id}/price-approval`,
    DETAIL: (id: string) => `/campaign-influencers/${id}`,
    DELETE: (id: string) => `/campaign-influencers/${id}`,
    CREATE: '/campaign-influencers',
    MARK_ONBOARDED: '/campaign-influencers/mark-onboarded',
    REMOVE_ONBOARDED: '/campaign-influencers/remove-onboarded',
    UPDATE_CLIENT_REVIEW_STATUS: (id: string) => `/campaign-influencers/${id}/client-review-status`,
    COPY_TO_LIST: (listId: string) => `/campaign-influencers/list/${listId}/copy-to`,
    // 🆕 ADD THIS LINE
    UPDATE_SHORTLISTED_STATUS: '/campaign-influencers/shortlisted-status',
    BULK_UPDATE_SHORTLISTED_STATUS:
      '/campaign-influencers/bulk-shortlisted-status', // ADD THIS LINE
    UPDATE_AVERAGE_VIEWS: (id: string) =>
      `/campaign-influencers/${id}/average-views`,
    RESTORE: (id: string) => `/campaign-influencers/${id}/restore`,
    // BASE: '/campaign-influencers',
    // BY_ID: (id: string) => `/campaign-influencers/${id}`,
    // CONTACT_ATTEMPTS: (influencerId: string) => `/campaign-influencers/${influencerId}/contact-attempts`
  },

  BULK_ASSIGNMENTS: {
    EXECUTE: '/bulk-assignments/execute',
  },

  CAMPAIGN_LIST_MEMBERS: {
    DETAIL: (id: string) => `/campaign-list-members/${id}`,
    UPDATE: (id: string) => `/campaign-list-members/${id}`,
    DELETE: (id: string) => `/campaign-list-members/${id}`,
    LIST: '/campaign-list-members',
    CREATE: '/campaign-list-members',
  },

  CATEGORIES: {
    LIST: '/categories',
    DETAIL: (id: string) => `/categories/${id}`,
  },

    // Tags endpoints
  TAGS: {
    GET_ALL: '/tags',
    CREATE_BULK: '/tags/bulk',
    ADD_TO_INFLUENCER: (campaignInfluencerId: string) => `/tags/campaign-influencer/${campaignInfluencerId}/add`,
    REMOVE_FROM_INFLUENCER: (campaignInfluencerId: string) => `/tags/campaign-influencer/${campaignInfluencerId}/remove`,
    // 🆕 NEW: Update and Delete tag endpoints
    UPDATE: (tagId: string) => `/tags/${tagId}`,
    DELETE: (tagId: string) => `/tags/${tagId}`,
  },
  // SINGLE CONSOLIDATED INFLUENCERS SECTION
  INFLUENCERS: {
    // Backend FastAPI endpoints (for server-side calls)
    LIST: '/influencers',
    DETAIL: (id: string) => `/influencers/${id}`,
    ANALYTICS: (id: string) => `/influencers/${id}/analytics`,
    SEARCH: '/influencers/search',

    // Next.js API routes (for client-side calls)
    NEXTJS_LIST: '/api/v0/influencers',
    NEXTJS_CREATE: '/api/v0/influencers',
    NEXTJS_DETAIL: (id: string) => `/api/v0/influencers/${id}`,
    NEXTJS_BY_USERNAME: (username: string) =>
      `/api/v0/influencers/by-username/${username}`,
    NEXTJS_SOCIAL_ACCOUNTS: (id: string) =>
      `/api/v0/influencers/${id}/social-accounts`,
    NEXTJS_SOCIAL_ACCOUNT_DETAIL: (
      influencerId: string,
      socialAccountId: string,
    ) =>
      `/api/v0/influencers/${influencerId}/social-accounts/${socialAccountId}`,
  },

  INFLUENCER_CONTACTS: {
    CREATE: '/influencer-contacts',
    BY_SOCIAL_ACCOUNT: (socialAccountId: string) =>
      `/influencer-contacts/social-account/${socialAccountId}`,
    DETAIL: (id: string) => `/influencer-contacts/${id}`,
    UPDATE: (id: string) => `/influencer-contacts/${id}`,
    DELETE: (id: string) => `/influencer-contacts/${id}`,
    LIST: '/influencer-contacts',
  },

  PROFILE_ANALYTICS: {
    EXISTS: (platformAccountId: string) =>
      `/profile-analytics/exists/${platformAccountId}`,
    BY_HANDLE: (platformAccountId: string) =>
      `/profile-analytics/by-handle/${platformAccountId}`,
    WITH_SOCIAL_ACCOUNT: '/profile-analytics/with-social-account',
    COMPANY: (companyId: string) => `/profile-analytics/company/${companyId}`,
  },

  COMPANY_ANALYTICS: {
    BY_COMPANY: (companyId: string) =>
      `/profile-analytics/company/${companyId}`,
    // Add other company analytics endpoints as needed
    STATISTICS: (companyId: string) =>
      `/profile-analytics/company/${companyId}/statistics`,
    EXPORT: (companyId: string) =>
      `/profile-analytics/company/${companyId}/export`,
  },

  CLIENTS: {
    LIST: '/clients',
    DETAIL: (id: string) => `/clients/${id}`,
    CAMPAIGNS: (id: string) => `/clients/${id}/campaigns`,
  },

  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard',
    REPORTS: '/analytics/reports',
    EXPORT: '/analytics/export',
  },

  MESSAGE_TEMPLATES: {
    CREATE: '/message-templates',
    CREATE_WITH_FOLLOWUPS: '/message-templates/with-followups',
    BY_COMPANY: (companyId: string) =>
      `/message-templates/company/${companyId}`,
    BY_CAMPAIGN: (campaignId: string) =>
      `/message-templates/campaign/${campaignId}`,
    BY_CAMPAIGN_WITH_FOLLOWUPS: (campaignId: string) =>
      `/message-templates/campaign/${campaignId}/with-followups`,
    DETAIL: (templateId: string) => `/message-templates/${templateId}`,
    UPDATE: (templateId: string) => `/message-templates/${templateId}`,
    DELETE: (templateId: string) => `/message-templates/${templateId}`,
    REGENERATE_FOLLOWUPS: (templateId: string) =>
      `/message-templates/${templateId}/regenerate-followups`,
  },

  LIST_ASSIGNMENTS: {
    CREATE: '/list-assignments',
    LIST: '/list-assignments',
    DETAIL: (id: string) => `/list-assignments/${id}`,
    UPDATE_STATUS: (id: string) => `/list-assignments/${id}/status`,
    BY_LIST: (listId: string) => `/list-assignments/list/${listId}`,
    BY_AGENT: (agentId: string) => `/list-assignments/agent/${agentId}`,
    BY_STATUS: (status: string) => `/list-assignments?status=${status}`,
  },

  PLATFORMS: {
    LIST: '/platforms',
    DETAIL: (id: string) => `/platforms/${id}`,
    BY_STATUS: (status: string) => `/platforms?status=${status}`,
  },

  // Platform Agent
  ASSIGNMENTS: {
    LIST: '/agent-assignments',
    INFLUENCERS_LIST: (id: string) =>
      `/assigned-influencers/agent-assignment/${id}`,
  },

  // Agent Assignments
  AGENT_ASSIGNMENTS: {
    LIST: '/agent-assignments',
    TODAY_TASKS: '/agent-assignments/today-tasks',
    BY_AGENT_ID: (agentId: string) => `/agent-assignments/${agentId}`,
    INFLUENCERS_LIST: (id: string) =>
      `/assigned-influencers/agent-assignment/${id}`,
  },

  // Assigned Influencers
  ASSIGNED_INFLUENCERS: {
    LIST: '/assigned-influencers',
    DETAIL: (id: string) => `/assigned-influencers/${id}`,
    UPDATE_NOTES: (id: string) => `/assigned-influencers/${id}/notes`,
    UPDATE_STATUS: (id: string) => `/assigned-influencers/${id}/status`,
    UPDATE_CONTACT: (id: string) => `/assigned-influencers/${id}/contact`,
    BULK_STATUS_UPDATE: '/assigned-influencers/bulk/status',
    TRANSFER: '/assigned-influencers/transfer',
    STATS: '/assigned-influencers/stats',
    RECORD_CONTACT: (id: string) =>
      `/assigned-influencers/${id}/record-contact`,
    RECORD_CONTACT_ATTEMPT: (assignedInfluencerId: string) =>
      `/assigned-influencers/${assignedInfluencerId}/record-contact`,

    // BY_ASSIGNMENT: (assignmentId: string) => `/assigned-influencers/assignment/${assignmentId}`,
    // BY_AGENT: (agentId: string) => `/assigned-influencers/agent/${agentId}`,
    // BY_STATUS: (status: string) => `/assigned-influencers?status=${status}`,
    // UPDATE_ALL_BY_ASSIGNMENT: (assignmentId: string) => `/assigned-influencers/assignment/${assignmentId}/update-all`,
  },

  // Statuses
  STATUSES: {
    LIST: '/statuses',
    BY_MODEL: (model: string) => `/statuses/model/${model}`,
    DETAIL: (id: string) => `/statuses/${id}`,
  },

  // Video Results
  RESULTS: {
    LIST: '/results',
    CREATE: '/results',
    DETAIL: (id: string) => `/results/${id}`,
    UPDATE: (id: string) => `/results/${id}`,
    DELETE: (id: string) => `/results/${id}`,
    BY_CAMPAIGN: (campaignId: string) => `/results/campaign/${campaignId}`,
    UPDATE_ALL_BY_CAMPAIGN: (campaignId: string) =>
      `/results/campaign/${campaignId}/update-all`,
  },

  // Order Tracking Endpoints
  ORDERS: {
    // Public endpoints (no authentication required)
    BY_DISCOUNT_CODE: (discountCode: string) =>
      `/orders/discount/${encodeURIComponent(discountCode)}`,
    WEBHOOK_SHOPIFY: '/orders/webhooks/shopify',

    // Protected endpoints (authentication required)
    LIST: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
    BY_SHOPIFY_ID: (shopifyOrderId: string) =>
      `/orders/shopify/${shopifyOrderId}`,
    SEARCH: (searchTerm: string) =>
      `/orders/search/${encodeURIComponent(searchTerm)}`,
    BY_CUSTOMER_EMAIL: (email: string) =>
      `/orders/customer/${encodeURIComponent(email)}`,
    RECENT_WEEK: '/orders/recent/week',
    ANALYTICS_STATS: '/orders/analytics/stats',
  },

  AGENT_SOCIAL_CONNECTIONS: {
    // OAuth Flow endpoints
    INITIATE_CONNECTION: '/agent-social-connections/initiate-connection',
    OAUTH_CALLBACK: (platform: string) =>
      `/agent-social-connections/oauth-callback/${platform}`,
    OAUTH_STATUS: (platform: string) =>
      `/agent-social-connections/oauth-status/${platform}`,

    // Core CRUD operations
    CREATE: '/agent-social-connections',
    LIST: '/agent-social-connections',
    GET: (connectionId: string) => `/agent-social-connections/${connectionId}`,
    UPDATE: (connectionId: string) =>
      `/agent-social-connections/${connectionId}`,
    DELETE: (connectionId: string) =>
      `/agent-social-connections/${connectionId}`,

    // User-specific operations
    USER_CONNECTIONS: '/agent-social-connections/user/connections',
    PLATFORM_STATUS: '/agent-social-connections/user/platforms/status',

    // Platform connection management
    CONNECT: '/agent-social-connections/connect',
    DISCONNECT: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/disconnect`,

    // Token management
    VALIDATE_TOKEN: '/agent-social-connections/validate-token',
    REFRESH_TOKEN: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/refresh-token`,

    // Automation control
    TOGGLE_AUTOMATION: '/agent-social-connections/automation/toggle',
    AUTOMATION_STATUS: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/automation/status`,

    // Health monitoring
    HEALTH_CHECK: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/health`,
    SYSTEM_HEALTH: '/agent-social-connections/system/health',

    // ========================================================================
    // MESSAGING ENDPOINTS - Platform-specific (matches backend FastAPI)
    // ========================================================================

    // Instagram endpoints (current implementation)
    INSTAGRAM_CONVERSATIONS: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/instagram/conversations`,
    INSTAGRAM_MESSAGES: (connectionId: string, conversationId: string) =>
      `/agent-social-connections/${connectionId}/instagram/conversations/${conversationId}/messages`,
    INSTAGRAM_SEND_MESSAGE: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/instagram/send-message`,
    INSTAGRAM_SETUP_WEBHOOKS: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/instagram/setup-webhooks`,

    // Facebook endpoints (future implementation)
    FACEBOOK_CONVERSATIONS: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/facebook/conversations`,
    FACEBOOK_MESSAGES: (connectionId: string, conversationId: string) =>
      `/agent-social-connections/${connectionId}/facebook/conversations/${conversationId}/messages`,
    FACEBOOK_SEND_MESSAGE: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/facebook/send-message`,

    // WhatsApp endpoints (future implementation)
    WHATSAPP_CONVERSATIONS: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/whatsapp/conversations`,
    WHATSAPP_MESSAGES: (connectionId: string, conversationId: string) =>
      `/agent-social-connections/${connectionId}/whatsapp/conversations/${conversationId}/messages`,
    WHATSAPP_SEND_MESSAGE: (connectionId: string) =>
      `/agent-social-connections/${connectionId}/whatsapp/send-message`,

    // ========================================================================

    // Statistics and analytics
    STATISTICS: '/agent-social-connections/statistics',
    ANALYTICS: '/agent-social-connections/analytics/platform-usage',
    ERROR_REPORT: '/agent-social-connections/analytics/error-report',

    // Bulk operations
    BULK_UPDATE: '/agent-social-connections/bulk-update',
    BULK_VALIDATE: '/agent-social-connections/bulk-validate-tokens',

    // Platform-specific endpoints
    INSTAGRAM_BUSINESS: '/agent-social-connections/instagram/business-accounts',
    INSTAGRAM_CONNECT:
      '/agent-social-connections/instagram/connect-business-account',
    WHATSAPP_PROFILES: '/agent-social-connections/whatsapp/business-profiles',
    WHATSAPP_CONNECT:
      '/agent-social-connections/whatsapp/connect-business-profile',

    // Maintenance
    CLEANUP_EXPIRED: '/agent-social-connections/maintenance/cleanup-expired',
    REFRESH_ALL_TOKENS:
      '/agent-social-connections/maintenance/refresh-all-tokens',
  } as const,

  SOCIAL_ACCOUNTS: {
    // Main social accounts endpoints
    LIST: '/api/v0/social-accounts', // Lists all social accounts across all influencers

    // User existence check
    USER_EXISTS: '/social-accounts/user-exists', // Backend endpoint
    USER_EXISTS_NEXTJS: '/api/v0/social-accounts/user-exists', // NextJS API route

    // Influencer-specific social account endpoints
    BY_INFLUENCER: (influencerId: string) =>
      `/api/v0/influencers/${influencerId}/social-accounts`,
    CREATE: (influencerId: string) =>
      `/api/v0/influencers/${influencerId}/social-accounts`,
    DETAIL: (influencerId: string, socialAccountId: string) =>
      `/api/v0/influencers/${influencerId}/social-accounts/${socialAccountId}`,
    UPDATE: (influencerId: string, socialAccountId: string) =>
      `/api/v0/influencers/${influencerId}/social-accounts/${socialAccountId}`,
    DELETE: (influencerId: string, socialAccountId: string) =>
      `/api/v0/influencers/${influencerId}/social-accounts/${socialAccountId}`,
  },

  // Comments endpoints
  COMMENTS: {
    CREATE: '/comments',
    GET_BY_ENTITY: (entityType: string, entityId: string) =>
      `/comments/entity/${entityType}/${entityId}`,
    UPDATE: (commentId: string) => `/comments/${commentId}`,
    DELETE: (commentId: string) => `/comments/${commentId}`,
  },

  PRICE_NEGOTIATIONS: {
    LIST: '/price-negotiations',
    COUNTER_OFFER: (negotiationId: string) =>
      `/price-negotiations/${negotiationId}/counter-offer`,
    ACCEPT: (negotiationId: string) =>
      `/price-negotiations/${negotiationId}/accept`,
    REJECT: (negotiationId: string) =>
      `/price-negotiations/${negotiationId}/reject`,
  },

  PUBLIC_SESSIONS: {
    CREATE: '/public-sessions',
    // GET_BY_ID: (id: string) => `/public-sessions/${id}`,
    // REVOKE: (id: string) => `/public-sessions/${id}/revoke`,
    // GET_BY_TOKEN: (token: string) => `/public-sessions/token/${token}`,
  },

  PUBLIC: {
    CAMPAIGN_INFLUENCERS: {
      LIST: '/public/campaign-influencers',
      UPDATE_CLIENT_REVIEW_STATUS: (id: string) =>
        `/public/campaign-influencers/${id}/client-review-status`,
      UPDATE_SHORTLISTED_STATUS:
        '/public/campaign-influencers/shortlisted-status',
    },

    COMMENTS: {
      CREATE: '/public/comments',
      GET_BY_ENTITY: (entityType: string, entityId: string) =>
        `/public/comments/entity/${entityType}/${entityId}`,
    },

    PRICE_NEGOTIATIONS: {
      LIST: '/public/price-negotiations',
      COUNTER_OFFER: (negotiationId: string) =>
        `/public/price-negotiations/${negotiationId}/counter-offer`,
      ACCEPT: (negotiationId: string) =>
        `/public/price-negotiations/${negotiationId}/accept`,
      REJECT: (negotiationId: string) =>
        `/public/price-negotiations/${negotiationId}/reject`,
    },
    CONTENT_POSTS: {
      LIST: '/public/content-posts',
    },
  },

  BULK_REASSIGNMENTS: {
    REASSIGN: '/bulk-assignments/reassign',
  },

  REASSIGNMENT_REASONS: {
    LIST: '/reassignment-reasons',
    DETAIL: (id: string) => `/reassignment-reasons/${id}`,
    CREATE: '/reassignment-reasons',
    UPDATE: (id: string) => `/reassignment-reasons/${id}`,
    DELETE: (id: string) => `/reassignment-reasons/${id}`,
    BULK_UPDATE: '/reassignment-reasons/bulk/update',
    BULK_DELETE: '/reassignment-reasons/bulk',
    STATISTICS: '/reassignment-reasons/analytics/statistics',
    BY_CODE: (code: string) => `/reassignment-reasons/search/by-code/${code}`,
    CATEGORIES: '/reassignment-reasons/categories/list',
    TOGGLE_STATUS: (id: string) => `/reassignment-reasons/${id}/toggle-status`,
  },

  OUTREACH_AGENTS: {
    LIST: '/outreach-agents',
    DETAIL: (id: string) => `/outreach-agents/${id}`,
    CREATE: '/outreach-agents',
    UPDATE: (id: string) => `/outreach-agents/${id}`,
    DELETE: (id: string) => `/outreach-agents/${id}`,
    STATS: '/outreach-agents/stats',
  },

  SENTIMENT_ANALYSIS: {
    GENERATE: (campaignId: string) => `/sentiment-analysis/${campaignId}`,
    GET_ANALYTICS: (campaignId: string) => `/sentiment-analysis/${campaignId}`,
  },

  CONTENT_POSTS: {
    CREATE: '/content-posts',
    GET_ALL: '/content-posts',
    UPDATE: (id: string) => `/content-posts/${id}`,
    DELETE: (id: string) => `/content-posts/${id}`,
    UPDATE_ALL_BY_CAMPAIGN: (campaignId: string) =>
      `/content-posts/campaign/${campaignId}`,
  },

  ROLES: {
    GET_ALL: '/roles',
  },

  COMPANIES: {
    GET_ALL: '/companies',
    GET_BY_ID: (id: string) => `/companies/${id}`,
    CREATE: '/companies',
    UPDATE: (id: string) => `/companies/${id}`,
    DELETE: (id: string) => `/companies/${id}`,
    GET_USERS: (id: string) => `/companies/${id}/users`,
  },

  BILLING: {
    FEATURES: {
      LIST: '/billing/features',
      CREATE: '/billing/features',
      GET_BY_ID: (id: string) => `/billing/features/${id}`,
      UPDATE: (id: string) => `/billing/features/${id}`,
      DELETE: (id: string) => `/billing/features/${id}`,
      HEALTH: '/billing/features/health/check',
      GET_BY_CODE: (code: string) => `/billing/features/code/${code}`,
      GET_BY_CATEGORY: (category: string) => `/billing/features/category/${category}`,
      GET_STATISTICS: '/billing/features/statistics',
    },

    PLANS: {
      LIST: '/billing/plans',
      CREATE: '/billing/plans',
      GET: (id: string) => `/billing/plans/${id}`,
      GET_BY_CODE: (code: string) => `/billing/plans/code/${code}`,
      UPDATE: (id: string) => `/billing/plans/${id}`,
      DELETE: (id: string) => `/billing/plans/${id}`,
      RESTORE: (id: string) => `/billing/plans/${id}/restore`,
      FEATURES: (id: string) => `/billing/plans/${id}/features`,
      
      // Advanced Plan Operations
      WITH_FEATURES: (id: string) => `/billing/plans/${id}/features`,
      UNASSIGNED_FOR_PLAN: (id: string) => `/billing/plans/${id}/features/unassigned`,
      STATISTICS: '/billing/plans/statistics',
      ACTIVE_DROPDOWN: '/billing/plans/active',
      HEALTH: '/billing/plans/health/check',
    },
    
    PLAN_FEATURES: {
      LIST: '/billing/plan-features',
      CREATE: '/billing/plan-features',
      BULK_CREATE: '/billing/plan-features/bulk',
      GET: (id: string) => `/billing/plan-features/${id}`,
      UPDATE: (id: string) => `/billing/plan-features/${id}`,
      DELETE: (id: string) => `/billing/plan-features/${id}`,
      
      // Plan-Specific Operations
      FOR_PLAN: (planId: string) => `/billing/plan-features/${planId}/features`,
      UPDATE_PLAN_FEATURES: (planId: string) => `/billing/plan-features/plan/${planId}/features`,
      REMOVE_ALL_FROM_PLAN: (planId: string) => `/billing/plan-features/plan/${planId}/features`,
      CLONE_FEATURES: (planId: string) => `/billing/plan-features/plan/${planId}/clone-features`,
      
      // Feature-Specific Operations
      FOR_FEATURE: (featureId: string) => `/billing/plan-features/feature/${featureId}/plans`,
      BULK_UPDATE_FEATURE: (featureId: string) => `/billing/plan-features/feature/${featureId}/limit`,
      
      // Analytics & Reporting
      STATISTICS: '/billing/plan-features/statistics/overview',
      COMPARISON: '/billing/plan-features/comparison',
      CONFLICTS: '/billing/plan-features/validation/conflicts',
      
      // Utility Endpoints
      UNASSIGNED_FEATURES: (planId: string) => `/billing/plan-features/dropdown/unassigned-features/${planId}`,
      VALIDATE: '/billing/plan-features/validate',
      HEALTH: '/billing/plan-features/health/check',
    },
    
    SUBSCRIPTIONS: {
      LIST: '/billing/subscriptions',
      CREATE: '/billing/subscriptions',
      CREATE_CUSTOM: '/billing/subscriptions/custom',
      GET_BY_ID: (id: string) => `/billing/subscriptions/${id}`,
      UPDATE: (id: string) => `/billing/subscriptions/${id}`,
      DELETE: (id: string) => `/billing/subscriptions/${id}`,
      
      // Additional subscription operations
      CANCEL: (id: string) => `/billing/subscriptions/${id}/cancel`,
      REACTIVATE: (id: string) => `/billing/subscriptions/${id}/reactivate`,
      CHANGE_PLAN: (id: string) => `/billing/subscriptions/${id}/change-plan`,
      EXTEND_TRIAL: (id: string) => `/billing/subscriptions/${id}/extend-trial`,
      
      // Analytics
      STATISTICS: '/billing/subscriptions/statistics',
      
      // Health check
      HEALTH: '/billing/subscriptions/health/check',
    },
  },

  // External API Endpoints (for dynamic platform configuration)
  EXTERNAL_API_ENDPOINTS: {
    LIST: '/external-api-endpoints',
    DETAIL: (id: string) => `/external-api-endpoints/${id}`,
    ACTIVE_LIST: '/external-api-endpoints/active/list',
    BY_CODE: (code: string) => `/external-api-endpoints/code/${code}`,
    BY_PROVIDER: (providerId: string) => `/external-api-endpoints/provider/${providerId}/endpoints`,
    BY_DATA_TYPE: (dataType: string) => `/external-api-endpoints/data-type/${dataType}/endpoints`,
    TOGGLE_STATUS: (id: string) => `/external-api-endpoints/${id}/toggle-status`,
    STATS: '/external-api-endpoints/stats/overview',
  },

  AI: AI_ENDPOINTS,
};
