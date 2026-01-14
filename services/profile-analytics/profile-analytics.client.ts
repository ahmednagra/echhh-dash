// src/services/profile-analytics/profile-analytics.client.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  // Profile Analytics Types
  AnalyticsExistenceResponse,
  AnalyticsExistenceCheckResponse,
  SaveAnalyticsRequest,
  SaveAnalyticsResponse,
  BackendAnalyticsResponse,
  SocialAccountCreateData,
  isSuccessfulAnalyticsResponse,
  isAnalyticsNotFoundError,
  isAnalyticsApiError,
  // Company Analytics Types
  GetCompanyAnalyticsRequest,
  CompanyAnalyticsData,
  CompanyAnalyticsResponse
} from '@/types/profile-analytics';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

// ============= EXISTING PROFILE ANALYTICS FUNCTIONS =============

/**
 * Check if profile analytics exists for an influencer via Next.js API route (client-side)
 */
export async function checkProfileAnalyticsExists(
  platformAccountId: string
): Promise<AnalyticsExistenceResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('checkProfileAnalyticsExists can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/profile-analytics/exists/${platformAccountId}`;
    const response = await nextjsApiClient.get<AnalyticsExistenceCheckResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      throw new Error(response.data?.error || 'Failed to check profile analytics existence');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('Error in checkProfileAnalyticsExists:', error);
    throw error;
  }
}

/**
 * Get profile analytics by handle via Next.js API route (client-side)
 */
export async function getProfileAnalyticsByHandle(
  platformAccountId: string
): Promise<BackendAnalyticsResponse> {
  try {
    const endpoint = `/api/v0/profile-analytics/by-handle/${platformAccountId}`;
    const response = await nextjsApiClient.get<BackendAnalyticsResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No profile analytics data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error in getProfileAnalyticsByHandle:', error);
    throw error;
  }
}

/**
 * Save profile analytics with social account data via Next.js API route (client-side)
 */
export async function saveProfileAnalyticsWithSocialAccount(
  requestData: SaveAnalyticsRequest
): Promise<SaveAnalyticsResponse> {
  try {
    console.log('Client Service: Saving profile analytics with social account data');
    
    const endpoint = '/api/v0/profile-analytics/with-social-account';
    const response = await nextjsApiClient.post<SaveAnalyticsResponse>(endpoint, requestData);
    
    if (response.error) {
      console.error('Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Client Service: No response data received');
      throw new Error('No response data received');
    }
    
    console.log('Client Service: Successfully saved profile analytics');
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in saveProfileAnalyticsWithSocialAccount:', error);
    throw error;
  }
}

// ============= COMPANY ANALYTICS FUNCTIONS =============

/**
 * Get company analytics via Next.js API route (client-side)
 */
export async function getCompanyAnalytics(
  request: GetCompanyAnalyticsRequest
): Promise<CompanyAnalyticsData> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getCompanyAnalytics can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Build endpoint URL
    const endpoint = `/api/v0/profile-analytics/company/${request.companyId}`;
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (request.page) queryParams.append('page', request.page.toString());
    if (request.limit) queryParams.append('limit', request.limit.toString());
    if (request.search) queryParams.append('search', request.search);
    if (request.sortBy) queryParams.append('sort_by', request.sortBy);
    if (request.sortOrder) queryParams.append('sort_order', request.sortOrder);
    
    const queryString = queryParams.toString();
    const finalEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Make the request
    const response = await fetch(finalEndpoint, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }
    
    let responseData: CompanyAnalyticsResponse;
    try {
      responseData = await response.json();
    } catch (parseError) {
      throw new Error('Failed to parse response JSON');
    }
    
    if (!responseData.success) {
      const errorMsg = responseData.error || 'Failed to get company analytics';
      throw new Error(errorMsg);
    }
    
    if (!responseData.data) {
      throw new Error('No analytics data received');
    }
    
    return responseData.data;
    
  } catch (error) {
    console.error('Error in getCompanyAnalytics:', error);
    throw error;
  }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Transform InsightIQ response to social account data format
 */
export function transformToSocialAccountData(
  insightIqResponse: InsightIQProfileAnalyticsResponse,
  platformId: string
): SocialAccountCreateData {
  const { profile } = insightIqResponse;
  
  // Handle null profile case
  if (!profile) {
    throw new Error('Profile data is null or undefined in InsightIQ response');
  }
  
  return {
    platform_id: platformId,
    platform_account_id: profile.external_id,
    account_handle: profile.platform_username,
    full_name: profile.full_name || profile.platform_username || 'Unknown', // ← FIX HERE
    profile_pic_url: profile.image_url,
    account_url: profile.url,
    is_private: false, // InsightIQ doesn't provide this, defaulting to false
    is_verified: profile.is_verified,
    is_business: profile.platform_account_type === 'BUSINESS',
    media_count: profile.content_count,
    followers_count: profile.follower_count,
    following_count: 0, // InsightIQ doesn't provide this in current response
    likes_count: 0, // InsightIQ doesn't provide total likes
    biography: profile.introduction || '', // Also handle null biography
    has_highlight_reels: false, // InsightIQ doesn't provide this
    has_clips: false, // InsightIQ doesn't provide this
    additional_metrics: {
      id: profile.external_id,
      url: profile.url,
      name: profile.full_name || profile.platform_username || 'Unknown', // ← FIX HERE TOO
      gender: profile.gender,
      language: profile.language,
      username: profile.platform_username,
      age_group: profile.age_group,
      followers: formatFollowerCount(profile.follower_count),
      isVerified: profile.is_verified,
      engagements: "0", // Default value
      external_id: profile.external_id,
      introduction: profile.introduction || '', // Handle null introduction
      profileImage: profile.image_url,
      average_likes: profile.average_likes,
      average_views: profile.average_views,
      content_count: profile.content_count,
      engagementRate: profile.engagement_rate,
      subscriber_count: profile.subscriber_count,
      livestream_metrics: null,
      platform_account_type: profile.platform_account_type
    }
  };
}

/**
 * Format follower count to string format (e.g., "46.1M")
 */
function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}