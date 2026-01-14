// src/types/assignments.ts

// Completion status type for filtering assignments
export type CompletionStatus = 'completed' | 'incomplete' | undefined;

export interface MessageTemplate {
  id: string;
  subject: string;
  content: string;
  template_type: 'initial' | 'followup';
  followup_sequence: number | null;
  followup_delay_hours: number | null;
}

export interface Campaign {
  id: string;
  name: string;
  brand_name: string;
  description: string | null;
  status_id: string;
  start_date: string | null;
  end_date: string | null;
  message_templates: MessageTemplate[];
}

export interface CampaignList {
  id: string;
  campaign_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentStatus {
  id: string;
  name: string;
}

export interface AgentAssignment {
  outreach_agent_id: string;
  campaign_list_id: string;
  status_id: string;
  assigned_influencers_count: number;
  completed_influencers_count: number;
  pending_influencers_count: number;
  archived_influencers_count: number | null;
  assigned_at: string;
  completed_at: string | null;
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  campaign: Campaign;
  campaign_list: CampaignList;
  status: AssignmentStatus;
}

export interface AgentAssignmentsPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface AgentAssignmentsResponse {
  assignments: AgentAssignment[];
  pagination: AgentAssignmentsPagination;
}

// Legacy types for backward compatibility
export interface Agent {
  id: string;
  name: string;
  platform_id: string;
  is_available: boolean;
  status_id: string | null;
}

export interface Assignment {
  id: string;
  list_id: string;
  agent_id: string;
  status_id: string;
  created_at: string;
  updated_at: string;
  agent: Agent;
  campaign_list: CampaignList;
  campaign: Campaign;
  status: AssignmentStatus;
}

export interface AssignmentsResponse {
  assignments: Assignment[];
  total_assignments: number;
  agent_info: any | null;
}