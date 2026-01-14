// =============================================================================
// src/types/influencer-social-connections.ts
// =============================================================================
// Comprehensive TypeScript interfaces for Influencer Social Media Connections
// Following Meta API standards and OAuth 2.0 specifications
// =============================================================================

/**
 * Supported social media platforms for influencer connections
 * Using Meta's platform naming conventions
 */
export type SocialPlatformType = 
  | 'instagram' 
  | 'tiktok' 
  | 'youtube' 
  | 'twitter' 
  | 'facebook';

/**
 * Connection status aligned with OAuth token states
 */
export type ConnectionStatus = 
  | 'active'           // Token valid, connection working
  | 'expired'          // Token expired, needs refresh
  | 'revoked'          // User revoked access
  | 'error'            // Connection error occurred
  | 'pending'          // OAuth flow in progress
  | 'suspended';       // Platform suspended the connection

/**
 * OAuth token scope categories for Instagram Business API
 * Reference: https://developers.facebook.com/docs/instagram-api/overview
 */
export type InstagramScope = 
  | 'instagram_business_basic'
  | 'instagram_business_manage_messages'
  | 'instagram_business_manage_comments'
  | 'instagram_business_content_publish'
  | 'instagram_business_manage_insights';

/**
 * Platform configuration interface
 */
export interface SocialPlatformConfig {
  id: string;
  name: string;
  slug: SocialPlatformType;
  displayName: string;
  logoUrl: string;
  primaryColor: string;
  gradientColors: string[];
  isEnabled: boolean;
  isComingSoon: boolean;
  maxAccountsPerUser: number;
  requiredScopes: string[];
  optionalScopes: string[];
  features: PlatformFeature[];
  oauthConfig: OAuthPlatformConfig;
}

/**
 * Platform feature capabilities
 */
export interface PlatformFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  requiredScopes: string[];
}

/**
 * OAuth configuration per platform
 */
export interface OAuthPlatformConfig {
  authorizationUrl: string;
  tokenUrl: string;
  revokeUrl: string;
  scopeSeparator: string;
  responseType: 'code' | 'token';
  grantType: 'authorization_code' | 'client_credentials';
}

// =============================================================================
// CORE ENTITY INTERFACES
// =============================================================================

/**
 * Main influencer social connection entity
 * Maps to database table: influencer_social_connections
 */
export interface InfluencerSocialConnection {
  id: string;
  influencer_user_id: string;
  platform_id: string;
  platform_user_id: string;
  platform_username: string;
  display_name: string | null;
  profile_image_url: string | null;
  bio: string | null;
  
  // Follower metrics
  followers_count: number;
  following_count: number;
  posts_count: number;
  
  // Engagement metrics
  engagement_rate: number | null;
  average_likes: number | null;
  average_comments: number | null;
  
  // Account type
  account_type: 'personal' | 'business' | 'creator';
  is_verified: boolean;
  
  // OAuth tokens (encrypted in database)
  access_token_encrypted?: string;
  refresh_token_encrypted?: string;
  token_expires_at: string | null;
  token_scopes: string[];
  
  // Meta-specific fields
  instagram_business_account_id: string | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  
  // Connection health
  status: ConnectionStatus;
  last_sync_at: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  error_count: number;
  
  // Automation settings
  is_dm_enabled: boolean;
  is_comments_enabled: boolean;
  is_posting_enabled: boolean;
  is_insights_enabled: boolean;
  
  // Webhook configuration
  webhook_subscribed: boolean;
  webhook_subscription_id: string | null;
  
  // Timestamps
  connected_at: string;
  created_at: string;
  updated_at: string;
  
  // Nested relations
  platform?: SocialPlatform;
  user?: InfluencerUser;
}

/**
 * Social platform entity
 */
export interface SocialPlatform {
  id: string;
  name: string;
  slug: SocialPlatformType;
  logo_url: string;
  category: string;
  status: 'active' | 'inactive' | 'maintenance';
  created_at: string;
  updated_at: string;
}

/**
 * Influencer user reference
 */
export interface InfluencerUser {
  id: string;
  email: string;
  full_name: string;
  profile_image_url: string | null;
}

// =============================================================================
// REQUEST/RESPONSE INTERFACES
// =============================================================================

/**
 * OAuth initiation request
 */
export interface OAuthInitiateRequest {
  platform_id: string;
  requested_scopes?: string[];
  redirect_url?: string;
  state_metadata?: Record<string, unknown>;
}

/**
 * OAuth initiation response
 */
export interface OAuthInitiateResponse {
  authorization_url: string;
  state: string;
  platform: SocialPlatformType;
  expires_in: number;
  code_verifier?: string; // For PKCE flow
  instructions: string;
}

/**
 * OAuth callback request
 */
export interface OAuthCallbackRequest {
  code: string;
  state: string;
  error?: string;
  error_description?: string;
}

/**
 * OAuth callback success response
 */
export interface OAuthCallbackResponse {
  success: boolean;
  message: string;
  connection?: InfluencerSocialConnection;
  error?: string;
  redirect_url: string;
}

/**
 * Get connections request parameters
 */
export interface GetConnectionsParams {
  platform_id?: string;
  status?: ConnectionStatus;
  page?: number;
  page_size?: number;
  sort_by?: 'created_at' | 'followers_count' | 'engagement_rate';
  sort_order?: 'asc' | 'desc';
}

/**
 * Paginated connections response
 */
