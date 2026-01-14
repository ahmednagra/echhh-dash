  // src/services/oauth/oauth.service.ts - FIXED VERSION
  'use client';

  import { nextjsApiClient } from '@/lib/nextjs-api';
  import { 
    OAuthProvidersResponse,
    OAuthAuthorizationResponse,
    OAuthCallbackResponse,
    LinkedAccountsResponse,
    UnlinkAccountResponse,
    OAuthSuccessResponse,
    GetProvidersResponse,
    CreateOAuthResponse,
    HandleCallbackResponse,
    GetLinkedAccountsResponse,
    UnlinkAccountApiResponse,
    RefreshTokenResponse
  } from '@/types/oauth';

  /**
   * Get available OAuth providers via Next.js API route (client-side)
   */
  export async function getOAuthProviders(): Promise<OAuthProvidersResponse> {
    try {
      console.log('🚀 Client Service: Starting getOAuthProviders call');
      
      const endpoint = '/api/v0/oauth/providers';
      console.log(`📞 Client Service: Making API call to ${endpoint}`);
      
      const response = await nextjsApiClient.get<GetProvidersResponse>(endpoint, { auth: false });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success || !response.data.data) {
        console.warn('⚠️ Client Service: No valid OAuth providers data received');
        throw new Error(response.data?.error || 'Failed to get OAuth providers');
      }
      
      console.log('✅ Client Service: Successfully fetched OAuth providers');
      return response.data.data;
    } catch (error) {
      console.error('💥 Client Service: Error in getOAuthProviders:', error);
      throw error;
    }
  }

  /**
   * Initiate OAuth login/link flow via Next.js API route (client-side)
   */
  export async function initiateOAuth(
    provider: string, 
    linkMode: boolean = false,
    userType?: 'influencer' | 'b2c' | 'platform' // FIXED: Changed from = 'platform' to optional
  ): Promise<OAuthAuthorizationResponse> {
    try {
      console.log(`🚀 Client Service: Starting initiateOAuth call for ${provider}`, {
        linkMode,
        userType: userType || 'undefined (login page)' // FIXED: Better logging
      });
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('initiateOAuth can only be called from browser');
      }
      
      // For link mode, check for auth token
      if (linkMode) {
        const token = localStorage.getItem('accessToken');
        console.log('🔑 Client Service: Token check for link mode:', token ? 'Token exists' : 'No token found');
        
        if (!token) {
          throw new Error('No authentication token found for link mode');
        }
      }
      
      const endpoint = linkMode 
        ? `/api/v0/oauth/${provider}/link`
        : `/api/v0/oauth/${provider}/login`;
      
      // FIXED: Only add user_type query parameter if userType is defined
      const url = linkMode 
        ? endpoint 
        : userType 
          ? `${endpoint}?user_type=${userType}` // Registration pages
          : endpoint; // Login pages (no user_type parameter)
      
      console.log(`📞 Client Service: Making API call to ${url}`);
      
      const response = await nextjsApiClient.get<CreateOAuthResponse>(url, { auth: linkMode });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success || !response.data.data) {
        console.warn('⚠️ Client Service: No valid OAuth authorization data received');
        throw new Error(response.data?.error || 'Failed to initiate OAuth');
      }
      
      console.log('✅ Client Service: Successfully initiated OAuth');
      return response.data.data;
    } catch (error) {
      console.error('💥 Client Service: Error in initiateOAuth:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback via Next.js API route (client-side)
   * FIXED: Removed user_type parameter since it's already in state
   */
  export async function handleOAuthCallback(
    provider: string,
    code: string,
    state: string,
    link?: string
  ): Promise<OAuthCallbackResponse> {
    try {
      console.log(`🚀 Client Service: Starting handleOAuthCallback for ${provider}`);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('handleOAuthCallback can only be called from browser');
      }
      
      const endpoint = `/api/v0/oauth/callback/${provider}`;
      
      // Build query parameters - REMOVED user_type since it's in state
      const params = new URLSearchParams({
        code,
        state,
        ...(link && { link })
      });
      
      const fullEndpoint = `${endpoint}?${params.toString()}`;
      console.log(`📞 Client Service: Making API call to ${fullEndpoint}`);
      
      const response = await nextjsApiClient.get<HandleCallbackResponse>(fullEndpoint, { auth: false });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success || !response.data.data) {
        console.warn('⚠️ Client Service: No valid OAuth callback data received');
        throw new Error(response.data?.error || 'OAuth callback failed');
      }
      
      console.log('✅ Client Service: Successfully handled OAuth callback');
      return response.data.data;
    } catch (error) {
      console.error('💥 Client Service: Error in handleOAuthCallback:', error);
      throw error;
    }
  }

  /**
   * Get linked OAuth accounts via Next.js API route (client-side)
   */
  export async function getLinkedAccounts(): Promise<LinkedAccountsResponse> {
    try {
      console.log('🚀 Client Service: Starting getLinkedAccounts call');
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('getLinkedAccounts can only be called from browser');
      }
      
      // Check for auth token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = '/api/v0/oauth/accounts';
      console.log(`📞 Client Service: Making API call to ${endpoint}`);
      
      const response = await nextjsApiClient.get<GetLinkedAccountsResponse>(endpoint, { auth: true });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success) {
        console.warn('⚠️ Client Service: No valid linked accounts data received');
        throw new Error(response.data?.error || 'Failed to get linked accounts');
      }
      
      const accounts = response.data.data || { linked_accounts: [], count: 0 };
      console.log(`✅ Client Service: Successfully fetched ${accounts.count} linked accounts`);
      
      return accounts;
    } catch (error) {
      console.error('💥 Client Service: Error in getLinkedAccounts:', error);
      throw error;
    }
  }

  /**
   * Unlink OAuth account via Next.js API route (client-side)
   */
  export async function unlinkOAuthAccount(accountId: string): Promise<UnlinkAccountResponse> {
    try {
      console.log(`🚀 Client Service: Starting unlinkOAuthAccount call for ${accountId}`);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('unlinkOAuthAccount can only be called from browser');
      }
      
      // Check for auth token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = `/api/v0/oauth/accounts/${accountId}`;
      console.log(`📞 Client Service: Making DELETE call to ${endpoint}`);
      
      const response = await nextjsApiClient.delete<UnlinkAccountApiResponse>(endpoint, { auth: true });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success || !response.data.data) {
        console.warn('⚠️ Client Service: No valid unlink response received');
        throw new Error(response.data?.error || 'Failed to unlink account');
      }
      
      console.log('✅ Client Service: Successfully unlinked OAuth account');
      return response.data.data;
    } catch (error) {
      console.error('💥 Client Service: Error in unlinkOAuthAccount:', error);
      throw error;
    }
  }

  /**
   * Refresh OAuth token via Next.js API route (client-side)
   */
  export async function refreshOAuthToken(accountId: string): Promise<OAuthSuccessResponse> {
    try {
      console.log(`🚀 Client Service: Starting refreshOAuthToken call for ${accountId}`);
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('refreshOAuthToken can only be called from browser');
      }
      
      // Check for auth token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = `/api/v0/oauth/refresh/${accountId}`;
      console.log(`📞 Client Service: Making POST call to ${endpoint}`);
      
      const response = await nextjsApiClient.post<RefreshTokenResponse>(endpoint, {}, { auth: true });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status,
        success: response.data?.success
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data || !response.data.success || !response.data.data) {
        console.warn('⚠️ Client Service: No valid refresh response received');
        throw new Error(response.data?.error || 'Failed to refresh token');
      }
      
      console.log('✅ Client Service: Successfully refreshed OAuth token');
      return response.data.data;
    } catch (error) {
      console.error('💥 Client Service: Error in refreshOAuthToken:', error);
      throw error;
    }
  }

  /**
   * Complete company registration after OAuth signup
   */
  export async function completeCompanyRegistration(companyData: {
    company_name: string;
    company_domain: string;
  }): Promise<any> {
    try {
      console.log('🚀 Client Service: Starting completeCompanyRegistration call');
      
      // Check if we're in browser environment
      if (typeof window === 'undefined') {
        console.error('❌ Client Service: Not in browser environment');
        throw new Error('completeCompanyRegistration can only be called from browser');
      }
      
      // Check for auth token
      const token = localStorage.getItem('accessToken');
      console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const endpoint = '/api/v0/auth/complete-company-registration';
      console.log(`📞 Client Service: Making POST call to ${endpoint}`);
      
      const response = await nextjsApiClient.post<any>(endpoint, companyData, { auth: true });
      
      console.log('📦 Client Service: Raw API response:', {
        hasError: !!response.error,
        hasData: !!response.data,
        status: response.status
      });
      
      if (response.error) {
        console.error('❌ Client Service: API returned error:', response.error);
        throw new Error(response.error.message);
      }
      
      if (!response.data) {
        console.warn('⚠️ Client Service: No valid response received');
        throw new Error('Failed to complete company registration');
      }
      
      console.log('✅ Client Service: Successfully completed company registration');
      return response.data;
    } catch (error) {
      console.error('💥 Client Service: Error in completeCompanyRegistration:', error);
      throw error;
    }
  }

  /**
   * Redirect to OAuth provider (client-side utility)
   * SIMPLIFIED: Removed user_type parameter since it's already in authorization URL
   */
  export function redirectToOAuthProvider(authorizationUrl: string): void {
    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Cannot redirect outside browser environment');
      return;
    }
    
    console.log('🔄 Client Service: Redirecting to OAuth provider:', authorizationUrl);
    window.location.href = authorizationUrl;
  }