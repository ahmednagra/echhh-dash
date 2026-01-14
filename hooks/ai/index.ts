// src/hooks/ai/index.ts

/**
 * AI Hooks Index - V9 Industry Standard
 * 
 * UPDATED: V9 - useChat now uses unified sendMessage with stream option.
 * 
 * Central export for all AI-related hooks.
 */

// Main chat hook (includes unified streaming support)
export { 
  useChat, 
  type UseChatOptions, 
  type UseChatReturn, 
  type ChatMessage, 
  type SendResult 
} from './useChat';

// Conversations hook (unchanged)
export { 
  useConversations, 
  type UseConversationsOptions, 
  type UseConversationsReturn 
} from './useConversations';