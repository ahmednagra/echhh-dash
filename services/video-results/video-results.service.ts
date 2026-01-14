// src/services/video-results/video-results.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { 
  VideoResult,
  CreateVideoResultRequest,
  CreateVideoResultResponse,
  UpdateVideoResultRequest,
  UpdateVideoResultResponse,
  GetVideoResultsResponse
} from '@/types/user-detailed-info';

/**
 * Create a new video result via Next.js API route (client-side)
 */
export async function createVideoResult(
  data: CreateVideoResultRequest
): Promise<VideoResult> {
  try {
    console.log(`🚀 Video Results Service: Creating video result for campaign ${data.campaign_id}`);
    console.log('📋 Video Results Service: Data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Video Results Service: Not in browser environment');
      throw new Error('createVideoResult can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Video Results Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/posts`;
    console.log(`📞 Video Results Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<CreateVideoResultResponse>(endpoint, data);
    
    console.log('📦 Video Results Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Video Results Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Video Results Service: No valid video result data received');
      throw new Error(response.data?.error || 'Failed to create video result');
    }
    
    console.log(`✅ Video Results Service: Successfully created video result`);
    console.log('📊 Video Results Service: Created data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Video Results Service: Error in createVideoResult:', error);
    
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
 * Get video results for a campaign via Next.js API route (client-side)
 */
export async function getVideoResults(
  campaignId: string,
  page: number = 1,
  limit: number = 200
): Promise<VideoResult[]> {
  try {
    console.log(`🚀 Video Results Service: Fetching video results for campaign ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Video Results Service: Not in browser environment');
      throw new Error('getVideoResults can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Video Results Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/posts/campaign/${campaignId}?page=${page}&limit=${limit}`;
    console.log(`📞 Video Results Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<GetVideoResultsResponse>(endpoint);
    
    console.log('📦 Video Results Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Video Results Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Video Results Service: No valid video results data received');
      throw new Error(response.data?.error || 'Failed to fetch video results');
    }
    
    console.log(`✅ Video Results Service: Successfully fetched ${response.data.results.length} video results`);
    
    return response.data.results;
  } catch (error) {
    console.error('💥 Video Results Service: Error in getVideoResults:', error);
    
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
 * Update a video result via Next.js API route (client-side)
 */
export async function updateVideoResult(
  resultId: string,
  data: UpdateVideoResultRequest
): Promise<VideoResult> {
  try {
    console.log(`🚀 Video Results Service: Updating video result ${resultId}`);
    console.log('📋 Video Results Service: Update data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Video Results Service: Not in browser environment');
      throw new Error('updateVideoResult can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Video Results Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/posts/${resultId}`;
    console.log(`📞 Video Results Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put<UpdateVideoResultResponse>(endpoint, data);
    
    console.log('📦 Video Results Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Video Results Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Video Results Service: No valid updated video result data received');
      throw new Error(response.data?.error || 'Failed to update video result');
    }
    
    console.log(`✅ Video Results Service: Successfully updated video result ${resultId}`);
    console.log('📊 Video Results Service: Updated data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Video Results Service: Error in updateVideoResult:', error);
    
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
 * Batch update request interface
 */
interface BatchUpdateRequest {
  result_id: string;
  update_data: UpdateVideoResultRequest;
}

/**
 * Update all video results for a campaign with prepared data (client-side)
 */
export async function updateAllVideoResultsWithData(
  campaignId: string,
  updatesData: BatchUpdateRequest[]
): Promise<VideoResult[]> {
  try {
    console.log(`🚀 Video Results Service: Batch updating ${updatesData.length} videos for campaign ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Video Results Service: Not in browser environment');
      throw new Error('updateAllVideoResultsWithData can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Video Results Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/posts/campaign/${campaignId}/update-all`;
    console.log(`📞 Video Results Service: Making API call to ${endpoint}`);
    console.log(`📊 Video Results Service: Sending ${updatesData.length} updates`);
    
    // Send the batch update request
    const requestBody = {
      updates: updatesData
    };
    
    const response = await nextjsApiClient.put<GetVideoResultsResponse>(endpoint, requestBody);
    
    console.log('📦 Video Results Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Video Results Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Video Results Service: No valid updated video results data received');
      throw new Error(response.data?.error || 'Failed to update all video results');
    }
    
    // console.log(`✅ Video Results Service: Successfully batch updated ${response.data.results.length} video results`);
    
    return response.data.results;
  } catch (error) {
    console.error('💥 Video Results Service: Error in updateAllVideoResultsWithData:', error);
    
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
 * Delete a video result via Next.js API route (client-side)
 */
export async function deleteVideoResult(resultId: string): Promise<boolean> {
  try {
    console.log(`🚀 Video Results Service: Deleting video result ${resultId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Video Results Service: Not in browser environment');
      throw new Error('deleteVideoResult can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Video Results Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/posts/${resultId}`;
    console.log(`📞 Video Results Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.delete<{ success: boolean; error?: string }>(endpoint);
    
    console.log('📦 Video Results Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Video Results Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Video Results Service: Failed to delete video result');
      throw new Error(response.data?.error || 'Failed to delete video result');
    }
    
    console.log(`✅ Video Results Service: Successfully deleted video result ${resultId}`);
    
    return true;
  } catch (error) {
    console.error('💥 Video Results Service: Error in deleteVideoResult:', error);
    
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