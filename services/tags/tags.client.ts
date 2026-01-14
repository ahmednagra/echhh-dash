// src/services/tags/tags.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import {
  Tag,
  InfluencerTag,
  GetAllTagsResponse,
  AddTagToInfluencerRequest,
  AddTagToInfluencerResponse,
  RemoveTagFromInfluencerRequest,
  RemoveTagFromInfluencerResponse,
} from '@/types/tags';
import { ENDPOINTS } from '@/services/api/endpoints';

const API_VERSION = '/api/v0';

/**
 * Fetch all tags for the company (client-side)
 */
export async function getAllTags(
  page: number = 1,
  size: number = 100,
): Promise<GetAllTagsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getAllTags can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.TAGS.GET_ALL}?page=${page}&size=${size}`;

    const response = await nextjsApiClient.get<GetAllTagsResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      return {
        tags: [],
        total: 0,
        page: 1,
        size: 100,
        pages: 0,
      };
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getAllTags:', error);
    throw error;
  }
}

/**
 * Add tag to campaign influencer by tag_id (client-side)
 */
export async function addTagToInfluencerById(
  campaignInfluencerId: string,
  tagId: string,
): Promise<AddTagToInfluencerResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('addTagToInfluencerById can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.TAGS.ADD_TO_INFLUENCER(campaignInfluencerId)}`;

    const response = await nextjsApiClient.post<AddTagToInfluencerResponse>(
      endpoint,
      { tag_id: tagId },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to add tag');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in addTagToInfluencerById:', error);
    throw error;
  }
}

/**
 * Add tag to campaign influencer by tag_name (creates if not exists) (client-side)
 */
export async function addTagToInfluencerByName(
  campaignInfluencerId: string,
  tagName: string,
): Promise<AddTagToInfluencerResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error(
        'addTagToInfluencerByName can only be called from browser',
      );
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.TAGS.ADD_TO_INFLUENCER(campaignInfluencerId)}`;

    const response = await nextjsApiClient.post<AddTagToInfluencerResponse>(
      endpoint,
      { tag_name: tagName },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to add tag');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in addTagToInfluencerByName:', error);
    throw error;
  }
}

/**
 * Remove tag from campaign influencer (client-side)
 */
export async function removeTagFromInfluencer(
  campaignInfluencerId: string,
  tagId: string,
): Promise<RemoveTagFromInfluencerResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error(
        'removeTagFromInfluencer can only be called from browser',
      );
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.TAGS.REMOVE_FROM_INFLUENCER(campaignInfluencerId)}`;

    const response =
      await nextjsApiClient.post<RemoveTagFromInfluencerResponse>(endpoint, {
        tag_id: tagId,
      });

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to remove tag');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in removeTagFromInfluencer:', error);
    throw error;
  }
}
