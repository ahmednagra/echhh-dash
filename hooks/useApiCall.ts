// src/hooks/useApiCall.ts
import { useState, useCallback } from 'react';

interface UseApiCallOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  autoReset?: boolean;
}

export function useApiCall<T>(options: UseApiCallOptions = {}) {
  const { onSuccess, onError, autoReset = true } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = useCallback(
    async <R = T>(apiPromise: Promise<R>): Promise<R | null> => {
      setIsLoading(true);
      
      if (autoReset) {
        setData(null);
        setError(null);
      }
      
      try {
        const result = await apiPromise;
        setData(result as unknown as T);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
        onError?.(errorObj);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError, autoReset]
  );
  
  return {
    data,
    error,
    isLoading,
    execute,
    reset: useCallback(() => {
      setData(null);
      setError(null);
      setIsLoading(false);
    }, []),
  };
}