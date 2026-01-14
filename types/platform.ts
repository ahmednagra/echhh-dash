// src/types/platform.ts

export interface PlatformProducts {
  income: {
    is_supported: boolean;
  };
  switch: {
    is_supported: boolean;
  };
  activity: {
    is_supported: boolean;
  };
  identity: {
    audience: {
      is_supported: boolean;
    };
    is_supported: boolean;
  };
  engagement: {
    audience: {
      is_supported: boolean;
    };
    is_supported: boolean;
  };
  publish_content: {
    is_supported: boolean;
  };
}

export interface Platform {
  id: string;
  name: string;
  description: string | null;
  logo_url: string;
  category: string;
  status: string; // "ACTIVE" | "INACTIVE"
  url: string;
  work_platform_id: string;
  products: PlatformProducts;
  created_at: string;
  updated_at: string;
}

export interface PlatformResponse {
  success: boolean;
  data: Platform[];
  total?: number;
  message?: string;
}

/**
 * External API Endpoint entity
 * Maps to: external_api_endpoints table
 */
export interface ExternalApiEndpoint {
  id: string;
  provider_id: string;
  endpoint_name: string;
  endpoint_code: string;
  base_url: string;
  endpoint_path: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  supported_platforms: string[];
  data_type: string;
  is_active: boolean;
  priority: number;
  rate_limit_config: {
    type: string;
    limit: number;
    time_window: number;
    burst_limit: number;
  };
  cost_config: {
    pricing_model: string;
    base_cost: number;
    currency: string;
    tiers: Array<{ from: number; to: number; cost: number }>;
  };
  authentication_config: Record<string, unknown>;
  timeout_seconds: number;
  retry_attempts: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Response for active endpoints list
 */
export interface ActiveEndpointsResponse {
  success: boolean;
  data: ExternalApiEndpoint[];
  error?: string;
}

/**
 * Endpoint codes used in the system
 */
export const ENDPOINT_CODES = {
  INSIGHTIQ_CONTENT_FETCH: 'INSIGHTIQ_CONTENT_FETCH',
  INTERNAL_MANUAL_ENTRY: 'INTERNAL_MANUAL_ENTRY',
} as const;

export type EndpointCode = typeof ENDPOINT_CODES[keyof typeof ENDPOINT_CODES];