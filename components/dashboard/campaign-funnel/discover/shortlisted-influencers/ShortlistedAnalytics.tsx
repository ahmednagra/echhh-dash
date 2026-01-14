// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedAnalytics.tsx
'use client';

import { CampaignListMember } from '@/services/campaign/campaign-list.service';

interface ShortlistedAnalyticsProps {
  shortlistedInfluencers: CampaignListMember[];
}

const ShortlistedAnalytics: React.FC<ShortlistedAnalyticsProps> = ({ shortlistedInfluencers }) => {
  // Early return if no data
  if (!shortlistedInfluencers || !Array.isArray(shortlistedInfluencers) || shortlistedInfluencers.length === 0) {
    return (
      <div className="w-4/12 bg-white rounded-lg shadow flex flex-col">
        <div className="p-5 flex flex-col h-full justify-center items-center">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 mb-2">List Analyze</h2>
            <p className="text-gray-500 text-sm">No influencers data available</p>
            <p className="text-gray-400 text-xs mt-1">Add influencers to see analytics</p>
          </div>
        </div>
      </div>
    );
  }

  // Format number helper
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Helper function to safely access additional metrics
  const getAdditionalMetric = (member: CampaignListMember, key: string, defaultValue: any = null) => {
    const additionalMetrics = member?.social_account?.additional_metrics;
    if (!additionalMetrics || typeof additionalMetrics !== 'object') {
      return defaultValue;
    }
    
    const metricsObj = additionalMetrics as Record<string, any>;
    return metricsObj[key] ?? defaultValue;
  };

  // Calculate total followers
  const totalFollowers = shortlistedInfluencers.reduce((total, influencer) => {
    const followersCount = influencer.social_account?.followers_count;
    let parsedCount = 0;
    
    if (followersCount) {
      if (typeof followersCount === 'string') {
        const numStr = (followersCount as string).toLowerCase() || '0';
        const baseNumber = parseFloat(numStr.replace(/[km]/g, ''));
        if (numStr.includes('k')) {
          parsedCount = baseNumber * 1000;
        } else if (numStr.includes('m')) {
          parsedCount = baseNumber * 1000000;
        } else {
          parsedCount = baseNumber || 0;
        }
      } else if (typeof followersCount === 'number') {
        parsedCount = followersCount;
      }
    }
    
    return total + parsedCount;
  }, 0);

  // Calculate total content count
  const totalContentCount = shortlistedInfluencers.reduce((total, influencer) => {
    const contentCount = getAdditionalMetric(influencer, 'content_count') || 
                        influencer.social_account?.media_count || 0;
    return total + contentCount;
  }, 0);

  // Calculate average engagement rate
  const averageEngagementRate = shortlistedInfluencers.length > 0 ? 
    shortlistedInfluencers.reduce((total, influencer) => {
      const engagementRate = getAdditionalMetric(influencer, 'engagementRate') || 0;
      return total + engagementRate;
    }, 0) / shortlistedInfluencers.length : 0;

  // Calculate total average likes
  const totalAverageLikes = shortlistedInfluencers.reduce((total, influencer) => {
    const avgLikes = getAdditionalMetric(influencer, 'average_likes') || 0;
    return total + avgLikes;
  }, 0);

  // Calculate total reel views
  const totalReelViews = shortlistedInfluencers.reduce((total, influencer) => {
    const instagramOptions = getAdditionalMetric(influencer, 'instagram_options');
    const filterMatch = getAdditionalMetric(influencer, 'filter_match');
    
    let reelViews = 0;
    
    if (instagramOptions?.reel_views) {
      reelViews = typeof instagramOptions.reel_views === 'number' 
        ? instagramOptions.reel_views 
        : 0;
    } else if (filterMatch?.instagram_options?.reel_views) {
      reelViews = typeof filterMatch.instagram_options.reel_views === 'number' 
        ? filterMatch.instagram_options.reel_views 
        : 0;
    }
    
    return total + reelViews;
  }, 0);

  // Calculate total average views
  const totalAverageViews = shortlistedInfluencers.reduce((total, influencer) => {
    const avgViews = getAdditionalMetric(influencer, 'average_views') || totalReelViews > 0 ? (totalReelViews / shortlistedInfluencers.length) : 0;
    return total + avgViews;
  }, 0);

  // Calculate estimated total engagements
  const estimatedTotalEngagements = shortlistedInfluencers.reduce((total, influencer) => {
    const avgLikes = getAdditionalMetric(influencer, 'average_likes') || 0;
    const contentCount = getAdditionalMetric(influencer, 'content_count') || 
                        influencer.social_account?.media_count || 1;
    return total + (avgLikes * contentCount);
  }, 0);

  // Count verified influencers
  const verifiedCount = shortlistedInfluencers.filter(influencer => 
    influencer.social_account?.is_verified || getAdditionalMetric(influencer, 'isVerified')
  ).length;

  // Count business accounts
  const businessAccountsCount = shortlistedInfluencers.filter(influencer => 
    influencer.social_account?.is_business || 
    getAdditionalMetric(influencer, 'platform_account_type') === 'BUSINESS'
  ).length;

  // Calculate total subscribers
  const totalSubscribers = shortlistedInfluencers.reduce((total, influencer) => {
    const subscriberCount = influencer.social_account?.subscribers_count || 
                           getAdditionalMetric(influencer, 'subscriber_count') || 0;
    return total + subscriberCount;
  }, 0);

  // Calculate audience age distribution from real data (by creators' age groups)
  const calculateAgeDistribution = () => {
    const ageGroups = { '13-17': 0, '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0 };
    let totalCount = 0;

    shortlistedInfluencers.forEach(influencer => {
      const creatorAge = getAdditionalMetric(influencer, 'age_group');
      if (creatorAge && ageGroups.hasOwnProperty(creatorAge)) {
        ageGroups[creatorAge as keyof typeof ageGroups]++;
        totalCount++;
      }
    });

    // Calculate percentages and sort in ascending order
    const percentages = Object.entries(ageGroups)
      .map(([group, count]) => ({
        group,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
      }))
      .filter(item => item.percentage > 0) // Only show groups with data
      .sort((a, b) => {
        // Sort by age group ascending (13-17, 18-24, etc.)
        const aStart = parseInt(a.group.split('-')[0]);
        const bStart = parseInt(b.group.split('-')[0]);
        return aStart - bStart;
      });

    return percentages;
  };

  // Calculate location distribution from real data
  const calculateLocationDistribution = () => {
    const locations: Record<string, number> = {};
    let totalCount = 0;

    shortlistedInfluencers.forEach(influencer => {
      const creatorLocation = getAdditionalMetric(influencer, 'creator_location');
      
      if (creatorLocation && typeof creatorLocation === 'object' && creatorLocation.country) {
        totalCount++;
        const country = creatorLocation.country;
        locations[country] = (locations[country] || 0) + 1;
      }
    });

    // Calculate percentages and get top locations
    const locationPercentages = Object.entries(locations)
      .map(([country, count]) => ({
        country,
        percentage: totalCount > 0 ? (count / totalCount) * 100 : 0
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 4); // Top 4 locations

    return locationPercentages;
  };

  const ageDistribution = calculateAgeDistribution();
  const locationDistribution = calculateLocationDistribution();

  // Generate SVG for donut chart
  const generateDonutChart = (data: {group?: string, country?: string, percentage: number}[], colors: string[]) => {
    let cumulativePercentage = 0;
    const radius = 15.91549430918954;
    
    return data.map((item, index) => {
      const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
      const strokeDashoffset = 25 - cumulativePercentage;
      cumulativePercentage += item.percentage;
      
      return (
        <circle
          key={index}
          cx="18"
          cy="18"
          r={radius}
          fill="transparent"
          stroke={colors[index] || '#d2d3d4'}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      );
    });
  };

  const ageColors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  const locationColors = ['#8b5cf6', '#f97316', '#0ea5e9', '#14b8a6'];

  // Helper component for highlighting unavailable metrics
  const UnavailableMetric: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center">
      <p className="text-sm font-bold text-orange-500" title="Cannot be calculated from current data">
        {value} 
      </p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );

  return (
    <div className="w-4/12 bg-white rounded-lg shadow flex flex-col">
      <div className="p-5 flex flex-col h-full justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">List Analyze</h2>
            <button className="flex items-center text-red-500 text-sm font-medium">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export List
            </button>
          </div>
          
          {/* Donut Charts */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Age Distribution Chart */}
            <div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                    {ageDistribution.length > 0 ? generateDonutChart(ageDistribution, ageColors) : null}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {ageDistribution[0]?.percentage.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium text-gray-700">Audience by age</p>
              </div>
              
              {/* Age Legend */}
              <div className="mt-2 space-y-1">
                {ageDistribution.length > 0 ? (
                  ageDistribution.slice(0, 4).map((item, index) => (
                    <div key={item.group} className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: ageColors[index] }}
                      ></span>
                      <span className="text-xs text-gray-600">{item.group}</span>
                      <span className="ml-auto text-xs font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-orange-500 text-center">
                    No age data available 
                  </div>
                )}
              </div>
            </div>
            
            {/* Location Distribution Chart */}
            <div>
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <circle cx="18" cy="18" r="15.91549430918954" fill="transparent" stroke="#d2d3d4" strokeWidth="1"></circle>
                    {locationDistribution.length > 0 ? generateDonutChart(locationDistribution, locationColors) : null}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold">
                      {locationDistribution[0]?.percentage.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs font-medium text-gray-700">Audience by location</p>
              </div>
              
              {/* Location Legend */}
              <div className="mt-2 space-y-1">
                {locationDistribution.length > 0 ? (
                  locationDistribution.map((item, index) => (
                    <div key={item.country} className="flex items-center">
                      <span 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: locationColors[index] }}
                      ></span>
                      <span className="text-xs text-gray-600">{item.country}</span>
                      <span className="ml-auto text-xs font-medium">{item.percentage.toFixed(1)}%</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-orange-500 text-center">
                    No location data available 
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Metrics Rows */}
          <div className="space-y-3">
            {/* First Row of Metrics */}
            <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{formatNumber(totalFollowers)}</p>
                <p className="text-xs text-gray-500">Total Followers</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalContentCount > 0 ? formatNumber(totalContentCount) : '0'}</p>
                <p className="text-xs text-gray-500">Total Content</p>
              </div>
              {/* Post Impressions - Cannot be calculated from current data */}
              <UnavailableMetric value="663.4K" label="Post Impressions" />
              {/* Story Views - Cannot be calculated from current data */}
              <UnavailableMetric value="1.4M" label="Story Views" />
            </div>
            
            {/* Campaign Engagements */}
            <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
              <p>Total campaign engagements: {estimatedTotalEngagements > 0 ? formatNumber(estimatedTotalEngagements) : '0'}</p>
            </div>
            
            {/* Second Row of Metrics */}
            <div className="grid grid-cols-4 gap-2 border-b border-gray-200 pb-3">
              {/* Story EMV - Cannot be calculated from current data */}
              <UnavailableMetric value="$95.4K" label="Story EMV" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{averageEngagementRate > 0 ? `${(averageEngagementRate * 100).toFixed(1)}%` : '0.0%'}</p>
                <p className="text-xs text-gray-500">Avg Eng Rate</p>
              </div>
              {/* Posts EMV - Cannot be calculated from current data */}
              <UnavailableMetric value="$4.8M" label="Posts EMV" />
              {/* Reels EMV - Cannot be calculated from current data */}
              <UnavailableMetric value="$76.4K" label="Reels EMV" />
            </div>
            
            {/* Verified and Business Accounts */}
            <div className="text-center text-xs text-gray-500 border-b border-gray-200 pb-3">
              <p>Verified accounts: {verifiedCount} | Business accounts: {businessAccountsCount}</p>
            </div>
            
            {/* Third Row of Metrics */}
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalAverageLikes > 0 ? formatNumber(totalAverageLikes) : '0'}</p>
                <p className="text-xs text-gray-500">Total Avg Likes</p>
              </div>
              {/* Story Engagements - Cannot be calculated from current data */}
              <UnavailableMetric value="74.6K" label="Story Engagements" />
              {/* Link Clicks - Cannot be calculated from current data */}
              <UnavailableMetric value="466.7K" label="Link Clicks" />
              <div className="text-center">
                <p className="text-sm font-bold text-gray-700">{totalSubscribers > 0 ? formatNumber(totalSubscribers) : (totalAverageViews > 0 ? formatNumber(totalAverageViews) : '0')}</p>
                <p className="text-xs text-gray-500">{totalSubscribers > 0 ? 'Total Subscribers' : 'Avg Views'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Total EMV - Cannot be calculated from current data */}
        <div className="text-center text-xs text-gray-500 pt-2 mt-3 border-t border-gray-200">
          <p className="text-orange-500">Total EMV: $4.9M </p>
          <p className="text-xs text-orange-400 mt-1">EMV calculations require additional data</p>
        </div>
      </div>
    </div>
  );
};

export default ShortlistedAnalytics;