// src/services/campaign-influencers/campaign-influencers.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Influencer } from '@/types/insights-iq';
import { 
  CampaignListMember,
  CampaignInfluencerResponse,
  UpdateCampaignInfluencerRequest,
  CampaignInfluencersResponse,
  AddToCampaignListRequest,
  PaginationInfo,
  MarkOnboardedRequest,
  MarkOnboardedResponse,
  RemoveOnboardedRequest,
  RemoveOnboardedResponse,
  UpdateClientReviewStatusRequest,
  StandardizedProfile,
  AddToCampaignResponse,
  PriceApprovalRequest,
  PriceApprovalResponse,
  CopyInfluencersRequest,
  CopyInfluencersResponse
} from '@/types/campaign-influencers';


// Copy influencers from one campaign to another
export async function copyInfluencersToCampaignServer(
  sourceListId: string,
  data: CopyInfluencersRequest,
  authToken?: string
): Promise<CopyInfluencersResponse> {
  try {

    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.COPY_TO_LIST(sourceListId);
    
    const response = await serverApiClient.post<any>(  // ✅ Use 'any' to get raw backend response
      endpoint,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    const backendData = response.data;
    
    const transformedResponse: CopyInfluencersResponse = {
      success: true,  // ✅ Add success flag
      copied_count: backendData.copied_count || 0,
      skipped_count: backendData.skipped_count || 0,
    };
    
    console.log('✅ Server Service: Successfully copied influencers', transformedResponse);
    
    return transformedResponse;
    
  } catch (error) {
    console.error('❌ Server Service: Error copying influencers:', error);
    throw error;
  }
}

// src/services/campaign-influencers/campaign-influencers-copy.server.ts




export async function updateCampaignInfluencerShortlistedStatusServer(
  id: string,
  updateData: { shortlisted_status_id: string },
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Updating shortlisted status for campaign influencer ${id}`);
    
    // Use the unified endpoint
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_SHORTLISTED_STATUS;
    
    const response = await serverApiClient.patch<CampaignListMember>(
      endpoint,
      {
        influencer_ids: [id], // Send as array
        shortlisted_status_id: updateData.shortlisted_status_id
      },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating shortlisted status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign influencer data received from FastAPI');
      throw new Error('No campaign influencer data received');
    }
    
    console.log('✅ Server: Shortlisted status updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating shortlisted status for ${id}:`, error);
    throw error;
  }
}

/**
 * Bulk update campaign influencers shortlisted status from FastAPI backend (server-side)
 */
export async function bulkUpdateShortlistedStatusServer(
  influencerIds: string[],
  statusId: string,
  authToken?: string
): Promise<{
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: string[];
  message: string;
}> {
  try {
    console.log(`🔄 Server: Bulk updating ${influencerIds.length} influencers shortlisted status to ${statusId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.BULK_UPDATE_SHORTLISTED_STATUS;
    
    const response = await serverApiClient.patch<{
      success: boolean;
      updated_count: number;
      failed_count: number;
      errors?: string[];
      message: string;
    }>(
      endpoint,
      {
        influencer_ids: influencerIds,
        shortlisted_status_id: statusId
      },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error bulk updating shortlisted status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: Bulk update failed - no data returned');
      throw new Error('Failed to bulk update shortlisted status - no data returned');
    }
    
    console.log('✅ Server: Bulk shortlisted status update completed:', response.data);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error bulk updating shortlisted status:`, error);
    throw error;
  }
}

/**
 * Add influencer to campaign backend storage
 * This calls the FastAPI backend to store the influencer in campaign_influencers table
 */
