// src/types/instagram.ts

export interface InstagramUser {
    pk: number;
    id: string;
    username: string;
    full_name: string;
    strong_id__: string;
    profile_pic_url: string;
    is_private: boolean;
    is_verified: boolean;
    social_context: string | null;
  }
  
  export interface InstagramSearchResponse {
    num_results: number;
    users: InstagramUser[];
  }
  

//User profile
export interface InstagramUserDetails {
  pk: number;
  username: string;
  full_name: string;
  profile_pic_url: string;
  profile_pic_url_hd: string;
  is_business: boolean;
  is_private: boolean;
  is_verified: boolean;
  media_count: number;
  follower_count: number;
  following_count: number;
  biography: string;
  external_url: string;
  category?: string;
  has_highlight_reels: boolean;
  has_clips: boolean;
  has_guides: boolean;
  has_channel: boolean;
  total_igtv_videos: number;
  bio_links: [];
}

export interface InstagramPostMediaDimensions {
  height: number;
  width: number;
}

export interface InstagramPostDisplayResource {
  src: string;
  config_width: number;
  config_height: number;
}

export interface InstagramPostSharingFrictionInfo {
  should_have_sharing_friction: boolean;
  bloks_app_url: string | null;
}

export interface InstagramPostCaptionEdge {
  node: {
    text: string;
  };
}

export interface InstagramPostCommentInfo {
  count: number;
  page_info: {
    has_next_page: boolean;
    end_cursor: string;
  };
}

export interface InstagramPostLikeInfo {
  count: number;
  edges: Array<{
    node: {
      id: string;
      username: string;
      profile_pic_url: string;
    };
  }>;
}

export interface InstagramPostOwner {
  id: string;
  username: string;
}

export interface InstagramPostNode {
  __typename: string;
  id: string;
  gating_info: any | null;
  fact_check_overall_rating: any | null;
  fact_check_information: any | null;
  media_overlay_info: any | null;
  sensitivity_friction_info: any | null;
  sharing_friction_info: InstagramPostSharingFrictionInfo;
  dimensions: InstagramPostMediaDimensions;
  display_url: string;
  display_resources: InstagramPostDisplayResource[];
  is_video: boolean;
  media_preview: string | null;
  tracking_token: string;
  has_upcoming_event: boolean;
  video_url: string;
  video_view_count: number | null;
  video_play_count: number | null;
  has_audio: boolean;
  edge_media_to_tagged_user: {
    edges: any[];
  };
  accessibility_caption: string | null;
  edge_media_to_caption: {
    edges: InstagramPostCaptionEdge[];
  };
  caption: string;
  shortcode: string;
  edge_media_to_comment: InstagramPostCommentInfo;
  comment_count: number;
  edge_media_to_sponsor_user: {
    edges: any[];
  };
  is_affiliate: boolean;
  is_paid_partnership: boolean;
  comments_disabled: boolean;
  taken_at_timestamp: number;
  edge_media_preview_like: InstagramPostLikeInfo;
  like_count: number;
  owner: InstagramPostOwner;
  location: {
    id: string;
    has_public_page: boolean;
    name: string;
    slug: string;
  } | null;
  nft_asset_info: any | null;
  viewer_has_liked: boolean;
  viewer_has_saved: boolean;
  viewer_has_saved_to_collection: boolean;
  viewer_in_photo_of_you: boolean;
  viewer_can_reshare: boolean;
  thumbnail_src: string;
  thumbnail_resources: InstagramPostDisplayResource[];
  coauthor_producers: [];
  pinned_for_users: [];
  like_and_view_counts_disabled: boolean;
  product_type: string;
}

export interface InstagramPost {
  node: InstagramPostNode;
}

export interface InstagramPostsResponse {
  count: number;
  posts: InstagramPostNode[];
  last_cursor: string;
}

export interface InstagramProfileResponse {
  status: string;
  profile: InstagramUserDetails;
  posts?: InstagramPostsResponse;
  success?: boolean;
}



export interface OpenAIAnalysis {
  success: boolean;
  analysis: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}