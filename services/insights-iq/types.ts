// src/services/insights-iq/types.ts

// Base API Response Structure
export interface InsightIQBaseResponse<T = any> {
  data?: T;
  error?: InsightIQError;
  status?: number;
  success?: boolean;
}

// Error Structure
export interface InsightIQError {
  type: string;
  code: string;
  error_code: string;
  message: string;
  status_code: number;
  http_status_code: number;
  request_id: string;
}

// Location Types
export interface InsightIQLocation {
  id: string; // UUID format
  name: string;
  display_name: string;
  type: 'CITY' | 'COUNTRY' | 'STATE' | 'REGION';
}

// Updated response structure to match actual API
export interface LocationsResponse {
  data: InsightIQLocation[];
  metadata: {
    offset: number;
    limit: number;
    total?: number;
  };
}

// API Request/Response Types
export interface LocationSearchParams {
  limit?: number;
  offset?: number;
  search_string: string;
}

// Generic API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: InsightIQError;
  message?: string;
}

// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// Request Options
export interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
}