// src/services/comments/comments.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  Comment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  GetCommentsResponse,
  DeleteCommentResponse,
  GetCommentsParams 
} from '@/types/comment';

export class CommentsServerService {
  /**
   * Create a new comment (server-side)
   */
  static async createComment(
    data: CreateCommentRequest,
    authToken?: string
  ): Promise<Comment> {
    try {
      const endpoint = ENDPOINTS.COMMENTS.CREATE;
      
      const response = await serverApiClient.post<Comment>(
        endpoint,
        data,
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error creating comment:`, error);
      throw error;
    }
  }

  /**
   * Get comments for an entity (server-side)
   */
  static async getCommentsByEntity(
    params: GetCommentsParams,
    authToken?: string
  ): Promise<GetCommentsResponse> {
    try {
      const { entity_type, entity_id, ...queryParams } = params;
      const endpoint = ENDPOINTS.COMMENTS.GET_BY_ENTITY(entity_type, entity_id);
      
      const response = await serverApiClient.get<GetCommentsResponse>(
        endpoint,
        queryParams as Record<string, any>,
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error fetching comments for ${params.entity_type}/${params.entity_id}:`, error);
      throw error;
    }
  }

  /**
   * Update an existing comment (server-side)
   */
  static async updateComment(
    commentId: string,
    data: UpdateCommentRequest,
    authToken?: string
  ): Promise<Comment> {
    try {
      const endpoint = ENDPOINTS.COMMENTS.UPDATE(commentId);
      
      const response = await serverApiClient.put<Comment>(
        endpoint,
        data,
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error updating comment ${commentId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a comment (server-side)
   */
  static async deleteComment(
    commentId: string,
    authToken?: string
  ): Promise<DeleteCommentResponse> {
    try {
      const endpoint = ENDPOINTS.COMMENTS.DELETE(commentId);
      
      const response = await serverApiClient.delete<DeleteCommentResponse>(
        endpoint,
        {},
        authToken
      );
      
      if (response.error) {
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        throw new Error('No response data received');
      }
      
      return response.data;
    } catch (error) {
      console.error(`💥 Server Service: Error deleting comment ${commentId}:`, error);
      throw error;
    }
  }
}