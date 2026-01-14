// src/types/bulk-reassignments.ts

export interface BulkReassignmentRequest {
  assigned_influencer_id: string;
  reassignment_reason_id: string;
  prefer_existing_assignments: boolean;
  notes?: string;
}

export interface BulkReassignmentResponse {
  success: boolean;
  new_assignment: {
    agent_id: string;
    agent_assignment_id: string;
    assigned_influencers_count: number;
    total_influencers_in_assignment: number;
    is_new_assignment: boolean;
    influencer_ids: string[];
  };
  assignment_history_id: string;
  message: string;
}

export interface ReassignmentReason {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
}