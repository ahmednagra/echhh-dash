// src/types/user-detailed-info.ts

// Generic type for handling large, unknown API responses
export interface ThirdPartyApiResponse {
  data?: any;
  original_response?: any;
  
  // =========================================================================
  // Content-Posts API nested objects (at post_result_obj level)
  // =========================================================================
  engagement?: {
    like_count?: number;
    comment_count?: number;
    view_count?: number;
    share_count?: number;
    laugh_count?: number | null;
    love_count?: number | null;
    save_count?: number;
  };
  influencer?: {
    img_url?: string;
    username?: string;
    full_name?: string;
    followers?: number;
    total_price?: number;
    currency?: string;
    collaboration_price?: number;
  };
}

// Core user information extracted from Instagram response
export interface InstagramUserInfo {
  user_ig_id: string;
  full_name: string;
  profile_pic_url: string;
  username: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  is_verified?: boolean;
  is_private?: boolean;
  biography?: string;
}

// Core post information extracted from Instagram response
export interface InstagramPostInfo {
  post_id: string;
  shortcode: string;
  caption?: string;
  created_at: string;
  video_url?: string;
  view_counts?: number;
  play_counts?: number;
  title?: string;
  video_duration?: number;
  media_preview?: string;
  thumbnail_src?: string;
  display_url?: string;
  comments_count: number;
  likes_count: number;
  shares_count?: number; // Added shares support
  media_type: 'image' | 'video' | 'carousel';
  is_video: boolean;
  has_audio?: boolean;
}

// Processed Instagram data for our system
export interface ProcessedInstagramData {
  user: InstagramUserInfo;
  post: InstagramPostInfo;
  success: boolean;
  message?: string;
  raw_response?: ThirdPartyApiResponse; // Store the full response for debugging/future use
}

// Backend API Types - Based on your actual backend structure
export interface VideoResult {
  id: string;
  campaign_id: string;
  user_ig_id: string;
  full_name: string;
  influencer_username: string;
  campaign_name: string;
  campaign: string;
  campaign_title: string;
  name: string;
  profile_pic_url: string;
  post_id: string;
  title: string;
  views_count: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  media_preview: string;
  followers_count?: number;
  duration: number | string; // Can be string from API (e.g., "8989.000")
  thumbnail: string;
  post_created_at: string | null;
  collaboration_price?: number;
  post_result_obj: ThirdPartyApiResponse;
  created_at: string;
  updated_at: string;
  
  // =========================================================================
  // Content-Posts API Fields
  // =========================================================================
  content_url?: string;
  campaign_influencer_id?: string;
  first_tracked_at?: string;
  last_tracked_at?: string;
  initial_metadata?: Record<string, any>;
  
  // Content metadata
  caption?: string;
  content_format?: 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'STORY';
  content_type?: string; // e.g., 'reel', 'facebook_video', 'linkedin_post'
  posted_at?: string;
  
  // Platform info
  platform_id?: string;
  platform_post_id?: string;
  data_source_endpoint_id?: string;
  
  // Content details
  media_url?: string;
  thumbnail_url?: string;
  hashtags?: string[];
  mentions?: string[];
  collaborators?: string[];
  sponsors?: string[];
  links?: string[];
  
  // Flags
  likes_and_views_disabled?: boolean;
  is_pinned?: boolean;
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
  tracking_status?: string;
  
  // Nested objects from content-posts API response
  influencer?: {
    img_url?: string;
    username?: string;
    full_name?: string;
    followers?: number;
    total_price?: number;
    currency?: string;
    collaboration_price?: number;
  };
  engagement?: {
    like_count?: number;
    comment_count?: number;
    view_count?: number;
    share_count?: number;
    laugh_count?: number | null;
    love_count?: number | null;
    save_count?: number;
  };
}

// Request types for backend API
export interface CreateVideoResultRequest {
  campaign_id: string;
  user_ig_id: string;
  full_name: string;
  influencer_username: string;
  profile_pic_url: string;
  post_id: string;
  title: string;
  views_count: number;
  plays_count: number;
  likes_count: number;
  comments_count: number;
  shares_count?: number;
  media_preview: string;
  duration: number;
  thumbnail: string;
  post_created_at: string;
  collaboration_price?: number;
  post_result_obj: ThirdPartyApiResponse;
}

export interface UpdateVideoResultRequest {
  user_ig_id?: string;
  full_name?: string;
  influencer_username?: string;
  profile_pic_url?: string;
  post_id?: string;
  title?: string;
  views_count?: number;
  plays_count?: number;
  likes_count?: number;
  comments_count?: number;
  shares_count?: number;
  media_preview?: string;
  duration?: number;
  thumbnail?: string;
  post_created_at?: string;
  collaboration_price?: number;
  post_result_obj?: ThirdPartyApiResponse;
}

// Response types from backend API
export interface CreateVideoResultResponse {
  success: boolean;
  data: VideoResult;
  error?: string;
}

export interface UpdateVideoResultResponse {
  success: boolean;
  data: VideoResult;
  error?: string;
}

export interface GetVideoResultsResponse {
  campaign_id: string;
  results: VideoResult[];
  total: number;
  success?: boolean;
  error?: string;
}

// Utility Types
export interface InstagramPostInput {
  url?: string;
  code?: string;
}

export interface InstagramApiError {
  message: string;
  code?: string;
  status?: number;
}

// Helper function types
export type DataExtractor = (response: ThirdPartyApiResponse) => ProcessedInstagramData;
export type BackendDataMapper = (processed: ProcessedInstagramData, campaignId: string) => CreateVideoResultRequest;

// ============================================================================
// POST UPDATER TYPES (Single & Bulk)
// ============================================================================

/**
 * Post data extracted from VideoResult for display and calculations
 */
export interface PostData {
  likes: number;
  comments: number;
  plays: number;
  actualViews: number;
  shares: number;
  followers: number;
  engagementRate: string;
  videoUrl: string | null;
  thumbnailUrl: string;
  isVideo: boolean;
  duration: number;
  collaborationPrice: number;
  cpv: number;
  cpe: number;
  videoPlayCount: number;
}

/**
 * Preserved data for maintaining values during updates
 */
export interface PreservedPostData {
  shares: number;
  videoPlayCount: number;
  collaborationPrice: number;
  followers: number;
}

/**
 * Progress update data for bulk operations
 */
export interface ProgressUpdate {
  total: number;
  completed: number;
  current: string;
  errors: number;
}

/**
 * Preserved values with IDs for bulk update tracking
 */
export interface PreservedValuesWithId extends PreservedPostData {
  result_id: string;
  cpv: number;
  cpe: number;
}