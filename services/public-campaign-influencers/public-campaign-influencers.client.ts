// src/services/public-campaign-influencers/public-campaign-influencers.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  PublicCampaignInfluencersRequest,
  PublicCampaignInfluencersResponse,
  PublicCampaignInfluencersApiResponse,
  UpdatePublicClientReviewStatusRequest,
  UpdatePublicClientReviewStatusResponse,
  UpdatePublicShortlistedStatusRequest,
  UpdatePublicShortlistedStatusResponse,
} from '@/types/public-campaign-influencers';

const API_VERSION = '/api/v0';

export async function getPublicCampaignInfluencers(
  params: PublicCampaignInfluencersRequest,
): Promise<PublicCampaignInfluencersResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams({
      token: params.token,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.search && { search: params.search }),
    });

    const endpoint = `${API_VERSION}${ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.LIST}?${queryParams.toString()}`;

    // Note: This is a public endpoint, so we don't need auth headers
    const response =
      await nextjsApiClient.get<PublicCampaignInfluencersApiResponse>(
        endpoint,
        { auth: false }, // Disable auth for public endpoint
      );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data || !response.data.success) {
      throw new Error('Failed to fetch public campaign influencers');
    }

    // Extract the nested data and return in expected format
    const { data } = response.data;

    return {
      session: data.session,
      influencers: data.influencers,
      pagination: data.pagination,
    };
  } catch (error) {
    console.error(
      'Client Service: Error in getPublicCampaignInfluencers:',
      error,
    );
    throw error;
  }
}

export async function updatePublicClientReviewStatus(
  influencerId: string,
  data: UpdatePublicClientReviewStatusRequest,
): Promise<UpdatePublicClientReviewStatusResponse> {
  try {
    const endpoint = `${API_VERSION}${ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.UPDATE_CLIENT_REVIEW_STATUS(influencerId)}`;

    const response =
      await nextjsApiClient.post<UpdatePublicClientReviewStatusResponse>(
        endpoint,
        data,
        { auth: false }, // No auth header needed for public endpoint
      );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to update client review status');
    }

    return response.data;
  } catch (error) {
    console.error(
      `💥 Client Service: Error in updatePublicClientReviewStatus for ${influencerId}:`,
      error,
    );
    throw error;
  }
}

export async function updatePublicShortlistedStatus(
  influencerId: string,
  data: UpdatePublicShortlistedStatusRequest,
): Promise<UpdatePublicShortlistedStatusResponse> {
  try {
    console.log(
      `📤 Client Service: Updating shortlisted status for ${influencerId}`,
    );

    // Use the unified endpoint with array
    const endpoint = `${API_VERSION}${ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.UPDATE_SHORTLISTED_STATUS}`;

    const response =
      await nextjsApiClient.patch<UpdatePublicShortlistedStatusResponse>(
        endpoint,
        {
          influencer_ids: [influencerId],
          shortlisted_status_id: data.shortlisted_status_id,
          token: data.token,
        },
        { auth: false },
      );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to update shortlisted status');
    }

    console.log('✅ Client Service: Shortlisted status updated successfully');
    return response.data;
  } catch (error) {
    console.error(
      `💥 Client Service: Error in updatePublicShortlistedStatus for ${influencerId}:`,
      error,
    );
    throw error;
  }
}

// 🆕 NEW: Bulk update function
export async function bulkUpdatePublicShortlistedStatus(
  influencerIds: string[],
  statusId: string,
  token: string,
): Promise<{
  success: boolean;
  updated_count: number;
  failed_count: number;
  errors?: string[];
  message: string;
}> {
  try {
    console.log(
      `📤 Client Service: Bulk updating ${influencerIds.length} influencers`,
    );

    const endpoint = `${API_VERSION}${ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.UPDATE_SHORTLISTED_STATUS}`;

    const response = await nextjsApiClient.patch<{
      success: boolean;
      updated_count: number;
      failed_count: number;
      errors?: string[];
      message: string;
    }>(
      endpoint,
      {
        influencer_ids: influencerIds,
        shortlisted_status_id: statusId,
        token: token,
      },
      { auth: false },
    );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('Failed to bulk update shortlisted status');
    }

    console.log('✅ Client Service: Bulk update completed:', response.data);
    return response.data;
  } catch (error) {
    console.error(
      '💥 Client Service: Error in bulkUpdatePublicShortlistedStatus:',
      error,
    );
    throw error;
  }
}