export async function addInfluencerToCampaignStorage(
  profile: StandardizedProfile,
  campaignListId: string,
  platformId: string,
  authToken: string,
  addedThrough?: 'search' | 'discovery' | 'import'
): Promise<AddToCampaignResponse> {
  try {
    // ADD THESE DEBUG LOGS
    console.log('🔍 DEBUG: addedThrough parameter received:', addedThrough);
    console.log('🔍 DEBUG: typeof addedThrough:', typeof addedThrough);
    console.log('🔍 DEBUG: addedThrough === undefined?', addedThrough === undefined);
    console.log('🔍 DEBUG: Full function parameters:', {
      profileId: profile.id,
      profileUsername: profile.username,
      campaignListId,
      platformId,
      addedThrough
    });

    console.log('Campaign Influencers Server: Adding influencer to backend storage');


    // Transform standardized profile to match your existing addInfluencerToList format
    // This ensures compatibility with your current backend
    const requestData = {
      campaign_list_id: campaignListId,
      work_platform_id: platformId,
      social_data: {
        id: profile.id,
        username: profile.username,
        name: profile.name,
        profileImage: profile.profileImage,
        followers: String(profile.followers), // Convert to string as expected by existing API
        isVerified: profile.isVerified,
        account_url: profile.url,
        added_through: addedThrough,  // ← MOVED INSIDE social_data

        // Store the complete profile data in additional_metrics
        additional_metrics: profile
      }
    };

    console.log('Campaign Influencers Server: Using existing LIST_MEMBER_CREATE endpoint');

    // Use the existing endpoint that works with addInfluencerToList
    const response = await serverApiClient.post<any>(
      ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE,
      requestData,
      {},
      authToken
    );

    if (response.error) {
      console.error('Campaign Influencers Server: Backend returned error:', response.error);
      return {
        success: false,
        message: response.error.message,
        error_code: 'PROVIDER_ERROR'
      };
    }

    if (!response.data) {
      console.error('Campaign Influencers Server: No data returned from backend');
      return {
        success: false,
        message: 'No data returned from backend',
        error_code: 'PROVIDER_ERROR'
      };
    }

    console.log('Campaign Influencers Server: Successfully stored in backend');

    return {
      success: true,
      influencer_id: profile.id,
      list_member_id: response.data.id,
      provider_used: profile.provider_source,
      profile_data: profile,
      message: `Successfully added ${profile.username} to campaign`
    };

  } catch (error) {
    console.error('Campaign Influencers Server: Error storing influencer:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      error_code: 'PROVIDER_ERROR'
    };
  }
}


/**
 * Check if influencer already exists in campaign
 */
export async function checkInfluencerExists(
  username: string,
  campaignListId: string,
  authToken: string
): Promise<boolean> {
  try {
    // This would call your existing endpoint to check if influencer exists
    // Implementation depends on your backend API structure
    console.log('Campaign Influencers Server: Checking if influencer exists:', username);
    
    // For now, return false (assuming influencer doesn't exist)
    // You can implement the actual check based on your backend API
    return false;

  } catch (error) {
    console.error('Campaign Influencers Server: Error checking influencer existence:', error);
    return false;
  }
}

/**
 * Update campaign list member from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function updateCampaignInfluencerServer(
  id: string,
  updateData: UpdateCampaignInfluencerRequest,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE(id);
    
    const response = await serverApiClient.put<CampaignListMember>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign list member:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign list member data received from FastAPI');
      throw new Error('No campaign list member data received');
    }
    
    console.log('Server: Campaign list member updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error updating campaign list member ${id}:`, error);
    throw error;
  }
}

/**
 * Update campaign influencer status from FastAPI backend (server-side)
 */
export async function updateCampaignInfluencerStatusServer(
  id: string,
  assignedInfluencerId: string,
  statusId: string,
  authToken?: string
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log(`🔄 Server: Updating campaign influencer status ${id} to ${statusId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_STATUS(id);
    
    const response = await serverApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(
      endpoint,
      {assigned_influencer_id: assignedInfluencerId, status_id: statusId },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign influencer status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('Server: Status update failed from FastAPI');
      throw new Error('Failed to update status');
    }
    
    console.log('✅ Server: Campaign influencer status updated successfully:', response.data.influencer_id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating campaign influencer status ${id}:`, error);
    throw error;
  }
}

/**
 * Update campaign influencer price and currency from FastAPI backend (server-side)
 * Now returns the full CampaignInfluencerResponse instead of just success message
 */
export async function updateCampaignInfluencerPriceServer(
  id: string,
  price: number | null,
  currency: string = 'USD',
  priceType: 'inclusive' | 'exclusive' = 'inclusive',  // ✅ ADD THIS PARAMETER
  authToken?: string
): Promise<CampaignInfluencerResponse> {  // Changed return type
  try {
    console.log(`🔄 Server: Updating campaign influencer price ${id} to ${price} ${currency}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_PRICE(id);
    
    const response = await serverApiClient.patch<CampaignInfluencerResponse>(  // Changed type
      endpoint,
      { 
        collaboration_price: price,
        currency: currency,
        price_type: priceType                          // ✅ ADD THIS
      },
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating campaign influencer price:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: Price update failed - no data returned');
      throw new Error('Failed to update price - no data returned');
    }
    
    console.log('✅ Server: Campaign influencer price updated successfully, returning full influencer data');
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating campaign influencer price ${id}:`, error);
    throw error;
  }
}

/**
 * Get campaign list member by ID from FastAPI backend (server-side)
 */
