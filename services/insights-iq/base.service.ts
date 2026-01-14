// src/services/insights-iq/base.service.ts

import { INSIGHTIQ_CONFIG } from './config';
import { 
  InsightIQError, 
  ApiResponse, 
  RequestOptions, 
  HttpMethod 
} from './types';
import { buildEndpointUrl } from './endpoints';

export class InsightIQBaseService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor() {
    this.baseUrl = INSIGHTIQ_CONFIG.baseUrl;
    
    // Create Basic Auth header
    const basicAuthHeader = this.createBasicAuthHeader(
      INSIGHTIQ_CONFIG.auth.clientId,
      INSIGHTIQ_CONFIG.auth.clientSecret
    );
    
    this.defaultHeaders = {
      ...INSIGHTIQ_CONFIG.defaultHeaders,
      'Authorization': basicAuthHeader
    };
  }

  /**
   * Create Basic Authentication header
   */
  private createBasicAuthHeader(clientId: string, clientSecret: string): string {
    if (!clientId || !clientSecret) {
      throw new Error('Client ID and Client Secret are required for authentication');
    }
    
    const credentials = `${clientId}:${clientSecret}`;
    const encodedCredentials = Buffer.from(credentials, 'utf-8').toString('base64');
    return `Basic ${encodedCredentials}`;
  }

  /**
   * Make HTTP request to InsightIQ API
   */
  protected async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = INSIGHTIQ_CONFIG.timeout,
      retries = INSIGHTIQ_CONFIG.retryAttempts
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    return this.executeRequestWithRetry<T>(url, requestOptions, retries);
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequestWithRetry<T>(
    url: string,
    options: RequestInit,
    retries: number
  ): Promise<ApiResponse<T>> {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);
        return await this.handleResponse<T>(response);
      } catch (error) {
        console.error(`Request attempt ${attempt + 1} failed:`, error);
        
        if (attempt === retries) {
          return {
            success: false,
            error: {
              type: 'NETWORK_ERROR',
              code: 'fetch_failed',
              error_code: 'fetch_failed',
              message: error instanceof Error ? error.message : 'Network request failed',
              status_code: 0,
              http_status_code: 0,
              request_id: this.generateRequestId()
            }
          };
        }
        
        // Wait before retry
        await this.delay(INSIGHTIQ_CONFIG.retryDelay * (attempt + 1));
      }
    }

    // This should never be reached, but TypeScript requires it
    return {
      success: false,
      error: {
        type: 'UNKNOWN_ERROR',
        code: 'unknown',
        error_code: 'unknown',
        message: 'Unknown error occurred',
        status_code: 0,
        http_status_code: 0,
        request_id: this.generateRequestId()
      }
    };
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
      const responseData = await response.json();

      if (!response.ok) {
        // Handle InsightIQ error format
        if (responseData.error) {
          return {
            success: false,
            error: responseData.error as InsightIQError
          };
        }

        // Handle generic HTTP errors
        return {
          success: false,
          error: {
            type: 'HTTP_ERROR',
            code: `http_${response.status}`,
            error_code: `http_${response.status}`,
            message: responseData.message || `HTTP ${response.status} error`,
            status_code: response.status,
            http_status_code: response.status,
            request_id: this.generateRequestId()
          }
        };
      }

      return {
        success: true,
        data: responseData as T
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: 'PARSE_ERROR',
          code: 'json_parse_failed',
          error_code: 'json_parse_failed',
          message: 'Failed to parse response JSON',
          status_code: response.status,
          http_status_code: response.status,
          request_id: this.generateRequestId()
        }
      };
    }
  }

  /**
   * Build URL with query parameters
   */
  protected buildUrl(endpoint: string, params?: Record<string, any>): string {
    return buildEndpointUrl(this.baseUrl, endpoint, params);
  }

  /**
   * Delay helper for retries
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}