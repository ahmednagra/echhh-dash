// src/types/messaging.ts
/**
 * Messaging Module Type Definitions
 * 
 * Defines types for unified social media messaging across multiple platforms
 * (Instagram, Facebook, WhatsApp, etc.)
 * 
 * Naming Conventions:
 * - PascalCase for interfaces and types
 * - camelCase for properties
 * - SCREAMING_SNAKE_CASE for constants
 * - Descriptive, industry-standard terminology
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

/**
 * Supported messaging platforms
 */
export enum MessagingPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  WHATSAPP = 'whatsapp',
  TWITTER = 'twitter',
}

/**
 * Message content types
 */
export enum MessageContentType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  STICKER = 'sticker',
  STORY_REPLY = 'story_reply',
  STORY_MENTION = 'story_mention',
}

/**
 * Conversation thread types
 */
export enum ConversationThreadType {
  DIRECT_MESSAGE = 'direct_message',
  GROUP_CHAT = 'group_chat',
  BROADCAST = 'broadcast',
}

/**
 * Message delivery status
 */
export enum MessageDeliveryStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

/**
 * Participant role in conversation
 */
export enum ParticipantRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

// ============================================================================
// PARTICIPANT INTERFACES
// ============================================================================

/**
 * Conversation participant base information
 */
export interface ConversationParticipant {
  id: string;
  platformUserId: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  isVerified: boolean;
  role: ParticipantRole;
}

// ============================================================================
// MESSAGE INTERFACES
// ============================================================================

/**
 * Message attachment metadata
 */
export interface MessageAttachment {
  id: string;
  type: MessageContentType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileSize?: number;
  fileName?: string;
  width?: number;
  height?: number;
  duration?: number;
}

/**
 * Core message entity
 * Represents a single message in a conversation thread
 */
export interface Message {
  id: string;
  conversationThreadId: string;
  senderId: string;
  senderUsername?: string;
  senderDisplayName?: string;
  recipientId: string;
  contentType: MessageContentType;
  textContent: string;
  attachments: MessageAttachment[];
  deliveryStatus: MessageDeliveryStatus;
  sentAt: Date;
  deliveredAt?: Date;
  readAt?: Date;
  isFromCurrentUser: boolean;
  replyToMessageId?: string;
  metadata?: Record<string, any>;
}

/**
 * Message send request payload
 */
export interface SendMessageRequest {
  recipientId: string;
  textContent: string;
  contentType?: MessageContentType;
  attachmentUrl?: string;
  replyToMessageId?: string;
  metadata?: Record<string, any>;
}

/**
 * Message send response
 */
export interface SendMessageResponse {
  success: boolean;
  message: Message;
  error?: string;
}

// ============================================================================
// CONVERSATION THREAD INTERFACES
// ============================================================================

/**
 * Conversation thread metadata
 */
export interface ConversationThreadMetadata {
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  lastReadMessageId?: string;
  customLabel?: string;
  tags?: string[];
}

/**
 * Core conversation thread entity
 * Represents a messaging thread/conversation
 */
export interface ConversationThread {
  id: string;
  platformConnectionId: string;
  platform: MessagingPlatform;
  threadType: ConversationThreadType;
  participants: ConversationParticipant[];
  lastMessage?: Message;
  unreadMessageCount: number;
  totalMessageCount: number;
  canReply: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata: ConversationThreadMetadata;
}

/**
 * Conversation thread list item (optimized for list view)
 */
export interface ConversationThreadListItem {
  id: string;
  platformConnectionId: string;
  platform: MessagingPlatform;
  participants: Pick<ConversationParticipant, 'id' | 'username' | 'displayName' | 'profileImageUrl'>[];
  lastMessagePreview: string;
  lastMessageSentAt: Date;
  unreadMessageCount: number;
  isPinned: boolean;
  isMuted: boolean;
}

// ============================================================================
// PAGINATION & LIST RESPONSES
// ============================================================================

/**
 * Standard pagination metadata
 */
export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated conversation threads response
 */
