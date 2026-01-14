// src/services/profile-refresh/profile-refresh.service.ts
// Core service for refreshing influencer profile data from premium analytics provider
// Handles the complete flow: check cache -> fetch analytics -> save -> update campaign

import { profileAnalyticsService } from '@/services/insights-iq/profile-analytics';
import { 
  getProfileAnalyticsByHandle,
  saveProfileAnalyticsWithSocialAccount,
  transformToSocialAccountData 
} from '@/services/profile-analytics';
import { addInfluencerToCampaign } from '@/services/campaign-influencers/campaign-influencers.client';
import { mapInsightIQToStandardizedProfile } from './profile-analytics-mapper';
import { 
  RefreshProfileDataParams, 
  RefreshProfileDataResult,
  REFRESH_PROGRESS_MESSAGES 
} from '@/types/profile-refresh';
import { 
  CampaignListMember, 
  AddToCampaignRequest,
  StandardizedProfile 
} from '@/types/campaign-influencers';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';
import { SaveAnalyticsRequest } from '@/types/profile-analytics';

/**
 * Progress callback type for reporting operation progress
 */
type ProgressCallback = (step: number, message: string) => void;

/**
 * Refreshes influencer profile data from premium analytics provider
 * 
 * Flow:
 * 1. Check if analytics data exists in backend cache
 * 2. If not cached, fetch fresh data from InsightIQ
 * 3. Save analytics data to profile-analytics storage
 * 4. Update campaign record via add-to-campaign with profile_data
 * 5. Return updated member data for local row update
 * 
 * @param params - Parameters for the refresh operation
 * @param onProgress - Optional callback for progress updates
 * @returns Result containing updated member data or error
 */
