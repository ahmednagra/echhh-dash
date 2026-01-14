// src/services/tags/tags.server.ts

import { serverApiClient } from '@/lib/server-api';
import {
  Tag,
  GetAllTagsResponse,
  AddTagToInfluencerRequest,
  AddTagToInfluencerResponse,
  RemoveTagFromInfluencerRequest,
  RemoveTagFromInfluencerResponse,
  UpdateTagRequest,
  UpdateTagResponse,
  DeleteTagResponse,
} from '@/types/tags';
import { ENDPOINTS } from '@/services/api/endpoints';

/**
 * Get all tags for the company (server-side)
 */
export async function getAllTagsServer(
  authToken?: string,
  page: number = 1,
  size: number = 100,
): Promise<GetAllTagsResponse> {
  try {
    console.log('🏷️ Tags Server: Fetching all tags');

    const endpoint = `${ENDPOINTS.TAGS.GET_ALL}?page=${page}&size=${size}`;

    const response = await serverApiClient.get<GetAllTagsResponse>(
      endpoint,
      {},
      authToken,
    );

    if (response.error) {
      console.error('❌ Tags Server: Error fetching tags:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      console.warn('⚠️ Tags Server: No tags data received');
      return {
        tags: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0,
      };
    }

    console.log(
      `✅ Tags Server: Fetched ${response.data.tags?.length || 0} tags`,
    );
    return response.data;
  } catch (error) {
    console.error('💥 Tags Server: Error in getAllTagsServer:', error);
    throw error;
  }
}

/**
 * Add tag to campaign influencer (server-side)
 */
export async function addTagToInfluencerServer(
  campaignInfluencerId: string,
  data: AddTagToInfluencerRequest,
  authToken?: string,
): Promise<AddTagToInfluencerResponse> {
  try {
    console.log(
      `🏷️ Tags Server: Adding tag to influencer ${campaignInfluencerId}`,
      data,
    );

    const endpoint = ENDPOINTS.TAGS.ADD_TO_INFLUENCER(campaignInfluencerId);

    const response = await serverApiClient.post<AddTagToInfluencerResponse>(
      endpoint,
      data,
      {},
      authToken,
    );

    if (response.error) {
      console.error('❌ Tags Server: Error adding tag:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Tags Server: Tag added successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Tags Server: Error in addTagToInfluencerServer:', error);
    throw error;
  }
}

/**
 * Remove tag from campaign influencer (server-side)
 */
export async function removeTagFromInfluencerServer(
  campaignInfluencerId: string,
  data: RemoveTagFromInfluencerRequest,
  authToken?: string,
): Promise<RemoveTagFromInfluencerResponse> {
  try {
    console.log(
      `🏷️ Tags Server: Removing tag from influencer ${campaignInfluencerId}`,
      data,
    );

    const endpoint =
      ENDPOINTS.TAGS.REMOVE_FROM_INFLUENCER(campaignInfluencerId);

    const response =
      await serverApiClient.post<RemoveTagFromInfluencerResponse>(
        endpoint,
        data,
        {},
        authToken,
      );

    if (response.error) {
      console.error('❌ Tags Server: Error removing tag:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Tags Server: Tag removed successfully', response.data);
    return response.data;
  } catch (error) {
    console.error(
      '💥 Tags Server: Error in removeTagFromInfluencerServer:',
      error,
    );
    throw error;
  }
}

// =============================================================================
// 🆕 NEW: Update and Delete Tag Functions
// =============================================================================

/**
 * Update a tag (server-side)
 */
export async function updateTagServer(
  tagId: string,
  data: UpdateTagRequest,
  authToken?: string,
): Promise<UpdateTagResponse> {
  try {
    console.log(`🏷️ Tags Server: Updating tag ${tagId}`, data);

    const endpoint = ENDPOINTS.TAGS.UPDATE(tagId);

    const response = await serverApiClient.patch<UpdateTagResponse>(
      endpoint,
      data,
      {},
      authToken,
    );

    if (response.error) {
      console.error('❌ Tags Server: Error updating tag:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Tags Server: Tag updated successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Tags Server: Error in updateTagServer:', error);
    throw error;
  }
}

/**
 * Delete a tag (server-side)
 */
export async function deleteTagServer(
  tagId: string,
  authToken?: string,
): Promise<DeleteTagResponse> {
  try {
    console.log(`🏷️ Tags Server: Deleting tag ${tagId}`);

    const endpoint = ENDPOINTS.TAGS.DELETE(tagId);

    const response = await serverApiClient.delete<DeleteTagResponse>(
      endpoint,
      {},
      authToken,
    );

    if (response.error) {
      console.error('❌ Tags Server: Error deleting tag:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Tags Server: Tag deleted successfully', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Tags Server: Error in deleteTagServer:', error);
    throw error;
  }
}