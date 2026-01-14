// ============================================
// 2. src/app/(dashboard)/settings/page.tsx
// ============================================
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SettingsIndexPage() {
  const { getPrimaryRole, isLoading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (isLoading) return;
    
    const primaryRole = getPrimaryRole() as DetailedRole;
    
    // Redirect to appropriate default settings page based on role
    const getDefaultSettingsPage = (role: DetailedRole): string => {
      // Platform roles
      if (role.startsWith('platform_')) {
        switch (role) {
          case 'platform_super_admin':
          case 'platform_admin':
            return '/settings/profile';
          case 'platform_agent':
            return '/settings/profile';
          case 'platform_financial_manager':
            return '/settings/profile';
          default:
            return '/settings/profile';
        }
      }
      
      // Company roles  
      if (role.startsWith('b2c_')) {
        switch (role) {
          case 'b2c_company_owner':
          case 'b2c_company_admin':
            return '/settings/company';
          case 'b2c_marketing_director':
          case 'b2c_campaign_manager':
            return '/settings/campaigns';
          case 'b2c_finance_manager':
            return '/settings/billing';
          case 'b2c_performance_analyst':
            return '/settings/analytics';
          default:
            return '/settings/profile';
        }
      }
      
      // Influencer roles
      if (role === 'influencer') {
        return '/settings/profile';
      }
      
      // Default to profile
      return '/settings/profile';
    };
    
    const defaultPage = getDefaultSettingsPage(primaryRole);
    router.replace(defaultPage);
    
  }, [isLoading, getPrimaryRole, router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Loading Settings...</h2>
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
}