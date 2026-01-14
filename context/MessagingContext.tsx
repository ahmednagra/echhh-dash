// src/context/MessagingContext.tsx
/**
 * Messaging Context Provider
 * 
 * Global state management for messaging module
 * Handles conversation threads, messages, and real-time updates
 * 
 * Pattern: Similar to Redux/Zustand but using React Context
 * Following enterprise patterns from Slack, Microsoft Teams, Meta Messenger
 */

'use client';

import React, { createContext, useContext, useCallback, useReducer, ReactNode } from 'react';
import {
  ConversationThread,
  Message,
  SendMessageRequest,
  SendMessageResponse,
  MessagingSessionState,
  MessagingContextActions,
  MessagingError,
  ConversationThreadFilters,
  PaginationMetadata,
  MessagingPlatform,
} from '@/types/messaging';
import {
  fetchConversationThreads,
  fetchMessages,
  sendMessage as sendMessageApi,
  markMessagesAsRead as markMessagesAsReadApi,
  archiveConversationThread as archiveThreadApi,
  pinConversationThread as pinThreadApi,
  muteConversationThread as muteThreadApi,
} from '@/services/agent-social-connections/messaging.client';

// ============================================================================
// STATE TYPES
// ============================================================================

interface MessagingState extends MessagingSessionState {
  activePlatform: MessagingPlatform | null;
  conversationThreadsPagination: PaginationMetadata | null;
  messagesPagination: Record<string, PaginationMetadata>;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

type MessagingAction =
  | { type: 'SET_ACTIVE_CONNECTION'; payload: { connectionId: string; platform: MessagingPlatform } }
  | { type: 'SET_ACTIVE_THREAD'; payload: string | null }
  | { type: 'SET_CONVERSATION_THREADS'; payload: { threads: ConversationThread[]; pagination: PaginationMetadata } }
  | { type: 'SET_MESSAGES'; payload: { threadId: string; messages: Message[]; pagination: PaginationMetadata } }
  | { type: 'ADD_MESSAGE'; payload: { threadId: string; message: Message } }
  | { type: 'UPDATE_THREAD'; payload: ConversationThread }
  | { type: 'REMOVE_THREAD'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: MessagingError | null }
  | { type: 'CLEAR_MESSAGES'; payload: string }
  | { type: 'UPDATE_UNREAD_COUNT'; payload: { threadId: string; count: number } };

// ============================================================================
// REDUCER
// ============================================================================

const initialState: MessagingState = {
  activePlatformConnectionId: null,
  activePlatform: null,
  activeConversationThreadId: null,
  conversationThreads: [],
  messages: {},
  typingIndicators: {},
  isLoading: false,
  error: null,
  conversationThreadsPagination: null,
  messagesPagination: {},
};

function messagingReducer(state: MessagingState, action: MessagingAction): MessagingState {
  switch (action.type) {
    case 'SET_ACTIVE_CONNECTION':
      return {
        ...state,
        activePlatformConnectionId: action.payload.connectionId,
        activePlatform: action.payload.platform,
        activeConversationThreadId: null,
        conversationThreads: [],
        messages: {},
      };

    case 'SET_ACTIVE_THREAD':
      return {
        ...state,
        activeConversationThreadId: action.payload,
      };

    case 'SET_CONVERSATION_THREADS':
      return {
        ...state,
        conversationThreads: action.payload.threads,
        conversationThreadsPagination: action.payload.pagination,
        isLoading: false,
        error: null,
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.threadId]: action.payload.messages,
        },
        messagesPagination: {
          ...state.messagesPagination,
          [action.payload.threadId]: action.payload.pagination,
        },
        isLoading: false,
        error: null,
      };

