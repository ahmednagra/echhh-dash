// src/services/insights-iq/topics/types.ts

/**
 * Topic item from InsightIQ API
 */
export interface Topic {
  name: string;
  value: string;
}

/**
 * Response from the topics API
 */
export interface TopicsResponse {
  data: Topic[];
}

/**
 * Processed topic data for frontend use
 */
export interface ProcessedTopic {
  id: string;
  name: string;
  value: string;
  searchable: string; // Lowercase version for search
}

/**
 * Request options for topics API
 */
export interface TopicsRequestOptions {
  identifier?: string;
  work_platform_id?: string;
  limit?: number;
}

/**
 * Service response format
 */
export interface TopicsServiceResponse {
  success: boolean;
  data?: ProcessedTopic[];
  error?: string;
}

/**
 * Topic relevance filter (for influencer search)
 */
export interface TopicRelevanceFilter {
  name: string[]; // Array of topic names
  weight: number; // Weight value (default: 0.5)
  threshold: number; // Threshold value (default: 0.55)
}

/**
 * Cache configuration
 */
export const TOPICS_CACHE_KEY = 'insightiq_topics_cache';
export const TOPICS_CACHE_DURATION = 15 * 24 * 60 * 60; // 15 days in seconds

/**
 * Default values for topics requests
 */
export const TOPICS_DEFAULTS = {
  limit: 100,
  work_platform_id: '9bb8913b-ddd9-430b-a66a-d74d846e6c66'
} as const;