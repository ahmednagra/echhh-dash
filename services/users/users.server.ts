// src/services/users/users.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { User } from '@/types/auth';
import { 
  UserDetail,
  UpdateUserRequest,
  UserListResponse,
  UserStatsResponse,
  UserSearchParams,
  PasswordChangeRequest,
  PasswordChangeResponse
} from '@/types/users';


/**
 * Get current user profile from FastAPI backend (server-side)
 */
export async function getCurrentUserServer(authToken?: string): Promise<UserDetail> {
  try {
    console.log('🚀 Server: Starting getCurrentUserServer call');
    
    const endpoint = ENDPOINTS.AUTH.ME;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching current user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No current user data received from FastAPI');
      throw new Error('Current user not found');
    }
    
    console.log('✅ Server: Successfully fetched current user');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getCurrentUserServer:', error);
    throw error;
  }
}

/**
 * Update current user profile from FastAPI backend (server-side)
 * Uses FormData for all requests to maintain consistency
 */
export async function updateCurrentUserServer(
  updateData: UpdateUserRequest,
  authToken?: string
): Promise<User> {
  try {
    console.log('🚀 Server: Starting updateCurrentUserServer call');
    console.log('📋 Server: Update data:', {
      hasFirstName: !!updateData.first_name,
      hasLastName: !!updateData.last_name,
      hasFullName: !!updateData.full_name,
      hasPhoneNumber: !!updateData.phone_number,
      hasProfileImage: !!updateData.profile_image_url,
      fields: Object.keys(updateData)
    });
    
    const endpoint = ENDPOINTS.AUTH.ME;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    // Always use FormData for consistency
    const formData = new FormData();
    
    // Add all text fields
    if (updateData.first_name !== undefined) {
      formData.append('first_name', updateData.first_name || '');
    }
    if (updateData.last_name !== undefined) {
      formData.append('last_name', updateData.last_name || '');
    }
    if (updateData.full_name !== undefined) {
      formData.append('full_name', updateData.full_name || '');
    }
    if (updateData.phone_number !== undefined) {
      formData.append('phone_number', updateData.phone_number || '');
    }
    if (updateData.language !== undefined) {
      formData.append('language', updateData.language || '');
    }
    
    // Handle profile image if present
    if (updateData.profile_image_url && updateData.profile_image_url.startsWith('data:image/')) {
      console.log('🖼️ Server: Profile image detected, converting from base64');
      try {
        const base64Data = updateData.profile_image_url;
        const arr = base64Data.split(',');
        const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
        const bstr = Buffer.from(arr[1], 'base64');
        
        // Create a Blob and then File
        const blob = new Blob([bstr], { type: mime });
        const file = new File([blob], 'profile-image.jpg', { type: mime });
        
        formData.append('profile_image', file);
        console.log('✅ Server: Profile image converted and added to FormData');
      } catch (error) {
        console.error('❌ Server: Error converting base64 to file:', error);
        // Continue without image rather than failing completely
        console.log('⚠️ Server: Continuing update without profile image');
      }
    }
    
    // Use serverApiClient with FormData - handles everything consistently
    const response = await serverApiClient.put<User>(
      endpoint,
      formData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating current user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No updated user data received from FastAPI');
      throw new Error('Failed to update current user profile');
    }
    
    console.log('✅ Server: Successfully updated current user profile');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in updateCurrentUserServer:', error);
    throw error;
  }
}

/**
 * Change current user password from FastAPI backend (server-side)
 */
export async function changePasswordServer(
  passwordData: PasswordChangeRequest,
  authToken?: string
): Promise<PasswordChangeResponse> {
  try {
    console.log('🚀 Server: Starting changePasswordServer call');
    
    const endpoint = ENDPOINTS.AUTH.PASSWORD;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    // Send all three fields to match backend schema
    const requestData = {
      current_password: passwordData.current_password,
      new_password: passwordData.new_password,
      confirm_password: passwordData.confirm_password
    };
    
    const response = await serverApiClient.put<PasswordChangeResponse>(
      endpoint,
      requestData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error changing password:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No password change response received from FastAPI');
      throw new Error('Failed to change password');
    }
    
    console.log('✅ Server: Successfully changed password');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in changePasswordServer:', error);
    throw error;
  }
}

/**
 * Get all users from FastAPI backend (server-side)
 * Returns either UserDetail[] or UserListResponse depending on backend
 */
