// src/services/ensembledata/user-detailed-info/instagram.server.ts
// Server-side handler - handles 3rd party API calls and data processing

import { EDClient } from 'ensembledata';
import { 
  ProcessedInstagramData,
  ThirdPartyApiResponse,
  InstagramUserInfo,
  InstagramPostInfo
} from '@/types/user-detailed-info';

/**
 * Safely extract nested data from API response
 */
function safeExtract(obj: any, path: string, defaultValue: any = null): any {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
  } catch {
    return defaultValue;
  }
}

/**
 * Extract user information from Instagram API response
 */
function extractUserInfo(response: ThirdPartyApiResponse): InstagramUserInfo {
  const owner = safeExtract(response, 'data.owner', {});
  
  return {
    user_ig_id: safeExtract(owner, 'id', ''),
    full_name: safeExtract(owner, 'full_name', ''),
    profile_pic_url: safeExtract(owner, 'profile_pic_url', ''),
    username: safeExtract(owner, 'username', ''),
    followers_count: safeExtract(owner, 'edge_followed_by.count'),
    following_count: undefined, // Not available in this response
    posts_count: safeExtract(owner, 'edge_owner_to_timeline_media.count'),
    is_verified: safeExtract(owner, 'is_verified', false),
    is_private: safeExtract(owner, 'is_private', false),
    biography: undefined, // Not available in this response
  };
}

/**
 * Extract post information from Instagram API response
 */
function extractPostInfo(response: ThirdPartyApiResponse): InstagramPostInfo {
  const data = safeExtract(response, 'data', {});
  const caption = safeExtract(data, 'edge_media_to_caption.edges.0.node.text', '');
  
  return {
    post_id: safeExtract(data, 'id', ''),
    shortcode: safeExtract(data, 'shortcode', ''),
    caption: caption,
    created_at: safeExtract(data, 'taken_at_timestamp') 
      ? new Date(safeExtract(data, 'taken_at_timestamp') * 1000).toISOString()
      : new Date().toISOString(),
    video_url: safeExtract(data, 'video_url'),
    view_counts: safeExtract(data, 'video_view_count', 0),
    play_counts: safeExtract(data, 'video_play_count', 0),
    title: safeExtract(data, 'title', caption || ''),
    video_duration: safeExtract(data, 'video_duration'),
    media_preview: safeExtract(data, 'media_preview', ''),
    thumbnail_src: safeExtract(data, 'thumbnail_src', '') || safeExtract(data, 'display_url', ''),
    display_url: safeExtract(data, 'display_url', ''),
    comments_count: safeExtract(data, 'edge_media_to_comment.count', 0) || 
                   safeExtract(data, 'edge_media_to_parent_comment.count', 0),
    likes_count: safeExtract(data, 'edge_media_preview_like.count', 0),
    media_type: safeExtract(data, 'is_video', false) ? 'video' : 'image',
    is_video: safeExtract(data, 'is_video', false),
    has_audio: safeExtract(data, 'has_audio', false),
  };
}

/**
 * Process raw Instagram API response into our standardized format
 */
export function processInstagramResponse(response: ThirdPartyApiResponse): ProcessedInstagramData {
  try {
    console.log('🔄 Server: Processing Instagram API response...');
    
    // Check if response has expected structure
    if (!response.data) {
      throw new Error('Data is missing for the post, please check url or try anotehr.');
    }

    const user = extractUserInfo(response);
    const post = extractPostInfo(response);

    // Validate required fields
    if (!user.username || !post.post_id) {
      throw new Error('Missing required fields in API response');
    }

    console.log('✅ Server: Instagram response processed successfully');
    console.log('📊 Server: Extracted data:', { username: user.username, postId: post.post_id });

    return {
      user,
      post,
      success: true,
      raw_response: response, // Store full response for debugging
    };
  } catch (error) {
    console.error('💥 Server: Error processing Instagram response:', error);
    
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
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process response',
      raw_response: response,
    };
  }
}

/**
 * Timeout wrapper function
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Extract Instagram post code from URL or return the code directly
 * Server-side version for validation
 */
export function extractInstagramPostCode(input: string): string {
  // If it's already a code (no URL format), return as is
  if (!input.includes('/') && !input.includes('instagram.com')) {
    return input;
  }

  // Extract code from various Instagram URL formats
  const patterns = [
    /instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/tv\/([a-zA-Z0-9_-]+)/,
    /\/p\/([a-zA-Z0-9_-]+)/,
    /\/reel\/([a-zA-Z0-9_-]+)/,
    /\/tv\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  throw new Error('Invalid Instagram URL or post code format');
}

/**
 * Server-side function to fetch Instagram post details from 3rd party API
 * This function should ONLY be called from API routes
 */
export async function fetchInstagramPostDetails(postCode: string): Promise<ProcessedInstagramData> {
  try {
    console.log('🔍 Instagram Server: Starting 3rd party API call for post code:', postCode);

    // Get token from server environment
    const token = process.env.ENSEMBLEDATA_AUTH_TOKEN;
    
    if (!token) {
      throw new Error('Instagram API token not configured in server environment');
    }

    // Initialize 3rd party client
    const client = new EDClient({ token });
    console.log('🚀 Instagram Server: Calling 3rd party Instagram API...');

    // Call 3rd party API with timeout (30 seconds)
    // This will only run once, no automatic retries
    const rawResponse = await withTimeout(
      client.instagram.postInfoAndComments({
        code: postCode,
      }),
      30000 // 30 second timeout
    );

    console.log('Instagram Post API Server:', rawResponse);

    // Process the response
    const processedData = processInstagramResponse(rawResponse);
    
    return processedData;

  } catch (error) {
    console.error('💥 Instagram Server: Error calling 3rd party Instagram API:', error);
    
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
        media_type: 'image',
        is_video: false,
      },
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Map processed Instagram data to backend API format
 * Server-side version for consistency
 */
export function mapToBackendFormat(
  processed: ProcessedInstagramData, 
  campaignId: string
): any {
  if (!processed.success) {
    throw new Error('Cannot map failed Instagram data to backend format');
  }

  return {
    campaign_id: campaignId,
    user_ig_id: processed.user.user_ig_id,
    full_name: processed.user.full_name,
    influencer_username: processed.user.username,
    profile_pic_url: processed.user.profile_pic_url,
    post_id: processed.post.post_id,
    title: processed.post.title || processed.post.caption || '',
    view_counts: processed.post.view_counts || 0,
    play_counts: processed.post.play_counts || 0,
    comment_counts: processed.post.comments_count,
    media_preview: processed.post.media_preview || '',
    duration: processed.post.video_duration || 0,
    thumbnail: processed.post.thumbnail_src || processed.post.display_url || '',
    post_created_at: processed.post.created_at,
    post_result_obj: processed.raw_response || {},
  };
}