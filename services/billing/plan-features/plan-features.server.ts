// src/services/billing/plan-features/plan-features.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  PlanFeatureListResponse,
  PlanFeatureResponse,
  CreatePlanFeatureRequest,
  UpdatePlanFeatureRequest,
  PlanFeatureBulkCreateRequest,
  PlanFeatureBulkCreateResponse,
} from '@/types/billing/plan-features';
import type { Feature } from '@/types/billing/features';

/**
 * Assign a feature to a plan (server-side)
 */
export async function assignFeatureToPlanServer(
  token: string,
  data: CreatePlanFeatureRequest
): Promise<PlanFeatureResponse> {
  try {
    const response = await serverApiClient.post<PlanFeatureResponse>(
      ENDPOINTS.BILLING.PLAN_FEATURES.CREATE,
      data,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error('Server Service: Error in assignFeatureToPlanServer:', error);
    throw new Error(error.message || 'Failed to assign feature to plan on server');
  }
}

/**
 * Bulk create plan features (server-side)
 */
export async function bulkCreatePlanFeaturesServer(
  token: string,
  data: PlanFeatureBulkCreateRequest
): Promise<PlanFeatureBulkCreateResponse> {
  try {
    const response = await serverApiClient.post<PlanFeatureBulkCreateResponse>(
      ENDPOINTS.BILLING.PLAN_FEATURES.BULK_CREATE,
      data,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error('Server Service: Error in bulkCreatePlanFeaturesServer:', error);
    throw new Error(error.message || 'Failed to bulk create plan features on server');
  }
}

/**
 * Fetch features for a specific plan (server-side)
 */
export async function fetchFeaturesForPlanServer(
  planId: string,
  token: string,
  includeDisabled: boolean = false
): Promise<PlanFeatureListResponse> {
  try {
    const endpoint = `${ENDPOINTS.BILLING.PLAN_FEATURES.FOR_PLAN(planId)}?include_disabled=${includeDisabled}`;
    const response = await serverApiClient.get<PlanFeatureListResponse>(
      endpoint,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in fetchFeaturesForPlanServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to fetch features for plan from server');
  }
}

/**
 * Update a plan-feature association (server-side)
 */
export async function updatePlanFeatureServer(
  token: string,
  planFeatureId: string,
  data: UpdatePlanFeatureRequest
): Promise<PlanFeatureResponse> {
  try {
    const response = await serverApiClient.put<PlanFeatureResponse>(
      ENDPOINTS.BILLING.PLAN_FEATURES.UPDATE(planFeatureId),
      data,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in updatePlanFeatureServer (${planFeatureId}):`, error);
    throw new Error(error.message || 'Failed to update plan-feature on server');
  }
}

/**
 * Remove a feature from a plan (server-side)
 */
export async function deletePlanFeatureServer(
  token: string,
  planFeatureId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await serverApiClient.delete<{ success: boolean; message: string }>(
      ENDPOINTS.BILLING.PLAN_FEATURES.DELETE(planFeatureId),
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in removeFeatureFromPlanServer (${planFeatureId}):`, error);
    throw new Error(error.message || 'Failed to remove feature from plan on server');
  }
}

/**
 * Fetch unassigned features for a plan (server-side)
 */
export async function fetchUnassignedFeaturesServer(
  token: string,
  planId: string,
  category?: string,
  search?: string
): Promise<{ success: boolean; message: string; data: Feature[] }> {
  try {
    const queryParams = new URLSearchParams();
    if (category) queryParams.append('category', category);
    if (search) queryParams.append('search', search);

    const endpoint = `${ENDPOINTS.BILLING.PLAN_FEATURES.UNASSIGNED_FEATURES(planId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await serverApiClient.get<{ success: boolean; message: string; data: Feature[] }>(
      endpoint,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in fetchUnassignedFeaturesServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to fetch unassigned features from server');
  }
}

/**
 * Get plan feature by ID (server-side)
 */
export async function getPlanFeatureByIdServer(
  token: string,
  planFeatureId: string
): Promise<PlanFeatureResponse> {
  try {
    const response = await serverApiClient.get<PlanFeatureResponse>(
      ENDPOINTS.BILLING.PLAN_FEATURES.GET(planFeatureId),
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in getPlanFeatureByIdServer (${planFeatureId}):`, error);
    throw new Error(error.message || 'Failed to fetch plan feature from server');
  }
}

/**
 * Get all plan features with pagination (server-side)
 */
export async function listPlanFeaturesServer(
  token: string,
  filters: {
    page?: number;
    page_size?: number;
    plan_id?: string;
    feature_id?: string;
  } = {}
): Promise<PlanFeatureListResponse> {
  try {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = `${ENDPOINTS.BILLING.PLAN_FEATURES.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await serverApiClient.get<PlanFeatureListResponse>(
      endpoint,
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error('Server Service: Error in getPlanFeatureServer:', error);
    throw new Error(error.message || 'Failed to fetch plan features list from server');
  }
}

/**
 * Clone features from one plan to another (server-side)
 */
export async function clonePlanFeaturesServer(
  token: string,
  sourcePlanId: string,
  targetPlanId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await serverApiClient.post<{ success: boolean; message: string }>(
      ENDPOINTS.BILLING.PLAN_FEATURES.CLONE_FEATURES(sourcePlanId),
      { target_plan_id: targetPlanId },
      {},
      token
    );

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error(`Server Service: Error in clonePlanFeaturesServer:`, error);
    throw new Error(error.message || 'Failed to clone plan features on server');
  }
}