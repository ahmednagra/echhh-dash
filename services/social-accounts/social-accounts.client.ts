// src/services/social-accounts/social-accounts.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { UserExistsRequest, UserExistsResponse } from '@/types/social-accounts';

/**
 * Check if users exist in the database (Client-side)
 * @param platformAccountIds Array of platform account IDs to check
 * @returns Promise with results indicating which users exist
 */
export async function checkUsersExist(platformAccountIds: string[]): Promise<UserExistsResponse> {
  try {
    if (typeof window === 'undefined') {
      throw new Error('checkUsersExist can only be called from browser');
    }

    console.log('🔍 Client Service: Checking user existence for IDs:', platformAccountIds);

    // Check for authentication token
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const requestBody: UserExistsRequest = {
      platform_account_ids: platformAccountIds
    };

    const endpoint = ENDPOINTS.SOCIAL_ACCOUNTS.USER_EXISTS_NEXTJS;

    const response = await nextjsApiClient.post<UserExistsResponse>(
      endpoint,
      requestBody
    );

    if (response.error) {
      console.error('❌ Client Service: API error:', response.error);
      throw new Error(response.error.message || 'Failed to check user existence');
    }

    if (!response.data) {
      console.error('⚠️ Client Service: No response data received');
      throw new Error('Failed to check user existence');
    }

    console.log('✅ Client Service: User existence check completed:', response.data);
    return response.data;

  } catch (error) {
    console.error('💥 Client Service: Error in checkUsersExist:', error);
    throw error;
  }
}