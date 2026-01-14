// src/services/roles/roles.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { GetRolesResponse, Role } from '@/types/roles';

const API_VERSION = '/api/v0';

/**
 * Fetch roles from the API based on user type
 * @param userType - The type of user ('b2c', 'b2b', 'platform', or 'influencer')
 * @returns Promise<Role[]> - Array of role options
 */
export async function fetchRoles(userType: 'b2c' | 'b2b' | 'platform' | 'influencer'): Promise<Role[]> {
  try {
    // Check if running in browser
    if (typeof window === 'undefined') {
      throw new Error('fetchRoles can only be called from browser');
    }

    // Construct the full endpoint with query parameter
    const endpoint = `${API_VERSION}${ENDPOINTS.ROLES.GET_ALL}?user_type=${userType}`;

    // Make the GET request
    const response = await nextjsApiClient.get<GetRolesResponse>(endpoint);

    // Handle error response
    if (response.error) {
      throw new Error(response.error.message || 'Failed to fetch roles');
    }

    // Validate response data
    if (!response.data) {
      throw new Error('No data received from roles API');
    }

    if (!response.data.success) {
      throw new Error(response.data.error || 'Failed to fetch roles');
    }

    // Filter out super admin role and return the filtered data
    const filteredRoles = response.data.data.filter(
      role => role.value !== 'platform_super_admin'
    );

    return filteredRoles;
  } catch (error) {
    console.error('Client Service: Error fetching roles:', error);
    throw error;
  }
}