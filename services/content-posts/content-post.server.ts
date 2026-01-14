// src/services/content-posts/content-post.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  ContentPostCreate,
  ContentPostResponse,
  ContentPostQueryParams,
} from '@/types/content-post';
import { ContentPostUpdatePayload } from '@/components/dashboard/campaign-funnel/result/types';


export async function createContentPostServer(
  data: ContentPostCreate,
  authToken?: string,
): Promise<ContentPostResponse> {
  try {
    console.log('🚀 Server: Starting createContentPostServer call');
    console.log('📋 Server: Content post data:', {
      campaign_id: data.campaign_id,
      campaign_influencer_id: data.campaign_influencer_id,
      content_type: data.content_type,
      content_url: data.content_url,
    });

    // Validate required fields before making API call
    if (!data.campaign_id) {
      throw new Error('Campaign ID is required');
    }
    if (!data.campaign_influencer_id) {
      throw new Error('Campaign Influencer ID is required');
    }
    if (!data.content_url) {
      throw new Error('Content URL is required');
    }
    if (!data.content_type) {
      throw new Error('Content Type is required');
    }

    const endpoint = ENDPOINTS.CONTENT_POSTS.CREATE;
    console.log(`📞 Server: Making API call to ${endpoint}`);

    // Make API call to FastAPI backend
    const response = await serverApiClient.post<ContentPostResponse>(
      endpoint,
      data,
      {},
      authToken,
    );

    // Handle error response
    if (response.error) {
      console.error(
        '❌ Server: FastAPI Error creating content post:',
        response.error,
      );
      throw new Error(
        response.error.message || 'Failed to create content post',
      );
    }

    // Validate response data
    if (!response.data) {
      console.warn('⚠️ Server: No response data received from FastAPI');
      throw new Error('No response data received from backend');
    }

    console.log(
      '✅ Server: Successfully created content post:',
      response.data.id,
    );
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in createContentPostServer:', error);

    // Re-throw with enhanced error context
    if (error instanceof Error) {
      throw new Error(`Failed to create content post: ${error.message}`);
    }
    throw new Error('Failed to create content post: Unknown error occurred');
  }
}

