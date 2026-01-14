// src/components/dashboard/campaign-funnel/result/types.ts

'use client';
import { VideoResult, ThirdPartyApiResponse } from '@/types/user-detailed-info';
import { ContentPlatform } from '@/constants/social-platforms';
import { PLATFORM_IDS, DATA_SOURCE_ENDPOINT_IDS } from '@/constants/social-platforms';
import { ContentPostResponse } from '@/types/content-post';

// Platform Support Constants
export const API_SUPPORTED_PLATFORMS: ContentPlatform[] = ['instagram', 'tiktok', 'youtube'];
export const MANUAL_ONLY_PLATFORMS: ContentPlatform[] = ['facebook', 'linkedin'];

// ============================================================================
// SECTION 0: EXISTING ANALYTICS DATA INTERFACE (PRESERVED)
// ============================================================================

  
export interface ClassifiedError {
  type: 'not_found' | 'private' | 'timeout' | 'network' | 'invalid_url' | 'unknown';
  message: string;
  userMessage: string;
  isRetryable: boolean;
}

/**
 * Analytics data for campaign performance metrics
 * Used by: AnalyticsView, PerformanceOverview, CampaignReport
 */
export interface AnalyticsData {
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  totalFollowers: number;
  totalPosts: number;
  totalInfluencers: number;
  averageEngagementRate: number;
  // CPV/CPE metrics using collaboration price calculations
  totalCPV: number;          // Sum of all collaboration prices ÷ Total Views
  totalCPE: number;          // Sum of all collaboration prices ÷ Total Engagement
  viewsToFollowersRatio: number;
  commentToViewsRatio: number;

  // Adjusted values for exclusion logic (excluding posts with 0 likes)
  adjustedTotalFollowers?: number;
  adjustedTotalViews?: number;

  // Collaboration price tracking
  totalCollaborationPrice?: number;
  postsWithCollaborationPrice?: number;

  postsByDate: Array<{
    date: string;
    count: number;
    views: number;
    cumulativeViews: number;
    posts: Array<{
      influencerName: string;
      username: string;
      avatar: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }>;
  }>;

  topPerformers: Array<{
    name: string;
    username: string;
    avatar: string;
    clicks: number;
    isVerified: boolean;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalVideoPlayCount?: number;
    totalShares: number;
    avgEngagementRate: number;
    totalEngagement: number;
    followers: number;
    platform?: ContentPlatform | null;
    subscriberCount?: number;
  }>;

  topPosts: Array<{
    id: string;
    influencerName: string;
    username: string;
    avatar: string;
    thumbnail: string;
    contentUrl: string;
    platform: ContentPlatform | null;
    likes: number;
    comments: number;
    views: number;
    videoPlayCount?: number;
    plays: number;
    shares: number;
    engagementRate: number;
    isVerified: boolean;
    postId: string;
    totalEngagement: number;
    postDate: string;
    collaborationPrice?: number;
  }>;
}

// ============================================================================
// SECTION 1: TYPE DEFINITIONS
// ============================================================================
export type FieldVisibility = 'visible' | 'hidden' | 'readonly';
export type VideoMetricsFormMode = 'manual_add' | 'edit' | 'preview';

/**
 * Unified form data interface - superset of all fields used across modals
 */
