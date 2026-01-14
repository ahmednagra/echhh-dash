// src/services/public-comments/public-comments.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  GetPublicCommentsParams,
  PublicCommentsResponse,
  CreatePublicCommentRequest,
  CreatePublicCommentResponse
} from '@/types/public-comments';

export async function getPublicCommentsServer(
  params: GetPublicCommentsParams
): Promise<PublicCommentsResponse> {
  try {
    const { entity_type, entity_id, token, page = 1, limit = 10 } = params;
    
    const endpoint = ENDPOINTS.PUBLIC.COMMENTS.GET_BY_ENTITY(entity_type, entity_id);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      token,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const fullEndpoint = `${endpoint}?${queryParams.toString()}`;
    
    const response = await serverApiClient.get<PublicCommentsResponse>(
      fullEndpoint,
      {} // No auth token needed for public endpoint
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Server Service: Error fetching public comments:', error);
    throw error;
  }
}

/**
 * Create a new public comment (server-side)
 */
export async function createPublicCommentServer(
  data: CreatePublicCommentRequest
): Promise<CreatePublicCommentResponse> {
  try {
    const endpoint = ENDPOINTS.PUBLIC.COMMENTS.CREATE;
    
    const response = await serverApiClient.post<CreatePublicCommentResponse>(
      endpoint,
      data,
      {} // No additional headers needed for public endpoint with token in body
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Server Service: Error creating public comment:', error);
    throw error;
  }
}