// src/services/ensembledata/creator-profile/creator-profile.service.ts
// Client-side service for creator profile operations

import {
  CreatorProfileRequest,
  CreatorProfileResponse,
  InstagramUserDetailedInfoRequest,
  EnsembleDataResponse,
  InstagramUserDetailedInfo,
} from '@/types/ensembledata';

/**
 * Fetch creator profile information from our internal API
 * This calls our Next.js API route which then calls the 3rd party API
 */
export async function getCreatorProfile(
  request: CreatorProfileRequest
): Promise<CreatorProfileResponse> {
  try {
    console.log('🔄 Service: Fetching creator profile:', request);

    // Build query parameters for GET request
    const params = new URLSearchParams({
      username: request.username,
      platform: request.platform,
      include_detailed_info: request.include_detailed_info?.toString() || 'true',
    });

    const response = await fetch(`/api/v0/social/creators/profiles?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Remove body for GET request
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ Service: API Error:', response.status, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch creator profile`);
    }

    const data: CreatorProfileResponse = await response.json();

    if (!data.success) {
      console.error('❌ Service: Profile fetch failed:', data.error);
      throw new Error(data.error || 'Failed to fetch creator profile');
    }

    console.log('✅ Service: Creator profile fetched successfully:', data.data?.username);
    return data;

  } catch (error) {
    console.error('💥 Service: Error fetching creator profile:', error);
    throw error;
  }
}

/**
 * Get Instagram user detailed info specifically
 * Convenience method for Instagram profiles
 */
export async function getInstagramUserDetailedInfo(
  username: string,
  options?: {
    include_posts?: boolean;
    include_stories?: boolean;
    include_highlights?: boolean;
  }
): Promise<CreatorProfileResponse> {
  const request: CreatorProfileRequest = {
    username,
    platform: 'instagram',
    include_detailed_info: true,
  };

  return getCreatorProfile(request);
}

/**
 * Extract basic user info from detailed response
 * Utility function to get just basic info if detailed info is not needed
 */
export function extractBasicUserInfo(response: CreatorProfileResponse) {
  if (!response.success || !response.data) {
    return null;
  }

  const influencer = response.data; // This is of type Influencer
  
  return influencer;
}

/**
 * Validate username format
 * Removes @ symbol and validates format
 */
export function validateAndCleanUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required');
  }

  // Remove @ symbol if present
  const cleanUsername = username.replace(/^@/, '').trim();

  if (!cleanUsername) {
    throw new Error('Valid username is required');
  }

  // Basic validation for username format
  if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
    throw new Error('Invalid username format');
  }

  if (cleanUsername.length < 1 || cleanUsername.length > 30) {
    throw new Error('Username must be between 1 and 30 characters');
  }

  return cleanUsername;
}

/**
 * Check if platform is supported
 */
export function isSupportedPlatform(platform: string): platform is 'instagram' | 'youtube' | 'tiktok' {
  return ['instagram', 'youtube', 'tiktok'].includes(platform);
}