// src/services/campaign/campaign.server.ts - Updated with correct endpoints
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignsResponse,
  CampaignResponse,
  DeleteCampaignResponse,
  GetCampaignsRequest,
  DeleteType
} from '@/types/campaign';

/**
 * Create campaign in FastAPI backend (server-side)
 */
export async function createCampaignServer(
  data: CreateCampaignRequest,
  authToken?: string
): Promise<Campaign> {
  try {
    console.log('🚀 Campaign Server: Creating campaign');
    console.log('📋 Campaign Server: Data:', data);
    
    const endpoint = ENDPOINTS.CAMPAIGNS.CREATE;
    
    const response = await serverApiClient.post<Campaign>(
      endpoint,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Campaign Server: FastAPI Error creating campaign:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Campaign Server: No campaign data received from FastAPI');
      throw new Error('No campaign data received');
    }
    
    console.log('✅ Campaign Server: Campaign created successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('💥 Campaign Server: Error creating campaign:', error);
    throw error;
  }
}

/**
 * Get campaigns for a specific company from FastAPI backend (server-side)
 */
export async function getCompanyCampaignsServer(
  companyId: string,
  filters?: GetCampaignsRequest,
  authToken?: string
): Promise<Campaign[]> {
  try {
    
    let endpoint = ENDPOINTS.CAMPAIGNS.COMPANY(companyId);
    
    // Add query parameters if filters provided
    if (filters) {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
      
      if (filters.filters) {
        if (filters.filters.status_id) queryParams.append('status_id', filters.filters.status_id);
        if (filters.filters.category_id) queryParams.append('category_id', filters.filters.category_id);
        if (filters.filters.include_deleted) queryParams.append('include_deleted', filters.filters.include_deleted.toString());
        if (filters.filters.search) queryParams.append('search', filters.filters.search);
        if (filters.filters.date_from) queryParams.append('date_from', filters.filters.date_from);
        if (filters.filters.date_to) queryParams.append('date_to', filters.filters.date_to);
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint = `${endpoint}?${queryString}`;
      }
    }
    
    const response = await serverApiClient.get<Campaign[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Campaign Server: FastAPI Error fetching company campaigns:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Campaign Server: No company campaigns data received from FastAPI');
      return [];
    }
    
    console.log(`✅ Campaign Server: Company campaigns fetched successfully: ${response.data.length} items`);
    return response.data;
  } catch (error) {
    console.error(`💥 Campaign Server: Error fetching campaigns for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Get deleted campaigns for a specific company from FastAPI backend (server-side)
 */
export async function getCompanyDeletedCampaignsServer(
  companyId: string,
  filters?: GetCampaignsRequest,
  authToken?: string
): Promise<Campaign[]> {
  try {
    
    let endpoint = ENDPOINTS.CAMPAIGNS.COMPANY_DELETED(companyId);
    
    // Add query parameters if filters provided
    if (filters) {
      const queryParams = new URLSearchParams();
      
      if (filters.page) queryParams.append('page', filters.page.toString());
      if (filters.limit) queryParams.append('limit', filters.limit.toString());
      if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
      if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);
      
      if (filters.filters) {
        if (filters.filters.status_id) queryParams.append('status_id', filters.filters.status_id);
        if (filters.filters.category_id) queryParams.append('category_id', filters.filters.category_id);
        if (filters.filters.search) queryParams.append('search', filters.filters.search);
        if (filters.filters.date_from) queryParams.append('date_from', filters.filters.date_from);
        if (filters.filters.date_to) queryParams.append('date_to', filters.filters.date_to);
      }
      
      const queryString = queryParams.toString();
      if (queryString) {
        endpoint = `${endpoint}?${queryString}`;
      }
    }
    
    const response = await serverApiClient.get<Campaign[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Campaign Server: FastAPI Error fetching deleted campaigns:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Campaign Server: No deleted campaigns data received from FastAPI');
      return [];
    }
    
    console.log(`✅ Campaign Server: Deleted campaigns fetched successfully: ${response.data.length} items`);
    return response.data;
  } catch (error) {
    console.error(`💥 Campaign Server: Error fetching deleted campaigns for company ${companyId}:`, error);
    throw error;
  }
}

/**
 * Get single campaign by ID from FastAPI backend (server-side)
 */
export async function getCampaignByIdServer(
  campaignId: string,
  authToken?: string
): Promise<Campaign | null> {
  try {
    console.log(`🚀 Campaign Server: Fetching campaign ${campaignId}`);
    
    const endpoint = ENDPOINTS.CAMPAIGNS.DETAIL(campaignId);
    
    const response = await serverApiClient.get<Campaign>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      // Handle specific error cases
      if (response.error.message && response.error.message.includes('UUID')) {
        console.warn(`⚠️ Campaign Server: Invalid UUID format: ${campaignId}`);
        return null;
      }
      
      if (response.error.message && response.error.message.includes('404')) {
        console.warn(`⚠️ Campaign Server: Campaign not found: ${campaignId}`);
        return null;
      }
      
      console.error('❌ Campaign Server: FastAPI Error fetching campaign:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Campaign Server: No campaign data received from FastAPI');
      return null;
    }
    
    console.log('✅ Campaign Server: Campaign fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    // Check if it's a UUID parsing error from the server
    if (error instanceof Error && 
        (error.message.includes('UUID') || 
         error.message.includes('uuid') || 
         error.message.includes('expected length 32'))) {
      console.warn(`⚠️ Campaign Server: UUID parsing error for ID ${campaignId}:`, error);
      return null; // Return null for invalid UUID instead of throwing
    }
    
    // For 404 errors (not found), return null instead of throwing
    if (error instanceof Error && error.message.includes('404')) {
      console.warn(`⚠️ Campaign Server: Campaign not found with ID ${campaignId}`);
      return null;
    }
    
    console.error(`💥 Campaign Server: Error fetching campaign ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Update campaign in FastAPI backend (server-side)
 */
export async function updateCampaignServer(
  campaignId: string,
  updateData: UpdateCampaignRequest,
  authToken?: string
): Promise<Campaign> {
  try {
    console.log(`🚀 Campaign Server: Updating campaign ${campaignId}`);
    console.log('📋 Campaign Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.CAMPAIGNS.UPDATE(campaignId);
    
    const response = await serverApiClient.put<Campaign>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Campaign Server: FastAPI Error updating campaign:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Campaign Server: No updated campaign data received from FastAPI');
      throw new Error('No updated campaign data received');
    }
    
    console.log('✅ Campaign Server: Campaign updated successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error(`💥 Campaign Server: Error updating campaign ${campaignId}:`, error);
    throw error;
  }
}

/**
 * Delete campaign in FastAPI backend (server-side) - supports soft, hard, and restore
 */
export async function deleteCampaignServer(
  campaignId: string,
  deleteType: DeleteType = 'soft',
  authToken?: string
): Promise<DeleteCampaignResponse> {
  try {
    console.log(`🚀 Campaign Server: ${deleteType} deleting campaign ${campaignId}`);
    
    let endpoint: string;
    let method: 'DELETE' | 'PATCH' = 'DELETE';
    
    switch (deleteType) {
      case 'soft':
        endpoint = ENDPOINTS.CAMPAIGNS.DELETE(campaignId);
        method = 'DELETE';
        break;
      case 'hard':
        endpoint = `${ENDPOINTS.CAMPAIGNS.DELETE(campaignId)}?type=hard`;
        method = 'DELETE';
        break;
      case 'restore':
        endpoint = ENDPOINTS.CAMPAIGNS.RESTORE(campaignId);
        method = 'PATCH';
        break;
      default:
        throw new Error('Invalid delete type');
    }
    
    const response = method === 'DELETE' 
      ? await serverApiClient.delete<DeleteCampaignResponse>(endpoint, {}, authToken)
      : await serverApiClient.patch<Campaign>(endpoint, {}, {}, authToken);
    
    if (response.error) {
      console.error(`❌ Campaign Server: FastAPI Error ${deleteType} deleting campaign:`, response.error);
      throw new Error(response.error.message);
    }
    
    let result: DeleteCampaignResponse;
    
    if (deleteType === 'restore' && response.data) {
      // For restore, we get the campaign back
      result = {
        success: true,
        message: 'Campaign restored successfully'
      };
    } else {
      // For delete operations, we get a success message
      result = response.data as DeleteCampaignResponse || {
        success: true,
        message: `Campaign ${deleteType} deleted successfully`
      };
    }
    
    console.log(`✅ Campaign Server: Campaign ${deleteType} operation completed successfully`);
    return result;
  } catch (error) {
    console.error(`💥 Campaign Server: Error ${deleteType} deleting campaign ${campaignId}:`, error);
    throw error;
  }
}