// src/components/dashboard/profile-analytics/sections/ContentSection.tsx
'use client';

import { useState } from 'react';
import { 
  Star,
  Calendar,
  Heart, 
  MessageCircle, 
  Share,
  Play,
  Camera,
  Hash,
  AtSign,
  DollarSign,
  ExternalLink,
  BarChart3,
  HelpCircle,
  Video,
  Image as ImageIcon,
  Eye
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { Profile } from '@/types/insightiq/profile-analytics';
import { BaseSectionProps, validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface ContentSectionProps extends BaseSectionProps {}

// Tooltip Component
const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-y-0 translate-y-1">
        <div className="relative">
          {content}
          <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};

// Overall Content Summary Cards Component
const OverallContentSummaryCards = ({ 
  topContents, 
  recentContents, 
  sponsoredContents,
  formatNumber 
}: { 
  topContents: any[], 
  recentContents: any[], 
  sponsoredContents: any[],
  formatNumber: (num: number) => string
}) => {
  // Calculate totals for each content type
  const calculateTotals = (contents: any[]) => {
    const totals = { count: 0, likes: 0, comments: 0, views: 0, shares: 0, plays: 0 };

    contents.forEach(content => {
      const engagement = content.engagement || {};
      
      totals.count++;
      totals.likes += engagement.like_count || 0;
      totals.comments += engagement.comment_count || 0;
      totals.views += engagement.view_count || 0;
      totals.shares += engagement.share_count || 0;
      totals.plays += engagement.play_count || 0;
    });

    return totals;
  };

  const topTotals = calculateTotals(topContents);
  const recentTotals = calculateTotals(recentContents);
  const sponsoredTotals = calculateTotals(sponsoredContents);

  const cardConfigs = [
    {
      type: 'top',
      label: 'Top Performing',
      description: 'Best performing content',
      icon: Star,
      data: topTotals,
      bgGradient: 'from-purple-50 via-purple-100 to-purple-200',
      hoverGradient: 'hover:from-purple-100 hover:via-purple-200 hover:to-purple-300',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconHover: 'group-hover:from-purple-600 group-hover:to-purple-700',
      iconColor: 'text-white',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200',
      shadowColor: 'shadow-purple-100'
    },
    {
      type: 'recent',
      label: 'Recent Content',
      description: 'Latest published posts',
      icon: Calendar,
      data: recentTotals,
      bgGradient: 'from-blue-50 via-blue-100 to-blue-200',
      hoverGradient: 'hover:from-blue-100 hover:via-blue-200 hover:to-blue-300',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconHover: 'group-hover:from-blue-600 group-hover:to-blue-700',
      iconColor: 'text-white',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-100'
    },
    {
      type: 'sponsored',
      label: 'Sponsored Content',
      description: 'Paid partnerships',
      icon: DollarSign,
      data: sponsoredTotals,
      bgGradient: 'from-emerald-50 via-emerald-100 to-emerald-200',
      hoverGradient: 'hover:from-emerald-100 hover:via-emerald-200 hover:to-emerald-300',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconHover: 'group-hover:from-emerald-600 group-hover:to-emerald-700',
      iconColor: 'text-white',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200',
      shadowColor: 'shadow-emerald-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cardConfigs.map((config) => {
        const Icon = config.icon;
        const data = config.data;
        
        return (
          <div 
            key={config.type} 
            className={`group relative bg-gradient-to-br ${config.bgGradient} ${config.hoverGradient} 
              rounded-2xl p-6 border ${config.borderColor} transition-all duration-300 
              hover:shadow-xl hover:shadow-${config.shadowColor} hover:scale-105 
              cursor-pointer transform-gpu`}
          >
            {/* Subtle shine effect on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform 
              -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] group-hover:duration-700"></div>
            
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{config.label}</p>
                  <p className="text-gray-500 text-xs mb-2">{config.description}</p>
                  <p className={`text-2xl font-bold ${config.textColor} group-hover:scale-110 transition-transform duration-200`}>
                    {data.count}
                  </p>
                  <p className="text-xs text-gray-500">total posts</p>
                </div>
                <div className={`${config.iconBg} ${config.iconHover} p-3 rounded-xl shadow-lg 
                  transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                  <Icon className={`w-6 h-6 ${config.iconColor}`} />
                </div>
              </div>
              
              {data.count > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {/* Likes */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 
                    group-hover:bg-white/60 transition-all duration-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <Heart className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs text-gray-600 font-medium">Total Likes</span>
                    </div>
                    <span className={`text-sm font-bold ${config.textColor}`}>{formatNumber(data.likes)}</span>
                  </div>
                  
                  {/* Comments */}
                  <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 
                    group-hover:bg-white/60 transition-all duration-200">
                    <div className="flex items-center space-x-2 mb-1">
                      <MessageCircle className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-xs text-gray-600 font-medium">Comments</span>
                    </div>
                    <span className={`text-sm font-bold ${config.textColor}`}>{formatNumber(data.comments)}</span>
                  </div>
                  
                  {/* Views/Plays */}
                  {(data.views > 0 || data.plays > 0) && (
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 
                      group-hover:bg-white/60 transition-all duration-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Eye className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs text-gray-600 font-medium">Views</span>
                      </div>
                      <span className={`text-sm font-bold ${config.textColor}`}>
                        {formatNumber(Math.max(data.views, data.plays))}
                      </span>
                    </div>
                  )}
                  
                  {/* Shares */}
                  {data.shares > 0 && (
                    <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3 
                      group-hover:bg-white/60 transition-all duration-200">
                      <div className="flex items-center space-x-2 mb-1">
                        <Share className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform duration-200" />
                        <span className="text-xs text-gray-600 font-medium">Shares</span>
                      </div>
                      <span className={`text-sm font-bold ${config.textColor}`}>{formatNumber(data.shares)}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/30 rounded-lg">
                  <p className="text-xs text-gray-500 font-medium">No content available</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ContentSection: React.FC<ContentSectionProps> = ({
  profile,
  formatNumber
}) => {
  const [activeTab, setActiveTab] = useState('top');

  // Validate props
  const validation = validateSectionProps(profile);
  if (!validation.isValid) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">{validation.error}</p>
        </div>
      </div>
    );
  }

  // Safe access to profile data with fallbacks
  const topContents = safeProfileAccess(profile, p => p.top_contents, []);
  const recentContents = safeProfileAccess(profile, p => p.recent_contents, []);
  const sponsoredContents = safeProfileAccess(profile, p => p.sponsored_contents, []);
  const topHashtags = safeProfileAccess(profile, p => p.top_hashtags, []);
  const topMentions = safeProfileAccess(profile, p => p.top_mentions, []);
  const reputationHistory = safeProfileAccess(profile, p => p.reputation_history, []);

  // Prepare likes bar data
  const prepareLikesBarData = () => {
    const historyData = reputationHistory.slice(-6);
    return historyData.map(month => ({
      month: month.month,
      likes: month.average_likes
    }));
  };

  const likesBarData = prepareLikesBarData();

  // Tab configuration
  const tabs = [
    {
      id: 'top',
      label: 'Top Performing',
      icon: Star,
      count: formatNumber(topContents.length)
    },
    {
      id: 'recent',
      label: 'Recent Content',
      icon: Calendar,
      count: formatNumber(recentContents.length)
    },
    {
      id: 'sponsored',
      label: 'Sponsored Content',
      icon: DollarSign,
      count: formatNumber(sponsoredContents.length)
    }
  ];

  // Helper function to handle content click
  const handleContentClick = (content: any) => {
    if (content.url) {
      window.open(content.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Helper function to get content type styling
  const getContentTypeStyle = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'REELS':
        return 'bg-purple-100 text-purple-700';
      case 'VIDEO':
        return 'bg-blue-100 text-blue-700';
      case 'STORY':
        return 'bg-pink-100 text-pink-700';
      case 'IGTV':
        return 'bg-indigo-100 text-indigo-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Helper function to get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'REELS':
      case 'VIDEO':
      case 'IGTV':
        return <Play className="w-4 h-4" />;
      default:
        return <Camera className="w-4 h-4" />;
    }
  };

  // Content grid component for reusability
  const ContentGrid = ({ 
    contents, 
    isSponsored = false, 
    maxItems = 12 
  }: { 
    contents: any[], 
    isSponsored?: boolean, 
    maxItems?: number 
  }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {contents.slice(0, maxItems).map((content, index) => (
        <div 
          key={index} 
          className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
          onClick={() => handleContentClick(content)}
        >
          <div className="relative">
            {content.thumbnail_url ? (
              <img
                src={content.thumbnail_url}
                alt="Content thumbnail"
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                {getContentTypeIcon(content.type)}
              </div>
            )}
            {content.url && (
              <div className="absolute top-1 right-1 bg-black/70 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="absolute top-1 left-1">
              {isSponsored ? (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium border border-green-200">
                  Sponsored
                </span>
              ) : (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeStyle(content.type)}`}>
                  {content.type || 'POST'}
                </span>
              )}
            </div>
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              {!isSponsored && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getContentTypeStyle(content.type)}`}>
                  {content.type || 'POST'}
                </span>
              )}
              <span className="text-xs text-gray-500">
                {content.published_at ? new Date(content.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </span>
            </div>
            <p className="text-xs text-gray-800 mb-2 line-clamp-2">
              {content.description || 'No description available'}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <Heart className="w-3 h-3" />
                <span>{formatNumber(content.engagement?.like_count || 0)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{formatNumber(content.engagement?.comment_count || 0)}</span>
              </span>
              {content.engagement?.share_count && (
                <span className="flex items-center space-x-1">
                  <Share className="w-3 h-3" />
                  <span>{formatNumber(content.engagement.share_count)}</span>
                </span>
              )}
              {content.engagement?.play_count && (
                <span className="flex items-center space-x-1">
                  <Play className="w-3 h-3" />
                  <span>{formatNumber(content.engagement.play_count)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800">Content Analytics</h2>
        <p className="text-gray-600 mt-2">Performance insights and content analysis</p>
      </div>

      {/* Hashtags, Mentions & Average Likes - Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Hashtags */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Top Hashtags
            </h3>
            <Tooltip content="Most frequently used hashtags in content, ranked by usage frequency. These hashtags help understand content categorization, niche focus, and discoverability strategy. Essential for content planning and SEO optimization.">
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="flex flex-wrap gap-2 max-h-80 overflow-y-auto">
            {topHashtags.slice(0, 20).map((hashtag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors cursor-default"
                title={`Used ${hashtag.value || 0}% of the time`}
              >
                #{hashtag.name}
              </span>
            ))}
          </div>
        </div>

        {/* Top Mentions */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AtSign className="w-5 h-5 mr-2" />
              Top Mentions
            </h3>
            <Tooltip content="Most frequently mentioned accounts, showing collaboration patterns, brand partnerships, and network connections. High mention frequencies indicate strong relationships and potential future collaboration opportunities.">
              <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
            </Tooltip>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {topMentions.slice(0, 15).map((mention, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <span className="text-gray-800 font-medium text-sm">@{mention.name}</span>
                <span className="text-purple-600 font-bold text-sm">{(mention.value || 0).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Average Likes per Post Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 p-4">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Average Likes
              </h3>
              <Tooltip content="Monthly trend of average likes per post over the past 6 months. This metric helps identify performance patterns, seasonal trends, and the effectiveness of content strategy changes over time.">
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <p className="text-gray-600 text-sm mt-1">Monthly performance</p>
          </div>
          <div className="p-4">
            <div style={{ height: '280px' }}>
              <ResponsiveBar
                data={likesBarData}
                keys={['likes']}
                indexBy="month"
                margin={{ top: 10, right: 15, bottom: 50, left: 50 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={['#EC4899']}
                borderRadius={6}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 0,
                  tickPadding: 12,
                  tickRotation: -45,
                  format: value => {
                    const date = new Date(value + '-01');
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  }
                }}
                axisLeft={{
                  tickSize: 0,
                  tickPadding: 8,
                  tickRotation: 0,
                  format: value => {
                    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
                    return value.toString();
                  }
                }}
                enableGridY={true}
                gridYValues={4}
                animate={true}
                motionConfig="gentle"
                theme={{
                  axis: {
                    ticks: {
                      text: {
                        fontSize: 11,
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
                tooltip={({ id, value, indexValue }) => (
                  <div className="bg-white p-3 shadow-xl rounded-lg border border-gray-200">
                    <div className="text-xs font-medium text-gray-600">{indexValue}</div>
                    <div className="text-sm font-bold text-pink-600">{formatNumber(value)} likes</div>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Content Summary Cards - New section above tabs */}
      <OverallContentSummaryCards 
        topContents={topContents}
        recentContents={recentContents}
        sponsoredContents={sponsoredContents}
        formatNumber={formatNumber}
      />

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                  {tab.count && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Top Performing Content Tab */}
        {activeTab === 'top' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Top Performing Content
              </h3>
              <Tooltip content="The highest-performing posts based on engagement metrics (likes, comments, shares). These posts represent the content that resonates most with the audience and can serve as templates for future successful content.">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <ContentGrid contents={topContents} maxItems={12} />
          </div>
        )}
        {/* Recent Content Tab */}
        {activeTab === 'recent' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Recent Content
              </h3>
              <Tooltip content="The most recently published content, providing insights into current content strategy, posting frequency, and recent performance trends. This helps assess content consistency and current audience engagement levels.">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            <ContentGrid contents={recentContents} maxItems={18} />
          </div>
        )}

        {/* Sponsored Content Tab */}
        {activeTab === 'sponsored' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center space-x-2 mb-6">
              <h3 className="text-xl font-semibold flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Sponsored Content History
              </h3>
              <Tooltip content="Historical sponsored and paid partnership content, showing monetization patterns, brand collaboration frequency, and commercial content performance. This data helps assess the creator's commercial viability and partnership history.">
                <HelpCircle className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" />
              </Tooltip>
            </div>
            {sponsoredContents.length > 0 ? (
              <ContentGrid contents={sponsoredContents} isSponsored={true} maxItems={18} />
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No sponsored content found</p>
                <p className="text-gray-400 text-sm">This profile hasn't published any sponsored content yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSection;