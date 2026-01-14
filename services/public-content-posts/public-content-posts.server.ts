// src/services/public-content-posts/public-content-posts.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  GetPublicContentPostsRequest,
  PublicContentPostsResponse,
} from '@/types/public-content-posts';

/**
 * Get public content posts using token validation (server-side)
 */
export async function getPublicContentPostsServer(
  params: GetPublicContentPostsRequest
): Promise<PublicContentPostsResponse> {
  try {
    console.log('📤 Server: Fetching public content posts');

    const endpoint = ENDPOINTS.PUBLIC.CONTENT_POSTS.LIST;
    const queryParams = new URLSearchParams({
      token: params.token,
      page: (params.page || 1).toString(),
      limit: (params.limit || 100).toString(),
    });

    const response = await serverApiClient.get<PublicContentPostsResponse>(
      `${endpoint}?${queryParams}`,
      {}
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Server: Public content posts fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error fetching public content posts:', error);
    throw error;
  }
}