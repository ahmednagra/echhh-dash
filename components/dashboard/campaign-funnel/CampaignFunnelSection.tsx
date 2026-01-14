// src/components/dashboard/campaign-funnel/CampaignFunnelSection.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DiscoverTab from '@/components/dashboard/campaign-funnel/discover/DiscoverTab';
import OutreachTab from '@/components/dashboard/campaign-funnel/outreach/OutreachTab';
import ManagementTab from '@/components/dashboard/campaign-funnel/management/ManagementTab';
import ResultTab from '@/components/dashboard/campaign-funnel/result/ResultTab';
import PaymentsTab from '@/components/dashboard/campaign-funnel/payments/PaymentsTab';
import { ChatSidebar, AISearchResultsData } from '@/components/chat';
import { Campaign } from '@/types/campaign';
import { CampaignTab, InfluencerSearchResults } from '@/types/ai';

// Define the available tab options
type FunnelTab = 'discover' | 'outreach' | 'management' | 'result' | 'payments';

// Type for AI-discovered influencers to pass to DiscoverTab
export interface AIDiscoveredInfluencers {
  searchResults: InfluencerSearchResults;
  filtersUsed?: Record<string, any>;
  appliedFilters?: Record<string, any>;
  totalCount: number;
  timestamp: number; // To trigger re-render when same results come in
}

interface CampaignFunnelSectionProps {
  userType?: 'b2c' | 'influencer' | 'platform';
  campaignData?: Campaign | null;
  isNewCampaign?: boolean;
  initialTab?: FunnelTab;
  onTabChange?: (tab: FunnelTab) => void;
  // Chat-related props
  campaignId?: string;
  showChat?: boolean;
  isChatOpen?: boolean;
  onChatToggle?: () => void;
}

const CampaignFunnelSection: React.FC<CampaignFunnelSectionProps> = ({ 
  userType = 'b2c',
  campaignData = null,
  isNewCampaign = false,
  initialTab = 'discover',
  onTabChange,
  // Chat props
  campaignId,
  showChat = false,
  isChatOpen = false,
  onChatToggle,
}) => {
  const [activeTab, setActiveTab] = useState<FunnelTab>(initialTab);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
 
  // State for AI-discovered influencers
  const [aiDiscoveredInfluencers, setAiDiscoveredInfluencers] = useState<AIDiscoveredInfluencers | null>(null);

  // Handle AI search results from ChatInterface
  const handleAISearchResults = useCallback((data: AISearchResultsData) => {
    console.log('🤖 CampaignFunnelSection: Received AI search results');
    console.log('🤖 Total influencers:', data.searchResults?.influencers?.length || 0);
    console.log('🤖 Total count:', data.totalCount);
    
    // Only update if we're on the discover tab
    if (activeTab === 'discover') {
      setAiDiscoveredInfluencers({
        searchResults: data.searchResults,
        filtersUsed: data.filtersUsed,
        appliedFilters: data.appliedFilters,
        totalCount: data.totalCount,
        timestamp: Date.now(), // Add timestamp to ensure re-render
      });
    }
  }, [activeTab]);

  // Measure the total height (tabs + content) for chat to match
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        // Get the total height of the left container (tabs + content box)
        const containerHeight = containerRef.current.offsetHeight;
        // Subtract the margin-bottom (mb-4 = 16px) to match exactly
        setContentHeight(containerHeight);
      }
    };

    // Initial measurement
    updateHeight();
    
    // Use ResizeObserver to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to avoid layout thrashing
      requestAnimationFrame(updateHeight);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    window.addEventListener('resize', updateHeight);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [activeTab]);

  // Handle tab change
  const handleTabChange = (tab: FunnelTab) => {
    setActiveTab(tab);
    
    // Notify parent component of tab change
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  // Handle campaign creation - used for new campaigns
  const handleCampaignCreated = (createdCampaign: Campaign) => {
    if (createdCampaign && createdCampaign.id) {
      router.push(`/campaigns/${createdCampaign.id}`);
    }
  };

  // Get tab-specific styling matching Expand Filters button exactly
  const getTabStyling = (tab: FunnelTab, isActive: boolean) => {
    // Using border (1px) for all tabs, matching the Platform button style
    const baseClasses = isActive 
      ? "flex-1 px-6 py-3 text-sm font-bold rounded-full transition-all duration-200 mx-2 border"
      : "flex-1 px-6 py-3 text-sm font-semibold rounded-full transition-all duration-200 mx-2 border hover:shadow-sm transform hover:scale-[1.01]";
    
    const tabColors = {
      discover: {
        active: 'bg-[#E8DFF5] text-[#6B4C9A] border-[#A590D1]',
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      outreach: {
        active: 'bg-[#DCE5F2] text-[#4A6B8A] border-[#95ABCE]',
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      management: {
        active: 'bg-[#DDE9DE] text-[#4A7A4F] border-[#94BF99]',
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      result: {
        active: 'bg-[#FEE7D6] text-[#B56B3F] border-[#FCB07C]',
        inactive: 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
      },
      payments: {
        active: 'bg-[#FDDDDD] text-[#C25B5B] border-[#FA9494]',
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
            aiDiscoveredInfluencers={aiDiscoveredInfluencers}
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
          aiDiscoveredInfluencers={aiDiscoveredInfluencers}
        />;
    }
  };

  // Check if chat should be shown
  const showChatSidebar = showChat && isChatOpen && campaignId && onChatToggle;

  return (
    <div className="flex gap-4 items-start">
      {/* LEFT: Main Funnel Content - This is the reference for chat height */}
      <div ref={containerRef} className="flex-1 min-w-0 flex flex-col">
        {/* Tab Navigation */}
        <div 
          ref={tabsRef}
          className="flex items-center justify-between border-b border-gray-200 py-2"
        >
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

        {/* Tab Content - This is the white card with shadow */}
        <div 
          ref={contentRef}
          className="w-full overflow-hidden bg-white rounded-xl shadow-md flex-1"
        >
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* RIGHT: AI Chat Sidebar - Sticky, height matches left container */}
      {showChatSidebar && (
        <div className="sticky top-4 flex-shrink-0">
          <ChatSidebar 
            campaignId={campaignId!}
            currentTab={activeTab as CampaignTab}
            isOpen={isChatOpen}
            onToggle={onChatToggle!}
            height={contentHeight > 0 ? contentHeight : undefined}
            onSearchResults={handleAISearchResults}
          />
        </div>
      )}
    </div>
  );
};

export default CampaignFunnelSection;