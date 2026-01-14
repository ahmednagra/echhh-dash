// src/components/dashboard/campaign-funnel/result/PerformanceOverview.tsx
'use client';

import { AnalyticsData } from './types';

interface PerformanceOverviewProps {
  analyticsData: AnalyticsData;
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ analyticsData }) => {
  const formatNumber = (num: number): string => {
    if( num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getPercentageChange = (current: number, base: number = 1000): string => {
    if (base === 0) return '+0%';
    const change = ((current - base) / base) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // FIXED: Calculate engagement rate exactly as displayed in table
  // Uses the exact same totals that are summed from individual post calculations
  const calculateEngagementRate = (): number => {
    const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
    const engagementRate = analyticsData.totalFollowers > 0 ? (totalEngagement / analyticsData.totalFollowers) * 100 : 0;
    
    return engagementRate;
  };

  // FIXED: Calculate engagement rate by views using exact same totals as table
  const calculateEngagementRateByViews = (): number => {
    const totalEngagement = analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares;
    const engagementRateByViews = analyticsData.totalViews > 0 ? (totalEngagement / analyticsData.totalViews) * 100 : 0;
    
    return engagementRateByViews;
  };

  // First row - Basic Insights (4 cards) - FIXED: All use exact data from table
  const basicInsightsData = [
    {
      title: "Followers", 
      value: formatNumber(analyticsData.totalFollowers),
      change: getPercentageChange(analyticsData.totalFollowers, 100000),
      changeType: "positive" as const,
      tooltip: `Total unique followers across all participating influencers. Each influencer is counted once with their maximum follower count to avoid double counting. Total: ${analyticsData.totalFollowers.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Total Likes",
      value: formatNumber(analyticsData.totalLikes),
      change: getPercentageChange(analyticsData.totalLikes, 50000),
      changeType: "positive" as const,
      tooltip: `Sum of all likes across all campaign posts exactly as displayed in the Published Results table. Total: ${analyticsData.totalLikes.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </div>
      )
    },
    {
      title: "Total Comments",
      value: formatNumber(analyticsData.totalComments),
      change: getPercentageChange(analyticsData.totalComments, 5000),
      changeType: "positive" as const,
      tooltip: `Sum of all comments across all campaign posts exactly as displayed in the Published Results table. Total: ${analyticsData.totalComments.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      )
    },
    {
      title: "Total Views",
      value: formatNumber(analyticsData.totalViews),
      change: getPercentageChange(analyticsData.totalViews, 200000),
      changeType: analyticsData.totalViews > 200000 ? "positive" : "negative" as const,
      tooltip: `Sum of all views across all posts exactly as displayed in the Views column of the Published Results table. Uses video_play_count from Instagram API where available, with preserved manual entries. Total: ${analyticsData.totalViews.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
      )
    }
  ];

  // Second row - Total Shares, Impressions, Reach, Avg Engagement Rate - FIXED: All calculations
  const secondRowData = [
    {
      title: "Total Shares",
      value: formatNumber(analyticsData.totalShares),
      change: getPercentageChange(analyticsData.totalShares),
      changeType: "positive" as const,
      tooltip: `Total shares across all campaign posts exactly as displayed in the Shares column of the Published Results table. Includes manual entries and defaults to 0 for API-fetched posts where Instagram doesn't provide share data. Total: ${analyticsData.totalShares.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-violet-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
        </div>
      )
    },
    {
      title: "Impressions", 
      value: formatNumber(analyticsData.totalImpressions),
      change: getPercentageChange(analyticsData.totalImpressions, 500000),
      changeType: "positive" as const,
      tooltip: `Total number of times content was displayed. Calculated as: (Video Views × 1.3) + (Photo Posts × Avg Followers × 40% reach rate). Based on total views from the table: ${analyticsData.totalViews.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m4 0H3a1 1 0 00-1 1v16a1 1 0 001 1h18a1 1 0 001-1V5a1 1 0 00-1-1zM9 12l2 2 4-4"/>
          </svg>
        </div>
      )
    },
    {
      title: "Reach",
      value: formatNumber(analyticsData.totalReach), 
      change: getPercentageChange(analyticsData.totalReach, 300000),
      changeType: "positive" as const,
      tooltip: `Estimated unique users who saw your content. Calculated as 65% of total impressions, capped at engagement levels. Based on total views from table: ${analyticsData.totalViews.toLocaleString()}`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Avg Engagement Rate",
      value: `${calculateEngagementRate().toFixed(2)}%`,
      change: calculateEngagementRate() > 3 ? "+15.2%" : "-5.1%",
      changeType: calculateEngagementRate() > 3 ? "positive" : "negative" as const,
      tooltip: `Standard calculation: (Total Likes + Comments + Shares) ÷ Total Followers × 100. Uses exact totals from Published Results table: ${analyticsData.totalLikes.toLocaleString()} likes + ${analyticsData.totalComments.toLocaleString()} comments + ${analyticsData.totalShares.toLocaleString()} shares = ${(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares).toLocaleString()} total engagement. Divided by ${analyticsData.totalFollowers.toLocaleString()} followers.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
          </svg>
        </div>
      )
    }
  ];

  // FIXED: Third row with accurate CPV/CPE calculations based on exact table data
  const thirdRowData = [
    {
      title: "Total CPV",
      value: `${analyticsData.totalCPV.toFixed(4)}`,
      change: "+12.3%",
      changeType: "positive" as const,
      tooltip: `Cost Per View calculated as: Sum of all Collaboration Prices ÷ Total Views. Based on collaboration prices from Published Results table divided by ${analyticsData.totalViews.toLocaleString()} views (from Views column).`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
          </svg>
        </div>
      )
    },
    {
      title: "Total CPE",
      value: `${analyticsData.totalCPE.toFixed(4)}`,
      change: "+8.7%",
      changeType: "positive" as const,
      tooltip: `Cost Per Engagement calculated as: Sum of all Collaboration Prices ÷ Total Engagement. Based on collaboration prices from Published Results table divided by ${(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares).toLocaleString()} total engagement.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Views to Followers Ratio",
      value: `${(analyticsData.viewsToFollowersRatio / 100).toFixed(1)}x`,
      change: analyticsData.viewsToFollowersRatio > 50 ? "+25.6%" : "-10.2%",
      changeType: analyticsData.viewsToFollowersRatio > 50 ? "positive" : "negative" as const,
      tooltip: `Ratio of total views to total followers (${analyticsData.totalViews.toLocaleString()} views ÷ ${analyticsData.totalFollowers.toLocaleString()} followers). Values above 1.0x indicate content reaching beyond follower base. Uses exact data from Published Results Views column.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z"/>
          </svg>
        </div>
      )
    },
    {
      title: "Avg Engagement Rate (Views)",
      value: `${calculateEngagementRateByViews().toFixed(2)}%`,
      change: calculateEngagementRateByViews() > 5 ? "+18.4%" : "-5.3%",
      changeType: calculateEngagementRateByViews() > 5 ? "positive" : "negative" as const,
      tooltip: `Engagement rate based on views: (${(analyticsData.totalLikes + analyticsData.totalComments + analyticsData.totalShares).toLocaleString()} total engagement) ÷ (${analyticsData.totalViews.toLocaleString()} total views) × 100. Uses exact data from Published Results table columns.`,
      icon: (
        <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
          </svg>
        </div>
      )
    }
  ];

  const renderCard = (item: any, index: number, rowOffset: number = 0) => (
    <div 
      key={index} 
      className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 transform"
      style={{
        animationName: 'fadeInUp',
        animationDuration: '0.6s',
        animationTimingFunction: 'ease-out',
        animationFillMode: 'both',
        animationDelay: `${(index + rowOffset) * 100}ms`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-700">{item.title}</h3>
        <div className="relative group">
          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
            <div className="relative">
              {item.tooltip}
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Icon */}
      <div className="flex items-center justify-center mb-3">
        {item.icon}
      </div>

      <div className="text-center">
        <span className="text-3xl font-bold text-gray-900 block mb-1">{item.value}</span>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center space-x-2 mb-6 no-print">
        <h2 className="text-xl font-bold text-gray-800">Performance Overview</h2>
      </div>

      {/* First Row - Basic Insights - FIXED: Uses exact table data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {basicInsightsData.map((item, index) => renderCard(item, index, 0))}
      </div>

      {/* Second Row - FIXED: Uses exact table calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {secondRowData.map((item, index) => renderCard(item, index, 4))}
      </div>

      {/* Third Row - FIXED: Uses exact table-based CPV/CPE calculations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {thirdRowData.map((item, index) => renderCard(item, index, 8))}
      </div>

      {/* Add CSS for animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default PerformanceOverview;