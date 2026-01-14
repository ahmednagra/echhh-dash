// src/services/comments/comments.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  GetCommentsResponse,
  DeleteCommentResponse,
  GetCommentsParams 
} from '@/types/comment';

const API_VERSION = '/api/v0';

export class CommentsClientService {
  /**
   * Create a new comment via Next.js API route (client-side)
   */
  static async createComment(data: CreateCommentRequest): Promise<Comment> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('createComment can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.COMMENTS.CREATE;

      const response = await nextjsApiClient.post<Comment>(endpoint, data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to create comment');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in createComment:', error);
      throw error;
    }
  }

  /**
   * Get comments for an entity via Next.js API route (client-side)
   */
  static async getCommentsByEntity(params: GetCommentsParams): Promise<GetCommentsResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('getCommentsByEntity can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const { entity_type, entity_id, ...queryParams } = params;
      
      const queryString = new URLSearchParams({
        ...(queryParams.include_private !== undefined && { include_private: String(queryParams.include_private) }),
        ...(queryParams.include_replies !== undefined && { include_replies: String(queryParams.include_replies) }),
        ...(queryParams.page && { page: String(queryParams.page) }),
        ...(queryParams.size && { size: String(queryParams.size) }),
      }).toString();

      const endpoint = API_VERSION + ENDPOINTS.COMMENTS.GET_BY_ENTITY(entity_type, entity_id);
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await nextjsApiClient.get<GetCommentsResponse>(url);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to fetch comments');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in getCommentsByEntity:', error);
      throw error;
    }
  }

  /**
   * Update an existing comment via Next.js API route (client-side)
   */
  static async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('updateComment can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.COMMENTS.UPDATE(commentId);

      const response = await nextjsApiClient.put<Comment>(endpoint, data);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to update comment');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in updateComment:', error);
      throw error;
    }
  }

  /**
   * Delete a comment via Next.js API route (client-side)
   */
  static async deleteComment(commentId: string): Promise<DeleteCommentResponse> {
    try {
      if (typeof window === 'undefined') {
        throw new Error('deleteComment can only be called from browser');
      }
      
      // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = API_VERSION + ENDPOINTS.COMMENTS.DELETE(commentId);

      const response = await nextjsApiClient.delete<DeleteCommentResponse>(endpoint);
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('Failed to delete comment');
      }
      
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in deleteComment:', error);
      throw error;
    }
  }
}