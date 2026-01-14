// src/hooks/ai/useChat.ts

/**
 * useChat Hook - V9 Industry Standard
 * 
 * UPDATED: V9 - Uses unified sendMessage with stream option.
 * 
 * Comprehensive hook for AI chat functionality including:
 * - Sending messages (with optional streaming)
 * - Managing conversations
 * - Cursor-based pagination for message history
 * - Loading state management
 * - Error handling
 * 
 * V9 Changes:
 * - Single sendMessage call with stream option
 * - Simplified streaming logic
 * - Removed filters_used (only applied_filters)
 * 
 * @module hooks/ai/useChat
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  sendMessage as sendMessageClient,
  getMessages as getMessagesClient,
  isStreamingEnabled as checkStreamingEnabled,
  createStreamAbortController,
  StreamChunk,
} from '@/services/ai/messages.client';
import {
  getConversations as getConversationsClient,
} from '@/services/ai/conversations.client';
import {
  AIMessage,
  AIConversation,
  SendMessageRequest,
  MessagePagination,
  CampaignTab,
  InfluencerSearchResults,
  AIInsights,
  StreamingResult,
  SendMessageResponse,
} from '@/types/ai';

// Note: StreamingResult now includes finalChunk in base type (V9)

// =============================================================================
// TYPES
// =============================================================================

/**
 * Hook configuration options
 */
export interface UseChatOptions {
  /** Campaign ID for context */
  campaignId?: string;
  /** Current tab for context-aware AI routing */
  currentTab?: CampaignTab;
  /** Auto-load conversation on mount */
  autoLoad?: boolean;
  /** Messages per page for pagination */
  pageSize?: number;
  /** Enable streaming mode (default: true if env allows) */
  enableStreaming?: boolean;
}

/**
 * Message with UI state
 */
export interface ChatMessage extends AIMessage {
  isLoading?: boolean;
  isError?: boolean;
  isStreaming?: boolean;
  streamStatus?: string;
  searchResults?: InfluencerSearchResults;
  aiInsights?: AIInsights;
  suggestions?: string[];
}

/**
 * Send message result with additional data
 * V9: appliedFilters is the primary source, filtersUsed kept for backward compatibility
 */
export interface SendResult {
  success: boolean;
  conversationId?: string;
  messageId?: string;
  searchResults?: InfluencerSearchResults;
  aiInsights?: AIInsights;
  suggestions?: string[];
  appliedFilters?: Record<string, any>;  // V9: Single source of truth
  filtersUsed?: Record<string, any>;     // Backward compatibility alias
  error?: string;
  wasStreaming?: boolean;
}

/**
 * Hook return type
 */
export interface UseChatReturn {
  // State
  messages: ChatMessage[];
  conversations: AIConversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  isSending: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  hasMoreMessages: boolean;  // Alias for hasMore (ChatInterface compatibility)
  streamingEnabled: boolean;
  // Streaming state (Phase B)
  isStreaming: boolean;
  streamStatus: string | null;
  
  // Actions
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<SendResult>;
  loadMessages: (conversationId: string, reset?: boolean) => Promise<void>;
  loadMoreMessages: (direction?: 'before' | 'after') => Promise<void>;
  loadConversations: (campaignId: string) => Promise<void>;
  setCurrentConversation: (conversationId: string | null) => void;
  switchConversation: (conversationId: string) => void;  // Alias for setCurrentConversation
  startNewConversation: () => void;
  clearMessages: () => void;
  clearError: () => void;
  abortStreaming: () => void;
  cancelStream: () => void;  // Alias for abortStreaming
}

/**
 * Options for sending messages
 */
