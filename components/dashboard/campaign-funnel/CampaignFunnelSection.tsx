// src/components/dashboard/campaign-funnel/CampaignFunnelSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DiscoverTab from '@/components/dashboard/campaign-funnel/discover/DiscoverTab';
import OutreachTab from '@/components/dashboard/campaign-funnel/outreach/OutreachTab';
import ManagementTab from '@/components/dashboard/campaign-funnel/management/ManagementTab';
import ResultTab from '@/components/dashboard/campaign-funnel/result/ResultTab';
import PaymentsTab from '@/components/dashboard/campaign-funnel/payments/PaymentsTab';
import { Campaign } from '@/types/campaign';

// Define the available tab options
type FunnelTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

interface CampaignFunnelSectionProps {
  userType?: 'b2c' | 'influencer' | 'platform';
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  initialTab?: FunnelTab;
}

const CampaignFunnelSection: React.FC<CampaignFunnelSectionProps> = ({ 
  userType = 'b2c',
  campaignData = null,
  isNewCampaign = false,
  initialTab = 'discover'
}) => {
  const [activeTab, setActiveTab] = useState<FunnelTab>(initialTab);
  const router = useRouter();

  // Handle tab change
  const handleTabChange = (tab: FunnelTab) => {
    setActiveTab(tab);
  };

  // Handle campaign creation - used for new campaigns
  const handleCampaignCreated = (createdCampaign: Campaign) => {
    if (createdCampaign && createdCampaign.id) {
      router.push(`/campaigns/${createdCampaign.id}`);
    }
  };

  // Get tab-specific styling matching Expand Filters button exactly
  const getTabStyling = (tab: FunnelTab, isActive: boolean) => {
    // UPDATED: Using border (1px) for all tabs, matching the Platform button style
    const baseClasses = isActive 
      ? "flex-1 px-6 py-3 text-sm font-bold rounded-full transition-all duration-200 mx-2 border"
      : "flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 mx-2 border hover:shadow-sm transform hover:scale-[1.01]";
    
    const tabColors = {
      discover: {
        // UPDATED: Lighter background with dark purple text for better contrast
        active: 'bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1]',
        // UPDATED: Thin subtle border matching Platform button style
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      outreach: {
        // UPDATED: Lighter background with dark blue text for better contrast
        active: 'bg-[#DCE5F2] text-[#4A6B8A] border-[#95ABCE]',
        // UPDATED: Thin subtle border matching Platform button style
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      management: {
        // UPDATED: Lighter background with dark green text for better contrast
        active: 'bg-[#DDE9DE] text-[#4A7A4F] border-[#94BF99]',
        // UPDATED: Thin subtle border matching Platform button style
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      result: {
        // UPDATED: Lighter background with dark orange/brown text for better contrast
        active: 'bg-[#FEE7D6] text-[#B56B3F] border-[#FCB07C]',
        // UPDATED: Thin subtle border matching Platform button style
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      payments: {
        // UPDATED: Lighter background with dark pink text for better contrast
        active: 'bg-[#FDDDDD] text-[#C25B5B] border-[#FA9494]',
        // UPDATED: Thin subtle border matching Platform button style
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      }
    };

    return `${baseClasses} ${isActive ? tabColors[tab].active : tabColors[tab].inactive}`;
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'discover':
        return (
          <DiscoverTab 
            campaignData={campaignData} 
            isNewCampaign={isNewCampaign}
            onCampaignCreated={isNewCampaign ? handleCampaignCreated : undefined}
          />
        );
      case 'outreach':
        return <OutreachTab />;
      case 'management':
        return <ManagementTab/>;
      case 'result':
        return <ResultTab
          campaignData={campaignData}
        />;
      case 'payments':
        return <PaymentsTab/>;
      default:
        return <DiscoverTab 
          campaignData={campaignData} 
          isNewCampaign={isNewCampaign}
          onCampaignCreated={isNewCampaign ? handleCampaignCreated : undefined}
        />;
    }
  };

  return (
    <>
    {/* Tab Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 py-2">
        <button
          className={getTabStyling('discover', activeTab === 'discover')}
          onClick={() => handleTabChange('discover')}
        >
          Discover
        </button>
        
        <button
          className={getTabStyling('outreach', activeTab === 'outreach')}
          onClick={() => handleTabChange('outreach')}
          disabled={isNewCampaign}
        >
          Outreach
        </button>
        
        <button
          className={getTabStyling('management', activeTab === 'management')}
          onClick={() => handleTabChange('management')}
          disabled={isNewCampaign}
        >
          Campaign
        </button>
        
        <button
          className={getTabStyling('result', activeTab === 'result')}
          onClick={() => handleTabChange('result')}
          disabled={isNewCampaign}
        >
          Result
        </button>
        
        <button
          className={getTabStyling('payments', activeTab === 'payments')}
          onClick={() => handleTabChange('payments')}
          disabled={isNewCampaign}
        >
          Payments
        </button>
      </div>
    <div className="w-full overflow-hidden bg-white rounded-xl shadow-md mb-4">
    {/* Tab Content */}
      <div className="p-4">
        {renderTabContent()}
      </div>
    </div>
    </>
  );
};

export default CampaignFunnelSection;