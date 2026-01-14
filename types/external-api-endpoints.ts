// src/types/external-api-endpoints.ts

/**
 * External API Endpoints Types
 *
 * TypeScript interfaces for external API endpoint management.
 * Aligned with FastAPI backend schemas.
 */

// =============================================================================
// CORE INTERFACES
// =============================================================================

export interface ExternalApiEndpoint {
  id: string;
  provider_id: string;
  name: string;
  code: string;
  data_type: string;
  endpoint_path: string;
  http_method: string;
  priority: number;
  is_active: boolean;
  rate_limit_per_minute: number | null;
  rate_limit_per_day: number | null;
  timeout_seconds: number | null;
  retry_attempts: number | null;
  request_schema: Record<string, unknown> | null;
  response_schema: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// =============================================================================
// REQUEST INTERFACES
// =============================================================================

export interface ExternalApiEndpointCreate {
  provider_id: string;
  name: string;
  code: string;
  data_type: string;
  endpoint_path: string;
  http_method: string;
  priority?: number;
  is_active?: boolean;
  rate_limit_per_minute?: number | null;
  rate_limit_per_day?: number | null;
  timeout_seconds?: number | null;
  retry_attempts?: number | null;
  request_schema?: Record<string, unknown> | null;
  response_schema?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface ExternalApiEndpointUpdate {
  name?: string;
  code?: string;
  data_type?: string;
  endpoint_path?: string;
  http_method?: string;
  priority?: number;
  is_active?: boolean;
  rate_limit_per_minute?: number | null;
  rate_limit_per_day?: number | null;
  timeout_seconds?: number | null;
  retry_attempts?: number | null;
  request_schema?: Record<string, unknown> | null;
  response_schema?: Record<string, unknown> | null;
  notes?: string | null;
}

export interface ExternalApiEndpointListParams {
  page?: number;
  size?: number;
  provider_id?: string;
  data_type?: string;
  is_active?: boolean;
  include_deleted?: boolean;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// =============================================================================
// RESPONSE INTERFACES
// =============================================================================

export interface ExternalApiEndpointResponse {
  id: string;
  provider_id: string;
  name: string;
  code: string;
  data_type: string;
  endpoint_path: string;
  http_method: string;
  priority: number;
  is_active: boolean;
  rate_limit_per_minute: number | null;
  rate_limit_per_day: number | null;
  timeout_seconds: number | null;
  retry_attempts: number | null;
  request_schema: Record<string, unknown> | null;
  response_schema: Record<string, unknown> | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ExternalApiEndpointListResponse {
  items: ExternalApiEndpointResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface ExternalApiEndpointStatsResponse {
  total_endpoints: number;
  active_endpoints: number;
  inactive_endpoints: number;
  endpoints_by_provider: Record<string, number>;
  endpoints_by_data_type: Record<string, number>;
  endpoints_by_http_method: Record<string, number>;
}

export interface ExternalApiEndpointDeleteResponse {
  success: boolean;
  message: string;
}