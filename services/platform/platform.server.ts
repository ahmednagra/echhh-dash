// src/services/platform/platform.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { Platform } from '@/types/platform';
import { ENDPOINTS } from '@/services/api/endpoints';

/**
 * Get all platforms (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getPlatformsServer(authToken?: string): Promise<Platform[]> {
  try {
    console.log('🔄 Fetching platforms from FastAPI backend...');
    
    const response = await serverApiClient.get<Platform[]>(
      ENDPOINTS.PLATFORMS.LIST, // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Error response from platforms API:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Platforms fetched successfully:', response.data?.length || 0, 'platforms');
    return response.data || [];
  } catch (error) {
    console.error('❌ Error fetching platforms:', error);
    throw error;
  }
}

/**
 * Get a specific platform by ID (server-side)
 */
export async function getPlatformByIdServer(platformId: string, authToken?: string): Promise<Platform | null> {
  try {
    console.log(`🔄 Fetching platform with ID: ${platformId}`);
    
    const response = await serverApiClient.get<Platform>(
      ENDPOINTS.PLATFORMS.DETAIL(platformId), // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`⚠️ Platform not found with ID ${platformId}`);
        return null;
      }
      throw new Error(response.error.message);
    }
    
    console.log('✅ Platform fetched successfully:', response.data?.name);
    return response.data;
  } catch (error) {
    console.error(`❌ Error fetching platform with ID ${platformId}:`, error);
    throw error;
  }
}

/**
 * Get platforms by status (active/inactive)
 */
export async function getPlatformsByStatusServer(status: string, authToken?: string): Promise<Platform[]> {
  try {
    console.log(`🔄 Fetching platforms with status: ${status}`);
    
    const response = await serverApiClient.get<Platform[]>(
      ENDPOINTS.PLATFORMS.BY_STATUS(status), // Using endpoint from endpoints file
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    console.log(`✅ Platforms with status ${status} fetched:`, response.data?.length || 0);
    return response.data || [];
  } catch (error) {
    console.error(`❌ Error fetching platforms with status ${status}:`, error);
    throw error;
  }
}

// =============================================================================
// EXTERNAL API ENDPOINTS - Server Functions
// =============================================================================

import { ExternalApiEndpoint, ActiveEndpointsResponse } from '@/types/platform';

/**
 * Get all active external API endpoints (server-side)
 * Calls FastAPI: GET /v0/external-api-endpoints/active/list
 */
export async function getActiveExternalApiEndpointsServer(
  authToken?: string
): Promise<ExternalApiEndpoint[]> {
  try {
    console.log('🔄 Server: Fetching active external API endpoints...');
    
    const response = await serverApiClient.get<ExternalApiEndpoint[]>(
      ENDPOINTS.EXTERNAL_API_ENDPOINTS.ACTIVE_LIST,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: Error from active endpoints API:', response.error);
      throw new Error(response.error.message);
    }
    
    const endpoints = Array.isArray(response.data) ? response.data : [];
    console.log('✅ Server: Active endpoints fetched:', endpoints.length);
    
    return endpoints;
  } catch (error) {
    console.error('❌ Server: Error fetching active endpoints:', error);
    throw error;
  }
}

/**
 * Get external API endpoint by code (server-side)
 * Calls FastAPI: GET /v0/external-api-endpoints/code/{endpoint_code}
 */
export async function getExternalApiEndpointByCodeServer(
  endpointCode: string,
  authToken?: string
): Promise<ExternalApiEndpoint | null> {
  try {
    console.log(`🔄 Server: Fetching endpoint with code: ${endpointCode}`);
    
    const response = await serverApiClient.get<ExternalApiEndpoint>(
      ENDPOINTS.EXTERNAL_API_ENDPOINTS.BY_CODE(endpointCode),
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`⚠️ Endpoint not found: ${endpointCode}`);
        return null;
      }
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Endpoint fetched:', response.data?.endpoint_name);
    return response.data || null;
  } catch (error) {
    console.error('❌ Server: Error fetching endpoint by code:', error);
    throw error;
  }
}