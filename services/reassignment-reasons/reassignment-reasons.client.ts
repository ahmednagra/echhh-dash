// src/services/reassignment-reasons/reassignment-reasons.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  ReassignmentReason,
  ReassignmentReasonListResponse,
  ReassignmentReasonCreate,
  ReassignmentReasonUpdate,
  ReassignmentReasonFilters,
  ReassignmentReasonBulkUpdate,
  ReassignmentReasonBulkDelete,
  ReassignmentReasonStatistics
} from '@/types/reassignment-reasons';

const API_VERSION = '/api/v0';

/**
 * Get all reassignment reasons with filtering
 */
export async function getReassignmentReasons(
  filters?: ReassignmentReasonFilters,
  page: number = 1,
  size: number = 50,
  sortBy: string = 'display_order',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<ReassignmentReasonListResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getReassignmentReasons can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (filters?.user_type) queryParams.append('user_type', filters.user_type);
    if (filters?.user_category) queryParams.append('user_category', filters.user_category);
    if (filters?.is_active !== undefined) queryParams.append('is_active', String(filters.is_active));
    if (filters?.is_system_triggered !== undefined) queryParams.append('is_system_triggered', String(filters.is_system_triggered));
    if (filters?.is_user_triggered !== undefined) queryParams.append('is_user_triggered', String(filters.is_user_triggered));
    if (filters?.is_agent_triggered !== undefined) queryParams.append('is_agent_triggered', String(filters.is_agent_triggered));
    if (filters?.is_admin_triggered !== undefined) queryParams.append('is_admin_triggered', String(filters.is_admin_triggered));
    if (filters?.is_support_triggered !== undefined) queryParams.append('is_support_triggered', String(filters.is_support_triggered));
    if (filters?.search) queryParams.append('search', filters.search);
    
    queryParams.append('page', String(page));
    queryParams.append('size', String(size));
    queryParams.append('sort_by', sortBy);
    queryParams.append('sort_order', sortOrder);

    const endpoint = `${API_VERSION}${ENDPOINTS.REASSIGNMENT_REASONS.LIST}?${queryParams.toString()}`;

    const response = await nextjsApiClient.get<ReassignmentReasonListResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to fetch reassignment reasons');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getReassignmentReasons:', error);
    throw error;
  }
}

/**
 * Get reassignment reasons specifically for outreach agents
 * Fixed to use user_type=outreach_agent as per backend response
 */
export async function getReassignmentReasonsForAgents(): Promise<ReassignmentReason[]> {
  try {
    const filters: ReassignmentReasonFilters = {
      user_type: 'outreach_agent', // Fixed: Use user_type instead of user_category
      is_active: true
    };
    
    const response = await getReassignmentReasons(filters, 1, 100, 'display_order', 'asc');
    
    return response.items;
  } catch (error) {
    console.error('Client Service: Error in getReassignmentReasonsForAgents:', error);
    throw error;
  }
}

/**
 * Get reassignment reason by ID
 */
export async function getReassignmentReasonById(reasonId: string): Promise<ReassignmentReason> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('getReassignmentReasonById can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.REASSIGNMENT_REASONS.DETAIL(reasonId);

    const response = await nextjsApiClient.get<ReassignmentReason>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to fetch reassignment reason');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in getReassignmentReasonById:', error);
    throw error;
  }
}

/**
 * Create new reassignment reason
 */
export async function createReassignmentReason(
  data: ReassignmentReasonCreate
): Promise<ReassignmentReason> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('createReassignmentReason can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.REASSIGNMENT_REASONS.CREATE;

    const response = await nextjsApiClient.post<ReassignmentReason>(endpoint, data);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to create reassignment reason');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in createReassignmentReason:', error);
    throw error;
  }
}

/**
 * Update reassignment reason
 */
export async function updateReassignmentReason(
  reasonId: string,
  data: ReassignmentReasonUpdate
): Promise<ReassignmentReason> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('updateReassignmentReason can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.REASSIGNMENT_REASONS.UPDATE(reasonId);

    const response = await nextjsApiClient.put<ReassignmentReason>(endpoint, data);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to update reassignment reason');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in updateReassignmentReason:', error);
    throw error;
  }
}

/**
 * Delete reassignment reason
 */
export async function deleteReassignmentReason(reasonId: string): Promise<{ message: string }> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('deleteReassignmentReason can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const endpoint = API_VERSION + ENDPOINTS.REASSIGNMENT_REASONS.DELETE(reasonId);

    const response = await nextjsApiClient.delete<{ message: string }>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Failed to delete reassignment reason');
    }
    
    return response.data;
  } catch (error) {
    console.error('Client Service: Error in deleteReassignmentReason:', error);
    throw error;
  }
}