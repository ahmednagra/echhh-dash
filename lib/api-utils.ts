
// src/lib/api-utils.ts
// Consolidated API utilities for consistent API calls across the app

export interface AuthHeaders {
  'Content-Type': string;
  'Authorization'?: string;
}

/**
 * Get authentication headers for API requests
 * This replaces your getAuthHeaders function and makes it reusable
 */
export const getAuthHeaders = (): AuthHeaders => {
  const headers: AuthHeaders = {
    'Content-Type': 'application/json',
  };
  
  // Get token from localStorage and add to headers
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('✅ Added Authorization header with token');
    } else {
      console.warn('⚠️ No accessToken found in localStorage');
    }
  }
  
  return headers;
};

/**
 * Check if an error is authentication-related
 */
export const isAuthError = (error: any): boolean => {
  return error?.message?.includes('401') || 
         error?.message?.includes('Bearer token') ||
         error?.message?.includes('Authentication failed') ||
         error?.status === 401;
};

/**
 * Handle authentication errors consistently
 */
export const handleAuthError = (error: Error): void => {
  if (isAuthError(error)) {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login?expired=true';
    }
  }
};

/**
 * Make authenticated fetch request to Next.js API routes
 * This replaces your manual fetch calls
 */
export const authenticatedFetch = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
    (error as any).status = response.status;
    
    if (response.status === 401) {
      handleAuthError(error);
    }
    
    throw error;
  }

  return response.json();
};

// Convenience methods for common HTTP verbs
export const apiGet = <T>(url: string) => 
  authenticatedFetch<T>(url, { method: 'GET' });

export const apiPost = <T>(url: string, data: any) => 
  authenticatedFetch<T>(url, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  });

export const apiPut = <T>(url: string, data: any) => 
  authenticatedFetch<T>(url, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  });

export const apiPatch = <T>(url: string, data: any) => 
  authenticatedFetch<T>(url, { 
    method: 'PATCH', 
    body: JSON.stringify(data) 
  });

export const apiDelete = <T>(url: string) => 
  authenticatedFetch<T>(url, { method: 'DELETE' });

/**
 * Custom hook for API calls with loading states
 * This replaces your manual loading state management
 */
import { useState, useCallback } from 'react';

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useApiCall<T = any>(options: UseApiCallOptions = {}) {
  const { onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async <R = T>(
    apiPromise: Promise<R>
  ): Promise<R | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiPromise;
      setData(result as unknown as T);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}