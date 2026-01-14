// src/app/api/v0/creator-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { profileProviderManager } from '@/services/providers/profile-manager.server';
import { extractBearerToken } from '@/lib/auth-utils';

// POST /api/v0/creator-profile - Get creator profile using Provider Manager
export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/v0/creator-profile - Using Provider Manager');

    // Get auth token (optional for now)
    const authToken = extractBearerToken(request);
    
    // Parse request body
    const body = await request.json();
    console.log('Profile request:', {
      username: body.username,
      platform: body.platform,
      include_detailed_info: body.include_detailed_info,
      preferredProvider: body.preferredProvider
    });

    // Validate required fields
    if (!body.username) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username is required',
          message: 'Please provide a username' 
        },
        { status: 400 }
      );
    }

    if (!body.platform) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Platform is required',
          message: 'Please specify a platform (instagram, youtube, tiktok)' 
        },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['instagram', 'tiktok', 'youtube'];
    if (!validPlatforms.includes(body.platform.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid platform',
          message: 'Platform must be one of: instagram, tiktok, youtube' 
        },
        { status: 400 }
      );
    }

    // Clean username
    const cleanUsername = body.username.replace(/^@/, '').trim();
    const platform = body.platform.toLowerCase() as 'instagram' | 'tiktok' | 'youtube';

    // Use the provider manager to fetch profile
    console.log(`Using Provider Manager for @${cleanUsername} on ${platform}`);
    
    const profile = await profileProviderManager.fetchProfile(
      cleanUsername,
      platform,
      body.preferredProvider // Optional provider override from env or request
    );

    console.log(`Successfully fetched profile using provider manager`);
    
    return NextResponse.json({
      success: true,
      data: profile,
      message: `Profile data retrieved for @${cleanUsername}`,
      provider_used: 'managed' // Indicates it used the provider manager
    });

  } catch (error) {
    console.error('Error in creator-profile API:', error);
    
    // Handle ProfileManagerError specifically
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ProfileManagerError') {
      const providerError = error as any;
      
      const statusMap: Record<string, number> = {
        'USER_NOT_FOUND': 404,
        'PRIVATE_PROFILE': 403,
        'RATE_LIMITED': 429,
        'INVALID_INPUT': 400,
        'NO_PROVIDERS_AVAILABLE': 503,
        'ALL_PROVIDERS_FAILED': 502,
        'API_CONFIG_ERROR': 503,
        'PROVIDER_ERROR': 502
      };
      
      const status = statusMap[providerError.code] || 500;
      
      return NextResponse.json(
        {
          success: false,
          error: providerError.code,
          message: providerError.message,
          provider: providerError.provider
        },
        { status }
      );
    }

    // Handle NanoInfluencer and EnsembleData provider errors
    if (error && typeof error === 'object' && 'code' in error) {
      const providerError = error as any;
      
      const statusMap: Record<string, number> = {
        'USER_NOT_FOUND': 404,
        'PRIVATE_PROFILE': 403,
        'RATE_LIMITED': 429,
        'INVALID_INPUT': 400,
        'API_CONFIG_ERROR': 503,
        'PROVIDER_ERROR': 502
      };
      
      const status = statusMap[providerError.code] || 500;
      
      return NextResponse.json(
        {
          success: false,
          error: providerError.code || 'PROVIDER_ERROR',
          message: providerError.message || 'Provider error occurred'
        },
        { status }
      );
    }

    // Handle standard errors
    if (error instanceof Error) {
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Profile not found',
            message: error.message
          },
          { status: 404 }
        );
      }
      
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Rate limit exceeded',
            message: 'Please wait before making more requests'
          },
          { status: 429 }
        );
      }

      if (error.message.includes('private') || error.message.includes('403')) {
        return NextResponse.json(
          {
            success: false,
            error: 'Private profile',
            message: 'This profile is private or restricted'
          },
          { status: 403 }
        );
      }
    }

    // Generic error fallback
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile data';
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

// GET /api/v0/creator-profile - Alternative GET endpoint using Provider Manager
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/v0/creator-profile - Using Provider Manager via query params');

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const platform = searchParams.get('platform') || 'instagram';
    const includeDetailedInfo = searchParams.get('include_detailed_info') === 'true';
    const preferredProvider = searchParams.get('preferredProvider') as 'nanoinfluencer' | 'ensembledata' | null;

    if (!username) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Username is required',
          message: 'Please provide a username in query parameters' 
        },
        { status: 400 }
      );
    }

    // Validate platform
    const validPlatforms = ['instagram', 'tiktok', 'youtube'];
    if (!validPlatforms.includes(platform.toLowerCase())) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid platform',
          message: 'Platform must be one of: instagram, tiktok, youtube' 
        },
        { status: 400 }
      );
    }

    // Clean username
    const cleanUsername = username.replace(/^@/, '').trim();
    const validatedPlatform = platform.toLowerCase() as 'instagram' | 'tiktok' | 'youtube';

    // Use the provider manager
    console.log(`Using Provider Manager for @${cleanUsername} on ${validatedPlatform}`);
    
    const profile = await profileProviderManager.fetchProfile(
      cleanUsername,
      validatedPlatform,
      preferredProvider || undefined
    );

    console.log(`Successfully fetched profile via GET using provider manager`);
    
    return NextResponse.json({
      success: true,
      data: profile,
      message: `Profile data retrieved for @${cleanUsername}`,
      provider_used: 'managed'
    });

  } catch (error) {
    console.error('Error in GET creator-profile:', error);
    
    // Handle ProfileManagerError specifically
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ProfileManagerError') {
      const providerError = error as any;
      
      const statusMap: Record<string, number> = {
        'USER_NOT_FOUND': 404,
        'PRIVATE_PROFILE': 403,
        'RATE_LIMITED': 429,
        'INVALID_INPUT': 400,
        'NO_PROVIDERS_AVAILABLE': 503,
        'ALL_PROVIDERS_FAILED': 502,
        'API_CONFIG_ERROR': 503,
        'PROVIDER_ERROR': 502
      };
      
      const status = statusMap[providerError.code] || 500;
      
      return NextResponse.json(
        {
          success: false,
          error: providerError.code,
          message: providerError.message,
          provider: providerError.provider
        },
        { status }
      );
    }

    // Generic error fallback
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile data';
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: errorMessage
      },
      { status: 500 }
    );
  }
}