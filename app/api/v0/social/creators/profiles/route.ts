// src/app/api/v0/social/creators/profiles/route.ts
// Next.js API route for creator profiles

import { NextRequest, NextResponse } from 'next/server';
import { getCreatorProfileServer, validateEnsembleDataConfig } from '@/services/ensembledata/creator-profile/creator-profile.server';
import { validateAndCleanUsername, isSupportedPlatform } from '@/services/ensembledata/creator-profile/creator-profile.service';
import {
  CreatorProfileRequest,
  CreatorProfileResponse
} from '@/types/ensembledata';
import { Influencer } from '@/types/insights-iq';

/**
 * GET /api/v0/social/creators/profiles?username=...&platform=...
 * Fetch creator profile information from 3rd party API
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const platform = searchParams.get('platform') as 'instagram' | 'youtube' | 'tiktok';
    const includeDetailedInfo = searchParams.get('include_detailed_info') !== 'false'; // Default to true

    // Validate required fields
    if (!username || !platform) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Username and platform query parameters are required',
      }, { status: 400 });
    }

    // Validate platform
    if (!isSupportedPlatform(platform)) {
      return NextResponse.json({
        success: false,
        data: null,
        error: `Platform '${platform}' is not supported. Supported platforms: instagram, youtube, tiktok`,
      }, { status: 400 });
    }

    // Validate and clean username
    let cleanUsername: string;
    try {
      cleanUsername = validateAndCleanUsername(username);
    } catch (error) {
      return NextResponse.json({
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Invalid username format',
      }, { status: 400 });
    }

    // Validate EnsembleData configuration
    if (!validateEnsembleDataConfig()) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'External API service is not configured properly. Please check server configuration.',
      }, { status: 500 });
    }

    // Create clean request object
    const cleanRequest: CreatorProfileRequest = {
      username: cleanUsername,
      platform: platform,
      include_detailed_info: includeDetailedInfo,
    };

    // Call server service
    const result = await getCreatorProfileServer(cleanRequest);

    // Return appropriate status code based on result
    const statusCode = result.success ? 200 : 
                      result.error?.includes('not found') ? 404 :
                      result.error?.includes('private') ? 403 :
                      result.error?.includes('rate limit') ? 429 : 500;

    // Transform result data to Influencer format if successful
    if (result.success && result.data) {
      const creatorProfile = result.data as any; // Use type assertion to handle potential type mismatches
      
      // Helper function to clean and shorten Instagram URLs more conservatively
      const cleanInstagramUrl = (url: string | undefined): string => {
        if (!url) return '';
        
        try {
          const urlObj = new URL(url);
          
          // For Instagram CDN URLs, remove only the most problematic long parameters
          if (url.includes('fbcdn.net') || url.includes('instagram.')) {
            // Keep essential parameters but remove the longest tracking ones
            const paramsToRemove = [
              'efg', // Very long base64 encoded data
              '_nc_gid', // Session/group ID
              '_nc_oc', // Origin cache (very long)
              '_nc_ohc', // Origin hash cache (very long)
              'oh', // Origin hash validation (long)
              'edm' // Edge delivery metadata
            ];
            
            paramsToRemove.forEach(param => {
              urlObj.searchParams.delete(param);
            });
            
            return urlObj.toString();
          }
          
          // For other URLs, just return the base URL
          return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
        } catch (error) {
          // If URL parsing fails, truncate the original URL
          return url.length > 255 ? url.substring(0, 255) : url;
        }
      };
      
      // Helper function to truncate any remaining long URLs as fallback
      const truncateUrl = (url: string, maxLength: number = 255): string => {
        return url.length > maxLength ? url.substring(0, maxLength) : url;
      };
      
      const influencerDetails: Influencer = {
        id: creatorProfile.user_id || null,
        username: creatorProfile.username || '', 
        name: creatorProfile.full_name || '',
        profileImage: truncateUrl(cleanInstagramUrl(creatorProfile.profile_pic_url), 255),
        followers: creatorProfile.follower_count || 0,
        following_count: creatorProfile.following_count || 0,
        engagementRate: creatorProfile.engagement_rate || 0,
        isVerified: creatorProfile.is_verified || false,
        age_group: null,
        average_likes: 0,
        average_views: null,
        contact_details: [],
        content_count: creatorProfile.media_count || 0,
        engagements: '',
        external_id: null,
        gender: null,
        introduction: creatorProfile.biography || '',
        language: '',
        livestream_metrics: null,
        platform_account_type: creatorProfile.is_business_account? "BUSINESS": 'CREATOR',
        subscriber_count: null,
        url: `https://www.instagram.com/${creatorProfile.username}`,
        category: creatorProfile.detailed_info?.category_name || '',
        
        work_platform: {
          id: "9bb8913b-ddd9-430b-a66a-d74d846e6c66",
          name: "Instagram",
          logo_url: "https://cdn.insightiq.ai/platforms_logo/logos/logo_instagram.png"
        }
      };

      const response: CreatorProfileResponse = {
        success: true,
        data: influencerDetails,
        error: undefined
      };

      return NextResponse.json(response, { status: statusCode });
    }

    // Return error response
    const errorResponse: CreatorProfileResponse = {
      success: false,
      data: null,
      error: result.error
    };

    return NextResponse.json(errorResponse, { status: statusCode });

  } catch (error) {
    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Invalid request parameters',
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      data: null,
      error: 'Internal server error occurred while processing request',
    }, { status: 500 });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH(): Promise<NextResponse> {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}