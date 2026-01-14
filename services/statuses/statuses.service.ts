// src/services/statuses/statuses.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { Status, filterAllowedStatuses } from '@/types/statuses';

/**
 * Get statuses from Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 */
export async function getStatuses(model: string): Promise<Status[]> {
  try {
    
    const endpoint = `/api/v0/statuses/model/${model}`;
    
    const response = await nextjsApiClient.get<Status[]>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No statuses data received');
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getStatuses:', error);
    
    // Enhanced error logging
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
 * Get list member statuses specifically (client-side)
 * Returns only the allowed statuses for agent dashboard
 */
export async function getStatusList(modal: string): Promise<Status[]> {
  try {
    
    const allStatuses = await getStatuses(modal);
    const allowedStatuses = filterAllowedStatuses(allStatuses);

    return allowedStatuses;
  } catch (error) {
    console.error('💥 Client Service: Error in getCampaignInfluencersStatuses:', error);
    throw error;
  }
}