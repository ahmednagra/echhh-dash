// src/services/statuses/statuses.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Status, StatusesResponse } from '@/types/statuses';

/**
 * Get statuses from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 * 
 * @param model - The model name (e.g., 'campaign_influencer', 'list_member')
 * @param authToken - Optional authentication token
 * @param column - Optional column filter for applies_to_field (e.g., 'status_id', 'client_review_status_id')
 * @returns Array of Status objects
 */
export async function getStatusesServer(
  model: string = 'list_member',
  authToken?: string,
  column?: string
): Promise<Status[]> {
  try {
    console.log(`Server: Fetching statuses for model="${model}"${column ? `, column="${column}"` : ''}`);
    
    // Build endpoint with optional column query parameter
    let endpoint = ENDPOINTS.STATUSES.BY_MODEL(model);
    if (column) {
      endpoint = `${endpoint}?column=${encodeURIComponent(column)}`;
    }
    
    console.log(`Server: Calling endpoint: ${endpoint}`);
    
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
 * 
 * @param authToken - Optional authentication token
 * @param column - Optional column filter for applies_to_field
 * @returns Array of Status objects for list_member model
 */
export async function getListMemberStatusesServer(
  authToken?: string,
  column?: string
): Promise<Status[]> {
  return getStatusesServer('list_member', authToken, column);
}

/**
 * Get campaign influencer statuses (server-side)
 * 
 * @param authToken - Optional authentication token
 * @param column - Optional column filter (e.g., 'status_id', 'client_review_status_id', 'shortlisted_status_id')
 * @returns Array of Status objects for campaign_influencer model
 */
export async function getCampaignInfluencerStatusesServer(
  authToken?: string,
  column?: string
): Promise<Status[]> {
  return getStatusesServer('campaign_influencer', authToken, column);
}