// src/components/dashboard/profile-analytics/sections/OverviewSection.tsx
'use client';

import { 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle, 
  Play,
  Crown,
  BarChart3,
  HelpCircle,
  Camera,
  Video,
  Share
} from 'lucide-react';
import { ResponsiveLine } from '@nivo/line';
import { Profile } from '@/types/insightiq/profile-analytics';

interface OverviewSectionProps {
  profile: Profile;
  formatNumber: (num: number) => string;
  getEngagementLevel: (rate: number) => { level: string; color: string; bg: string };
  getInfluencerTier: (followers: number) => string;
}

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-48 sm:w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {content}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

// Content Type Performance Cards Component
const ContentTypePerformanceCards = ({ topContents, formatNumber }: { topContents: any[], formatNumber: (num: number) => string }) => {
  // Helper function to get content type icon and styling
  const getContentTypeConfig = (type: string) => {
    switch (type) {
      case 'REELS':
        return {
          icon: Play,
          gradient: 'from-purple-500 to-pink-500',
          bgGradient: 'from-purple-50 to-pink-50',
          borderColor: 'border-purple-200',
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600'
        };
      case 'VIDEO':
        return {
          icon: Video,
          gradient: 'from-blue-500 to-cyan-500',
          bgGradient: 'from-blue-50 to-cyan-50',
          borderColor: 'border-blue-200',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600'
        };
      case 'IMAGE':
        return {
          icon: Camera,
          gradient: 'from-green-500 to-emerald-500',
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      default:
        return {
          icon: Camera,
          gradient: 'from-gray-500 to-gray-600',
          bgGradient: 'from-gray-50 to-gray-100',
          borderColor: 'border-gray-200',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  // Calculate metrics for each content type
  const calculateTypeMetrics = (type: string) => {
    const typeContents = topContents.filter(content => 
      content.type?.toUpperCase() === type
    );
    
    if (typeContents.length === 0) {
      return {
        count: 0,
        avgLikes: 0,
        avgComments: 0,
        avgShares: 0,
        totalEngagement: 0
      };
    }

    const avgLikes = typeContents.reduce((sum, content) => 
      sum + (content.engagement?.like_count || 0), 0) / typeContents.length;
    
    const avgComments = typeContents.reduce((sum, content) => 
      sum + (content.engagement?.comment_count || 0), 0) / typeContents.length;
    
    const avgShares = typeContents.reduce((sum, content) => 
      sum + (content.engagement?.share_count || 0), 0) / typeContents.length;
    
    const totalEngagement = avgLikes + avgComments + avgShares;

    return {
      count: typeContents.length,
      avgLikes: Math.round(avgLikes),
      avgComments: Math.round(avgComments),
      avgShares: Math.round(avgShares),
      totalEngagement: Math.round(totalEngagement)
    };
  };

  const contentTypes = ['REELS', 'VIDEO', 'IMAGE'];
  const typeMetrics = contentTypes.map(type => ({
    type,
    ...calculateTypeMetrics(type),
    config: getContentTypeConfig(type)
  }));

  // Find the best performing type for highlighting
  const bestPerformingType = typeMetrics.reduce((best, current) => 
    current.totalEngagement > best.totalEngagement ? current : best
  );

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-6">
        <h4 className="text-lg font-medium">Content Type Performance</h4>
        <Tooltip content="Comparative performance analysis across different content formats. This helps identify which content types resonate best with the audience and should be prioritized in content strategy.">
          <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
        </Tooltip>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {typeMetrics.map((typeData) => {
          const { type, count, avgLikes, avgComments, avgShares, totalEngagement, config } = typeData;
          const IconComponent = config.icon;
          const isBestPerforming = typeData === bestPerformingType && totalEngagement > 0;
          
          return (
            <div
              key={type}
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                isBestPerforming ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
              } ${config.borderColor} bg-gradient-to-br ${config.bgGradient} w-full`}
            >
              {/* Best Performing Badge */}
              {isBestPerforming && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex items-center space-x-1 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    <TrendingUp className="w-3 h-3" />
                    <span>Top</span>
                  </div>
                </div>
              )}
              
              {/* Header */}
              <div className="p-4 sm:p-6 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 sm:p-3 rounded-xl ${config.iconBg}`}>
                      <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${config.iconColor}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{type}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{count} posts analyzed</p>
                    </div>
                  </div>
                </div>

                {/* Total Engagement Score */}
                <div className="mb-4">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                      {formatNumber(totalEngagement)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-600">avg engagement</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${config.gradient} transition-all duration-500`}
                      style={{
                        width: count > 0 ? `${Math.min((totalEngagement / Math.max(...typeMetrics.map(t => t.totalEngagement))) * 100, 100)}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {/* Likes */}
                  <div className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="flex items-center justify-center mb-1">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                    </div>
                    <div className="text-sm sm:text-lg font-bold text-gray-900 truncate">{formatNumber(avgLikes)}</div>
                    <div className="text-xs text-gray-600">Likes</div>
                  </div>

                  {/* Comments */}
                  <div className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="flex items-center justify-center mb-1">
                      <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                    </div>
                    <div className="text-sm sm:text-lg font-bold text-gray-900 truncate">{formatNumber(avgComments)}</div>
                    <div className="text-xs text-gray-600">Comments</div>
                  </div>

                  {/* Shares */}
                  <div className="text-center p-2 sm:p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="flex items-center justify-center mb-1">
                      <Share className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                    </div>
                    <div className="text-sm sm:text-lg font-bold text-gray-900 truncate">{formatNumber(avgShares)}</div>
                    <div className="text-xs text-gray-600">Shares</div>
                  </div>
                </div>

                {/* Performance Indicator */}
                <div className="mt-4 text-center">
                  {count === 0 ? (
                    <span className="text-sm text-gray-500 italic">No content available</span>
                  ) : (
                    <div className="flex items-center justify-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        totalEngagement > 10000 ? 'bg-green-500' :
                        totalEngagement > 5000 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="text-xs sm:text-sm font-medium text-gray-700">
                        {totalEngagement > 10000 ? 'High Performance' :
                         totalEngagement > 5000 ? 'Good Performance' : 'Needs Improvement'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Summary */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
          <span className="text-gray-600">
            Best performing content type: <span className="font-semibold text-gray-900">{bestPerformingType.type}</span>
          </span>
          <span className="text-gray-600">
            Total analyzed: <span className="font-semibold text-gray-900">{typeMetrics.reduce((sum, t) => sum + t.count, 0)} posts</span>
          </span>
        </div>
      </div>
    </div>
  );
};
 
const OverviewSection: React.FC<OverviewSectionProps> = ({
  profile,
  formatNumber,
  getEngagementLevel,
  getInfluencerTier
}) => {
  // Safe access to profile data with fallbacks
  const topContents = profile.top_contents || [];
  const audience = profile.audience || null;
  const credibilityScore = audience?.credibility_score ?? 0;
  const significantFollowersPercentage = audience?.significant_followers_percentage ?? 0;
  const reputationHistory = profile.reputation_history || [];

  // Prepare follower growth data
  const prepareFollowerGrowthData = () => {
    const historyData = reputationHistory.slice(-6);
    
    const followersData = [{
      id: 'followers',
      color: '#2563EB',
      data: historyData.map(month => ({
        x: month.month,
        y: month.follower_count
      }))
    }];

    const latestMonth = historyData[historyData.length - 1];
    const previousMonth = historyData[historyData.length - 2];
    const followerGrowth = previousMonth ? 
      ((latestMonth.follower_count - previousMonth.follower_count) / previousMonth.follower_count * 100) : 0;

    return { followersData, followerGrowth };
  };

  const { followersData, followerGrowth } = prepareFollowerGrowthData();

  return (
    <div className="w-full max-w-full space-y-6 sm:space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* True Engagement Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 text-sm">True Engagement</p>
                <Tooltip content="True engagement rate calculated using total interactions (likes + comments) divided by follower count. This metric excludes inflated metrics and shows genuine audience interaction levels.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 truncate">
                {((profile.average_likes + profile.average_comments) / profile.follower_count * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-gray-500">of followers</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Avg. Likes Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 text-sm">Avg. Likes</p>
                <Tooltip content="The average number of likes received per post. This metric helps understand the typical reach and appreciation for content. Higher numbers indicate strong content resonance with the audience.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-pink-600 truncate">{formatNumber(profile.average_likes)}</p>
              <p className="text-xs text-gray-500">per post</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-full flex-shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
            </div>
          </div>
        </div>

        {/* Avg. Comments Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 text-sm">Avg. Comments</p>
                <Tooltip content="The average number of comments received per post. Comments represent deeper engagement and community interaction. Higher comment rates indicate strong audience involvement and conversation generation.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 truncate">{formatNumber(profile.average_comments)}</p>
              <p className="text-xs text-gray-500">per post</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full flex-shrink-0">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Reels Views Card */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <p className="text-gray-600 text-sm">Reels Views</p>
                <Tooltip content="The average number of views received per Instagram Reel. Reels typically have higher reach potential than regular posts, making this metric crucial for understanding video content performance and viral potential.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-purple-600 truncate">{formatNumber(profile.average_reels_views)}</p>
              <p className="text-xs text-gray-500">avg per reel</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full flex-shrink-0">
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
        <div className="flex items-center space-x-2 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Advanced Analytics
          </h3>
          <Tooltip content="Comprehensive performance metrics that provide deeper insights into account health, audience quality, and content effectiveness beyond basic engagement statistics.">
            <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
          </Tooltip>
        </div>
        
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg w-full">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-xl sm:text-2xl font-bold text-green-600 truncate">{profile.engagement_rate.toFixed(2)}%</div>
              <Tooltip content="The percentage of followers who actively engage with content through likes, comments, shares, and saves. Higher engagement rates indicate stronger audience connection and content quality.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600">Engagement Rate</div>
            <span className={`text-xs px-2 py-1 rounded-full ${getEngagementLevel(profile.engagement_rate).bg} ${getEngagementLevel(profile.engagement_rate).color}`}>
                {getEngagementLevel(profile.engagement_rate).level}
              </span>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg w-full">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-xl sm:text-2xl font-bold text-blue-600 truncate">
                {(profile.average_reels_views / profile.follower_count).toFixed(1)}x
              </div>
              <Tooltip content="The multiplier showing how many times content reaches beyond the follower base. Values above 1.0x indicate content is reaching non-followers, suggesting good algorithmic distribution and viral potential.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600">Reach Multiplier</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg w-full">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-xl sm:text-2xl font-bold text-green-600 truncate">
                {(credibilityScore * 100).toFixed(0)}%
              </div>
              <Tooltip content="A composite score measuring the authenticity and quality of the follower base. Higher scores indicate more real, active followers and fewer bots or inactive accounts, making the audience more valuable for brands.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600">Audience Quality</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg w-full">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="text-xl sm:text-2xl font-bold text-orange-600 truncate">
                {significantFollowersPercentage ? 
                  significantFollowersPercentage.toFixed(1) : '0'}%
              </div>
              <Tooltip content="Percentage of followers who are themselves influencers or have significant followings. Higher percentages indicate network effects and potential for increased reach through influential connections.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <div className="text-sm text-gray-600">Influential Followers</div>
          </div>
        </div>

        {/* Content Performance Breakdown */}
        <ContentTypePerformanceCards topContents={topContents} formatNumber={formatNumber} />
      </div>

      {/* Follower Growth Trajectory and Engagement Rate Benchmark */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Follower Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
          <div className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Follower Growth Trajectory</h2>
                  <Tooltip content="Historical follower count progression showing growth patterns over the past 6 months. Consistent upward trends indicate healthy account growth and effective content strategy.">
                    <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
                  </Tooltip>
                </div>
                <p className="text-gray-600 mt-1 text-sm">Monthly progression over past 6 months</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500">Growth Rate</p>
                <p className="text-lg sm:text-xl font-bold text-blue-600">{followerGrowth > 0 ? '+' : ''}{followerGrowth.toFixed(2)}%</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveLine
                data={followersData}
                margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                xScale={{ type: 'point' }}
                yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: 0,
                  format: value => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: 0,
                  format: value => formatNumber(value)
                }}
                colors={['#2563EB']}
                pointSize={8}
                pointColor="#ffffff"
                pointBorderWidth={2}
                pointBorderColor="#2563EB"
                lineWidth={3}
                useMesh={true}
                curve="catmullRom"
                enableGridX={false}
                enableGridY={true}
                gridYValues={4}
                animate={true}
                motionConfig="gentle"
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 12,
                        fontWeight: 500,
                        fill: '#6B7280'
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: '#F3F4F6',
                      strokeWidth: 1
                    }
                  }
                }}
                tooltip={({ point }) => (
                  <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-200">
                    <div className="text-sm font-medium text-gray-600">{point.data.x}</div>
                    <div className="text-lg font-bold text-blue-600">{formatNumber(point.data.y)} followers</div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* Engagement Rate Benchmark */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full">
          <div className="border-b border-gray-100 p-4 sm:p-6">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Engagement Rate Benchmark</h2>
              <Tooltip content="Comparison of engagement rate against industry standards. This helps understand performance relative to other creators and identifies areas for improvement or competitive advantages.">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-gray-600 mt-1 text-sm">Your performance vs. industry standards</p>
          </div>
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600">Your Engagement Rate</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-600">{profile.engagement_rate.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full relative"
                  style={{ width: `${Math.min((profile.engagement_rate / 6) * 100, 100)}%` }}
                >
                  <div className="absolute -top-5 text-xs font-semibold text-purple-600">
                    {profile.engagement_rate.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>3%</span>
                <span>6%+</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="font-semibold text-red-800 text-sm">Poor (0-1%)</p>
                  <p className="text-xs text-red-600">Needs improvement</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-600">0-1%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <div>
                  <p className="font-semibold text-yellow-800 text-sm">Good (1-3%)</p>
                  <p className="text-xs text-yellow-600">You are here!</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-600">1-3%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-semibold text-green-800 text-sm">Excellent (3%+)</p>
                  <p className="text-xs text-green-600">Top performers</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">3%+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Info & Top Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Users className="w-5 h-5 mr-2 text-purple-600" />
              Account Details
            </h3>
            <Tooltip content="Essential account information including verification status, account type, and content statistics. These factors influence credibility, reach potential, and brand partnership opportunities.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Account Type</span>
              <span className="font-medium text-sm truncate ml-2">{profile.platform_account_type}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Gender</span>
              <span className="font-medium text-sm truncate ml-2">{profile.gender || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Age Group</span>
              <span className="font-medium text-sm truncate ml-2">{profile.age_group || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Content Count</span>
              <span className="font-medium text-sm truncate ml-2">{profile.content_count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm">Verified</span>
              <span className={`font-medium text-sm ${profile.is_verified ? 'text-green-600' : 'text-gray-400'}`}>
                {profile.is_verified ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-sm">Hidden Likes</span>
                <Tooltip content="Percentage of posts with hidden like counts. Higher percentages may indicate focus on content quality over vanity metrics, but can also limit engagement transparency for brand partnerships.">
                  <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
                </Tooltip>
              </div>
              <span className="font-medium text-sm">{(profile.posts_hidden_likes_percentage_value * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Crown className="w-5 h-5 mr-2 text-yellow-600" />
              Top Interests
            </h3>
            <Tooltip content="Primary interest categories that define the audience and content focus. These interests help brands identify alignment opportunities and understand the creator's niche and expertise areas.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="space-y-3">
            {profile.top_interests && profile.top_interests.length > 0 ? (
              profile.top_interests.slice(0, 8).map((interest, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm truncate">{interest.name}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No interests data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Brand Affinity */}
      {profile.brand_affinity && profile.brand_affinity.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border border-gray-100 w-full">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Crown className="w-5 h-5 mr-2 text-indigo-600" />
              Brand Affinity
            </h3>
            <Tooltip content="Brands that the audience shows strong affinity towards based on engagement patterns and interests. This data helps identify potential brand partnership opportunities and audience purchasing preferences.">
              <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {profile.brand_affinity.map((brand, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-lg hover:shadow-md transition-shadow w-full">
                <div className="font-medium text-sm text-gray-800 truncate">{brand.name}</div>
                <div className="text-xs text-gray-500 mt-1">Brand Affinity</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewSection;