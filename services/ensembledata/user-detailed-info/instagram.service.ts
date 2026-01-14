// src/services/ensembledata/user-detailed-info/instagram.service.ts
// Client-side service layer - handles communication with internal API

import { 
  ProcessedInstagramData,
  InstagramPostInput, 
} from '@/types/user-detailed-info';

/**
 * Extract Instagram post code from URL or return the code directly
 * This utility function can be used both client and server side
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
 * Validate Instagram post URL format
 */
export function validateInstagramUrl(url: string): boolean {
  const instagramPatterns = [
    /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?.*$/,
    /^https?:\/\/(www\.)?instagram\.com\/reel\/[a-zA-Z0-9_-]+\/?.*$/,
    /^https?:\/\/(www\.)?instagram\.com\/tv\/[a-zA-Z0-9_-]+\/?.*$/,
  ];

  return instagramPatterns.some(pattern => pattern.test(url));
}

/**
 * Service layer function to get Instagram post details
 * This calls our internal API route, not the 3rd party API directly
 */
export async function getInstagramPostDetails(
  input: InstagramPostInput
): Promise<ProcessedInstagramData> {
  try {
    console.log('🔍 Instagram Service: Starting post details fetch via internal API');
    console.log('📝 Instagram Service: Input:', input);

    // Validate input
    if (!input.url && !input.code) {
      throw new Error('Either URL or post code must be provided');
    }

    // Validate URL format if provided
    if (input.url && !validateInstagramUrl(input.url)) {
      throw new Error('Invalid Instagram URL format');
    }

    console.log('🚀 Instagram Service: Calling internal API route...');

    // Call our internal API route
    const response = await fetch('/api/v0/instagram/post-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Instagram Post API Service:', response);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        message: `API request failed with status ${response.status}` 
      }));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const processedData: ProcessedInstagramData = await response.json();
    
    if (!processedData.success) {
      throw new Error(processedData.message || 'Failed to fetch Instagram data');
    }

    console.log('✅ Instagram Service: Data fetched successfully');
    console.log('📊 Instagram Service: User:', processedData.user.username, 'Post:', processedData.post.post_id);
    
    return processedData;

  } catch (error) {
    console.error('💥 Instagram Service: Error fetching post details:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Return standardized error response
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
 * This remains on the client side as it's just data transformation
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