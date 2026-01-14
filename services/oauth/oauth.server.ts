// src/services/oauth/oauth.server.ts - FIXED VERSION
// Server-side service for calling FastAPI OAuth backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  OAuthProvidersResponse,
  OAuthAuthorizationResponse,
  OAuthCallbackResponse,
  LinkedAccountsResponse,
  UnlinkAccountResponse,
  OAuthSuccessResponse,
  OAuthInitiateRequest,
  OAuthCallbackRequest
} from '@/types/oauth';

/**
 * Get available OAuth providers from FastAPI backend (server-side)
 */
export async function getOAuthProvidersServer(
  authToken?: string
): Promise<OAuthProvidersResponse> {
  try {
    console.log('Server: Fetching OAuth providers');
    
    const endpoint = ENDPOINTS.OAUTH.PROVIDERS;
    
    const response = await serverApiClient.get<OAuthProvidersResponse>(
      endpoint,
      { auth: false }, // This endpoint might not require auth
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching OAuth providers:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No OAuth providers data received from FastAPI');
      throw new Error('No OAuth providers data received');
    }
    
    console.log('Server: OAuth providers fetched successfully:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching OAuth providers:', error);
    throw error;
  }
}

/**
 * Initiate OAuth login flow from FastAPI backend (server-side)
 */
export async function initiateOAuthServer(
  provider: string,
  linkMode: boolean = false,
  userType?: string,
  authToken?: string
): Promise<OAuthAuthorizationResponse> {
  try {
    console.log(`Server: Initiating OAuth for provider ${provider}, link mode: ${linkMode}, user type: ${userType}`);
    
    let endpoint = linkMode 
      ? ENDPOINTS.OAUTH.LINK(provider)
      : ENDPOINTS.OAUTH.LOGIN(provider);
    
    // Add user_type query parameter for non-link mode
    if (!linkMode && userType) {
      endpoint += `?user_type=${userType}`;
    }
    
    const response = await serverApiClient.get<OAuthAuthorizationResponse>(
      endpoint,
      { auth: linkMode }, // Link mode requires auth, login doesn't
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error initiating OAuth:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No OAuth authorization data received from FastAPI');
      throw new Error('No OAuth authorization data received');
    }
    
    console.log('Server: OAuth initiation successful:', response.data.provider);
    return response.data;
  } catch (error) {
    console.error(`Server: Error initiating OAuth for ${provider}:`, error);
    throw error;
  }
}

/**
 * Handle OAuth callback from FastAPI backend (server-side)
 * FIXED: Removed userType parameter since it's already in state
 */
export async function handleOAuthCallbackServer(
  provider: string,
  code: string,
  state: string,
  link?: string,
  authToken?: string
): Promise<OAuthCallbackResponse> {
  try {
    console.log(`Server: Handling OAuth callback for provider ${provider}`);
    
    const endpoint = ENDPOINTS.OAUTH.CALLBACK(provider);
    
    // Build query parameters - REMOVED user_type since it's in state
    const params = new URLSearchParams({
      code,
      state,
      ...(link && { link })
    });
    
    const fullEndpoint = `${endpoint}?${params.toString()}`;
    
    const response = await serverApiClient.get<OAuthCallbackResponse>(
      fullEndpoint,
      { auth: false }, // Callback doesn't require auth initially
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error handling OAuth callback:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No OAuth callback data received from FastAPI');
      throw new Error('No OAuth callback data received');
    }
    
    console.log('Server: OAuth callback handled successfully:', response.data.provider);
    return response.data;
  } catch (error) {
    console.error(`Server: Error handling OAuth callback for ${provider}:`, error);
    throw error;
  }
}

/**
 * Get linked OAuth accounts from FastAPI backend (server-side)
 */
export async function getLinkedAccountsServer(
  authToken: string
): Promise<LinkedAccountsResponse> {
  try {
    console.log('Server: Fetching linked OAuth accounts');
    
    const endpoint = ENDPOINTS.OAUTH.ACCOUNTS;
    
    const response = await serverApiClient.get<LinkedAccountsResponse>(
      endpoint,
      { auth: true },
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching linked accounts:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No linked accounts data received from FastAPI');
      throw new Error('No linked accounts data received');
    }
    
    console.log('Server: Linked accounts fetched successfully:', response.data.count);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching linked accounts:', error);
    throw error;
  }
}

/**
 * Unlink OAuth account from FastAPI backend (server-side)
 */
export async function unlinkOAuthAccountServer(
  accountId: string,
  authToken: string
): Promise<UnlinkAccountResponse> {
  try {
    console.log(`Server: Unlinking OAuth account ${accountId}`);
    
    const endpoint = ENDPOINTS.OAUTH.UNLINK(accountId);
    
    const response = await serverApiClient.delete<UnlinkAccountResponse>(
      endpoint,
      { auth: true },
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error unlinking account:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No unlink response data received from FastAPI');
      throw new Error('No unlink response data received');
    }
    
    console.log('Server: OAuth account unlinked successfully:', response.data.provider);
    return response.data;
  } catch (error) {
    console.error(`Server: Error unlinking OAuth account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Refresh OAuth token from FastAPI backend (server-side)
 */
export async function refreshOAuthTokenServer(
  accountId: string,
  authToken: string
): Promise<OAuthSuccessResponse> {
  try {
    console.log(`Server: Refreshing OAuth token for account ${accountId}`);
    
    const endpoint = ENDPOINTS.OAUTH.REFRESH(accountId);
    
    const response = await serverApiClient.post<OAuthSuccessResponse>(
      endpoint,
      {}, // Empty body for refresh
      { auth: true },
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error refreshing OAuth token:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No refresh response data received from FastAPI');
      throw new Error('No refresh response data received');
    }
    
    console.log('Server: OAuth token refreshed successfully');
    return response.data;
  } catch (error) {
    console.error(`Server: Error refreshing OAuth token for ${accountId}:`, error);
    throw error;
  }
}