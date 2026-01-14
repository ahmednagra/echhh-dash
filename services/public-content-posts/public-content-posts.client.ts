// src/services/public-content-posts/public-content-posts.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  GetPublicContentPostsRequest,
  PublicContentPostsResponse,
} from '@/types/public-content-posts';

const API_VERSION = '/api/v0';

/**
 * Get public content posts using token validation (client-side)
 */
export async function getPublicContentPosts(
  params: GetPublicContentPostsRequest
): Promise<PublicContentPostsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getPublicContentPosts can only be called from browser');
    }

    console.log('📤 Client: Fetching public content posts');

    const endpoint = `${API_VERSION}${ENDPOINTS.PUBLIC.CONTENT_POSTS.LIST}`;
    const queryParams = new URLSearchParams({
      token: params.token,
      page: (params.page || 1).toString(),
      limit: (params.limit || 100).toString(),
    });

    const response = await nextjsApiClient.get<PublicContentPostsResponse>(
      `${endpoint}?${queryParams}`,
      { auth: false } // No authentication required for public access
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to fetch public content posts');
    }

    console.log('✅ Client: Public content posts fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client: Error fetching public content posts:', error);
    throw error;
  }
}