// src/app/(dashboard)/@company/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CompanyDashboard } from '@/components/dashboard';
import { getCompanyCampaigns } from '@/services/campaign/campaign.service';
import { getStoredCompany } from '@/services/auth/auth.utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanyDashboardPage() {
  const { getPrimaryRole, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const primaryRole = getPrimaryRole();
  
  useEffect(() => {
    // FIXED: Only run redirect logic once when component mounts
    // and only if we haven't already checked
    if (hasCheckedRedirect || !isAuthenticated || !user) {
      return;
    }

    // FIXED: Only redirect if we're specifically on /dashboard, not on /campaigns or other routes
    if (pathname !== '/dashboard') {
      setHasCheckedRedirect(true);
      return;
    }

    const redirectToCompanyCampaign = async () => {
      setIsRedirecting(true);
      
      try {
        // Different behavior based on company role - UPDATED with actual roles
        switch (primaryRole) {
          case 'b2c_marketing_director':
          case 'b2c_campaign_manager':
          case 'b2c_campaign_executive':
          case 'b2c_company_admin':
          case 'b2c_company_owner':
            // These roles should redirect to campaigns
            const company = getStoredCompany();
            
            if (company && company.id) {
              try {
                const campaigns = await getCompanyCampaigns(company.id);
                
                if (campaigns && campaigns.length > 0) {
                  // Navigate to campaigns list page, not a specific campaign
                  router.push('/campaigns');
                } else {
                  // No campaigns, redirect to create new campaign
                  router.push('/campaigns/new');
                }
              } catch (campaignError) {
                // If there's an error fetching campaigns, just go to campaigns page
                router.push('/campaigns');
              }
            } else {
              setIsRedirecting(false);
            }
            break;
            
          case 'b2c_social_media_manager':
          case 'b2c_content_creator':
          case 'b2c_brand_manager':
          case 'b2c_performance_analyst':
          case 'b2c_finance_manager':
          case 'b2c_account_coordinator':
          case 'b2c_viewer':
          default:
            // These roles stay on the dashboard
            console.log('🏠 Company Dashboard: Non-marketing role, staying on dashboard');
            setIsRedirecting(false);
            break;
        }
      } catch (error) {
        console.error('💥 Company Dashboard: Error in redirect logic:', error);
        setIsRedirecting(false);
      } finally {
        setHasCheckedRedirect(true);
      }
    };
    
    // Add a small delay to prevent immediate redirects that might cause loops
    const timeoutId = setTimeout(() => {
      redirectToCompanyCampaign();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [router, primaryRole, pathname, isAuthenticated, user, hasCheckedRedirect]);
  
  // Show loading while redirecting
  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner message="Setting up your dashboard..." />
      </div>
    );
  }
  
  // Show dashboard with role-specific welcome message - UPDATED with actual roles
  const getRoleSpecificMessage = () => {
    switch (primaryRole) {
      case 'b2c_company_owner':
        return 'Manage your company campaigns, team, and overall strategy.';
      case 'b2c_company_admin':
        return 'Administer company settings, users, and campaign oversight.';
      case 'b2c_marketing_director':
        return 'Oversee marketing strategy and campaign performance across all initiatives.';
      case 'b2c_campaign_manager':
        return 'Create, manage, and optimize your influencer marketing campaigns.';
      case 'b2c_campaign_executive':
        return 'Execute campaigns and coordinate with influencers and stakeholders.';
      case 'b2c_social_media_manager':
        return 'Manage social media strategy and influencer relationships.';
      case 'b2c_content_creator':
        return 'Create compelling content and campaign assets for your initiatives.';
      case 'b2c_brand_manager':
        return 'Maintain brand consistency and guidelines across all campaigns.';
      case 'b2c_performance_analyst':
        return 'Analyze campaign performance and provide actionable insights.';
      case 'b2c_finance_manager':
        return 'Oversee campaign budgets, payments, and financial reporting.';
      case 'b2c_account_coordinator':
        return 'Coordinate campaign activities and ensure smooth execution.';
      case 'b2c_viewer':
        return 'View campaign data and performance metrics.';
      default:
        return 'Welcome to your company dashboard.';
    }
  };
  
  // Format role name for display - UPDATED
  const formatRoleName = (role: string|null) => {
    if (!role) return 'User';
    
    // Remove prefixes and format
    return role
      .replace('b2c_', '')
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {formatRoleName(primaryRole)} Dashboard
        </h1>
        <p className="text-gray-600">{getRoleSpecificMessage()}</p>
      </div>
      <CompanyDashboard />
    </div>
  );
}