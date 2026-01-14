// src/components/dashboard/campaign-funnel/result/ResultTab.tsx
'use client';

import { useState } from 'react';
import ScheduledResults from './ScheduledResults';
import PublishedResults from './PublishedResults';
import AnalyticsView from './AnalyticsView';
import SentimentAnalysis from './SentimentAnalysis';
import { Campaign } from '@/types/campaign';
import { MessageCircle, BarChart2 } from 'lucide-react';
import Button, { getToggleContainerStyles } from '@/components/ui/Button';

type TabType = 'scheduled' | 'published';

const TABS = {
  SCHEDULED: 'scheduled' as const,
  PUBLISHED: 'published' as const,
} satisfies Record<string, TabType>;

interface ResultTabProps {
  campaignData?: Campaign | null;
}

const ResultTab: React.FC<ResultTabProps> = ({ 
  campaignData = null,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(TABS.PUBLISHED);
  const [showAnalyticsView, setShowAnalyticsView] = useState(false);
  const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [publishedVideoCount, setPublishedVideoCount] = useState(0);

  // Handle video count updates from PublishedResults
  const handleVideoCountChange = (count: number) => {
    setPublishedVideoCount(count);
  };

  // If sentiment analysis view is active, show that component
if (showSentimentAnalysis && campaignData?.id) {
  return (
    <SentimentAnalysis
      campaignId={campaignData.id}
      onBack={() => setShowSentimentAnalysis(false)}
    />
  );
}
  
  // If sentiment analysis view is active, show that component
  if (showSentimentAnalysis && campaignData?.id) {
    return (
      <SentimentAnalysis
        campaignId={campaignData.id}
        onBack={() => setShowSentimentAnalysis(false)}
      />
    );
  }

  // If analytics view is active, show that component
  if (showAnalyticsView) {
    return <AnalyticsView onBack={() => setShowAnalyticsView(false)} campaignData={campaignData} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with tab buttons - Always visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">
            {activeTab === TABS.SCHEDULED ? 'Scheduled Campaign Content' : 'Published Campaign Result'}
          </h2>
          
          {/* All Buttons - Unified Styling */}
          <div className="flex items-center gap-2">
            {/* View Analytics Button */}
            <Button
              variant="feature"
              size="md"
              leftIcon={<BarChart2 className="w-4 h-4" />}
              onClick={() => setShowAnalyticsView(true)}
            >
              View Analytics
            </Button>

            {/* Sentiment Analysis Button */}
            <Button
              variant="feature"
              size="md"
              leftIcon={<MessageCircle className="w-4 h-4" />}
              onClick={() => setShowSentimentAnalysis(true)}
              disabled={!campaignData?.id}
            >
              Sentiment Analysis
            </Button>

            {/* Scheduled Button */}
            <Button
              variant={activeTab === TABS.SCHEDULED ? 'toggle-active' : 'toggle-inactive'}
              size="md"
              onClick={() => setActiveTab(TABS.SCHEDULED)}
            >
              Scheduled (345)
            </Button>

            {/* Published Button */}
            <Button
              variant={activeTab === TABS.PUBLISHED ? 'toggle-active' : 'toggle-inactive'}
              size="md"
              onClick={() => setActiveTab(TABS.PUBLISHED)}
            >
              Published ({publishedVideoCount})
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === TABS.SCHEDULED ? (
        <ScheduledResults onTabChange={setActiveTab} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <PublishedResults 
            campaignData={campaignData}
            onVideoCountChange={handleVideoCountChange}
            // onShowAnalytics={() => setShowAnalyticsView(true)}
          />
        </div>
      )}
    </div>
  );
};

export default ResultTab;