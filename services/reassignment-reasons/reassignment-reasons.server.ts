// src/services/reassignment-reasons/reassignment-reasons.server.ts

import { serverApiClient } from '@/lib/server-api';
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

/**
 * Get all reassignment reasons with filtering
 */
export async function getReassignmentReasonsServer(
  filters?: ReassignmentReasonFilters,
  page: number = 1,
  size: number = 50,
  sortBy: string = 'display_order',
  sortOrder: 'asc' | 'desc' = 'asc',
  authToken?: string
): Promise<ReassignmentReasonListResponse> {
  try {
    console.log('Server: Fetching reassignment reasons with filters:', filters);
    
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

    const endpoint = `${ENDPOINTS.REASSIGNMENT_REASONS.LIST}?${queryParams.toString()}`;
    
    const response = await serverApiClient.get<ReassignmentReasonListResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching reassignment reasons:', response.error);
      throw new Error(response.error.message || 'Failed to fetch reassignment reasons');
    }
    
    if (!response.data) {
      throw new Error('No reassignment reasons data received');
    }
    
    console.log('Server: Reassignment reasons fetched successfully:', {
      total: response.data.pagination.total_items,
      page: response.data.pagination.page
    });
    
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching reassignment reasons:', error);
    throw error;
  }
}

/**
 * Get reassignment reason by ID
 */
export async function getReassignmentReasonByIdServer(
  reasonId: string,
  authToken?: string
): Promise<ReassignmentReason> {
  try {
    console.log('Server: Fetching reassignment reason by ID:', reasonId);
    
    const endpoint = ENDPOINTS.REASSIGNMENT_REASONS.DETAIL(reasonId);
    
    const response = await serverApiClient.get<ReassignmentReason>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching reassignment reason:', response.error);
      throw new Error(response.error.message || 'Failed to fetch reassignment reason');
    }
    
    if (!response.data) {
      throw new Error('No reassignment reason data received');
    }
    
    console.log('Server: Reassignment reason fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching reassignment reason:', error);
    throw error;
  }
}

/**
 * Create new reassignment reason
 */
