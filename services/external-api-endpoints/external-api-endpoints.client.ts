// src/services/external-api-endpoints/external-api-endpoints.client.ts

/**
 * External API Endpoints Client Service
 *
 * Client-side service for browser usage.
 * Calls Next.js API routes which proxy to FastAPI backend.
 */

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import type {
  ExternalApiEndpointCreate,
  ExternalApiEndpointUpdate,
  ExternalApiEndpointResponse,
  ExternalApiEndpointListResponse,
  ExternalApiEndpointListParams,
  ExternalApiEndpointStatsResponse,
  ExternalApiEndpointDeleteResponse,
} from '@/types/external-api-endpoints';

const API_VERSION = '/api/v0';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function validateBrowserEnvironment(functionName: string): void {
  if (typeof window === 'undefined') {
    throw new Error(`${functionName} can only be called from browser`);
  }
}

function validateAuthToken(): void {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
}

function buildQueryString(params: ExternalApiEndpointListParams): string {
  const queryParams = new URLSearchParams();

  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.size !== undefined) queryParams.append('size', params.size.toString());
  if (params.provider_id) queryParams.append('provider_id', params.provider_id);
  if (params.data_type) queryParams.append('data_type', params.data_type);
  if (params.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
  if (params.include_deleted !== undefined) queryParams.append('include_deleted', params.include_deleted.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params.sort_order) queryParams.append('sort_order', params.sort_order);

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
}

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

export async function createExternalApiEndpoint(
  data: ExternalApiEndpointCreate
): Promise<ExternalApiEndpointResponse> {
  validateBrowserEnvironment('createExternalApiEndpoint');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.LIST;
  const response = await nextjsApiClient.post<ExternalApiEndpointResponse>(endpoint, data);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to create external API endpoint');
  }

  return response.data;
}

export async function getExternalApiEndpoint(
  endpointId: string
): Promise<ExternalApiEndpointResponse> {
  validateBrowserEnvironment('getExternalApiEndpoint');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await nextjsApiClient.get<ExternalApiEndpointResponse>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoint');
  }

  return response.data;
}

export async function getExternalApiEndpoints(
  params: ExternalApiEndpointListParams = {}
): Promise<ExternalApiEndpointListResponse> {
  validateBrowserEnvironment('getExternalApiEndpoints');
  validateAuthToken();

  const queryString = buildQueryString(params);
  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.LIST + queryString;
  const response = await nextjsApiClient.get<ExternalApiEndpointListResponse>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoints');
  }

  return response.data;
}

export async function updateExternalApiEndpoint(
  endpointId: string,
  data: ExternalApiEndpointUpdate
): Promise<ExternalApiEndpointResponse> {
  validateBrowserEnvironment('updateExternalApiEndpoint');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await nextjsApiClient.put<ExternalApiEndpointResponse>(endpoint, data);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to update external API endpoint');
  }

  return response.data;
}

export async function deleteExternalApiEndpoint(
  endpointId: string
): Promise<ExternalApiEndpointDeleteResponse> {
  validateBrowserEnvironment('deleteExternalApiEndpoint');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await nextjsApiClient.delete<ExternalApiEndpointDeleteResponse>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data ?? { success: true, message: 'Endpoint deleted successfully' };
}

// =============================================================================
// ADDITIONAL OPERATIONS
// =============================================================================

export async function getActiveExternalApiEndpoints(): Promise<ExternalApiEndpointResponse[]> {
  validateBrowserEnvironment('getActiveExternalApiEndpoints');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.ACTIVE_LIST;
  const response = await nextjsApiClient.get<ExternalApiEndpointResponse[]>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get active external API endpoints');
  }

  return response.data;
}

export async function getExternalApiEndpointByCode(
  endpointCode: string
): Promise<ExternalApiEndpointResponse> {
  validateBrowserEnvironment('getExternalApiEndpointByCode');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_CODE(endpointCode);
  const response = await nextjsApiClient.get<ExternalApiEndpointResponse>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoint by code');
  }

  return response.data;
}

export async function getExternalApiEndpointsByProvider(
  providerId: string
): Promise<ExternalApiEndpointResponse[]> {
  validateBrowserEnvironment('getExternalApiEndpointsByProvider');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_PROVIDER(providerId);
  const response = await nextjsApiClient.get<ExternalApiEndpointResponse[]>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoints by provider');
  }

  return response.data;
}

export async function getExternalApiEndpointsByDataType(
  dataType: string
): Promise<ExternalApiEndpointResponse[]> {
  validateBrowserEnvironment('getExternalApiEndpointsByDataType');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_DATA_TYPE(dataType);
  const response = await nextjsApiClient.get<ExternalApiEndpointResponse[]>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoints by data type');
  }

  return response.data;
}

export async function toggleExternalApiEndpointStatus(
  endpointId: string
): Promise<ExternalApiEndpointResponse> {
  validateBrowserEnvironment('toggleExternalApiEndpointStatus');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.TOGGLE_STATUS(endpointId);
  const response = await nextjsApiClient.patch<ExternalApiEndpointResponse>(endpoint, {});

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to toggle external API endpoint status');
  }

  return response.data;
}

// =============================================================================
// STATISTICS
// =============================================================================

export async function getExternalApiEndpointStats(): Promise<ExternalApiEndpointStatsResponse> {
  validateBrowserEnvironment('getExternalApiEndpointStats');
  validateAuthToken();

  const endpoint = API_VERSION + ENDPOINTS.EXTERNAL_API_ENDPOINTS.STATS;
  const response = await nextjsApiClient.get<ExternalApiEndpointStatsResponse>(endpoint);

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('Failed to get external API endpoint stats');
  }

  return response.data;
}