export interface SendMessageOptions {
  /** Override streaming setting for this message */
  stream?: boolean;
  /** Conversation ID override */
  conversationId?: string;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Extract search results from various response formats
 */
function extractSearchResults(responseData: any): InfluencerSearchResults | undefined {
  if (!responseData) return undefined;
  
  // V9: Check search_results structure FIRST (streaming format)
  if (responseData.search_results?.influencers) {
    const sr = responseData.search_results;
    return {
      influencers: sr.influencers,
      total_count: sr.total_count,
      limit: sr.limit || sr.influencers.length,
      offset: sr.offset || 0,
      source: sr.source || 'insightiq',
      metadata: sr.metadata,
      applied_filters: sr.applied_filters,  // V9: Include applied_filters
    };
  }
  
  // Check data.search_results (nested format)
  if (responseData.data?.search_results?.influencers) {
    const sr = responseData.data.search_results;
    return {
      influencers: sr.influencers,
      total_count: sr.total_count,
      limit: sr.limit || sr.influencers.length,
      offset: sr.offset || 0,
      source: sr.source || 'insightiq',
      metadata: sr.metadata,
      applied_filters: sr.applied_filters,
    };
  }
  
  // Legacy: Direct influencers array
  if (responseData.influencers) {
    return {
      influencers: responseData.influencers,
      total_count: responseData.total_count || responseData.influencers.length,
      limit: responseData.limit || responseData.influencers.length,
      offset: responseData.offset || 0,
      source: responseData.source || 'insightiq',
      metadata: responseData.metadata,
      applied_filters: responseData.applied_filters,
    };
  }
  
  return undefined;
}

/**
 * Extract filters from response
 * V9: Only use applied_filters (removed redundant filters_used)
 */
function extractFilters(responseData: any): Record<string, any> | undefined {
  if (!responseData) return undefined;
  
  // V9: Only use applied_filters (single source of truth)
  // Priority: search_results.applied_filters (contains full API payload)
  const filters = responseData.search_results?.applied_filters ||  // Primary: streaming structure
                  responseData.data?.search_results?.applied_filters ||  // Nested streaming
                  responseData.applied_filters ||  // Direct
                  responseData.data?.applied_filters;  // Nested direct
  
  console.log('🔍 extractFilters: Found applied_filters:', filters ? Object.keys(filters) : 'none');
  
  return filters;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    campaignId,
    currentTab,
    autoLoad = false,
    pageSize = 20,
    enableStreaming,
  } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<MessagePagination | null>(null);
  
