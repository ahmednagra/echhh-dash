// src/services/public-sessions/public-sessions.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  CreatePublicSessionRequest,
  PublicSessionData
} from '@/types/public-sessions';

const API_VERSION = '/api/v0';

export async function createPublicSession(
  data: CreatePublicSessionRequest
): Promise<PublicSessionData> {
  try {
    
    if (typeof window === 'undefined') {
      throw new Error('createPublicSession can only be called from browser');
    }
    
    // Check token exists (for validation only, nextjs-api.ts will handle adding to headers)
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.PUBLIC_SESSIONS.CREATE;

    const response = await nextjsApiClient.post<PublicSessionData>(
      endpoint, 
      data
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to create public session');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createPublicSession:', error);
    throw error;
  }
}