export async function refreshInfluencerProfileData(
  params: RefreshProfileDataParams,
  onProgress?: ProgressCallback
): Promise<RefreshProfileDataResult> {
  const { 
    campaignInfluencerId,
    username, 
    platformId, 
    campaignListId, 
    platform 
  } = params;
  
  try {
    let analyticsData: InsightIQProfileAnalyticsResponse | null = null;
    let dataSource: 'cached' | 'fresh' = 'fresh';
    
    // Step 1: Check for cached analytics data in backend
    onProgress?.(1, REFRESH_PROGRESS_MESSAGES.CHECKING_CACHE);
    
    try {
      const backendResponse = await getProfileAnalyticsByHandle(username);
      
      if (
        backendResponse && 
        'analytics_data' in backendResponse && 
        Array.isArray(backendResponse.analytics_data) &&
        backendResponse.analytics_data.length > 0
      ) {
        // Use cached data - skip expensive API call
        analyticsData = backendResponse.analytics_data[0].analytics as InsightIQProfileAnalyticsResponse;
        dataSource = 'cached';
 
      }
    } catch (backendError: any) {
      // If not found or error, proceed to fetch fresh data
      const errorMessage = backendError?.message || 'Unknown error';
      
      if (
        errorMessage.includes('not found') || 
        errorMessage.includes('404') ||
        errorMessage.includes('Social account not found')
      ) {
        console.log('Profile Refresh: No cached data found, will fetch fresh');
      } else {
        console.warn('Profile Refresh: Backend check failed:', errorMessage);
      }
    }
    
    // Step 2: If no cached data, fetch from InsightIQ (expensive call)
    if (!analyticsData) {
      onProgress?.(2, REFRESH_PROGRESS_MESSAGES.FETCHING_ANALYTICS);
      
      const insightIQResult = await profileAnalyticsService.getProfileAnalytics(
        username,
        platformId
      );
      
      if (!insightIQResult.success || !insightIQResult.data) {
        const errorMessage = insightIQResult.error?.message || 'Failed to fetch profile analytics';
        console.error('Profile Refresh: InsightIQ fetch failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage,
          dataSource: 'fresh'
        };
      }
      
      analyticsData = insightIQResult.data;
      dataSource = 'fresh';
      
      // Step 3: Save fresh analytics to profile-analytics storage
      onProgress?.(3, REFRESH_PROGRESS_MESSAGES.SAVING_ANALYTICS);
      
      try {
        const socialAccountData = transformToSocialAccountData(analyticsData, platformId);
        
        await saveProfileAnalyticsWithSocialAccount({
          social_account_data: socialAccountData,
          analytics: analyticsData
        } as SaveAnalyticsRequest);
        
        console.log('Profile Refresh: Analytics saved to storage');
      } catch (saveError) {
        // Log but don't fail - saving analytics is secondary to updating campaign record
        console.warn('Profile Refresh: Failed to save analytics to storage:', saveError);
      }
    }
    
    // Step 4: Transform and update campaign record
    onProgress?.(4, REFRESH_PROGRESS_MESSAGES.UPDATING_CAMPAIGN);
    
    // Map InsightIQ response to StandardizedProfile format
    const standardizedProfile = mapInsightIQToStandardizedProfile(analyticsData, platformId);
    
    console.log('Profile Refresh: Mapped profile audience_demographics:', 
      (standardizedProfile as any).audience_demographics
    );
    
    // Build add-to-campaign request with profile_data
    const addToCampaignRequest: AddToCampaignRequest = {
      username,
      platform,
      campaign_list_id: campaignListId,
      platform_id: platformId,
      added_through: 'discovery', // Maintain original context
      profile_data: standardizedProfile
    };
    
    // Debug: Log the exact payload being sent
    
    const campaignResult = await addInfluencerToCampaign(addToCampaignRequest);
    
    if (!campaignResult.success) {
      const errorMessage = campaignResult.message || 'Failed to update campaign record';
      console.error('Profile Refresh: Campaign update failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        dataSource
      };
    }
    
    console.log('Profile Refresh: Campaign record updated successfully');
    
    // Construct updated member from response for local row update
    const updatedMember = constructUpdatedMember(
      campaignInfluencerId,
      campaignResult,
      standardizedProfile,
      analyticsData
    );
    
    return {
      success: true,
      updatedMember,
      dataSource
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Profile Refresh: Unexpected error:', error);
    
    return {
      success: false,
      error: errorMessage,
      dataSource: 'fresh'
    };
  }
}

/**
 * Constructs an updated CampaignListMember from the add-to-campaign response
 * This is used to update the local table row without requiring a full list refresh
 * 
 * @param originalId - Original campaign influencer ID
 * @param campaignResult - Response from add-to-campaign API
 * @param profile - The standardized profile data
 * @param analyticsData - Original analytics response for additional fields
 * @returns Updated CampaignListMember for local state update
 */
function constructUpdatedMember(
  originalId: string,
  campaignResult: any,
  profile: StandardizedProfile & { 
    filter_match?: any; 
    audience_demographics?: any;
    audience_locations?: any;
    audience_age_groups?: any;
  },
  analyticsData: InsightIQProfileAnalyticsResponse
): CampaignListMember {
  // Use the profile_data from response if available, otherwise use our mapped profile
  const responseProfile = campaignResult.profile_data || profile;
  
  // Debug: Log what we're constructing
  console.log('Profile Refresh: Constructing updated member with:', {
    filter_match_audience_age: profile.filter_match?.audience_age,
    filter_match_audience_gender: profile.filter_match?.audience_gender,
    filter_match_audience_locations: profile.filter_match?.audience_locations,
    audience_demographics: profile.audience_demographics,
  });
  
  return {
    id: campaignResult.list_member_id || originalId,
    success: true,
    message: campaignResult.message,
    social_account: {
      id: campaignResult.influencer_id || profile.id,
      account_handle: profile.username,
      full_name: profile.name,
      profile_pic_url: profile.profileImage,
      platform_id: '', // Will be set by backend
      is_verified: profile.isVerified,
      followers_count: profile.followers,
      platform_account_id: profile.external_id || profile.id,
      is_private: false,
      is_business: profile.platform_account_type === 'BUSINESS',
      media_count: profile.content_count || null,
      following_count: profile.following_count || null,
      account_url: profile.url,
      // Store complete profile data in additional_metrics
      // This matches the pattern used in discovery and search flows
      additional_metrics: {
        // Core profile fields
        id: profile.id,
        username: profile.username,
        name: profile.name,
        profileImage: profile.profileImage,
        followers: profile.followers,
        isVerified: profile.isVerified,
        url: profile.url,
        external_id: profile.external_id,
        
        // Profile details
        age_group: profile.age_group,
        average_likes: profile.average_likes,
        average_views: profile.average_views,
        content_count: profile.content_count,
        gender: profile.gender,
        introduction: profile.introduction,
        language: profile.language,
        platform_account_type: profile.platform_account_type,
        subscriber_count: profile.subscriber_count,
        engagementRate: profile.engagementRate,
        engagement_rate: profile.engagementRate, // Both naming conventions
        following_count: profile.following_count,
        
        // Location data
        creator_location: profile.creator_location,
        
        // Contact details
        contact_details: profile.contact_details,
        
        // Filter match - minimal, only creator info
        filter_match: profile.filter_match || {
          creator_gender: profile.gender || 'UNKNOWN',
          creator_language: profile.language || null,
          creator_locations: profile.creator_location?.country 
            ? [profile.creator_location.country] 
            : [],
        },
        
        // Audience demographics - for display in UI columns
        audience_demographics: profile.audience_demographics,
        audience_locations: profile.audience_locations,
        audience_age_groups: profile.audience_age_groups,
        
        // Metadata
        provider_source: profile.provider_source || 'insightiq',
        fetched_at: profile.fetched_at,
      },
    },
  };
}