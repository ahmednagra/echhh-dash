// ============================================
// 6. src/app/(dashboard)/settings/company/page.tsx
// ============================================
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import CompanySettings from '@/components/settings/company/CompanySettings';
import UnauthorizedAccess from '@/components/ui/UnauthorizedAccess';

export default function CompanyPage() {
  const { getPrimaryRole } = useAuth();
  const { canAccessResource } = usePermissions();
  
  const role = getPrimaryRole();
  
  // Only company owners/admins can access
  const allowedRoles = ['b2c_company_owner', 'b2c_company_admin'];
  
  if (!allowedRoles.includes(role)) {
    return <UnauthorizedAccess />;
  }

  return <CompanySettings />;
}