// src/services/campaign/campaign-list.service.ts

import { apiClient } from '@/lib/api'; // Import the unified API client
import { ENDPOINTS } from '@/services/api/endpoints';
import { DiscoverInfluencer } from '@/lib/types';
import { Influencer } from '@/types/insights-iq';
// Define the campaign list ID type
// Define the campaign list ID type
export type CampaignListId = string;

// Contact details interface
export interface ContactDetail {
  id?: string;
  social_account_id?: string;
  platform_specific?: boolean;
  name?: string
  type: string; // should be removed, bcz we have contact_type 
  value: string;
  platform_id?: string; // Optional field for platform ID
  contact_type?: string; // Optional field for contact type
  is_primary?: boolean; // Optional field to indicate if this is the primary contact
}

// Creator location interface
export interface CreatorLocation {
  city: string;
  state?: string | null;
  country: string;
}

// Work platform interface
export interface WorkPlatform {
  id: string;
  name: string;
  logo_url: string;
}

// Filter match interface - comprehensive definition
export interface FilterMatch {
  brand_sponsors?: any;
  creator_age?: any;
  creator_brand_affinities?: any;
  follower_growth?: any;
  subscriber_growth?: any;
  creator_gender: string;
  creator_interests?: any;
  creator_language?: any;
  creator_locations: string[];
  creator_lookalikes?: any;
  content_count?: any;
  instagram_options?: {
    reel_views?: any;
  };
  audience_age?: any;
  audience_gender?: any;
  audience_brand_affinities?: any;
  audience_interests?: any;
  audience_language?: any;
  audience_locations?: any;
  audience_lookalikes?: any;
  topic_relevance?: any;
  views_growth?: any;
  audience_ethnicity?: any;
  audience_credibility_score?: any;
  share_count?: any;
  save_count?: any;
}

// Complete influencer interface matching your JSON structure
export interface CompleteInfluencer {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  followers: number;
  engagementRate: number;
  isVerified: boolean;
  age_group?: string | null;
  average_likes: number;
  average_views?: number | null;
  contact_details: ContactDetail[];
  content_count?: number | null;
  creator_location: CreatorLocation;
  external_id: string;
  gender: string;
  introduction: string;
  language: string;
  livestream_metrics?: any;
  platform_account_type: string;
  subscriber_count?: number | null;
  url: string;
  filter_match: FilterMatch;
  work_platform: WorkPlatform;
}

// Enhanced Influencer interface (alias for backward compatibility)
export interface EnhancedInfluencer extends CompleteInfluencer {}

// Updated AddToListRequest to support whole object storage
export interface AddToListRequest {
  campaign_list_id: CampaignListId;
  work_platform_id: string;  // ✅ Change from platform_id to work_platform_id
  platform?: string;  // ADD THIS LINE
  social_data: {
    id: string;
    username: string;
    name: string;
    profileImage?: string;
    followers: string;
    isVerified?: boolean;
    account_url?: string;
    added_through?: 'search' | 'discovery' | 'import';
    import_metadata?: any; // NEW: Add this line
    // Store the complete influencer object
    additional_metrics?: CompleteInfluencer | Record<string, any>;
  };
}

export interface Platform {
  id: string;
  name: string;
  logo_url: string;
}

export interface AssignedAgent {
  id: string;
  name: string;
}
// Define the response from the add to list API
export interface CampaignListMember {
  success: boolean;
  message?: string;
  id?: string;
  campaign_list_id?: string;
  social_account_id?: string;
  platform_id?: string;
  status_id?: string;
  contact_attempts?: number;
  next_contact_at?: string | null;
  collaboration_price?: number | null;
  total_price?: number | null;  // 👈 ADD THIS LINE
  currency?: string | null;
  last_contacted_at?: string | null;
  responded_at?: string | null;
  onboarded_at?: string | null;
  created_at?: string;
  updated_at?: string;
  is_assigned_to_agent?: boolean;
  assigned_agent?: AssignedAgent | null;
  status?: {
    id: string;
    name: string;
  };
  platform?: {
    id: string;
    name: string;
  };
  username?: string;
  name?: string;
  profileImage?: string;
  followers?: string;
  isVerified?: boolean;
  engagement_rate?: number;
  avg_likes?: number;
  avg_comments?: number;
  social_account?: {
    id: string;
    account_handle: string;
    full_name: string;
    profile_pic_url: string;
    platform_id: string;
    is_verified: boolean;
    followers_count: number;
    platform_account_id: string;
    is_private: boolean;
    is_business: boolean;
    media_count?: number | null;
    following_count?: number | null;
    subscribers_count?: number | null;
    likes_count?: number | null;
    account_url?: string;
    // This now contains the complete influencer object
    additional_metrics?: CompleteInfluencer | Record<string, any>;
    // Import metadata for CSV imported data
  import_metadata?: {
    budget?: Array<{
      currency: string;
      price: number;
    }>;
    other_array?: any[];
    [key: string]: any;
  };
    contacts: ContactDetail[];
  };
}

