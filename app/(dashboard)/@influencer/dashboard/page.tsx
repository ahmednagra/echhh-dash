// src/app/(dashboard)/@influencer/dashboard/page.tsx - Enhanced with role support
'use client';

import { useAuth } from '@/context/AuthContext';
import { InfluencerDashboard } from '@/components/dashboard';

export default function InfluencerDashboardPage() {
  const { user, getPrimaryRole } = useAuth();
  const primaryRole = getPrimaryRole();
  
  // Role-specific welcome message
  const getRoleSpecificMessage = () => {
    switch (primaryRole) {
      case 'influencer_manager':
        return 'Manage your influencer portfolio and campaigns.';
      case 'influencer':
        return 'Track your campaigns and grow your influence.';
      default:
        return 'Welcome to your influencer dashboard.';
    }
  };
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {primaryRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Dashboard
        </h1>
        <p className="text-gray-600">{getRoleSpecificMessage()}</p>
      </div>
      <InfluencerDashboard />
    </div>
  );
}