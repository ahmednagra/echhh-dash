// src/types/outreach-agents.ts
// FIXED to match exact backend response structure

export type AgentType = 'instagram' | 'email' | 'whatsapp';

// Backend returns this exact structure
export interface OutreachAgent {
  // Core Identity
  id: string;
  
  // User Info (from relationship) - FIXED: backend returns minimal user info
  assigned_user: {
    id: string;
    full_name: string;
    profile_image_url: string | null;
    email?: string; // Optional if not returned by backend
    phone_number?: string | null; // Optional if not returned by backend
  };
  
  // Agent Status (from relationship) - FIXED: backend returns "outreach_agent_status"
  outreach_agent_status: {
    id: string;
    name: string;
  };
  
  // Agent Type (from relationship) - FIXED: backend returns "outreach_agent_types"
  outreach_agent_types: {
    id: string;
    name: AgentType;
  };
  
  // NEW: Backend provides these detailed counts
  total_assignments: number;
  total_assigned_influencers: number;
  total_active_influencers: number;
  total_completed_influencers: number;
  total_archived_influencers: number;
  
  // Progress and Activity
  progress: number; // Percentage as decimal (e.g., 7.27)
  last_activity_at: string | null;
  messages_sent_today: number;
  is_available_for_assignment: boolean;
  
  // Optional fields that might exist
  is_automation_enabled?: boolean;
  is_company_exclusive?: boolean;
  company?: {
    id: string;
    name: string;
  } | null;
  
  // Legacy fields for backward compatibility (map to new fields)
  agent_type?: {
    id: string;
    name: AgentType;
    display_name: string;
  } | null;
  status?: {
    id: string;
    name: string;
    display_name: string;
  } | null;
  active_lists_count?: number;
  active_influencers_count?: number;
}

// Response structure from backend
export interface OutreachAgentsResponse {
  agents: OutreachAgent[];
  pagination: OutreachAgentsPagination;
}

// Pagination structure
export interface OutreachAgentsPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// Filter options
export interface OutreachAgentFilters {
  search?: string;
  agent_type?: string;
  status?: string;
}

// Stats structure (separate endpoint)
export interface OutreachAgentStats {
  total_agents: number;
  active_agents: number;
  inactive_agents: number;
  available_agents: number;
  busy_agents: number;
  automation_enabled: number;
  total_agent_assignments: number;
  total_active_lists: number;
  total_lists: number;
  total_social_connections: number;
  total_messages_today: number;
  total_active_influencers: number;
  total_influencers: number;
  total_assigned_influencers: number;
  total_completed_influencers: number;
  total_pending_influencers: number;
  total_archived_influencers: number;
  average_completion_rate: number;
  agents_by_type?: Record<string, number>;
  available_by_type?: Record<string, number>;
}


export interface OutreachAgentsTableProps {
  agents: OutreachAgent[];
  loading: boolean;
  error: string | null;
  pagination: OutreachAgentsPagination;
  stats: OutreachAgentStats | null;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSearch: (term: string) => void;
  onFilterTypeChange: (type: string) => void;
  onFilterStatusChange: (status: string) => void;
  searchTerm: string;
  filterType: string;
  filterStatus: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface AgentFilters {
  search: string;
  agent_type: string;
  status: string;
}