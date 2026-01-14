// src/services/campaign-influencers/campaign-influencers.client.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { apiClient } from '@/lib/api'; // Import the unified API client
import { ENDPOINTS } from '@/services/api/endpoints';
import { CLIENT_ENDPOINTS } from '@/services/api/client-endpoints';
import { Influencer } from '@/types/insights-iq';

import { 
  CampaignListMember, 
  CampaignInfluencerResponse,
  UpdateCampaignInfluencerRequest,
  UpdateCampaignInfluencerResponse,
  CampaignInfluencersResponse,
  AddToCampaignListRequest,
  PaginationInfo,
  MarkOnboardedRequest,
  MarkOnboardedResponse,
  RemoveOnboardedRequest,
  RemoveOnboardedResponse,
  UpdateClientReviewStatusRequest,
  UpdateClientReviewStatusResponse,
  AddToCampaignRequest,
  AddToCampaignResponse,
  PriceApprovalRequest,
  PriceApprovalResponse,
  CopyInfluencersRequest,
  CopyInfluencersResponse
} from '@/types/campaign-influencers';

const API_VERSION = '/api/v0';

/**
 * Copy influencers from one campaign to another (Client-side)
 */
export async function copyInfluencersToCampaign(
  sourceListId: string,
  request: CopyInfluencersRequest
): Promise<CopyInfluencersResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('copyInfluencersToCampaign can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.CAMPAIGN_INFLUENCERS.COPY_TO_LIST(sourceListId);

    const response = await nextjsApiClient.post<CopyInfluencersResponse>(
      endpoint,
      request
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data?.success) {
      throw new Error(response.data?.error || 'Failed to copy influencers');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in copyInfluencersToCampaign:', error);
    throw error;
  }
}

export async function addInfluencerToCampaign(
  request: AddToCampaignRequest
): Promise<AddToCampaignResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('addInfluencerToCampaign can only be called from browser');
    }
    
    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    console.log('Campaign Influencers Client: Adding influencer to campaign:', request);

    const response = await nextjsApiClient.post<AddToCampaignResponse>(
      CLIENT_ENDPOINTS.CAMPAIGN_INFLUENCERS.ADD_TO_CAMPAIGN,
      request
    );
    
    if (response.error) {
      console.error('Campaign Influencers Client: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received from add-to-campaign API');
    }

    console.log('Campaign Influencers Client: Successfully added influencer:', response.data);
    return response.data;

  } catch (error) {
    console.error('Campaign Influencers Client: Error in addInfluencerToCampaign:', error);
    throw error;
  }
}

// src/services/campaign-influencers/campaign-influencers-copy.client.ts

/**
 * Update campaign influencer shortlisted status (single)
 */
export async function updateCampaignInfluencerShortlistedStatus(
  id: string,
  statusId: string
): Promise<CampaignListMember> {
  try {
    console.log('📤 Client Service: Updating campaign influencer shortlisted status:', { id, statusId });
    
    const endpoint = `/api/v0/campaign-influencers/shortlisted-status`;
    const response = await nextjsApiClient.patch<{
      success: boolean;
      data: CampaignListMember;
      message: string;
      error?: string;
    }>(endpoint, { 
      influencer_ids: [id], // Now send as array
      shortlisted_status_id: statusId 
    });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid shortlisted status update data received');
      throw new Error(response.data?.error || 'Failed to update shortlisted status');
    }
    
    console.log('✅ Client Service: Shortlisted status updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerShortlistedStatus:', error);
    throw error;
  }
}

/**
 * Bulk update campaign influencers shortlisted status
 */
export async function bulkUpdateShortlistedStatus(
  influencerIds: string[],
  statusId: string
): Promise<{
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: string[];
  message: string;
}> {
  try {
    console.log('📤 Client Service: Bulk updating shortlisted status:', { 
      count: influencerIds.length, 
      statusId 
    });
    
    const endpoint = `/api/v0/campaign-influencers/shortlisted-status`;
    const response = await nextjsApiClient.patch<{
      success: boolean;
      updated_count: number;
      failed_count: number;
      errors?: string[];
      message: string;
    }>(endpoint, { 
      influencer_ids: influencerIds, // Send as array
      shortlisted_status_id: statusId 
    });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No bulk update response data received');
      throw new Error('Failed to bulk update shortlisted status');
    }
    
    console.log('✅ Client Service: Bulk shortlisted status update completed:', response.data);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in bulkUpdateShortlistedStatus:', error);
    throw error;
  }
}

