// src/services/billing/feature/feature.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { Feature, FeatureListResponse, FeatureDeleteResponse,
    CreateFeatureRequest,  UpdateFeatureRequest,  FeatureFilters} from '@/types/billing/features';


const API_VERSION = '/api/v0';

/**
 * Get paginated list of features with filters
 */
export async function getFeatures(
  filters: FeatureFilters = {}
): Promise<FeatureListResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getFeatures can only be called from browser');
    }

    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

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

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.FEATURES.LIST}?${params.toString()}`;

    const response = await nextjsApiClient.get<FeatureListResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch features');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getFeatures:', error);
    throw error;
  }
}

/**
 * Get a single feature by ID
 */
export async function getFeatureById(featureId: string): Promise<Feature> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getFeatureById can only be called from browser');
    }

    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.FEATURES.GET_BY_ID(featureId)}`;

    const response = await nextjsApiClient.get<Feature>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch feature');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getFeatureById:', error);
    throw error;
  }
}

/**
 * Create a new feature
 */
export async function createFeature(
  data: CreateFeatureRequest
): Promise<Feature> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createFeature can only be called from browser');
    }

    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      throw new Error('Feature name is required');
    }

    if (!data.code || !data.code.trim()) {
      throw new Error('Feature code is required');
    }

    if (!data.category) {
      throw new Error('Feature category is required');
    }

    if (!data.unit_type) {
      throw new Error('Feature unit type is required');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.FEATURES.CREATE}`;

    const response = await nextjsApiClient.post<Feature>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to create feature');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createFeature:', error);
    throw error;
  }
}

/**
 * Update an existing feature
 */
export async function updateFeature(
  featureId: string,
  data: UpdateFeatureRequest
): Promise<Feature> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('updateFeature can only be called from browser');
    }

    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    // Validate at least one field is provided
    const hasUpdate = Object.keys(data).length > 0;
    if (!hasUpdate) {
      throw new Error('At least one field must be provided for update');
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.FEATURES.UPDATE(featureId)}`;

    const response = await nextjsApiClient.put<Feature>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to update feature');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in updateFeature:', error);
    throw error;
  }
}

/**
 * Delete a feature (soft delete)
 */
export async function deleteFeature(
  featureId: string
): Promise<FeatureDeleteResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('deleteFeature can only be called from browser');
    }

    // Check authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }
    
    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.FEATURES.DELETE(featureId)}`;

    const response = await nextjsApiClient.delete<FeatureDeleteResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to delete feature');
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in deleteFeature:', error);
    throw error;
  }
}