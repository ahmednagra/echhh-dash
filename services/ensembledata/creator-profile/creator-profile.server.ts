// src/services/ensembledata/creator-profile/creator-profile.server.ts
// Server-side service for calling EnsembleData 3rd party API

import { EDClient } from 'ensembledata';
import {
  CreatorProfileRequest,
  CreatorProfileResponse,
  CreatorProfile,
  InstagramUserDetailedInfoRequest,
  InstagramUserDetailedInfo,
  EnsembleDataResponse,
  EnsembleDataApiResponse,
} from '@/types/ensembledata';
import { ENSEMBLEDATA_CONFIG } from '../endpoints';

/**
 * Server-side function to get creator profile using EnsembleData SDK
 */
export async function getCreatorProfileServer(
  request: CreatorProfileRequest
): Promise<CreatorProfileResponse> {
  try {
    console.log('🚀 Server: Processing creator profile request:', request);

    // Currently only supporting Instagram
    if (request.platform !== 'instagram') {
      return {
        success: false,
        data: null,
        error: `Platform ${request.platform} is not supported yet`,
      };
    }

    // Validate EnsembleData configuration
    if (!validateEnsembleDataConfig()) {
      console.error('❌ Server: EnsembleData not configured properly');
      return {
        success: false,
        data: null,
        error: 'External API service is not configured properly',
      };
    }

    // Initialize EnsembleData client
    const client = new EDClient({ 
      token: ENSEMBLEDATA_CONFIG.token 
    });

    console.log('🔄 Server: Calling EnsembleData API for user:', request.username);

    // Call EnsembleData API
    const result: EnsembleDataApiResponse<InstagramUserDetailedInfo> = await client.instagram.userDetailedInfo({
      username: request.username,
    });

    console.log('📊 Server: EnsembleData API response received:', {
      hasData: !!result.data,
      unitsCharged: result.unitsCharged,
      username: result.data?.username,
    });

    if (!result.data) {
      console.error('❌ Server: No data received from EnsembleData API');
      return {
        success: false,
        data: null,
        error: 'No user data found. The account may not exist or be private.',
      };
    }

    // Convert EnsembleData response to our format
    const creatorProfile: CreatorProfile = mapEnsembleDataToCreatorProfile(
      result.data,
      request.platform,
      result.unitsCharged
    );

    console.log('✅ Server: Creator profile processed successfully:', {
      username: creatorProfile.username,
      followers: creatorProfile.follower_count,
      verified: creatorProfile.is_verified,
      unitsCharged: creatorProfile.units_charged,
    });

    return {
      success: true,
      data: creatorProfile,
      message: 'Creator profile fetched successfully',
    };

  } catch (error) {
    console.error('💥 Server: Error processing creator profile:', error);
    
    // Handle specific EnsembleData errors
    let errorMessage = 'Unknown server error';
    
    if (error instanceof Error) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        errorMessage = 'User not found. The account may not exist or be private.';
      } else if (error.message.includes('403') || error.message.includes('forbidden')) {
        errorMessage = 'Access denied. The account may be private.';
      } else if (error.message.includes('429') || error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
      } else if (error.message.includes('token') || error.message.includes('auth')) {
        errorMessage = 'Authentication failed. Please check API configuration.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return {
      success: false,
      data: null,
      error: errorMessage,
    };
  }
}

/**
 * Map EnsembleData response to our CreatorProfile format
 */
function mapEnsembleDataToCreatorProfile(
  data: InstagramUserDetailedInfo,
  platform: 'instagram' | 'youtube' | 'tiktok',
  unitsCharged: number
): CreatorProfile {
  
  // Calculate engagement rate from recent posts if available
  let engagementRate: number | undefined;
  
  if (data.edge_owner_to_timeline_media?.edges && data.edge_owner_to_timeline_media.edges.length > 0) {
    const recentPosts = data.edge_owner_to_timeline_media.edges.slice(0, 12); // Last 12 posts
    const totalEngagement = recentPosts.reduce((sum, post) => {
      const likes = post.node.edge_liked_by?.count || 0;
      const comments = post.node.edge_media_to_comment?.count || 0;
      return sum + likes + comments;
    }, 0);
    
    const avgEngagementPerPost = totalEngagement / recentPosts.length;
    const followerCount = data.edge_followed_by?.count || 1;
    engagementRate = (avgEngagementPerPost / followerCount) * 100;
  }
  
  return {
    platform,
    user_id: data.id,
    username: data.username,
    full_name: data.full_name,
    profile_pic_url: data.profile_pic_url_hd || data.profile_pic_url,
    follower_count: data.edge_followed_by?.count || 0,
    following_count: data.edge_follow?.count || 0,
    media_count: data.edge_owner_to_timeline_media?.count || 0,
    is_verified: data.is_verified,
    is_private: data.is_private,
    biography: data.biography,
    engagement_rate: engagementRate,
    detailed_info: data,
    fetched_at: new Date().toISOString(),
    units_charged: unitsCharged,
    posts: data.edge_owner_to_timeline_media?.edges || [],
  };
}

/**
 * Validate EnsembleData API configuration
 */
export function validateEnsembleDataConfig(): boolean {
  if (!ENSEMBLEDATA_CONFIG.token) {
    console.error('❌ EnsembleData auth token is not configured');
    return false;
  }

  return true;
}

/**
 * Extract basic user info for quick operations
 * Utility function that doesn't require full detailed info
 */
export function extractBasicUserInfo(data: InstagramUserDetailedInfo) {
  return {
    user_id: data.id,
    username: data.username,
    full_name: data.full_name,
    profile_pic_url: data.profile_pic_url_hd || data.profile_pic_url,
    follower_count: data.edge_followed_by?.count || 0,
    following_count: data.edge_follow?.count || 0,
    media_count: data.edge_owner_to_timeline_media?.count || 0,
    is_verified: data.is_verified,
    is_private: data.is_private,
    biography: data.biography,
  };
}