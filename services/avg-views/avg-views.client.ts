// src/services/avg-views/avg-views.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  UpdateAverageViewsRequest,
  UpdateAverageViewsResponse
} from '@/types/campaign-influencers';

const API_VERSION = '/api/v0';

export async function updateInfluencerAverageViews(
  influencerId: string,
  averageViews: number | null
): Promise<UpdateAverageViewsResponse> {
  console.log('🚀 Client Service: updateInfluencerAverageViews called');
  console.log('📋 Parameters:', { influencerId, averageViews });
  
  try {
    if (typeof window === 'undefined') {
      console.log('❌ Client Service: Called from server side');
      throw new Error('updateInfluencerAverageViews can only be called from browser');
    }
    
    // Check token exists
    const token = localStorage.getItem('accessToken');
    console.log('🔐 Client Service: Token check:', token ? 'Token found' : 'No token found');
    
    if (!token) {
      console.log('❌ Client Service: No authentication token found');
      throw new Error('No authentication token found');
    }
    
    console.log('📝 Client Service: Updating average views for influencer:', influencerId);
    console.log('📊 Client Service: New average views value:', averageViews);
    
    const requestData: UpdateAverageViewsRequest = {
      average_views: averageViews
    };
    console.log('📋 Client Service: Request data prepared:', requestData);
    
    const endpoint = API_VERSION + ENDPOINTS.CAMPAIGN_INFLUENCERS.UPDATE_AVERAGE_VIEWS(influencerId);
    console.log('🌐 Client Service: API endpoint:', endpoint);
    console.log('🌐 Client Service: Full URL will be:', window.location.origin + endpoint);

    console.log('🔄 Client Service: Making PUT request...');
    const response = await nextjsApiClient.put<UpdateAverageViewsResponse>(
      endpoint, 
      requestData
    );
    
    console.log('📨 Client Service: Response received:', {
      hasResponse: !!response,
      hasData: !!response?.data,
      hasError: !!response?.error,
      responseKeys: response ? Object.keys(response) : 'No response'
    });
    
    if (response?.error) {
      console.log('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message || 'API returned an error');
    }
    
    if (!response?.data) {
      console.log('❌ Client Service: No data in response');
      console.log('📋 Client Service: Full response:', response);
      throw new Error('Failed to update average views - no data returned');
    }
    
    console.log('✅ Client Service: Average views updated successfully');
    console.log('📊 Client Service: Success response data:', {
      success: response.data.success,
      hasData: !!response.data.data,
      message: response.data.message
    });
    
    return response.data;
  } catch (error) {
    console.log('💥 Client Service: Error in updateInfluencerAverageViews');
    console.log('🔍 Client Service: Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    // If it's a network error or API error, provide more context
    if (error instanceof Error && error.message.includes('500')) {
      console.log('🔍 Client Service: Server error detected');
    } else if (error instanceof Error && error.message.includes('404')) {
      console.log('🔍 Client Service: Not found error detected');
    }
    
    throw error;
  }
}