// src/app/api/v0/campaign-influencers/add-to-campaign/route.ts
// NextJS API route for adding influencers to campaign with provider support
// Handles TWO scenarios: with profile_data OR without (fetch needed)

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { profileProviderManager } from '@/services/providers/profile-manager.server';
import { addInfluencerToCampaignStorage } from '@/services/campaign-influencers/campaign-influencers.server';
import { AddToCampaignRequest, AddToCampaignResponse } from '@/types/campaign-influencers';

export async function POST(request: NextRequest) {
  try {
    // Extract authentication token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Authentication token is required',
          error_code: 'INVALID_INPUT'
        } as AddToCampaignResponse,
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: AddToCampaignRequest = await request.json();
    
    // Validate required fields
    const validation = validateRequest(requestData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
          error_code: 'INVALID_INPUT'
        } as AddToCampaignResponse,
        { status: 400 }
      );
    }

    // ALWAYS derive platform_id from environment variables - NEVER use from request
    const platformIdResult = getPlatformId(requestData.platform);
    if (!platformIdResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: platformIdResult.message,
          error_code: 'INVALID_INPUT'
        } as AddToCampaignResponse,
        { status: 400 }
      );
    }

    const platform_id = platformIdResult.platform_id!;

    // SCENARIO DETECTION: Check if profile_data already exists
    let profileData;
    
    if (requestData.profile_data) {
      // Clone the profile_data to avoid mutating the original
      profileData = { ...requestData.profile_data };
      
      // CRITICAL FIX 1: Ensure platform field is set from request root
      // The platform is OUTSIDE profile_data, so we must copy it in
      profileData.platform = requestData.platform;
      
      // CRITICAL FIX 2: Ensure provider_source exists (required by storage)
      if (!profileData.provider_source) {
        profileData.provider_source = requestData.preferred_provider || 'nanoinfluencer';
      }
      
      // CRITICAL FIX 3: Ensure fetched_at exists (required by StandardizedProfile)
      if (!profileData.fetched_at) {
        profileData.fetched_at = new Date().toISOString();
        // console.log('Add to Campaign API: Set fetched_at to:', profileData.fetched_at);
      }

      // console.log('Add to Campaign API: Using provided profile_data for:', profileData.username);

    } else {
      // SCENARIO 2: No profile_data - fetch from provider
      try {
        profileData = await profileProviderManager.fetchProfile(
          requestData.username,
          requestData.platform,
          requestData.preferred_provider
        );
        
        console.log('Add to Campaign API: Profile fetched successfully using', profileData.provider_source);
        
      } catch (error: any) {
        console.error('Add to Campaign API: Profile fetch failed:', error);
        
        // Map provider errors to user-friendly messages
        const errorResponse = mapProviderError(error);
        return NextResponse.json(errorResponse, { status: getStatusCode(errorResponse.error_code) });
      }
    }

    // Step 2: Store in campaign influencers table (BOTH scenarios use this)
    try {

      const storageResult = await addInfluencerToCampaignStorage(
        profileData,
        requestData.campaign_list_id,
        platform_id, // ← ALWAYS from getPlatformId(), NEVER from request
        authToken,
        requestData.added_through
      );

      if (!storageResult.success) {
        console.error('Add to Campaign API: Storage failed:', storageResult.message);
        return NextResponse.json(storageResult, { status: 500 });
      }

      console.log('Add to Campaign API: Successfully added influencer to campaign');

      // Return success response
      const successResponse: AddToCampaignResponse = {
        success: true,
        influencer_id: storageResult.influencer_id,
        list_member_id: storageResult.list_member_id,
        provider_used: profileData.provider_source || 'unknown',
        profile_data: profileData,
        message: `Successfully added @${profileData.username || requestData.username} to campaign`
      };

      return NextResponse.json(successResponse, { status: 201 });

    } catch (error) {
      console.error('Add to Campaign API: Storage error:', error);
      
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to add influencer to campaign',
          error_code: 'PROVIDER_ERROR'
        } as AddToCampaignResponse,
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Add to Campaign API: Unexpected error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error_code: 'PROVIDER_ERROR'
      } as AddToCampaignResponse,
      { status: 500 }
    );
  }
}

/**
 * Get platform ID from environment variables based on platform name
 * This is the ONLY source of platform_id - never accept from request
 */
