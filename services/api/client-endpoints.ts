// src/services/api/client-endpoints.ts
// NextJS API Routes endpoints for client-side calls

export const CLIENT_ENDPOINTS = {
  CAMPAIGN_INFLUENCERS: {
    ADD_TO_CAMPAIGN: '/api/v0/campaign-influencers/add-to-campaign',
    LIST: '/api/v0/campaign-influencers',
    UPDATE: (id: string) => `/api/v0/campaign-influencers/${id}`,
    DELETE: (id: string) => `/api/v0/campaign-influencers/${id}`,
    UPDATE_STATUS: (id: string) => `/api/v0/campaign-influencers/${id}/status`,
    UPDATE_PRICE: (id: string) => `/api/v0/campaign-influencers/${id}/price`,
  },
  
  // Profile provider endpoints (for future use)
  PROFILES: {
    FETCH_AND_ANALYZE: '/api/v0/profiles/fetch-and-analyze',
    NANOINFLUENCER: '/api/v0/profiles/nanoinfluencer',
    ENSEMBLEDATA: '/api/v0/profiles/ensembledata',
  },
  
  // Provider management endpoints (for future use)
  PROVIDERS: {
    HEALTH_CHECK: '/api/v0/providers/health',
    RATE_LIMITS: '/api/v0/providers/rate-limits',
  }
} as const;

export type ClientEndpoints = typeof CLIENT_ENDPOINTS;