// src/types/outreach-manager-campaigns.ts

import { AssignmentInfluencer } from '@/types/assignment-influencers';

export interface OutreachManagerCampaign {
  id: string;
  name: string;
  brand_name: string;
  status: {
    id: string;
    name: string;
  };
  company_id: string;
  created_at: string;
  updated_at: string;
  // Aggregated stats across all agents
  total_assigned: number;
  total_completed: number;
  total_pending: number;
  total_archived: number;
  completion_rate: number;
  // Campaign list info
  campaign_list_id: string | null;
  total_influencers_in_list: number;
  // Assignment info
  total_agents_assigned: number;
}

export interface OutreachManagerCampaignsResponse {
  success: boolean;
  campaigns: OutreachManagerCampaign[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  error?: string;
}

// LEGACY: Keep for backward compatibility
export interface CampaignInfluencerWithAgent {
  id: string;
  influencer_name: string;
  influencer_username: string;
  influencer_image: string;
  influencer_followers: number;
  influencer_is_verified: boolean;
  influencer_url: string | null;
  status: {
    id: string;
    name: string;
  };
  contact_info: {
    attempts: number;
    last_contacted_at: string | null;
    next_contact_at: string | null;
  };
  agent: {
    id: string;
    name: string;
  };
  price: number | null;
  currency: string | null;
  price_approval_status: string | null;
  assignment_id: string;
  campaign_influencer_id: string;
  created_at: string;
  updated_at: string;
}

// NEW: Agent info for mapping
export interface AgentInfo {
  id: string;
  name: string;
  email?: string;
  campaign_name?: string;  // ✅ ADD THIS LINE
}

// NEW: Updated response with AssignmentInfluencer format
export interface CampaignInfluencersWithAgentResponse {
  success: boolean;
  influencers: AssignmentInfluencer[];
  /** Map of influencer.id -> agent info */
  agentMap: Record<string, AgentInfo>;
  stats: {
    total_assigned: number;
    total_completed: number;
    total_pending: number;
    total_archived: number;
    completion_rate: number;
  };
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
   campaign_name?: string;  // ✅ ADD THIS LINE
  error?: string;
}

export interface GetOutreachManagerCampaignsRequest {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface GetCampaignInfluencersRequest {
  page?: number;
  page_size?: number;
  search?: string;
}

// ========== UNAPPROVED INFLUENCERS TYPES ==========

export interface UnapprovedInfluencersStats {
  total_unapproved: number;
  total_unapproved_value: number;
  currency_breakdown: Record<string, number>;
}

export interface UnapprovedInfluencersResponse {
  success: boolean;
  influencers: AssignmentInfluencer[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  stats: UnapprovedInfluencersStats;
  agent_map: Record<string, AgentInfo>;
  error?: string;
}

export interface GetUnapprovedInfluencersRequest {
  page?: number;
  page_size?: number;
  search?: string;
}