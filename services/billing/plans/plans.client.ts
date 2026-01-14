// src/services/billing/plans/plans.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  PlanListResponse,
  PlanResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanStatsResponse,
  PlanFilters,
  DropdownResponse,
  PlanDropdownItem,
} from '@/types/billing/plans';

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
//                      PLAN OPERATIONS
// =========================================================================

/**
 * Fetch all plans with optional filters
 */
export async function fetchPlans(filters: PlanFilters = {}): Promise<PlanListResponse> {
  console.log('Client Service: fetchPlans called with filters:', filters);
  try {
    checkBrowserAndAuth('fetchPlans');
    console.log('Client Service: Auth token verified for fetchPlans');

    const queryParams = buildQueryParams(filters);
    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.LIST}${queryParams ? `?${queryParams}` : ''}`;
    
    console.log('Client Service: Fetching plans from endpoint:', endpoint);

    const response = await nextjsApiClient.get<PlanListResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plans');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in fetchPlans:', error);
    throw error;
  }
}

/**
 * Fetch active plans for dropdown
 */
export async function fetchActivePlans(): Promise<DropdownResponse<PlanDropdownItem>> {
  try {
    checkBrowserAndAuth('fetchActivePlans');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.ACTIVE_DROPDOWN}`;
    const response = await nextjsApiClient.get<DropdownResponse<PlanDropdownItem>>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch active plans');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in fetchActivePlans:', error);
    throw error;
  }
}

/**
 * Fetch single plan by ID
 */
export async function fetchPlanById(planId: string): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('fetchPlanById');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.GET(planId)}`;
    const response = await nextjsApiClient.get<PlanResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in fetchPlanById (${planId}):`, error);
    throw error;
  }
}

/**
 * Fetch plan by code
 */
export async function fetchPlanByCode(code: string): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('fetchPlanByCode');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.GET_BY_CODE(code)}`;
    const response = await nextjsApiClient.get<PlanResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in fetchPlanByCode (${code}):`, error);
    throw error;
  }
}

/**
 * Fetch plan with associated features
 */
export async function fetchPlanWithFeatures(planId: string): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('fetchPlanWithFeatures');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.FEATURES(planId)}`;
    const response = await nextjsApiClient.get<PlanResponse>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan with features');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in fetchPlanWithFeatures (${planId}):`, error);
    throw error;
  }
}

/**
 * Create a new plan
 */
export async function createPlan(data: CreatePlanRequest): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('createPlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.CREATE}`;
    const response = await nextjsApiClient.post<PlanResponse>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to create plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createPlan:', error);
    throw error;
  }
}

/**
 * Update an existing plan
 */
export async function updatePlan(planId: string, data: UpdatePlanRequest): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('updatePlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.UPDATE(planId)}`;
    const response = await nextjsApiClient.put<PlanResponse>(endpoint, data);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to update plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in updatePlan (${planId}):`, error);
    throw error;
  }
}

/**
 * Delete a plan (soft or hard delete)
 */
export async function deletePlan(planId: string, hardDelete: boolean = false): Promise<{ success: boolean; message: string }> {
  try {
    checkBrowserAndAuth('deletePlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.DELETE(planId)}?hard_delete=${hardDelete}`;
    const response = await nextjsApiClient.delete<{ success: boolean; message: string }>(endpoint);

    if (response.error) {
      throw new Error(response.error.message || 'Failed to delete plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in deletePlan (${planId}):`, error);
    throw error;
  }
}

/**
 * Restore a soft-deleted plan
 */
export async function restorePlan(planId: string): Promise<PlanResponse> {
  try {
    checkBrowserAndAuth('restorePlan');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.RESTORE(planId)}`;
    const response = await nextjsApiClient.post<PlanResponse>(endpoint, {});

    if (response.error) {
      throw new Error(response.error.message || 'Failed to restore plan');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error(`Client Service: Error in restorePlan (${planId}):`, error);
    throw error;
  }
}

/**
 * Fetch plan statistics
 */
export async function fetchPlanStatistics(): Promise<PlanStatsResponse> {
  try {
    checkBrowserAndAuth('fetchPlanStatistics');

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.PLANS.STATISTICS}`;
    const response = await nextjsApiClient.get<PlanStatsResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch plan statistics');
    }

    if (!response.data) {
      throw new Error('No data received from server');
    }

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in fetchPlanStatistics:', error);
    throw error;
  }
}