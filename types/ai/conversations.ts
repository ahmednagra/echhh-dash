// src/types/ai/conversations.ts

/**
 * AI Conversation Types
 * 
 * Type definitions for AI conversation management
 * Following industry-standard naming conventions
 */

import { CampaignTab } from './messages';

// =============================================================================
// CORE CONVERSATION TYPES
// =============================================================================

/**
 * AI Conversation entity
 */
export interface AIConversation {
  id: string;
  session_name: string | null;
  company_id: string;
  campaign_id: string | null;
  user_id?: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_active: boolean;
  
  // Optional: Last message preview
  last_message?: {
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
  };
  
  // Optional: Campaign info
  campaign?: {
    id: string;
    name: string;
    status?: string;
  } | null;
}

// =============================================================================
// REQUEST TYPES
// =============================================================================

/**
 * Get conversations query parameters
 */
export interface GetConversationsParams {
  campaign_id?: string;
  limit?: number;
  offset?: number;
  is_active?: boolean;
}

/**
 * Create conversation request
 */
export interface CreateConversationRequest {
  session_name?: string;
  campaign_id?: string;
  context?: {
    current_tab?: CampaignTab;
    [key: string]: any;
  };
}

// =============================================================================
// RESPONSE TYPES
// =============================================================================

/**
 * Get conversations list response
 */
export interface GetConversationsResponse {
  success: boolean;
  message: string;
  data: {
    conversations: AIConversation[];
    total_count: number;
    limit: number;
    offset: number;
  };
  error: string | null;
  timestamp: string;
}

/**
 * Get single conversation response
 */
export interface GetConversationResponse {
  success: boolean;
  message: string;
  data: AIConversation;
  error: string | null;
  timestamp: string;
}

/**
 * Create conversation response
 */
export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    session_name: string | null;
    created_at: string;
  };
  error: string | null;
  timestamp: string;
}

/**
 * Delete conversation response
 */
export interface DeleteConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversation_id: string;
  };
  error: string | null;
  timestamp: string;
}