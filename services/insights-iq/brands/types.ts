// src/services/insights-iq/brands/types.ts

/**
 * Brand item from InsightIQ API
 */
export interface Brand {
  name: string;
}

/**
 * Response from the brands API
 */
export interface BrandsResponse {
  brands: Brand[];
}

/**
 * Processed brand data for frontend use
 */
export interface ProcessedBrand {
  id: string;
  name: string;
  logo_url?:string;
  searchable: string; // Lowercase version for search
}

/**
 * Request options for brands API
 */
export interface BrandsRequestOptions {
  // No parameters needed for brands API
}

/**
 * Service response format
 */
export interface BrandsServiceResponse {
  success: boolean;
  data?: ProcessedBrand[];
  error?: string;
}

/**
 * Cache key for brands data
 */
export const BRANDS_CACHE_KEY = 'insightiq_brands';

/**
 * Cache duration for brands (15 days in seconds)
 */
export const BRANDS_CACHE_DURATION = 15 * 24 * 60 * 60; // 15 days