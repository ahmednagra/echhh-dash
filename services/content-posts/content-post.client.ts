// src/services/content-posts/content-post.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { ContentPostCreate, ContentPostResponse } from '@/types/content-post';
import { ContentPostUpdatePayload } from '@/components/dashboard/campaign-funnel/result/types';


const API_VERSION = '/api/v0';

/**
 * Validate browser environment and authentication token
 * @throws Error if not in browser or no token found
 */
function validateBrowserAndAuth(functionName: string): void {
  if (typeof window === 'undefined') {
    throw new Error(`${functionName} can only be called from browser`);
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
}

/**
 * Extract shortcode from Instagram URL
 */
function extractShortcodeFromUrl(url: string): string | null {
  if (!url) return null;
  const instagramRegex = /(?:instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+))/;
  const match = url.match(instagramRegex);
  return match ? match[1] : null;
}


/**
 * Create a new content post
 */
export async function createContentPost(
  data: ContentPostCreate,
): Promise<ContentPostResponse> {
  try {
    validateBrowserAndAuth('createContentPost');

    const endpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.CREATE;

    console.log(`📞 Client Service: Creating content post at ${endpoint}`);

    const response = await nextjsApiClient.post<ContentPostResponse>(
      endpoint,
      data,
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log(`✅ Client Service: Content post created successfully`);

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createContentPost:', error);
    throw error;
  }
}

/**
 * Get all content posts with optional filters
 */
export async function getContentPosts(params?: {
  campaign_id?: string;
  influencer_id?: string;
}): Promise<ContentPostResponse[]> {
  try {
    validateBrowserAndAuth('getContentPosts');

    let endpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.GET_ALL;

    if (params) {
      const queryParams = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined) as [
          string,
          string,
        ][],
      ).toString();

      if (queryParams) {
        endpoint += `?${queryParams}`;
      }
    }

    console.log(`📞 Client Service: Fetching content posts at ${endpoint}`);

    const response = await nextjsApiClient.get<ContentPostResponse[]>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log(`✅ Client Service: Fetched ${response.data.length} content posts`);

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getContentPosts:', error);
    throw error;
  }
}

/**
 * Paginated response interface for campaign content posts
 */
interface PaginatedContentPostsResponse {
  items: ContentPostResponse[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

/**
 * Get content posts by campaign ID with pagination
 * Transforms backend response to frontend VideoResult format
 */
export async function getContentPostsByCampaign(
  campaignId: string,
  page: number = 1,
  limit: number = 200,
): Promise<any[]> {
  try {
    validateBrowserAndAuth('getContentPostsByCampaign');

    if (!campaignId || campaignId.trim() === '') {
      throw new Error('Valid campaign ID is required');
    }

    // Build endpoint using ENDPOINTS constant
    const baseEndpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.UPDATE_ALL_BY_CAMPAIGN(campaignId);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    }).toString();

    const endpoint = `${baseEndpoint}?${queryParams}`;

    console.log(`📞 Client Service: Fetching campaign content posts at ${endpoint}`);

    const response = await nextjsApiClient.get<PaginatedContentPostsResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data || !response.data.items || !Array.isArray(response.data.items)) {
      console.log('⚠️ Client Service: No content posts found');
      return [];
    }

    console.log(`✅ Client Service: Fetched ${response.data.items.length} content posts`);

