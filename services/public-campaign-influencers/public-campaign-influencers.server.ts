// src/services/public-campaign-influencers/public-campaign-influencers.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  PublicCampaignInfluencersRequest,
  PublicCampaignInfluencersApiResponse,
  UpdatePublicClientReviewStatusRequest,
  UpdatePublicClientReviewStatusResponse,
  UpdatePublicShortlistedStatusRequest, // 👈 ADD THIS LINE
  UpdatePublicShortlistedStatusResponse, // 👈 ADD THIS LINE
} from '@/types/public-campaign-influencers';

export async function getPublicCampaignInfluencersServer(
  params: PublicCampaignInfluencersRequest,
): Promise<PublicCampaignInfluencersApiResponse> {
  try {
    const queryParams = new URLSearchParams({
      token: params.token,
      ...(params.limit && { limit: params.limit.toString() }),
      ...(params.page && { page: params.page.toString() }),
      ...(params.search && { search: params.search }),
    });

    const endpoint = `${ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.LIST}?${queryParams.toString()}`;

    const response =
      await serverApiClient.get<PublicCampaignInfluencersApiResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error(
      'Server Service: Error getting public campaign influencers:',
      error,
    );
    throw error;
  }
}

export async function updatePublicClientReviewStatusServer(
  influencerId: string,
  data: UpdatePublicClientReviewStatusRequest,
): Promise<UpdatePublicClientReviewStatusResponse> {
  try {
    const endpoint =
      ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.UPDATE_CLIENT_REVIEW_STATUS(
        influencerId,
      );

    const response =
      await serverApiClient.patch<UpdatePublicClientReviewStatusResponse>(
        endpoint,
        data,
        {}, // No additional headers needed for public endpoint
        // No auth token needed - public endpoint uses token from request body
      );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error(
      `💥 Server: Error in updatePublicClientReviewStatusServer for ${influencerId}:`,
      error,
    );
    throw error;
  }
}

// 🆕 NEW: Update public shortlisted status
export async function updatePublicShortlistedStatusServer(
  influencerId: string,
  data: UpdatePublicShortlistedStatusRequest,
): Promise<UpdatePublicShortlistedStatusResponse> {
  try {
    console.log(`📤 Server: Updating shortlisted status for ${influencerId}`);

    // Use the new unified endpoint
    const endpoint =
      ENDPOINTS.PUBLIC.CAMPAIGN_INFLUENCERS.UPDATE_SHORTLISTED_STATUS;

    // Send request with influencer_ids as array (backend expects this)
    const response =
      await serverApiClient.patch<UpdatePublicShortlistedStatusResponse>(
        endpoint,
        {
          influencer_ids: [influencerId],
          shortlisted_status_id: data.shortlisted_status_id,
          token: data.token,
        },
        {},
      );

    if (response.error) {
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log('✅ Server: Shortlisted status updated successfully');
    return response.data;
  } catch (error) {
    console.error(
      `💥 Server: Error in updatePublicShortlistedStatusServer for ${influencerId}:`,
      error,
    );
    throw error;
  }
}

// ================================================================
// Helper Functions for Session Validation
// ================================================================

async function validatePublicSessionToken(token: string): Promise<{
  isValid: boolean;
  session: any | null;
  error?: string;
}> {
  try {
    const endpoint = `/public-sessions/validate`;
    const response = await serverApiClient.post<any>(endpoint, { token });

    if (response.error) {
      return { isValid: false, session: null, error: response.error.message };
    }

    return { isValid: true, session: response.data };
  } catch (error) {
    return {
      isValid: false,
      session: null,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}

async function createPublicSessionAction(actionData: any): Promise<void> {
  try {
    const endpoint = `/public-session-actions`;
    await serverApiClient.post(endpoint, actionData);
  } catch (error) {
    console.warn('Failed to create public session action:', error);
    // Don't throw - this is just for logging
  }
}
