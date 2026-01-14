// src/app/(dashboard)/@company/campaigns/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'react-feather';
import Link from 'next/link';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CampaignFunnelSection from '@/components/dashboard/campaign-funnel/CampaignFunnelSection';
import DashboardMetricsSection from '@/components/dashboard/metrics/DashboardMetricsSection';
import { useCampaigns } from '@/context/CampaignContext';
import CampaignNotFound from '@/components/dashboard/campaigns/CampaignNotFound';
import { ChatToggleButton } from '@/components/chat';
import { CampaignTab } from '@/types/ai'; // Updated import

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params?.id as string;
  const { getCampaign, currentCampaign, setCurrentCampaign } = useCampaigns();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<CampaignTab>('discover');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  useEffect(() => {
    async function loadCampaign() {
      if (!campaignId) {
        setError('Invalid campaign ID');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading campaign:', campaignId);
        const campaign = await getCampaign(campaignId);
        console.log('Campaign loaded:', campaign);
        
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
    
    if (currentCampaign && currentCampaign.id !== campaignId) {
      setCurrentCampaign(null);
    }
    
    loadCampaign();
    
    return () => {
      if (!campaignId) {
        setCurrentCampaign(null);
      }
    };
  }, [campaignId]);

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
      {/* Stats & Performance Section - FULL WIDTH */}
      <div className="w-full overflow-hidden mb-4">
        <DashboardMetricsSection userType="platform"/>
      </div>

      {/* Header with back button, campaign name, and chat toggle */}
      <div className="flex items-center justify-between gap-4 mb-4">
        {/* Left side - Back button */}
        <div className="flex-shrink-0">
          <Link 
            href="/campaigns" 
            className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
            <span className="truncate">Back to Campaigns</span>
          </Link>
        </div>

        {/* Center - Campaign Name */}
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-800 truncate">
            {currentCampaign.name}
          </h1>
        </div>
        
        {/* Right side - Chat Toggle Button */}
        <div className="flex-shrink-0">
          <ChatToggleButton 
            onClick={toggleChat}
            isOpen={isChatOpen}
          />
        </div>
      </div>

      {/* Campaign Funnel with integrated Chat Sidebar */}
      <div className="w-full overflow-hidden">
        <CampaignFunnelSection 
          userType="b2c" 
          campaignData={currentCampaign} 
          isNewCampaign={false}
          onTabChange={(tab) => setActiveTab(tab as CampaignTab)}
          // Pass chat-related props
          campaignId={campaignId}
          showChat={true}
          isChatOpen={isChatOpen}
          onChatToggle={toggleChat}
        />
      </div>
    </div>
  );
}