// src/services/assigned-influencers/assigned-influencers.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  UpdateAssignedInfluencerNotesRequest,
  UpdateAssignedInfluencerNotesResponse
} from '@/types/assigned-influencers';

const API_VERSION = '/api/v0';

export async function updateAssignedInfluencerNotes(
  id: string,
  data: UpdateAssignedInfluencerNotesRequest
): Promise<UpdateAssignedInfluencerNotesResponse> {
  try {
    
    if (typeof window === 'undefined') {
      throw new Error('updateAssignedInfluencerNotes can only be called from browser');
    }
    
    // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.ASSIGNED_INFLUENCERS.UPDATE_NOTES(id);

    const response = await nextjsApiClient.patch<UpdateAssignedInfluencerNotesResponse>(
      endpoint, 
      data
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to update assigned influencer notes');
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in updateAssignedInfluencerNotes:', error);
    throw error;
  }
}