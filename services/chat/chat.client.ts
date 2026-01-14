// src/services/chat/chat.client.ts

/**
 * Chat Client Service
 * 
 * Client-side service that calls Next.js API routes
 * These routes then forward to AI Service backend
 * 
 * Uses industry-standard 'conversations' terminology
 * BROWSER ONLY - never import in server components
 */

import { nextjsApiClient } from '@/lib/nextjs-api';
import {
  SendMessageRequest,
  SendMessageResponse,
  ConversationsListResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
} from '@/types/chat';

const API_VERSION = '/api/v1';

/**
 * Send a chat message
 */
export async function sendChatMessage(
  data: SendMessageRequest
): Promise<SendMessageResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('sendChatMessage can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`💬 Chat Client: Sending message`);

    const endpoint = `${API_VERSION}/ai-chat/message`;

    const response = await nextjsApiClient.post<SendMessageResponse>(
      endpoint,
      data
    );

    if (response.error) {
      console.error('❌ Chat Client: Request error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Chat Client: Message sent successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Client: Error sending message:', error);
    throw error;
  }
}

/**
 * Get user's chat conversations
 */
export async function getChatConversations(): Promise<ConversationsListResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getChatConversations can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`📋 Chat Client: Fetching conversations`);

    const endpoint = `${API_VERSION}/ai-chat/conversations`;

    const response = await nextjsApiClient.get<ConversationsListResponse>(
      endpoint
    );

    if (response.error) {
      console.error('❌ Chat Client: Request error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversations data received');
    }

    console.log('✅ Chat Client: Conversations fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Client: Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Create a new chat conversation
 */
export async function createChatConversation(
  conversationName?: string
): Promise<CreateConversationResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createChatConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`📝 Chat Client: Creating conversation`);

    const endpoint = `${API_VERSION}/ai-chat/conversations`;

    const data: CreateConversationRequest = {
      conversation_name: conversationName,
    };

    const response = await nextjsApiClient.post<CreateConversationResponse>(
      endpoint,
      data
    );

    if (response.error) {
      console.error('❌ Chat Client: Request error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data received');
    }

    console.log('✅ Chat Client: Conversation created successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Client: Error creating conversation:', error);
    throw error;
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getChatConversation(
  conversationId: string
): Promise<any> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getChatConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`📖 Chat Client: Fetching conversation ${conversationId}`);

    const endpoint = `${API_VERSION}/ai-chat/conversations/${conversationId}`;

    const response = await nextjsApiClient.get<any>(
      endpoint
    );

    if (response.error) {
      console.error('❌ Chat Client: Request error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data received');
    }

    console.log('✅ Chat Client: Conversation fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Client: Error fetching conversation:', error);
    throw error;
  }
}

/**
 * Delete a chat conversation
 */
export async function deleteChatConversation(
  conversationId: string
): Promise<DeleteConversationResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('deleteChatConversation can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`🗑️ Chat Client: Deleting conversation ${conversationId}`);

    const endpoint = `${API_VERSION}/ai-chat/conversations/${conversationId}`;

    const response = await nextjsApiClient.delete<DeleteConversationResponse>(
      endpoint
    );

    if (response.error) {
      console.error('❌ Chat Client: Request error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No deletion confirmation received');
    }

    console.log('✅ Chat Client: Conversation deleted successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Client: Error deleting conversation:', error);
    throw error;
  }
}