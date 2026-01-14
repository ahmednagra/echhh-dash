// src/hooks/useApi.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/apiClient';

interface UseApiOptions {
  requireAuth?: boolean;
}

export function useApi<T = any, E = Error>(options: UseApiOptions = {}) {
  const { requireAuth = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { refreshUserSession } = useAuth();

  const request = useCallback(
    async <R = T>(
      endpoint: string,
      options: RequestInit = {}
    ): Promise<R> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiClient(endpoint, {
          ...options,
          auth: requireAuth,
        });

        // Handle 401 errors (token expired or invalid)
        if (response.status === 401 && requireAuth) {
          const refreshSuccess = await refreshUserSession();
          
          if (refreshSuccess) {
            // Retry the request with the new token
            const retryResponse = await apiClient(endpoint, {
              ...options,
              auth: requireAuth,
            });
            
            if (!retryResponse.ok) {
              throw new Error(retryResponse.statusText || 'Request failed');
            }
            
            const responseData = await retryResponse.json();
            setData(responseData);
            setIsLoading(false);
            return responseData as R;
          } else {
            throw new Error('Session expired. Please log in again.');
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.detail || response.statusText || 'Request failed'
          );
        }

        const responseData = await response.json();
        setData(responseData);
        return responseData as R;
      } catch (error) {
        const errorObj = error as E;
        setError(errorObj);
        throw errorObj;
      } finally {
        setIsLoading(false);
      }
    },
    [requireAuth, refreshUserSession]
  );

  return {
    data,
    error,
    isLoading,
    request,
  };
}