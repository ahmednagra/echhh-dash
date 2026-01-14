// src/services/insights-iq/posts/posts.server.ts
import { ApiRateLimiter } from '@/utils/apiThrottling';
// import { ContentPlatform, getWorkPlatformId } from '@/constants/social-platforms';
import { ContentPlatform, WORK_PLATFORM_IDS } from '@/constants/social-platforms';

// =============================================================================
// CONFIGURATION
// =============================================================================

const INSIGHTIQ_CONFIG = {
  baseUrl: process.env.INSIGHTIQ_BASE_URL || 'https://api.insightiq.ai/v1',
  clientId: process.env.INSIGHTIQ_CLIENT_ID || '',
  clientSecret: process.env.INSIGHTIQ_CLIENT_SECRET || '',
  timeout: 30000,
};

// Debug configuration on load
console.log('🔧 InsightIQ Config Check:');
console.log('Base URL:', INSIGHTIQ_CONFIG.baseUrl);
console.log('Client ID set:', Boolean(INSIGHTIQ_CONFIG.clientId));
console.log('Client Secret set:', Boolean(INSIGHTIQ_CONFIG.clientSecret));

// Rate limiter for InsightIQ - 10 requests per second
const insightIQPostLimiter = new ApiRateLimiter(
  'InsightIQ-Posts',
  600,    // 10 requests per second * 60 seconds = 600 per minute
  100     // 100ms between requests (10 per second)
);

// =============================================================================
// INTERFACES
// =============================================================================

interface InsightIQPostResponse {
  data: Array<{
    work_platform: {
      id: string;
      name: string;
      logo_url: string;
    };
    audio_track_info?: {
      id: string;
      title: string;
      artist: string;
    };
    platform_content_id: string;
    title: string;
    format: string;
    type: string;
    url: string;
    duration?: number;
    description: string;
    thumbnail_url: string;
    media_urls: string[];
    published_at: string;
    engagement: {
      like_count: number;
      comment_count: number;
      view_count: number;
      share_count?: number;
      save_count?: number;
    };
    mentions?: Array<{
      platform_username: string;
      first_name: string;
      image_url: string;
      is_verified: boolean;
    }>;
    hashtags: string[];
    profile: {
      platform_username: string | null;  // UPDATED: Can be null for YouTube
      external_id?: string | null;        // NEW: YouTube channel ID, etc.
      url: string | null;                 // UPDATED: Can be null
      image_url: string | null;           // UPDATED: Can be null
      is_verified: boolean | null;        // UPDATED: Can be null
      follower_count?: number | null;     // NEW: For TikTok/Instagram
      subscriber_count?: number | null;   // NEW: For YouTube
    };
    locations?: Array<{
      name: string;
      longitude: number;
      latitude: number;
      address?: string;
      city?: string;
      country?: string;
    }>;
  }>;
  metadata: {
    offset: number;
    limit: number;
  };
  updated_at: string;
}

export interface ProcessedInsightIQData {
  user: {
    user_ig_id: string;
    full_name: string;
    profile_pic_url: string;
    username: string | null;              // UPDATED: Can be null
    followers_count?: number;
    posts_count?: number;
    is_verified?: boolean;
    external_id?: string | null;          // NEW: Platform-specific ID
    platform_url?: string | null;         // NEW: Profile URL
  };
  post: {
    post_id: string;
    shortcode: string;
    created_at: string;
    comments_count: number;
    likes_count: number;
    shares_count: number;
    media_type: 'image' | 'video';
    is_video: boolean;
    view_counts?: number;
    play_counts?: number;
    video_duration?: number;
    caption?: string;
    title?: string;
    thumbnail_src?: string;
    display_url?: string;
    media_preview?: string;
  };
  success: boolean;
  message?: string;
  raw_response?: any;
  platform?: ContentPlatform;
  provider_used?: string;                 // NEW: Track which provider was used
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  const credentials = `${clientId}:${clientSecret}`;
  return Buffer.from(credentials).toString('base64');
}

function extractShortcodeFromId(id: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(id)) {
    return id;
  }
  return null;
}

function extractShortcodeFromUrl(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /youtube\.com\/watch\?v=([\w-]+)/,
    /youtube\.com\/shorts\/([\w-]+)/,
    /youtu\.be\/([\w-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

// =============================================================================
// AVAILABILITY CHECK
// =============================================================================

export function isInsightIQPostAvailable(): boolean {
  const hasConfig = Boolean(INSIGHTIQ_CONFIG.clientId && INSIGHTIQ_CONFIG.clientSecret);
  console.log('🔍 InsightIQ Availability Check:');
  console.log('Client ID exists:', Boolean(INSIGHTIQ_CONFIG.clientId));
  console.log('Client Secret exists:', Boolean(INSIGHTIQ_CONFIG.clientSecret));
  console.log('Base URL:', INSIGHTIQ_CONFIG.baseUrl);
  console.log('Final result:', hasConfig);
  return hasConfig;
}

// =============================================================================
// RESPONSE PROCESSOR
// =============================================================================

// function processInsightIQPostResponse(
//   response: InsightIQPostResponse,
//   platform: ContentPlatform
// ): ProcessedInsightIQData {
//   try {
//     console.log('🔄 InsightIQ Post Service: Processing API response...');

//     const data = response.data[0];

//     if (!data) {
//       throw new Error('No post data found in response');
//     }

//     const shortcode =
//       extractShortcodeFromId(data.platform_content_id) ||
//       extractShortcodeFromUrl(data.url) ||
//       data.platform_content_id;

//     const user = {
//       user_ig_id: data.profile.platform_username,
//       full_name: data.profile.platform_username,
//       profile_pic_url: data.profile.image_url,
//       username: data.profile.platform_username,
//       followers_count: 0,
//       posts_count: 0,
//       is_verified: data.profile.is_verified,
//     };

//     const post = {
//       post_id: data.platform_content_id,
//       shortcode: shortcode,
//       created_at: data.published_at,
//       comments_count: data.engagement.comment_count || 0,
//       likes_count: data.engagement.like_count || 0,
//       shares_count: data.engagement.share_count || 0,
//       media_type: (data.format === 'VIDEO' ? 'video' : 'image') as 'image' | 'video',
//       is_video: data.format === 'VIDEO',
//       view_counts: data.engagement.view_count || 0,
//       play_counts: data.engagement.view_count || 0,
//       video_duration: data.duration || 0,
//       caption: data.description || data.title || '',
//       title: data.title || '',
//       thumbnail_src: data.thumbnail_url || '',
//       display_url: data.thumbnail_url || '',
//       media_preview: data.thumbnail_url || '',
//     };

//     console.log('✅ InsightIQ Post Service: Response processed successfully');
//     console.log('📊 InsightIQ Post Service: User:', user.username, 'Post:', post.post_id);

//     return {
//       user,
//       post,
//       success: true,
//       raw_response: response,
//       platform,
//     };
//   } catch (error) {
//     console.error('💥 InsightIQ Post Service: Error processing response:', error);
//     throw error;
//   }
// }
function processInsightIQPostResponse(
  response: InsightIQPostResponse,
  platform: ContentPlatform
): ProcessedInsightIQData {
  try {
    console.log('🔄 InsightIQ Post Service: Processing API response...');

    const data = response.data[0];

    if (!data) {
      throw new Error('No post data found in response');
    }

    const shortcode =
      extractShortcodeFromId(data.platform_content_id) ||
      extractShortcodeFromUrl(data.url) ||
      data.platform_content_id;

    // UPDATED: Better extraction for multi-platform support
    // For YouTube: external_id is channel ID, platform_username may be null
    // For TikTok: platform_username is usually available
    // For Instagram: platform_username is the handle
    
    const platformUsername = data.profile.platform_username || 
      extractUsernameFromUrl(data.profile.url) ||
      extractUsernameFromUrl(data.url) ||
      null;
    
    const user = {
      user_ig_id: data.profile.external_id || data.profile.platform_username || data.platform_content_id,
      full_name: data.profile.platform_username || platformUsername || '',
      profile_pic_url: data.profile.image_url || data.thumbnail_url || '',
      username: platformUsername,
      followers_count: data.profile.follower_count || data.profile.subscriber_count || 0,
      posts_count: 0,
      is_verified: data.profile.is_verified || false,
      // NEW: Add platform-specific IDs for matching
      external_id: data.profile.external_id || null,
      platform_url: data.profile.url || data.url || null,
    };

    const post = {
      post_id: data.platform_content_id,
      shortcode: shortcode,
      created_at: data.published_at,
      comments_count: data.engagement.comment_count || 0,
      likes_count: data.engagement.like_count || 0,
      shares_count: data.engagement.share_count || 0,
      media_type: (data.format === 'VIDEO' ? 'video' : 'image') as 'image' | 'video',
      is_video: data.format === 'VIDEO',
      view_counts: data.engagement.view_count || 0,
      play_counts: data.engagement.view_count || 0,
      video_duration: data.duration || 0,
      caption: data.description || data.title || '',
      title: data.title || '',
      thumbnail_src: data.thumbnail_url || '',
      display_url: data.thumbnail_url || '',
      media_preview: data.thumbnail_url || '',
    };

    console.log('✅ InsightIQ Post Service: Response processed successfully');
    console.log('📊 InsightIQ Post Service: User:', user.username || user.external_id, 'Post:', post.post_id);

    return {
      user,
      post,
      success: true,
      raw_response: response,
      platform,
    };
  } catch (error) {
    console.error('💥 InsightIQ Post Service: Error processing response:', error);
    throw error;
  }
}

// NEW: Helper to extract username from URL
function extractUsernameFromUrl(url: string | null): string | null {
  if (!url) return null;
  
  try {
    // YouTube: https://www.youtube.com/@A4a4a4a4a4 or /channel/UC...
    const youtubeMatch = url.match(/youtube\.com\/@([\w.-]+)/i);
    if (youtubeMatch) return youtubeMatch[1];
    
    // TikTok: https://www.tiktok.com/@username
    const tiktokMatch = url.match(/tiktok\.com\/@([\w.-]+)/i);
    if (tiktokMatch) return tiktokMatch[1];
    
    // Instagram: https://www.instagram.com/username
    const instagramMatch = url.match(/instagram\.com\/([\w.-]+)/i);
    if (instagramMatch && !['p', 'reel', 'tv', 'reels'].includes(instagramMatch[1])) {
      return instagramMatch[1];
    }
    
    return null;
  } catch {
    return null;
  }
}

// =============================================================================
// MAIN SERVICE FUNCTION
// =============================================================================

export async function getInsightIQPostDetails(
  input: { url?: string; code?: string; platform?: ContentPlatform }
): Promise<ProcessedInsightIQData> {
  try {
    console.log('🔍 InsightIQ Post Service: Starting post fetch...');

    if (!INSIGHTIQ_CONFIG.clientId || !INSIGHTIQ_CONFIG.clientSecret) {
      throw new Error('InsightIQ credentials not configured');
    }

    if (!input.url && !input.code) {
      throw new Error('Either URL or post code must be provided');
    }

    const platform: ContentPlatform = input.platform || 'instagram';

    let postUrl = input.url;
    if (!postUrl && input.code) {
      postUrl = `https://www.instagram.com/p/${input.code}/`;
    }

    if (!postUrl) {
      throw new Error('Invalid post URL or code');
    }

    console.log('🚀 InsightIQ Post Service: Calling InsightIQ API...');
    console.log('🔗 URL:', postUrl);
    console.log('📱 Platform:', platform);

    const response = await insightIQPostLimiter.throttledRequest(
      async () => {
        const requestUrl = `${INSIGHTIQ_CONFIG.baseUrl}/social/creators/contents/fetch`;
        console.log('📍 Full API URL:', requestUrl);

        const basicAuth = createBasicAuthHeader(
          INSIGHTIQ_CONFIG.clientId,
          INSIGHTIQ_CONFIG.clientSecret
        );

        const requestBody = {
          content_url: postUrl,
          work_platform_id: WORK_PLATFORM_IDS[platform.toUpperCase() as keyof typeof WORK_PLATFORM_IDS],
        };

        console.log('📦 Request body:', requestBody);

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(INSIGHTIQ_CONFIG.timeout),
        });

        console.log('📊 Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);

          if (response.status === 429) {
            const retryAfter = response.headers.get('Retry-After');
            throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
          }

          try {
            const errorData = JSON.parse(errorText);
            if (errorData.error?.message) {
              throw new Error(errorData.error.message);
            }
          } catch {
            // If parsing fails, use original error text
          }

          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return response.json();
      },
      {
        maxRetries: 3,
        retryDelay: 2000,
        shouldRetry: (error) => {
          return (
            error?.status === 429 ||
            error?.status === 502 ||
            error?.status === 503 ||
            error?.status === 504
          );
        },
      }
    );

    console.log('✅ InsightIQ Post API Response received');

    if (!response.data || response.data.length === 0) {
      throw new Error('Post not found or no data returned from InsightIQ');
    }

    return processInsightIQPostResponse(response, platform);
  } catch (error) {
    console.error('💥 InsightIQ Post Service: Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      user: {
        user_ig_id: '',
        full_name: '',
        profile_pic_url: '',
        username: '',
      },
      post: {
        post_id: '',
        shortcode: '',
        created_at: new Date().toISOString(),
        comments_count: 0,
        likes_count: 0,
        shares_count: 0,
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: errorMessage,
    };
  }
}

// =============================================================================
// BACKEND FORMAT MAPPER
// =============================================================================

export function mapInsightIQToBackendFormat(
  processed: ProcessedInsightIQData,
  campaignId: string
): any {
  if (!processed.success) {
    throw new Error('Cannot map failed InsightIQ data to backend format');
  }

  const rawData = processed.raw_response?.data?.[0];

  return {
    campaign_id: campaignId,
    user_ig_id: processed.user.user_ig_id,
    full_name: processed.user.full_name,
    influencer_username: processed.user.username,
    profile_pic_url: processed.user.profile_pic_url,
    post_id: processed.post.post_id,
    title: processed.post.title || processed.post.caption || '',
    view_counts: processed.post.view_counts || 0,
    views_count: processed.post.view_counts || 0,
    play_counts: processed.post.play_counts || 0,
    plays_count: processed.post.play_counts || 0,
    comment_counts: processed.post.comments_count,
    comments_count: processed.post.comments_count,
    likes_count: processed.post.likes_count,
    shares_count: processed.post.shares_count,
    followers_count: processed.user.followers_count || 0,
    collaboration_price: 0,
    media_preview: processed.post.media_preview || '',
    duration: processed.post.video_duration || 0,
    thumbnail: processed.post.thumbnail_src || processed.post.display_url || '',
    post_created_at: processed.post.created_at,
    post_result_obj: {
      success: true,
      data: {
        id: processed.post.post_id,
        shortcode: processed.post.shortcode,
        display_url: processed.post.display_url || processed.post.thumbnail_src,
        thumbnail_src: processed.post.thumbnail_src,
        is_video: processed.post.is_video,
        video_url: rawData?.media_url || null,
        video_duration: processed.post.video_duration || 0,
        video_play_count: processed.post.view_counts || 0,
        video_view_count: processed.post.view_counts || 0,
        taken_at_timestamp: new Date(processed.post.created_at).getTime() / 1000,
        edge_media_preview_like: {
          count: processed.post.likes_count,
        },
        edge_liked_by: {
          count: processed.post.likes_count,
        },
        edge_media_to_comment: {
          count: processed.post.comments_count,
        },
        edge_media_preview_comment: {
          count: processed.post.comments_count,
        },
        edge_media_to_share: {
          count: processed.post.shares_count,
        },
        shares_count: processed.post.shares_count,
        owner: {
          id: processed.user.user_ig_id,
          username: processed.user.username,
          full_name: processed.user.full_name,
          profile_pic_url: processed.user.profile_pic_url,
          is_verified: processed.user.is_verified || false,
          edge_followed_by: {
            count: processed.user.followers_count || 0,
          },
        },
        edge_media_to_caption: {
          edges: [
            {
              node: {
                text: processed.post.caption || processed.post.title || '',
              },
            },
          ],
        },
      },
    },
  };
}