// src/services/ai/messages.client.ts

/**
 * AI Messages Client Service - V9 Industry Standard
 * 
 * UPDATED: V9 - Unified sendMessage function with stream option.
 * 
 * Following OpenAI/Anthropic patterns:
 * - Single function handles both streaming and non-streaming
 * - `stream` parameter in options controls behavior
 * - Default: stream=false (backward compatible)
 * 
 * BROWSER ONLY - never import in server components
 * 
 * @module services/ai/messages.client
 */

'use client';

import { nextjsApiClient } from '@/lib/nextjs-api';
import {
  SendMessageRequest,
  SendMessageResponse,
  GetMessagesParams,
  GetMessagesResponse,
  StreamChunk,
  StreamingCallbacks,
  StreamingResult,
} from '@/types/ai';

const API_VERSION = '/api/v1';

// =============================================================================
// V9 UNIFIED SEND MESSAGE
// =============================================================================

/**
 * Options for sendMessage function
 */
export interface SendMessageOptions {
  /**
   * V9: Streaming control
   * - false (default): Returns JSON response
   * - true: Returns SSE stream with callbacks
   */
  stream?: boolean;
  
  /** Callbacks for streaming mode */
  onChunk?: (chunk: StreamChunk) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
  
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Send a message to AI - V9 Unified
 * 
 * Single function handles both streaming and non-streaming based on options.
 * Creates conversation automatically if conversation_id is not provided.
 * 
 * @example
 * // Non-streaming (default)
 * const response = await sendMessage({ message: "Find influencers" });
 * 
 * @example
 * // Streaming
 * const result = await sendMessage(
 *   { message: "Find influencers" },
 *   { 
 *     stream: true,
 *     onChunk: (chunk) => console.log(chunk),
 *     onComplete: () => console.log('Done')
 *   }
 * );
 */
export async function sendMessage(
  data: SendMessageRequest,
  options: SendMessageOptions = {}
): Promise<SendMessageResponse | StreamingResult> {
  const { stream = false, onChunk, onComplete, onError, signal } = options;

  if (typeof window === 'undefined') {
    throw new Error('sendMessage can only be called from browser');
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  // =========================================================================
  // STREAMING MODE
  // =========================================================================
  if (stream) {
    return sendMessageStreaming(data, { onChunk, onComplete, onError, signal });
  }

  // =========================================================================
  // NON-STREAMING MODE (default)
  // =========================================================================
  try {
    console.log('📤 AI Client: Sending message (non-streaming)');
    console.log('📤 AI Client: Conversation ID:', data.conversation_id || 'NEW');

    // Add stream=false to request body
    const requestData = {
      ...data,
      stream: false
    };

    const endpoint = `${API_VERSION}/ai/messages`;
    const response = await nextjsApiClient.post<SendMessageResponse>(endpoint, requestData);

    if (response.error) {
      console.error('❌ AI Client: Error sending message:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ AI Client: Message sent successfully');
    console.log('✅ AI Client: Conversation ID:', response.data.data?.conversation_id);
    console.log('✅ AI Client: Message ID:', response.data.data?.message_id);
    
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in sendMessage:', error);
    throw error;
  }
}

// =============================================================================
// INTERNAL: STREAMING IMPLEMENTATION
// =============================================================================

/**
 * Internal streaming implementation
 */
async function sendMessageStreaming(
  data: SendMessageRequest,
  callbacks: StreamingCallbacks = {}
): Promise<StreamingResult> {
  const { onChunk, onComplete, onError, signal } = callbacks;

  const token = localStorage.getItem('accessToken');
  if (!token) {
    const error = new Error('No authentication token found');
    onError?.(error);
    return { success: false, error: error.message };
  }

  let conversationId: string | undefined = data.conversation_id || undefined;
  let finalChunk: StreamChunk | undefined;  // V9: Renamed from finalResult to match useChat expectations

  try {
    console.log('🌊 AI Client: Sending message (streaming)');
    console.log('🌊 AI Client: Conversation ID:', data.conversation_id || 'NEW');

    // V9: Add stream=true to request body (not headers!)
    const requestData = {
      ...data,
      stream: true
    };

    const endpoint = `${API_VERSION}/ai/messages`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        // V9: No Accept/X-Stream headers needed - stream param is in body
      },
      body: JSON.stringify(requestData),
      signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check if response is SSE
    const contentType = response.headers.get('content-type');
    
    if (!contentType?.includes('text/event-stream')) {
      // Non-streaming response - parse as JSON (graceful fallback)
      console.log('📦 AI Client: Received non-streaming response (fallback)');
      const jsonResponse = await response.json();

      if (jsonResponse.success && jsonResponse.data) {
        conversationId = jsonResponse.data.conversation_id || undefined;
        finalChunk = {
          type: 'result',
          content: jsonResponse.data.response,
          conversation_id: conversationId,
          data: jsonResponse.data,
        };
        onChunk?.(finalChunk);
      }

      onComplete?.();
      return {
        success: jsonResponse.success,
        conversationId,
        finalChunk,  // V9: Renamed for useChat compatibility
        error: jsonResponse.error,
      };
    }

    // Process SSE stream
    console.log('🌊 AI Client: Processing SSE stream');

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body reader available');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.log('🌊 AI Client: Stream ended');
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE messages
      const messages = buffer.split('\n\n');
      buffer = messages.pop() || '';

      for (const message of messages) {
        if (!message.trim()) continue;

        const lines = message.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6);
              const chunk: StreamChunk = JSON.parse(jsonStr);

              console.log(`🌊 AI Client: Received ${chunk.type}:`, chunk.content?.substring(0, 50));

              if (chunk.conversation_id) {
                conversationId = chunk.conversation_id;
              }

              // V9: Capture finalChunk for result-like types
              if (['result', 'clarification', 'help', 'text'].includes(chunk.type)) {
                console.log('🌊 AI Client: Setting finalChunk from type:', chunk.type);
                finalChunk = chunk;
              }
              
              // V9: Also capture if chunk has data (result even if type is different)
              if (chunk.data && !finalChunk) {
                console.log('🌊 AI Client: Setting finalChunk from chunk with data');
                finalChunk = chunk;
              }

              onChunk?.(chunk);

              if (chunk.type === 'error') {
                console.error('🌊 AI Client: Received error chunk:', chunk.content);
                throw new Error(chunk.content || 'Streaming error');
              }

            } catch (parseError) {
              console.warn('⚠️ AI Client: Failed to parse SSE chunk:', line);
            }
          }
        }
      }
    }

    onComplete?.();

    return {
      success: true,
      conversationId,
      finalChunk,  // V9: Renamed for useChat compatibility
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('🛑 AI Client: Stream aborted');
      return { success: false, error: 'Cancelled', conversationId };
    }

    const errorMessage = error instanceof Error ? error.message : 'Streaming failed';
    console.error('❌ AI Client: Streaming error:', errorMessage);
    onError?.(error instanceof Error ? error : new Error(errorMessage));

    return {
      success: false,
      error: errorMessage,
      conversationId,
    };
  }
}

