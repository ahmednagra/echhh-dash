// src/services/billing/plan-features/plan-features.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  PlanFeatureListResponse,
  PlanFeatureResponse,
  CreatePlanFeatureRequest,
  UpdatePlanFeatureRequest,
  BulkAssignFeaturesRequest,
  DropdownResponse,
  // FeatureDropdownItem,
  PlanFeaturesForPlanResponse,
  UnassignedFeaturesResponse
} from '@/types/billing/plan-features';

const API_VERSION = '/api/v0';


/**
 * Check if running in browser and has auth token
 */
function checkBrowserAndAuth(functionName: string): string {
  if (typeof window === 'undefined') {
    throw new Error(`${functionName} can only be called from browser`);
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  return token;
}

/**
 * Build query parameters from filters
 */
function buildQueryParams(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

// =========================================================================
//                      PLAN-FEATURE ASSOCIATION OPERATIONS
// =========================================================================

/**
 * Assign a feature to a plan
 */
export async function assignFeatureToPlan(data: CreatePlanFeatureRequest): Promise<PlanFeatureResponse> {
  try {
    checkBrowserAndAuth('assignFeatureToPlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.CREATE}`;
    const response = await nextjsApiClient.post<PlanFeatureResponse>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to assign feature to plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in assignFeatureToPlan:', error);
    throw error;
  }
}

/**
 * Bulk assign features to a plan
 */
export async function bulkAssignFeatures(data: BulkAssignFeaturesRequest): Promise<any> {
  try {
    checkBrowserAndAuth('bulkAssignFeatures');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.BULK_CREATE}`;
    const response = await nextjsApiClient.post(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to bulk assign features');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in bulkAssignFeatures:', error);
    throw error;
  }
}

/**
 * Fetch features for a specific plan
 */
export async function fetchFeaturesForPlan(planId: string, includeDisabled: boolean = false): Promise<PlanFeaturesForPlanResponse> {
  try {
    checkBrowserAndAuth('fetchFeaturesForPlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.FOR_PLAN(planId)}?include_disabled=${includeDisabled}`;
    const response = await nextjsApiClient.get<PlanFeaturesForPlanResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch features for plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in fetchFeaturesForPlan (${planId}):`, error);
    throw error;
  }
}

/**
 * Update a plan-feature association
 */
export async function updatePlanFeature(
  planFeatureId: string,
  data: UpdatePlanFeatureRequest
): Promise<PlanFeatureResponse> {
  try {
    checkBrowserAndAuth('updatePlanFeature');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.UPDATE(planFeatureId)}`;
    const response = await nextjsApiClient.put<PlanFeatureResponse>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to update plan-feature');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in updatePlanFeature (${planFeatureId}):`, error);
    throw error;
  }
}

/**
 * Remove a feature from a plan
 */
export async function removeFeatureFromPlan(planFeatureId: string): Promise<{ success: boolean; message: string }> {
  try {
    checkBrowserAndAuth('removeFeatureFromPlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.DELETE(planFeatureId)}`;
    const response = await nextjsApiClient.delete<{ success: boolean; message: string }>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to remove feature from plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in removeFeatureFromPlan (${planFeatureId}):`, error);
    throw error;
  }
}

/**
 * Fetch unassigned features for a plan (for dropdown)
 */
export async function fetchUnassignedFeatures(
  planId: string,
  category?: string,
  search?: string
): Promise<UnassignedFeaturesResponse> {
  try {
    checkBrowserAndAuth('fetchUnassignedFeatures');

    const queryParams = buildQueryParams({ category, search });
    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.UNASSIGNED_FEATURES(planId)}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await nextjsApiClient.get<UnassignedFeaturesResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch unassigned features');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in fetchUnassignedFeatures (${planId}):`, error);
    throw error;
  }
}

/**
 * Get plan feature by ID
 */
export async function getPlanFeatureById(planFeatureId: string): Promise<PlanFeatureResponse> {
  try {
    checkBrowserAndAuth('getPlanFeatureById');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.GET(planFeatureId)}`;
    const response = await nextjsApiClient.get<PlanFeatureResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan feature');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in getPlanFeatureById (${planFeatureId}):`, error);
    throw error;
  }
}

/**
 * Get all plan features with pagination
 */
export async function getPlanFeaturesList(
  filters: {
    page?: number;
    page_size?: number;
    plan_id?: string;
    feature_id?: string;
  } = {}
): Promise<PlanFeatureListResponse> {
  try {
    checkBrowserAndAuth('getPlanFeaturesList');

    const queryParams = buildQueryParams(filters);
    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.LIST}${queryParams ? `?${queryParams}` : ''}`;
    
    const response = await nextjsApiClient.get<PlanFeatureListResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan features list');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getPlanFeaturesList:', error);
    throw error;
  }
}

/**
 * Clone features from one plan to another
 */
export async function clonePlanFeatures(
  sourcePlanId: string,
  targetPlanId: string
): Promise<{ success: boolean; message: string }> {
  try {
    checkBrowserAndAuth('clonePlanFeatures');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLAN_FEATURES.CLONE_FEATURES(sourcePlanId)}`;
    const response = await nextjsApiClient.post<{ success: boolean; message: string }>(
      endpoint,
      { target_plan_id: targetPlanId }
    );

    if (response.error) {
      throw new Error(response.error.message || 'Failed to clone plan features');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in clonePlanFeatures:', error);
    throw error;
  }
}