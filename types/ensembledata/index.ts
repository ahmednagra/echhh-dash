// src/types/ensembledata/index.ts
// Type definitions for EnsembleData API responses
import { Influencer } from "@/types/insights-iq";
// Common response wrapper
export interface EnsembleDataResponse<T> {
  success: boolean;
  data: T | null;
  error?: string;
  message?: string;
  status_code?: number;
}

// Instagram User Detailed Info Request (EnsembleData format)
export interface InstagramUserDetailedInfoRequest {
  username: string;
}

// EnsembleData API Response wrapper
export interface EnsembleDataApiResponse<T> {
  data: T;
  unitsCharged: number;
}

// Instagram User Basic Info (based on actual API response)
export interface InstagramUserBasicInfo {
  id: string; // user_id
  username: string;
  full_name: string;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  is_private: boolean;
  is_verified: boolean;
  is_business_account: boolean;
  is_professional_account: boolean;
  biography: string;
  external_url?: string;
  category_name?: string;
  edge_followed_by: {
    count: number; // follower_count
  };
  edge_follow: {
    count: number; // following_count
  };
  edge_owner_to_timeline_media: {
    count: number; // media_count
    page_info: {
      has_next_page: boolean;
      end_cursor: string | null;
    };
    edges: InstagramPostEdge[];
  };
  edge_felix_video_timeline: {
    count: number;
    page_info: {
      has_next_page: boolean;
      end_cursor: string | null;
    };
    edges: any[];
  };
  highlight_reel_count: number;
}

// Instagram Post Edge structure
export interface InstagramPostEdge {
  node: {
    __typename: string;
    id: string;
    shortcode: string;
    dimensions: {
      height: number;
      width: number;
    };
    display_url: string;
    edge_media_to_caption: {
      edges: Array<{
        node: {
          text: string;
        };
      }>;
    };
    edge_media_to_comment: {
      count: number;
    };
    edge_liked_by: {
      count: number;
    };
    taken_at_timestamp: number;
    is_video: boolean;
    video_url?: string;
    video_view_count?: number;
    video_play_count?: number;
    video_duration?: number;
    location?: {
      id: string;
      name: string;
      slug: string;
    };
    thumbnail_src: string;
  };
}

// Main Instagram User Detailed Info Response (EnsembleData format)
export interface InstagramUserDetailedInfo extends InstagramUserBasicInfo {
  // The response structure matches the example you provided
}

// Creator Profile Types for our internal use
export interface CreatorProfileRequest {
  username: string;
  platform: 'instagram' | 'youtube' | 'tiktok';
  include_detailed_info?: boolean;
}

export interface CreatorProfileResponse {
  success: boolean;
  data: Influencer | null;
  error?: string;
  message?: string;
}

export interface CreatorProfile {
  platform: 'instagram' | 'youtube' | 'tiktok';
  user_id: string;
  username: string;
  full_name: string;
  profile_pic_url: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_verified: boolean;
  is_private: boolean;
  biography?: string;
  engagement_rate?: number;
  detailed_info?: InstagramUserDetailedInfo;
  fetched_at: string;
  units_charged?: number; // EnsembleData usage tracking
  posts?: InstagramPostEdge[]; // Optional, if detailed info is requested
}

// Error types
export interface EnsembleDataError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// API Response status codes
export enum EnsembleDataStatusCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  RATE_LIMITED = 429,
  INTERNAL_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}