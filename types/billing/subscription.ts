// src/types/billing/subscription.ts


// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

/**
 * Subscription status types
 */
export type SubscriptionStatus = 
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'unpaid'
  | 'incomplete'
  | 'incomplete_expired'
  | 'paused';

/**
 * Sort options for subscription list
 */
export type SubscriptionSortBy = 
  | 'created_at'
  | 'updated_at'
  | 'current_period_start'
  | 'current_period_end'
  | 'status'
  | 'plan_name'
  | 'company_name';

/**
 * Sort direction
 */
export type SortOrder = 'asc' | 'desc';

// ============================================================================
// NESTED OBJECT INTERFACES (Matching API Response)
// ============================================================================

/**
 * Status object structure from API
 */
export interface SubscriptionStatusObject {
  id: string;
  model: string;
  name: SubscriptionStatus;
  description: string;
}

/**
 * Company object structure from API
 */
export interface SubscriptionCompany {
  id: string;
  name: string;
  domain: string;
}

/**
 * Plan object structure from API
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  code: string;
}

/**
 * Creator/User object structure from API
 */
export interface SubscriptionCreator {
  id: string;
  full_name: string;
  email: string;
}

/**
 * Subscription item (feature with quantity) - from detail API
 */
export interface SubscriptionItem {
  id: string;
  subscription_id: string;
  feature_id: string;
  quantity: number;
  item_metadata: {
    notes?: string;
  } | null;
  created_at: string;
  updated_at: string;
}

/**
 * Previous subscription reference (if exists)
 */
export interface PreviousSubscription {
  id: string;
  plan: SubscriptionPlan | null;
}

// ============================================================================
// MAIN SUBSCRIPTION INTERFACE (Matching API Response Exactly)
// ============================================================================

/**
 * Main subscription interface matching FastAPI response
 */
export interface Subscription {
  id: string;
  
  // ✅ UPDATED: Status is now a nested object
  status: SubscriptionStatusObject;
  
  // Billing periods
  current_period_start: string;
  current_period_end: string;
  
  // Trial information
  trial_start: string | null;
  trial_end: string | null;
  
  // Grace period
  grace_period_end: string | null;
  
  // Proration and cancellation
  proration_behavior: string;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  
  // Previous subscription reference
  previous_subscription_id: string | null;
  previous_subscription?: PreviousSubscription | null;
  
  // Cancellation details
  cancellation_details: any | null;
  
  // Schedule
  schedule_at_period_end: string | null;
  ended_at: string | null;
  
  // Metadata
  sub_metadata: Record<string, any> | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Soft delete
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  
  // ✅ UPDATED: Nested objects
  company: SubscriptionCompany;
  plan: SubscriptionPlan | null;
  creator: SubscriptionCreator;
  
  // Subscription items - full array from detail API, count from list API
  subscription_items?: SubscriptionItem[];
  subscription_items_count?: number;
  
  // Optional fields that might be added later
  plan_id?: string;
  company_id?: string;
  created_by?: string;
}

// ============================================================================
// API REQUEST INTERFACES (✅ NEW - FOR CREATE)
// ============================================================================

/**
 * Create plan-based subscription request
 */
export interface CreatePlanBasedSubscriptionRequest {
  company_id: string;              // UUID as string - Required
  plan_id: string;                 // UUID as string - Required
  current_period_start: string;    // ISO 8601 datetime string - Required
  current_period_end: string;      // ISO 8601 datetime string - Required
  trial_start?: string | null;     // ISO 8601 datetime string - Optional
  trial_end?: string | null;       // ISO 8601 datetime string - Optional
  proration_behavior?: string;     // Optional (default: "create_prorations")
  sub_metadata?: Record<string, string>;  // JSONB - Optional
}

/**
 * Create custom subscription request
 */
export interface CreateCustomSubscriptionRequest {
  company_id: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string | null;
  trial_end?: string | null;
  subscription_items: {
    feature_id: string;
    quantity: number;
  }[];
  proration_behavior?: string;
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

/**
 * Subscription list response from API
 */
export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Subscription creation response (✅ NEW)
 */
export interface SubscriptionCreateResponse {
  success: boolean;
  message: string;
  data: Subscription;
}

/**
 * Subscription detail response from API
 */
export interface SubscriptionDetailResponse {
  success: boolean;
  data: Subscription;
  error?: string;
}

/**
 * Generic subscription API response
 */
export interface SubscriptionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================================================
// FILTER AND PAGINATION INTERFACES
// ============================================================================

/**
 * Subscription filters for querying
 */
export interface SubscriptionFilters {
  // Pagination
  page?: number;
  page_size?: number;
  
  // Status filter
  status?: string;
  
  // Plan filter
  plan_id?: string;
  
  // Company filter
  company_id?: string;
  
  // User filter
  created_by?: string;
  
  // Date filters
  created_after?: string;
  created_before?: string;
  period_start_after?: string;
  period_start_before?: string;
  
  // Trial filters
  has_trial_period?: boolean;
  trial_currently_active?: boolean;
  will_not_auto_renew?: boolean;
  is_cancelled?: boolean;
  
  // Other filters
  is_deleted?: boolean;
  search?: string;
  
  // Sorting
  sort_by?: SubscriptionSortBy;
  sort_order?: SortOrder;
}

/**
 * Pagination metadata
 */
export interface SubscriptionPagination {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

// ============================================================================
// FORM AND UI INTERFACES
// ============================================================================

/**
 * Subscription form data for create/edit
 */
export interface SubscriptionFormData {
  company_id: string;
  plan_id: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  proration_behavior?: string;
  cancel_at_period_end?: boolean;
  sub_metadata?: Record<string, any>;
}

/**
 * Subscription action types
 */
export type SubscriptionAction = 
  | 'view'
  | 'edit'
  | 'cancel'
  | 'pause'
  | 'resume'
  | 'delete';

// ============================================================================
// HELPER TYPE GUARDS
// ============================================================================

/**
 * Type guard to check if status is a string or object
 */
export function isStatusObject(status: any): status is SubscriptionStatusObject {
  return typeof status === 'object' && status !== null && 'name' in status;
}

/**
 * Get status name from status object or string
 */
export function getStatusName(status: SubscriptionStatusObject | SubscriptionStatus | string): SubscriptionStatus {
  if (isStatusObject(status)) {
    return status.name;
  }
  return status as SubscriptionStatus;
}

/**
 * Type guard to check if plan exists
 */
export function hasPlan(subscription: Subscription): subscription is Subscription & { plan: SubscriptionPlan } {
  return subscription.plan !== null;
}