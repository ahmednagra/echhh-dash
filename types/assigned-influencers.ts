// src/types/assigned-influencers.ts
export interface UpdateAssignedInfluencerNotesRequest {
  notes: string;
}

export interface UpdateAssignedInfluencerNotesResponse {
  success: boolean;
  message: string;
}

export interface AssignedInfluencerBase {
  id: string;
  campaign_influencer_id: string;
  agent_assignment_id: string;
  type: 'active' | 'archived' | 'completed';
  status_id: string;
  attempts_made: number;
  last_contacted_at: string | null;
  next_contact_at: string | null;
  responded_at: string | null;
  assigned_at: string;
  archived_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssignedInfluencer extends AssignedInfluencerBase {
  campaign_influencer?: any;
  status?: any;
}