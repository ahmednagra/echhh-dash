// src/types/ai/index.ts

/**
 * AI Types - V9 Industry Standard
 * 
 * UPDATED: V9 - Added `stream` parameter for unified streaming control.
 * 
 * Following OpenAI/Anthropic patterns:
 * - Single request type with optional `stream` parameter
 * - stream=false → JSON response
 * - stream=true  → SSE response
 */

// =============================================================================
// ENUMS
// =============================================================================

export type CampaignTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

export type MessageRole = 'user' | 'assistant' | 'system';

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Request to send a message to AI
 * 
 * V9: Added `stream` parameter for industry-standard streaming control.
 */
export interface SendMessageRequest {
  /** User's message content */
  message: string;
  
  /** Optional conversation ID for continuity */
  conversation_id?: string;
  
  /** Additional context (current_tab, campaign_id, etc.) */
  context?: {
    campaign_id?: string;
    current_tab?: CampaignTab;
    [key: string]: any;
  };
  
  /**
   * V9: Streaming control
   * - false (default): Returns JSON response
   * - true: Returns SSE stream
   */
  stream?: boolean;
}

/**
 * Parameters for getting messages
 */
export interface GetMessagesParams {
  limit?: number;
  cursor?: string;
  direction?: 'before' | 'after';
}

/**
 * Parameters for getting conversations
 */
export interface GetConversationsParams {
  campaign_id?: string;
  limit?: number;
  offset?: number;
  status?: 'active' | 'archived' | 'deleted';
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Standard API response wrapper
 */
export interface AIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Message response data
 */
export interface SendMessageResponseData {
  response: string;
  conversation_id: string;
  message_id?: string;
  agent_used?: string;
  confidence_score?: number;
  routing_reason?: string;
  suggestions?: string[];
  data?: any;
}

export type SendMessageResponse = AIResponse<SendMessageResponseData>;

/**
 * Individual message
 */
export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string | null;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: {
    type?: string;
    agent_used?: string;
    confidence_score?: number;
    routing_reason?: string;
    suggestions?: string[];
    [key: string]: any;
  };
}

/**
 * Pagination info
 */
export interface MessagePagination {
  has_more: boolean;
  next_cursor?: string;
  prev_cursor?: string;
  total_count?: number;
}

/**
 * Messages list response data
 */
export interface MessagesData {
  messages: AIMessage[];
  pagination?: MessagePagination;
}

export type GetMessagesResponse = AIResponse<MessagesData>;

/**
 * Conversation
 */
export interface AIConversation {
  id: string;
  user_id: string;
  company_id: string;
  campaign_id?: string;
  title?: string;
  status: 'active' | 'archived' | 'deleted';
  message_count: number;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
  archived_at?: string;
  deleted_at?: string;
  metadata?: Record<string, any>;
}

/**
 * Conversations list response data
 */
export interface ConversationsData {
  conversations: AIConversation[];
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

export type GetConversationsResponse = AIResponse<ConversationsData>;

/**
 * Create conversation response
 */
export interface CreateConversationData {
  conversation: AIConversation;
}

export type CreateConversationResponse = AIResponse<CreateConversationData>;

/**
 * Delete conversation response
 */
export type DeleteConversationResponse = AIResponse<null>;

// =============================================================================
// STREAMING TYPES (V9)
// =============================================================================

/**
 * SSE stream chunk types
 */
export type StreamChunkType = 
  | 'status'       // Current processing status
  | 'progress'     // Progress update
  | 'result'       // Final result with data
  | 'clarification'// Follow-up question needed
  | 'help'         // Help/tips response
  | 'text'         // Text response (general)
  | 'error'        // Error occurred
  | 'done';        // Stream completed

/**
 * SSE stream chunk
 */
export interface StreamChunk {
  type: StreamChunkType;
  content: string;
  conversation_id?: string;
  data?: any;
  timestamp?: string;
}

/**
 * Streaming callbacks
 */
export interface StreamingCallbacks {
  /** Called for each chunk received */
  onChunk?: (chunk: StreamChunk) => void;
  
  /** Called when stream completes successfully */
  onComplete?: () => void;
  
  /** Called on error */
  onError?: (error: Error) => void;
  
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Streaming result
 * V9: Added finalChunk as primary property (finalResult kept for backward compatibility)
 */
export interface StreamingResult {
  success: boolean;
  conversationId?: string;
  finalChunk?: StreamChunk;    // V9: Primary - used by useChat
  finalResult?: StreamChunk;   // Backward compatibility
  error?: string;
}

// =============================================================================
// INFLUENCER SEARCH TYPES
// =============================================================================

/**
 * Unified influencer from search results
 * V9: Fixed creator_location type to match actual InsightIQ API response
 */
export interface UnifiedInfluencer {
  id: string;
  platform: string;
  username: string;
  platform_username?: string;
  display_name?: string;
  full_name?: string;
  profile_url?: string;
  url?: string;
  profile_picture?: string;
  image_url?: string;
  bio?: string;
  introduction?: string;
  is_verified?: boolean;
  follower_count?: number;
  engagement_rate?: number;
  average_likes?: number;
  average_views?: number | null;
  subscriber_count?: number | null;
  content_count?: number | null;
  location?: string | null;
  // V9: Fixed - API returns object, not string
  creator_location?: {
    city?: string;
    state?: string | null;
    country?: string;
  } | null;
  gender?: string | null;
  age_group?: string | null;
  language?: string;
  contacts?: any[];
  contact_details?: Array<{ type: string; value: string }>;
  account_type?: string;
  platform_account_type?: string;
  external_id?: string;
  filter_match?: Record<string, any>;
  livestream_metrics?: any;
  work_platform?: {
    id?: string;
    name?: string;
    logo_url?: string;
  };
  raw_data?: any;
}

/**
 * Influencer search results
 */
export interface InfluencerSearchResults {
  influencers: UnifiedInfluencer[];
  total_count: number;
  limit: number;
  offset: number;
  source?: string;
  metadata?: {
    offset?: number;
    limit?: number;
    total_results?: number;
    [key: string]: any;
  };
  applied_filters?: Record<string, any>;
}

/**
 * AI insights from search
 */
export interface AIInsights {
  summary?: string;
  recommendations?: string[];
  filters_applied?: Record<string, any>;
  [key: string]: any;
}

// =============================================================================
// EXPORT ALL
// =============================================================================

export type {
  CampaignTab as Tab,
};