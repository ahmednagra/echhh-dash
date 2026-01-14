// src/services/chat/chat.server.ts

/**
 * Chat Server Service
 * 
 * Server-side service that communicates with AI Service backend
 * Used by Next.js API routes only
 * 
 * Uses industry-standard 'conversations' terminology
 */

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  SendMessageRequest,
  SendMessageResponse,
  ConversationsListResponse,
  CreateConversationRequest,
  CreateConversationResponse,
  DeleteConversationResponse,
} from '@/types/chat';

/**
 * Send a chat message to AI Service
 */
export async function sendChatMessageServer(
  data: SendMessageRequest,
  authToken?: string
): Promise<SendMessageResponse> {
  try {
    console.log(`📤 Chat Server: Sending message to AI service`);

    const response = await serverApiClient.post<SendMessageResponse>(
      ENDPOINTS.AI_CHAT.SEND_MESSAGE,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Chat Server: AI Service error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data from AI service');
    }

    console.log('✅ Chat Server: Message sent successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Server: Error sending message:', error);
    throw error;
  }
}

/**
 * Get user's chat conversations
 */
export async function getChatConversationsServer(
  authToken?: string
): Promise<ConversationsListResponse> {
  try {
    console.log(`📋 Chat Server: Fetching conversations from AI service`);

    const response = await serverApiClient.get<ConversationsListResponse>(
      ENDPOINTS.AI_CHAT.GET_CONVERSATIONS,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Chat Server: AI Service error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversations data from AI service');
    }

    console.log('✅ Chat Server: Conversations fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Server: Error fetching conversations:', error);
    throw error;
  }
}

/**
 * Create a new chat conversation
 */
export async function createChatConversationServer(
  data: CreateConversationRequest,
  authToken?: string
): Promise<CreateConversationResponse> {
  try {
    console.log(`📝 Chat Server: Creating conversation in AI service`);

    const response = await serverApiClient.post<CreateConversationResponse>(
      ENDPOINTS.AI_CHAT.CREATE_CONVERSATION,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Chat Server: AI Service error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data from AI service');
    }

    console.log('✅ Chat Server: Conversation created successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Server: Error creating conversation:', error);
    throw error;
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getChatConversationServer(
  conversationId: string,
  authToken?: string
): Promise<any> {
  try {
    console.log(`📖 Chat Server: Fetching conversation ${conversationId} from AI service`);

    const response = await serverApiClient.get<any>(
      ENDPOINTS.AI_CHAT.GET_CONVERSATION(conversationId),
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Chat Server: AI Service error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No conversation data from AI service');
    }

    console.log('✅ Chat Server: Conversation fetched successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Server: Error fetching conversation:', error);
    throw error;
  }
}

/**
 * Delete a chat conversation
 */
export async function deleteChatConversationServer(
  conversationId: string,
  authToken?: string
): Promise<DeleteConversationResponse> {
  try {
    console.log(`🗑️ Chat Server: Deleting conversation ${conversationId} from AI service`);

    const response = await serverApiClient.delete<DeleteConversationResponse>(
      ENDPOINTS.AI_CHAT.DELETE_CONVERSATION(conversationId),
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Chat Server: AI Service error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No deletion confirmation from AI service');
    }

    console.log('✅ Chat Server: Conversation deleted successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Chat Server: Error deleting conversation:', error);
    throw error;
  }
}

/**
 * Health check for AI Service
 */
export async function checkAIServiceHealthServer(): Promise<{ healthy: boolean; data?: any }> {
  try {
    console.log(`🏥 Chat Server: Checking AI service health`);

    const response = await serverApiClient.get<any>(
      ENDPOINTS.AI_CHAT.HEALTH,
      {}
    );

    if (response.error) {
      console.warn('⚠️ Chat Server: AI service health check returned error');
      return {
        healthy: false,
      };
    }

    console.log('✅ Chat Server: AI service is healthy');
    return {
      healthy: true,
      data: response.data,
    };
  } catch (error) {
    console.error('💥 Chat Server: Health check failed:', error);
    return {
      healthy: false,
    };
  }
}