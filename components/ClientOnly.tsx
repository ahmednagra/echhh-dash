// src/components/ClientOnly.tsx - Hydration-safe wrapper
'use client';

import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper component that only renders children on the client-side
 * This prevents hydration mismatches for components that use browser-only APIs
 */
export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}