export async function getUsersServer(
  params?: UserSearchParams,
  authToken?: string
): Promise<UserListResponse | UserDetail[]> {
  try {
    console.log('🚀 Server: Starting getUsersServer call');
    console.log('📋 Server: Search params:', params);
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params) {
      if (params.skip !== undefined) queryParams.append('skip', params.skip.toString());
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.search) queryParams.append('search', params.search);
      if (params.user_type) queryParams.append('user_type', params.user_type);
      if (params.status) queryParams.append('status', params.status);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString 
      ? `${ENDPOINTS.USERS.GET_ALL}?${queryString}`
      : ENDPOINTS.USERS.GET_ALL;
    
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    // ✅ FIXED: Accept both array and paginated response formats
    const response = await serverApiClient.get<UserListResponse | UserDetail[]>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching users:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No users data received from FastAPI');
      return [];
    }
    
    // Check if response has pagination info
    if (Array.isArray(response.data)) {
      console.log(`✅ Server: Successfully fetched ${response.data.length} users (array format)`);
      return response.data;
    } else {
      console.log(`✅ Server: Successfully fetched ${response.data.users?.length || 0} users out of ${response.data.total || 0} total (paginated format)`);
      return response.data;
    }
  } catch (error) {
    console.error('💥 Server: Error in getUsersServer:', error);
    throw error;
  }
}

/**
 * Get a user by ID from FastAPI backend (server-side)
 */
