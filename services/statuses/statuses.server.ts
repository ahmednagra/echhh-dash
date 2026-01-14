// src/services/statuses/statuses.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Status, StatusesResponse } from '@/types/statuses';

/**
 * Get statuses from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getStatusesServer(
  model: string = 'list_member',
  authToken?: string
): Promise<Status[]> {
  try {
    console.log(`Server: Fetching statuses for model ${model}`);
    
    const endpoint = ENDPOINTS.STATUSES.BY_MODEL(model);
    
    const response = await serverApiClient.get<Status[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching statuses:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No statuses data received from FastAPI');
      return [];
    }
    
    console.log(`Server: Statuses fetched successfully: ${response.data.length} statuses`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching statuses for model ${model}:`, error);
    throw error;
  }
}

/**
 * Get list member statuses specifically (server-side)
 */
export async function getListMemberStatusesServer(authToken?: string): Promise<Status[]> {
  return getStatusesServer('list_member', authToken);
}