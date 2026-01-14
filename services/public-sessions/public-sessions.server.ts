// src/services/public-sessions/public-sessions.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  CreatePublicSessionRequest,
  PublicSessionData
} from '@/types/public-sessions';

export async function createPublicSessionServer(
  data: CreatePublicSessionRequest,
  authToken?: string
): Promise<PublicSessionData> {
  try {
    
    const endpoint = ENDPOINTS.PUBLIC_SESSIONS.CREATE;
    
    const response = await serverApiClient.post<PublicSessionData>(
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
    console.error('Server Service: Error creating public session:', error);
    throw error;
  }
}