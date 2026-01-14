// src/services/external-api-endpoints/external-api-endpoints.server.ts

/**
 * External API Endpoints Server Service
 *
 * Server-side service for communicating with FastAPI backend.
 * Called from Next.js API routes only.
 */

import { serverApiClient } from '@/lib/server-api';
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

// =============================================================================
// CRUD OPERATIONS
// =============================================================================

export async function createExternalApiEndpointServer(
  data: ExternalApiEndpointCreate,
  authToken?: string
): Promise<ExternalApiEndpointResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.LIST;
  const response = await serverApiClient.post<ExternalApiEndpointResponse>(
    endpoint,
    data,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function getExternalApiEndpointServer(
  endpointId: string,
  authToken?: string
): Promise<ExternalApiEndpointResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await serverApiClient.get<ExternalApiEndpointResponse>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function getExternalApiEndpointsServer(
  params: ExternalApiEndpointListParams,
  authToken?: string
): Promise<ExternalApiEndpointListResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.LIST;
  const queryParams: Record<string, string | number | boolean> = {};

  if (params.page !== undefined) queryParams.page = params.page;
  if (params.size !== undefined) queryParams.size = params.size;
  if (params.provider_id) queryParams.provider_id = params.provider_id;
  if (params.data_type) queryParams.data_type = params.data_type;
  if (params.is_active !== undefined) queryParams.is_active = params.is_active;
  if (params.include_deleted !== undefined) queryParams.include_deleted = params.include_deleted;
  if (params.search) queryParams.search = params.search;
  if (params.sort_by) queryParams.sort_by = params.sort_by;
  if (params.sort_order) queryParams.sort_order = params.sort_order;

  const response = await serverApiClient.get<ExternalApiEndpointListResponse>(
    endpoint,
    queryParams,
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function updateExternalApiEndpointServer(
  endpointId: string,
  data: ExternalApiEndpointUpdate,
  authToken?: string
): Promise<ExternalApiEndpointResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await serverApiClient.put<ExternalApiEndpointResponse>(
    endpoint,
    data,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function deleteExternalApiEndpointServer(
  endpointId: string,
  authToken?: string
): Promise<ExternalApiEndpointDeleteResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.DETAIL(endpointId);
  const response = await serverApiClient.delete<ExternalApiEndpointDeleteResponse>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  return response.data ?? { success: true, message: 'Endpoint deleted successfully' };
}

// =============================================================================
// ADDITIONAL OPERATIONS
// =============================================================================

export async function getActiveExternalApiEndpointsServer(
  authToken?: string
): Promise<ExternalApiEndpointResponse[]> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.ACTIVE_LIST;
  const response = await serverApiClient.get<ExternalApiEndpointResponse[]>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function getExternalApiEndpointByCodeServer(
  endpointCode: string,
  authToken?: string
): Promise<ExternalApiEndpointResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_CODE(endpointCode);
  const response = await serverApiClient.get<ExternalApiEndpointResponse>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function getExternalApiEndpointsByProviderServer(
  providerId: string,
  authToken?: string
): Promise<ExternalApiEndpointResponse[]> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_PROVIDER(providerId);
  const response = await serverApiClient.get<ExternalApiEndpointResponse[]>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function getExternalApiEndpointsByDataTypeServer(
  dataType: string,
  authToken?: string
): Promise<ExternalApiEndpointResponse[]> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_DATA_TYPE(dataType);
  const response = await serverApiClient.get<ExternalApiEndpointResponse[]>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

export async function toggleExternalApiEndpointStatusServer(
  endpointId: string,
  authToken?: string
): Promise<ExternalApiEndpointResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.TOGGLE_STATUS(endpointId);
  const response = await serverApiClient.patch<ExternalApiEndpointResponse>(
    endpoint,
    {},
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}

// =============================================================================
// STATISTICS
// =============================================================================

export async function getExternalApiEndpointStatsServer(
  authToken?: string
): Promise<ExternalApiEndpointStatsResponse> {
  const endpoint = ENDPOINTS.EXTERNAL_API_ENDPOINTS.STATS;
  const response = await serverApiClient.get<ExternalApiEndpointStatsResponse>(
    endpoint,
    {},
    authToken
  );

  if (response.error) {
    throw new Error(response.error.message);
  }

  if (!response.data) {
    throw new Error('No response data received');
  }

  return response.data;
}