export async function createReassignmentReasonServer(
  data: ReassignmentReasonCreate,
  authToken?: string
): Promise<ReassignmentReason> {
  try {
    console.log('Server: Creating reassignment reason with data:', data);
    
    const response = await serverApiClient.post<ReassignmentReason>(
      ENDPOINTS.REASSIGNMENT_REASONS.CREATE,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating reassignment reason:', response.error);
      throw new Error(response.error.message || 'Failed to create reassignment reason');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reassignment reason created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating reassignment reason:', error);
    throw error;
  }
}

/**
 * Update reassignment reason
 */
export async function updateReassignmentReasonServer(
  reasonId: string,
  data: ReassignmentReasonUpdate,
  authToken?: string
): Promise<ReassignmentReason> {
  try {
    console.log('Server: Updating reassignment reason:', reasonId, data);
    
    const response = await serverApiClient.put<ReassignmentReason>(
      ENDPOINTS.REASSIGNMENT_REASONS.UPDATE(reasonId),
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating reassignment reason:', response.error);
      throw new Error(response.error.message || 'Failed to update reassignment reason');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reassignment reason updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error updating reassignment reason:', error);
    throw error;
  }
}

/**
 * Delete reassignment reason
 */
export async function deleteReassignmentReasonServer(
  reasonId: string,
  authToken?: string
): Promise<{ message: string }> {
  try {
    console.log('Server: Deleting reassignment reason:', reasonId);
    
    const response = await serverApiClient.delete<{ message: string }>(
      ENDPOINTS.REASSIGNMENT_REASONS.DELETE(reasonId),
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error deleting reassignment reason:', response.error);
      throw new Error(response.error.message || 'Failed to delete reassignment reason');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reassignment reason deleted successfully');
    return response.data;
  } catch (error) {
    console.error('Server: Error deleting reassignment reason:', error);
    throw error;
  }
}

/**
 * Bulk update reassignment reasons
 */
export async function bulkUpdateReassignmentReasonsServer(
  data: ReassignmentReasonBulkUpdate,
  authToken?: string
): Promise<{ message: string; updated_count: number }> {
  try {
    console.log('Server: Bulk updating reassignment reasons:', data);
    
    const response = await serverApiClient.patch<{ message: string; updated_count: number }>(
      ENDPOINTS.REASSIGNMENT_REASONS.BULK_UPDATE,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error bulk updating reasons:', response.error);
      throw new Error(response.error.message || 'Failed to bulk update reasons');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reasons bulk updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error bulk updating reasons:', error);
    throw error;
  }
}

/**
 * Bulk delete reassignment reasons - FIXED VERSION
 */
export async function bulkDeleteReassignmentReasonsServer(
  data: ReassignmentReasonBulkDelete,
  authToken?: string
): Promise<{ message: string; deleted_count: number }> {
  try {
    console.log('Server: Bulk deleting reassignment reasons:', data);
    
    // Fix: Pass data as body in options object for DELETE request
    const response = await serverApiClient.delete<{ message: string; deleted_count: number }>(
      ENDPOINTS.REASSIGNMENT_REASONS.BULK_DELETE,
    //   data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error bulk deleting reasons:', response.error);
      throw new Error(response.error.message || 'Failed to bulk delete reasons');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reasons bulk deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error bulk deleting reasons:', error);
    throw error;
  }
}

/**
 * Get reassignment reason by code
 */
export async function getReassignmentReasonByCodeServer(
  code: string,
  authToken?: string
): Promise<ReassignmentReason> {
  try {
    console.log('Server: Fetching reassignment reason by code:', code);
    
    const endpoint = ENDPOINTS.REASSIGNMENT_REASONS.BY_CODE(code);
    
    const response = await serverApiClient.get<ReassignmentReason>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching reassignment reason by code:', response.error);
      throw new Error(response.error.message || 'Failed to fetch reassignment reason by code');
    }
    
    if (!response.data) {
      throw new Error('No reassignment reason data received');
    }
    
    console.log('Server: Reassignment reason fetched by code successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching reassignment reason by code:', error);
    throw error;
  }
}

/**
 * Get available categories
 */
export async function getReassignmentReasonCategoriesServer(
  authToken?: string
): Promise<{ categories: string[]; descriptions: Record<string, string> }> {
  try {
    console.log('Server: Fetching reassignment reason categories');
    
    const response = await serverApiClient.get<{ categories: string[]; descriptions: Record<string, string> }>(
      ENDPOINTS.REASSIGNMENT_REASONS.CATEGORIES,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching categories:', response.error);
      throw new Error(response.error.message || 'Failed to fetch categories');
    }
    
    if (!response.data) {
      throw new Error('No categories data received');
    }
    
    console.log('Server: Categories fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching categories:', error);
    throw error;
  }
}

/**
 * Toggle reason status
 */
export async function toggleReassignmentReasonStatusServer(
  reasonId: string,
  authToken?: string
): Promise<{ message: string; reason: ReassignmentReason }> {
  try {
    console.log('Server: Toggling reassignment reason status:', reasonId);
    
    const response = await serverApiClient.patch<{ message: string; reason: ReassignmentReason }>(
      ENDPOINTS.REASSIGNMENT_REASONS.TOGGLE_STATUS(reasonId),
      {},
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error toggling reason status:', response.error);
      throw new Error(response.error.message || 'Failed to toggle reason status');
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Reason status toggled successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error toggling reason status:', error);
    throw error;
  }
}

/**
 * Get reassignment reason statistics
 */
export async function getReassignmentReasonStatisticsServer(
  authToken?: string
): Promise<ReassignmentReasonStatistics> {
  try {
    console.log('Server: Fetching reassignment reason statistics');
    
    const response = await serverApiClient.get<ReassignmentReasonStatistics>(
      ENDPOINTS.REASSIGNMENT_REASONS.STATISTICS,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching statistics:', response.error);
      throw new Error(response.error.message || 'Failed to fetch statistics');
    }
    
    if (!response.data) {
      throw new Error('No statistics data received');
    }
    
    console.log('Server: Statistics fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching statistics:', error);
    throw error;
  }
}