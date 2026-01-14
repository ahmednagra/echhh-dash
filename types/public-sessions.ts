// src/types/public-sessions.ts

export interface CreatePublicSessionRequest {
  session_type: string;
  resource_type: string;
  resource_id: string;
  expires_in_hours: number;
  page_name?: string; // 👈 NEW: Add page_name parameter (optional)
  permissions: {
    read: boolean;
    "comment:create": boolean;
    "comment:read": boolean;
    "comment:reply": boolean;
    "price_negotiation:create": boolean;
    "price_negotiation:read": boolean;
    "price_negotiation:approve": boolean;
    "price_negotiation:reject": boolean;
    "campaign_influencer:read"?: boolean;
    "campaign_influencer:update"?: boolean;
    "campaign_influencer:client_review"?: boolean; // New permission
    "campaign_influencer:shortlisted_status"?: boolean;
  };
  session_metadata: {
    client_name: string;
    client_company: string;
    client_email: string;
    client_role: string;
    visible_columns?: string[]; // Add this line
    selected_influencer_ids?: string[]; // Add this line
    page_name?: string; // 👈 MOVED: page_name now inside session_metadata
  };
}

export interface PublicSessionData {
  id: string;
  session_token: string;
  public_url: string;
  session_type: string;
  resource_type: string;
  resource_id: string;
  expires_at: string;
  page_name?: string; // 👈 NEW: Add page_name in response
  max_uses: number | null;
  current_uses: number;
  permissions: {
    read: boolean;
    "comment:read": boolean;
    "comment:reply": boolean;
    "comment:create": boolean;
    "price_negotiation:read": boolean;
    "price_negotiation:create": boolean;
    "price_negotiation:reject": boolean;
    "price_negotiation:approve": boolean;
    "campaign_influencer:read"?: boolean;
    "campaign_influencer:update"?: boolean;
    "campaign_influencer:client_review"?: boolean; // New permission
  };
  session_metadata: {
    client_name: string;
    client_role: string;
    client_email: string;
    client_company: string;
    visible_columns?: string[]; // Add this line
    selected_influencer_ids?: string[]; // Add this line
  };
  is_active: boolean;
  last_accessed_at: string | null;
  created_at: string;
  updated_at: string;
  can_comment: boolean;
  can_counter_price: boolean;
  can_view_pricing: boolean;
  can_view_contacts: boolean;
}

export interface CreatePublicSessionResponse {
  success: boolean;
  data: PublicSessionData;
  error?: string;
}

// Alternative: Direct response type (matches your actual API response)
export type CreatePublicSessionApiResponse = PublicSessionData;

// Extended version that includes visible_columns support
export interface CreatePublicSessionRequestExtended extends CreatePublicSessionRequest {
  session_metadata: {
    client_name: string;
    client_company: string;
    client_email: string;
    client_role: string;
    visible_columns?: string[]; // Add support for column visibility
    selected_influencer_ids?: string[]; // NEW: Support for filtering selected influencers
  };
}

// Extended version that includes visible_columns support
export interface PublicSessionDataExtended extends PublicSessionData {
  session_metadata: {
    client_name: string;
    client_role: string;
    client_email: string;
    client_company: string;
    visible_columns?: string[]; // Add support for column visibility
    selected_influencer_ids?: string[]; // NEW: Support for filtering selected influencers
  };
}