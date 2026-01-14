// src/services/billing/plans/plans.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  PlanListResponse,
  PlanResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanStatsResponse,
  PlanFilters,
} from '@/types/billing/plans';


/**
 * Fetch all plans from FastAPI backend (server-side)
 */
export async function fetchPlansFromServer(
  token: string,
  filters: PlanFilters = {}
): Promise<PlanListResponse> {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const endpoint = `${ENDPOINTS.BILLING.PLANS.LIST}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await serverApiClient.get<PlanListResponse>(endpoint, {}, token);

    if (response.error) {
      throw response.error;
    }

    if (!response.data) {
      throw new Error('No data received from backend');
    }

    return response.data;
  } catch (error: any) {
    console.error('Server Service: Error in fetchPlansFromServer:', error);
    throw new Error(error.message || 'Failed to fetch plans from server');
  }
}

/**
 * Fetch single plan by ID (server-side)
 */
export async function fetchPlanByIdFromServer(
  token: string,
  planId: string
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.get<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.GET(planId),
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
    console.error(`Server Service: Error in fetchPlanByIdFromServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to fetch plan from server');
  }
}

/**
 * Fetch plan by code (server-side)
 */
export async function fetchPlanByCodeServer(
  token: string,
  code: string
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.get<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.GET_BY_CODE(code),
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
    console.error(`Server Service: Error in fetchPlanByCodeFromServer (${code}):`, error);
    throw new Error(error.message || 'Failed to fetch plan from server');
  }
}

/**
 * Create a new plan (server-side)
 */
export async function createPlanOnServer(
  token: string,
  data: CreatePlanRequest
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.post<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.CREATE,
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
    console.error('Server Service: Error in createPlanOnServer:', error);
    throw new Error(error.message || 'Failed to create plan on server');
  }
}

/**
 * Update an existing plan (server-side)
 */
export async function updatePlanOnServer(
  token: string,
  planId: string,
  data: UpdatePlanRequest
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.put<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.UPDATE(planId),
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
    console.error(`Server Service: Error in updatePlanOnServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to update plan on server');
  }
}

/**
 * Delete a plan (server-side)
 */
export async function deletePlanOnServer(
  token: string,
  planId: string,
  hardDelete: boolean = false
): Promise<{ success: boolean; message: string }> {
  try {
    const endpoint = `${ENDPOINTS.BILLING.PLANS.DELETE(planId)}?hard_delete=${hardDelete}`;
    const response = await serverApiClient.delete<{ success: boolean; message: string }>(
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
    console.error(`Server Service: Error in deletePlanOnServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to delete plan on server');
  }
}

/**
 * Restore a soft-deleted plan (server-side)
 */
export async function restorePlanOnServer(
  token: string,
  planId: string
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.post<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.RESTORE(planId),
      {},
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
    console.error(`Server Service: Error in restorePlanOnServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to restore plan on server');
  }
}

/**
 * Fetch plan with associated features (server-side)
 */
export async function fetchPlanWithFeaturesFromServer(
  token: string,
  planId: string
): Promise<PlanResponse> {
  try {
    const response = await serverApiClient.get<PlanResponse>(
      ENDPOINTS.BILLING.PLANS.FEATURES(planId),
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
    console.error(`Server Service: Error in fetchPlanWithFeaturesFromServer (${planId}):`, error);
    throw new Error(error.message || 'Failed to fetch plan with features from server');
  }
}

/**
 * Fetch plan statistics (server-side)
 */
export async function fetchPlanStatisticsFromServer(
  token: string
): Promise<PlanStatsResponse> {
  try {
    const response = await serverApiClient.get<PlanStatsResponse>(
      ENDPOINTS.BILLING.PLANS.STATISTICS,
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
    console.error('Server Service: Error in fetchPlanStatisticsFromServer:', error);
    throw new Error(error.message || 'Failed to fetch plan statistics from server');
  }
}

/**
 * Fetch active plans for dropdown (server-side)
 */
export async function fetchActivePlansFromServer(
  token: string
): Promise<{ success: boolean; message: string; data: any[] }> {
  try {
    const response = await serverApiClient.get<{ success: boolean; message: string; data: any[] }>(
      ENDPOINTS.BILLING.PLANS.ACTIVE_DROPDOWN,
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
    console.error('Server Service: Error in fetchActivePlansFromServer:', error);
    throw new Error(error.message || 'Failed to fetch active plans from server');
  }
}