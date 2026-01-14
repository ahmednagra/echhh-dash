// src/app/api/v0/profiles/lookup/route.ts
// Simple API route to fetch and return profile data without storage

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { profileProviderManager } from '@/services/providers/profile-manager.server';

export async function POST(request: NextRequest) {
  try {
    // Extract authentication token
    // const authToken = extractBearerToken(request);
    
    // if (!authToken) {
    //   return NextResponse.json(
    //     { 
    //       success: false,
    //       message: 'Authentication token is required',
    //       error_code: 'INVALID_INPUT'
    //     },
    //     { status: 401 }
    //   );
    // }

    // Parse request body
    const requestData = await request.json();

    console.log('Profile Lookup API: Received request:', requestData);
    
    // Validate required fields
    const validation = validateRequest(requestData);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
          error_code: 'INVALID_INPUT'
        },
        { status: 400 }
      );
    }

    console.log('Profile Lookup API: Processing request:', {
      username: requestData.username,
      platform: requestData.platform,
      preferred_provider: requestData.preferred_provider
    });

    // Fetch profile from providers (same as add-to-campaign, but WITHOUT storage)
    try {
      const profileData = await profileProviderManager.fetchProfile(
        requestData.username,
        requestData.platform,
        requestData.preferred_provider
      );
      
    //   console.log('Profile Lookup API: Profile fetched successfully using', profileData.provider_source);
      
      // Return profile data directly - NO STORAGE
      return NextResponse.json({
        success: true,
        profile: profileData,
        // provider_used: profileData.provider_source,
        message: `Successfully retrieved profile for @${requestData.username}`
      }, { status: 200 });

    } catch (error: any) {
      console.error('Profile Lookup API: Profile fetch failed:', error);
      
      // Use same error mapping as add-to-campaign
      const errorResponse = mapProviderError(error);
      return NextResponse.json(errorResponse, { status: getStatusCode(errorResponse.error_code) });
    }

  } catch (error) {
    console.error('Profile Lookup API: Unexpected error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error_code: 'PROVIDER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * Validate the incoming request
 */
function validateRequest(data: any): { valid: boolean; message?: string } {
  if (!data.username) {
    return { valid: false, message: 'Username is required' };
  }

  if (!data.platform) {
    return { valid: false, message: 'Platform is required' };
  }

  if (!['instagram', 'tiktok', 'youtube'].includes(data.platform)) {
    return { valid: false, message: 'Platform must be instagram, tiktok, or youtube' };
  }

  // Validate username format
  const cleanUsername = data.username.replace(/^@/, '');
  if (cleanUsername.length === 0) {
    return { valid: false, message: 'Invalid username format' };
  }

  // Basic username validation (alphanumeric, dots, underscores)
  if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
    return { valid: false, message: 'Username contains invalid characters' };
  }

  return { valid: true };
}

/**
 * Map provider errors to user-friendly API responses (same as add-to-campaign)
 */
function mapProviderError(error: any): any {
  const code = error?.code || 'UNKNOWN_ERROR';

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