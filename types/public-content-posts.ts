// src/types/public-content-posts.ts

export interface GetPublicContentPostsRequest {
  token: string;
  page?: number;
  limit?: number;
}

// ✅ NEW: Define the structure that actually comes from backend
export interface PublicContentPost {
  id: string;
  campaign_id: string;
  campaign_influencer_id: string;
  platform_id: string;
  data_source_endpoint_id: string;
  platform_post_id: string;
  content_url: string;
  content_type: string;
  content_format: string | null;
  title: string | null;
  caption: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  hashtags: string[];
  mentions: string[];
  collaborators: string[];
  sponsors: string[];
  links: string[];
  likes_and_views_disabled: boolean;
  is_pinned: boolean;
  tracking_status: string;
  posted_at: string | null;
  first_tracked_at: string | null;
  last_tracked_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  
  // ✅ Nested data from backend
  influencer: {
    img_url: string | null;
    username: string | null;
    full_name: string | null;
    followers: number | null;
    total_price: number | null;
    currency: string | null;
    collaboration_price: number | null;
  } | null;
  
  engagement: {
    like_count: number | null;
    comment_count: number | null;
    view_count: number | null;
    share_count: number | null;
    laugh_count: number | null;
    love_count: number | null;
    save_count: number | null;
  } | null;
}

export interface PublicContentPostsResponse {
  success: boolean;
  content_posts: PublicContentPost[];  // ✅ Changed from VideoResult[] to PublicContentPost[]
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  campaign_info: {
    id: string;
    name: string;
    company_id: string;
  };
  session_info: {
    page_name: string;
    expires_at: string;
    remaining_time: string;
  };
}