// src/types/chat.ts

/**
 * Chat Types for AI Chat System
 * 
 * Using industry-standard 'conversations' terminology
 * Simple context-based system where backend handles agent routing
 */

// Campaign tab types matching your CampaignFunnelSection
export type CampaignTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

/**
 * Chat context sent to backend
 * Backend uses this to route to correct agent
 */
export interface ChatContext {
  campaign_id?: string;
  current_tab?: CampaignTab;
  // Any additional context data
  [key: string]: any;
}

/**
 * Single chat message
 */
export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  
  // Optional metadata from backend
  metadata?: {
    agent_used?: string;
    confidence_score?: number;
    routing_reason?: string;
    suggestions?: string[];
  };
}

/**
 * Chat conversation (industry-standard terminology)
 */
export interface ChatConversation {
  id: string;
  user_id: string;
  company_id: string;
  campaign_id?: string | null;  // Null for general chat, populated when attached to campaign
  title?: string | null;
  created_at: string;
  updated_at: string;
  message_count: number;
  is_active: boolean;
  
  // Last message preview
  last_message?: ChatMessage;
  
  // Campaign info if attached
  campaign?: {
    id: string;
    name: string;
    status?: string;
  } | null;
}

/**
 * Request to send a message
 */
export interface SendMessageRequest {
  message: string;
  conversation_id?: string;  // Industry standard: conversation_id
  context?: ChatContext;
}

/**
 * Response from sending a message
 */
export interface SendMessageResponse {
  success: boolean;
  message: string;
  data: {
    response: string;
    conversation_id: string;  // Industry standard: conversation_id
    agent_used?: string;
    confidence_score?: number;
    routing_reason?: string;
    suggestions?: string[];
    
    // Actions performed by AI (e.g., campaign created)
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
  timestamp?: string;
}

/**
 * List of conversations response
 */
export interface ConversationsListResponse {
  success: boolean;
  message: string;
  data: {
    conversations: ChatConversation[];  // Industry standard: conversations
    total_count: number;
    limit: number;
    offset: number;
  };
}

/**
 * Create conversation request
 */
export interface CreateConversationRequest {
  conversation_name?: string;  // Industry standard: conversation_name
}

/**
 * Create conversation response
 */
export interface CreateConversationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    conversation_name?: string;
    created_at: string;
  };
}

/**
 * Delete conversation response
 */
export interface DeleteConversationResponse {
  success: boolean;
  message: string;
  data: {
    conversation_id: string;  // Industry standard: conversation_id
  };
}

/**
 * Get conversation with messages
 */
export interface ConversationWithMessages {
  conversation: ChatConversation;
  messages: ChatMessage[];
}