// =============================================================================
// UTILITIES
// =============================================================================

/**
 * Check if streaming is enabled in environment
 */
export function isStreamingEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const envDisabled = process.env.NEXT_PUBLIC_AI_STREAMING_ENABLED === 'false';
  return !envDisabled;
}

/**
 * Create an AbortController for cancelling streams
 */
export function createStreamAbortController(): AbortController {
  return new AbortController();
}

// =============================================================================
// GET MESSAGES (unchanged)
// =============================================================================

/**
 * Get messages for a conversation with cursor-based pagination
 */
export async function getMessages(
  conversationId: string,
  params: GetMessagesParams = {}
): Promise<GetMessagesResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getMessages can only be called from browser');
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log(`📬 AI Client: Fetching messages for conversation ${conversationId}`);
    console.log('📬 AI Client: Pagination:', params);

    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);
    if (params.direction) queryParams.append('direction', params.direction);

    const queryString = queryParams.toString();
    const endpoint = queryString
      ? `${API_VERSION}/ai/conversations/${conversationId}/messages?${queryString}`
      : `${API_VERSION}/ai/conversations/${conversationId}/messages`;

    const response = await nextjsApiClient.get<GetMessagesResponse>(endpoint);

    if (response.error) {
      console.error('❌ AI Client: Error fetching messages:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No messages data received');
    }

    const messageCount = response.data.data?.messages?.length || 0;
    const hasMore = response.data.data?.pagination?.has_more || false;
    
    console.log(`✅ AI Client: Fetched ${messageCount} messages (has_more: ${hasMore})`);
    return response.data;
  } catch (error) {
    console.error('💥 AI Client: Error in getMessages:', error);
    throw error;
  }
}

// =============================================================================
// RE-EXPORT TYPES
// =============================================================================

export type {
  StreamChunk,
  StreamingCallbacks,
  StreamingResult,
};