export interface PaginationInfo {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface CampaignListMembersResponse {
  success: boolean;
  influencers: CampaignListMember[];
  pagination: PaginationInfo;
  metadata?: {
    total_count: number;
    active_count: number;
    deleted_count: number;
  };
  message?: string;
}

/**
 * Type guard to check if additional_metrics contains a complete influencer object
 */
export function isCompleteInfluencer(obj: any): obj is CompleteInfluencer {
  return obj && 
         typeof obj === 'object' &&
         typeof obj.id === 'string' &&
         typeof obj.username === 'string' &&
         typeof obj.name === 'string' &&
         typeof obj.followers === 'number' &&
         typeof obj.creator_location === 'object' &&
         typeof obj.filter_match === 'object' &&
         typeof obj.work_platform === 'object';
}

/**
 * Add an influencer to a campaign list
 * @param campaign_list_id The campaign list ID
 * @param influencer The influencer to add
 * @returns Response indicating success/failure
 */
export async function addInfluencerToList(
  campaign_list_id: CampaignListId,
  influencer: Influencer | CompleteInfluencer,
  platformId: string,
  addedThrough?: 'search' | 'discovery' | 'import',
  platformName?: string  // ADD THIS PARAMETER
): Promise<CampaignListMember> {
  try {
    console.log('Test 02:', addedThrough);
    console.log('📊 Influencer data:', influencer);

    // Transform the influencer data to match the expected API format
    const requestData: AddToListRequest = {
      campaign_list_id: campaign_list_id,
      work_platform_id: platformId,  // ✅ CORRECT - this is what backend expects
      platform: platformName || 'instagram',  // ADD THIS LINE
      social_data: {
        id: influencer.id || '',
        username: influencer.username || '',
        name: influencer.name || influencer.username || '',
        profileImage: influencer.profileImage || '',
        followers: String(influencer.followers || '0'),
        isVerified: influencer.isVerified || false,
        account_url: influencer.url || '',
        added_through: addedThrough, // ADD THIS LINE
        import_metadata: (influencer as any).import_metadata, // NEW: Add this line
        // Store the ENTIRE influencer object
        additional_metrics: influencer
      },
    };

    console.log('📤 Sending influencer with added_through inside social_data:', addedThrough);
    console.log('📤 Sending complete influencer object to API');

    // Call the API using the unified API client
    const response = await apiClient.post<CampaignListMember>(
      ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE,
      requestData
    );

    // Handle errors
    if (response.error) {
      console.error('❌ Error adding influencer to list:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }

    console.log('✅ Successfully added influencer with complete object data');

    // Return the success response
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('💥 Unexpected error adding influencer to list:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Get paginated members of a campaign list
 * @param campaign_list_id The campaign list ID
 * @param page Page number (1-based)
 * @param pageSize Items per page
 * @param search Optional search query
 * @param filter Optional filter for active/deleted/all members
 * @returns Response with paginated list members
 */
export async function getCampaignListMembers(
  campaign_list_id: CampaignListId,
  page: number = 1,
  pageSize: number = 25,
  search?: string,
  filter?: 'all' | 'active' | 'deleted'
): Promise<CampaignListMembersResponse> {
  try {
    // ✅ FIX: Build the correct URL with proper endpoint
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (search && search.trim()) {
      queryParams.append('search', search.trim());
    }

    if (filter) {
      queryParams.append('filter', filter);
    }

    // ✅ FIX: Use the correct endpoint format
const endpoint = `campaign-influencers/list/${campaign_list_id}?${queryParams.toString()}`;
    const response = await apiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
      metadata?: {
        total_count: number;
        active_count: number;
        deleted_count: number;
      };
    }>(endpoint);

    if (response.error) {
      console.error('Error fetching paginated campaign list members:', response.error);
      return { 
        success: false, 
        influencers: [],
        pagination: {
          page: 1,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        },
        message: response.error.message 
      };
    }

    return {
      success: true,
      influencers: response.data?.influencers || [],
      pagination: response.data?.pagination || {
        page: 1,
        page_size: pageSize,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      metadata: response.data?.metadata || {
        total_count: 0,
        active_count: 0,
        deleted_count: 0
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching paginated campaign list members:', error);
    return {
      success: false,
      influencers: [],
      pagination: {
        page: 1,
        page_size: pageSize,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      },
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}


/**
 * Remove an influencer from a campaign list
 * @param campaignInfluencerId The influencer ID to remove
 * @returns Response indicating success/failure
 */
export async function removeInfluencerFromList(
  campaignInfluencerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.delete<{ success: boolean; message?: string }>(
      `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId)}`
    );

    // Handle errors
    if (response.error) {
      console.error('Error removing influencer from list:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }

    // Return the success response
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Unexpected error removing influencer from list:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Check if an influencer is already in a campaign list
 * @param campaign_list_id The campaign list ID
 * @param influencerId The influencer ID to check
 * @returns Boolean indicating if the influencer is in the list
 */
export async function checkInfluencerInList(
  campaign_list_id: CampaignListId,
  influencerId: string
): Promise<boolean> {
  try {
    // Call the API using the unified API client
    const response = await apiClient.get<{ exists: boolean }>(
      `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`
    );

    // Handle errors
    if (response.error) {
      console.error('Error checking if influencer is in list:', response.error);
      return false;
    }

    // Return whether the influencer exists in the list
    return response.data?.exists || false;
  } catch (error) {
    console.error('Unexpected error checking if influencer is in list:', error);
    return false;
  }
  
}