    // Transform backend format to frontend VideoResult format
    const transformedResults = response.data.items.map((post: any) => ({
      id: post.id,
      campaign_id: post.campaign_id,
      campaign_influencer_id: post.campaign_influencer_id,
      influencer_username: post.influencer?.username || '',
      full_name: post.influencer?.full_name || '',
      profile_pic_url: post.influencer?.img_url || '',
      user_ig_id: post.platform_post_id || '',
      is_verified: false,
      followers_count: post.influencer?.followers || 0,
      likes_count: post.engagement?.like_count || 0,
      comments_count: post.engagement?.comment_count || 0,
      shares_count: post.engagement?.share_count || 0,
      views_count: post.engagement?.view_count || 0,
      plays_count: post.engagement?.view_count || 0,
      post_id: post.platform_post_id,
      shortcode: extractShortcodeFromUrl(post.content_url) || '',
      title: post.title || '',
      description: post.caption || '',
      content_url: post.content_url,
      media_preview: post.thumbnail_url,
      media_url: post.media_url,
      thumbnail: post.thumbnail_url,
      thumbnail_url: post.thumbnail_url,
      duration: parseFloat(post.duration || '0'),
      content_type: post.content_type,
      content_format: post.content_format,
      posted_at: post.posted_at,
      post_created_at: post.posted_at,
      created_at: post.created_at,
      updated_at: post.updated_at,
      collaboration_price: post.influencer?.collaboration_price || 0,
      initial_metadata: post.initial_metadata,
      post_result_obj: {
        data: [{}],
        metadata: {},
        influencer: post.influencer,
        engagement: post.engagement,
        source: 'content-posts-api',
        original_response: post,
      },
      data_source: 'content-posts-api',
    }));

    return transformedResults;
  } catch (error) {
    console.error('Client Service: Error in getContentPostsByCampaign:', error);
    throw error;
  }
}

/**
 * Update a single content post
 */
export async function updateContentPost(
  contentPostId: string,
  updateData: ContentPostUpdatePayload,
): Promise<ContentPostResponse> {
  try {
    validateBrowserAndAuth('updateContentPost');

    if (!contentPostId || contentPostId.trim() === '') {
      throw new Error('Valid content post ID is required');
    }

    const endpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.UPDATE(contentPostId);

    console.log(`📞 Client Service: Updating content post at ${endpoint}`);

    const response = await nextjsApiClient.put<ContentPostResponse>(
      endpoint,
      updateData,
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to update content post');
    }

    console.log(`✅ Client Service: Content post ${contentPostId} updated successfully`);

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in updateContentPost:', error);
    throw error;
  }
}

/**
 * Batch update request interface
 */
interface BatchUpdateRequest {
  result_id: string;
  update_data: ContentPostUpdatePayload;
}

/**
 * Batch update response interface
 */
interface BatchUpdateResponse {
  success: boolean;
  results?: ContentPostResponse[];
  error?: string;
}

/**
 * Batch update all content posts for a campaign
 */
export async function updateAllContentPostsWithData(
  campaignId: string,
  updatesData: BatchUpdateRequest[],
): Promise<ContentPostResponse[]> {
  try {
    validateBrowserAndAuth('updateAllContentPostsWithData');

    if (!campaignId || campaignId.trim() === '') {
      throw new Error('Valid campaign ID is required');
    }

    if (!updatesData || updatesData.length === 0) {
      throw new Error('Updates data array is required');
    }

    const endpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.UPDATE_ALL_BY_CAMPAIGN(campaignId);
    const requestBody = { updates: updatesData };

    console.log(`📞 Client Service: Batch updating ${updatesData.length} posts at ${endpoint}`);

    const response = await nextjsApiClient.put<BatchUpdateResponse>(
      endpoint,
      requestBody,
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Batch update failed');
    }

    if (!Array.isArray(response.data.results)) {
      return [];
    }

    console.log(`✅ Client Service: Batch update completed for campaign ${campaignId}`);

    return response.data.results;
  } catch (error) {
    console.error('Client Service: Error in updateAllContentPostsWithData:', error);
    throw error;
  }
}

/**
 * Delete a content post
 */
export async function deleteContentPost(
  contentPostId: string,
): Promise<boolean> {
  try {
    validateBrowserAndAuth('deleteContentPost');

    if (!contentPostId || contentPostId.trim() === '') {
      throw new Error('Valid content post ID is required');
    }

    const endpoint = API_VERSION + ENDPOINTS.CONTENT_POSTS.DELETE(contentPostId);

    console.log(`📞 Client Service: Deleting content post at ${endpoint}`);

    const response = await nextjsApiClient.delete<{
      success: boolean;
      error?: string;
    }>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.error || 'Failed to delete content post');
    }

    console.log(`✅ Client Service: Content post ${contentPostId} deleted successfully`);

    return true;
  } catch (error) {
    console.error('Client Service: Error in deleteContentPost:', error);
    throw error;
  }
}
