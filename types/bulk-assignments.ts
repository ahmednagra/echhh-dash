// src/types/bulk-assignments.ts

export interface BulkAssignmentRequest {
  campaign_list_id: string;
  strategy: 'round_robin' | 'load_balanced' | 'manual';
  preferred_agent_ids?: string[] | null;
  max_influencers_per_agent: number;
  force_new_assignments: boolean;
  influencer_ids?: string[] | null; // ← NEW: Optional specific influencer IDs to assign
}

export interface BulkAssignmentResponse {
  success: boolean;
  message: string;
  total_influencers: number;
  total_agents: number;
  assignments_created: number;
  assignment_details: {
    agent_id: string;
    agent_name?: string;
    assigned_influencers: number;
    assignment_id: string;
  }[];
  // Additional fields from actual API response
  assignment_summary?: {
    total_influencers: number;
    total_agents_assigned: number;
    successful_assignments: number;
    failed_assignments: number;
  };
  agent_assignments?: {
    agent_id: string;
    agent_assignment_id: string;
    assigned_influencers_count: number;
    total_influencers_in_assignment: number;
    is_new_assignment: boolean;
    influencer_ids: string[];
  }[];
}

export interface BulkAssignmentError {
  success: false;
  error: string;
  details?: any;
}
