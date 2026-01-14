// src/types/billing/plan-features.ts

/**
 * Plan-Feature Association Types
 * Types for managing the relationship between Plans and Features
 */

import type { Plan } from './plans';
import type { Feature } from './features';

// =========================================================================
//                      CORE ENTITIES
// =========================================================================

export interface PlanFeature {
  id: string;
  plan_id: string;
  feature_id: string;
  limit_value: number | null; // -1 = unlimited, null = disabled, 0+ = specific limit
  plan_feature_metadata: Record<string, any> | null;
  created_at: string;
  updated_at?: string;
  is_deleted?: boolean;
  // Populated relationships
  plan?: Plan;
  feature?: Feature;

  // Flat properties from API response (ADD THESE)
  plan_name?: string;
  plan_code?: string;
  feature_name?: string;
  feature_code?: string;
  feature_category?: string;
  feature_unit_type?: string;
}

export interface PlanFeatureWithDetails extends Omit<PlanFeature, 'plan' | 'feature'> {
  plan: {
    id: string;
    code: string;
    name: string;
    price: number;
    billing_interval: string;
    status: string;
  };
  feature: {
    id: string;
    code: string;
    name: string;
    description: string;
    category: string;
    unit_type: string;
  };
}

// =========================================================================
//                      ASSIGNED FEATURE (UI Type)
// =========================================================================

export interface AssignedFeature {
  feature_id: string;
  plan_feature_id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  unit_type: string;
  limit_value: number | null;
  display_order: number | null;
  feature_metadata?: Record<string, any>;
}

// =========================================================================
//                      REQUEST TYPES
// =========================================================================

export interface CreatePlanFeatureRequest {
  plan_id: string;
  feature_id: string;
  limit_value?: number | null;
  plan_feature_metadata?: Record<string, any>;
}

export interface UpdatePlanFeatureRequest {
  limit_value?: number | null;
  plan_feature_metadata?: Record<string, any>;
}

export interface BulkAssignFeaturesRequest {
  plan_id: string;
  features: {
    feature_id: string;
    limit_value?: number | null;
    plan_feature_metadata?: Record<string, any>;
  }[];
}

export interface PlanFeatureBulkCreateRequest {
  relationships: Array<{
    plan_id: string;
    feature_id: string;
    limit_value: number | null;
    metadata?: Record<string, any>;
  }>;
}

export interface UpdatePlanFeaturesRequest {
  features: Array<{
    feature_id: string;
    limit_value: number | null;
    metadata?: Record<string, any>;
  }>;
}

export interface CloneFeaturesRequest {
  target_plan_id: string;
  overwrite_existing?: boolean;
}

// =========================================================================
//                      RESPONSE TYPES
// =========================================================================

export interface PlanFeatureResponse {
  success: boolean;
  message: string;
  data: PlanFeature;
}

export interface PlanFeatureListResponse {
  success: boolean;
  message: string;
  data: PlanFeature[];
  pagination?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

export interface PlanFeatureDeleteResponse {
  success: boolean;
  message: string;
  deleted_count?: number;
}

export interface PlanFeatureBulkCreateResponse {
  success: boolean;
  data: {
    created: PlanFeature[];
    skipped: Array<{
      plan_id: string;
      feature_id: string;
      reason: string;
    }>;
  };
  message: string;
  statistics: {
    total_requested: number;
    successful: number;
    skipped: number;
  };
}

export interface PlanFeaturesForPlanResponse {
  success: boolean;
  message: string;
  plan_id: string;
  plan_name: string;
  plan_code: string;
  features: Array<{
    id: string;
    plan_id: string;
    feature_id: string;
    limit_value: number | null;
    plan_feature_metadata: Record<string, any> | null;
    created_at: string;
    plan_name: string;
    plan_code: string;
    feature_name: string;
    feature_code: string;
    feature_category: string;
    feature_unit_type: string;
  }>;
  total_features: number;
}

// export interface PlanFeaturesForPlanResponse {
//   success: boolean;
//   data: {
//     plan: {
//       id: string;
//       code: string;
//       name: string;
//     };
//     features: Array<{
//       id: string;
//       feature_id: string;
//       feature_code: string;
//       feature_name: string;
//       feature_category: string;
//       feature_unit_type?: string;
//       feature_description?: string;
//       limit_value: number | null;
//       limit_display: string;
//       display_order?: number;
//       plan_feature_metadata: Record<string, any> | null;
//     }>;
//   };
//   message?: string;
// }

// =========================================================================
//                      DROPDOWN TYPES
// =========================================================================

// export interface FeatureDropdownItem {
//   id: string;
//   name: string;
//   code: string;
//   category: string;
//   unit_type: string;
//   description: string | null;
//   is_active: boolean;
//   display_order: number;
//   is_deleted: boolean;
// }

export interface DropdownResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}

