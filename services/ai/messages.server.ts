// src/services/ai/messages.server.ts

/**
 * AI Messages Server Service - V9 Industry Standard
 * 
 * UPDATED: V9 - Passes `stream` parameter to backend.
 * 
 * Server-side service for message operations.
 * Used by Next.js API routes only - NOT for client components.
 * 
 * @module services/ai/messages.server
 */

import { serverApiClient } from '@/lib/server-api';
import { AI_ENDPOINTS } from '@/services/api/endpoints';
import {
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesParams,
  GetMessagesResponse,
} from '@/types/ai';

// =============================================================================
// SEND MESSAGE (Non-Streaming)
// =============================================================================

/**
 * Send a message to AI Service (non-streaming)
 * 
 * V9: Passes `stream: false` to backend explicitly.
 * 
 * @param data - Message data with content and optional context
 * @param authToken - Authentication token
 * @returns Promise<SendMessageResponse>
 */
export async function sendMessageServer(
  data: SendMessageRequest,
  authToken?: string
): Promise<SendMessageResponse> {
  try {
    console.log('📤 AI Server: Sending message (non-streaming)');
    console.log('📤 AI Server: Conversation ID:', data.conversation_id || 'NEW');
    console.log('📤 AI Server: Context:', data.context);

    // V9: Add stream=false explicitly
    const requestData = {
      ...data,
      stream: false
    };

    const response = await serverApiClient.post<SendMessageResponse>(
      AI_ENDPOINTS.MESSAGES.SEND,
      requestData,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error sending message:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data from AI service');
    }

    console.log('✅ AI Server: Message sent successfully');
    console.log('✅ AI Server: Response conversation_id:', response.data.data?.conversation_id);
    console.log('✅ AI Server: Response message_id:', response.data.data?.message_id);
    
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in sendMessageServer:', error);
    throw error;
  }
}

// =============================================================================
// SEND MESSAGE (Streaming) - V9 Updated
// =============================================================================

/**
 * Send a message to AI Service with SSE streaming
 * 
 * V9: Uses `stream: true` in request body (not headers).
 * 
 * Returns a Response object with streaming body that can be
 * directly returned from Next.js API route.
 * 
 * @param data - Message data with content and optional context
 * @param authToken - Authentication token
 * @returns Promise<Response> - Streaming response to forward to client
 */
export async function sendMessageStreamServer(
  data: SendMessageRequest,
  authToken?: string
): Promise<Response> {
  console.log('🌊 AI Server: Sending message (streaming)');
  console.log('🌊 AI Server: Conversation ID:', data.conversation_id || 'NEW');
  console.log('🌊 AI Server: Context:', data.context);

  // Get Backend URL from environment - MUST match serverApiClient configuration
  // Priority: BACKEND_API_URL > NEXT_PUBLIC_API_URL > fallback
  const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const endpoint = `${backendUrl}/api/v1/ai/messages`;
  
  console.log('🌊 AI Server: Streaming endpoint:', endpoint);

  // V9: Add stream=true in request body (not headers!)
  const requestData = {
    ...data,
    stream: true
  };

  // Forward request to Backend with streaming
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      // V9: No Accept/X-Stream headers needed - stream param is in body
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    console.error('❌ AI Server: Backend error:', response.status, response.statusText);
    throw new Error(`Backend error: ${response.status} ${response.statusText}`);
  }

  console.log('🌊 AI Server: Streaming response received from Backend');
  
  // Return the response directly - the body is a ReadableStream
  return response;
}

// =============================================================================
// GET MESSAGES (unchanged)
// =============================================================================

/**
 * Get messages for a conversation with cursor-based pagination
 * 
 * @param conversationId - Conversation UUID
 * @param params - Pagination parameters (limit, cursor, direction)
 * @param authToken - Authentication token
 * @returns Promise<GetMessagesResponse>
 */
export async function getMessagesServer(
  conversationId: string,
  params: GetMessagesParams = {},
  authToken?: string
): Promise<GetMessagesResponse> {
  try {
    console.log(`📬 AI Server: Fetching messages for conversation ${conversationId}`);
    console.log('📬 AI Server: Pagination params:', params);

    // Build query string for cursor-based pagination
    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.direction) queryParams.append('direction', params.direction);

    const queryString = queryParams.toString();
    const baseEndpoint = AI_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId);
    const endpoint = queryString ? `${baseEndpoint}?${queryString}` : baseEndpoint;

    const response = await serverApiClient.get<GetMessagesResponse>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ AI Server: Error fetching messages:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No messages data received');
    }

    const messageCount = response.data.data?.messages?.length || 0;
    const hasMore = response.data.data?.pagination?.has_more || false;
    
    console.log(`✅ AI Server: Fetched ${messageCount} messages (has_more: ${hasMore})`);
    return response.data;
  } catch (error) {
    console.error('💥 AI Server: Error in getMessagesServer:', error);
    throw error;
  }
}