export async function getUserServer(
  userId: string,
  authToken?: string
): Promise<UserDetail> {
  try {
    console.log(`🚀 Server: Starting getUserServer call for ${userId}`);
    
    const endpoint = ENDPOINTS.USERS.GET_BY_ID(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserDetail>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No user data received from FastAPI');
      throw new Error('User not found');
    }
    
    console.log('✅ Server: Successfully fetched user');
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error in getUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Update user from FastAPI backend (server-side)
 */
export async function updateUserServer(
  userId: string,
  updateData: UpdateUserRequest,
  authToken?: string
): Promise<User> {
  try {
    console.log(`🚀 Server: Starting updateUserServer call for ${userId}`);
    console.log('📋 Server: Update data:', updateData);
    
    const endpoint = ENDPOINTS.USERS.UPDATE(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.put<User>(
      endpoint,
      updateData,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating user:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No updated user data received from FastAPI');
      throw new Error('Failed to update user');
    }
    
    console.log('✅ Server: Successfully updated user');
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error in updateUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Delete user from FastAPI backend (server-side)
 */
export async function deleteUserServer(
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    console.log(`🚀 Server: Starting deleteUserServer call for ${userId}`);
    
    const endpoint = ENDPOINTS.USERS.DELETE(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.delete(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error deleting user:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Successfully deleted user');
  } catch (error) {
    console.error(`💥 Server: Error in deleteUserServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Get user statistics from FastAPI backend (server-side)
 */
export async function getUserStatsServer(authToken?: string): Promise<UserStatsResponse> {
  try {
    console.log('🚀 Server: Starting getUserStatsServer call');
    
    const endpoint = '/admin/users/stats';
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.get<UserStatsResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error fetching user stats:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('⚠️ Server: No user stats data received from FastAPI');
      throw new Error('Failed to get user statistics');
    }
    
    console.log('✅ Server: Successfully fetched user statistics');
    return response.data;
  } catch (error) {
    console.error('💥 Server: Error in getUserStatsServer:', error);
    throw error;
  }
}

/**
 * Create new user via FastAPI backend (server-side)
 * Handles B2B, B2C, Platform, and Influencer user types
 */
export async function createUserServer(
  userData: any,
  authToken?: string
): Promise<any> {
  try {
    console.log('🚀 Server: Starting createUserServer call');
    console.log('📋 Server: User data:', userData);

    // Determine the correct endpoint and format data based on user type
    let endpoint: string;
    let requestData: any;

    switch (userData.user_type) {
      case 'b2c':
      case 'b2b':
        // Use /auth/register for B2C/B2B users
        endpoint = '/auth/register';
        
        // Validate required fields
        if (!userData.first_name || !userData.last_name) {
          throw new Error('First name and last name are required');
        }
        
        // Format data according to UserCreate schema
        requestData = {
          // Required fields for UserCreate
          email: userData.email,
          password: userData.password,
          user_type: userData.user_type,
          first_name: userData.first_name.trim(),
          last_name: userData.last_name.trim(),
          
          // Compute full_name (required by UserCreate schema)
          full_name: `${userData.first_name.trim()} ${userData.last_name.trim()}`,
          
          // Optional user fields
          phone_number: userData.phone_number || undefined,
          role_name: userData.role || undefined,  // Map 'role' to 'role_name'
          
          // Company association (for new company)
          ...(userData.company_association === 'new' && {
            company_name: userData.company_name,
            company_domain: userData.company_domain || undefined,
          }),
          
          // Company association (for existing company)
          ...(userData.company_association === 'existing' && {
            company_id: userData.company_id,
          }),
          
          // Optional fields
          bio: userData.bio,
          location: userData.location,
          timezone: userData.timezone,
          language: userData.language,
        };
        break;

      case 'platform':
        // For platform users, call the create-admin endpoint
        endpoint = '/auth/create-admin';
        
        // Validate required fields
        if (!userData.first_name || !userData.last_name) {
          throw new Error('First name and last name are required');
        }
        
        requestData = {
          user_type: 'platform', // ADD THIS - required by backend
          first_name: userData.first_name,
          last_name: userData.last_name,
          full_name: `${userData.first_name.trim()} ${userData.last_name.trim()}`, // ADD THIS - required by backend
          email: userData.email,
          phone_number: userData.phone_number,
          password: userData.password,
          role: userData.role,
          job_title: userData.job_title,
          department: userData.department,
          bio: userData.bio,
          location: userData.location,
          timezone: userData.timezone,
          language: userData.language,
          email_verified: userData.email_verified,
          account_status: userData.account_status,
        };
        break;

      case 'influencer':
        // For influencers, call the register endpoint
        endpoint = '/auth/register';
        
        requestData = {
          user_type: 'influencer',
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone_number: userData.phone_number,
          password: userData.password,
          bio: userData.bio,
          location: userData.location,
          timezone: userData.timezone,
          language: userData.language,
        };
        break;

      default:
        throw new Error(`Invalid user type: ${userData.user_type}`);
    }

    console.log(`📞 Server: Calling FastAPI endpoint: ${endpoint}`);
    console.log('📦 Server: Request data:', requestData);

    // Call FastAPI backend using serverApiClient
    const response = await serverApiClient.post(
      endpoint,
      requestData,
      {},
      authToken
    );

    console.log('📡 Server: Response received:', response);

    // Handle error response
    if (response.error) {
      console.error('❌ Server: Error from FastAPI:', response.error);
      throw new Error(response.error.message || 'Failed to create user');
    }

    // Check for response data
    if (!response.data) {
      throw new Error('No response data received from backend');
    }

    console.log('✅ Server: User created successfully');
    return response.data;

  } catch (error) {
    console.error('💥 Server: Error in createUserServer:', error);
    throw error;
  }
}

/**
 * Update user status from FastAPI backend (server-side)
 */
export async function updateUserStatusServer(
  userId: string,
  status: string,
  authToken?: string
): Promise<void> {
  try {
    console.log(`🚀 Server: Starting updateUserStatusServer call for ${userId}`);
    console.log('📋 Server: New status:', status);
    
    // FastAPI expects new_status as a query parameter
    const endpoint = `${ENDPOINTS.USERS.UPDATE_STATUS(userId)}?new_status=${status}`;
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.put(
      endpoint,
      {}, // Empty body since new_status is a query param
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error updating user status:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Successfully updated user status');
  } catch (error) {
    console.error(`💥 Server: Error in updateUserStatusServer for ${userId}:`, error);
    throw error;
  }
}

/**
 * Verify user email from FastAPI backend (server-side)
 */
export async function verifyUserEmailServer(
  userId: string,
  authToken?: string
): Promise<void> {
  try {
    console.log(`🚀 Server: Starting verifyUserEmailServer call for ${userId}`);
    
    const endpoint = ENDPOINTS.USERS.VERIFY_EMAIL(userId);
    console.log(`📞 Server: Making API call to ${endpoint}`);
    
    const response = await serverApiClient.post(
      endpoint,
      {}, // Empty body as the API doesn't require any data
      {},
      authToken
    );
    
    if (response.error) {
      console.error('❌ Server: FastAPI Error verifying user email:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('✅ Server: Successfully verified user email');
  } catch (error) {
    console.error(`💥 Server: Error in verifyUserEmailServer for ${userId}:`, error);
    throw error;
  }
}

export async function getUsersByTypeServer(/* params */) {
  // implementation
}