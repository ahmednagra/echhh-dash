// src/services/insights-iq/posts/posts.client.ts
import { ProcessedInstagramData } from '@/types/user-detailed-info';
import { ContentPlatform } from '@/constants/social-platforms';

interface FetchInstagramPostRequest {
  url?: string;
  code?: string;
  platform?: ContentPlatform;
  preferredProvider?: 'insightiq' | 'ensembledata';
}

/**
 * Client-side service to fetch Instagram post data through Next.js API
 * This follows the pattern established in your project's API flow structure
 * Routes through the existing /api/v0/instagram/post-details endpoint
 */
export async function fetchInstagramPostClient(
  input: FetchInstagramPostRequest
): Promise<ProcessedInstagramData> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('fetchInstagramPostClient can only be called from browser');
    }

    console.log('🔍 InsightIQ Client Service: Fetching Instagram post data...', input);

    const response = await fetch('/api/v0/instagram/post-details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP ${response.status}: Request failed`);
    }

    const result = await response.json();
    console.log('✅ InsightIQ Client Service: Post data received:', result.success);

    return result;

  } catch (error) {
    console.error('💥 InsightIQ Client Service: Error in fetchInstagramPostClient:', error);
    
    // Return error response in expected format
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
      message: error instanceof Error ? error.message : 'Failed to fetch Instagram post data',
    };
  }
}

/**
 * Direct wrapper for the existing getInstagramPostDetails service
 * but with InsightIQ preference
 */
export async function getInstagramPostDetailsWithInsightIQ(
  input: { url?: string; code?: string }
): Promise<ProcessedInstagramData> {
  return fetchInstagramPostClient({
    ...input,
    platform: 'instagram',
    preferredProvider: 'insightiq'
  });
}
