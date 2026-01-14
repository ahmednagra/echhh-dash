// src/services/billing/subscription/subscription.server.ts

/**
 * Subscription Server Service
 * Server-side service for calling FastAPI backend from Next.js API routes
 */

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { 
  SubscriptionListResponse,
  SubscriptionFilters,
  Subscription,
  CreatePlanBasedSubscriptionRequest,
  CreateCustomSubscriptionRequest,
  SubscriptionCreateResponse
} from '@/types/billing/subscription';

// ============================================================================
// CREATE FUNCTIONS (✅ NEW)
// ============================================================================

/**
 * Create a new plan-based subscription (server-side)
 * Called from Next.js API route to FastAPI backend
 */
export async function createPlanBasedSubscriptionServer(
  data: CreatePlanBasedSubscriptionRequest,
  authToken?: string
): Promise<SubscriptionCreateResponse> {
  try {
    console.log('Server Service: Creating plan-based subscription:', data);

    const endpoint = ENDPOINTS.BILLING.SUBSCRIPTIONS.CREATE;

    console.log('Server Service: Calling FastAPI endpoint:', endpoint);
    console.log('Server Service: Full URL will be:', `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC || 'http://127.0.0.1:8000'}/v0${endpoint}`);

    const response = await serverApiClient.post<SubscriptionCreateResponse>(
      endpoint,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('Server Service: FastAPI Error creating subscription:', response.error);
      throw new Error(response.error.message || 'Failed to create subscription');
    }

    if (!response.data) {
      console.warn('Server Service: No subscription data received from FastAPI');
      throw new Error('No subscription data received from backend');
    }

    console.log('Server Service: Subscription created successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Server Service: Error creating subscription:', error);
    throw error;
  }
}

/**
 * Create a new custom subscription (server-side) (✅ NEW)
 * Called from Next.js API route to FastAPI backend
 */
export async function createCustomSubscriptionServer(
  data: CreateCustomSubscriptionRequest,
  authToken?: string
): Promise<SubscriptionCreateResponse> {
  try {
    console.log('Server Service: Creating custom subscription:', data);

    const endpoint = ENDPOINTS.BILLING.SUBSCRIPTIONS.CREATE_CUSTOM;

    console.log('Server Service: Calling FastAPI endpoint:', endpoint);
    console.log('Server Service: Full URL will be:', `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC || 'http://127.0.0.1:8000'}/v0${endpoint}`);

    const response = await serverApiClient.post<SubscriptionCreateResponse>(
      endpoint,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('Server Service: FastAPI Error creating custom subscription:', response.error);
      throw new Error(response.error.message || 'Failed to create custom subscription');
    }

    if (!response.data) {
      console.warn('Server Service: No subscription data received from FastAPI');
      throw new Error('No subscription data received from backend');
    }

    console.log('Server Service: Custom subscription created successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Server Service: Error creating custom subscription:', error);
    throw error;
  }
}

// ============================================================================
// GET FUNCTIONS (EXISTING)
// ============================================================================

/**
 * Fetch subscriptions list with filters and pagination (server-side)
 * Called from Next.js API route to FastAPI backend
 */
export async function getSubscriptionsServer(
  filters: SubscriptionFilters,
  authToken?: string
): Promise<SubscriptionListResponse> {
  try {
    console.log('Server Service: Fetching subscriptions with filters:', filters);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Pagination
    if (filters.page) queryParams.append('page', String(filters.page));
    if (filters.page_size) queryParams.append('page_size', String(filters.page_size));
    
    // Status filter
    if (filters.status && filters.status !== 'all') {
      queryParams.append('status_id', filters.status);
    }
    
    // Plan filters
    if (filters.plan_id) queryParams.append('plan_id', filters.plan_id);
    
    // Company filters
    if (filters.company_id) queryParams.append('company_id', filters.company_id);
    
    // User filters
    if (filters.created_by) queryParams.append('created_by', filters.created_by);
    
    // Date filters
    if (filters.created_after) queryParams.append('created_after', filters.created_after);
    if (filters.created_before) queryParams.append('created_before', filters.created_before);
    
    // Trial filters
    if (filters.has_trial_period !== undefined) {
      queryParams.append('has_trial_period', String(filters.has_trial_period));
    }
    if (filters.trial_currently_active !== undefined) {
      queryParams.append('trial_currently_active', String(filters.trial_currently_active));
    }
    
    // Cancellation filters
    if (filters.will_not_auto_renew !== undefined) {
      queryParams.append('will_not_auto_renew', String(filters.will_not_auto_renew));
    }
    if (filters.is_cancelled !== undefined) {
      queryParams.append('is_cancelled', String(filters.is_cancelled));
    }
    
    // Other filters
    if (filters.is_deleted !== undefined) queryParams.append('is_deleted', String(filters.is_deleted));
    if (filters.search) queryParams.append('search', filters.search);
    
    // Sorting
    if (filters.sort_by) queryParams.append('sort_by', filters.sort_by);
    if (filters.sort_order) queryParams.append('sort_order', filters.sort_order);

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.BILLING.SUBSCRIPTIONS.LIST}?${queryString}`
      : ENDPOINTS.BILLING.SUBSCRIPTIONS.LIST;
    
    console.log('Server Service: Calling FastAPI endpoint:', endpoint);
    console.log('Server Service: Full URL will be:', `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC || 'http://127.0.0.1:8000'}/v0${endpoint}`);
    
    const response = await serverApiClient.get<SubscriptionListResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server Service: FastAPI Error fetching subscriptions:', response.error);
      throw new Error(response.error.message || 'Failed to fetch subscriptions');
    }
    
    if (!response.data) {
      console.warn('Server Service: No subscription data received from FastAPI');
      throw new Error('No subscription data received from backend');
    }
    
    console.log('Server Service: Subscriptions fetched successfully:', {
      total: response.data.total,
      page: response.data.page,
      count: response.data.subscriptions.length
    });
    
    return response.data;
  } catch (error) {
    console.error('Server Service: Error fetching subscriptions:', error);
    throw error;
  }
}

/**
 * Get a single subscription by ID (server-side)
 * Called from Next.js API route to FastAPI backend
 * Layer: Server Service → FastAPI
 */
export async function getSubscriptionByIdServer(
  subscriptionId: string,
  authToken?: string
): Promise<Subscription> {
  try {
    console.log('Server Service: Fetching subscription by ID:', subscriptionId);

    const endpoint = ENDPOINTS.BILLING.SUBSCRIPTIONS.GET_BY_ID(subscriptionId);

    console.log('Server Service: Calling FastAPI endpoint:', endpoint);
    console.log('Server Service: Full URL will be:', `${process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC || 'http://127.0.0.1:8000'}/v0${endpoint}`);

    const response = await serverApiClient.get<Subscription>(
      endpoint,
      {},
      authToken
    );

    if (response.error) {
      console.error('Server Service: FastAPI Error fetching subscription:', response.error);
      throw new Error(response.error.message || 'Failed to fetch subscription');
    }

    if (!response.data) {
      console.warn('Server Service: No subscription data received from FastAPI');
      const error: any = new Error('Subscription not found');
      error.status = 404;
      throw error;
    }

    console.log('Server Service: Subscription fetched successfully:', {
      id: response.data.id,
      status: response.data.status?.name,
      company: response.data.company?.name
    });

    return response.data;
  } catch (error: any) {
    console.error('Server Service: Error fetching subscription:', error);
    throw error;
  }
}