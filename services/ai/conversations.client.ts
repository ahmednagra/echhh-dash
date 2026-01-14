// src/services/ai/conversations.client.ts

/**
 * AI Conversations Client Service
 * 
 * Client-side service that calls Next.js API routes
 * BROWSER ONLY - never import in server components
 * 
 * @module services/ai/conversations.client
 */

'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';
import {
  GetConversationsParams,
  GetConversationsResponse,
  GetConversationResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
} from '@/types/ai';

const API_VERSION = '/api/v1';

// =============================================================================
// GET CONVERSATIONS
// =============================================================================

/**
 * Get conversations list
 * Supports filtering by campaign_id
 * 
 * @param params - Query parameters (campaign_id, limit, offset)
 * @returns Promise<GetConversationsResponse>
 * 
 * @example
 * // Get all conversations
 * const response = await getConversations();
 * 
 * @example
 * // Get conversations for a specific campaign
 * const response = await getConversations({ campaign_id: 'uuid' });
 */
export async function getConversations(
  params: GetConversationsParams = {}
): Promise<GetConversationsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getConversations can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📋 AI Client: Fetching conversations', params);

    // Build query string
    const queryParams = new URLSearchParams();
    if (params.campaign_id) queryParams.append('campaign_id', params.campaign_id);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());
    if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_VERSION}/ai/conversations?${queryString}`
      : `${API_VERSION}/ai/conversations`;

    const response = await nextjsApiClient.get<GetConversationsResponse>(endpoint);

    if (response.error) {
      console.error('❌ AI Client: Error fetching conversations:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received');
    }

    console.log(`✅ AI Client: Fetched ${response.data.data?.conversations?.length || 0} conversations`);
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in getConversations:', error);
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
 * @returns Promise<GetConversationResponse>
 */
export async function getConversation(
  conversationId: string
): Promise<GetConversationResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`📖 AI Client: Fetching conversation ${conversationId}`);

    const endpoint = `${API_VERSION}/ai/conversations/${conversationId}`;
    const response = await nextjsApiClient.get<GetConversationResponse>(endpoint);

    if (response.error) {
      console.error('❌ AI Client: Error fetching conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data received');
    }

    console.log('✅ AI Client: Conversation fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in getConversation:', error);
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
 * @returns Promise<CreateConversationResponse>
 */
export async function createConversation(
  data: CreateConversationRequest = {}
): Promise<CreateConversationResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('📝 AI Client: Creating conversation', data);

    const endpoint = `${API_VERSION}/ai/conversations`;
    const response = await nextjsApiClient.post<CreateConversationResponse>(endpoint, data);

    if (response.error) {
      console.error('❌ AI Client: Error creating conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received');
    }

    console.log('✅ AI Client: Conversation created:', response.data.data?.id);
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in createConversation:', error);
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
 * @returns Promise<DeleteConversationResponse>
 */
export async function deleteConversation(
  conversationId: string
): Promise<DeleteConversationResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('deleteConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`🗑️ AI Client: Deleting conversation ${conversationId}`);

    const endpoint = `${API_VERSION}/ai/conversations/${conversationId}`;
    const response = await nextjsApiClient.delete<DeleteConversationResponse>(endpoint);

    if (response.error) {
      console.error('❌ AI Client: Error deleting conversation:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No confirmation received');
    }

    console.log('✅ AI Client: Conversation deleted successfully');
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in deleteConversation:', error);
    throw error;
  }
}