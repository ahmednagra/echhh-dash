// ============================================
// 7. src/app/(dashboard)/settings/billing/page.tsx
// ============================================
'use client';

import { useAuth } from '@/context/AuthContext';
import BillingSettings from '@/components/settings/company/BillingSettings';
import UnauthorizedAccess from '@/components/ui/UnauthorizedAccess';

export default function BillingPage() {
  const { getPrimaryRole } = useAuth();
  const role = getPrimaryRole();
  
  // Only specific company roles can access billing
  const allowedRoles = [
    'b2c_company_owner', 
    'b2c_company_admin', 
    'b2c_finance_manager'
  ];
  
  if (!allowedRoles.includes(role)) {
    return <UnauthorizedAccess />;
  }

  return <BillingSettings />;
}