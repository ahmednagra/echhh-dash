// src/services/assigned-influencers/assigned-influencers.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  UpdateAssignedInfluencerNotesRequest,
  UpdateAssignedInfluencerNotesResponse
} from '@/types/assigned-influencers';

export async function updateAssignedInfluencerNotesServer(
  id: string,
  data: UpdateAssignedInfluencerNotesRequest,
  authToken?: string
): Promise<UpdateAssignedInfluencerNotesResponse> {
  try {
    
    const endpoint = ENDPOINTS.ASSIGNED_INFLUENCERS.UPDATE_NOTES(id);
    
    const response = await serverApiClient.patch<UpdateAssignedInfluencerNotesResponse>(
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
    
    return response.data;
  } catch (error) {
    console.error(`💥 Server Service: Error updating assigned influencer notes for ${id}:`, error);
    throw error;
  }
}