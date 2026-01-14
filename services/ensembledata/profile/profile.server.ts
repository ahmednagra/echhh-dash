// src/services/ensembledata/profile/profile.server.ts
// Updated server service for EnsembleData profile API with provider pattern

import { StandardizedProfile } from '@/types/campaign-influencers';
import { ApiRateLimiter } from '@/utils/apiThrottling';

// EnsembleData configuration
const ENSEMBLEDATA_CONFIG = {
  baseUrl: process.env.ENSEMBLEDATA_BASE_API || 'https://ensembledata.com/apis',
  token: process.env.ENSEMBLEDATA_AUTH_TOKEN || '',
  timeout: 30000,
};

// Rate limiter for EnsembleData - no rate limit specified, so using generous settings
const ensembleDataLimiter = new ApiRateLimiter(
  'EnsembleData',
  60,    // 60 requests per minute
  1000   // 1 second between requests
);

/**
 * Custom ProviderError class for EnsembleData
 */
export class EnsembleDataProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
    public should_retry: boolean
  ) {
    super(message);
    this.name = 'EnsembleDataProviderError';
  }
}

/**
 * Fetch profile data from EnsembleData API (server-side)
 */
export async function fetchEnsembleDataProfileServer(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube'
): Promise<StandardizedProfile> {
  try {
    console.log(`EnsembleData Server: Fetching profile for ${username} on ${platform}`);

    // Validate configuration
    if (!ENSEMBLEDATA_CONFIG.token) {
      throw new ProviderError('API_CONFIG_ERROR', 'EnsembleData token not configured', 'ensembledata', false);
    }

    // Only Instagram is supported by EnsembleData currently
    if (platform !== 'instagram') {
      throw new ProviderError('UNSUPPORTED_PLATFORM', `Platform ${platform} not supported by EnsembleData`, 'ensembledata', false);
    }

    // Use rate limiter
    const response = await ensembleDataLimiter.throttledRequest(async () => {
      const params = new URLSearchParams({
        username: username.replace(/^@/, ''), // Remove @ if present
        token: ENSEMBLEDATA_CONFIG.token,
      });

      const requestUrl = `${ENSEMBLEDATA_CONFIG.baseUrl}/instagram/user/detailed-info?${params.toString()}`;
      
      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(ENSEMBLEDATA_CONFIG.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return response.json();
    }, {
      maxRetries: 3,
      retryDelay: 5000,
      shouldRetry: (error) => {
        // EnsembleData doesn't have rate limits, but retry on server errors
        return error?.status === 500 || 
               error?.status === 502 || 
               error?.status === 503 || 
               error?.status === 504;
      }
    });

    // Handle EnsembleData specific error codes
    if (!response.data) {
      const statusCode = response.status || 500;
      throw new ProviderError(
        mapEnsembleDataErrorCode(statusCode),
        getEnsembleDataErrorMessage(statusCode, response.detail),
        'ensembledata',
        shouldRetryEnsembleDataError(statusCode)
      );
    }

    console.log(`EnsembleData Server: Successfully fetched profile for ${username}`);

    // Transform to standardized format
    return transformEnsembleDataToStandardized(response.data, platform, username);

  } catch (error) {
    console.error('EnsembleData Server: Error fetching profile:', error);
    
    if (error instanceof ProviderError) {
      throw error;
    }
    
    // Convert generic errors to ProviderError
    throw new ProviderError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Unknown error occurred',
      'ensembledata',
      false
    );
  }
}

/**
 * Transform EnsembleData response to standardized profile format
 */
function transformEnsembleDataToStandardized(data: any, platform: string, originalUsername: string): StandardizedProfile {
  // Calculate engagement rate from recent posts if available
  let engagementRate = 0;
  if (data.edge_owner_to_timeline_media?.edges && data.edge_owner_to_timeline_media.edges.length > 0) {
    const recentPosts = data.edge_owner_to_timeline_media.edges.slice(0, 12);
    const totalEngagement = recentPosts.reduce((sum: number, post: any) => {
      const likes = post.node.edge_liked_by?.count || 0;
      const comments = post.node.edge_media_to_comment?.count || 0;
      return sum + likes + comments;
    }, 0);
    
    const avgEngagementPerPost = totalEngagement / recentPosts.length;
    const followerCount = data.edge_followed_by?.count || 1;
    engagementRate = (avgEngagementPerPost / followerCount) * 100;
  }

  return {
    id: data.id || `instagram_${originalUsername}`,
    username: data.username || originalUsername,
    name: data.full_name || data.username || originalUsername,
    profileImage: cleanInstagramUrl(data.profile_pic_url_hd || data.profile_pic_url || ''),
    followers: data.edge_followed_by?.count || 0,
    following_count: data.edge_follow?.count || 0,
    engagementRate: engagementRate,
    isVerified: Boolean(data.is_verified),
    age_group: null,
    average_likes: calculateAverageLikes(data.edge_owner_to_timeline_media?.edges),
    average_views: null, // EnsembleData doesn't provide video views in detailed info
    contact_details: [], // EnsembleData doesn't provide contact details
    content_count: data.edge_owner_to_timeline_media?.count || null,
    creator_location: undefined, // EnsembleData doesn't provide location data
    external_id: data.id,
    gender: '', // EnsembleData doesn't provide gender
    introduction: data.biography || '',
    language: detectLanguageFromBio(data.biography),
    platform_account_type: data.is_business_account ? 'business' : 'personal',
    subscriber_count: data.edge_followed_by?.count || null,
    url: `https://www.instagram.com/${data.username || originalUsername}/`,
    provider_source: 'ensembledata',
    fetched_at: new Date().toISOString()
  };
}

