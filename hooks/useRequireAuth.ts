// src/hooks/useRequireAuth.ts
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useRequireAuth(requiredRoles: string[] = []) {
  const { isAuthenticated, isLoading, roles, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requiredRoles.length > 0) {
      const userRoleNames = roles.map(role => role.name);
      const hasRequiredRole = requiredRoles.some(role => userRoleNames.includes(role));
      
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, roles, router]);

  return { isLoading, isAuthenticated, user, roles };
}