    case 'ADD_MESSAGE':
      const existingMessages = state.messages[action.payload.threadId] || [];
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.payload.threadId]: [...existingMessages, action.payload.message],
        },
      };

    case 'UPDATE_THREAD':
      return {
        ...state,
        conversationThreads: state.conversationThreads.map((thread) =>
          thread.id === action.payload.id ? action.payload : thread
        ),
      };

    case 'REMOVE_THREAD':
      return {
        ...state,
        conversationThreads: state.conversationThreads.filter(
          (thread) => thread.id !== action.payload
        ),
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'CLEAR_MESSAGES':
      const { [action.payload]: _, ...remainingMessages } = state.messages;
      return {
        ...state,
        messages: remainingMessages,
      };

    case 'UPDATE_UNREAD_COUNT':
      return {
        ...state,
        conversationThreads: state.conversationThreads.map((thread) =>
          thread.id === action.payload.threadId
            ? { ...thread, unreadMessageCount: action.payload.count }
            : thread
        ),
      };

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT DEFINITION
// ============================================================================

interface MessagingContextValue extends MessagingState, MessagingContextActions {
  activePlatform: MessagingPlatform | null;
}

const MessagingContext = createContext<MessagingContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

interface MessagingProviderProps {
  children: ReactNode;
  defaultConnectionId?: string;
  defaultPlatform?: MessagingPlatform;
}

export function MessagingProvider({ 
  children, 
  defaultConnectionId,
  defaultPlatform 
}: MessagingProviderProps) {
  const [state, dispatch] = useReducer(messagingReducer, {
    ...initialState,
    activePlatformConnectionId: defaultConnectionId || null,
    activePlatform: defaultPlatform || null,
  });

  // ============================================================================
  // ACTIONS IMPLEMENTATION
  // ============================================================================

  const selectPlatformConnection = useCallback(async (
    connectionId: string,
    platform?: MessagingPlatform
  ) => {
    // Use the current activePlatform or default to a platform
    // const platform = state.activePlatform || platform;
    if (!platform) {
      throw new Error('No platform specified and no active platform available');
    }
    try {
      console.log(`[MessagingContext] Selecting platform connection: ${connectionId} (${platform})`);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ACTIVE_CONNECTION', payload: { connectionId, platform } });

      // Fetch conversation threads for the new connection
      const response = await fetchConversationThreads(connectionId, platform);
      
      dispatch({
        type: 'SET_CONVERSATION_THREADS',
        payload: {
          threads: response.threads,
          pagination: response.pagination,
        },
      });

      console.log(`[MessagingContext] Successfully loaded ${response.threads.length} conversation threads`);
    } catch (error) {
      console.error('[MessagingContext] Error selecting platform connection:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'CONNECTION_SELECTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to select connection',
          retryable: true,
          timestamp: new Date(),
        },
      });
    }
  }, []);

  const selectConversationThread = useCallback(async (threadId: string) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Selecting conversation thread: ${threadId}`);
      dispatch({ type: 'SET_ACTIVE_THREAD', payload: threadId });

      // Fetch messages for the selected thread
      if (!state.messages[threadId]) {
        dispatch({ type: 'SET_LOADING', payload: true });
        const response = await fetchMessages(
          state.activePlatformConnectionId,
          state.activePlatform,
          threadId
        );
        
        dispatch({
          type: 'SET_MESSAGES',
          payload: {
            threadId,
            messages: response.messages,
            pagination: response.pagination,
          },
        });

        console.log(`[MessagingContext] Loaded ${response.messages.length} messages for thread ${threadId}`);
      }
    } catch (error) {
      console.error('[MessagingContext] Error selecting conversation thread:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'THREAD_SELECTION_FAILED',
          message: error instanceof Error ? error.message : 'Failed to select conversation thread',
          retryable: true,
          timestamp: new Date(),
        },
      });
    }
  }, [state.activePlatformConnectionId, state.activePlatform, state.messages]);

  const loadConversationThreads = useCallback(async (filters?: ConversationThreadFilters) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log('[MessagingContext] Loading conversation threads');
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetchConversationThreads(
        state.activePlatformConnectionId,
        state.activePlatform
      );
      
      dispatch({
        type: 'SET_CONVERSATION_THREADS',
        payload: {
          threads: response.threads,
          pagination: response.pagination,
        },
      });
    } catch (error) {
      console.error('[MessagingContext] Error loading conversation threads:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'THREADS_LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load conversation threads',
          retryable: true,
          timestamp: new Date(),
        },
      });
    }
  }, [state.activePlatformConnectionId, state.activePlatform]);

  const loadMessages = useCallback(async (threadId: string, page?: number) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Loading messages for thread: ${threadId}`);
      dispatch({ type: 'SET_LOADING', payload: true });

      const response = await fetchMessages(
        state.activePlatformConnectionId,
        state.activePlatform,
        threadId
      );
      
      dispatch({
        type: 'SET_MESSAGES',
        payload: {
          threadId,
          messages: response.messages,
          pagination: response.pagination,
        },
      });
    } catch (error) {
      console.error('[MessagingContext] Error loading messages:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: {
          code: 'MESSAGES_LOAD_FAILED',
          message: error instanceof Error ? error.message : 'Failed to load messages',
          retryable: true,
          timestamp: new Date(),
        },
      });
    }
  }, [state.activePlatformConnectionId, state.activePlatform]);

  const sendMessage = useCallback(async (
    messageRequest: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      if (!state.activeConversationThreadId) {
        throw new Error('No active conversation thread selected');
      }

      console.log('[MessagingContext] Sending message');

      const response = await sendMessageApi(
        state.activePlatformConnectionId,
        state.activePlatform,
        messageRequest
      );
      
      // Add the sent message to the local state
      if (response.success && response.message) {
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            threadId: state.activeConversationThreadId,
            message: response.message,
          },
        });
      }

      return response;
    } catch (error) {
      console.error('[MessagingContext] Error sending message:', error);
      throw error;
    }
  }, [state.activePlatformConnectionId, state.activePlatform, state.activeConversationThreadId]);

  const markMessagesAsRead = useCallback(async (threadId: string, messageIds: string[]) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Marking ${messageIds.length} messages as read`);

      await markMessagesAsReadApi(
        state.activePlatformConnectionId,
        state.activePlatform,
        threadId,
        messageIds
      );
      
      // Update unread count
      dispatch({
        type: 'UPDATE_UNREAD_COUNT',
        payload: { threadId, count: 0 },
      });
    } catch (error) {
      console.error('[MessagingContext] Error marking messages as read:', error);
      throw error;
    }
  }, [state.activePlatformConnectionId, state.activePlatform]);

  const archiveConversationThread = useCallback(async (threadId: string) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Archiving conversation thread: ${threadId}`);

      await archiveThreadApi(
        state.activePlatformConnectionId,
        state.activePlatform,
        threadId
      );
      
      dispatch({ type: 'REMOVE_THREAD', payload: threadId });
    } catch (error) {
      console.error('[MessagingContext] Error archiving conversation thread:', error);
      throw error;
    }
  }, [state.activePlatformConnectionId, state.activePlatform]);

  const pinConversationThread = useCallback(async (threadId: string) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Pinning conversation thread: ${threadId}`);

      await pinThreadApi(
        state.activePlatformConnectionId,
        state.activePlatform,
        threadId
      );
      
      // Update thread in local state
      const updatedThread = state.conversationThreads.find((t) => t.id === threadId);
      if (updatedThread) {
        dispatch({
          type: 'UPDATE_THREAD',
          payload: {
            ...updatedThread,
            metadata: { ...updatedThread.metadata, isPinned: true },
          },
        });
      }
    } catch (error) {
      console.error('[MessagingContext] Error pinning conversation thread:', error);
      throw error;
    }
  }, [state.activePlatformConnectionId, state.activePlatform, state.conversationThreads]);

  const muteConversationThread = useCallback(async (threadId: string) => {
    try {
      if (!state.activePlatformConnectionId || !state.activePlatform) {
        throw new Error('No active platform connection selected');
      }

      console.log(`[MessagingContext] Muting conversation thread: ${threadId}`);

      await muteThreadApi(
        state.activePlatformConnectionId,
        state.activePlatform,
        threadId
      );
      
      // Update thread in local state
      const updatedThread = state.conversationThreads.find((t) => t.id === threadId);
      if (updatedThread) {
        dispatch({
          type: 'UPDATE_THREAD',
          payload: {
            ...updatedThread,
            metadata: { ...updatedThread.metadata, isMuted: true },
          },
        });
      }
    } catch (error) {
      console.error('[MessagingContext] Error muting conversation thread:', error);
      throw error;
    }
  }, [state.activePlatformConnectionId, state.activePlatform, state.conversationThreads]);

  const refreshConversationThreads = useCallback(async () => {
    await loadConversationThreads();
  }, [loadConversationThreads]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: MessagingContextValue = {
    ...state,
    selectPlatformConnection,
    selectConversationThread,
    loadConversationThreads,
    loadMessages,
    sendMessage,
    markMessagesAsRead,
    archiveConversationThread,
    pinConversationThread,
    muteConversationThread,
    refreshConversationThreads,
  };

  return (
    <MessagingContext.Provider value={contextValue}>
      {children}
    </MessagingContext.Provider>
  );
}

// ============================================================================
// CUSTOM HOOK
// ============================================================================

/**
 * Custom hook to access messaging context
 * 
 * @throws Error if used outside MessagingProvider
 * @returns Messaging context value with state and actions
 */
export function useMessaging(): MessagingContextValue {
  const context = useContext(MessagingContext);
  
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  
  return context;
}