export interface ConversationThreadsResponse {
  threads: ConversationThread[];
  pagination: PaginationMetadata;
}

/**
 * Paginated messages response
 */
export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationMetadata;
  conversationThread: ConversationThread;
}

// ============================================================================
// FILTER & QUERY INTERFACES
// ============================================================================

/**
 * Conversation thread filters
 */
export interface ConversationThreadFilters {
  platform?: MessagingPlatform;
  platformConnectionId?: string;
  hasUnread?: boolean;
  isPinned?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
  participantUsername?: string;
}

/**
 * Message filters
 */
export interface MessageFilters {
  senderId?: string;
  contentType?: MessageContentType;
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}

// ============================================================================
// REAL-TIME UPDATE INTERFACES
// ============================================================================

/**
 * Real-time message event types
 */
export enum MessageEventType {
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_SENT = 'message_sent',
  MESSAGE_DELIVERED = 'message_delivered',
  MESSAGE_READ = 'message_read',
  TYPING_INDICATOR = 'typing_indicator',
  PRESENCE_UPDATE = 'presence_update',
}

/**
 * Real-time message event payload
 */
export interface MessageEvent {
  eventType: MessageEventType;
  conversationThreadId: string;
  message?: Message;
  participantId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Typing indicator state
 */
export interface TypingIndicator {
  conversationThreadId: string;
  participantId: string;
  participantUsername: string;
  isTyping: boolean;
  timestamp: Date;
}

// ============================================================================
// ERROR & STATUS INTERFACES
// ============================================================================

/**
 * Messaging error details
 */
export interface MessagingError {
  code: string;
  message: string;
  details?: string;
  retryable: boolean;
  timestamp: Date;
}

/**
 * Connection health status
 */
export interface ConnectionHealthStatus {
  isConnected: boolean;
  lastSyncAt?: Date;
  tokenExpiresAt?: Date;
  requiresReconnection: boolean;
  errorDetails?: MessagingError;
}

// ============================================================================
// WEBHOOK & INTEGRATION INTERFACES
// ============================================================================

/**
 * Webhook subscription configuration
 */
export interface WebhookSubscription {
  id: string;
  platformConnectionId: string;
  webhookUrl: string;
  verificationToken: string;
  subscribedEvents: MessageEventType[];
  isActive: boolean;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

/**
 * Webhook setup request
 */
export interface SetupWebhookRequest {
  webhookUrl: string;
  verificationToken: string;
  events: MessageEventType[];
}

// ============================================================================
// STATE MANAGEMENT INTERFACES
// ============================================================================

/**
 * Active messaging session state
 */
export interface MessagingSessionState {
  activePlatformConnectionId: string | null;
  activeConversationThreadId: string | null;
  conversationThreads: ConversationThread[];
  messages: Record<string, Message[]>;
  typingIndicators: Record<string, TypingIndicator[]>;
  isLoading: boolean;
  error: MessagingError | null;
}

/**
 * Messaging context actions
 */
export interface MessagingContextActions {
  selectPlatformConnection: (connectionId: string, platform?: MessagingPlatform) => Promise<void>;
  selectConversationThread: (threadId: string) => Promise<void>;
  loadConversationThreads: (filters?: ConversationThreadFilters) => Promise<void>;
  loadMessages: (threadId: string, page?: number) => Promise<void>;
  sendMessage: (request: SendMessageRequest) => Promise<SendMessageResponse>;
  markMessagesAsRead: (threadId: string, messageIds: string[]) => Promise<void>;
  archiveConversationThread: (threadId: string) => Promise<void>;
  pinConversationThread: (threadId: string) => Promise<void>;
  muteConversationThread: (threadId: string) => Promise<void>;
  refreshConversationThreads: () => Promise<void>;
}

// ============================================================================
// API RESPONSE WRAPPERS
// ============================================================================

/**
 * Generic API success response
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  timestamp: Date;
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: MessagingError;
  timestamp: Date;
}

/**
 * Union type for API responses
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;