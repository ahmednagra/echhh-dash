 // src/services/billing/feature/feature.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import {
  Feature,
  FeatureListResponse,
  FeatureDeleteResponse,
  CreateFeatureRequest,
  UpdateFeatureRequest,
  FeatureFilters,
} from '@/types/billing/features';


/**
 * Get paginated list of features with filters
 */
export async function getFeaturesServer(
  filters: FeatureFilters,
  authToken?: string
): Promise<FeatureListResponse> {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.unit_type && filters.unit_type !== 'all') params.append('unit_type', filters.unit_type);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.is_deleted !== undefined) params.append('is_deleted', filters.is_deleted.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_order) params.append('sort_order', filters.sort_order);

    const endpoint = `${ENDPOINTS.BILLING.FEATURES.LIST}?${params.toString()}`;
    
    const response = await serverApiClient.get<FeatureListResponse>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch features');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in getFeaturesServer:', error);
    throw error;
  }
}

/**
 * Get a single feature by ID
 */
export async function getFeatureByIdServer(
  featureId: string,
  authToken?: string
): Promise<Feature> {
  try {
    const endpoint = ENDPOINTS.BILLING.FEATURES.GET_BY_ID(featureId);
    
    const response = await serverApiClient.get<Feature>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch feature');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in getFeatureByIdServer:', error);
    throw error;
  }
}

/**
 * Create a new feature
 */
export async function createFeatureServer(
  data: CreateFeatureRequest,
  authToken?: string
): Promise<Feature> {
  try {
    const endpoint = ENDPOINTS.BILLING.FEATURES.CREATE;
    
    const response = await serverApiClient.post<Feature>(
      endpoint,
      data,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to create feature');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in createFeatureServer:', error);
    throw error;
  }
}

/**
 * Update an existing feature
 */
export async function updateFeatureServer(
  featureId: string,
  data: UpdateFeatureRequest,
  authToken?: string
): Promise<Feature> {
  try {
    const endpoint = ENDPOINTS.BILLING.FEATURES.UPDATE(featureId);
    
    const response = await serverApiClient.put<Feature>(
      endpoint,
      data,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to update feature');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in updateFeatureServer:', error);
    throw error;
  }
}

/**
 * Delete a feature (soft delete)
 */
export async function deleteFeatureServer(
  featureId: string,
  authToken?: string
): Promise<FeatureDeleteResponse> {
  try {
    const endpoint = ENDPOINTS.BILLING.FEATURES.DELETE(featureId);
    
    const response = await serverApiClient.delete<FeatureDeleteResponse>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to delete feature');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in deleteFeatureServer:', error);
    throw error;
  }
}

/**
 * Get feature by code
 */
export async function getFeatureByCodeServer(
  code: string,
  authToken?: string
): Promise<Feature> {
  try {
    const endpoint = ENDPOINTS.BILLING.FEATURES.GET_BY_CODE(code);
    
    const response = await serverApiClient.get<Feature>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch feature by code');
    }

    if (!response.data) {
      throw new Error('No response data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Server Service: Error in getFeatureByCodeServer:', error);
    throw error;
  }
}