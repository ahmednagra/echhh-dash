// src/services/billing/subscription/subscription.client.ts

/**
 * Subscription Client Service
 * Browser-side service for calling Next.js API routes
 */

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type { 
  SubscriptionListResponse,
  SubscriptionFilters,
  Subscription,
  CreatePlanBasedSubscriptionRequest,
  CreateCustomSubscriptionRequest,
  SubscriptionCreateResponse
} from '@/types/billing/subscription';

const API_VERSION = '/api/v0';

/**
 * Helper function to check browser environment and authentication
 */
function checkBrowserAndAuth(functionName: string): void {
  if (typeof window === 'undefined') {
    throw new Error(`${functionName} can only be called from browser`);
  }

  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
}

// ============================================================================
// CREATE FUNCTIONS (✅ NEW)
// ============================================================================

/**
 * Create a new plan-based subscription
 * Calls Next.js API route which then calls FastAPI backend
 */
export async function createPlanBasedSubscription(
  data: CreatePlanBasedSubscriptionRequest
): Promise<SubscriptionCreateResponse> {
  try {
    checkBrowserAndAuth('createPlanBasedSubscription');

    console.log('Client Service: Creating plan-based subscription:', data);

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.SUBSCRIPTIONS.CREATE}`;

    console.log('Client Service: Calling Next.js API route:', endpoint);

    const response = await nextjsApiClient.post<SubscriptionCreateResponse>(endpoint, data);

    if (response.error) {
      console.error('Client Service: API Error creating subscription:', response.error);
      throw new Error(response.error.message || 'Failed to create subscription');
    }

    if (!response.data) {
      console.warn('Client Service: No subscription data received');
      throw new Error('No subscription data received');
    }

    console.log('Client Service: Subscription created successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createPlanBasedSubscription:', error);
    throw error;
  }
}

/**
 * Create a new custom subscription (✅ NEW)
 * Calls Next.js API route which then calls FastAPI backend
 */
export async function createCustomSubscription(
  data: CreateCustomSubscriptionRequest
): Promise<SubscriptionCreateResponse> {
  try {
    checkBrowserAndAuth('createCustomSubscription');

    console.log('Client Service: Creating custom subscription:', data);

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.SUBSCRIPTIONS.CREATE_CUSTOM}`;

    console.log('Client Service: Calling Next.js API route:', endpoint);

    const response = await nextjsApiClient.post<SubscriptionCreateResponse>(endpoint, data);

    if (response.error) {
      console.error('Client Service: API Error creating custom subscription:', response.error);
      throw new Error(response.error.message || 'Failed to create custom subscription');
    }

    if (!response.data) {
      console.warn('Client Service: No subscription data received');
      throw new Error('No subscription data received');
    }

    console.log('Client Service: Custom subscription created successfully:', response.data);

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createCustomSubscription:', error);
    throw error;
  }
}

// ============================================================================
// GET FUNCTIONS (EXISTING)
// ============================================================================

/**
 * Fetch subscriptions list with filters and pagination (client-side)
 * Calls Next.js API route which then calls FastAPI backend
 */
export async function getSubscriptions(
  filters: SubscriptionFilters = {}
): Promise<SubscriptionListResponse> {
  try {
    checkBrowserAndAuth('getSubscriptions');

    console.log('Client Service: Fetching subscriptions with filters:', filters);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Pagination
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    queryParams.append('page', String(page));
    queryParams.append('page_size', String(pageSize));
    
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
    
    // FIXED: Trial filters
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

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.SUBSCRIPTIONS.LIST}?${queryParams.toString()}`;
    
    console.log('Client Service: Calling Next.js API route:', endpoint);
    console.log('Client Service: This should be: /api/v0/billing/subscriptions?...');
    
    const response = await nextjsApiClient.get<SubscriptionListResponse>(endpoint);

    if (response.error) {
      console.error('Client Service: API Error fetching subscriptions:', response.error);
      throw new Error(response.error.message || 'Failed to fetch subscriptions');
    }

    if (!response.data) {
      console.warn('Client Service: No subscription data received');
      throw new Error('No subscription data received');
    }

    console.log('Client Service: Subscriptions fetched successfully:', {
      total: response.data.total,
      page: response.data.page,
      count: response.data.subscriptions.length
    });

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getSubscriptions:', error);
    throw error;
  }
}

/**
 * Get a single subscription by ID
 * Layer: Client Service → NextJS API Route → Server Service → FastAPI
 */
export async function getSubscriptionById(subscriptionId: string): Promise<Subscription> {
  try {
    checkBrowserAndAuth('getSubscriptionById');

    console.log('Client Service: Fetching subscription by ID:', subscriptionId);

    const endpoint = `${API_VERSION}${ENDPOINTS.BILLING.SUBSCRIPTIONS.GET_BY_ID(subscriptionId)}`;

    console.log('Client Service: Calling Next.js API route:', endpoint);

    const response = await nextjsApiClient.get<Subscription>(endpoint);

    if (response.error) {
      console.error('Client Service: API Error fetching subscription:', response.error);
      throw new Error(response.error.message || 'Failed to fetch subscription');
    }

    if (!response.data) {
      console.warn('Client Service: No subscription data received');
      throw new Error('Subscription not found');
    }

    console.log('Client Service: Subscription fetched successfully:', {
      id: response.data.id,
      status: response.data.status?.name,
      company: response.data.company?.name
    });

    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getSubscriptionById:', error);
    throw error;
  }
}