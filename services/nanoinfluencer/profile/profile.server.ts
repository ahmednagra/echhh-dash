// src/services/nanoinfluencer/profile/profile.server.ts
// Server service for NanoInfluencer profile API (called from NextJS API routes)

import { StandardizedProfile } from '@/types/campaign-influencers';
import { ApiRateLimiter } from '@/utils/apiThrottling';

// NanoInfluencer configuration
const NANOINFLUENCER_CONFIG = {
  baseUrl: process.env.NANOINFLUENCER_BASE_URL || 'https://api.nanoinfluencer.com',
  apiKey: process.env.NANOINFLUENCER_API_KEY || '',
  timeout: 30000,
};

// Rate limiter for NanoInfluencer - conservative settings since limits are unknown
const nanoInfluencerLimiter = new ApiRateLimiter(
  'NanoInfluencer',
  30,    // 30 requests per minute (conservative)
  5000   // 5 seconds between requests
);

/**
 * Custom ProviderError class for NanoInfluencer - EXPORTED
 */
export class NanoInfluencerProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
    public should_retry: boolean
  ) {
    super(message);
    this.name = 'NanoInfluencerProviderError';
  }
}

/**
 * Fetch profile data from NanoInfluencer API (server-side)
 */
export async function fetchNanoInfluencerProfileServer(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube'
): Promise<StandardizedProfile> {
  try {
    console.log(`NanoInfluencer Server: Fetching profile for ${username} on ${platform}`);

    // Validate configuration
    if (!NANOINFLUENCER_CONFIG.apiKey) {
      throw new NanoInfluencerProviderError('API_CONFIG_ERROR', 'NanoInfluencer API key not configured', 'nanoinfluencer', false);
    }

    // Construct profile URL
    const profileUrl = constructProfileUrl(username, platform);
    console.log(`NanoInfluencer Server: Profile URL: ${profileUrl}`);

    // Use rate limiter
    const response = await nanoInfluencerLimiter.throttledRequest(async () => {
      const requestUrl = `${NANOINFLUENCER_CONFIG.baseUrl}/get_data_by_url?url=${encodeURIComponent(profileUrl)}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${NANOINFLUENCER_CONFIG.apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(NANOINFLUENCER_CONFIG.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    }, {
      maxRetries: 3,
      retryDelay: 10000,
      shouldRetry: (error) => {
        // Retry on rate limits or temporary errors
        return error?.status === 429 || 
               error?.status === 502 || 
               error?.status === 503 || 
               error?.status === 504;
      }
    });

    // Validate response
    if (response.code !== 200) {
      throw new NanoInfluencerProviderError(
        mapNanoInfluencerErrorCode(response.code),
        response.message || 'NanoInfluencer API error',
        'nanoinfluencer',
        shouldRetryNanoInfluencerError(response.code)
      );
    }

    if (!response.data) {
      throw new NanoInfluencerProviderError('NO_DATA', 'No profile data received from NanoInfluencer', 'nanoinfluencer', false);
    }

    console.log(`NanoInfluencer Server: Successfully fetched profile for ${username}`);

    // Transform to standardized format
    return transformNanoInfluencerDataServer(response.data, platform, username);

  } catch (error) {
    console.error('NanoInfluencer Server: Error fetching profile:', error);
    
    if (error instanceof NanoInfluencerProviderError) {
      throw error;
    }
    
    // Convert generic errors to NanoInfluencerProviderError
    throw new NanoInfluencerProviderError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred',
      'nanoinfluencer',
      false
    );
  }
}

/**
 * Construct profile URL based on platform and username
 */
function constructProfileUrl(username: string, platform: string): string {
  const cleanUsername = username.replace(/^@/, '');
  
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${cleanUsername}/`;
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanUsername}`;
    case 'youtube':
      return `https://www.youtube.com/@${cleanUsername}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Transform NanoInfluencer data to standardized profile format (server version)
 */
function transformNanoInfluencerDataServer(data: any, platform: string, originalUsername: string): StandardizedProfile {
  return {
    id: data.uid || data.id || `${platform}_${originalUsername}`,
    username: data.username || originalUsername,
    name: data.name || data.username || originalUsername,
    profileImage: data.avatar || '',
    followers: data.subsCount || 0,
    following_count: data.followingCount || 0,
    engagementRate: data.erMedian ? data.erMedian * 100 : 0,
    isVerified: Boolean(data.isVerified),
    age_group: null,
    average_likes: data.likesMedian || 0,
    average_views: data.viewsMedian || null,
    contact_details: data.email ? data.email.map((email: any) => ({
      type: 'email',
      value: email.value,
      contact_type: email.type?.toLowerCase() || 'unknown',
      is_primary: email.type === 'PUBLIC'
    })) : [],
    content_count: data.postCount || null,
    creator_location: {
      country: data.country || undefined,
      city: undefined,
      state: undefined
    },
    external_id: data.uid || data.id || `${platform}_${originalUsername}`,
    gender: data.gender || '',
    introduction: data.title || data.desc || '',
    language: detectLanguageFromContent(data.title, data.desc),
    platform_account_type: data.accountType || 'personal',
    subscriber_count: data.subsCount || null,
    url: constructProfileUrl(data.username || originalUsername, platform),
    provider_source: 'nanoinfluencer',
    fetched_at: new Date().toISOString(),
    
    // New optional fields
    type: data.type,
    platform: data.platform,
    lastPostDate: data.lastPostDate,
    postPerMonth: data.postPerMonth,
    commentsMedian: data.commentsMedian,
    sharesMedian: data.sharesMedian,
    favoritesMedian: data.favoritesMedian,
    vrMedian: data.vrMedian,
    isPrivate: data.isPrivate,
    topics: data.topics,
    audiences: data.audiences,
    links: data.links,
    desc: data.desc
  };
}

/**
 * Map NanoInfluencer error codes to standard error codes
 */
function mapNanoInfluencerErrorCode(code: number): string {
  switch (code) {
    case 400:
      return 'INVALID_INPUT';
    case 404:
      return 'USER_NOT_FOUND';
    case 403:
      return 'PRIVATE_PROFILE';
    case 429:
      return 'RATE_LIMITED';
    case 500:
    case 502:
    case 503:
    case 504:
      return 'PROVIDER_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Determine if NanoInfluencer error should be retried
 */
function shouldRetryNanoInfluencerError(code: number): boolean {
  return [429, 500, 502, 503, 504].includes(code);
}

/**
 * Simple language detection from content
 */
function detectLanguageFromContent(title?: string, desc?: string): string {
  const content = `${title || ''} ${desc || ''}`.toLowerCase();
  
  // Very basic language detection - could be enhanced
  if (/[\u0600-\u06FF]/.test(content)) return 'ar'; // Arabic
  if (/[\u4e00-\u9fff]/.test(content)) return 'zh'; // Chinese
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(content)) return 'ja'; // Japanese
  if (/[\u0400-\u04FF]/.test(content)) return 'ru'; // Russian
  
  return 'en'; // Default to English
}

/**
 * Check if NanoInfluencer service is available
 */
export function isNanoInfluencerAvailable(): boolean {
  return Boolean(NANOINFLUENCER_CONFIG.apiKey);
}