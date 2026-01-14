// src/services/insights-iq/topics/topics.service.ts

import { InsightIQBaseService } from '../base.service';
import { INSIGHTIQ_ENDPOINTS } from '../endpoints';
import { 
  TopicsResponse, 
  ProcessedTopic, 
  TopicsServiceResponse,
  TopicsRequestOptions,
  TOPICS_CACHE_KEY,
  TOPICS_CACHE_DURATION,
  TOPICS_DEFAULTS
} from './types';
import { ApiResponse } from '../types';

/**
 * Service for handling topics-related API calls to InsightIQ
 */
export class TopicsService extends InsightIQBaseService {
  
  /**
   * Get all available topics from InsightIQ API
   */
  async getTopics(options: TopicsRequestOptions = {}): Promise<TopicsServiceResponse> {
    try {
      console.log('🎯 Fetching topics from InsightIQ API...');

      // Prepare query parameters
      const params = {
        identifier: options.identifier,
        work_platform_id: options.work_platform_id || TOPICS_DEFAULTS.work_platform_id,
        limit: options.limit || TOPICS_DEFAULTS.limit
      };

      // Remove undefined parameters
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => value !== undefined)
      );

      console.log('📋 Request parameters:', cleanParams);

      // Build URL with query parameters
      const queryString = new URLSearchParams(
        cleanParams as Record<string, string>
      ).toString();
      
      const endpoint = queryString 
        ? `${INSIGHTIQ_ENDPOINTS.TOPICS}?${queryString}`
        : INSIGHTIQ_ENDPOINTS.TOPICS;

      const response: ApiResponse<TopicsResponse> = await this.makeRequest<TopicsResponse>(
        endpoint,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (!response.success || !response.data) {
        console.error('❌ Failed to fetch topics:', response.error);
        return {
          success: false,
          error: response.error?.message || 'Failed to fetch topics'
        };
      }

      console.log(`✅ Successfully fetched ${response.data.data.length} topics`);

      // Process the topics data
      const processedTopics = this.processTopics(response.data.data);

      return {
        success: true,
        data: processedTopics
      };

    } catch (error) {
      console.error('❌ Error in getTopics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Process raw topics data into frontend-friendly format
   */
  private processTopics(topics: Array<{ name: string; value: string }>): ProcessedTopic[] {
    return topics
      .filter(topic => topic.name && topic.name.trim()) // Filter out empty names
      .map((topic, index) => ({
        id: this.generateTopicId(topic.name),
        name: topic.name.trim(),
        value: topic.value || topic.name.trim(),
        searchable: topic.name.toLowerCase().trim()
      }))
      .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically
  }

  /**
   * Generate a consistent ID for a topic
   */
  private generateTopicId(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/_{2,}/g, '_') // Replace multiple underscores with single
      .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
  }

  /**
   * Search topics with autocomplete suggestions (client-side filtering)
   */
  searchTopics(topics: ProcessedTopic[], query: string): ProcessedTopic[] {
    if (!query || !query.trim()) {
      return topics;
    }

    const searchTerm = query.toLowerCase().trim();
    
    return topics.filter(topic => 
      topic.searchable.includes(searchTerm) ||
      topic.name.toLowerCase().includes(searchTerm) ||
      topic.value.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get topics with caching
   */
  async getTopicsWithCache(options: TopicsRequestOptions = {}): Promise<TopicsServiceResponse> {
    try {
      // Generate cache key based on options
      const cacheKey = this.generateCacheKey(options);
      
      // Try to get from cache first
      const cached = await this.getCachedTopics(cacheKey);
      if (cached) {
        console.log('📋 Returning cached topics');
        return {
          success: true,
          data: cached
        };
      }

      // Fetch fresh data
      const response = await this.getTopics(options);
      
      // Cache the successful response
      if (response.success && response.data) {
        await this.setCachedTopics(cacheKey, response.data);
      }

      return response;
    } catch (error) {
      console.error('❌ Error in getTopicsWithCache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Generate cache key based on request options
   */
  private generateCacheKey(options: TopicsRequestOptions): string {
    const keyParts = [
      TOPICS_CACHE_KEY,
      options.work_platform_id || TOPICS_DEFAULTS.work_platform_id,
      options.identifier || 'all',
      options.limit || TOPICS_DEFAULTS.limit
    ];
    return keyParts.join('_');
  }

  /**
   * Get cached topics (implement based on your caching strategy)
   */
  private async getCachedTopics(cacheKey: string): Promise<ProcessedTopic[] | null> {
    try {
      // This is a placeholder - implement based on your caching solution
      // Could be Redis, memory cache, database, etc.
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const data = JSON.parse(cached);
          const isExpired = Date.now() - data.timestamp > (TOPICS_CACHE_DURATION * 1000);
          if (!isExpired) {
            return data.topics;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting cached topics:', error);
      return null;
    }
  }

  /**
   * Set cached topics (implement based on your caching strategy)
   */
  private async setCachedTopics(cacheKey: string, topics: ProcessedTopic[]): Promise<void> {
    try {
      // This is a placeholder - implement based on your caching solution
      
      if (typeof window !== 'undefined') {
        // Client-side cache (not recommended for production)
        const cacheData = {
          topics,
          timestamp: Date.now()
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      }

      console.log(`💾 Cached ${topics.length} topics with key: ${cacheKey}`);
    } catch (error) {
      console.error('Error caching topics:', error);
    }
  }

  /**
   * Create topic relevance filter from selected topics
   */
  createTopicRelevanceFilter(
    topicNames: string[], 
    weight: number = 0.5, 
    threshold: number = 0.55
  ) {
    return {
      name: topicNames,
      weight,
      threshold
    };
  }
}

// Export singleton instance
export const topicsService = new TopicsService();