export async function getContentPostsServer(
  params?: ContentPostQueryParams,
  authToken?: string,
): Promise<any> {
  // ← Changed return type to handle pagination response
  try {
    console.log('🚀 Server: Starting getContentPostsServer call');
    console.log('📋 Server: Query params:', params);

    // Build endpoint with query parameters
    let endpoint = ENDPOINTS.CONTENT_POSTS.GET_ALL;

    if (params) {
      const queryParams = new URLSearchParams();

      if (params.campaign_id)
        queryParams.append('campaign_id', params.campaign_id);
      if (params.campaign_influencer_id)
        queryParams.append(
          'campaign_influencer_id',
          params.campaign_influencer_id,
        );
      if (params.platform_id)
        queryParams.append('platform_id', params.platform_id);
      if (params.content_type)
        queryParams.append('content_type', params.content_type);
      if (params.tracking_status)
        queryParams.append('tracking_status', params.tracking_status);
      if (params.page) queryParams.append('page', params.page.toString());

      // ✅ FIX: Changed from 'page_size' to 'size' (backend parameter name)
      if (params.size) queryParams.append('size', params.size.toString());
      // Keep backward compatibility with page_size
      else if (params.page_size)
        queryParams.append('size', params.page_size.toString());

      const queryString = queryParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    console.log(`📞 Server: Making API call to ${endpoint}`);

    // Make API call to FastAPI backend
    const response = await serverApiClient.get<any>(endpoint, {}, authToken); // ← Changed type to any

    // Handle error response
    if (response.error) {
      console.error(
        '❌ Server: FastAPI Error fetching content posts:',
        response.error,
      );
      throw new Error(
        response.error.message || 'Failed to fetch content posts',
      );
    }

    // Validate response data
    if (!response.data) {
      console.warn('⚠️ Server: No response data received from FastAPI');
      return { items: [], pagination: null };
    }

    // ✅ NEW: Log pagination info
    if (response.data.pagination) {
      console.log(
        '✅ Server: Successfully fetched content posts:',
        response.data.items?.length,
      );
      console.log('📊 Server: Pagination:', response.data.pagination);
    } else if (Array.isArray(response.data)) {
      console.log(
        '✅ Server: Successfully fetched content posts:',
        response.data.length,
      );
    }

    return response.data; // ← Returns full response with items + pagination
  } catch (error) {
    console.error('💥 Server: Error in getContentPostsServer:', error);

    if (error instanceof Error) {
      throw new Error(`Failed to fetch content posts: ${error.message}`);
    }
    throw new Error('Failed to fetch content posts: Unknown error occurred');
  }
}

/**
 * Delete a content post from FastAPI backend (server-side)
 */
export async function deleteContentPostServer(
  contentPostId: string,
  authToken?: string,
): Promise<boolean> {
  try {
    console.log(`🚀 Server: Deleting content post ${contentPostId}`);

    const endpoint = ENDPOINTS.CONTENT_POSTS.DELETE(contentPostId);
    console.log(`📞 Server: Making API call to ${endpoint}`);

    const response = await serverApiClient.delete<{ success: boolean }>(
      endpoint,
      {},
      authToken,
    );

    if (response.error) {
      console.error(
        '❌ Server: FastAPI Error deleting content post:',
        response.error,
      );
      throw new Error(
        response.error.message || 'Failed to delete content post',
      );
    }

    console.log(
      `✅ Server: Successfully deleted content post ${contentPostId}`,
    );
    return true;
  } catch (error) {
    console.error(
      `💥 Server: Error deleting content post ${contentPostId}:`,
      error,
    );

    if (error instanceof Error) {
      throw new Error(`Failed to delete content post: ${error.message}`);
    }
    throw new Error('Failed to delete content post: Unknown error occurred');
  }
}

/**
 * Update a content post in FastAPI backend (server-side)
 */
export async function updateContentPostServer(
  contentPostId: string,
  updateData: ContentPostUpdatePayload,
  authToken?: string,
): Promise<ContentPostResponse> {
  try {
    console.log(`🚀 Server: Updating content post ${contentPostId}`);
    console.log('📋 Server: Update data keys:', Object.keys(updateData));

    const endpoint = ENDPOINTS.CONTENT_POSTS.UPDATE(contentPostId);
    console.log(`📞 Server: Making API call to ${endpoint}`);

    const response = await serverApiClient.put<ContentPostResponse>(
      endpoint,
      updateData,
      {},
      authToken,
    );

    if (response.error) {
      console.error('❌ Server: FastAPI Error updating content post:', response.error);
      throw new Error(response.error.message || 'Failed to update content post');
    }

    if (!response.data) {
      console.warn('⚠️ Server: No updated content post data received from FastAPI');
      throw new Error('No updated content post data received');
    }

    console.log('✅ Server: Content post updated successfully:', response.data.id || contentPostId);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating content post ${contentPostId}:`, error);

    if (error instanceof Error) {
      throw new Error(`Failed to update content post: ${error.message}`);
    }
    throw new Error('Failed to update content post: Unknown error occurred');
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
  results: ContentPostResponse[];
  errors: Array<{ result_id: string; error: string }>;
  total_updated: number;
  total_failed: number;
}

/**
 * Update all content posts for campaign with data (server-side)
 * Uses individual update calls since batch endpoint may not exist
 */
export async function updateAllContentPostsWithDataServer(
  campaignId: string,
  updatesData: BatchUpdateRequest[],
  authToken?: string,
): Promise<BatchUpdateResponse> {
  try {
    console.log(`🚀 Server: Batch updating ${updatesData.length} content posts for campaign ${campaignId}`,);

    const results: ContentPostResponse[] = [];
    const errors: Array<{ result_id: string; error: string }> = [];

    // Update each post individually
    for (let i = 0; i < updatesData.length; i++) {
      const update = updatesData[i];

      try {
        console.log(`📤 Server: Updating content post ${i + 1}/${updatesData.length}: ${update.result_id}`,);

        const endpoint = ENDPOINTS.CONTENT_POSTS.UPDATE(update.result_id);

        const response = await serverApiClient.put<ContentPostResponse>(
          endpoint,
          update.update_data,
          {},
          authToken,
        );

        if (response.error) {
          console.error(`❌ Server: Error updating ${update.result_id}:`, response.error);
          errors.push({
            result_id: update.result_id,
            error: response.error.message || 'Update failed',
          });
        } else if (response.data) {
          results.push(response.data);
          console.log(`✅ Server: Successfully updated ${update.result_id}`);
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Server: Exception updating ${update.result_id}:`, errorMsg);
        errors.push({
          result_id: update.result_id,
          error: errorMsg,
        });
      }
    }

    console.log(`📊 Server: Batch update complete - Success: ${results.length}, Failed: ${errors.length}`,);

    return {
      success: errors.length === 0,
      results,
      errors,
      total_updated: results.length,
      total_failed: errors.length,
    };
  } catch (error) {
    console.error(`💥 Server: Error in batch update for campaign ${campaignId}:`, error);

    if (error instanceof Error) {
      throw new Error(`Batch update failed: ${error.message}`);
    }
    throw new Error('Batch update failed: Unknown error occurred');
  }
}
