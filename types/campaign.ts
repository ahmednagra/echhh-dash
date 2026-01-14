// src/types/campaign.ts - Add these types for campaign list management

// Base interfaces for campaign components
export interface CampaignStatus {
  id: string;
  name: string;
}

export interface CampaignCategory {
  id: string;
  name: string;
}

export interface CampaignLists {
  id: string;
  name: string;
  description: string;
  total_influencers_count: number;
  total_onboarded_count: number;
  total_contacted_count: number;
  avg_collaboration_price: string;
  completion_percentage: string;
  days_since_created: string;
  last_activity_date: string;
}

export interface CampaignTemplates {
  id: string;
  subject: string;
  content: string;
  company_id: string;
  campaign_id: string;
  is_global: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Status {
  id: string;
  name: string;
}

export interface ListAssignments {
  id: string;
  list_id: string;
  agent_id: string;
  status_id: string;
  status: Status;
  created_at: string;
  updated_at: string;
}

// Main Campaign interface
export interface Campaign {
  id: string;
  name: string;
  brand_name: string;
  category_id: string;
  category: CampaignCategory | null;
  audience_age_group: string;
  budget: string;
  status_id: string;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
  default_filters: boolean;
  campaign_lists: CampaignLists[];
  message_templates: CampaignTemplates[];
  list_assignments: ListAssignments[];
  company_id: string;
  // Soft delete fields
  is_deleted?: boolean;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

// Request/Response interfaces
export interface CreateCampaignRequest {
  name: string;
  brand_name: string;
  category_id: string;
  audience_age_group: string;
  budget: number;
  currency_code: string;
  company_id: string;
}

export interface UpdateCampaignRequest {
  name?: string;
  brand_name?: string;
  category_id?: string;
  audience_age_group?: string;
  budget?: number;
  currency_code?: string;
  status_id?: string;
  default_filters?: boolean;
}

// API Response interfaces
export interface CampaignResponse {
  success: boolean;
  data?: Campaign;
  error?: string;
  message?: string;
}

export interface CampaignsResponse {
  success: boolean;
  data?: Campaign[];
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DeleteCampaignResponse {
  success: boolean;
  message?: string;
  error?: string;
}

// Delete operation types
export type DeleteType = 'soft' | 'hard' | 'restore';

export interface DeleteCampaignRequest {
  type: DeleteType;
  campaign_id: string;
}

// Filter and search interfaces
export interface CampaignFilters {
  status_id?: string;
  category_id?: string;
  company_id?: string;
  include_deleted?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
}

export interface GetCampaignsRequest {
  filters?: CampaignFilters;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Campaign metrics interfaces (for future use)
export interface CampaignMetrics {
  id: string;
  campaign_id: string;
  total_influencers: number;
  active_influencers: number;
  total_content: number;
  total_views: number;
  total_engagement: number;
  total_reach: number;
  updated_at: string;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

// API Error interface
export interface ApiError {
  message: string;
  code?: string;
  details?: ValidationError[];
  timestamp?: string;
}


export interface CampaignListMember {
  id: string;
  list_id: string;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified: boolean;
  };
  created_at: string;
  updated_at: string;
}

export interface AddToListRequest {
  list_id: string;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified: boolean;
  };
}

export interface AddToListResponse {
  success: boolean;
  message?: string;
  data?: CampaignListMember;
}