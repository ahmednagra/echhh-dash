// src/types/reassignment-reasons.ts

export interface ReassignmentReasonBase {
  code: string;
  name: string;
  description?: string | null;
  is_system_triggered: boolean;
  is_user_triggered: boolean;
  is_agent_triggered: boolean;
  is_admin_triggered: boolean;
  is_support_triggered: boolean;
  user_category?: string | null;
  is_active: boolean;
  display_order: number;
}

export interface ReassignmentReason extends ReassignmentReasonBase {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface ReassignmentReasonCreate extends ReassignmentReasonBase {}

export interface ReassignmentReasonUpdate {
  code?: string;
  name?: string;
  description?: string | null;
  is_system_triggered?: boolean;
  is_user_triggered?: boolean;
  is_agent_triggered?: boolean;
  is_admin_triggered?: boolean;
  is_support_triggered?: boolean;
  user_category?: string | null;
  is_active?: boolean;
  display_order?: number;
}

export interface ReassignmentReasonFilters {
  user_type?: string;
  user_category?: string;
  is_active?: boolean;
  is_system_triggered?: boolean;
  is_user_triggered?: boolean;
  is_agent_triggered?: boolean;
  is_admin_triggered?: boolean;
  is_support_triggered?: boolean;
  search?: string;
}

export interface ReassignmentReasonListResponse {
  items: ReassignmentReason[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

export interface ReassignmentReasonBulkUpdate {
  reason_ids: string[];
  update_data: ReassignmentReasonUpdate;
}

export interface ReassignmentReasonBulkDelete {
  reason_ids: string[];
}

export interface ReassignmentReasonStatistics {
  total_reasons: number;
  active_reasons: number;
  inactive_reasons: number;
  by_category: {
    [key: string]: number;
  };
  usage_stats: {
    [reasonId: string]: number;
  };
}