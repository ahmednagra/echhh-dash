// src/services/avg-views/avg-views.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  UpdateAverageViewsRequest,
  UpdateAverageViewsResponse
} from '@/types/campaign-influencers';

export async function updateCampaignInfluencerAverageViewsServer(
  influencerId: string,
  data: UpdateAverageViewsRequest,
  authToken?: string
): Promise<UpdateAverageViewsResponse> {
  console.log('Server Service: updateCampaignInfluencerAverageViewsServer called');
  console.log('Parameters:', { influencerId, data, hasToken: !!authToken });
  
  try {
    console.log('Server Service: Updating average views for influencer:', influencerId);
    
    // First, get the current influencer data to get the social_account_id
    const currentInfluencer = await getCampaignInfluencerByIdServer(influencerId, authToken);
    console.log('Server Service: Current influencer retrieved');
    
    if (!currentInfluencer.social_account?.id) {
      throw new Error('Social account ID not found for this influencer');
    }
    
    const socialAccountId = currentInfluencer.social_account.id;
    console.log('Server Service: Social account ID:', socialAccountId);
    
    // Update the average_views in the social_account.additional_metrics
    const updatedAdditionalMetrics = {
      ...currentInfluencer.social_account.additional_metrics,
      average_views: data.average_views
    };
    
    // Use the social accounts endpoint
    const endpoint = `/social-accounts/${socialAccountId}`;
    console.log('Server Service: Using social accounts endpoint:', endpoint);
    
    const updatePayload = {
      additional_metrics: updatedAdditionalMetrics
    };
    
    console.log('Server Service: Update payload:', {
      additional_metrics: {
        ...updatedAdditionalMetrics,
        average_views: data.average_views
      }
    });
    
    console.log('Server Service: Making PUT request to backend...');
    const response = await serverApiClient.put<any>(
      endpoint,
      updatePayload,
      {},
      authToken
    );
    
    console.log('Server Service: Response received from backend:', {
      hasResponse: !!response,
      hasData: !!response?.data,
      hasError: !!response?.error
    });
    
    if (response.error) {
      console.log('Server Service: Backend API error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.log('Server Service: No response data received from backend');
      throw new Error('No response data received');
    }
    
    console.log('Server Service: Average views updated successfully');
    
    // Return the updated influencer data in the expected format
    return {
      success: true,
      data: {
        ...currentInfluencer,
        social_account: {
          ...currentInfluencer.social_account,
          additional_metrics: updatedAdditionalMetrics
        }
      },
      message: 'Average views updated successfully'
    };
  } catch (error) {
    console.log('Server Service: Error updating average views');
    console.log('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    throw error;
  }
}

export async function getCampaignInfluencerByIdServer(
  influencerId: string,
  authToken?: string
): Promise<any> {
  console.log('Server Service: getCampaignInfluencerByIdServer called');
  console.log('Parameters:', { influencerId, hasToken: !!authToken });
  
  try {
    console.log('Server Service: Getting campaign influencer by ID:', influencerId);
    
    const endpoint = ENDPOINTS.CAMPAIGN_INFLUENCERS.DETAIL(influencerId);
    console.log('Server Service: GET endpoint:', endpoint);
    
    console.log('Server Service: Making GET request to backend...');
    const response = await serverApiClient.get<any>(
      endpoint,
      {},
      authToken
    );
    
    console.log('Server Service: GET response received:', {
      hasResponse: !!response,
      hasData: !!response?.data,
      hasError: !!response?.error
    });
    
    if (response.error) {
      console.log('Server Service: Backend GET API error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.log('Server Service: Campaign influencer not found');
      throw new Error('Campaign influencer not found');
    }
    
    console.log('Server Service: Campaign influencer found successfully');
    return response.data;
  } catch (error) {
    console.log('Server Service: Error getting campaign influencer');
    console.log('GET Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    throw error;
  }
}