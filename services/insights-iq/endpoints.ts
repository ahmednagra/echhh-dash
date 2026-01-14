// src/services/insights-iq/endpoints.ts

export const INSIGHTIQ_ENDPOINTS = {
  // Location endpoints
  locations: {
    search: '/social/creators/dictionary/locations', // GET - Search locations
    getById: (id: string) => `/social/creators/dictionary/locations/${id}`, // GET - Get specific location
  },
  
  // Languages endpoints
  LANGUAGES: '/social/creators/dictionary/languages',
  
  // Interests endpoints
  INTERESTS: '/social/creators/dictionary/interests',

  // Brands endpoints
  BRANDS: '/social/creators/dictionary/brands',

  // Userhandles endpoints
  USERHANDLES: '/social/creators/dictionary/userhandles',

  // Topics endpoints
  TOPICS: '/social/creators/dictionary/topics',

  // Profile Analytics endpoints
  profileAnalytics: {
    getAnalytics: '/social/creators/profiles/analytics', // GET - Get profile analytics
  },

  // Creator Profiles endpoints - UPDATED to use EnsembleData
  creatorProfiles: {
    getProfile: '/instagram/user/detailed-info', // GET - Get creator profile by username from EnsembleData
  },

    // Comments endpoints - NEW
  comments: {
    fetch: '/social/creators/contents/comments', // POST - Fetch Instagram comments
    // Future: replies endpoint for nested comment replies
    // replies: '/social/creators/contents/comments/replies'
  },

  // Influencer discovery endpoints (for future use)
  discovery: {
    search: '/discovery/search', // POST - Search influencers
    profile: (id: string) => `/discovery/profile/${id}`, // GET - Get influencer profile
  },
  
  // Analytics endpoints (for future use)
  analytics: {
    performance: '/analytics/performance', // GET - Get performance metrics
    engagement: '/analytics/engagement', // GET - Get engagement metrics
  },
  
  // Campaign endpoints (for future use)
  campaigns: {
    list: '/campaigns', // GET - List campaigns
    create: '/campaigns', // POST - Create campaign
    update: (id: string) => `/campaigns/${id}`, // PUT - Update campaign
    delete: (id: string) => `/campaigns/${id}`, // DELETE - Delete campaign
  }
} as const;

// Helper function to build full URL
export const buildEndpointUrl = (baseUrl: string, endpoint: string, params?: Record<string, any>): string => {
  let url = `${baseUrl}${endpoint}`;
  
  if (params && Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};