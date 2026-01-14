// src/types/billing/features.ts

/**
 * Feature categories available in the system
 */
export type FeatureCategory = 
  | 'core' 
  | 'analytics' 
  | 'communication' 
  | 'team' 
  | 'advanced' 
  | 'support';

/**
 * Unit types for feature measurement
 */
export type FeatureUnitType = 
  | 'count' 
  | 'per_month' 
  | 'boolean' 
  | 'days';

/**
 * Base feature interface with common fields
 */
export interface FeatureBase {
  name: string;
  code: string;
  category: FeatureCategory;
  description: string | null;
  unit_type: FeatureUnitType;
  is_active: boolean;
  display_order: number;
}

/**
 * Complete feature response from API
 */
export interface Feature extends FeatureBase {
  id: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Brief feature information for nested responses
 */
export interface FeatureBrief {
  id: string;
  name: string;
  code: string;
  category: FeatureCategory;
  unit_type: FeatureUnitType;
  is_active: boolean;
}

/**
 * Request payload for creating a new feature
 */
export interface CreateFeatureRequest {
  name: string;
  code: string;
  category: FeatureCategory;
  description?: string | null;
  unit_type: FeatureUnitType;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Request payload for updating an existing feature
 */
export interface UpdateFeatureRequest {
  name?: string;
  code?: string;
  category?: FeatureCategory;
  description?: string | null;
  unit_type?: FeatureUnitType;
  is_active?: boolean;
  display_order?: number;
}

/**
 * Filters for feature list queries
 */
export interface FeatureFilters {
  page?: number;
  page_size?: number;
  category?: FeatureCategory | 'all';
  unit_type?: FeatureUnitType | 'all';
  is_active?: boolean;
  is_deleted?: boolean;
  search?: string;
  sort_by?: 'display_order' | 'name' | 'code' | 'category' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

/**
 * Response for single feature operations
 */
export interface FeatureResponse {
  id: string;
  name: string;
  code: string;
  category: FeatureCategory;
  description: string | null;
  unit_type: FeatureUnitType;
  is_active: boolean;
  display_order: number;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Paginated list response for features
 */
export interface FeatureListResponse {
  items: Feature[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Response for feature deletion
 */
export interface FeatureDeleteResponse {
  message: string;
  feature_id: string;
  feature_name: string;
}

/**
 * Response for feature statistics
 */
export interface FeatureStatsResponse {
  category_counts: Record<string, number>;
  total_features: number;
}


/**
 * Standard API response wrapper for create/update operations
 */
export interface ApiFeatureResponse {
  success?: boolean;
  data?: Feature;
  error?: string;
}

/**
 * Standard API response wrapper for list operations
 */
export interface ApiFeatureListResponse {
  success?: boolean;
  data?: FeatureListResponse;
  error?: string;
}

/**
 * Standard API response wrapper for delete operations
 */
export interface ApiFeatureDeleteResponse {
  success?: boolean;
  data?: FeatureDeleteResponse;
  error?: string;
}

/**
 * Form data for creating/editing features
 */
export interface FeatureFormData {
  name: string;
  code: string;
  category: FeatureCategory | '';
  description: string;
  unit_type: FeatureUnitType | '';
  is_active: boolean;
  display_order: number;
}

/**
 * Validation errors for feature forms
 */
export interface FeatureFormErrors {
  name?: string;
  code?: string;
  category?: string;
  description?: string;
  unit_type?: string;
  display_order?: string;
}

/**
 * Options for category dropdown
 */
export interface CategoryOption {
  value: FeatureCategory | 'all';
  label: string;
}

/**
 * Options for unit type dropdown
 */
export interface UnitTypeOption {
  value: FeatureUnitType | 'all';
  label: string;
}


/**
 * Category options for dropdowns
 */
export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'core', label: 'Core' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'communication', label: 'Communication' },
  { value: 'team', label: 'Team' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'support', label: 'Support' },
];

/**
 * Unit type options for dropdowns
 */
export const UNIT_TYPE_OPTIONS: UnitTypeOption[] = [
  { value: 'all', label: 'All Types' },
  { value: 'count', label: 'Count' },
  { value: 'per_month', label: 'Per Month' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'days', label: 'Days' },
];

/**
 * Get display label for category
 */
export const getCategoryLabel = (category: FeatureCategory): string => {
  const option = CATEGORY_OPTIONS.find(opt => opt.value === category);
  return option?.label || category;
};

/**
 * Get display label for unit type
 */
export const getUnitTypeLabel = (unitType: FeatureUnitType): string => {
  const option = UNIT_TYPE_OPTIONS.find(opt => opt.value === unitType);
  return option?.label || unitType;
};