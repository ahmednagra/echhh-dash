// src/types/billing/plans.ts

// =========================================================================
//                      CORE PLAN ENTITY
// =========================================================================

export interface Plan {
  id: string;
  name: string;
  code: string;
  billing_interval: 'month' | 'quarter' | 'year' | 'lifetime';
  billing_interval_count: number;
  amount: string;
  currency: string;
  description: string | null;
  plan_metadata: Record<string, any> | null;
  trial_period_days: number | null;
  is_active: boolean;
  is_featured: boolean;
  display_order: number;
  account_id: string | null;
  visibility: 'public' | 'private' | 'archived';
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

// =========================================================================
//                      RESPONSE TYPES
// =========================================================================

export interface PlanListResponse {
  success: boolean;
  message: string;
  data: Plan[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PlanResponse {
  success: boolean;
  message: string;
  data: Plan;
}

// =========================================================================
//                      REQUEST TYPES
// =========================================================================

export interface CreatePlanRequest {
  name: string;
  code: string;
  billing_interval: 'month' | 'quarter' | 'year' | 'lifetime';
  billing_interval_count: number;
  amount: number | string;
  currency?: string;
  description?: string;
  plan_metadata?: Record<string, any>;
  trial_period_days?: number;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
  account_id?: string;
  visibility?: 'public' | 'private' | 'archived';
}

export interface UpdatePlanRequest {
  name?: string;
  code?: string;
  billing_interval?: 'month' | 'quarter' | 'year' | 'lifetime';
  billing_interval_count?: number;
  amount?: number | string;
  currency?: string;
  description?: string;
  plan_metadata?: Record<string, any>;
  trial_period_days?: number;
  is_active?: boolean;
  is_featured?: boolean;
  display_order?: number;
  account_id?: string;
  visibility?: 'public' | 'private' | 'archived';
}

// =========================================================================
//                      FILTER & SEARCH TYPES
// =========================================================================

export interface PlanFilters {
  page?: number;
  page_size?: number;
  billing_interval?: 'month' | 'quarter' | 'year' | 'lifetime';
  visibility?: 'public' | 'private' | 'archived';
  is_active?: boolean;
  is_featured?: boolean;
  min_price?: number;
  max_price?: number;
  currency?: string;
  is_deleted?: boolean;
  search?: string;
  sort_by?: 'display_order' | 'name' | 'code' | 'amount' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

/**
 * Query Parameters for Listing Plans
 * Extends PlanFilters for full compatibility
 */
export interface ListPlansParams extends PlanFilters {}

// =========================================================================
//                      STATISTICS & ANALYTICS
// =========================================================================

/**
 * Plan Statistics - Unified interface supporting multiple response formats
 */
export interface PlanStatistics {
  total_plans: number;
  active_plans: number;
  inactive_plans?: number;
  featured_plans: number;
  
  // Array format (legacy support)
  plans_by_interval?: { billing_interval: string; count: number }[];
  plans_by_visibility?: { visibility: string; count: number }[];
  
  // Record format (new format)
  plans_by_billing_interval?: Record<string, number>;
  
  // Flat pricing fields (legacy support)
  average_price?: number;
  min_price?: number;
  max_price?: number;
  
  // Nested pricing object (new format)
  pricing?: {
    average: number;
    minimum: number;
    maximum: number;
  };
}

export interface PlanStatsResponse {
  success: boolean;
  message: string;
  data: PlanStatistics;
}

// Alias for backward compatibility
export interface PlanStatisticsResponse {
  success: boolean;
  message: string;
  data: PlanStatistics;
}

// =========================================================================
//                      DROPDOWN TYPES
// =========================================================================

export interface PlanDropdownItem {
  id: string;
  name: string;
  code: string;
  amount: string;
  currency: string;
  billing_interval: string;
}

export interface DropdownResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

// =========================================================================
//                      UI STATE TYPES
// =========================================================================

export interface PlanFormState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  plan: Plan | null;
}

/**
 * Formatted statistics for UI display
 */
export interface StatCardData {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

// =========================================================================
//                      TABLE & SORT TYPES
// =========================================================================

export type PlanSortField = 'name' | 'code' | 'amount' | 'price' | 'billing_interval' | 'display_order' | 'created_at';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  direction: SortDirection;
}

// =========================================================================
//                      ERROR TYPES
// =========================================================================

export interface ApiError {
  message: string;
  detail?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}