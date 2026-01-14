// src/services/insights-iq/interests/interests.service.ts

import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS } from '../endpoints';
import { 
  InterestsResponse, 
  ProcessedInterest, 
  InterestsServiceResponse,
  INTERESTS_CACHE_KEY,
  INTERESTS_CACHE_DURATION 
} from './types';
import { ApiResponse } from '../types';

/**
 * Service for handling interests-related API calls to InsightIQ
 */
export class InterestsService extends InsightIQBaseService {
  
  /**
   * Get all available interests from InsightIQ API
   */
  async getInterests(): Promise<InterestsServiceResponse> {
    try {
      console.log('🎯 Fetching interests from InsightIQ API...');

      const response: ApiResponse<InterestsResponse> = await this.makeRequest<InterestsResponse>(
        INSIGHTIQ_ENDPOINTS.INTERESTS,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json, application/xml'
          }
        }
      );

      if (!response.success || !response.data) {
        console.error('❌ Failed to fetch interests:', response.error);
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch interests'
        };
      }

      console.log(`✅ Successfully fetched ${response.data.interests.length} interests`);

      // Process the interests data
      const processedInterests = this.processInterests(response.data.interests);

      return {
        success: true,
        data: processedInterests
      };

    } catch (error) {
      console.error('❌ Error in getInterests:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process raw interests data into frontend-friendly format
   */
  private processInterests(interests: Array<{ name: string }>): ProcessedInterest[] {
    return interests
      .filter(interest => interest.name && interest.name.trim()) // Filter out empty names
      .map((interest, index) => ({
        id: this.generateInterestId(interest.name),
        name: interest.name.trim(),
        searchable: interest.name.toLowerCase().trim()
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }

  /**
   * Generate a consistent ID for an interest
   */
  private generateInterestId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Search interests by query
   */
  searchInterests(interests: ProcessedInterest[], query: string): ProcessedInterest[] {
    if (!query || !query.trim()) {
      return interests;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return interests.filter(interest => 
      interest.searchable.includes(searchTerm) ||
      interest.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get interests with caching
   */
  async getInterestsWithCache(): Promise<InterestsServiceResponse> {
    try {
      // Try to get from cache first
      const cached = await this.getCachedInterests();
      if (cached) {
        console.log('📋 Returning cached interests');
        return {
          success: true,
          data: cached
        };
      }

      // Fetch fresh data
      const response = await this.getInterests();
      
      // Cache the successful response
      if (response.success && response.data) {
        await this.setCachedInterests(response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Error in getInterestsWithCache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get cached interests (implement based on your caching strategy)
   */
  private async getCachedInterests(): Promise<ProcessedInterest[] | null> {
    try {
      // This is a placeholder - implement based on your caching solution
      // Could be Redis, memory cache, database, etc.
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cached = localStorage.getItem(INTERESTS_CACHE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          const isExpired = Date.now() - data.timestamp > (INTERESTS_CACHE_DURATION * 1000);
          if (!isExpired) {
            return data.interests;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached interests:', error);
      return null;
    }
  }

  /**
   * Set cached interests (implement based on your caching strategy)
   */
  private async setCachedInterests(interests: ProcessedInterest[]): Promise<void> {
    try {
      // This is a placeholder - implement based on your caching solution
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cacheData = {
          interests,
          timestamp: Date.now()
        };
        localStorage.setItem(INTERESTS_CACHE_KEY, JSON.stringify(cacheData));
      }

      console.log(`💾 Cached ${interests.length} interests`);
    } catch (error) {
      console.error('Error caching interests:', error);
    }
  }
}

// Export singleton instance
export const interestsService = new InterestsService();