  // Streaming state (Phase B)
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);
  
  // Check if streaming is enabled
  const streamingEnabled = enableStreaming !== undefined 
    ? enableStreaming 
    : checkStreamingEnabled();

  // Refs
  const conversationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync ref with state
  useEffect(() => {
    conversationIdRef.current = currentConversationId;
  }, [currentConversationId]);

  // ==========================================================================
  // LOAD CONVERSATIONS
  // ==========================================================================

  const loadConversations = useCallback(async (campaignId: string) => {
    try {
      const result = await getConversationsClient({ campaign_id: campaignId });
      if (result.success && result.data) {
        setConversations(result.data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  // ==========================================================================
  // LOAD MESSAGES
  // ==========================================================================

  const loadMessages = useCallback(async (conversationId: string, reset = true) => {
    if (!conversationId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await getMessagesClient(conversationId, { limit: pageSize });

      if (result.success && result.data) {
        const newMessages: ChatMessage[] = result.data.messages.map(msg => ({
          ...msg,
          isLoading: false,
          isError: false,
        }));

        if (reset) {
          setMessages(newMessages);
        } else {
          setMessages(prev => [...newMessages, ...prev]);
        }

        setPagination(result.data.pagination || null);
        setCurrentConversationId(conversationId);
        conversationIdRef.current = conversationId;
      } else {
        setError(result.error || 'Failed to load messages');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  // ==========================================================================
  // LOAD MORE MESSAGES
  // ==========================================================================

  const loadMoreMessages = useCallback(async (direction: 'before' | 'after' = 'before') => {
    if (!currentConversationId || !pagination?.has_more || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const result = await getMessagesClient(currentConversationId, {
        limit: pageSize,
        cursor: pagination.next_cursor || undefined,
      });

      if (result.success && result.data) {
        const newMessages: ChatMessage[] = result.data.messages.map(msg => ({
          ...msg,
          isLoading: false,
          isError: false,
        }));

        // Direction determines where to insert messages
        if (direction === 'before') {
          setMessages(prev => [...newMessages, ...prev]);
        } else {
          setMessages(prev => [...prev, ...newMessages]);
        }
        setPagination(result.data.pagination || null);
      }
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentConversationId, pagination, pageSize, isLoadingMore]);

  // ==========================================================================
  // ABORT STREAMING
  // ==========================================================================

  const abortStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // ==========================================================================
  // SEND MESSAGE - V9 UNIFIED
  // ==========================================================================

  const sendMessage = useCallback(async (
    content: string,
    options: SendMessageOptions = {}
  ): Promise<SendResult> => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return { success: false, error: 'Message cannot be empty' };
    }

    // Determine if we should stream
    const shouldStream = options.stream !== undefined 
      ? options.stream 
      : streamingEnabled;

    setIsSending(true);
    setError(null);
    // V9: Clear streaming states when starting new message
    setIsStreaming(false);
    setStreamStatus(null);

    // Create temporary message IDs
    const tempUserMessageId = `temp-user-${Date.now()}`;
    const tempAssistantMessageId = `temp-assistant-${Date.now()}`;

    // Add user message immediately
    const userMessage: ChatMessage = {
      id: tempUserMessageId,
      conversation_id: options.conversationId || currentConversationId || '',
      user_id: null,
      role: 'user',
      content: trimmedContent,
      timestamp: new Date().toISOString(),
      metadata: {},
    };

    setMessages(prev => [...prev, userMessage]);

    // Add placeholder assistant message
    const assistantPlaceholder: ChatMessage = {
      id: tempAssistantMessageId,
      conversation_id: options.conversationId || currentConversationId || '',
      user_id: null,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      metadata: {},
      isLoading: true,
      isStreaming: shouldStream,
      streamStatus: shouldStream ? 'Connecting...' : undefined,
    };

    setMessages(prev => [...prev, assistantPlaceholder]);

    // Build request
    const requestData: SendMessageRequest = {
      message: trimmedContent,
      context: {
        current_tab: currentTab,
        campaign_id: campaignId,
      },
      conversation_id: options.conversationId || currentConversationId || undefined,
    };

    try {
      // =====================================================================
      // STREAMING MODE
      // =====================================================================
      if (shouldStream) {
        console.log('🌊 useChat: Using streaming mode');
        
        // Set streaming state
        setIsStreaming(true);
        setStreamStatus('Connecting...');
        
        // Create abort controller
        abortControllerRef.current = createStreamAbortController();
        
        const result = await sendMessageClient(requestData, {
          stream: true,
          signal: abortControllerRef.current.signal,
          onChunk: (chunk: StreamChunk) => {
            // V9: Handle each chunk type
            if (chunk.type === 'text' && chunk.content) {
              // Text content - append to message
              setStreamStatus(null);  // Clear status when text arrives
              setMessages(prev => prev.map(msg =>
                msg.id === tempAssistantMessageId
                  ? {
                      ...msg,
                      content: (msg.content || '') + chunk.content,
                      isStreaming: true,
                      streamStatus: undefined,
                    }
                  : msg
              ));
            } else if (chunk.type === 'status') {
              // Status update
              setStreamStatus(chunk.content || null);
              setMessages(prev => prev.map(msg =>
                msg.id === tempAssistantMessageId
                  ? { ...msg, streamStatus: chunk.content }
                  : msg
              ));
            } else if (chunk.type === 'progress') {
              // Progress update
              setStreamStatus(chunk.content || null);
              setMessages(prev => prev.map(msg =>
                msg.id === tempAssistantMessageId
                  ? { ...msg, streamStatus: chunk.content }
                  : msg
              ));
            }
          },
        }) as StreamingResult;
        
        // Clear streaming state
        setIsStreaming(false);
        setStreamStatus(null);
        abortControllerRef.current = null;

        if (result.success && result.finalChunk) {
          const finalChunk = result.finalChunk;
          
          // Extract search results
          const searchResults = extractSearchResults(finalChunk.data) || 
                               extractSearchResults(finalChunk);

          // Update conversation ID if new
          if (result.conversationId && !currentConversationId) {
            setCurrentConversationId(result.conversationId);
            conversationIdRef.current = result.conversationId;
            if (campaignId) loadConversations(campaignId);
          }

          // V9: Use final content from chunk
          const finalContent = finalChunk.content || 
                              finalChunk.data?.content ||
                              '';

          // Update assistant message with final data
          setMessages(prev => prev.map(msg => {
            if (msg.id === tempAssistantMessageId) {
              return {
                ...msg,
                content: msg.content || finalContent,
                conversation_id: result.conversationId || msg.conversation_id,
                isLoading: false,
                isStreaming: false,
                streamStatus: undefined,
                searchResults,
                aiInsights: finalChunk.data?.ai_insights,
                suggestions: finalChunk.data?.suggestions,
              };
            }
            if (msg.id === tempUserMessageId) {
              return {
                ...msg,
                conversation_id: result.conversationId || msg.conversation_id,
              };
            }
            return msg;
          }));

          // V9: Only use applied_filters (single source of truth)
          const appliedFilters = searchResults?.applied_filters || extractFilters(finalChunk);
          
          console.log('🔍 useChat Streaming: appliedFilters:', appliedFilters ? Object.keys(appliedFilters) : 'none');

          setIsSending(false);
          return {
            success: true,
            conversationId: result.conversationId,
            searchResults,
            suggestions: finalChunk.data?.suggestions,
            appliedFilters,  // V9: Single source of truth
            filtersUsed: appliedFilters,  // Backward compatibility
            wasStreaming: true,
          };
        } else if (result.success && !result.finalChunk) {
          // V9: Streaming succeeded but no finalChunk - content was streamed to message
          console.log('⚠️ useChat Streaming: No finalChunk, using streamed content');
          
          // Get the current message content that was streamed
          const currentMessage = messages.find(m => m.id === tempAssistantMessageId);
          
          setMessages(prev => prev.map(msg =>
            msg.id === tempAssistantMessageId
              ? { ...msg, isLoading: false, isStreaming: false, streamStatus: undefined }
              : msg
          ));
          
          setIsSending(false);
          return {
            success: true,
            conversationId: result.conversationId,
            wasStreaming: true,
          };
        } else {
          // Actual error
          const errorMsg = result.error || 'Unknown streaming error';
          console.error('❌ useChat Streaming error:', errorMsg);
          throw new Error(errorMsg);
        }
      }

      // =====================================================================
      // NON-STREAMING MODE
      // =====================================================================
      console.log('📦 useChat: Using non-streaming mode');

      const response = await sendMessageClient(requestData, { stream: false }) as SendMessageResponse;

      if (response.success && response.data) {
        const { 
          response: aiResponse, 
          conversation_id, 
          message_id,
          agent_used,
          confidence_score,
          routing_reason,
          suggestions,
          data: responseData,
        } = response.data;

        if (conversation_id && !currentConversationId) {
          setCurrentConversationId(conversation_id);
          conversationIdRef.current = conversation_id;
          if (campaignId) loadConversations(campaignId);
        }

        const searchResults = extractSearchResults(responseData);
        
        // V9: Only use applied_filters
        const appliedFilters = extractFilters(responseData);

        const assistantMessage: ChatMessage = {
          id: message_id || tempAssistantMessageId,
          conversation_id: conversation_id || currentConversationId || '',
          user_id: null,
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString(),
          metadata: { agent_used, confidence_score, routing_reason, suggestions },
          searchResults,
          aiInsights: responseData?.ai_insights,
          suggestions,
        };

        setMessages(prev => {
          const updated = prev.filter(m => m.id !== tempAssistantMessageId);
          const withUpdatedUser = updated.map(m => 
            m.id === tempUserMessageId 
              ? { ...m, conversation_id: conversation_id || m.conversation_id }
              : m
          );
          return [...withUpdatedUser, assistantMessage];
        });

        setIsSending(false);
        return {
          success: true,
          conversationId: conversation_id || undefined,
          messageId: message_id || undefined,
          searchResults,
          aiInsights: responseData?.ai_insights,
          suggestions,
          appliedFilters,  // V9: Single source of truth
          filtersUsed: appliedFilters,  // Backward compatibility
          wasStreaming: false,
        };
      } else {
        throw new Error(response.error || 'Failed to send message');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      
      // Update assistant message to show error
      setMessages(prev => prev.map(msg =>
        msg.id === tempAssistantMessageId
          ? {
              ...msg,
              content: `Error: ${errorMessage}`,
              isLoading: false,
              isStreaming: false,
              isError: true,
            }
          : msg
      ));

      setError(errorMessage);
      setIsSending(false);
      setIsStreaming(false);
      setStreamStatus(null);
      return { success: false, error: errorMessage };
    }
  }, [
    currentConversationId,
    currentTab,
    campaignId,
    streamingEnabled,
    loadConversations,
  ]);

  // ==========================================================================
  // UTILITY ACTIONS
  // ==========================================================================

  const setCurrentConversation = useCallback((conversationId: string | null) => {
    setCurrentConversationId(conversationId);
    conversationIdRef.current = conversationId;
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
      setPagination(null);
    }
  }, [loadMessages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setPagination(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    // V9: Also clear streaming states when error is dismissed
    setIsStreaming(false);
    setStreamStatus(null);
  }, []);

  // ==========================================================================
  // ALIAS FUNCTIONS (ChatInterface compatibility)
  // ==========================================================================

  const switchConversation = useCallback((conversationId: string) => {
    setCurrentConversation(conversationId);
  }, [setCurrentConversation]);

  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    conversationIdRef.current = null;
    setMessages([]);
    setPagination(null);
  }, []);

  const cancelStream = useCallback(() => {
    abortStreaming();
    setIsStreaming(false);
    setStreamStatus(null);
  }, [abortStreaming]);

  // ==========================================================================
  // AUTO-LOAD
  // ==========================================================================

  useEffect(() => {
    if (autoLoad && campaignId) {
      loadConversations(campaignId);
    }
  }, [autoLoad, campaignId, loadConversations]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    // State
    messages,
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    isLoadingMore,
    error,
    hasMore: pagination?.has_more || false,
    hasMoreMessages: pagination?.has_more || false,  // Alias
    streamingEnabled,
    // Streaming state (Phase B)
    isStreaming,
    streamStatus,
    
    // Actions
    sendMessage,
    loadMessages,
    loadMoreMessages,
    loadConversations,
    setCurrentConversation,
    switchConversation,  // Alias
    startNewConversation,
    clearMessages,
    clearError,
    abortStreaming,
    cancelStream,  // Alias
  };
}

export default useChat;