export interface VideoMetricsFormData {
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

/**
 * Post data extracted from VideoResult - used for display and calculations
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
 * Preserved values for maintaining data during updates
 */
export interface PreservedValues {
  cpv: number | undefined;
  cpe: number | undefined;
  videoPlayCount: number | undefined;
}

/**
 * Field configuration for each form mode
 */
export interface VideoMetricsFieldConfig {
  profileUrl: FieldVisibility;
  influencerUsername: FieldVisibility;
  fullName: FieldVisibility;
  title: FieldVisibility;
  description: FieldVisibility;
  likes: FieldVisibility;
  comments: FieldVisibility;
  shares: FieldVisibility;
  views: FieldVisibility;
  followers: FieldVisibility;
  engagementRate: FieldVisibility;
  collaborationPrice: FieldVisibility;
  postDate: FieldVisibility;
  thumbnailUrl: FieldVisibility;
  isVideo: FieldVisibility;
  duration: FieldVisibility;
}

/**
 * Validation rule interface
 */
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

/**
 * Props for VideoMetricsForm component
 */
export interface VideoMetricsFormProps {
  mode: VideoMetricsFormMode;
  platform: ContentPlatform | null;
  initialData: Partial<VideoMetricsFormData>;
  onSubmit: (data: VideoMetricsFormData) => Promise<void>;
  onCancel: () => void;
  onBack?: () => void;
  isLoading: boolean;
  externalErrors?: Record<string, string>;
  fetchError?: string | null;
}

// ============================================================================
// SECTION 2: CONSTANTS & CONFIGURATIONS
// ============================================================================

/**
 * Default empty form data
 */
export const DEFAULT_FORM_DATA: VideoMetricsFormData = {
  profileUrl: '',
  influencerUsername: '',
  fullName: '',
  title: '',
  description: '',
  likes: 0,
  comments: 0,
  shares: 0,
  views: 0,
  followers: 0,
  engagementRate: '0%',
  collaborationPrice: 0,
  postDate: '',
  thumbnailUrl: '',
  isVideo: false,
  duration: 0,
};

/**
 * Field configurations per form mode
 */
export const FORM_FIELD_CONFIGS: Record<VideoMetricsFormMode, VideoMetricsFieldConfig> = {
  manual_add: {
    profileUrl: 'visible',
    influencerUsername: 'visible',
    fullName: 'visible',
    title: 'visible',
    description: 'visible',
    likes: 'visible',
    comments: 'visible',
    shares: 'visible',
    views: 'visible',
    followers: 'hidden',
    engagementRate: 'readonly',
    collaborationPrice: 'hidden',  // Removed from manual add - use influencer's price from DB
    postDate: 'visible',
    thumbnailUrl: 'visible',
    isVideo: 'visible',
    duration: 'visible',
  },
  edit: {
    profileUrl: 'readonly',
    influencerUsername: 'readonly',
    fullName: 'readonly',
    title: 'readonly',           // FIXED: Was 'visible', should be 'readonly' to match original
    description: 'hidden',
    likes: 'visible',
    comments: 'visible',
    shares: 'visible',
    views: 'visible',
    followers: 'readonly',
    engagementRate: 'readonly',
    collaborationPrice: 'hidden', // FIXED: Hidden in edit mode per original UI
    postDate: 'hidden',
    thumbnailUrl: 'hidden',
    isVideo: 'hidden',
    duration: 'hidden',
  },
  preview: {
    profileUrl: 'readonly',
    influencerUsername: 'readonly',
    fullName: 'readonly',
    title: 'visible',
    description: 'visible',
    likes: 'readonly',
    comments: 'readonly',
    shares: 'readonly',
    views: 'readonly',
    followers: 'readonly',
    engagementRate: 'readonly',
    collaborationPrice: 'hidden',  // Removed - use influencer's price from DB
    postDate: 'hidden',
    thumbnailUrl: 'hidden',
    isVideo: 'hidden',
    duration: 'hidden',
  },
};

/**
 * Validation rules per field
 */
export const VALIDATION_RULES: Record<keyof VideoMetricsFormData, ValidationRule[]> = {
  // REQUIRED FIELDS (Backend requires these for content post creation)
  profileUrl: [
    { required: true, message: 'Video/Post URL is required' },
  ],
  influencerUsername: [
    { required: true, message: 'Username is required' },
  ],
  
  // OPTIONAL FIELDS (Nice to have but not required)
  fullName: [],  // Optional - can be derived from influencer selection
  title: [],     // Optional - will default to 'Post' if empty
  description: [],
  likes: [
    { min: 0, message: 'Likes cannot be negative' },
  ],
  comments: [
    { min: 0, message: 'Comments cannot be negative' },
  ],
  shares: [
    { min: 0, message: 'Shares cannot be negative' },
  ],
  views: [
    { min: 0, message: 'Views cannot be negative' },
  ],
  followers: [
    { min: 0, message: 'Followers cannot be negative' },
  ],
  engagementRate: [],
  collaborationPrice: [
    { min: 0, message: 'Collaboration price cannot be negative' },
  ],
  postDate: [],
  thumbnailUrl: [],
  isVideo: [],
  duration: [
    { min: 0, message: 'Duration cannot be negative' },
  ],
};

// ============================================================================
// SECTION 3: CORE CALCULATION FORMULAS (CRITICAL - DO NOT MODIFY)
// ============================================================================

/**
 * Calculate Engagement Rate
 * Formula: (Likes + Comments + Shares*) / Followers × 100
 * *Shares only included if > 0
 * 
 * @param likes - Number of likes
 * @param comments - Number of comments
 * @param shares - Number of shares (only included if > 0)
 * @param followers - Number of followers
 * @returns Engagement rate as string with % suffix (e.g., "1.75%")
 */
export const calculateEngagementRate = (
  likes: number,
  comments: number,
  shares: number,
  followers: number
): string => {
  if (followers <= 0) return '0%';
  const totalEngagement = likes + comments + (shares > 0 ? shares : 0);
  return `${((totalEngagement / followers) * 100).toFixed(2)}%`;
};

/**
 * Calculate CPV (Cost Per View)
 * Formula: Collaboration Price / Video Play Count
 * 
 * @param collaborationPrice - The collaboration price in USD
 * @param videoPlayCount - The video play/view count
 * @returns CPV value (0 if invalid inputs)
 */
export const calculateCPV = (
  collaborationPrice: number,
  videoPlayCount: number
): number => {
  return collaborationPrice > 0 && videoPlayCount > 0
    ? collaborationPrice / videoPlayCount
    : 0;
};

/**
 * Calculate CPE (Cost Per Engagement)
 * Formula: Collaboration Price / (Likes + Comments + Shares*)
 * *Shares only included if > 0
 * 
 * @param collaborationPrice - The collaboration price in USD
 * @param likes - Number of likes
 * @param comments - Number of comments
 * @param shares - Number of shares (only included if > 0)
 * @returns CPE value (0 if invalid inputs)
 */
export const calculateCPE = (
  collaborationPrice: number,
  likes: number,
  comments: number,
  shares: number
): number => {
  const totalEngagements = likes + comments + (shares > 0 ? shares : 0);
  return collaborationPrice > 0 && totalEngagements > 0
    ? collaborationPrice / totalEngagements
    : 0;
};

// ============================================================================
// SECTION 4: DATA EXTRACTION UTILITIES
// ============================================================================

/**
 * Extract preserved values from video result
 * These values are used to maintain CPV/CPE calculations during updates
 **/
export const getPreservedValues = (video: VideoResult): PreservedValues => {
  return {
    cpv: (video as any)._preservedCPV,
    cpe: (video as any)._preservedCPE,
    videoPlayCount: (video as any)._preservedVideoPlayCount,
  };
};

/**
 * Extract collaboration price from multiple sources (priority order)
 * Priority: video level > post data level > InsightIQ data > array format > default
 **/
export const getCollaborationPrice = (
  video: VideoResult,
  postData: any,
  insightIQData: any
): number => {
  return (
    video.collaboration_price ||                     // Primary: video level
    postData?.collaboration_price ||                 // Secondary: post data level
    (insightIQData?.collaboration_price) ||          // Tertiary: InsightIQ data
    (Array.isArray(video.post_result_obj?.data) &&
      video.post_result_obj.data[0]?.collaboration_price) || // Quaternary: array format
    0                                                // Default: 0
  );
};


export const extractInsightIQMetrics = (
  insightIQData: any,
  video: VideoResult
): {
  likes: number;
  comments: number;
  shares: number;
  videoPlaysFromAPI: number;
  followers: number;
} => {
  return {
    likes: Math.max(0, insightIQData?.engagement?.like_count || 0),
    comments: Math.max(0, insightIQData?.engagement?.comment_count || 0),
    shares: Math.max(0, insightIQData?.engagement?.share_count || video.shares_count || 0),
    videoPlaysFromAPI: Math.max(0, insightIQData?.engagement?.view_count || 0),
    followers: Math.max(0, insightIQData?.profile?.follower_count || video.followers_count || 0),
  };
};


export const extractEnsembleMetrics = (
  postData: any,
  video: VideoResult
): {
  likes: number;
  comments: number;
  shares: number;
  videoPlaysFromAPI: number;
  followers: number;
} => {
  return {
    likes: Math.max(0,
      postData?.edge_media_preview_like?.count ||
      postData?.edge_liked_by?.count ||
      video.likes_count || 0
    ),
    comments: Math.max(0,
      postData?.edge_media_to_comment?.count ||
      postData?.edge_media_preview_comment?.count ||
      postData?.edge_media_to_parent_comment?.count ||
      video.comments_count || 0
    ),
    shares: Math.max(0,
      video.shares_count ||
      postData?.shares_count ||
      postData?.edge_media_to_share?.count ||
      0
    ),
    videoPlaysFromAPI: Math.max(0,
      postData?.video_view_count ||
      postData?.video_play_count ||
      0
    ),
    followers: Math.max(0,
      video.followers_count ||
      postData?.owner?.edge_followed_by?.count ||
      0
    ),
  };
};

// ============================================================================
// SECTION 5: MAIN DATA EXTRACTION FUNCTION
// ============================================================================

