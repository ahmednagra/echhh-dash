// src/services/social-accounts/social-accounts.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { UserExistsRequest, UserExistsResponse } from '@/types/social-accounts';

/**
 * Check if users exist in the database (Server-side)
 * @param platformAccountIds Array of platform account IDs to check
 * @param authToken Authentication token for the request
 * @returns Promise with results indicating which users exist
 */
export async function checkUsersExistServer(
  data: UserExistsRequest,
  authToken: string
): Promise<UserExistsResponse> {
  try {
    console.log('🔍 Server Service: Checking user existence for IDs:', data.platform_account_ids);

    const endpoint = ENDPOINTS.SOCIAL_ACCOUNTS.USER_EXISTS;
    
    const response = await serverApiClient.post<UserExistsResponse>(
      endpoint,
      data,
      {},
      authToken
    );

    if (response.error) {
      console.error('❌ Server Service: API error:', response.error);
      throw new Error(response.error.message || 'Failed to check user existence');
    }

    if (!response.data) {
      console.error('⚠️ Server Service: No response data received from API');
      throw new Error('No response data received from API');
    }

    console.log('✅ Server Service: User existence check completed:', response.data);
    return response.data;

  } catch (error) {
    console.error('💥 Server Service: Error in checkUsersExistServer:', error);
    throw error;
  }
}