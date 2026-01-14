// src/services/video-results/video-results.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  VideoResult,
  CreateVideoResultRequest,
  UpdateVideoResultRequest,
  GetVideoResultsResponse
} from '@/types/user-detailed-info';

/**
 * Create video result in FastAPI backend (server-side)
 */
export async function createVideoResultServer(
  data: CreateVideoResultRequest,
  authToken?: string
): Promise<VideoResult> {
  try {
    console.log('Server: Creating video result');
    console.log('Server: Data:', data);
    
    const endpoint = ENDPOINTS.RESULTS.CREATE;
    
    const response = await serverApiClient.post<VideoResult>(
      endpoint,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating video result:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No video result data received from FastAPI');
      throw new Error('No video result data received');
    }
    
    console.log('Server: Video result created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating video result:', error);
    throw error;
  }
}

/**
 * Get video results for campaign from FastAPI backend (server-side)
 */
export async function getVideoResultsServer(
  campaignId: string,
  page: number = 1,
  limit: number = 200,
  authToken?: string
): Promise<GetVideoResultsResponse> {
  try {
    console.log(`Server: Fetching video results for campaignnn ${campaignId}`);
    
    const endpoint = ENDPOINTS.RESULTS.BY_CAMPAIGN(campaignId);
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    const response = await serverApiClient.get<GetVideoResultsResponse>(
      `${endpoint}?${queryParams}`,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching video results:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No video results data received from FastAPI');
      throw new Error('No video results data received');
    }
    
    console.log(`Server: Video results fetched successfully: ${response.data.results?.length || 0} items`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching video results for campaign ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Update video result in FastAPI backend (server-side)
 */
export async function updateVideoResultServer(
  resultId: string,
  updateData: UpdateVideoResultRequest,
  authToken?: string
): Promise<VideoResult> {
  try {
    console.log(`Server: Updating video result ${resultId}`);
    console.log('Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.RESULTS.UPDATE(resultId);
    
    const response = await serverApiClient.put<VideoResult>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating video result:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No updated video result data received from FastAPI');
      throw new Error('No updated video result data received');
    }
    
    console.log('Server: Video result updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error updating video result ${resultId}:`, error);
    throw error;
  }
}

interface BatchUpdateRequest {
  result_id: string;
  update_data: UpdateVideoResultRequest;
}

/**
 * Update all video results for campaign with data (server-side)
 */
export async function updateAllVideoResultsWithDataServer(
  campaignId: string,
  updatesData: BatchUpdateRequest[],
  authToken?: string
): Promise<GetVideoResultsResponse> {
  try {
    console.log(`Server: Batch updating ${updatesData.length} video results for campaign ${campaignId}`);
    
    const endpoint = ENDPOINTS.RESULTS.UPDATE_ALL_BY_CAMPAIGN(campaignId);
    
    // Prepare the request body in the format your FastAPI backend expects
    const requestBody = {
      updates: updatesData
    };
    
    const response = await serverApiClient.put<GetVideoResultsResponse>(
      endpoint,
      requestBody, // ← Now sending actual batch update data
      {},
      authToken
    );

    console.log('Server: Batch update response:', response);
    
    if (response.error) {
      console.error('Server: FastAPI Error batch updating video results:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No batch updated video results data received from FastAPI');
      throw new Error('No batch updated video results data received');
    }
    
    console.log(`Server: Batch update successful: ${response.data.results?.length || 0} items updated`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error batch updating video results for campaign ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Delete video result in FastAPI backend (server-side)
 */
export async function deleteVideoResultServer(
  resultId: string,
  authToken?: string
): Promise<boolean> {
  try {
    console.log(`Server: Deleting video result ${resultId}`);
    
    const endpoint = ENDPOINTS.RESULTS.DELETE(resultId);
    
    const response = await serverApiClient.delete<{ success: boolean }>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error deleting video result:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('Server: Video result deleted successfully:', resultId);
    return true;
  } catch (error) {
    console.error(`Server: Error deleting video result ${resultId}:`, error);
    throw error;
  }
}

/**
 * Get single video result by ID from FastAPI backend (server-side)
 */
export async function getVideoResultServer(
  resultId: string,
  authToken?: string
): Promise<VideoResult> {
  try {
    console.log(`Server: Fetching video result ${resultId}`);
    
    const endpoint = ENDPOINTS.RESULTS.DETAIL(resultId);
    
    const response = await serverApiClient.get<VideoResult>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching video result:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No video result data received from FastAPI');
      throw new Error('No video result data received');
    }
    
    console.log('Server: Video result fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching video result ${resultId}:`, error);
    throw error;
  }
}