export async function getCampaignInfluencerServer(
  id: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Fetching campaign list member ${id}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.DETAIL(id);
    
    const response = await serverApiClient.get<CampaignListMember>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching campaign list member:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign list member data received from FastAPI');
      throw new Error('No campaign list member data received');
    }
    
    console.log('Server: Campaign list member fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching campaign list member ${id}:`, error);
    throw error;
  }
}

/**
 * Mark influencers as onboarded from FastAPI backend (server-side)
 */
export async function markInfluencersOnboardedServer(
  requestData: MarkOnboardedRequest,
  authToken?: string
): Promise<MarkOnboardedResponse> {
  try {
    console.log('🔄 Server: Marking influencers as onboarded:', requestData);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.MARK_ONBOARDED;
    
    const response = await serverApiClient.patch<MarkOnboardedResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error marking influencers as onboarded:', response.error);
      throw new Error(response.error.message);
    }
    
    // Check if response.data exists and handle both success and error cases
    if (!response.data) {
      console.warn('⚠️ Server: No response data from FastAPI for mark onboarded');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug
    console.log('📊 Server: FastAPI Response for mark onboarded:', response.data);
    
    // Return the response as-is since FastAPI should return the correct format
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error marking influencers as onboarded:', error);
    throw error;
  }
}

/**
 * Remove onboarded influencers from FastAPI backend (server-side)
 */
export async function removeOnboardedInfluencersServer(
  requestData: RemoveOnboardedRequest,
  authToken?: string
): Promise<RemoveOnboardedResponse> {
  try {
    console.log('🔄 Server: Removing onboarded influencers:', requestData);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.REMOVE_ONBOARDED;
    
    const response = await serverApiClient.patch<RemoveOnboardedResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error removing onboarded influencers:', response.error);
      throw new Error(response.error.message);
    }
    
    // Check if response.data exists and handle both success and error cases
    if (!response.data) {
      console.warn('⚠️ Server: No response data from FastAPI for remove onboarded');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug
    console.log('📊 Server: FastAPI Response for remove onboarded:', response.data);
    
    // Return the response as-is since FastAPI should return the correct format
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error removing onboarded influencers:', error);
    throw error;
  }
}


// ============ MIGRATED SERVER FUNCTIONS ============

/**
 * Get paginated campaign influencers from FastAPI backend (server-side)
 */
