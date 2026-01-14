// src/services/insights-iq/userhandles/userhandles.service.ts
import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS, buildEndpointUrl } from '../endpoints';
import { 
  UserhandlesRequest, 
  UserhandlesResponse, 
  UserhandleResult,
  USERHANDLES_DEFAULTS,
  USERHANDLES_CACHE_KEY,
  USERHANDLES_CACHE_DURATION
} from './userhandles.types';
import { ApiResponse } from '../types';

/**
 * Service for handling userhandles-related API calls to InsightIQ
 * Follows the same pattern as InterestsService
 */
export class UserhandlesService extends InsightIQBaseService {
  
  /**
   * Search for userhandles/influencers
   * @param query - Search query string
   * @param options - Optional parameters (limit, type, work_platform_id)
   * @returns Promise<UserhandlesResponse>
   */
  async searchUserhandles(
    query: string, 
    options: Partial<Omit<UserhandlesRequest, 'query_text'>> = {}
  ): Promise<UserhandlesResponse> {
    try {
      // Validate query
      if (!query || query.trim().length === 0) {
        throw new Error('Query text is required');
      }

      // Clean query (remove @ if present)
      const cleanQuery = query.trim().replace(/^@/, '');
      
      if (cleanQuery.length < 2) {
        throw new Error('Query must be at least 2 characters long');
      }

      console.log('🎯 Searching userhandles for query:', cleanQuery);

      // Prepare request parameters
      const params: UserhandlesRequest = {
        query_text: cleanQuery,
        type: options.type || USERHANDLES_DEFAULTS.type,
        work_platform_id: options.work_platform_id || USERHANDLES_DEFAULTS.work_platform_id,
        limit: options.limit || USERHANDLES_DEFAULTS.limit
      };

      console.log('📋 Request parameters:', params);

      // Build URL with query parameters - following interests pattern
      const url = buildEndpointUrl('', INSIGHTIQ_ENDPOINTS.USERHANDLES, params);
      console.log('📡 API URL:', url);

      // Make API request using base service
      const response: ApiResponse<UserhandlesResponse> = await this.makeRequest<UserhandlesResponse>(
        url,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.success || !response.data) {
        console.error('❌ Failed to fetch userhandles:', response.error);
        return {
          success: false,
          data: [],
          total: 0,
          query: cleanQuery,
          error: response.error?.message || 'Failed to search userhandles'
        };
      }

      console.log('📥 Raw API response:', response.data);

      // Process the userhandles data
      const processedUserhandles = this.processUserhandles(response.data);

      console.log(`✅ Successfully processed ${processedUserhandles.length} userhandles`);

      return {
        success: true,
        data: processedUserhandles,
        total: processedUserhandles.length,
        query: cleanQuery
      };

    } catch (error) {
      console.error('❌ Error in searchUserhandles:', error);
      
      return {
        success: false,
        data: [],
        total: 0,
        query: query,
        error: error instanceof Error ? error.message : 'Failed to search userhandles'
      };
    }
  }

  /**
   * Process raw userhandles data into frontend-friendly format
   * Similar to processInterests in InterestsService
   */
  private processUserhandles(data: any): UserhandleResult[] {
    let userhandles: any[] = [];
    
    // Handle different response formats - same pattern as interests
    if (Array.isArray(data)) {
      userhandles = data;
    } else if (data?.data && Array.isArray(data.data)) {
      userhandles = data.data;
    } else if (data?.results && Array.isArray(data.results)) {
      userhandles = data.results;
    } else if (data?.userhandles && Array.isArray(data.userhandles)) {
      userhandles = data.userhandles;
    } else {
      console.warn('⚠️ Unexpected response format:', data);
      return [];
    }

    // Process and normalize userhandle data
    return userhandles
      .filter(item => item && typeof item === 'object' && (item.username || item.handle))
      .map(item => ({
        user_id: item.user_id || item.id || this.generateUserId(item.username || item.handle),
        username: item.username || item.handle || '',
        fullname: item.fullname || item.full_name || item.display_name || '',
        picture: item.picture || item.profile_pic_url || item.avatar || '',
        followers: item.followers || item.follower_count || '0',
        is_verified: Boolean(item.is_verified || item.verified)
      }))
      .filter(item => item.username) // Only include items with username
      .sort((a, b) => {
        // Sort by verification status first, then by follower count
        if (a.is_verified && !b.is_verified) return -1;
        if (!a.is_verified && b.is_verified) return 1;
        return parseInt(b.followers) - parseInt(a.followers);
      });
  }

  /**
   * Generate a consistent ID for a userhandle when not provided
   */
  private generateUserId(username: string): string {
    return username
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 20);
  }

  /**
   * Search userhandles for creator lookalikes
   * @param query - Creator username to find lookalikes for
   * @param limit - Number of results (optional)
   * @returns Promise<UserhandlesResponse>
   */
  async searchCreatorLookalikes(
    query: string, 
    limit?: number
  ): Promise<UserhandlesResponse> {
    console.log('🎨 Searching creator lookalikes for:', query);
    return this.searchUserhandles(query, { 
      type: 'lookalike',
      limit: limit || USERHANDLES_DEFAULTS.limit 
    });
  }

  /**
   * Search userhandles for audience lookalikes
   * @param query - Creator username to find audience lookalikes for
   * @param limit - Number of results (optional)
   * @returns Promise<UserhandlesResponse>
   */
  async searchAudienceLookalikes(
    query: string, 
    limit?: number
  ): Promise<UserhandlesResponse> {
    console.log('🎯 Searching audience lookalikes for:', query);
    return this.searchUserhandles(query, { 
      type: 'lookalike',
      limit: limit || USERHANDLES_DEFAULTS.limit 
    });
  }

  /**
   * Get userhandles by username search
   * @param query - Search query
   * @param limit - Number of results (optional)
   * @returns Promise<UserhandlesResponse>
   */
  async searchByUsername(
    query: string, 
    limit?: number
  ): Promise<UserhandlesResponse> {
    console.log('🔍 Searching userhandles by username:', query);
    return this.searchUserhandles(query, { 
      type: 'search',
      limit: limit || USERHANDLES_DEFAULTS.limit 
    });
  }

  /**
   * Search userhandles with caching (no caching for userhandles as per requirements)
   * Keeping the method for consistency with interests service
   */
  async searchUserhandlesWithCache(query: string, options: Partial<Omit<UserhandlesRequest, 'query_text'>> = {}): Promise<UserhandlesResponse> {
    // No caching for userhandles - always return fresh data
    return this.searchUserhandles(query, options);
  }

  /**
   * Filter userhandles by query (client-side filtering)
   */
  filterUserhandles(userhandles: UserhandleResult[], query: string): UserhandleResult[] {
    if (!query || !query.trim()) {
      return userhandles;
    }

    const searchTerm = query.toLowerCase().trim().replace(/^@/, '');
    
    return userhandles.filter(userhandle => 
      userhandle.username.toLowerCase().includes(searchTerm) ||
      userhandle.fullname.toLowerCase().includes(searchTerm)
    );
  }
}

// Export singleton instance
export const userhandlesService = new UserhandlesService();