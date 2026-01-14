// src/types/auth.ts - Enhanced with outreach agent types and agent-specific routing

export interface LoginCredentials {
  username: string;
  password: string;
  remember?: boolean;
}

// Main user types (dashboard level)
export type UserType = 'platform' | 'b2c' | 'influencer';

// Agent types for outreach agents
export type AgentType = 'instagram' | 'email' | 'whatsapp';

// Detailed role types for granular permissions
export type PlatformRole = 
  | 'platform_super_admin'
  | 'platform_admin'
  | 'platform_manager'
  | 'platform_developer'
  | 'platform_customer_support'
  | 'platform_account_manager'
  | 'platform_financial_manager'
  | 'platform_content_moderator'
  | 'platform_data_analyst'
  | 'platform_operations_manager'
  | 'platform_outreach_manager'
  | 'platform_agent';

export type CompanyRole = 
  | 'b2c_company_owner'
  | 'b2c_company_admin'
  | 'b2c_marketing_director'
  | 'b2c_campaign_manager'
  | 'b2c_campaign_executive'
  | 'b2c_social_media_manager'
  | 'b2c_content_creator'
  | 'b2c_brand_manager'
  | 'b2c_performance_analyst'
  | 'b2c_finance_manager'
  | 'b2c_account_coordinator'
  | 'b2c_viewer';

export type InfluencerRole = 
  | 'influencer'
  | 'influencer_manager';

export type DetailedRole = PlatformRole | CompanyRole | InfluencerRole;

// Permission structure (for future implementation)
export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: DetailedRole;
  description: string;
  permissions?: Permission[]; // Optional for future use
}

export interface PermissionCheck {
  resource: string;
  action: string;
  context?: Record<string, any>;
}
 
export interface User {
  id: string;
  email: string;
  first_name: string | null;    // Updated field
  last_name: string | null;     // Updated field
  full_name: string;            // Keep for backward compatibility
  phone_number: string | null;
  status: string;
  email_verified: boolean;
  profile_image_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  user_type: UserType;
  // Optional fields that might exist in some contexts
  company_name?: string;
  company_domain?: string;
}

export interface Company {
  id: string;
  name: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

// Updated OutreachAgent interface to match the backend response
export interface OutreachAgent {
  id: string;
  agent_type_id: string;
  agent_type_name: AgentType; // Changed to use AgentType
  agent_type_display_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: User;
  roles: Role[];
  refresh_token: string;
  company: Company[] | null; // Changed to match backend response
  outreach_agent?: OutreachAgent; // Changed from array to single object to match backend
}

export interface RegisterCredentials {
  first_name?: string;          // Updated field
  last_name?: string;           // Updated field
  full_name?: string;           // Keep for backward compatibility
  email: string;
  password: string;
  confirm_password: string;
  user_type: UserType;
  company_name?: string;
  company_domain?: string;
}

export interface RegistrationData {
  email: string;
  password: string;
  first_name?: string;          // Updated field
  last_name?: string;           // Updated field
  full_name?: string;           // Keep for backward compatibility
  phone_number?: string;
  user_type: UserType;
  role_name: string;
  company_name?: string;
  company_domain?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  roles: Role[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Role checking utilities types
export interface RoleCheckResult {
  hasRole: boolean;
  userType: UserType | null;
  detailedRole: DetailedRole | null;
  dashboardRoute: string;
  // Added agent-specific routing
  agentType?: AgentType | null;
  agentDashboardRoute?: string;
}

// Agent-specific types (for campaign list assignments)
export interface AgentAssignment {
  id: string;
  agent_id: string;
  list_id: string;
  assigned_at: string;
  campaign_name: string;
  company_name: string;
  status: 'active' | 'completed' | 'paused';
}

export interface CampaignListMember {
  id: string;
  list_id: string;
  influencer_id: string;
  influencer_username: string;
  influencer_name: string;
  influencer_followers: string;
  influencer_engagement_rate: string;
  contact_status: 'not_contacted' | 'contacted' | 'responded' | 'declined' | 'accepted';
  contact_attempts: number;
  last_contacted_at: string | null;
  notes: string | null;
  assigned_agent_id: string;
  created_at: string;
  updated_at: string;
}