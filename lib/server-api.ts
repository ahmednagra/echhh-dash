// src/lib/server-api.ts - Enhanced for OAuth (if not already exists)
import { API_CONFIG } from '@/services/api/config';

interface ServerApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

interface ServerRequestOptions {
  auth?: boolean;
  timeout?: number;
}

/**
 * Server-side API client for making requests to FastAPI from Next.js API routes
 * This client is designed to work in the server environment (Node.js)
 */
class ServerApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  /**
   * Make a request to FastAPI backend from server-side
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit & ServerRequestOptions = {}
  ): Promise<ServerApiResponse<T>> {
    const {
      auth = true,
      timeout = API_CONFIG.timeout,
      ...fetchOptions
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const headers = new Headers(fetchOptions.headers);

    // Set content type if not already set and not FormData
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      console.log(`🔄 Server API: Making ${fetchOptions.method || 'GET'} request to ${url}`);
      
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      console.log(`📦 Server API: Response status: ${response.status}`);

      // Parse the response
      let data: T | null = null;
      let error: Error | null = null;
      
      if (response.status !== 204) { // No content
        try {
          const responseText = await response.text();
          
          // Only try to parse as JSON if there's actual content
          if (responseText.trim()) {
            try {
              data = JSON.parse(responseText) as T;
              console.log('✅ Server API: Successfully parsed response data');
            } catch (e) {
              console.error('❌ Server API: Error parsing response as JSON:', e);
              console.log('📄 Server API: Response text that failed to parse:', responseText);
              error = new Error('Failed to parse response');
            }
          }
        } catch (e) {
          console.error('❌ Server API: Error reading response text:', e);
          error = new Error('Failed to read response');
        }
      }

      // Handle error responses
      if (!response.ok) {
        let errorMessage = 'Request failed';
        
        if (data && typeof data === 'object') {
          // Handle common API error formats
          if ('detail' in data) {
            errorMessage = data.detail as string;
          } else if ('message' in data) {
            errorMessage = data.message as string;
          } else if ('error' in data) {
            errorMessage = data.error as string;
          }
        }
        
        error = new Error(
          typeof errorMessage === 'string' 
            ? errorMessage 
            : JSON.stringify(errorMessage)
        );
        
        data = null;
        console.error(`❌ Server API: Request failed with status ${response.status}:`, errorMessage);
      }

      return {
        data,
        error,
        status: response.status,
      };
    } catch (error) {
      // Enhanced error handling with detailed logging
      const isAbortError = error instanceof Error && error.name === 'AbortError';
      const isFetchError = error instanceof Error && error.message.includes('fetch failed');
      
      console.error('💥 Server API: Request failed:', {
        error: error instanceof Error ? error.message : String(error),
        isAbortError,
        isFetchError,
        url,
        method: fetchOptions.method || 'GET',
        baseUrl: this.baseUrl
      });
      
      // Provide more helpful error messages
      let errorMessage = 'Request failed';
      if (isAbortError) {
        errorMessage = `Request timeout - the server took too long to respond (timeout: ${timeout}ms)`;
      } else if (isFetchError) {
        errorMessage = `Failed to fetch - please check your network connection.`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      return {
        data: null,
        error: new Error(errorMessage),
        status: isAbortError ? 408 : 0, // 408 Request Timeout
      };
    }
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    options: Omit<ServerRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
      headers,
    });
  }

  /**
   * Make a POST request
   */
  async post<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ServerRequestOptions, 'method' | 'body'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      headers,
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(
    endpoint: string,
    options: Omit<ServerRequestOptions, 'method'> = {},
    authToken?: string
  ): Promise<ServerApiResponse<T>> {
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
      headers,
    });
  }
}

// Export a singleton instance
export const serverApiClient = new ServerApiClient();