// src/types/content-post.ts

import { Campaign } from '@/types/campaign';

export interface ContentPostBase {
  campaign_id: string;
  campaign_influencer_id: string;
  content_url: string;
  content_type: string;

  // REQUIRED FIELDS (Changed from optional to required)
  platform_id: string;
  data_source_endpoint_id: string;
  platform_post_id: string;

  content_format?: string;
  title?: string;
  caption?: string;
  media_url?: string;
  thumbnail_url?: string;
  duration?: number;
  hashtags?: string[];
  mentions?: string[];
  collaborators?: string[];
  sponsors?: string[];
  links?: string[];
  likes_and_views_disabled?: boolean;
  is_pinned?: boolean;
  tracking_status?: string;
  posted_at?: string;
  first_tracked_at?: string;
  last_tracked_at?: string;
  initial_metadata?: Record<string, any>;
}

export interface ContentPostCreate extends ContentPostBase {}

export interface ContentPostResponse extends ContentPostBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ContentPostApiResponse {
  success: boolean;
  data?: ContentPostResponse;
  message?: string;
  error?: string;
}

export interface ContentPostQueryParams {
  campaign_id?: string;
  campaign_influencer_id?: string;
  platform_id?: string;
  content_type?: string;
  tracking_status?: string;
  page?: number;
  page_size?: number; // Keep for backward compatibility
  size?: number; // ✅ ADD THIS - Backend parameter name
}

export interface ContentPostListResponse {
  items: ContentPostResponse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface Influencer {
  id: string; // campaign_influencer_id
  social_account_id: string;
  full_name: string;
  username: string;
  profile_pic_url: string;
  followers_count: number;
  is_verified: boolean;
  email?: string;
  status: string;
  social_account?: any;
}

export interface VideoResult {
  user?: {
    user_ig_id?: string;
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
    followers_count?: number;
    is_verified?: boolean;
  };
  post?: {
    post_id?: string;
  };
  raw_response?: {
    data?: Array<{
      profile?: {
        platform_username?: string;
        external_id?: string;
      };
    }>;
  };
}

export interface InfluencerDropdownProps {
  campaignData: Campaign;
  value: string;
  onChange: (campaignInfluencerId: string) => void;
  error?: string;
  videoResult?: VideoResult | null;
  renderMode?: 'dropdown' | 'info-card';
}

export interface MatchResult {
  matched: boolean;
  campaign_influencer_id: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
  matched_by: 'platform_id' | 'username' | 'account_handle' | 'none';
  influencer_data?: Influencer;
}

export interface VideoData {
  url: string;
  title: string;
  description: string;
  influencer: string;
  collaborationPrice?: number;
}

export interface ManualVideoData {
  profileUrl: string;
  influencerUsername: string;
  fullName: string;
  title: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  followers: number;
  engagementRate: string;
  collaborationPrice: number;
  postDate: string;
  thumbnailUrl: string;
  isVideo: boolean;
  duration: number;
}

export interface AddVideoModalProps {
  campaignData: Campaign;
  onClose: () => void;
  onSubmit: (videoData: VideoData | ManualVideoData) => void;
}

// NEW: Interface for userhandles API response (same as in Discover Tab)
export interface UserhandleResult {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: string | number; // Handle both string and number formats
  is_verified: boolean;
}

export interface UserhandlesApiResponse {
  success: boolean;
  data: UserhandleResult[];
  total: number;
  query: string;
  error?: string;
}

// Generic type for handling large, unknown API responses
export type ThirdPartyApiResponse = Record<string, any>;

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
  shares_count?: number; // Added shares support
  media_preview: string;
  followers_count?: number;
  duration: number;
  thumbnail: string;
  post_created_at: string | null;
  collaboration_price?: number; // Added collaboration price support
  post_result_obj: ThirdPartyApiResponse;
  created_at: string;
  updated_at: string;
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
  shares_count?: number; // Added shares support
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
  shares_count?: number; // Added shares support
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
export type DataExtractor = (
  response: ThirdPartyApiResponse,
) => ProcessedInstagramData;
export type BackendDataMapper = (
  processed: ProcessedInstagramData,
  campaignId: string,
) => CreateVideoResultRequest;


// ============================================================================
// VALID CONTENT TYPES - ALL PLATFORMS (Matches Backend Schema)
// ============================================================================
export const validContentTypes = [
  // Universal / Generic
  'post', 'video', 'image', 'photo', 'text', 'link', 'poll', 'event', 'document', 'audio',
  
  // Instagram
  'reel', 'reels', 'story', 'stories', 'carousel', 'carousel_album', 'igtv', 'live', 
  'live_video', 'guide', 'highlight', 'highlights', 'broadcast', 'feed',
  
  // YouTube
  'short', 'shorts', 'youtube_video', 'youtube_short', 'youtube_shorts', 'premiere', 
  'livestream', 'stream', 'playlist', 'community_post', 'podcast', 'podcast_episode',
  
  // TikTok
  'tiktok', 'tiktok_video', 'duet', 'stitch', 'slideshow', 'photo_mode',
  
  // Facebook
  'facebook_post', 'facebook_video', 'facebook_reel', 'facebook_story', 'facebook_live', 
  'watch', 'note', 'album',
  
  // Twitter/X
  'tweet', 'thread', 'space', 'spaces', 'fleet', 'moment', 'quote', 'retweet',
  
  // LinkedIn
  'linkedin_post', 'linkedin_video', 'linkedin_article', 'article', 'newsletter',
  
  // Pinterest
  'pin', 'idea_pin', 'video_pin', 'product_pin', 'board',
  
  // Snapchat
  'snap', 'spotlight', 'snapchat_story',
  
  // Twitch
  'clip', 'twitch_clip', 'twitch_stream', 'vod',
  
  // Other Platforms
  'thread_post', 'bluesky_post', 'mastodon_post', 'reddit_post', 'tumblr_post',
  
  // Generic Media Types
  'gif', 'animation', 'infographic', 'meme', 'quote_card', 'testimonial', 'review', 
  'tutorial', 'behind_the_scenes', 'announcement', 'promotion', 'ad', 'sponsored', 
  'collaboration', 'ugc', 'repurposed',
]