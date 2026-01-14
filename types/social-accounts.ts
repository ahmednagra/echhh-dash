// src/types/social-accounts.ts


// Add these interfaces to your existing src/types/social-accounts.ts file:

export interface UserExistsRequest {
  platform_account_ids: string[];
}

export interface UserExistsResponse {
  results: Array<{
    platform_account_id: string;
    exists: boolean;
  }>;
}

export interface SocialAccount {
  id: string;
  influencer_id: string | null;
  platform_id: string;
  platform_account_id: string;
  account_handle: string;
  full_name: string;
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  account_url?: string;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  media_count?: number;
  followers_count?: number;
  following_count?: number;
  subscribers_count?: number;
  likes_count?: number;
  biography?: string;
  has_highlight_reels: boolean;
  category_id?: string;
  has_clips: boolean;
  platform: {
    id: string;
    name: string;
    logo_url?: string;
  };
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at?: string;
  claimed_at?: string;
  claimed_status?: string;
  verification_method?: string;
  // Budget and Contact fields
  collaboration_price?: number | null;
  currency?: string;
  phone?: string | null;
  
  additional_metrics?: {
    id?: string;
    url?: string;
    name?: string;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
    language?: string;
    username?: string;
    age_group?: string;
    followers?: string;
    isVerified?: boolean;
    engagements?: string;
    external_id?: string;
    introduction?: string;
    profileImage?: string;
    average_likes?: number;
    average_views?: number;
    content_count?: number;
    engagementRate?: number;
    engagement_rate?: number;
    following_count?: number;
    following?: number;
    subscriber_count?: number;
    category?: string;
    profile_data?: any;
    budget?: number | string | null;
    csv_data?: {
      email?: string;
      phone?: string;
      budget?: number | string;
      source?: string;
      import_date?: string;
      original_csv_row?: any;
      platform_info?: any;
    };
  };
}

export interface CSVInfluencerRow {
  username: string;
  fullname?: string;
  email?: string;
  phone?: string;
  budget?: string | number;
  platform?: string;
  [key: string]: any;
}

export interface CreateSocialAccountRequest {
  platform_id: string;
  platform_account_id: string;
  account_handle: string;
  full_name: string;
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  account_url?: string;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  media_count?: number;
  followers_count?: number;
  following_count?: number;
  subscribers_count?: number;
  likes_count?: number;
  biography?: string;
  has_highlight_reels: boolean;
  category_id?: string;
  has_clips: boolean;
  additional_metrics?: any;
}

export interface BulkImportResponse {
  success: boolean;
  total_processed: number;
  successful_imports: number;
  failed_imports: number;
  errors: Array<{
    row: number;
    username: string;
    error: string;
  }>;
  imported_accounts: string[];
}

export interface SocialAccountsListResponse {
  success: boolean;
  data: SocialAccount[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}