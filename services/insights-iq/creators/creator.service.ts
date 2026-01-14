// src/services/insights-iq/creators/creator.service.ts
'use client';

import { InsightIQBaseService } from '../base.service';
import { 
  CreatorProfileRequest, 
  EnsembleDataResponse 
} from '@/types/insightiq/creator-profile';
import { ApiResponse } from '../types';

/**
 * Service for handling creator profile-related API calls to EnsembleData
 */
export class CreatorService extends InsightIQBaseService {
  
  /**
   * Get creator profile by username from EnsembleData
   * @param username - Instagram username (without @)
   * @param token - Authorization token for EnsembleData API
   * @returns Promise<ApiResponse<EnsembleDataResponse>>
   */
  async getCreatorProfile(
    username: string,
    token: string
  ): Promise<ApiResponse<EnsembleDataResponse>> {
    try {
      console.log(`🎯 Fetching creator profile from EnsembleData for username: ${username}`);

      // Validate required parameters
      if (!username) {
        throw new Error('username is required');
      }

      if (!token) {
        throw new Error('token is required');
      }

      // Clean username (remove @ if present)
      const cleanUsername = username.replace(/^@/, '');

      // Check if ENSEMBLEDATA_BASE_API is defined
      if (!process.env.ENSEMBLEDATA_BASE_API) {
        throw new Error('ENSEMBLEDATA_BASE_API is not configured');
      }

      // Prepare query parameters for EnsembleData API
      const queryParams = new URLSearchParams({
        username: cleanUsername,
        token: token
      });

      console.log('📋 Query parameters:', { username: cleanUsername, token: '***' });

      // Build the EnsembleData API URL directly (not InsightIQ)
      // Based on your existing API usage, try different possible endpoints
      let ensembleDataUrl: string;
      
      // Try the user/info endpoint first
      ensembleDataUrl = `${process.env.ENSEMBLEDATA_BASE_API}/instagram/user/info?${queryParams.toString()}`;
      
      console.log('🔗 Request URL:', ensembleDataUrl.replace(token, '***'));

      // Make direct fetch call to EnsembleData API (not through InsightIQ base service)
      const response = await fetch(ensembleDataUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('📦 EnsembleData API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ EnsembleData API error:', errorText);
        
        return {
          success: false,
          error: {
            type: 'API_ERROR',
            code: 'ensemble_data_api_error',
            error_code: 'ensemble_data_api_error',
            message: `EnsembleData API error: ${response.status} - ${errorText}`,
            status_code: response.status,
            http_status_code: response.status,
            request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          }
        };
      }

      const responseData = await response.json();

      return responseData as ApiResponse<EnsembleDataResponse>;

    } catch (error) {
      console.error('❌ Error in getCreatorProfile:', error);
      return {
        success: false,
        error: {
          type: 'SERVICE_ERROR',
          code: 'creator_profile_fetch_failed',
          error_code: 'creator_profile_fetch_failed',
          message: error instanceof Error ? error.message : 'Failed to fetch creator profile from EnsembleData',
          status_code: 500,
          http_status_code: 500,
          request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      };
    }
  }

  /**
   * Convert userhandle result to creator profile request format
   * @param username - Username from userhandle search
   * @returns Creator profile request
   */
  static prepareCreatorProfileRequest(
    username: string
  ): CreatorProfileRequest {
    // Remove @ symbol if present
    const cleanUsername = username.replace(/^@/, '');
    
    return {
      username: cleanUsername,
      token: '' // Token will be provided separately
    };
  }
}