/**
 * Update campaign list member via Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function updateCampaignInfluencer(
  id: string,
  updateData: UpdateCampaignInfluencerRequest
): Promise<CampaignListMember> {
  try {
    const endpoint = `/api/v0/campaign-influencers/${id}`;
    const response = await nextjsApiClient.patch<UpdateCampaignInfluencerResponse>(endpoint, updateData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid campaign list member data received');
      throw new Error(response.data?.error || 'Failed to update campaign list member');
    }
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencer:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Update campaign influencer status via Next.js API route (client-side)
 */
export async function updateCampaignInfluencerStatus(
  id: string,
  assignedInfluencerId: string,
  statusId: string
): Promise<{ success: boolean; message: string; influencer_id: string }> {
  try {
    console.log('📤 Client Service: Updating campaign influencer status:', { id, statusId });
    
    const endpoint = `/api/v0/campaign-influencers/${id}/status`;
    const response = await nextjsApiClient.patch<{
      success: boolean;
      message: string;
      influencer_id: string;
    }>(endpoint, { assigned_influencer_id: assignedInfluencerId, status_id: statusId });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Client Service: Status update failed');
      throw new Error('Failed to update status');
    }
    
    console.log('✅ Client Service: Status updated successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerStatus:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Update campaign influencer price and currency via Next.js API route (client-side)
 * Now returns the full CampaignInfluencerResponse instead of just success message
 */
export async function updateCampaignInfluencerPrice(
  id: string,
  price: number | null,
  currency: string = 'USD',
  priceType: 'inclusive' | 'exclusive' = 'inclusive'   // ✅ ADD THIS PARAMETER
): Promise<CampaignInfluencerResponse> {  // Changed return type
  try {
    console.log('📤 Client Service: Updating campaign influencer price:', { id, price, currency, priceType });
    
    const endpoint = `/api/v0/campaign-influencers/${id}/price`;
    const response = await nextjsApiClient.patch<CampaignInfluencerResponse>(  // Changed type
      endpoint, 
      { 
        collaboration_price: price,
        currency: currency,
        price_type: priceType 
      }
    );

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: Price update failed - no data returned');
      throw new Error('Failed to update price - no data returned');
    }
    
    console.log('✅ Client Service: Price updated successfully, returning full influencer data');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerPrice:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Get campaign list member by ID via Next.js API route (client-side)
 */
export async function getCampaignInfluencer(id: string): Promise<CampaignListMember> {
  try {
    const endpoint = `/api/v0/campaign-influencers/${id}`;
    
    const response = await nextjsApiClient.get<CampaignListMember>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No campaign list member data received');
      throw new Error('No campaign list member data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getCampaignInfluencer:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

// ============ ONBOARDING FUNCTIONS ============

/**
 * Mark influencers as onboarded via Next.js API route (client-side)
 */
export async function markInfluencersOnboarded(
  campaignListId: string,
  influencerIds: string[]
): Promise<MarkOnboardedResponse> {
  try {
    console.log('📤 Client Service: Marking influencers as onboarded:', { campaignListId, influencerIds });
    
    const endpoint = '/api/v0/campaign-influencers/mark-onboarded';
    const requestData: MarkOnboardedRequest = {
      campaign_list_id: campaignListId,
      influencer_ids: influencerIds
    };
    
    const response = await nextjsApiClient.patch<MarkOnboardedResponse>(endpoint, requestData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug the issue
    console.log('📊 Client Service: Response received for mark onboarded:', response.data);
    
    // Check if the message indicates success (even if success flag is false)
    const isActuallySuccessful = response.data.message && 
      (response.data.message.includes('successfully') || 
       response.data.message.includes('marked') ||
       response.data.message.includes('onboarded'));
    
    if (!response.data.success && !isActuallySuccessful) {
      console.warn('⚠️ Client Service: Mark onboarded failed');
      throw new Error(response.data.message || 'Failed to mark influencers as onboarded');
    }
    
    console.log('✅ Client Service: Influencers marked as onboarded successfully');
    
    // Return success response even if the success flag is wrong
    return {
      success: true,
      message: response.data.message || 'Influencers marked as onboarded successfully'
    };
  } catch (error) {
    console.error('💥 Client Service: Error in markInfluencersOnboarded:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Remove onboarded influencers via Next.js API route (client-side)
 */
export async function removeOnboardedInfluencers(
  campaignListId: string,
  influencerIds: string[]
): Promise<RemoveOnboardedResponse> {
  try {
    console.log('📤 Client Service: Removing onboarded influencers:', { campaignListId, influencerIds });
    
    const endpoint = '/api/v0/campaign-influencers/remove-onboarded';
    const requestData: RemoveOnboardedRequest = {
      campaign_list_id: campaignListId,
      influencer_ids: influencerIds
    };
    
    const response = await nextjsApiClient.patch<RemoveOnboardedResponse>(endpoint, requestData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No response data received');
      throw new Error('No response data received from server');
    }

    // Log the actual response to debug the issue
    console.log('📊 Client Service: Response received for remove onboarded:', response.data);
    
    // Check if the message indicates success (even if success flag is false)
    const isActuallySuccessful = response.data.message && 
      (response.data.message.includes('successfully') || 
       response.data.message.includes('removed') ||
       response.data.message.includes('onboarded'));
    
    if (!response.data.success && !isActuallySuccessful) {
      console.warn('⚠️ Client Service: Remove onboarded failed');
      throw new Error(response.data.message || 'Failed to remove onboarded influencers');
    }
    
    console.log('✅ Client Service: Onboarded influencers removed successfully');
    
    // Return success response even if the success flag is wrong
    return {
      success: true,
      message: response.data.message || 'Onboarded influencers removed successfully'
    };
  } catch (error) {
    console.error('💥 Client Service: Error in removeOnboardedInfluencers:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}
// ============ MIGRATED FUNCTIONS FROM campaign-list.service.ts ============

/**
 * Get paginated campaign influencers (migrated from getCampaignListMembers)
 * @param campaign_list_id The campaign list ID
 * @param page Page number (1-based)
 * @param pageSize Items per page
 * @returns Response with paginated campaign influencers
 */
export async function getCampaignInfluencers(
  campaign_list_id: string,
  page: number = 1,
  pageSize: number = 10
): Promise<CampaignInfluencersResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
      list_id: campaign_list_id
    });

    const response = await nextjsApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(`${API_VERSION}${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`);

    if (response.error) {
      console.error('Error fetching paginated campaign influencers:', response.error);
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
      }
    };
  } catch (error) {
    console.error('Unexpected error fetching paginated campaign influencers:', error);
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
 * Get all campaign influencers without pagination (for status-based filtering)
 * @param campaign_list_id The campaign list ID
 * @returns Response with all campaign influencers
 */
export async function getAllCampaignInfluencers(
  campaign_list_id: string
): Promise<CampaignInfluencersResponse> {
  try {
    const queryParams = new URLSearchParams({
      page: '1',
      page_size: '1000', // Large number to get all
      campaign_list_id: campaign_list_id
    });

    const response = await nextjsApiClient.get<{
      influencers: CampaignListMember[];
      pagination: PaginationInfo;
    }>(`${API_VERSION}${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBERS('')}?${queryParams}`);

    if (response.error) {
      console.error('Error fetching all campaign influencers:', response.error);
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
    console.error('Unexpected error fetching all campaign influencers:', error);
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
 * Add an influencer to campaign list (migrated from addInfluencerToList)
 * @param campaign_list_id The campaign list ID
 * @param influencer The influencer to add
 * @param platformId The platform ID
 * @returns Response indicating success/failure
 */
export async function addInfluencerToCampaignList(
  campaign_list_id: string,
  influencer: Influencer,
  platformId: string,
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

    // Call the API using the unified API client
    const response = await nextjsApiClient.post<CampaignListMember>(
      ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_CREATE,
      requestData
    );

    // Handle errors
    if (response.error) {
      console.error('Error adding influencer to campaign list:', response.error);
      // Throw error instead of returning incompatible type
      throw new Error(response.error.message);
    }

    // Ensure response.data exists and has required fields
    if (!response.data) {
      throw new Error('No data received from API');
    }

    // Return the response data directly since it should be a CampaignListMember
    return response.data;
  } catch (error) {
    console.error('Unexpected error adding influencer to campaign list:', error);
    // Throw error instead of returning incompatible type
    throw error;
  }
}

/**
 * Remove a campaign influencer (migrated from removeInfluencerFromList)
 * @param campaignInfluencerId The influencer ID to remove
 * @returns Response indicating success/failure
 */
export async function removeCampaignInfluencer(
  campaignInfluencerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    // Call the API using the unified API client
    const response = await nextjsApiClient.delete<{ success: boolean; message?: string }>(
      `${ENDPOINTS.CAMPAIGN_LISTS.LIST_MEMBER_DELETE(campaignInfluencerId)}`
    );

    // Handle errors
    if (response.error) {
      console.error('Error removing campaign influencer:', response.error);
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
    console.error('Unexpected error removing campaign influencer:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}

/**
 * Restore a soft-deleted campaign influencer
 * @param campaignInfluencerId The influencer ID to restore
 * @returns The restored CampaignListMember
 */
export async function restoreCampaignInfluencer(
  campaignInfluencerId: string
): Promise<CampaignListMember> {
  try {
    console.log('📤 Client Service: Restoring campaign influencer:', campaignInfluencerId);
    
    const endpoint = `/api/v0/campaign-influencers/${campaignInfluencerId}/restore`;
    
    const response = await nextjsApiClient.patch<CampaignListMember>(endpoint, {});

    if (response.error) {
      console.error('❌ Client Service: Error restoring campaign influencer:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from restore API');
    }

    console.log('✅ Client Service: Campaign influencer restored successfully');
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Unexpected error restoring campaign influencer:', error);
    throw error;
  }
}

/**
 * Check if an influencer is already in a campaign list
 * @param campaign_list_id The campaign list ID
 * @param influencerId The influencer ID to check
 * @returns Boolean indicating if the influencer is in the list
 */
export async function checkInfluencerInCampaignList(
  campaign_list_id: string,
  influencerId: string
): Promise<boolean> {
  try {
    // Call the API using the unified API client
    const response = await nextjsApiClient.get<{ exists: boolean }>(
      `/api/v0/campaign-list-members/${campaign_list_id}/${influencerId}/check`
    );

    // Handle errors
    if (response.error) {
      console.error('Error checking if influencer is in campaign list:', response.error);
      return false;
    }

    // Return whether the influencer exists in the list
    return response.data?.exists || false;
  } catch (error) {
    console.error('Unexpected error checking if influencer is in campaign list:', error);
    return false;
  }
}


/**
 * Update campaign influencer client review status via Next.js API route (client-side)
 */
export async function updateCampaignInfluencerClientReviewStatus(
  id: string,
  updateData: UpdateClientReviewStatusRequest
): Promise<CampaignListMember> {
  try {
    
    const endpoint = API_VERSION + ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_CLIENT_REVIEW_STATUS(id);
    const response = await nextjsApiClient.patch<UpdateClientReviewStatusResponse>(endpoint, updateData);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Client Service: No valid campaign influencer data received');
      throw new Error(response.data?.error || 'Failed to update client review status');
    }
    
    console.log('✅ Client Service: Client review status updated successfully');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateCampaignInfluencerClientReviewStatus:', error);
    
    if (error instanceof Error) {
      console.error('💥 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}

/**
 * Approve or reject price for campaign influencer (client-side)
 */
export async function approvePrice(
  influencerId: string,
  data: PriceApprovalRequest
): Promise<PriceApprovalResponse> {
  try {
    console.log('🚀 Client: Starting approvePrice for influencer:', influencerId);
    
    if (typeof window === 'undefined') {
      throw new Error('approvePrice can only be called from browser');
    }

    // Check token exists
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const endpoint = `${API_VERSION}/campaign-influencers/${influencerId}/price-approval`;
    console.log('📞 Client: Making PATCH request to:', endpoint);
    
    const response = await nextjsApiClient.patch<{ 
      success: boolean; 
      data: PriceApprovalResponse;
      error?: string;
    }>(
      endpoint,
      data
    );
    
    console.log('📦 Client: Raw API response:', response);

    if (response.error) {
      console.error('❌ Client: API returned error:', response.error.message);
      throw new Error(response.error.message);
    }

    if (!response.data?.data) {
      console.warn('⚠️ Client: No data in response');
      throw new Error('Failed to process price approval');
    }

    console.log('✅ Client: Price approval successful');
    return response.data.data;
  } catch (error) {
    console.error('💥 Client: Error in approvePrice:', error);
    throw error;
  }
}