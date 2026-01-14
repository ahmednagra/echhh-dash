// OAuth Callback Types
export interface OAuthCallbackRequest {
  code: string;
  state: string;
}

export interface OAuthCallbackSuccessResponse {
  success: boolean;
  message: string;
  connection: AgentSocialConnection;
  redirect_url: string;
}

export interface PlatformConnectionRequest {
  platform_id: string;
  oauth_code?: string;
  oauth_state?: string;
  platform_specific_data?: Record<string, any>;
}
// Types based on your backend schemas
export interface AgentSocialConnectionCreate {
  user_id: string;
  platform_id: string;
  platform_user_id: string;
  platform_username: string;
  display_name?: string;
  profile_image_url?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_access_token?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  additional_data?: Record<string, any>;
}

export interface AgentSocialConnectionUpdate {
  platform_username?: string;
  display_name?: string;
  profile_image_url?: string;
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_access_token?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  playwright_session_data?: Record<string, any>;
  automation_error_count?: number;
  last_error_message?: string;
  is_active?: boolean;
  additional_data?: Record<string, any>;
  status_id?: string;
}

export interface AgentSocialConnection {
  id: string;
  user_id: string;
  platform_id: string;
  platform_user_id: string;
  platform_username: string;
  display_name?: string;
  profile_image_url?: string;
  expires_at?: string;
  last_oauth_check_at?: string;
  scope?: string;
  instagram_business_account_id?: string;
  facebook_page_id?: string;
  facebook_page_name?: string;
  automation_capabilities?: Record<string, any>;
  last_automation_use_at?: string;
  automation_error_count: number;
  last_error_message?: string;
  last_error_at?: string;
  is_active: boolean;
  additional_data?: Record<string, any>;
  status_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  platform?: {
    id: string;
    name: string;
    logo_url?: string;
    category?: string;
  };
  agent?: {
    id: string;
    assigned_user_id: string;
    is_automation_enabled: boolean;
  };
  status?: {
    id: string;
    name: string;
    description?: string;
  };
}

export interface AgentSocialConnectionsPaginatedResponse {
  connections: AgentSocialConnection[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PlatformConnectionStatus {
  platform_id: string;
  platform_name: string;
  is_connected: boolean;
  connection_count: number;
  active_connections: number;
  last_connected?: string;
}

export interface UserPlatformConnectionsStatus {
  user_id: string;
  platforms: PlatformConnectionStatus[];
  total_connections: number;
  active_connections: number;
}

export interface TokenValidationResponse {
  connection_id: string;
  is_valid: boolean;
  expires_at?: string;
  expires_in_hours?: number;
  needs_renewal: boolean;
  last_check: string;
}

export interface AutomationStatusResponse {
  connection_id: string;
  is_automation_enabled: boolean;
  automation_capabilities?: Record<string, any>;
  last_automation_use?: string;
  error_count: number;
  last_error?: string;
}

export interface ConnectionHealthCheck {
  connection_id: string;
  platform_name: string;
  is_healthy: boolean;
  last_successful_operation?: string;
  issues: string[];
  recommendations: string[];
}

// Types for OAuth flow
export interface OAuthInitiateRequest {
  platform_id: string;
  additional_scopes?: string[];
  redirect_url?: string;
}

export interface OAuthInitiateResponse {
  authorization_url: string;
  state: string;
  platform: string;
  expires_in: number;
  instructions: string;
}

export interface OAuthStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  connection_id?: string;
  platform: string;
  created_at?: string;
  error_message?: string;
}