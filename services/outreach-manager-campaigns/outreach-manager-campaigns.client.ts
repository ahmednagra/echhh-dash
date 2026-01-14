// src/services/outreach-manager-campaigns/outreach-manager-campaigns.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import {
  OutreachManagerCampaignsResponse,
  CampaignInfluencersWithAgentResponse,
  GetOutreachManagerCampaignsRequest,
  GetCampaignInfluencersRequest,
  UnapprovedInfluencersResponse, // ← ADD THIS
  GetUnapprovedInfluencersRequest, // ← ADD THIS
} from '@/types/outreach-manager-campaigns';

/**
 * Get all campaigns with aggregated stats for outreach manager (client-side)
 */
export async function getOutreachManagerCampaigns(
  params?: GetOutreachManagerCampaignsRequest,
): Promise<OutreachManagerCampaignsResponse> {
  try {
    console.log('🚀 Client Service: Starting getOutreachManagerCampaigns');

    if (typeof window === 'undefined') {
      throw new Error(
        'getOutreachManagerCampaigns can only be called from browser',
      );
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size)
      queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/v0/outreach-manager/campaigns${queryString ? `?${queryString}` : ''}`;

    console.log(`📞 Client Service: Making API call to ${endpoint}`);

    const response =
      await nextjsApiClient.get<OutreachManagerCampaignsResponse>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    console.log(
      `✅ Client Service: Successfully fetched ${response.data.campaigns?.length || 0} campaigns`,
    );
    return response.data;
  } catch (error) {
    console.error(
      '💥 Client Service: Error in getOutreachManagerCampaigns:',
      error,
    );
    throw error;
  }
}

/**
 * Get campaign influencers with agent info for outreach manager (client-side)
 */
export async function getCampaignInfluencersForManager(
  campaignId: string,
  params?: GetCampaignInfluencersRequest,
): Promise<CampaignInfluencersWithAgentResponse> {
  try {
    console.log(
      `🚀 Client Service: Starting getCampaignInfluencersForManager for campaign ${campaignId}`,
    );

    if (typeof window === 'undefined') {
      throw new Error(
        'getCampaignInfluencersForManager can only be called from browser',
      );
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size)
      queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/v0/outreach-manager/campaigns/${campaignId}/influencers${queryString ? `?${queryString}` : ''}`;

    console.log(`📞 Client Service: Making API call to ${endpoint}`);

    const response =
      await nextjsApiClient.get<CampaignInfluencersWithAgentResponse>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    console.log(
      `✅ Client Service: Successfully fetched ${response.data.influencers?.length || 0} influencers`,
    );
    return response.data;
  } catch (error) {
    console.error(
      '💥 Client Service: Error in getCampaignInfluencersForManager:',
      error,
    );
    throw error;
  }
}

/**
 * Get all unapproved influencers across all campaigns (client-side)
 */
export async function getUnapprovedInfluencers(
  params?: GetUnapprovedInfluencersRequest,
): Promise<UnapprovedInfluencersResponse> {
  try {
    console.log('🚀 Client Service: Starting getUnapprovedInfluencers');

    if (typeof window === 'undefined') {
      throw new Error(
        'getUnapprovedInfluencers can only be called from browser',
      );
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size)
      queryParams.append('page_size', params.page_size.toString());
    if (params?.search) queryParams.append('search', params.search);

    const queryString = queryParams.toString();
    const endpoint = `/api/v0/outreach-manager/unapproved-influencers${queryString ? `?${queryString}` : ''}`;

    console.log(`📞 Client Service: Making API call to ${endpoint}`);

    const response =
      await nextjsApiClient.get<UnapprovedInfluencersResponse>(endpoint);

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    console.log(
      `✅ Client Service: Successfully fetched ${response.data.influencers?.length || 0} unapproved influencers`,
    );
    return response.data;
  } catch (error) {
    console.error(
      '💥 Client Service: Error in getUnapprovedInfluencers:',
      error,
    );
    throw error;
  }
}
