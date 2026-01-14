// src/services/api/index.ts
import { API_CONFIG, HttpMethod } from './config';
import { ENDPOINTS } from './endpoints';

interface ApiRequestOptions extends RequestInit {
  auth?: boolean;
  timeout?: number;
  retry?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  status: number;
}

/**
 * Core API client for making HTTP requests to the backend
 */
export class ApiClient {
  private static instance: ApiClient;
  private baseUrl: string;
  
  private constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
  }

  /**
   * Get the singleton instance of ApiClient
   */
  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Make a request to the API
   * @param endpoint API endpoint
   * @param options Request options
   * @returns API response
   */

public async request<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    auth = true,
    timeout = API_CONFIG.timeout,
    retry = true,
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
  const headers = new Headers(fetchOptions.headers);

  // Set content type if not already set and not FormData
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Set auth header if needed
  if (auth) {
    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    // Handle 401 errors with token refresh
    if (response.status === 401 && auth && retry) {
      console.log('Received 401, attempting token refresh');
      const refreshSuccess = await this.refreshToken();
      
      if (refreshSuccess) {
        console.log('Token refresh successful, retrying original request');
        // Retry the original request with the new token
        return this.request<T>(endpoint, { 
          ...options, 
          retry: false // Prevent infinite refresh loops
        });
      }
      
      // If refresh failed, handle the auth error
      console.log('Token refresh failed, redirecting to login');
      this.handleAuthError();
      
      return {
        data: null,
        error: new Error('Authentication failed - please log in again'),
        status: 401,
      };
    }

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
          } catch (e) {
            console.error('Error parsing response as JSON:', e);
            console.log('Response text that failed to parse:', responseText);
            error = new Error('Failed to parse response');
          }
        }
      } catch (e) {
        console.error('Error reading response text:', e);
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
    }

    return {
      data,
      error,
      status: response.status,
    };
  } catch (error) {
    // Handle network errors, timeouts, etc.
    const isAbortError = error instanceof DOMException && error.name === 'AbortError';
    
    return {
      data: null,
      error: new Error(isAbortError ? 'Request timeout' : (error as Error).message),
      status: isAbortError ? 408 : 0, // 408 Request Timeout
    };
  }
}

  /**
   * Make a GET request
   */
  public async get<T>(endpoint: string, options: Omit<ApiRequestOptions, 'method' | 'body'> = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  public async post<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PUT request
   */
  public async put<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a PATCH request
   */
  public async patch<T>(
    endpoint: string,
    data: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * Make a DELETE request
   */
  public async delete<T>(
    endpoint: string,
    options: Omit<ApiRequestOptions, 'method'> = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Get the access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  /**
   * Get the refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  /**
   * Refresh the access token
   * @returns Whether the refresh was successful
   */
  private async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      // For FormData approach
      const formData = new FormData();
      formData.append('refresh_token', refreshToken);
      
      const response = await fetch(`${this.baseUrl}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        body: formData
      });
      
      // Check if the response is not OK
      if (!response.ok) {
        // Clear auth data when refresh fails
        this.handleAuthError();
        return false;
      }
      
      const data = await response.json();
      
      // Store the new tokens
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      localStorage.setItem('tokenExpiry', (Date.now() + data.expires_in * 1000).toString());
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth data on error
      this.handleAuthError();
      return false;
    }
  }
  
  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    // Clear auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
    localStorage.removeItem('roles');
    
    // Redirect to login page if we're in the browser
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

// Export a singleton instance
export const apiClient = ApiClient.getInstance();

// Convenience functions
export const get = <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => 
  apiClient.get<T>(endpoint, options);

export const post = <T>(endpoint: string, data: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => 
  apiClient.post<T>(endpoint, data, options);

export const put = <T>(endpoint: string, data: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => 
  apiClient.put<T>(endpoint, data, options);

export const patch = <T>(endpoint: string, data: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) => 
  apiClient.patch<T>(endpoint, data, options);

export const del = <T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method'>) => 
  apiClient.delete<T>(endpoint, options);