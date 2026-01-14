// src/services/public-comments/public-comments.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  GetPublicCommentsParams,
  PublicCommentsResponse,
  PublicCommentsError,
  CreatePublicCommentRequest,
  CreatePublicCommentResponse,
  PublicComment
} from '@/types/public-comments';

const API_VERSION = '/api/v0';

export async function getPublicComments(
  params: GetPublicCommentsParams
): Promise<PublicCommentsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getPublicComments can only be called from browser');
    }
    
    const { entity_type, entity_id, token, page = 1, limit = 10 } = params;
    
    // Validate required parameters
    if (!entity_type || !entity_id || !token) {
      throw new Error('entity_type, entity_id, and token are required');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.PUBLIC.COMMENTS.GET_BY_ENTITY(entity_type, entity_id);
    
    // Build query parameters
    const queryParams = new URLSearchParams({
      token,
      page: page.toString(),
      limit: limit.toString()
    });
    
    const fullEndpoint = `${endpoint}?${queryParams.toString()}`;

    const response = await nextjsApiClient.get<PublicCommentsResponse>(
      fullEndpoint
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to fetch public comments');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getPublicComments:', error);
    throw error;
  }
}

/**
 * Create a new public comment via Next.js API route (client-side)
 */
export async function createPublicComment(
  data: CreatePublicCommentRequest
): Promise<PublicComment> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createPublicComment can only be called from browser');
    }
    
    // Validate required parameters
    if (!data.content || !data.entity_type || !data.entity_id || !data.token) {
      throw new Error('content, entity_type, entity_id, and token are required');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.PUBLIC.COMMENTS.CREATE;

    const response = await nextjsApiClient.post<PublicComment>(
      endpoint, 
      data
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to create public comment');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createPublicComment:', error);
    throw error;
  }
}