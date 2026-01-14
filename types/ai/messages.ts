// src/types/ai/messages.ts

/**
 * AI Message Types
 * 
 * Type definitions for AI messages and chat functionality
 * Following industry-standard naming conventions
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

/**
 * Campaign tab types matching CampaignFunnelSection
 */
export type CampaignTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

/**
 * Message role types
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * Agent types used by the AI system
 */
export type AIAgentType = 'discovery' | 'outreach' | 'management' | 'results' | 'payments' | 'general';

// =============================================================================
// CORE MESSAGE TYPES
// =============================================================================

/**
 * AI Message entity
 */
export interface AIMessage {
  id: string;
  conversation_id: string;
  user_id: string | null;
  role: MessageRole;
  content: string;
  timestamp: string;
  metadata?: AIMessageMetadata;
  isLoading?: boolean;
}

/**
 * Message metadata from AI response
 */
export interface AIMessageMetadata {
  type?: string;
  agent_used?: AIAgentType;
  confidence_score?: number;
  routing_reason?: string;
  suggestions?: string[];
  // For user messages
  context?: ChatContext;
}

/**
 * Chat context sent with messages
 */
export interface ChatContext {
  campaign_id?: string;
  current_tab?: CampaignTab;
  [key: string]: any;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Send message request
 */
export interface SendMessageRequest {
  message: string;
  conversation_id?: string | null;
  context?: ChatContext;
}

/**
 * Get messages query parameters (cursor-based pagination)
 */
export interface GetMessagesParams {
  limit?: number;
  cursor?: string;
  direction?: 'before' | 'after';
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Cursor-based pagination info
 */
export interface MessagePagination {
  has_more: boolean;
  limit: number;
  direction: 'before' | 'after';
  next_cursor: string | null;
  prev_cursor: string | null;
}

/**
 * Get messages response (cursor-based)
 */
export interface GetMessagesResponse {
  success: boolean;
  message: string;
  data: {
    conversation_id: string;
    messages: AIMessage[];
    pagination: MessagePagination;
  };
  error: string | null;
  timestamp: string;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    // Core response
    response: string;
    conversation_id: string;
    message_id: string;
    timestamp: string;
    
    // Agent info
    agent_used?: AIAgentType;
    confidence_score?: number;
    routing_reason?: string;
    
    // Interactive elements
    suggestions?: string[];
    
    // Structured data (search results, insights, etc.)
    data?: {
      search_results?: InfluencerSearchResults;
      ai_insights?: AIInsights;
      filters_used?: Record<string, any>;
      [key: string]: any;
    };
    
    // Actions performed by AI
    actions_performed?: {
      campaign_created?: {
        campaign_id: string;
        redirect_url: string;
      };
      influencers_discovered?: {
        count: number;
      };
      [key: string]: any;
    };
  };
  error: string | null;
  timestamp: string;
}

// =============================================================================
// SEARCH RESULTS TYPES
// =============================================================================

/**
 * Influencer search results from AI
 */
export interface InfluencerSearchResults {
  influencers: InfluencerResult[];
  filters_applied?: Record<string, any>;
  total_count: number;
  limit: number;
  offset: number;
  source: string;
  metadata?: {
    offset: number;
    limit: number;
    total_results: number;
  };
  applied_filters?: Record<string, any>;
}

/**
 * Single influencer result
 */
export interface InfluencerResult {
  id: string;
  platform: string;
  username: string;
  display_name: string;
  profile_url: string;
  profile_picture: string;
  bio: string;
  is_verified: boolean;
  follower_count: number;
  engagement_rate: number;
  average_likes: number;
  average_views: number | null;
  location: {
    city: string;
    state: string;
    country: string;
  } | null;
  gender: string | null;
  age_group: string | null;
  language: string;
  contacts: Array<{
    type: string;
    value: string;
  }>;
  account_type: string;
  raw_data?: Record<string, any>;
}

/**
 * AI insights from response
 */
export interface AIInsights {
  summary: string;
  insights: string;
  recommendations: string;
  next_steps: string;
}