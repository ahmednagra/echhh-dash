// src/services/insights-iq/profile-analytics/profile-analytics.service.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ApiResponse } from '../types';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';
import { Influencer } from '@/types/insights-iq';

export class ProfileAnalyticsService {
  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create proper InsightIQError object
   */
  private createInsightIQError(message: string, statusCode: number): ApiResponse<InsightIQProfileAnalyticsResponse>['error'] {
    return {
      type: 'API_ERROR',
      code: `error_${statusCode}`,
      error_code: `api_error_${statusCode}`,
      message,
      status_code: statusCode,
      http_status_code: statusCode,
      request_id: this.generateRequestId()
    };
  }

  /**
   * Fetch profile analytics from InsightIQ API via Next.js API route (client-side)
   * This calls the Next.js API route which then calls InsightIQ
   */
  async getProfileAnalytics(username: string, platform: string): Promise<ApiResponse<InsightIQProfileAnalyticsResponse>> {
    try {
      // Debug: Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('InsightIQ Client Service: Not in browser environment');
        throw new Error('getProfileAnalytics can only be called from browser');
      }

      // Validate required fields
      if (!username) {
        throw new Error('influencer.username is required');
      }

      if (!platform) {
        throw new Error('influencer.work_platform.id is required');
      }
      
      const endpoint = '/api/v0/social/profiles/analytics';
      const requestBody = {
        identifier: username,
        work_platform_id: platform
      };

      console.log(`InsightIQ Client Service: Making API call to ${endpoint}`, {
        identifier: requestBody.identifier,
        work_platform_id: requestBody.work_platform_id
      });
      
      const response = await nextjsApiClient.post<InsightIQProfileAnalyticsResponse>(endpoint, requestBody);
      
      console.log('InsightIQ Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status
      });
      
      if (response.error) {
        console.error('InsightIQ Client Service: API returned error:', response.error);
        return {
          success: false,
          error: this.createInsightIQError(response.error.message, response.status || 500)
        };
      }
      
      if (!response.data) {
        console.warn('InsightIQ Client Service: No profile analytics data received');
        return {
          success: false,
          error: this.createInsightIQError('No profile analytics data received', 500)
        };
      }
      
      console.log('InsightIQ Client Service: Successfully fetched profile analytics');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('InsightIQ Client Service: Error in getProfileAnalytics:', error);
      
      return {
        success: false,
        error: this.createInsightIQError(
          error instanceof Error ? error.message : 'Unknown error occurred',
          500
        )
      };
    }
  }
}