  export const getPostData = (video: VideoResult) => {
    const preserved = {
      cpv: (video as any)._preservedCPV,
      cpe: (video as any)._preservedCPE,
      videoPlayCount: (video as any)._preservedVideoPlayCount,
    };

    // =========================================================================
    // PRIORITY CHECK: Content-posts API structure (engagement at post_result_obj level)
    // =========================================================================
    const engagementData = video.post_result_obj?.engagement;
    const influencerData = video.post_result_obj?.influencer;

    if (engagementData && typeof engagementData.like_count !== 'undefined') {
      const likes = engagementData.like_count || 0;
      const comments = engagementData.comment_count || 0;
      const shares = engagementData.share_count || 0;
      const videoPlaysFromAPI = engagementData.view_count || 0;
      const followers = influencerData?.followers || video.followers_count || 0;
      const collaborationPrice = influencerData?.collaboration_price || video.collaboration_price || 0;

      const videoPlayCount = preserved.videoPlayCount ?? videoPlaysFromAPI;

      const totalEngagement = likes + comments + shares;
      const engagementRate = followers > 0
        ? ((totalEngagement / followers) * 100).toFixed(2) + '%'
        : '0%';

      const cpv = preserved.cpv ?? (collaborationPrice > 0 && videoPlayCount > 0 
        ? collaborationPrice / videoPlayCount : 0);
      const cpe = preserved.cpe ?? (collaborationPrice > 0 && totalEngagement > 0 
        ? collaborationPrice / totalEngagement : 0);

      // Platform-specific placeholder fallback
      const getPlatformPlaceholder = (contentUrl: string): string => {
        const url = contentUrl?.toLowerCase() || '';
        if (url.includes('facebook.com') || url.includes('fb.com')) return '/placeholders/facebook-video.svg';
        if (url.includes('linkedin.com')) return '/placeholders/linkedin-video.svg';
        if (url.includes('tiktok.com')) return '/placeholders/tiktok-video.svg';
        if (url.includes('youtube.com') || url.includes('youtu.be')) return '/placeholders/youtube-video.svg';
        if (url.includes('instagram.com')) return '/placeholders/instagram-video.svg';
        return '/dummy-image.svg';
      };

      const thumbnailUrl = video.thumbnail_url || video.thumbnail || video.media_preview || getPlatformPlaceholder(video.content_url || '');

      // const thumbnailUrl = video.thumbnail_url || video.thumbnail || video.media_preview || '/dummy-image.jpg';

      return {
        likes,
        comments,
        plays: videoPlayCount,
        actualViews: videoPlaysFromAPI,
        shares,
        followers,
        engagementRate,
        videoUrl: video.media_url || null,
        thumbnailUrl: getProxiedImageUrl(thumbnailUrl),
        isVideo: video.content_format === 'VIDEO',
        duration: typeof video.duration === 'string' ? parseFloat(video.duration) || 0 : (video.duration || 0),
        collaborationPrice,
        cpv,
        cpe,
        videoPlayCount,
      };
    }

    // =========================================================================
    // FALLBACK: InsightIQ / EnsembleData / Legacy structures
    // =========================================================================
    const postData = video.post_result_obj?.data;
    const insightIQData = Array.isArray(postData) && postData[0]?.engagement ? postData[0] : null;

    let likes: number;
    let comments: number;
    let shares: number;
    let playsFromAPI: number;
    let followers: number;

    if (insightIQData?.engagement) {
      // InsightIQ array structure
      likes = insightIQData.engagement.like_count || 0;
      comments = insightIQData.engagement.comment_count || 0;
      shares = insightIQData.engagement.share_count || 0;
      playsFromAPI = insightIQData.engagement.view_count || insightIQData.engagement.play_count || 0;
      followers = insightIQData.profile?.follower_count || video.followers_count || 0;
    } else if (video.views_count || video.likes_count) {
      // Root level values
      likes = video.likes_count || 0;
      comments = video.comments_count || 0;
      shares = video.shares_count || 0;
      playsFromAPI = Math.max(video.views_count || 0, video.plays_count || 0);
      followers = video.followers_count || 0;
    } else {
      // EnsembleData structure
      const data = Array.isArray(postData) ? postData[0] : postData;
      likes = data?.edge_media_preview_like?.count || data?.edge_liked_by?.count || 0;
      comments = data?.edge_media_to_comment?.count || data?.edge_media_preview_comment?.count || 0;
      shares = data?.shares_count || data?.edge_media_to_share?.count || 0;
      playsFromAPI = data?.video_view_count || data?.video_play_count || 0;
      followers = video.followers_count || data?.owner?.edge_followed_by?.count || 0;
    }

    // Calculate views using all available sources
    const viewsFromAPI = Math.max(
      video.views_count || 0,
      video.plays_count || 0,
      playsFromAPI
    );
    const finalViews = viewsFromAPI;

    const videoPlayCount = preserved.videoPlayCount !== undefined && preserved.videoPlayCount !== null
      ? preserved.videoPlayCount
      : (playsFromAPI > 0 ? playsFromAPI : finalViews);

    const totalEngagement = likes + comments + shares;
    const engagementRate = followers > 0
      ? ((totalEngagement / followers) * 100).toFixed(2) + '%'
      : '0%';

    const collaborationPrice = video.collaboration_price ||
      insightIQData?.collaboration_price ||
      (Array.isArray(postData) ? postData[0] : postData)?.collaboration_price ||
      0;

    const cpv = preserved.cpv ?? (collaborationPrice > 0 && videoPlayCount > 0
      ? collaborationPrice / videoPlayCount : 0);
    const cpe = preserved.cpe ?? (collaborationPrice > 0 && totalEngagement > 0
      ? collaborationPrice / totalEngagement : 0);

    let thumbnailUrl = video.thumbnail ||
      video.media_preview ||
      video.thumbnail_url ||
      insightIQData?.thumbnail_url ||
      (Array.isArray(postData) ? postData[0] : postData)?.thumbnail_src ||
      (Array.isArray(postData) ? postData[0] : postData)?.display_url ||
      '/dummy-image.jpg';

    const videoUrl = insightIQData?.media_url ||
      (Array.isArray(postData) ? postData[0] : postData)?.video_url ||
      video.media_url ||
      null;

    const isVideo = insightIQData?.format === 'VIDEO' ||
      (Array.isArray(postData) ? postData[0] : postData)?.is_video ||
      video.content_format === 'VIDEO' ||
      false;

    const duration = insightIQData?.duration ||
      (Array.isArray(postData) ? postData[0] : postData)?.video_duration ||
      (typeof video.duration === 'string' ? parseFloat(video.duration) || 0 : (video.duration || 0));

    return {
      likes,
      comments,
      plays: videoPlayCount,
      actualViews: finalViews,
      shares,
      followers,
      engagementRate,
      videoUrl,
      thumbnailUrl: getProxiedImageUrl(thumbnailUrl),
      isVideo,
      duration,
      collaborationPrice,
      cpv,
      cpe,
      videoPlayCount,
    };
  };

// ============================================================================
// SECTION 6: DATA TRANSFORMATION UTILITIES
// ============================================================================

export const videoResultToFormData = (video: VideoResult): VideoMetricsFormData => {
  let likes = 0;
  let comments = 0;
  let shares = 0;
  let views = 0;
  let followers = 0;
  let collaborationPrice = 0;

  // Check for content-posts API structure (engagement at post_result_obj level)
  const engagementData = video.post_result_obj?.engagement;
  const influencerData = video.post_result_obj?.influencer;

  if (engagementData) {
    // Content-posts API format
    likes = engagementData.like_count || 0;
    comments = engagementData.comment_count || 0;
    shares = engagementData.share_count || 0;
    views = engagementData.view_count || 0;
    followers = influencerData?.followers || video.followers_count || 0;
    collaborationPrice = influencerData?.collaboration_price || video.collaboration_price || 0;
  } else {
    // Fallback to getPostData for legacy structures
    const postData = getPostData(video);
    likes = postData.likes;
    comments = postData.comments;
    shares = postData.shares;
    views = postData.videoPlayCount;
    followers = postData.followers;
    collaborationPrice = postData.collaborationPrice;
  }

  // Calculate engagement rate
  const engagementRate = calculateEngagementRate(likes, comments, shares, followers);

  // =========================================================================
  // EXTRACT URL - Use content_url directly (don't construct Instagram URL)
  // =========================================================================
  const profileUrl = video.content_url || '';

  // =========================================================================
  // EXTRACT OTHER FIELDS
  // =========================================================================
  const duration = video.duration || 
    video.post_result_obj?.data?.[0]?.duration || 
    0;

  const thumbnailUrl = video.thumbnail || 
    video.media_preview || 
    video.post_result_obj?.data?.[0]?.thumbnail_url || 
    '';

  const isVideo = video.post_result_obj?.data?.[0]?.format === 'VIDEO' ||
    video.content_format === 'VIDEO' ||
    video.content_type?.includes('video') ||
    video.content_type?.includes('reel') ||
    false;

  return {
    profileUrl,
    influencerUsername: video.influencer_username || '',
    fullName: video.full_name || '',
    title: video.title || '',
    description: video.caption || '',
    likes,
    comments,
    shares,
    views,
    followers,
    engagementRate,
    collaborationPrice,
    postDate: video.post_created_at || video.posted_at || '',
    thumbnailUrl,
    isVideo,
    duration: typeof duration === 'string' ? parseFloat(duration) : duration,
  };
};

// ============================================================================
// SECTION 6.1: CONTENT POST UPDATE PAYLOAD TYPE
// ============================================================================

export interface ContentPostUpdatePayload {
  title?: string;
  caption?: string;
  content_url?: string;
  content_type?: string;
  content_format?: string;
  media_url?: string;
  thumbnail_url?: string;
  duration?: number;
  tracking_status?: string;
  initial_metadata?: {
    engagement: {
      like_count: number;
      comment_count: number;
      share_count: number;
      view_count: number;
      play_count: number;
      save_count: number;
    };
    influencer: {
      full_name: string;
      username: string;
      followers: number;
      collaboration_price: number;
    };
    updated_at: string;
    update_source: string;
    [key: string]: any;
  };
}

/**
 * Transform form data to ContentPostUpdate API payload
 **/

export const formDataToUpdatePayload = (
  data: VideoMetricsFormData,
  video: VideoResult
): ContentPostUpdatePayload => {
  // Build engagement object for snapshot creation
  // Keys must match backend extraction: engagement.get("like_count", 0)
  const engagement = {
    like_count: data.likes || 0,
    comment_count: data.comments || 0,
    share_count: data.shares || 0,
    view_count: data.views || 0,
    play_count: data.views || 0,  // play_count mirrors view_count for video content
    save_count: 0,
  };

  // Build influencer info for reference (stored in metadata)
  const influencer = {
    full_name: data.fullName || video.full_name || '',
    username: data.influencerUsername || video.influencer_username || '',
    followers: data.followers || 0,
    collaboration_price: data.collaborationPrice || 0,
  };

  // Preserve existing metadata structure and merge with updates
  const existingMetadata = 
    video.post_result_obj?.original_response?.initial_metadata || 
    video.initial_metadata || 
    {};

  return {
    // Direct content_posts columns (optional updates)
    title: data.title || undefined,
    caption: data.description || undefined,
    
    // JSONB field - Backend extracts engagement for performance snapshots
    // See: ContentPostService._create_snapshot_if_metadata_exists()
    initial_metadata: {
      ...existingMetadata,
      engagement,
      influencer,
      updated_at: new Date().toISOString(),
      update_source: 'manual_edit',
    },
  };
};

// ============================================================================
// SECTION 6.2: UNIFIED INITIAL METADATA BUILDER

/**
 * Input interface for building unified initial_metadata
 * Used by both manual entry and API-fetched content posts
 */
export interface InitialMetadataInput {
  // Engagement metrics (REQUIRED - backend extracts these for snapshots)
  likes: number;
  comments: number;
  shares: number;
  views: number;
  plays?: number;
  saves?: number;
  
