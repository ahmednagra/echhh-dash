// src/services/insights-iq/locations/location.service.ts

import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS } from '../endpoints';
import { 
  LocationSearchParams, 
  LocationsResponse, 
  ApiResponse,
  InsightIQLocation 
} from '../types';

export class LocationService extends InsightIQBaseService {
  private static readonly CACHE_KEY = 'insightiq_locations_cache';
  private static readonly CACHE_DURATION = 15 * 24 * 60 * 60 * 1000; // 15 days in milliseconds
  private static instance: LocationService | null = null;

  /**
   * Get singleton instance
   */
  private static getInstance(): LocationService {
    if (!this.instance) {
      this.instance = new LocationService();
    }
    return this.instance;
  }

  /**
   * Generate cache key based on search parameters
   */
  private static generateCacheKey(params: LocationSearchParams): string {
    const { search_string, limit = 10, offset = 0 } = params;
    return `${this.CACHE_KEY}_${search_string.trim().toLowerCase()}_${limit}_${offset}`;
  }

  /**
   * Get cached locations data
   */
  private static getCachedData(params: LocationSearchParams): ApiResponse<LocationsResponse> | null {
    if (typeof window === 'undefined') return null; // Server-side check
    
    try {
      const cacheKey = this.generateCacheKey(params);
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid (15 days)
      if (now - timestamp < this.CACHE_DURATION) {
        return data;
      }

      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      return null;
    } catch (error) {
      console.error('Error reading locations cache:', error);
      return null;
    }
  }

  /**
   * Cache locations data
   */
  private static setCachedData(params: LocationSearchParams, data: ApiResponse<LocationsResponse>): void {
    if (typeof window === 'undefined') return; // Server-side check
    
    try {
      const cacheKey = this.generateCacheKey(params);
      const cacheEntry = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Error caching locations data:', error);
    }
  }

  /**
   * Search locations by query string with caching
   */
  static async searchLocations(params: LocationSearchParams): Promise<ApiResponse<LocationsResponse>> {
    try {
      const { search_string, limit = 10, offset = 0 } = params;

      // Validate search string
      if (!search_string || search_string.trim().length < 2) {
        return {
          success: false,
          error: {
            type: 'VALIDATION_ERROR',
            code: 'invalid_search_string',
            error_code: 'invalid_search_string',
            message: 'Search string must be at least 2 characters long',
            status_code: 400,
            http_status_code: 400,
            request_id: `req_${Date.now()}`
          }
        };
      }

      // Try to get from cache first
      const cachedResult = this.getCachedData(params);
      if (cachedResult) {
        return cachedResult;
      }

      // Fetch from API using singleton instance
      const service = this.getInstance();
      const result = await service.fetchLocationsFromAPI(params);
      
      // Cache the result only if successful
      if (result.success) {
        this.setCachedData(params, result);
      }
      
      return result;

    } catch (error) {
      console.error('Error in searchLocations:', error);
      
      return {
        success: false,
        error: {
          type: 'SERVICE_ERROR',
          code: 'search_locations_failed',
          error_code: 'search_locations_failed',
          message: error instanceof Error ? error.message : 'Failed to search locations',
          status_code: 500,
          http_status_code: 500,
          request_id: `req_${Date.now()}`
        }
      };
    }
  }

  /**
   * Instance method for backward compatibility
   */
  async searchLocations(params: LocationSearchParams): Promise<ApiResponse<LocationsResponse>> {
    return LocationService.searchLocations(params);
  }

  /**
   * Fetch locations from API using base service
   */
  private async fetchLocationsFromAPI(params: LocationSearchParams): Promise<ApiResponse<LocationsResponse>> {
    const { search_string, limit = 10, offset = 0 } = params;

    // Build endpoint with query parameters
    const queryParams = new URLSearchParams({
      search_string: search_string.trim(),
      limit: Math.min(Math.max(limit, 1), 100).toString(), // Ensure limit is between 1-100
      offset: Math.max(offset, 0).toString() // Ensure offset is not negative
    });

    const endpoint = `${INSIGHTIQ_ENDPOINTS.locations.search}?${queryParams.toString()}`;
    
    return await this.makeRequest<LocationsResponse>(endpoint, {
      method: 'GET'
    });
  }

  /**
   * Clear cache (useful for debugging or forced refresh)
   */
  static clearCache(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY)) {
          localStorage.removeItem(key);
        }
      });
      console.log('Locations cache cleared');
    } catch (error) {
      console.error('Error clearing locations cache:', error);
    }
  }

  /**
   * Get cache info for debugging
   */
  static getCacheInfo(): { totalCacheEntries: number; cacheKeys: string[] } {
    if (typeof window === 'undefined') return { totalCacheEntries: 0, cacheKeys: [] };
    
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY));
      
      return {
        totalCacheEntries: cacheKeys.length,
        cacheKeys: cacheKeys
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return { totalCacheEntries: 0, cacheKeys: [] };
    }
  }
}