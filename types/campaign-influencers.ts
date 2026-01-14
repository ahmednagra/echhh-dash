// src/types/campaign-influencers.ts
import { Campaign } from '@/types/campaign';
import { AddedThroughValue } from './added-through-filter';
import { InfluencerTag } from '@/types/tags';

// export interface FetchCampaignsByCompanyResponse {
//   success: boolean;
//   data: Campaign[];
//   error?: string;
// }
// Past Campaign interface for X-Campaigns feature
export interface PastCampaign {
  campaign_name: string;
  currency: string | null;
  total_price: string | null;
}

export interface UpdateCampaignInfluencerRequest {
  status_id?: string;
  contact_attempts?: number;
  last_contacted_at?: string;
  next_contact_at?: string;
  responded_at?: string;
  collaboration_price?: number | null;
  currency?: string;
  price_type?: 'inclusive' | 'exclusive'; // ✅ ADD THIS
  notes?: string;
}

export interface UpdateAverageViewsRequest {
  average_views: number | null;
}

export interface UpdateAverageViewsResponse {
  success: boolean;
  data: any;
  error?: string;
  message?: string;
}

export interface StatusBrief {
  id: string;
  name: string;
}

export interface PlatformBrief {
  id: string;
  name: string;
  logo_url?: string;
}

export interface SocialAccountBrief {
  id: string;
  full_name: string;
  platform_id: string;
  account_handle: string;
  followers_count?: number;
  platform_account_id?: string;
  is_verified?: boolean;
  profile_pic_url?: string;
  is_private?: boolean;
  is_business?: boolean;
  media_count?: number;
  following_count?: number;
  subscribers_count?: number;
  likes_count?: number;
  account_url?: string;
  added_through?: string; // ADD THIS
  additional_metrics?: Record<string, any>;
  platform?: PlatformBrief;
}

export interface ClientReviewStatus {
  id: string;
  name: string;
}

/* Main response type that matches the backend CampaignInfluencerResponse schema */
export interface CampaignInfluencerResponse {
  id: string;
  campaign_list_id: string;
  social_account_id: string;
  status_id: string;
  is_assigned_to_agent: boolean;
  total_contact_attempts: number;
  collaboration_price?: number;
  currency?: string;
  total_price?: number | string; // ✅ ADD THIS
  price_type?: 'inclusive' | 'exclusive'; // ✅ ADD THIS
  price_approved?: boolean; // ✅ REQUIRED: For manager price approval feature - Backend returns this field
  is_ready_for_onboarding: boolean;
  onboarded_at?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  added_through?: AddedThroughValue | null; // ADD THIS LINE
  // Related data populated by controller
  status?: StatusBrief;
  social_account?: SocialAccountBrief;

  shortlisted_status_id?: string | null;
  shortlisted_status?: {
    id: string;
    name: string;
    model?: string;
    applies_to_field?: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
  } | null;
  // Legacy fields for backward compatibility during migration
  list_id?: string; // Made optional for backward compatibility
  platform_id?: string; // Alternative field name
  contact_attempts?: number; // Legacy field name
  next_contact_at?: string | null;
  collaboration_currency?: string; // Added currency field
  last_contacted_at?: string | null;
  responded_at?: string | null;
  ready_to_onboard?: boolean; // Made optional
  comments_count?: number; // NEW: Add comments_count field
  success?: boolean;
  message?: string;
  username?: string;
  name?: string;
  profileImage?: string;
  followers?: string;
  isVerified?: boolean;
  engagement_rate?: number;
  avg_likes?: number;
  avg_comments?: number;
  client_review_status?: ClientReviewStatus | null; // Optional field for client review status
  tags?: InfluencerTag[];
  past_campaigns?: PastCampaign[]; // X-Campaigns feature
}

// Type alias for backward compatibility during migration
export type CampaignListMember = CampaignInfluencerResponse;

// Legacy types maintained for backward compatibility
export interface CampaignListMemberStatus {
  id: string;
  name: string;
}

export interface CampaignListMemberPlatform {
  id: string;
  name: string;
}

export interface CampaignListMemberSocialAccount {
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
  additional_metrics?: Record<string, string | number | boolean | null>;
}

export interface UpdateCampaignInfluencerResponse {
  success: boolean;
  data?: CampaignInfluencerResponse; // Updated to use CampaignInfluencerResponse
  error?: string;
}

// Updated response types for specific endpoints
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  influencer_id: string;
}

// Updated to return full CampaignInfluencerResponse instead of just success message
export interface UpdatePriceResponse extends CampaignInfluencerResponse {}

// ============ ONBOARDING TYPES ============

export interface MarkOnboardedRequest {
  campaign_list_id: string;
  influencer_ids: string[];
}

export interface MarkOnboardedResponse {
  success: boolean;
  message: string;
}

export interface RemoveOnboardedRequest {
  campaign_list_id: string;
  influencer_ids: string[];
}

export interface RemoveOnboardedResponse {
  success: boolean;
  message: string;
}

// ============ MIGRATED TYPES FROM campaign-list.service.ts ============

// Define the campaign list ID type
export type CampaignListId = string;

