// src/hooks/useChat.ts

/**
 * useChat Hook
 * 
 * Main hook for managing chat messages and conversations
 * Handles sending messages, loading conversations, and managing state
 * 
 * Uses industry-standard 'conversations' terminology
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  sendChatMessage, 
  getChatConversations,
  createChatConversation,
  deleteChatConversation,
} from '@/services/chat/chat.client';
import { 
  ChatMessage, 
  ChatConversation, 
  ChatContext,
  SendMessageRequest,
} from '@/types/chat';

interface UseChatOptions {
  conversationId?: string;
  autoLoad?: boolean;
}

interface UseChatReturn {
  // Messages
  messages: ChatMessage[];
  
  // Conversation info
  conversation: ChatConversation | null;
  
  // Loading states
  isLoading: boolean;
  isSending: boolean;
  
  // Actions
  sendMessage: (content: string, context?: ChatContext) => Promise<void>;
  clearMessages: () => void;
  
  // Conversation management
  conversations: ChatConversation[];
  loadConversations: () => Promise<void>;
  createNewConversation: (name?: string) => Promise<ChatConversation | null>;
  deleteConversation: (id: string) => Promise<void>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const { conversationId, autoLoad = false } = options;

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>(conversationId);

  /**
   * Load conversations from backend
   */
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📋 useChat: Loading conversations');
      const response = await getChatConversations();

      if (response.success && response.data) {
        setConversations(response.data.conversations || []);
        console.log(`✅ useChat: Loaded ${response.data.conversations?.length || 0} conversations`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversations';
      console.error('💥 useChat: Error loading conversations:', errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(async (name?: string): Promise<ChatConversation | null> => {
    try {
      setError(null);
      console.log('📝 useChat: Creating new conversation');

      const response = await createChatConversation(name);

      if (response.success && response.data) {
        console.log('✅ useChat: Conversation created:', response.data.id);
        
        // Reload conversations to include new one
        await loadConversations();
        
        // Return minimal conversation object
        return {
          id: response.data.id,
          user_id: '',
          company_id: '',
          campaign_id: null,
          title: response.data.conversation_name || null,
          created_at: response.data.created_at,
          updated_at: response.data.created_at,
          message_count: 0,
          is_active: true,
        };
      }

      return null;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create conversation';
      console.error('💥 useChat: Error creating conversation:', errorMsg);
      setError(errorMsg);
      return null;
    }
  }, [loadConversations]);

  /**
   * Delete a conversation
   */
  const deleteConversation = useCallback(async (id: string) => {
    try {
      setError(null);
      console.log(`🗑️ useChat: Deleting conversation ${id}`);

      await deleteChatConversation(id);
      
      console.log('✅ useChat: Conversation deleted');
      
      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== id));
      
      // If deleted current conversation, clear messages
      if (id === currentConversationId) {
        setMessages([]);
        setCurrentConversationId(undefined);
        setConversation(null);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete conversation';
      console.error('💥 useChat: Error deleting conversation:', errorMsg);
      setError(errorMsg);
    }
  }, [currentConversationId]);

  /**
   * Send a message
   */
  const sendMessage = useCallback(async (content: string, context?: ChatContext) => {
    if (!content.trim()) {
      console.warn('⚠️ useChat: Empty message, skipping');
      return;
    }

    setIsSending(true);
    setError(null);

    // Add user message immediately (optimistic update)
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: currentConversationId || '',
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      console.log('💬 useChat: Sending message');

      const request: SendMessageRequest = {
        message: content.trim(),
        conversation_id: currentConversationId,
        context,
      };

      const response = await sendChatMessage(request);

      if (response.success && response.data) {
        console.log('✅ useChat: Message sent successfully');

        // Update conversation ID if new conversation was created
        if (response.data.conversation_id && !currentConversationId) {
          setCurrentConversationId(response.data.conversation_id);
        }

        // Add AI response
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          conversation_id: response.data.conversation_id,
          role: 'assistant',
          content: response.data.response,
          created_at: new Date().toISOString(),
          metadata: {
            agent_used: response.data.agent_used,
            suggestions: response.data.suggestions,
          },
        };

        setMessages(prev => [...prev, aiMessage]);

        // Check for actions (e.g., campaign created)
        if (response.data.actions_performed) {
          console.log('🎯 useChat: AI performed actions:', response.data.actions_performed);
          // Actions can be handled by parent component via messages state
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      console.error('💥 useChat: Error sending message:', errorMsg);
      setError(errorMsg);

      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsSending(false);
    }
  }, [currentConversationId]);

  /**
   * Clear messages
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(undefined);
    setConversation(null);
  }, []);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Auto-load conversations on mount if requested
   */
  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [autoLoad, loadConversations]);

  return {
    messages,
    conversation,
    isLoading,
    isSending,
    sendMessage,
    clearMessages,
    conversations,
    loadConversations,
    createNewConversation,
    deleteConversation,
    error,
    clearError,
  };
}