export async function getCampaignInfluencersServer(
  campaign_list_id: string,
  page: number = 1,
  pageSize: number = 10,
  authToken?: string
): Promise<CampaignInfluencersResponse> {
  try {
    console.log(`Server: Fetching campaign influencers for list ${campaign_list_id}, page ${page}, size ${pageSize}`);
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      list_id: campaign_list_id
    });

    const endpoint = `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`;
    
    const response = await serverApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(endpoint, {}, authToken);
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching campaign influencers:', response.error);
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
    
    console.log(`✅ Server: Successfully fetched ${response.data?.influencers?.length || 0} campaign influencers`);
    
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
      }
    };
  } catch (error) {
    console.error(`💥 Server: Error fetching campaign influencers for list ${campaign_list_id}:`, error);
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
 * Get all campaign influencers from FastAPI backend (server-side)
 */
export async function getAllCampaignInfluencersServer(
  campaign_list_id: string,
  authToken?: string
): Promise<CampaignInfluencersResponse> {
  try {
    console.log(`Server: Fetching all campaign influencers for list ${campaign_list_id}`);
    
    const queryParams = new URLSearchParams({
      page: '1',
      page_size: '1000', // Large number to get all
      list_id: campaign_list_id
    });

    const endpoint = `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`;
    
    const response = await serverApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(endpoint, {}, authToken);
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching all campaign influencers:', response.error);
      return { 
        success: false, 
        influencers: [],
        pagination: {
          page: 1,
          page_size: 1000,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        },
        message: response.error.message 
      };
    }
    
    console.log(`✅ Server: Successfully fetched all ${response.data?.influencers?.length || 0} campaign influencers`);
    
    return {
      success: true,
      influencers: response.data?.influencers || [],
      pagination: response.data?.pagination || {
        page: 1,
        page_size: 1000,
        total_items: 0,
        total_pages: 1,
        has_next: false,
        has_previous: false
      }
    };
  } catch (error) {
    console.error(`💥 Server: Error fetching all campaign influencers for list ${campaign_list_id}:`, error);
    return {
      success: false,
      influencers: [],
      pagination: {
        page: 1,
        page_size: 1000,
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
 * Add influencer to campaign list from FastAPI backend (server-side)
 */
export async function addInfluencerToCampaignListServer(
  campaign_list_id: string,
  influencer: Influencer,
  platformId: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    
    // Transform the influencer data to match the expected API format
    const requestData: AddToCampaignListRequest = {
      campaign_list_id: campaign_list_id,
      platform_id: platformId,
      social_data: {
        id: influencer.id || '',
        username: influencer.username || '',
        name: influencer.name || influencer.username || '',
        profileImage: influencer.profileImage || '',
        followers: influencer.followers || 0,
        isVerified: influencer.isVerified || false,
        account_url: influencer.url || '',
        additional_metrics: Object.fromEntries(
          Object.entries(influencer).filter(
            ([, value]) =>
              typeof value === 'string' ||
              typeof value === 'number' ||
              typeof value === 'boolean' ||
              value === null
          )
        )
      },
    };

    const endpoint = ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE;
    
    const response = await serverApiClient.post<CampaignListMember>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error adding influencer to campaign list:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.id) {
      throw new Error('Invalid response: missing influencer id');
    }
    return {
      ...response.data,
      id: response.data.id as string // ensure id is string
    };
  } catch (error) {
    console.error(`💥 Server: Error adding influencer to campaign list ${campaign_list_id}:`, error);
    throw error;
  }
}

/**
 * Remove campaign influencer from FastAPI backend (server-side)
 */
export async function removeCampaignInfluencerServer(
  campaignInfluencerId: string,
  authToken?: string
): Promise<{ success: boolean; message?: string }> {
  try {
    console.log(`Server: Removing campaign influencer ${campaignInfluencerId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId);
    
    const response = await serverApiClient.delete<{ success: boolean; message?: string }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error removing campaign influencer:', response.error);
      return { 
        success: false, 
        message: response.error.message 
      };
    }
    
    console.log('✅ Server: Campaign influencer removed successfully');
    
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error(`💥 Server: Error removing campaign influencer ${campaignInfluencerId}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

export async function restoreCampaignInfluencerServer(
  campaignInfluencerId: string,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`🔄 Server: Restoring campaign influencer ${campaignInfluencerId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.RESTORE(campaignInfluencerId);
    
    const response = await serverApiClient.patch<CampaignListMember>(
      endpoint,
      {},
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error restoring campaign influencer:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No data received from restore API');
      throw new Error('No data received from restore API');
    }
    
    console.log('✅ Server: Campaign influencer restored successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error restoring campaign influencer ${campaignInfluencerId}:`, error);
    throw error;
  }
}

/**
 * Check if influencer exists in campaign list from FastAPI backend (server-side)
 */
export async function checkInfluencerInCampaignListServer(
  campaign_list_id: string,
  influencerId: string,
  authToken?: string
): Promise<boolean> {
  try {
    console.log(`Server: Checking if influencer ${influencerId} exists in campaign list ${campaign_list_id}`);
    
    const endpoint = `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`;
    
    const response = await serverApiClient.get<{ exists: boolean }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error checking influencer in campaign list:', response.error);
      return false;
    }
    
    const exists = response.data?.exists || false;
    console.log(`✅ Server: Influencer exists check result: ${exists}`);
    
    return exists;
  } catch (error) {
    console.error(`💥 Server: Error checking influencer in campaign list:`, error);
    return false;
  }
}

/**
 * Update campaign influencer client review status from FastAPI backend (server-side)
 */
export async function updateCampaignInfluencerClientReviewStatusServer(
  id: string,
  updateData: UpdateClientReviewStatusRequest,
  authToken?: string
): Promise<CampaignListMember> {
  try {
    console.log(`Server: Updating client review status for campaign influencer ${id}`);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_CLIENT_REVIEW_STATUS(id);
    
    const response = await serverApiClient.patch<CampaignListMember>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating client review status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No campaign influencer data received from FastAPI');
      throw new Error('No campaign influencer data received');
    }
    
    console.log('✅ Server: Client review status updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error updating client review status for ${id}:`, error);
    throw error;
  }
}

/**
 * Approve or reject price for campaign influencer (server-side)
 */
export async function approvePriceServer(
  influencerId: string,
  data: PriceApprovalRequest,
  authToken?: string
): Promise<PriceApprovalResponse> {
  try {
    console.log('🚀 Server: Starting approvePriceServer for influencer:', influencerId);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.PRICE_APPROVAL(influencerId);
    console.log('📞 Server: Making PATCH request to:', endpoint);
    
    const response = await serverApiClient.patch<PriceApprovalResponse>(
      endpoint,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No response data received');
      throw new Error('Failed to process price approval');
    }
    
    console.log('✅ Server: Price approval successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in approvePriceServer:', error);
    throw error;
  }
}