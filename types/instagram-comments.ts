// src/types/instagram-comments.ts

/**
 * Request interface for fetching Instagram comments
 */
export interface InstagramCommentRequest {
  content_url: string;
  work_platform_id: string;
  offset?: number;
  limit?: number; // Max 15 per request
  sort_by?: 'likes' | 'recent'; // Default: 'likes'
}

/**
 * Work platform information
 */
export interface WorkPlatform {
  id: string;
  name: string;
  logo_url: string;
}

/**
 * Single Instagram comment structure (matches API response)
 */
export interface InstagramComment {
  work_platform: WorkPlatform;
  content_url: string;
  text: string;
  commenter_username: string;
  commenter_display_name: string;
  comment_id: string;
  is_private_profile: boolean;
  is_verified_profile: boolean;
  like_count: number;
  reply_count: number; // For future reply feature
  published_at: string;
}

/**
 * Pagination metadata
 */
export interface CommentsPaginationMeta {
  offset: number;
  limit: number;
  total: number;
  has_more: boolean;
}

/**
 * Response structure for fetching comments
 */
export interface InstagramCommentsResponse {
  success: boolean;
  comments: InstagramComment[];
  pagination: CommentsPaginationMeta;
  content_url: string;
  message?: string;
  error?: string;
}

/**
 * Future: Comment replies request (separate feature)
 */
export interface InstagramCommentReplyRequest {
  content_url: string;
  work_platform_id: string;
  parent_comment_id: string;
  offset?: number;
  limit?: number;
}

/**
 * API error response
 */
export interface InstagramCommentsError {
  error: string;
  message: string;
  status_code: number;
}