  // Influencer/Profile info
  username: string;
  fullName: string;
  followers: number;
  isVerified?: boolean;
  profileUrl?: string;
  profileImageUrl?: string;
  
  // Platform info
  platform: ContentPlatform;
  provider: 'manual' | 'insightiq';
  
  // For API-fetched data - spread the full InsightIQ response
  rawData?: Record<string, any>;
  
  // Optional: content metadata
  title?: string;
  caption?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  postedAt?: string;
}

/**
 * Build unified initial_metadata structure
 **/
export const buildUnifiedInitialMetadata = (
  input: InitialMetadataInput
): Record<string, any> => {
  const now = new Date().toISOString();
  const plays = input.plays ?? input.views;
  const saves = input.saves ?? 0;

  // Base structure that backend expects
  const metadata: Record<string, any> = {
    // Spread raw API data first (if available) so our structured fields override
    ...(input.rawData || {}),

    // =========================================================================
    // ENGAGEMENT OBJECT - Backend extracts from this for snapshots
    // Keys MUST match: like_count, comment_count, view_count, share_count, etc.
    // See: ContentPostService._create_snapshot_if_metadata_exists()
    // =========================================================================
    engagement: {
      like_count: input.likes || 0,
      comment_count: input.comments || 0,
      view_count: input.views || 0,
      share_count: input.shares || 0,
      play_count: plays || 0,
      save_count: saves,
      // Include null fields for API consistency
      laugh_count: null,
      love_count: null,
    },

    // =========================================================================
    // PROFILE OBJECT - Influencer info at time of tracking
    // =========================================================================
    profile: {
      platform_username: input.username || null,
      url: input.profileUrl || null,
      image_url: input.profileImageUrl || null,
      is_verified: input.isVerified || false,
      follower_count: input.followers || 0,
      subscriber_count: null,
    },

    // =========================================================================
    // LEGACY SUPPORT - engagement_snapshot (for backward compatibility)
    // Some components may still read from this structure
    // =========================================================================
    engagement_snapshot: {
      likes: input.likes || 0,
      comments: input.comments || 0,
      views: input.views || 0,
      plays: plays || 0,
      shares: input.shares || 0,
    },

    // =========================================================================
    // USER SNAPSHOT - Influencer info snapshot
    // =========================================================================
    user_snapshot: {
      username: input.username || null,
      full_name: input.fullName || null,
      followers_count: input.followers || 0,
      is_verified: input.isVerified || false,
    },

    // =========================================================================
    // PLATFORM INFO - Source identification
    // =========================================================================
    platform_info: {
      platform: input.platform,
      provider: input.provider,
    },

    // =========================================================================
    // METADATA TRACKING
    // =========================================================================
    source: input.provider === 'manual' ? 'manual_entry' : 'api_fetch',
    created_at: now,
    
    // Include content info if available
    ...(input.title && { title: input.title }),
    ...(input.caption && { description: input.caption }),
    ...(input.mediaUrl && { media_url: input.mediaUrl }),
    ...(input.thumbnailUrl && { thumbnail_url: input.thumbnailUrl }),
    ...(input.duration && { duration: input.duration }),
    ...(input.postedAt && { published_at: input.postedAt }),
  };

  // For manual entries, add explicit marker
  if (input.provider === 'manual') {
    metadata.entered_by = 'user';
  }

  return metadata;
};

// ============================================================================
// SECTION 7: VALIDATION UTILITIES
// ============================================================================

export const validateVideoMetricsForm = (
  data: Partial<VideoMetricsFormData>,
  mode: VideoMetricsFormMode
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const fieldConfig = FORM_FIELD_CONFIGS[mode];

  // Only validate visible fields
  (Object.keys(VALIDATION_RULES) as Array<keyof VideoMetricsFormData>).forEach((field) => {
    const visibility = fieldConfig[field];
    if (visibility === 'hidden') return;

    const rules = VALIDATION_RULES[field];
    const value = data[field];

    rules.forEach((rule) => {
      // Required check (only for visible, editable fields)
      if (rule.required && visibility === 'visible') {
        if (value === undefined || value === null || value === '') {
          errors[field] = rule.message;
          return;
        }
      }

      // Min check for numbers
      if (rule.min !== undefined && typeof value === 'number') {
        if (value < rule.min) {
          errors[field] = rule.message;
          return;
        }
      }

      // Max check for numbers
      if (rule.max !== undefined && typeof value === 'number') {
        if (value > rule.max) {
          errors[field] = rule.message;
          return;
        }
      }

      // Pattern check for strings
      if (rule.pattern && typeof value === 'string') {
        if (!rule.pattern.test(value)) {
          errors[field] = rule.message;
          return;
        }
      }
    });
  });

  return errors;
};

// ============================================================================
// SECTION 8: FORMATTING UTILITIES
// ============================================================================

/**
 * Format large numbers with K/M suffixes
 * 
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.5M", "80.5K", "999")
 */
export const formatNumber = (num: number): string => {
  if (num === undefined || num === null) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Format currency values
 **/
  // FIXED: Format currency utility function - Handle 0 values properly for CPV/CPE
  export const formatCurrency = (amount: number): string => {
    // Return 'N/A' only if amount is undefined, null, or negative
    if (amount === undefined || amount === null || amount < 0) return 'N/A';

    // Handle 0 values properly - show as 0.00 instead of N/A
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

/**
 * Format date string to readable format
 * 
 * @param dateString - ISO date string
 * @returns Formatted date (e.g., "Dec 23, 2025")
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date to relative time
 * 
 * @param dateString - ISO date string
 * @returns Relative time string (e.g., "Today", "Yesterday", "5 days ago")
 */
export const formatRelativeTime = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    const now = new Date();

    // Get the start of today and the date in question (ignoring time)
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Calculate difference in days
    const diffInMilliseconds = todayStart.getTime() - dateStart.getTime();
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays === -1) {
      return 'Tomorrow';
    } else if (diffInDays > 1 && diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < -1) {
      return `${Math.abs(diffInDays)} days from now`;
    } else if (diffInDays >= 30 && diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Get proxied image URL for Instagram/Facebook CDN images
 * 
 * @param originalUrl - The original image URL
 * @returns Proxied URL or placeholder
 */
export const getProxiedImageUrl = (originalUrl: string): string => {
  if (!originalUrl) return '/user/profile-placeholder.png';

  if (
    originalUrl.startsWith('/api/') ||
    originalUrl.startsWith('/user/') ||
    originalUrl.startsWith('data:')
  ) {
    return originalUrl;
  }

  if (
    originalUrl.includes('instagram.com') ||
    originalUrl.includes('fbcdn.net') ||
    originalUrl.includes('cdninstagram.com')
  ) {
    return `/api/v0/instagram/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  }

  return originalUrl;
};

// ============================================================================
// SECTION 9: PLATFORM-SPECIFIC UTILITIES
// ============================================================================

/**
 * Check if a platform requires manual entry only (no API fetch available)
 * 
 * @param platform - The content platform
 * @returns true if manual entry only
 */
export const isManualOnlyPlatform = (platform: ContentPlatform | null): boolean => {
  if (!platform) return false;
  return ['facebook', 'linkedin'].includes(platform);
};

/**
 * Get platform-specific content types
 * 
 * @param platform - The content platform
 * @param url - The content URL for pattern matching
 * @param isVideo - Whether the content is video
 * @returns Content type string
 */
export const getPlatformContentType = (
  platform: ContentPlatform | null,
  url: string,
  isVideo: boolean
): string => {
  const urlLower = url.toLowerCase();

  switch (platform) {
    case 'youtube':
      if (urlLower.includes('/shorts/')) return 'shorts';
      return 'video';

    case 'tiktok':
      return 'video';

    case 'instagram':
      if (urlLower.includes('/reel/') || urlLower.includes('/reels/')) return 'reel';
      if (urlLower.includes('/stories/')) return 'story';
      if (urlLower.includes('/tv/')) return 'video';
      return isVideo ? 'reel' : 'post';

    case 'facebook':
      if (urlLower.includes('/reel/') || urlLower.includes('/reels/')) return 'facebook_reel';
      if (urlLower.includes('/watch/')) return 'facebook_video';
      if (urlLower.includes('/stories/')) return 'facebook_story';
      return isVideo ? 'facebook_video' : 'facebook_post';

    case 'linkedin':
      if (urlLower.includes('/video/')) return 'linkedin_video';
      return isVideo ? 'linkedin_video' : 'linkedin_post';

    default:
      return isVideo ? 'video' : 'post';
  }
};

/**
 * Get platform-specific content format
 * 
 * @param platform - The content platform
 * @param url - The content URL for pattern matching
 * @param isVideo - Whether the content is video
 * @returns Content format string
 */
export const getPlatformContentFormat = (
  platform: ContentPlatform | null,
  url: string,
  isVideo: boolean
): 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'STORY' => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('/stories/')) return 'STORY';
  if (isVideo) return 'VIDEO';
  return 'IMAGE';
};

// ============================================================================
// SECTION: PLATFORM POST ID EXTRACTION (For Duplicate Detection)
// ============================================================================

/**
 * Generate a deterministic hash from a string
 * Same input will always produce the same output
 */
const generateDeterministicHash = (input: string): string => {
  let hash = 0;
  const cleanInput = input.split('?')[0].replace(/\/$/, '').toLowerCase();
  
  for (let i = 0; i < cleanInput.length; i++) {
    hash = ((hash << 5) - hash) + cleanInput.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

/**
 * Extract platform-native post ID from URL for duplicate detection
 **/
export const extractPlatformPostId = (url: string, platform: ContentPlatform): string => {
  // Guard: Return random ID only if URL is completely empty (shouldn't happen with validation)
  if (!url?.trim()) {
    console.warn('⚠️ extractPlatformPostId called with empty URL');
    return `manual_${platform}_${Date.now()}`;
  }

  const normalizedUrl = url.trim();

  try {
    switch (platform) {
      // ========================================================================
      // LINKEDIN - Extract activity ID from various URL formats
      // ========================================================================
      case 'linkedin': {
        // Pattern 1: activity-{ID} in URL path (most common)
        // Example: /posts/western-digital_the-foundation-of-the-ai-era-activity-7406844789318459392-oVnR
        const activityMatch = normalizedUrl.match(/activity-(\d+)/);
        if (activityMatch) {
          console.log(`✅ LinkedIn activity ID extracted: ${activityMatch[1]}`);
          return `linkedin_${activityMatch[1]}`;
        }

        // Pattern 2: URN format (API responses, share dialogs)
        // Example: urn:li:activity:7406844789318459392
        const urnMatch = normalizedUrl.match(/urn:li:(activity|share|ugcPost):(\d+)/);
        if (urnMatch) {
          console.log(`✅ LinkedIn URN ID extracted: ${urnMatch[2]}`);
          return `linkedin_${urnMatch[2]}`;
        }

        // Pattern 3: Feed update URL
        // Example: /feed/update/urn:li:activity:7406844789318459392
        const feedMatch = normalizedUrl.match(/feed\/update\/urn:li:(activity|share|ugcPost):(\d+)/);
        if (feedMatch) {
          console.log(`✅ LinkedIn feed ID extracted: ${feedMatch[2]}`);
          return `linkedin_${feedMatch[2]}`;
        }

        // Pattern 4: Any long numeric ID (fallback for edge cases)
        const numericMatch = normalizedUrl.match(/(\d{15,})/);
        if (numericMatch) {
          console.log(`✅ LinkedIn numeric ID extracted: ${numericMatch[1]}`);
          return `linkedin_${numericMatch[1]}`;
        }
        break;
      }

      // ========================================================================
      // FACEBOOK - Extract post/video/reel ID
      // ========================================================================
      case 'facebook': {
        // Pattern 1: /videos/{VIDEO_ID}
        const videoMatch = normalizedUrl.match(/\/videos\/(\d+)/);
        if (videoMatch) {
          console.log(`✅ Facebook video ID extracted: ${videoMatch[1]}`);
          return `facebook_${videoMatch[1]}`;
        }

        // Pattern 2: /reel/{REEL_ID}
        const reelMatch = normalizedUrl.match(/\/reel\/(\d+)/);
        if (reelMatch) {
          console.log(`✅ Facebook reel ID extracted: ${reelMatch[1]}`);
          return `facebook_${reelMatch[1]}`;
        }

        // Pattern 3: ?v={VIDEO_ID} (watch URLs)
        const watchMatch = normalizedUrl.match(/[?&]v=(\d+)/);
        if (watchMatch) {
          console.log(`✅ Facebook watch ID extracted: ${watchMatch[1]}`);
          return `facebook_${watchMatch[1]}`;
        }

        // Pattern 4: /posts/{POST_ID}
        const postsMatch = normalizedUrl.match(/\/posts\/(\d+)/);
        if (postsMatch) {
          console.log(`✅ Facebook post ID extracted: ${postsMatch[1]}`);
          return `facebook_${postsMatch[1]}`;
        }

        // Pattern 5: /posts/pfbid{ID} (newer format)
        const pfbidMatch = normalizedUrl.match(/\/posts\/(pfbid[\w]+)/);
        if (pfbidMatch) {
          console.log(`✅ Facebook pfbid extracted: ${pfbidMatch[1]}`);
          return `facebook_${pfbidMatch[1]}`;
        }

        // Pattern 6: /story.php?story_fbid={ID}
        const storyFbidMatch = normalizedUrl.match(/story_fbid=(\d+)/);
        if (storyFbidMatch) {
          console.log(`✅ Facebook story ID extracted: ${storyFbidMatch[1]}`);
          return `facebook_${storyFbidMatch[1]}`;
        }

        // Pattern 7: Any long numeric ID (fallback)
        const numericMatch = normalizedUrl.match(/(\d{10,})/);
        if (numericMatch) {
          console.log(`✅ Facebook numeric ID extracted: ${numericMatch[1]}`);
          return `facebook_${numericMatch[1]}`;
        }
        break;
      }

      // ========================================================================
      // INSTAGRAM - Extract shortcode from URL
      // ========================================================================
      case 'instagram': {
        // Pattern: /(p|reel|tv|reels)/{SHORTCODE}
        const match = normalizedUrl.match(/\/(p|reel|tv|reels)\/([\w-]+)/);
        if (match) {
          console.log(`✅ Instagram shortcode extracted: ${match[2]}`);
          return match[2]; // Instagram shortcodes are already unique
        }
        break;
      }

      // ========================================================================
      // YOUTUBE - Extract video ID
      // ========================================================================
      case 'youtube': {
        // Pattern 1: ?v={VIDEO_ID} (standard watch URL)
        const vMatch = normalizedUrl.match(/[?&]v=([\w-]+)/);
        if (vMatch) {
          console.log(`✅ YouTube video ID extracted: ${vMatch[1]}`);
          return vMatch[1];
        }

        // Pattern 2: /shorts/{VIDEO_ID}
        const shortsMatch = normalizedUrl.match(/\/shorts\/([\w-]+)/);
        if (shortsMatch) {
          console.log(`✅ YouTube shorts ID extracted: ${shortsMatch[1]}`);
          return shortsMatch[1];
        }

        // Pattern 3: youtu.be/{VIDEO_ID} (short URL)
        const shortUrlMatch = normalizedUrl.match(/youtu\.be\/([\w-]+)/);
        if (shortUrlMatch) {
          console.log(`✅ YouTube short URL ID extracted: ${shortUrlMatch[1]}`);
          return shortUrlMatch[1];
        }

        // Pattern 4: /embed/{VIDEO_ID}
        const embedMatch = normalizedUrl.match(/\/embed\/([\w-]+)/);
        if (embedMatch) {
          console.log(`✅ YouTube embed ID extracted: ${embedMatch[1]}`);
          return embedMatch[1];
        }
        break;
      }

      // ========================================================================
      // TIKTOK - Extract video ID
      // ========================================================================
      case 'tiktok': {
        // Pattern 1: /video/{VIDEO_ID}
        const videoMatch = normalizedUrl.match(/\/video\/(\d+)/);
        if (videoMatch) {
          console.log(`✅ TikTok video ID extracted: ${videoMatch[1]}`);
          return videoMatch[1];
        }

        // Pattern 2: vm.tiktok.com/{SHORT_CODE} - needs hash fallback
        break;
      }
    }
  } catch (error) {
    console.warn('⚠️ extractPlatformPostId error:', error);
  }

  // ========================================================================
  // FALLBACK: Generate deterministic hash from URL
  // Same URL will ALWAYS produce the same hash = duplicate detection works
  // ========================================================================
  const hashId = generateDeterministicHash(normalizedUrl);
  console.log(`⚠️ Could not extract native ID, using deterministic hash: manual_${platform}_${hashId}`);
  return `manual_${platform}_${hashId}`;
};

export interface AnalyticsData {
  totalClicks: number;
  totalImpressions: number;
  totalReach: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  totalShares: number;
  totalFollowers: number;
  totalPosts: number;
  totalInfluencers: number;
  averageEngagementRate: number;
  totalCPV: number;
  totalCPE: number;
  viewsToFollowersRatio: number;
  commentToViewsRatio: number;
  adjustedTotalFollowers?: number;
  adjustedTotalViews?: number;
  totalCollaborationPrice?: number;
  postsWithCollaborationPrice?: number;
  postsByDate: Array<{
    date: string;
    count: number;
    views: number;
    cumulativeViews: number;
    posts: Array<{
      influencerName: string;
      username: string;
      avatar: string;
      views: number;
      likes: number;
      comments: number;
      shares: number;
    }>;
  }>;
  topPerformers: Array<{
    name: string;
    username: string;
    avatar: string;
    clicks: number;
    isVerified: boolean;
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalViews: number;
    totalVideoPlayCount?: number;
    totalShares: number;
    avgEngagementRate: number;
    totalEngagement: number;
    followers: number;
    platform?: ContentPlatform | null;
    subscriberCount?: number;
  }>;
  topPosts: Array<{
    id: string;
    influencerName: string;
    username: string;
    avatar: string;
    thumbnail: string;
    contentUrl: string;
    platform: ContentPlatform | null;
    likes: number;
    comments: number;
    views: number;
    videoPlayCount?: number;
    plays: number;
    shares: number;
    engagementRate: number;
    isVerified: boolean;
    postId: string;
    totalEngagement: number;
    postDate: string;
    collaborationPrice?: number;
  }>;
}

export type ContentFormat = 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'STORY';

export interface VideoMetricsFormData {
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

export interface PreservedPostData {
  shares: number;
  videoPlayCount: number;
  collaborationPrice: number;
  followers: number;
}

export interface ProgressUpdate {
  total: number;
  completed: number;
  current: string;
  errors: number;
}

export interface PreservedValuesWithId extends PreservedPostData {
  result_id: string;
  cpv: number;
  cpe: number;
}

// ============================================================================
// SECTION 2: CONTENT POST UPDATE PAYLOAD
// ============================================================================

export interface ContentPostUpdatePayload {
  title?: string;
  caption?: string;
  content_url?: string;
  content_type?: string;
  content_format?: string;
  media_url?: string;
  thumbnail_url?: string;
  duration?: number;
  tracking_status?: string;
  initial_metadata?: {
    engagement: {
      like_count: number;
      comment_count: number;
      share_count: number;
      view_count: number;
      play_count: number;
      save_count: number;
    };
    influencer: {
      full_name: string;
      username: string;
      followers: number;
      collaboration_price: number;
    };
    updated_at: string;
    update_source: string;
    [key: string]: any;
  };
}

// ============================================================================
// SECTION 3: SHARED UTILITY FUNCTIONS (SINGLE SOURCE OF TRUTH)
// ============================================================================

/**
 * Extract shortcode from Instagram URL
 * Used by: SinglePostUpdater, BulkPostUpdater, PublishedResults, content-post.client
 */
export const extractShortcodeFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)\/?/);
  return match ? match[2] : null;
};

/**
 * Fetch followers count from userhandles API
 * Used by: SinglePostUpdater, BulkPostUpdater
 */
export const fetchFollowersCount = async (username: string): Promise<number> => {
  try {
    if (!username || username.trim().length < 2) return 0;
    const cleanUsername = username.trim().replace(/^@/, '');

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) return 0;

    const response = await fetch(
      `/api/v0/discover/userhandles?q=${encodeURIComponent(cleanUsername)}&type=search&limit=5`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) return 0;
    const data = await response.json();
    if (!data.success || !data.data?.length) return 0;

    const exactMatch = data.data.find(
      (user: { username: string }) => user.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    const target = exactMatch || data.data[0];
    return typeof target.followers === 'string'
      ? parseInt(target.followers, 10) || 0
      : target.followers || 0;
  } catch {
    return 0;
  }
};

/**
 * Prepare InsightIQ API input from VideoResult
 * Used by: SinglePostUpdater, BulkPostUpdater
 */
export const prepareInsightIQInput = (
  videoResult: VideoResult
): { url?: string; code?: string } => {
  // Priority 1: content_url
  if (videoResult.content_url) {
    const shortcode = extractShortcodeFromUrl(videoResult.content_url);
    if (shortcode) return { code: shortcode };
    return { url: videoResult.content_url };
  }

  // Priority 2: post_result_obj.data
  const postData = Array.isArray(videoResult.post_result_obj?.data)
    ? videoResult.post_result_obj?.data[0]
    : videoResult.post_result_obj?.data;

  if (postData?.shortcode) {
    return { url: `https://www.instagram.com/p/${postData.shortcode}/` };
  }

  // Priority 3: post_id as shortcode
  if (videoResult.post_id && !/^\d+$/.test(videoResult.post_id)) {
    return { url: `https://www.instagram.com/p/${videoResult.post_id}/` };
  }

  return {};
};

/**
 * Transform InsightIQ data to ContentPostUpdate payload
 * Used by: SinglePostUpdater, BulkPostUpdater
 */
export const transformToContentPostUpdate = (
  insightIQData: any,
  videoResult: VideoResult,
  preserved: PreservedPostData
): ContentPostUpdatePayload => {
  const isVideo = insightIQData.post.is_video;
  const shortcode = insightIQData.post.shortcode;

  return {
    title: insightIQData.post.caption || insightIQData.post.title || '',
    caption: insightIQData.post.caption || '',
    content_url: shortcode
      ? `https://www.instagram.com/p/${shortcode}/`
      : videoResult.content_url,
    content_type: isVideo ? 'reel' : 'post',
    content_format: isVideo ? 'VIDEO' : 'IMAGE',
    media_url: insightIQData.post.display_url || insightIQData.post.video_url || '',
    thumbnail_url: insightIQData.post.thumbnail_src || insightIQData.post.display_url || '',
    duration: insightIQData.post.video_duration || 0,
    tracking_status: 'active',
    initial_metadata: {
      engagement: {
        like_count: insightIQData.post.like_count || 0,
        comment_count: insightIQData.post.comment_count || 0,
        share_count: preserved.shares || 0,
        view_count: insightIQData.post.video_view_count || insightIQData.post.play_count || 0,
        play_count: preserved.videoPlayCount || insightIQData.post.play_count || 0,
        save_count: 0,
      },
      influencer: {
        full_name: insightIQData.user.full_name || videoResult.full_name || '',
        username: insightIQData.user.username || videoResult.influencer_username || '',
        followers: preserved.followers || 0,
        collaboration_price: preserved.collaborationPrice || 0,
      },
      updated_at: new Date().toISOString(),
      update_source: 'post_updater',
      platform_id: PLATFORM_IDS.INSTAGRAM,
      data_source_endpoint_id: DATA_SOURCE_ENDPOINT_IDS.INSIGHTIQ,
      platform_post_id: insightIQData.post.post_id || shortcode,
    },
  };
};

/**
 * Transform ContentPostResponse to VideoResult
 * Used by: SinglePostUpdater, BulkPostUpdater
 */
export const transformToVideoResult = (
  apiResponse: ContentPostResponse,
  originalVideo: VideoResult,
  insightIQData: any,
  enhancedFollowers: number
): VideoResult => {
  const validFormats: ContentFormat[] = ['VIDEO', 'IMAGE', 'CAROUSEL', 'STORY'];
  const contentFormat = validFormats.includes(apiResponse.content_format as ContentFormat)
    ? (apiResponse.content_format as ContentFormat)
    : originalVideo.content_format;

  const postResultObj: ThirdPartyApiResponse = {
    data: originalVideo.post_result_obj?.data || [],
    original_response: apiResponse,
    engagement: {
      like_count: insightIQData.post.like_count || 0,
      comment_count: insightIQData.post.comment_count || 0,
      view_count: insightIQData.post.video_view_count || insightIQData.post.play_count || 0,
      share_count: originalVideo.shares_count || 0,
      save_count: 0,
    },
    influencer: {
      ...originalVideo.post_result_obj?.influencer,
      username: insightIQData.user.username || originalVideo.influencer_username,
      full_name: insightIQData.user.full_name || originalVideo.full_name,
      followers: enhancedFollowers,
    },
  };

  return {
    ...originalVideo,
    id: apiResponse.id,
    content_url: apiResponse.content_url,
    content_type: apiResponse.content_type,
    content_format: contentFormat,
    title: apiResponse.title || originalVideo.title,
    caption: apiResponse.caption || originalVideo.caption,
    media_url: apiResponse.media_url,
    thumbnail_url: apiResponse.thumbnail_url,
    duration: apiResponse.duration ?? originalVideo.duration ?? 0,
    updated_at: apiResponse.updated_at,
    likes_count: insightIQData.post.like_count || originalVideo.likes_count,
    comments_count: insightIQData.post.comment_count || originalVideo.comments_count,
    views_count: insightIQData.post.video_view_count || insightIQData.post.play_count || originalVideo.views_count,
    plays_count: insightIQData.post.play_count || originalVideo.plays_count,
    followers_count: enhancedFollowers || originalVideo.followers_count,
    initial_metadata: apiResponse.initial_metadata,
    post_result_obj: postResultObj,
  };
};

/**
 * Classify API errors for user-friendly messaging
 * SINGLE SOURCE - Used by SinglePostUpdater and BulkPostUpdater
 */
export const classifyApiError = (error: unknown, username?: string): ClassifiedError => {
  const errorMsg = error instanceof Error ? error.message : String(error);
  const lowerMsg = errorMsg.toLowerCase();
  const userRef = username ? `@${username}` : 'this post';

  if (lowerMsg.includes('invalid content_url') || lowerMsg.includes('invalid url')) {
    return {
      type: 'invalid_url',
      message: errorMsg,
      userMessage: `Post not found or deleted: ${userRef}`,
      isRetryable: false,
    };
  }

  if (lowerMsg.includes('not found') || lowerMsg.includes('404')) {
    return {
      type: 'not_found',
      message: errorMsg,
      userMessage: `Post not found: ${userRef}`,
      isRetryable: false,
    };
  }

  if (lowerMsg.includes('private') || lowerMsg.includes('restricted')) {
    return {
      type: 'private',
      message: errorMsg,
      userMessage: `Cannot access private post: ${userRef}`,
      isRetryable: false,
    };
  }

  if (lowerMsg.includes('timeout') || lowerMsg.includes('timed out')) {
    return {
      type: 'timeout',
      message: errorMsg,
      userMessage: `Request timeout: ${userRef}`,
      isRetryable: true,
    };
  }

  if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('connection')) {
    return {
      type: 'network',
      message: errorMsg,
      userMessage: 'Network error - please try again',
      isRetryable: true,
    };
  }

  return {
    type: 'unknown',
    message: errorMsg,
    userMessage: `Failed to update: ${userRef}`,
    isRetryable: true,
  };
};

/**
 * Check if platform supports API fetch
 */
export const isApiSupported = (platform: ContentPlatform | null): boolean =>
  platform !== null && API_SUPPORTED_PLATFORMS.includes(platform);

/**
 * Check if platform is manual-only
 */
export const isManualOnly = (platform: ContentPlatform | null): boolean =>
  platform !== null && MANUAL_ONLY_PLATFORMS.includes(platform);


/**
 * Build form data from API response - SINGLE SOURCE
 * Used by SinglePostUpdater and BulkPostUpdater
 */
export const buildFormDataFromAPIResponse = (
  apiResponse: any,
  originalFormData: VideoMetricsFormData,
  enhancedFollowers: number
): VideoMetricsFormData => {
  const postData = apiResponse.post || {};
  const userData = apiResponse.user || {};

  const likes = postData.likes_count || postData.like_count || 0;
  const comments = postData.comments_count || postData.comment_count || 0;
  const views = postData.video_view_count || postData.view_count || postData.plays_count || 0;
  const shares = originalFormData.shares || 0;
  const collaborationPrice = originalFormData.collaborationPrice || 0;
  const followers = enhancedFollowers || originalFormData.followers || 0;

  return {
    ...originalFormData,
    likes,
    comments,
    views,
    followers,
    shares,
    collaborationPrice,
    engagementRate: calculateEngagementRate(likes, comments, shares, followers),
    isVideo: postData.is_video || postData.media_type === 'VIDEO' || originalFormData.isVideo,
    influencerUsername: userData.username || originalFormData.influencerUsername,
    fullName: userData.full_name || originalFormData.fullName,
    thumbnailUrl: postData.thumbnail_src || postData.display_url || originalFormData.thumbnailUrl,
    duration: postData.video_duration || originalFormData.duration,
    title: postData.caption || originalFormData.title,
    description: postData.caption || originalFormData.description,
  };
};

// ============================================================================
// SECTION 10: ADDVIDEOMODAL UTILITY FUNCTIONS
// ============================================================================

/**
 * Determine content type based on platform and URL
 * Used by: AddVideoModal for both manual and API flows
 */
export const determineContentType = (
  platform: ContentPlatform,
  url: string,
  isVideo: boolean
): string => {
  const u = url.toLowerCase();
  if (u.includes('/shorts/')) return 'shorts';
  if (/\/reels?\//.test(u)) return platform === 'facebook' ? 'facebook_reel' : 'reel';
  if (u.includes('/stories/')) return 'story';

  const VIDEO_TYPE_MAP: Record<ContentPlatform, string> = {
    youtube: 'video', tiktok: 'video', facebook: 'facebook_video',
    linkedin: 'linkedin_video', instagram: 'reel',
  };
  const POST_TYPE_MAP: Record<ContentPlatform, string> = {
    facebook: 'facebook_post', linkedin: 'linkedin_post',
    instagram: 'post', tiktok: 'post', youtube: 'post',
  };

  return isVideo ? VIDEO_TYPE_MAP[platform] || 'reel' : POST_TYPE_MAP[platform] || 'post';
};

/**
 * Determine content format based on URL and video flag
 * Used by: AddVideoModal
 */
export const determineContentFormat = (url: string, isVideo: boolean): string =>
  url.toLowerCase().includes('/stories/') ? 'STORY' : isVideo ? 'VIDEO' : 'IMAGE';

/**
 * Build full content URL from shortcode/ID if needed
 * Used by: AddVideoModal for manual entry
 */
export const buildContentUrl = (url: string, platform: ContentPlatform): string => {
  if (url.startsWith('http')) return url;

  const URL_BUILDERS: Record<ContentPlatform, (id: string) => string> = {
    youtube: (id) => `https://www.youtube.com/watch?v=${id}`,
    tiktok: (id) => `https://www.tiktok.com/video/${id}`,
    facebook: (id) => `https://www.facebook.com/videos/${id}`,
    linkedin: (id) => `https://www.linkedin.com/posts/${id}`,
    instagram: (id) => `https://www.instagram.com/p/${id}/`,
  };

  return URL_BUILDERS[platform]?.(url) || url;
};

/**
 * Extract hashtags from text
 * Used by: AddVideoModal for API-fetched content
 */
export const extractHashtags = (text: string): string[] =>
  (text.match(/#\w+/g) || []).map((t) => t.slice(1));

/**
 * Extract mentions from text
 * Used by: AddVideoModal for API-fetched content
 */
export const extractMentions = (text: string): string[] =>
  (text.match(/@\w+/g) || []).map((m) => m.slice(1));

/**
 * Parse API error into user-friendly message
 * Used by: AddVideoModal error handling
 */
export const parseApiError = (error: unknown): { message: string; details: string } => {
  const msg = error instanceof Error ? error.message : 'Unknown error';

  const ERROR_MAPPINGS: Array<{ pattern: RegExp; message: string; details: string }> = [
    { pattern: /409|already exists/i, message: 'Duplicate Post Detected', details: 'This post has already been added to your campaign.' },
    { pattern: /404.*endpoint/i, message: 'Resource Not Found', details: 'Manual entry endpoint not configured.' },
    { pattern: /404.*platform/i, message: 'Resource Not Found', details: 'Platform not recognized.' },
    { pattern: /404.*influencer/i, message: 'Resource Not Found', details: 'Selected influencer not found.' },
    { pattern: /404|not found/i, message: 'Resource Not Found', details: 'The requested resource could not be found.' },
    { pattern: /401|unauthorized/i, message: 'Authentication Error', details: 'Your session may have expired.' },
    { pattern: /400/, message: 'Invalid Request', details: 'Please check all fields and try again.' },
    { pattern: /500/, message: 'Server Error', details: 'Something went wrong. Please try again later.' },
  ];

  return ERROR_MAPPINGS.find(({ pattern }) => pattern.test(msg)) || { message: 'Failed to Save Video', details: msg };
};

/**
 * Validate Instagram shortcode format
 * Used by: AddVideoModal URL validation
 */
export const isValidInstagramCode = (value: string): boolean =>
  /^[a-zA-Z0-9_-]+$/.test(value) && value.length > 5;

// ============================================================================
// ALSO ADD THIS TYPE ALIAS for backward compatibility
// ============================================================================

/**
 * Type alias for InitialMetadataInput (used by buildUnifiedInitialMetadata)
 * Provides consistent naming across components
 */
export type InitialMetadataParams = InitialMetadataInput;