// src/app/(dashboard)/campaigns/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import CampaignFunnelSection from '@/components/dashboard/campaign-funnel/CampaignFunnelSection';
import DashboardMetricsSection from '@/components/dashboard/metrics/DashboardMetricsSection';

export default function NewCampaignPage() {
  const router = useRouter();
  
  // This will be empty for a new campaign
  const campaignData = {
    id: '',
    name: 'New Campaign',
    brand_name: '',
    status_id: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="mx-auto px-4 py-8">
      {/* Header with back button and title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <Link 
            href="/campaigns" 
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">Create New Campaign</h1>
          <div className="flex items-center mt-2">
            <span className="px-3 py-1 rounded-full text-xs mr-3 bg-gray-100 text-gray-800">
              Draft
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Section - Same as the campaign detail page */}
      <DashboardMetricsSection userType="company" />

      {/* Main content - Campaign Funnel */}
      <CampaignFunnelSection 
        userType="company" 
        isNewCampaign={true} 
        initialTab="discover" 
      />
    </div>
  );
}