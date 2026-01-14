// src/services/insights-iq/profile-analytics/profile-analytics.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ApiResponse } from '../types';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';
import { Influencer } from '@/types/insights-iq';

export class ProfileAnalyticsServerService {
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
   * Fetch profile analytics from InsightIQ API via Next.js API route (server-side)
   * This calls the Next.js API route which then calls InsightIQ
   */
  async getProfileAnalytics(
    influencer: Influencer,
    authToken?: string
  ): Promise<ApiResponse<InsightIQProfileAnalyticsResponse>> {
    try {
      console.log(`InsightIQ Server Service: Starting getProfileAnalytics call for ${influencer.username}`);
      
      // Validate required fields
      if (!influencer.username) {
        throw new Error('influencer.username is required');
      }

      if (!influencer.work_platform?.id) {
        throw new Error('influencer.work_platform.id is required');
      }
      
      const endpoint = '/api/v0/social/profiles/analytics';
      const requestBody = {
        identifier: influencer.username,
        work_platform_id: influencer.work_platform.id
      };

      console.log(`InsightIQ Server Service: Making API call to ${endpoint}`, {
        identifier: requestBody.identifier,
        work_platform_id: requestBody.work_platform_id
      });
      
      const response = await serverApiClient.post<InsightIQProfileAnalyticsResponse>(
        endpoint,
        requestBody,
        {}, // options parameter
        authToken // authToken as fourth parameter
      );
      
      console.log('InsightIQ Server Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status
      });
      
      if (response.error) {
        console.error('InsightIQ Server Service: API returned error:', response.error);
        return {
          success: false,
          error: this.createInsightIQError(response.error.message, response.status || 500)
        };
      }
      
      if (!response.data) {
        console.warn('InsightIQ Server Service: No profile analytics data received');
        return {
          success: false,
          error: this.createInsightIQError('No profile analytics data received', 500)
        };
      }
      
      console.log('InsightIQ Server Service: Successfully fetched profile analytics');
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('InsightIQ Server Service: Error in getProfileAnalytics:', error);
      
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