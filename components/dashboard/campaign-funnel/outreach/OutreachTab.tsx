// src/components/dashboard/campaign-funnel/outreach/OutreachTab.tsx
'use client';

import { useState, useEffect } from 'react';
import { OutreachProvider, useOutreach } from '@/context/OutreachContext';
import { useCampaigns } from '@/context/CampaignContext';
import { getStatuses } from '@/services/statuses/statuses.service';
import { Status } from '@/types/statuses';
import MessageSent from './MessageSent';
import ReadyToOnboard from './ReadyToOnboard';
import OnBoarded from './OnBoarded';
import SelectedManually from './selected-manually';

// Inner component that uses the context
const OutreachContent: React.FC = () => {
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [clientReviewStatuses, setClientReviewStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const { fetchInfluencers, readyToOnboardInfluencers, currentCampaign, refreshData, onboardSelected } = useOutreach();
  const { currentCampaign: campaignFromContext } = useCampaigns();

  // Fetch statuses on component mount
  useEffect(() => {
    const fetchClientReviewStatuses = async () => {
      try {
        setStatusesLoading(true);
        console.log('🔄 OutreachTab: Fetching campaign influencer statuses');
        
        const allStatuses = await getStatuses('campaign_influencer');
        
        // Filter for client review statuses only
        const clientStatuses = allStatuses.filter(
          status => status.applies_to_field === 'client_review_status_id'
        );
        
        console.log('✅ OutreachTab: Client review statuses fetched:', clientStatuses.length);
        setClientReviewStatuses(clientStatuses);
      } catch (error) {
        console.error('❌ OutreachTab: Error fetching client review statuses:', error);
      } finally {
        setStatusesLoading(false);
      }
    };

    fetchClientReviewStatuses();
  }, []);

  // Handle status update in SelectedManually to refresh ReadyToOnboard data
  const handleStatusUpdate = async () => {
    console.log('🔄 OutreachTab: Status updated in SelectedManually, refreshing data');
    await refreshData();
  };

  useEffect(() => {
    console.log('🔍 OutreachTab: Campaign effect triggered', {
      hasCanpaign: !!campaignFromContext,
      campaignId: campaignFromContext?.id,
      campaignName: campaignFromContext?.name,
      campaignLists: campaignFromContext?.campaign_lists?.length
    });
    
    if (campaignFromContext) {
      console.log('🔄 OutreachTab: Campaign changed, fetching influencers:', campaignFromContext.id);
      fetchInfluencers(campaignFromContext);
    } else {
      console.log('⚠️ OutreachTab: No campaign data available');
    }
  }, [campaignFromContext, fetchInfluencers]);

  const handleSelectManually = () => {
    console.log('Opening manual selection view');
    setShowManualSelection(true);
  };

  const handleBackToMain = () => {
    console.log('Returning to main view');
    setShowManualSelection(false);
  };

  // Auto-close manual selection when all influencers are onboarded
  const handleAllOnboarded = () => {
    console.log('All influencers onboarded, closing manual selection');
    setShowManualSelection(false);
  };

  // Handle drag and drop from ReadyToOnboard to OnBoarded
  const handleInfluencerDrop = async (influencerId: string) => {
    try {
      console.log('🔄 OutreachTab: Dropping influencer to onboard:', influencerId);
      await onboardSelected([influencerId]);
      console.log('✅ OutreachTab: Successfully onboarded influencer via drag & drop');
    } catch (error) {
      console.error('❌ OutreachTab: Error onboarding influencer via drag & drop:', error);
    }
  };

  // Show manual selection view
  if (showManualSelection) {
    return (
      <SelectedManually 
        onBack={handleBackToMain}
        onAllOnboarded={handleAllOnboarded}
        campaignData={campaignFromContext}
        clientReviewStatuses={clientReviewStatuses}
        statusesLoading={statusesLoading}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  }

  // Show main outreach view with drag & drop support
  return (
    <div className="p-6">
      {/* Cards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message Sent Card */}
        <div className="relative">
          <MessageSent 
            campaignData={campaignFromContext} 
            clientReviewStatuses={clientReviewStatuses}
            statusesLoading={statusesLoading}
          />
        </div>

        {/* Ready to Onboard Card with Built-in Sliding Buttons */}
        <div className="relative">
          <ReadyToOnboard 
            clientReviewStatuses={clientReviewStatuses}
            statusesLoading={statusesLoading}
            enableDrag={true}
            onSelectManually={handleSelectManually}
          />
        </div>

        {/* On Boarded Card with Built-in Sliding Buttons */}
        <div className="relative">
          <OnBoarded 
            enableDrop={true}
            onInfluencerDrop={handleInfluencerDrop}
          />
        </div>
      </div>
    </div>
  );
};

// Main component with provider
const OutreachTab: React.FC = () => {
  return (
    <OutreachProvider>
      <OutreachContent />
    </OutreachProvider>
  );
};

export default OutreachTab;