export interface UnassignedFeaturesResponse {
  success: boolean;
  message: string;
  plan_id: string;
  features: UnassignedFeatureItem[];  // ← Use the new interface
  total: number;
}

// Individual unassigned feature item
export interface UnassignedFeatureItem {
  id: string;
  name: string;
  code: string;
  category: string;
  unit_type: string;
  description: string | null;
}
// export interface UnassignedFeaturesResponse {
//   success: boolean;
//   data: Array<{
//     id: string;
//     code: string;
//     name: string;
//     description: string;
//     category: string;
//     unit_type: string;
//   }>;
//   message?: string;
// }

// =========================================================================
//                      FILTER TYPES
// =========================================================================

export interface PlanFeatureFilters {
  page?: number;
  page_size?: number;
  plan_id?: string;
  feature_id?: string;
  limit_value?: number;
  has_unlimited?: boolean;
  has_disabled?: boolean;
  sort_by?: 'created_at' | 'limit_value';
  sort_order?: 'asc' | 'desc';
}

export interface PlanFeatureFilter {
  plan_id?: string;
  feature_id?: string;
  plan_code?: string;
  feature_code?: string;
  feature_category?: string;
  limit_type?: 'unlimited' | 'disabled' | 'limited';
  search?: string;
}

// =========================================================================
//                      STATISTICS & ANALYTICS
// =========================================================================

export interface PlanFeatureStatsResponse {
  success: boolean;
  data: {
    total_relationships: number;
    unique_plans: number;
    unique_features: number;
    limit_type_distribution: {
      unlimited: number;
      disabled: number;
      limited: number;
    };
    category_breakdown: Record<string, number>;
    top_plans_by_feature_count: Array<{
      plan_id: string;
      plan_code: string;
      plan_name: string;
      feature_count: number;
    }>;
    top_features_by_plan_count: Array<{
      feature_id: string;
      feature_code: string;
      feature_name: string;
      plan_count: number;
    }>;
  };
  message?: string;
}

export interface PlanComparisonResponse {
  success: boolean;
  data: {
    plans: Array<{
      plan_id: string;
      plan_code: string;
      plan_name: string;
    }>;
    features: Array<{
      feature_id: string;
      feature_code: string;
      feature_name: string;
      feature_category: string;
      limits_by_plan: Record<string, {
        limit_value: number | null;
        limit_display: string;
      }>;
    }>;
  };
  message?: string;
}

// =========================================================================
//                      UI STATE TYPES
// =========================================================================

export interface PlanFeatureModalState {
  isOpen: boolean;
  plan: Plan | null;
  assignedFeatures: PlanFeature[];
  availableFeatures: Feature[];
}

export interface FeatureAssignmentModalProps {
  isOpen: boolean;
  plan: Plan | null;
  onClose: () => void;
  onSuccess: () => void;
}

export interface EditingFeature {
  id: string;
  limitValue: string;
}

export interface DeleteConfirmState {
  isOpen: boolean;
  item: PlanFeature | null;
  type: 'plan-feature';
  hardDelete: boolean;
}

// =========================================================================
//                      UTILITY TYPES
// =========================================================================

export type LimitType = 'unlimited' | 'disabled' | 'limited';

export interface LimitDisplay {
  value: number | null;
  display: string;
  type: LimitType;
}

export function formatLimitValue(limitValue: number | null): LimitDisplay {
  if (limitValue === null) {
    return { value: null, display: 'Disabled', type: 'disabled' };
  }
  if (limitValue === -1) {
    return { value: -1, display: 'Unlimited', type: 'unlimited' };
  }
  return { value: limitValue, display: limitValue.toString(), type: 'limited' };
}

// =========================================================================
//                      ERROR TYPES
// =========================================================================

export interface PlanFeatureError {
  error: string;
  detail?: string;
  status?: number;
}