function getPlatformId(platform: string): { 
  success: boolean; 
  platform_id?: string; 
  message?: string 
} {
  const platformMap: Record<string, string | undefined> = {
    'instagram': process.env.NEXT_PUBLIC_INSTAGRAM_PLATFORM_ID,
    'tiktok': process.env.NEXT_PUBLIC_TIKTOK_PLATFORM_ID,
    'youtube': process.env.NEXT_PUBLIC_YOUTUBE_PLATFORM_ID
  };

  const platform_id = platformMap[platform.toLowerCase()];

  if (!platform_id) {
    return {
      success: false,
      message: `Platform configuration missing for ${platform}. Please contact support.`
    };
  }

  return {
    success: true,
    platform_id
  };
}

/**
 * Validate the incoming request
 * Handles both scenarios: with/without profile_data
 * NOTE: platform_id is NOT validated as it's derived server-side
 */
function validateRequest(data: AddToCampaignRequest): { valid: boolean; message?: string } {
  // Check if profile_data exists
  const hasProfileData = !!data.profile_data;
  
  // Get username from either root or profile_data
  const username = data.username || data.profile_data?.username;
  const platform = data.platform || data.profile_data?.platform;

  // SCENARIO 1: Without profile_data - username is required at root level
  if (!hasProfileData && !data.username) {
    return { valid: false, message: 'Username is required when profile_data is not provided' };
  }

  // Platform is always required
  if (!platform) {
    return { valid: false, message: 'Platform is required' };
  }

  if (!['instagram', 'tiktok', 'youtube'].includes(platform.toLowerCase())) {
    return { valid: false, message: 'Platform must be instagram, tiktok, or youtube' };
  }

  // Campaign list ID is always required
  if (!data.campaign_list_id) {
    return { valid: false, message: 'Campaign list ID is required' };
  }

  // platform_id is NOT validated here - it's derived server-side from getPlatformId()
  // Even if client sends platform_id, it will be IGNORED

  // Validate username format only if profile_data is NOT provided
  if (!hasProfileData && username) {
    const cleanUsername = username.replace(/^@/, '');
    if (cleanUsername.length === 0) {
      return { valid: false, message: 'Invalid username format' };
    }

    // Basic username validation (alphanumeric, dots, underscores)
    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      return { valid: false, message: 'Username contains invalid characters' };
    }
  }

  return { valid: true };
}

/**
 * Map provider errors to user-friendly API responses
 */
function mapProviderError(error: any): AddToCampaignResponse {
  const code = error?.code || 'UNKNOWN_ERROR';
  const provider = error?.provider || 'unknown';

  switch (code) {
    case 'USER_NOT_FOUND':
      return {
        success: false,
        message: 'Username not found. Please check the username and try again.',
        error_code: 'USER_NOT_FOUND'
      };

    case 'PRIVATE_PROFILE':
      return {
        success: false,
        message: 'This profile is private and cannot be accessed.',
        error_code: 'PRIVATE_PROFILE'
      };

    case 'RATE_LIMITED':
      return {
        success: false,
        message: 'Service is temporarily busy. Please try again in a few minutes.',
        error_code: 'RATE_LIMITED'
      };

    case 'INVALID_INPUT':
      return {
        success: false,
        message: 'Invalid username format. Please check and try again.',
        error_code: 'INVALID_INPUT'
      };

    case 'NO_PROVIDERS_AVAILABLE':
      return {
        success: false,
        message: 'Service temporarily unavailable for this platform. Please try again later.',
        error_code: 'PROVIDER_ERROR'
      };

    case 'ALL_PROVIDERS_FAILED':
      return {
        success: false,
        message: 'Unable to fetch profile data. Please try again later.',
        error_code: 'PROVIDER_ERROR'
      };

    default:
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        error_code: 'PROVIDER_ERROR'
      };
  }
}

/**
 * Get appropriate HTTP status code for error types
 */
function getStatusCode(errorCode?: string): number {
  switch (errorCode) {
    case 'USER_NOT_FOUND':
      return 404;
    case 'PRIVATE_PROFILE':
      return 403;
    case 'RATE_LIMITED':
      return 429;
    case 'INVALID_INPUT':
      return 400;
    case 'PROVIDER_ERROR':
      return 502;
    default:
      return 500;
  }
}