/**
 * Clean Instagram URLs to prevent database constraints issues
 */
function cleanInstagramUrl(url: string): string {
  if (!url) return '';
  
  try {
    const urlObj = new URL(url);
    
    // For Instagram CDN URLs, remove problematic long parameters
    if (url.includes('fbcdn.net') || url.includes('instagram.')) {
      const paramsToRemove = ['efg', '_nc_gid', '_nc_oc', '_nc_ohc', 'oh', 'edm'];
      paramsToRemove.forEach(param => {
        urlObj.searchParams.delete(param);
      });
      return urlObj.toString();
    }
    
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch (error) {
    // If URL parsing fails, truncate the original URL
    return url.length > 255 ? url.substring(0, 255) : url;
  }
}

/**
 * Calculate average likes from recent posts
 */
function calculateAverageLikes(posts: any[]): number {
  if (!posts || posts.length === 0) return 0;
  
  const recentPosts = posts.slice(0, 12);
  const totalLikes = recentPosts.reduce((sum: number, post: any) => {
    return sum + (post.node.edge_liked_by?.count || 0);
  }, 0);
  
  return Math.round(totalLikes / recentPosts.length);
}

/**
 * Simple language detection from biography
 */
function detectLanguageFromBio(bio?: string): string {
  if (!bio) return 'en';
  
  const content = bio.toLowerCase();
  
  // Basic language detection
  if (/[\u0600-\u06FF]/.test(content)) return 'ar';
  if (/[\u4e00-\u9fff]/.test(content)) return 'zh';
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(content)) return 'ja';
  if (/[\u0400-\u04FF]/.test(content)) return 'ru';
  
  return 'en';
}

/**
 * Map EnsembleData status codes to standard error codes
 */
function mapEnsembleDataErrorCode(statusCode: number): string {
  switch (statusCode) {
    case 422:
      return 'INVALID_INPUT';
    case 463:
      return 'USER_NOT_FOUND';
    case 491:
      return 'PROVIDER_ERROR'; // Token not found
    case 492:
      return 'PROVIDER_ERROR'; // Email not verified
    case 493:
      return 'PROVIDER_ERROR'; // Subscription expired
    case 495:
      return 'RATE_LIMITED'; // Daily units used
    case 500:
      return 'PROVIDER_ERROR';
    default:
      return 'UNKNOWN_ERROR';
  }
}

/**
 * Get user-friendly error message for EnsembleData errors
 */
function getEnsembleDataErrorMessage(statusCode: number, detail?: string): string {
  switch (statusCode) {
    case 422:
      return 'Invalid username format';
    case 463:
      return 'Username not found or account may be private';
    case 491:
      return 'Service configuration error';
    case 492:
      return 'Service account verification required';
    case 493:
      return 'Service subscription has expired';
    case 495:
      return 'Daily API limit exceeded, please try again tomorrow';
    case 500:
      return 'Service temporarily unavailable';
    default:
      return detail || 'Unknown error occurred';
  }
}

/**
 * Determine if EnsembleData error should be retried
 */
function shouldRetryEnsembleDataError(statusCode: number): boolean {
  // Only retry on server errors, not on client errors or quota limits
  return [500, 502, 503, 504].includes(statusCode);
}

/**
 * Check if EnsembleData service is available
 */
export function isEnsembleDataAvailable(): boolean {
  return Boolean(ENSEMBLEDATA_CONFIG.token);
}

/**
 * Custom ProviderError class for EnsembleData
 */
class ProviderError extends Error {
  constructor(
    public code: string,
    message: string,
    public provider: string,
    public should_retry: boolean
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}