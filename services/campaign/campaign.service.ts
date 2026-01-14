// src/services/campaign/campaign.service.ts
// Client-side service for calling Next.js API routes

import { nextjsApiClient } from '@/lib/nextjs-api';
import { getStoredCompany } from '@/services/auth/auth.utils';
import { 
  Campaign,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignResponse,
  CampaignsResponse,
  DeleteCampaignResponse,
  GetCampaignsRequest,
  DeleteType
} from '@/types/campaign';

/**
 * Create a new campaign via Next.js API route (client-side)
 */
export async function createCampaign(
  data: CreateCampaignRequest
): Promise<Campaign> {
  try {
    console.log('🚀 Campaign Service: Creating campaign');
    console.log('📋 Campaign Service: Data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('createCampaign can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/campaigns`;
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.post<CampaignResponse>(endpoint, data);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Campaign Service: No valid campaign data received');
      throw new Error(response.data?.error || 'Failed to create campaign');
    }
    
    console.log('✅ Campaign Service: Successfully created campaign');
    console.log('📊 Campaign Service: Created data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error('💥 Campaign Service: Error in createCampaign:', error);
    
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
 * Get all campaigns via Next.js API route (client-side)
 */
export async function getCampaigns(
  filters?: GetCampaignsRequest
): Promise<Campaign[]> {
  try {
    console.log('🚀 Campaign Service: Fetching all campaigns');
    console.log('📋 Campaign Service: Filters:', filters);
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('getCampaigns can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    let endpoint = `/api/v0/campaigns`;
    
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
        if (filters.filters.company_id) queryParams.append('company_id', filters.filters.company_id);
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
    
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<CampaignsResponse>(endpoint);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Campaign Service: No valid campaigns data received');
      throw new Error(response.data?.error || 'Failed to fetch campaigns');
    }
    
    console.log(`✅ Campaign Service: Successfully fetched ${response.data.data?.length || 0} campaigns`);
    
    return response.data.data || [];
  } catch (error) {
    console.error('💥 Campaign Service: Error in getCampaigns:', error);
    
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
 * Get campaigns for a specific company via Next.js API route (client-side)
 */
export async function getCompanyCampaigns(
  companyId: string,
  filters?: GetCampaignsRequest
): Promise<Campaign[]> {
  try {
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('getCompanyCampaigns can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');

    if (!token) {
      throw new Error('No authentication token found');
    }
    
    let endpoint = `/api/v0/campaigns/company/${companyId}`;
    
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
    
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<CampaignsResponse>(endpoint);
    console.log(`📞 Campaign Service: Making API call to 2 ${response}`);
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Campaign Service: No valid company campaigns data received');
      throw new Error(response.data?.error || 'Failed to fetch company campaigns');
    }
    
    console.log(`✅ Campaign Service: Successfully fetched ${response.data.data?.length || 0} company campaigns`);
    
    return response.data.data || [];
  } catch (error) {
    console.error(`💥 Campaign Service: Error in getCompanyCampaigns for company ${companyId}:`, error);
    
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
 * Get a campaign by ID via Next.js API route (client-side)
 */
export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  try {
    console.log(`🚀 Campaign Service: Fetching campaign ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('getCampaignById can only be called from browser');
    }
    
    // Basic UUID validation before making the API call
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(campaignId)) {
      console.warn(`⚠️ Campaign Service: Invalid UUID format for campaign ID: ${campaignId}`);
      return null;
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/campaigns/${campaignId}`;
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<CampaignResponse>(endpoint);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      // Handle specific error cases
      if (response.error.message && response.error.message.includes('UUID')) {
        console.warn(`⚠️ Campaign Service: Invalid UUID format: ${campaignId}`);
        return null;
      }
      
      if (response.error.message && response.error.message.includes('404')) {
        console.warn(`⚠️ Campaign Service: Campaign not found: ${campaignId}`);
        return null;
      }
      
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Campaign Service: No valid campaign data received');
      return null;
    }
    
    console.log('✅ Campaign Service: Successfully fetched campaign');
    console.log('📊 Campaign Service: Campaign data:', response.data.data);
    
    return response.data.data || null;
  } catch (error) {
    // Check if it's a UUID parsing error from the server
    if (error instanceof Error && 
        (error.message.includes('UUID') || 
         error.message.includes('uuid') || 
         error.message.includes('expected length 32'))) {
      console.warn(`⚠️ Campaign Service: UUID parsing error for ID ${campaignId}:`, error);
      return null; // Return null for invalid UUID instead of throwing
    }
    
    // For 404 errors (not found), return null instead of throwing
    if (error instanceof Error && error.message.includes('404')) {
      console.warn(`⚠️ Campaign Service: Campaign not found with ID ${campaignId}`);
      return null;
    }
    
    console.error(`💥 Campaign Service: Error in getCampaignById for ${campaignId}:`, error);
    
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
 * Update a campaign via Next.js API route (client-side)
 */
export async function updateCampaign(
  campaignId: string,
  data: UpdateCampaignRequest
): Promise<Campaign> {
  try {
    console.log(`🚀 Campaign Service: Updating campaign ${campaignId}`);
    console.log('📋 Campaign Service: Update data:', data);
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('updateCampaign can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = `/api/v0/campaigns/${campaignId}`;
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.put<CampaignResponse>(endpoint, data);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success || !response.data.data) {
      console.warn('⚠️ Campaign Service: No valid updated campaign data received');
      throw new Error(response.data?.error || 'Failed to update campaign');
    }
    
    console.log(`✅ Campaign Service: Successfully updated campaign ${campaignId}`);
    console.log('📊 Campaign Service: Updated data:', response.data.data);
    
    return response.data.data;
  } catch (error) {
    console.error(`💥 Campaign Service: Error in updateCampaign for ${campaignId}:`, error);
    
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
 * Delete a campaign via Next.js API route (client-side)
 * Supports soft delete, hard delete, and restore operations
 */
export async function deleteCampaign(
  campaignId: string,
  deleteType: DeleteType = 'soft'
): Promise<DeleteCampaignResponse> {
  try {
    console.log(`🚀 Campaign Service: ${deleteType} deleting campaign ${campaignId}`);
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('deleteCampaign can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    let endpoint = `/api/v0/campaigns/${campaignId}`;
    
    // Modify endpoint based on delete type
    switch (deleteType) {
      case 'hard':
        endpoint = `/api/v0/campaigns/${campaignId}?type=hard`;
        break;
      case 'restore':
        endpoint = `/api/v0/campaigns/${campaignId}?type=restore`;
        break;
      case 'soft':
      default:
        endpoint = `/api/v0/campaigns/${campaignId}?type=soft`;
        break;
    }
    
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.delete<DeleteCampaignResponse>(endpoint);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Campaign Service: Failed to delete campaign');
      throw new Error(response.data?.error || `Failed to ${deleteType} delete campaign`);
    }
    
    console.log(`✅ Campaign Service: Successfully ${deleteType} deleted campaign ${campaignId}`);
    
    return response.data;
  } catch (error) {
    console.error(`💥 Campaign Service: Error in deleteCampaign (${deleteType}) for ${campaignId}:`, error);
    
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
 * Get deleted campaigns for a specific company via Next.js API route (client-side)
 */
export async function getDeletedCampaigns(companyId?: string): Promise<Campaign[]> {
  try {
    console.log('🚀 Campaign Service: Fetching deleted campaigns');
    
    if (typeof window === 'undefined') {
      console.error('❌ Campaign Service: Not in browser environment');
      throw new Error('getDeletedCampaigns can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Campaign Service: Token check:', token ? 'Token exists' : 'No token found');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Get company ID from parameter or stored company
    const targetCompanyId = companyId || getStoredCompany()?.id;
    
    if (!targetCompanyId) {
      throw new Error('Company ID not found');
    }
    
    const endpoint = `/api/v0/campaigns/company/${targetCompanyId}/deleted`;
    console.log(`📞 Campaign Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<CampaignsResponse>(endpoint);
    
    console.log('📦 Campaign Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status,
      success: response.data?.success
    });
    
    if (response.error) {
      console.error('❌ Campaign Service: API returned error:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data || !response.data.success) {
      console.warn('⚠️ Campaign Service: No valid deleted campaigns data received');
      throw new Error(response.data?.error || 'Failed to fetch deleted campaigns');
    }
    
    console.log(`✅ Campaign Service: Successfully fetched ${response.data.data?.length || 0} deleted campaigns`);
    
    return response.data.data || [];
  } catch (error) {
    console.error('💥 Campaign Service: Error in getDeletedCampaigns:', error);
    
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

// Convenience functions for specific delete operations
export const softDeleteCampaign = (campaignId: string) => 
  deleteCampaign(campaignId, 'soft');

export const hardDeleteCampaign = (campaignId: string) => 
  deleteCampaign(campaignId, 'hard');

export const restoreCampaign = (campaignId: string) => 
  deleteCampaign(campaignId, 'restore');

export type { Campaign };
