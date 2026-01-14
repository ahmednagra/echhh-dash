// src/services/insights-iq/interests/types.ts

/**
 * Interest item from InsightIQ API
 */
export interface Interest {
  name: string;
}

/**
 * Response from the interests API
 */
export interface InterestsResponse {
  interests: Interest[];
}

/**
 * Processed interest data for frontend use
 */
export interface ProcessedInterest {
  id: string;
  name: string;
  searchable: string; // Lowercase version for search
}

/**
 * Request options for interests API
 */
export interface InterestsRequestOptions {
  // No parameters needed for interests API
}

/**
 * Service response format
 */
export interface InterestsServiceResponse {
  success: boolean;
  data?: ProcessedInterest[];
  error?: string;
}

/**
 * Cache key for interests data
 */
export const INTERESTS_CACHE_KEY = 'insightiq_interests';

/**
 * Cache duration for interests (15 days in seconds)
 */
export const INTERESTS_CACHE_DURATION = 15 * 24 * 60 * 60; // 15 days