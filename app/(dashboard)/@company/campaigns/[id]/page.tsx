// src/app/(dashboard)/campaigns/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Share2 } from 'react-feather';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CampaignFunnelSection from '@/components/dashboard/campaign-funnel/CampaignFunnelSection';
import DashboardMetricsSection from '@/components/dashboard/metrics/DashboardMetricsSection';
import { useCampaigns } from '@/context/CampaignContext';
import CampaignNotFound from '@/components/dashboard/campaigns/CampaignNotFound';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params?.id as string;
  const { getCampaign, currentCampaign, setCurrentCampaign } = useCampaigns();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCampaign() {
      if (!campaignId) {
        setError('Invalid campaign ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        console.log('Loading campaign:', campaignId); // Debug log
        const campaign = await getCampaign(campaignId);
        console.log('Campaign loaded:', campaign); // Debug log
        
        if (!campaign) {
          if (!/^[0-9a-f-]{32,36}$/i.test(campaignId)) {
            setError('invalid_format');
          } else {
            setError('not_found');
          }
        }
      } catch (error) {
        console.error('Error loading campaign:', error);
        setError('error_loading');
      } finally {
        setIsLoading(false);
      }
    }
    
    // Clear current campaign when switching to a different campaign
    if (currentCampaign && currentCampaign.id !== campaignId) {
      setCurrentCampaign(null);
    }
    
    loadCampaign();
    
    // Cleanup function
    return () => {
      // Only clear if we're unmounting completely, not just switching campaigns
      if (!campaignId) {
        setCurrentCampaign(null);
      }
    };
  }, [campaignId]); // Removed getCampaign from dependencies to prevent re-runs

  // Separate effect to handle current campaign changes
  useEffect(() => {
    if (currentCampaign && currentCampaign.id === campaignId) {
      setIsLoading(false);
      setError(null);
    }
  }, [currentCampaign, campaignId]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !currentCampaign) {
    let errorMessage;
    
    switch (error) {
      case 'not_found':
        errorMessage = "We couldn't find this campaign. It may have been deleted or you might not have access.";
        break;
      case 'invalid_format':
        errorMessage = "The campaign ID format is invalid. Please check the URL and try again.";
        break;
      case 'error_loading':
        errorMessage = "We encountered a problem while loading this campaign. Please try again later.";
        break;
      default:
        errorMessage = error;
    }
    
    return <CampaignNotFound error={errorMessage} />;
  }

  return (
    <div className="w-full overflow-hidden px-2">
      {/* MOVED: Stats & Performance Section - Now appears FIRST */}
      <div className="w-full overflow-hidden mb-4">
        <DashboardMetricsSection userType="platform"/>
      </div>

      {/* Header with back button and actions - Now appears SECOND */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        {/* Left side - Back button */}
        <div className="flex-shrink-0">
          <Link 
            href="/campaigns" 
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">Back to Campaigns</span>
          </Link>
        </div>

        {/* Center - Campaign Name */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800 truncate">{currentCampaign.name}</h1>
        </div>
        
        {/* Right side - Share button (commented out) */}
        {/* 
        <div className="flex-shrink-0">
          <button className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
        </div>
        */}
        
        {/* Empty div to maintain flex layout balance */}
        <div className="flex-shrink-0 w-20"></div>
      </div>

      {/* Main content - Campaign Funnel */}
      <div className="w-full overflow-hidden">
        <CampaignFunnelSection 
          userType="b2c" 
          campaignData={currentCampaign} 
          isNewCampaign={false}
        />
      </div>
    </div>
  );
}