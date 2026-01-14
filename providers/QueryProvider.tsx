// src/providers/QueryProvider.tsx
// React Query Provider wrapper for the application
'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createQueryClient } from '@/lib/react-query';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * QueryProvider Component
 * 
 * Wraps the application with React Query's QueryClientProvider.
 * Creates a stable QueryClient instance that persists across re-renders.
 * 
 * Features:
 * - Creates QueryClient once per component lifecycle
 * - Includes React Query DevTools in development
 * - Properly handles server-side rendering
 * 
 * Usage:
 * Wrap your root layout or app with this provider:
 * 
 * ```tsx
 * // In layout.tsx or _app.tsx
 * <QueryProvider>
 *   <YourApp />
 * </QueryProvider>
 * ```
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient once using useState initializer
  // This ensures the same client is used across re-renders
  const [queryClient] = useState(() => createQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only shown in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-left"
        />
      )}
    </QueryClientProvider>
  );
}

export default QueryProvider;