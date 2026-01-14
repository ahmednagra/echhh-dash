// src\services\statuses\statuses.client.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { Status, filterAllowedStatuses, sortStatusesByDisplayOrder, filterActiveStatuses } from '@/types/statuses';

/**
 * Get statuses from Next.js API route (client-side)
 * This calls the Next.js API route which then calls FastAPI
 * 
 * @param model - The model name (e.g., 'campaign_influencer', 'list_member')
 * @param column - Optional column filter for applies_to_field (e.g., 'status_id', 'client_review_status_id')
 * @returns Array of Status objects
 * 
 * Examples:
 * - getStatuses('campaign_influencer') - Get all statuses for campaign_influencer model
 * - getStatuses('campaign_influencer', 'status_id') - Get only status_id statuses
 * - getStatuses('campaign_influencer', 'client_review_status_id') - Get only client review statuses
 */
export async function getStatuses(model: string, column?: string): Promise<Status[]> {
  try {
    // Build endpoint with optional column query parameter
    let endpoint = `/api/v0/statuses/model/${model}`;
    if (column) {
      endpoint = `${endpoint}?column=${encodeURIComponent(column)}`;
    }
    
    console.log(`📡 Client Service: Fetching statuses from ${endpoint}`);
    
    const response = await nextjsApiClient.get<Status[]>(endpoint);
    
    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Client Service: No statuses data received');
      return [];
    }
    
    console.log(`✅ Client Service: Fetched ${response.data.length} statuses`);
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
 * 
 * @param model - The model name
 * @param column - Optional column filter for applies_to_field
 * @returns Array of allowed Status objects
 */
export async function getStatusList(model: string, column?: string): Promise<Status[]> {
  try {
    const allStatuses = await getStatuses(model, column);
    const allowedStatuses = filterAllowedStatuses(allStatuses);
    
    // Sort by display_order if available
    return sortStatusesByDisplayOrder(allowedStatuses);
  } catch (error) {
    console.error('💥 Client Service: Error in getStatusList:', error);
    throw error;
  }
}

/**
 * Get campaign influencer statuses by column type (client-side)
 * 
 * @param columnType - The column type: 'status_id', 'client_review_status_id', or 'shortlisted_status_id'
 * @returns Array of Status objects for the specified column
 */
export async function getCampaignInfluencerStatusesByColumn(
  columnType: 'status_id' | 'client_review_status_id' | 'shortlisted_status_id'
): Promise<Status[]> {
  try {
    console.log(`📡 Client Service: Fetching campaign_influencer statuses for column=${columnType}`);
    
    const statuses = await getStatuses('campaign_influencer', columnType);
    
    // Filter for active statuses and sort by display order
    const activeStatuses = filterActiveStatuses(statuses);
    return sortStatusesByDisplayOrder(activeStatuses);
  } catch (error) {
    console.error(`💥 Client Service: Error fetching statuses for column ${columnType}:`, error);
    throw error;
  }
}

/**
 * Get main status options for campaign influencers (client-side)
 * These are the primary workflow statuses (discovered, contacted, completed, etc.)
 * 
 * @returns Array of Status objects for main workflow
 */
export async function getCampaignInfluencerMainStatuses(): Promise<Status[]> {
  return getCampaignInfluencerStatusesByColumn('status_id');
}

/**
 * Get client review status options for campaign influencers (client-side)
 * These are the client approval workflow statuses (pending_review, approved, dropped, etc.)
 * 
 * @returns Array of Status objects for client review workflow
 */
export async function getCampaignInfluencerClientReviewStatuses(): Promise<Status[]> {
  return getCampaignInfluencerStatusesByColumn('client_review_status_id');
}

/**
 * Get shortlisted status options for campaign influencers (client-side)
 * These are the shortlisting workflow statuses
 * 
 * @returns Array of Status objects for shortlisting workflow
 */
export async function getCampaignInfluencerShortlistedStatuses(): Promise<Status[]> {
  return getCampaignInfluencerStatusesByColumn('shortlisted_status_id');
}