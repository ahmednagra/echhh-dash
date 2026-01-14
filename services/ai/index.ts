// src/services/ai/index.ts

/**
 * AI Services Index - V9 Industry Standard
 * 
 * UPDATED: V9 - Unified exports (no separate streaming module)
 * 
 * Usage:
 * - Server components/API routes: import from server files
 * - Client components: import from client files
 * 
 * V9 Changes:
 * - Removed sendMessageStreaming (merged into sendMessage)
 * - Removed streaming.client.ts (merged into messages.client.ts)
 * - Single sendMessage function with stream option
 */

// =============================================================================
// SERVER SERVICES (API Routes only)
// =============================================================================
export {
  getConversationsServer,
  getConversationServer,
  createConversationServer,
  deleteConversationServer,
} from './conversations.server';

export {
  sendMessageServer,
  getMessagesServer,
  sendMessageStreamServer,
} from './messages.server';

// =============================================================================
// CLIENT SERVICES (Browser only)
// =============================================================================
export {
  getConversations,
  getConversation,
  createConversation,
  deleteConversation,
} from './conversations.client';

export {
  // V9: Unified sendMessage with stream option
  sendMessage,
  getMessages,
  
  // Utilities
  isStreamingEnabled,
  createStreamAbortController,
  
  // Types
  type StreamChunk,
  type StreamingCallbacks,
  type StreamingResult,
  type SendMessageOptions,
} from './messages.client';

// =============================================================================
// DEPRECATED EXPORTS (for backward compatibility)
// =============================================================================

/**
 * @deprecated Use sendMessage with { stream: true } instead
 */
export { sendMessage as sendMessageStreaming } from './messages.client';