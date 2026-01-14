// src/types/oauth.ts - FIXED TO MATCH LoginResponse STRUCTURE
export interface OAuthProvider {
  provider: string;
  client_id: string;
  authorize_url: string;
  scope: string;
  enabled: boolean;
}

export interface OAuthProvidersResponse {
  providers: OAuthProvider[];
  count: number;
  redirect_url: string;
}

export interface OAuthAuthorizationResponse {
  authorization_url: string;
  state: string;
  provider: string;
  link_mode: boolean;
}

// Import the standard auth types for consistency
import { User, Role, Company } from './auth';

// OAuth Callback Response - MATCHES LoginResponse structure with OAuth fields
export interface OAuthCallbackResponse {
  // Standard LoginResponse fields (matching auth.ts LoginResponse)
  access_token?: string;
  token_type?: string;
  expires_in: number;
  user: User;
  roles: Role[];
  refresh_token: string;
  company: Company[];
  
  // OAuth-specific fields
  message: string;
  provider: string;
  login_method?: string; // 'oauth_login', 'oauth_signup', 'oauth_link', etc.
  oauth_account_id?: string;
  linked_to_user?: string;
  
  // Completion flags for OAuth registration flows
  needs_completion?: boolean;
  completion_type?: 'company' | 'influencer' | null;
  redirect_path?: string;
}

export interface LinkedOAuthAccount {
  id: string;
  provider: string;
  username?: string;
  display_name?: string;
  email?: string;
  profile_image_url?: string;
  connected_at: string;
  last_updated: string;
  expires_at?: string;
  scope?: string;
}

export interface LinkedAccountsResponse {
  linked_accounts: LinkedOAuthAccount[];
  count: number;
}

export interface UnlinkAccountResponse {
  message: string;
  provider: string;
  unlinked_at: string;
}

export interface OAuthSuccessResponse {
  message: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface OAuthErrorResponse {
  error: string;
  error_description?: string;
  error_uri?: string;
  state?: string;
}

// Request types
export interface OAuthInitiateRequest {
  provider: string;
  link_mode?: boolean;
  user_type?: string;
}

export interface OAuthCallbackRequest {
  provider: string;
  code: string;
  state: string;
  link?: string;
}

// API Response wrappers
export interface OAuthApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type CreateOAuthResponse = OAuthApiResponse<OAuthAuthorizationResponse>;
export type GetProvidersResponse = OAuthApiResponse<OAuthProvidersResponse>;
export type HandleCallbackResponse = OAuthApiResponse<OAuthCallbackResponse>;
export type GetLinkedAccountsResponse = OAuthApiResponse<LinkedAccountsResponse>;
export type UnlinkAccountApiResponse = OAuthApiResponse<UnlinkAccountResponse>;
export type RefreshTokenResponse = OAuthApiResponse<OAuthSuccessResponse>;