export interface ConnectionsPaginatedResponse {
  connections: InfluencerSocialConnection[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

/**
 * Connection update request
 */
export interface UpdateConnectionRequest {
  display_name?: string;
  is_dm_enabled?: boolean;
  is_comments_enabled?: boolean;
  is_posting_enabled?: boolean;
  is_insights_enabled?: boolean;
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  success: boolean;
  connection_id: string;
  expires_at: string;
  message: string;
}

/**
 * Connection health check response
 */
export interface ConnectionHealthResponse {
  connection_id: string;
  platform: SocialPlatformType;
  is_healthy: boolean;
  token_valid: boolean;
  token_expires_in_hours: number | null;
  last_successful_sync: string | null;
  issues: HealthIssue[];
  recommendations: string[];
}

export interface HealthIssue {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action_required: boolean;
}

// =============================================================================
// MESSAGING INTERFACES
// =============================================================================

/**
 * Instagram conversation thread
 */
export interface InstagramConversation {
  id: string;
  connection_id: string;
  thread_id: string;
  participant: {
    id: string;
    username: string;
    name: string;
    profile_pic_url: string | null;
    is_verified: boolean;
    followers_count?: number;
  };
  last_message: {
    id: string;
    text: string;
    timestamp: string;
    is_from_me: boolean;
    message_type: MessageType;
  } | null;
  unread_count: number;
  is_starred: boolean;
  is_archived: boolean;
  labels: string[];
  created_at: string;
  updated_at: string;
}

export type MessageType = 
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'story_reply'
  | 'story_mention'
  | 'post_share'
  | 'reel_share'
  | 'link';

/**
 * Individual message in a conversation
 */
export interface InstagramMessage {
  id: string;
  conversation_id: string;
  message_id: string;
  sender_id: string;
  is_from_me: boolean;
  message_type: MessageType;
  text: string | null;
  media_url: string | null;
  media_type: string | null;
  story_url: string | null;
  post_url: string | null;
  link_url: string | null;
  reactions: MessageReaction[];
  reply_to_message_id: string | null;
  is_unsent: boolean;
  timestamp: string;
  created_at: string;
}

export interface MessageReaction {
  emoji: string;
  user_id: string;
  username: string;
  timestamp: string;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  connection_id: string;
  recipient_id: string;
  message_type: 'text' | 'image' | 'link';
  text?: string;
  media_url?: string;
  link_url?: string;
}

/**
 * Send message response
 */
export interface SendMessageResponse {
  success: boolean;
  message_id: string;
  recipient_id: string;
  timestamp: string;
}

// =============================================================================
// ANALYTICS INTERFACES
// =============================================================================

/**
 * Connection statistics summary
 */
export interface ConnectionStatistics {
  total_connections: number;
  active_connections: number;
  connections_by_platform: Record<SocialPlatformType, number>;
  total_followers: number;
  average_engagement_rate: number;
  connections_needing_attention: number;
}

/**
 * Platform-specific analytics
 */
export interface PlatformAnalytics {
  connection_id: string;
  platform: SocialPlatformType;
  period: 'day' | 'week' | 'month';
  metrics: {
    impressions: number;
    reach: number;
    profile_views: number;
    followers_gained: number;
    followers_lost: number;
    engagement_rate: number;
    posts_published: number;
    messages_received: number;
    messages_sent: number;
  };
  top_posts: TopPost[];
  audience_demographics: AudienceDemographics;
}

export interface TopPost {
  post_id: string;
  post_url: string;
  thumbnail_url: string;
  caption: string;
  post_type: 'image' | 'video' | 'carousel' | 'reel' | 'story';
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  views: number;
  engagement_rate: number;
  published_at: string;
}

export interface AudienceDemographics {
  age_ranges: Record<string, number>;
  genders: Record<string, number>;
  top_countries: Array<{ country: string; percentage: number }>;
  top_cities: Array<{ city: string; percentage: number }>;
  active_hours: Record<string, number>;
}

// =============================================================================
// UI STATE INTERFACES
// =============================================================================

/**
 * Connection card display state
 */
export interface ConnectionCardState {
  connection: InfluencerSocialConnection;
  isLoading: boolean;
  isRefreshing: boolean;
  isDisconnecting: boolean;
  showSettings: boolean;
  error: string | null;
}

/**
 * OAuth flow state management
 */
export interface OAuthFlowState {
  step: 'idle' | 'initiating' | 'redirecting' | 'processing' | 'success' | 'error';
  platform: SocialPlatformType | null;
  authorizationUrl: string | null;
  state: string | null;
  error: string | null;
  errorDescription: string | null;
}

/**
 * Page-level state
 */
export interface SocialConnectionsPageState {
  connections: InfluencerSocialConnection[];
  statistics: ConnectionStatistics | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  selectedPlatformFilter: SocialPlatformType | 'all';
  oauthFlow: OAuthFlowState;
}

// =============================================================================
// API ERROR TYPES
// =============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

// =============================================================================
// CONSTANTS EXPORT
// =============================================================================

export const CONNECTION_STATUS_LABELS: Record<ConnectionStatus, string> = {
  active: 'Active',
  expired: 'Token Expired',
  revoked: 'Access Revoked',
  error: 'Connection Error',
  pending: 'Connecting...',
  suspended: 'Suspended',
};

export const CONNECTION_STATUS_COLORS: Record<ConnectionStatus, string> = {
  active: 'green',
  expired: 'yellow',
  revoked: 'red',
  error: 'red',
  pending: 'blue',
  suspended: 'gray',
};