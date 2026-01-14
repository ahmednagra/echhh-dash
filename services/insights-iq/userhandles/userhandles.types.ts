// src/services/insights-iq/userhandles/userhandles.types.ts

export type Types = 'topic-tags' | 'lookalike' | 'search';

/**
 * Request parameters for userhandles API
 */
export interface UserhandlesRequest {
  query_text: string;           // Search query (required)
  type: string;                // Type: lookalike, search, topic-tags (required)
  work_platform_id: string;    // Work platform UUID (required)
  limit?: number;              // Number of results to return (optional, default: 10)
}

/**
 * Individual userhandle result from API
 */
export interface UserhandleResult {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: string;
  is_verified: boolean;
}

/**
 * API response structure
 */
export interface UserhandlesResponse {
  success: boolean;
  data: UserhandleResult[];
  total: number;
  query: string;
  error?: string;
}



/**
 * Default configuration for userhandles API
 */
export const USERHANDLES_DEFAULTS = {
  work_platform_id: '9bb8913b-ddd9-430b-a66a-d74d846e6c66', // Instagram platform ID
  type: 'search' as Types, // Default type is 'search'
  limit: 20
} as const;

/**
 * Cache configuration
 */
export const USERHANDLES_CACHE_KEY = 'insightiq_userhandles_cache';
export const USERHANDLES_CACHE_DURATION = 0; // No caching - always fresh data