// Define the request body for adding an influencer to a campaign list
export interface AddToCampaignListRequest {
  campaign_list_id: CampaignListId;
  platform_id: string;
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: number;
    isVerified?: boolean;
    account_url?: string;
    added_through?: string; // ADD THIS LINE
    additional_metrics?: Record<string, string | number | boolean | null>;

    // NEW FIELD: Track how the influencer was added
    // added_through?: AddedThroughValue;
  };
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string;
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CampaignInfluencersResponse {
  success: boolean;
  influencers: CampaignInfluencerResponse[]; // Updated to use CampaignInfluencerResponse
  pagination: PaginationInfo;
  message?: string;
}

// Legacy type alias for backward compatibility
export interface CampaignListMembersResponse
  extends CampaignInfluencersResponse {}

// Status grouping for Outreach Tab
export interface CampaignInfluencersByStatus {
  discovered: CampaignInfluencerResponse[];
  unreachable: CampaignInfluencerResponse[];
  contacted: CampaignInfluencerResponse[];
  responded: CampaignInfluencerResponse[];
  info_requested: CampaignInfluencerResponse[];
  completed: CampaignInfluencerResponse[];
  declined: CampaignInfluencerResponse[];
  inactive: CampaignInfluencerResponse[];
}

// Request for updating client review status
export interface UpdateClientReviewStatusRequest {
  client_review_status_id: string;
}

// Response for updating client review status
export interface UpdateClientReviewStatusResponse {
  success: boolean;
  data?: CampaignListMember;
  error?: string;
  message?: string;
}

// Utility function to get short form of status names
export function getStatusShortForm(statusName: string): string {
  const shortForms: Record<string, string> = {
    pending_review: 'pending',
    approved: 'approved',
    on_hold: 'hold',
    dropped: 'dropped',
    needs_info: 'info',
    under_negotiation: 'negotiation',
  };

  return shortForms[statusName] || statusName;
}

export interface AddToCampaignRequest {
  username: string;
  platform: 'instagram' | 'tiktok' | 'youtube';
  campaign_list_id: string;
  platform_id: string;
  preferred_provider?: 'nanoinfluencer' | 'ensembledata';

  // NEW FIELD: Track how the influencer was added
  added_through?: AddedThroughValue;
  profile_data?: StandardizedProfile;
}

export interface AddToCampaignResponse {
  success: boolean;
  influencer_id?: string;
  list_member_id?: string;
  provider_used?: 'nanoinfluencer' | 'ensembledata';
  profile_data?: StandardizedProfile;
  message?: string;
  error_code?:
    | 'USER_NOT_FOUND'
    | 'PRIVATE_PROFILE'
    | 'RATE_LIMITED'
    | 'INVALID_INPUT'
    | 'PROVIDER_ERROR';
}

export interface StandardizedProfile {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  followers: number;
  following_count?: number;
  engagementRate?: number;
  isVerified: boolean;
  age_group?: string | null;
  average_likes?: number;
  average_views?: number | null;
  contact_details?: ContactDetail[];
  content_count?: number | null;
  creator_location?: CreatorLocation;
  external_id?: string;
  gender?: string;
  introduction?: string;
  language?: string;
  platform_account_type?: string;
  subscriber_count?: number | null;
  url: string;
  provider_source: 'nanoinfluencer' | 'ensembledata';
  fetched_at: string;

  // New optional fields from second object
  type?: string; // e.g., "channel"
  platform?: string; // e.g., "ins"
  lastPostDate?: string;
  postPerMonth?: number;
  commentsMedian?: number;
  sharesMedian?: number;
  favoritesMedian?: number | string; // Can be "N/A" or a number
  vrMedian?: number; // Video rate median
  isPrivate?: boolean;
  topics?: string[];
  audiences?: string[];
  links?: string[];
  desc?: string; // Longer description with post content samples
}

export interface ContactDetail {
  type: string;
  value: string;
  platform_id?: string;
  contact_type?: string;
  is_primary?: boolean;
}

export interface CreatorLocation {
  city?: string;
  state?: string | null;
  country?: string;
}

// Provider interfaces
export interface ProfileProvider {
  name: 'nanoinfluencer' | 'ensembledata';
  priority: number;
  isAvailable(): boolean;
  fetchProfile(
    username: string,
    platform: string,
  ): Promise<StandardizedProfile>;
}

export interface ProviderError {
  code: string;
  message: string;
  provider: string;
  should_retry: boolean;
}

// Rate limiting types
export interface RateLimitConfig {
  maxRequestsPerMinute: number;
  minTimeBetweenRequests: number;
  timeWindow: number;
}

// Price Approval Types
export interface PriceApprovalRequest {
  action: 'approve' | 'reject';
  manager_comment?: string;
  approved_price?: number;
  currency?: string;
}

export interface PriceApprovalResponse {
  price_approved: boolean;
  collaboration_price: number;
  currency: string;
}

export interface CopyInfluencersRequest {
  target_list_id: string;
  influencer_ids: string[];
}

export interface CopyInfluencersResponse {
  success: boolean;
  copied_count: number;
  skipped_count: number;
  error?: string;
}
