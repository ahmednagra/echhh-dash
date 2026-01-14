// src/services/ai/conversations.server.ts

/**
 * AI Conversations Server Service
 * 
 * Server-side service for conversation management
 * Used by Next.js API routes only - NOT for client components
 * 
 * @module services/ai/conversations.server
 */

import { serverApiClient } from '@/lib/server-api';
import { AI_ENDPOINTS } from '@/services/api/endpoints';
import {
  AIConversation,
  GetConversationsParams,
  GetConversationsResponse,
  GetConversationResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
} from '@/types/ai';

// =============================================================================
// GET CONVERSATIONS
// =============================================================================

/**
 * Get conversations list from AI Service
 * Supports filtering by campaign_id
 * 
 * @param params - Query parameters (campaign_id, limit, offset)
 * @param authToken - Authentication token
 * @returns Promise<GetConversationsResponse>
 */
export async function getConversationsServer(
  params: GetConversationsParams = {},
  authToken?: string
): Promise<GetConversationsResponse> {
  try {
    console.log('📋 AI Server: Fetching conversations', params);

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.campaign_id) queryParams.append('campaign_id', params.campaign_id);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${AI_ENDPOINTS.CONVERSATIONS.LIST}?${queryString}`
      : AI_ENDPOINTS.CONVERSATIONS.LIST;

    const response = await serverApiClient.get<GetConversationsResponse>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error fetching conversations:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from AI service');
    }

    console.log(`✅ AI Server: Fetched ${response.data.data?.conversations?.length || 0} conversations`);
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in getConversationsServer:', error);
    throw error;
  }
}

// =============================================================================
// GET SINGLE CONVERSATION
// =============================================================================

/**
 * Get a single conversation by ID
 * 
 * @param conversationId - Conversation UUID
 * @param authToken - Authentication token
 * @returns Promise<GetConversationResponse>
 */
export async function getConversationServer(
  conversationId: string,
  authToken?: string
): Promise<GetConversationResponse> {
  try {
    console.log(`📖 AI Server: Fetching conversation ${conversationId}`);

    const response = await serverApiClient.get<GetConversationResponse>(
      AI_ENDPOINTS.CONVERSATIONS.GET(conversationId),
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error fetching conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data received');
    }

    console.log('✅ AI Server: Conversation fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in getConversationServer:', error);
    throw error;
  }
}

// =============================================================================
// CREATE CONVERSATION
// =============================================================================

/**
 * Create a new conversation
 * 
 * @param data - Conversation creation data
 * @param authToken - Authentication token
 * @returns Promise<CreateConversationResponse>
 */
export async function createConversationServer(
  data: CreateConversationRequest,
  authToken?: string
): Promise<CreateConversationResponse> {
  try {
    console.log('📝 AI Server: Creating conversation', data);

    const response = await serverApiClient.post<CreateConversationResponse>(
      AI_ENDPOINTS.CONVERSATIONS.CREATE,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error creating conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from AI service');
    }

    console.log('✅ AI Server: Conversation created:', response.data.data?.id);
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in createConversationServer:', error);
    throw error;
  }
}

// =============================================================================
// DELETE CONVERSATION
// =============================================================================

/**
 * Delete a conversation
 * 
 * @param conversationId - Conversation UUID to delete
 * @param authToken - Authentication token
 * @returns Promise<DeleteConversationResponse>
 */
export async function deleteConversationServer(
  conversationId: string,
  authToken?: string
): Promise<DeleteConversationResponse> {
  try {
    console.log(`🗑️ AI Server: Deleting conversation ${conversationId}`);

    const response = await serverApiClient.delete<DeleteConversationResponse>(
      AI_ENDPOINTS.CONVERSATIONS.DELETE(conversationId),
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error deleting conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No confirmation received from AI service');
    }

    console.log('✅ AI Server: Conversation deleted successfully');
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in deleteConversationServer:', error);
    throw error;
  }
}