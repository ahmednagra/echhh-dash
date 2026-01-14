// src/types/public-campaign-influencers.ts

export interface PublicCampaignInfluencersRequest {
  token: string;
  limit?: number;
  page?: number;
  search?: string;
}

// ADDED: New types for client review status update
export interface UpdatePublicClientReviewStatusRequest {
  token: string;
  client_review_status_id: string;
}

export interface UpdatePublicClientReviewStatusResponse {
  success: boolean;
  message: string;
  action_id: string | null;
  additional_data: any | null;
}

// 🆕 NEW: Types for shortlisted status update
export interface UpdatePublicShortlistedStatusRequest {
  token: string;
  shortlisted_status_id: string;
}

export interface UpdatePublicShortlistedStatusResponse {
  success: boolean;
  message: string;
  action_id: string | null;
  additional_data: any | null;
}

export interface PublicSessionInfo {
  permissions: {
    read: boolean;
    "comment:read": boolean;
    "comment:reply": boolean;
    "comment:create": boolean;
    "price_negotiation:read": boolean;
    "price_negotiation:create": boolean;
    "price_negotiation:reject": boolean;
    "price_negotiation:approve": boolean;
  };
  expires_at: string;
  remaining_time: string;
  current_uses: number;
  max_uses: number | null;
  can_comment?: boolean;
  can_counter_price?: boolean;
  can_view_pricing?: boolean;
  can_view_contacts?: boolean;
  session_metadata?: {
    client_name: string;
    client_role: string;
    client_email: string;
    client_company: string;
    visible_columns?: string[]; // NEW: Admin-approved visible columns
  };
  session_type?: string;
  resource_type?: string;
}

export interface PublicCampaignInfluencer {
  id: string;
  campaign_list_id: string;
  social_account_id: string;
  status_id: string;
  is_assigned_to_agent: boolean;
  total_contact_attempts: number;
  collaboration_price: number | null;
  currency: string | null;
  is_ready_for_onboarding: boolean;
  onboarded_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  client_review_status_id: string | null;
  shortlisted_status_id?: string | null; // 👈 ADD THIS LINE
  comments_count?: number; // NEW: Add comments_count field
  status: {
    id: string;
    name: string;
    color: string | null;
  };
  social_account: {
    id: string;
    full_name: string;
    platform_id: string;
    account_handle: string;
    followers_count: number;
    platform_account_id: string;
    is_verified: boolean;
    profile_pic_url: string;
    is_private: boolean;
    is_business: boolean;
    media_count: number | null;
    following_count: number | null;
    subscribers_count: number | null;
    likes_count: number | null;
    account_url: string;
    additional_metrics: {
      id: string;
      url: string;
      name: string;
      gender: string;
      language: string;
      username: string;
      age_group: string | null;
      followers: number;
      isVerified: boolean;
      external_id: string;
      introduction: string;
      profileImage: string;
      average_likes: number;
      average_views: number | null;
      content_count: number | null;
      engagementRate: number;
      contact_details: any;
      subscriber_count: number | null;
      livestream_metrics: any;
      platform_account_type: string;
    };
    platform: {
      id: string;
      name: string;
      icon_url: string | null;
    };
    contacts: any;
  };
  client_review_status: {
    id: string;
    name: string;
  } | null;
  shortlisted_status?: {
    id: string;
    name: string;
    color?: string | null;
  } | null;
  price_negotiations: Array<{
    id: string;
    round_number: number;
    proposed_price: string;
    proposed_by_type: 'client' | 'influencer';
    status: string;
    comment?: string;
    created_at: string;
    currency?: string;
  }>;
  comments?: Array<{
    id: string;
    comment: string;
    created_by_type: 'client' | 'internal';
    created_at: string;
  }>;
}

export interface PublicCampaignInfluencersApiResponse {
  success: boolean;
  data: {
    influencers: PublicCampaignInfluencer[];
    pagination: {
      page: number;
      page_size: number;
      total_items: number;
      total_pages: number;
      has_next: boolean;
      has_previous: boolean;
    };
    session: PublicSessionInfo;
  };
}

// For component props - the actual data structure after extraction
export interface PublicCampaignInfluencersResponse {
  session: PublicSessionInfo;
  influencers: PublicCampaignInfluencer[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}