// src/types/company-analytics.ts

export interface CompanyAnalyticsInfluencer {
  id: string;
  platform_account_id: string; // Add this field for profile analytics
  name: string;
  username: string;
  followers: number;
  engagementRate: number;
  avgLikes: number;
  reelViews: number;
  location: string;
  gender: string;
  language: string;
  ageGroup: string;
  accountType: string;
  profileImage: string;
  verified: boolean;
  mediaCount: number; // Added for the new column
}

// Request interfaces
export interface GetCompanyAnalyticsRequest {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: keyof CompanyAnalyticsInfluencer;
  sortOrder?: 'asc' | 'desc';
}

// Response interfaces for frontend
export interface CompanyAnalyticsResponse {
  success: boolean;
  data: CompanyAnalyticsData;
  error?: string;
}

export interface CompanyAnalyticsData {
  influencers: CompanyAnalyticsInfluencer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Backend response interface (what our server transformation returns)
export interface BackendCompanyAnalyticsResponse {
  influencers: CompanyAnalyticsInfluencer[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Error response interface
export interface CompanyAnalyticsError {
  success: false;
  error: string;
}

// ========== ACTUAL FASTAPI RESPONSE INTERFACES ==========
// These match the actual FastAPI response structure from your Postman test

export interface SocialAccountData {
  id: string;
  influencer_id: string | null;
  platform_id: string;
  platform_account_id: string;
  account_handle: string;
  full_name: string;
  profile_pic_url: string;
  profile_pic_url_hd: string | null;
  account_url: string;
  is_private: boolean;
  is_verified: boolean;
  is_business: boolean;
  media_count: number;
  followers_count: number;
  following_count: number;
  subscribers_count: number | null;
  likes_count: number;
  biography: string;
  has_highlight_reels: boolean;
  category_id: string | null;
  has_clips: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
}

export interface PaginationData {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// This matches exactly what your FastAPI returns based on your Postman response
export interface ActualApiResponse {
  social_accounts: SocialAccountData[];
  pagination: PaginationData;
  company_id: string;
  company_name: string;
  filters_applied: any;
}

// Type guards for better error handling
export function isActualApiResponse(data: any): data is ActualApiResponse {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.social_accounts) &&
    data.pagination &&
    typeof data.pagination.total_items === 'number' &&
    typeof data.company_id === 'string'
  );
}

export function isSocialAccountData(data: any): data is SocialAccountData {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.id === 'string' &&
    typeof data.account_handle === 'string' &&
    typeof data.full_name === 'string' &&
    typeof data.followers_count === 'number'
  );
}