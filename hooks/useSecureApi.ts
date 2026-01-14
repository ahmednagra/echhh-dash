// src/hooks/useSecureApi.ts
import { useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApiCall } from './useApiCall';

interface UseSecureApiOptions {
  requireAuth?: boolean;
  onAuthError?: () => void;
}

export function useSecureApi<T>(options: UseSecureApiOptions = {}) {
  const { requireAuth = true, onAuthError } = options;
  const { refreshUserSession } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const apiCall = useApiCall<T>({
    onError: async (error) => {
      // Handle 401 errors automatically if they occur during an API call
      if (error.message.includes('401') && requireAuth && !isRefreshing) {
        setIsRefreshing(true);
        const refreshSuccess = await refreshUserSession();
        setIsRefreshing(false);
        
        if (!refreshSuccess && onAuthError) {
          onAuthError();
        }
      }
    }
  });

  // Wrapper function for API calls
  const secureCall = useCallback(
    async <R = T>(apiPromise: Promise<R>): Promise<R | null> => {
      return apiCall.execute(apiPromise);
    },
    [apiCall]
  );

  return {
    ...apiCall,
    secureCall,
  };
}