// src/components/dashboard/profile-analytics/InfluencerProfileReport.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3,
  Users,
  Target,
  DollarSign,
  Activity,
  MapPin, 
  Globe, 
  ExternalLink,
  Verified,
  RefreshCw,
  Mail,
  Youtube,
  Instagram,
  MessageSquare,
  LinkIcon,
  Phone,
  Building,
  Twitter,
  Facebook,
  Linkedin,
  Music,
  Video,
  Camera,
  Copy,
  Check
} from 'lucide-react';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

// Import the individual section components
import OverviewSection from './sections/OverviewSection';
import AudienceSection from './sections/AudienceSection';
import ContentSection from './sections/ContentSection';
import PricingSection from './sections/PricingSection';

import AudienceTabsSection from './sections/AudienceTabsSection';

interface InfluencerProfileReportProps {
  analyticsData?: InsightIQProfileAnalyticsResponse;
  platformAccountId?: string | null;
  platformId?: string | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}


const InfluencerProfileReport: React.FC<InfluencerProfileReportProps> = ({
  analyticsData,
  platformAccountId,
  platformId,
  onRefresh,
  isRefreshing = false
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'audience' | 'content' | 'pricing'>('overview');
  const [urlCopied, setUrlCopied] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  
  const profile = analyticsData?.profile || null;
  const pricing = analyticsData?.pricing || null;
  const price_explanations = analyticsData?.price_explanations || null;

  // Check current URL to determine button visibility
  useEffect(() => {
    const currentPath = window.location.pathname;
    const currentUrl = window.location.href;
    
    // Hide buttons if on the public report page
    if (currentPath === '/profile-analytics-report' || currentUrl.includes('/profile-analytics-report')) {
      setShowButtons(false);
    } else if (currentPath === '/profile-analytics' || currentUrl.includes('/profile-analytics')) {
      setShowButtons(true);
    }
  }, []);

  const formatNumber = (num: number) => {
    if(num === null || num === undefined) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEngagementLevel = (rate: number) => {
    if (rate >= 6) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (rate >= 3) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (rate >= 1) return { level: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const getInfluencerTier = (followers: number) => {
    if (followers >= 1000000) return 'Mega Influencer';
    if (followers >= 100000) return 'Macro Influencer';
    if (followers >= 10000) return 'Mid-tier Influencer';
    if (followers >= 1000) return 'Micro Influencer';
    return 'Nano Influencer';
  };

  // Helper function to format location
  const formatLocation = () => {
    if (!profile?.location) return 'Location not specified';
    
    const { city, state, country } = profile.location;
    const parts = [city, state, country].filter(Boolean);
    
    if (parts.length === 0) return 'Location not specified';
    return parts.join(', ');
  };

  // Helper function to get social platform icon and styling for contact details
  const getSocialPlatformIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    
    switch (lowerType) {
      case 'instagram':
        return {
          icon: Instagram,
          color: 'text-pink-600',
          bg: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
          bgLight: 'bg-pink-50'
        };
      case 'youtube':
        return {
          icon: Youtube,
          color: 'text-red-600',
          bg: 'bg-red-500',
          bgLight: 'bg-red-50'
        };
      case 'twitter':
      case 'x':
        return {
          icon: Twitter,
          color: 'text-blue-400',
          bg: 'bg-blue-400',
          bgLight: 'bg-blue-50'
        };
      case 'facebook':
        return {
          icon: Facebook,
          color: 'text-blue-600',
          bg: 'bg-blue-600',
          bgLight: 'bg-blue-50'
        };
      case 'linkedin':
        return {
          icon: Linkedin,
          color: 'text-blue-700',
          bg: 'bg-blue-700',
          bgLight: 'bg-blue-50'
        };
      case 'tiktok':
        return {
          icon: Music,
          color: 'text-black',
          bg: 'bg-black',
          bgLight: 'bg-gray-50'
        };
      case 'threads':
        return {
          icon: MessageSquare,
          color: 'text-gray-800',
          bg: 'bg-gray-800',
          bgLight: 'bg-gray-50'
        };
      case 'snapchat':
        return {
          icon: Camera,
          color: 'text-yellow-400',
          bg: 'bg-yellow-400',
          bgLight: 'bg-yellow-50'
        };
      case 'twitch':
        return {
          icon: Video,
          color: 'text-purple-600',
          bg: 'bg-purple-600',
          bgLight: 'bg-purple-50'
        };
      case 'pinterest':
        return {
          icon: Target,
          color: 'text-red-500',
          bg: 'bg-red-500',
          bgLight: 'bg-red-50'
        };
      case 'discord':
        return {
          icon: MessageSquare,
          color: 'text-indigo-500',
          bg: 'bg-indigo-500',
          bgLight: 'bg-indigo-50'
        };
      case 'reddit':
        return {
          icon: MessageSquare,
          color: 'text-orange-500',
          bg: 'bg-orange-500',
          bgLight: 'bg-orange-50'
        };
      case 'telegram':
        return {
          icon: MessageSquare,
          color: 'text-blue-500',
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-50'
        };
      case 'whatsapp':
        return {
          icon: Phone,
          color: 'text-green-500',
          bg: 'bg-green-500',
          bgLight: 'bg-green-50'
        };
      case 'email':
        return {
          icon: Mail,
          color: 'text-blue-600',
          bg: 'bg-blue-500',
          bgLight: 'bg-blue-50'
        };
      case 'phone':
        return {
          icon: Phone,
          color: 'text-green-600',
          bg: 'bg-green-500',
          bgLight: 'bg-green-50'
        };
      case 'website':
      case 'url':
        return {
          icon: LinkIcon,
          color: 'text-indigo-600',
          bg: 'bg-indigo-500',
          bgLight: 'bg-indigo-50'
        };
      default:
        return {
          icon: Building,
          color: 'text-gray-600',
          bg: 'bg-gray-500',
          bgLight: 'bg-gray-50'
        };
    }
  };

  // Copy URL to clipboard functionality
  const handleCopyUrl = async () => {
    if (!platformAccountId) {
      alert('Platform Account ID is required to copy the URL');
      return;
    }

    try {
      const url = `${window.location.origin}/profile-analytics-report?user=${platformAccountId}`;
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // alert('Failed to copy URL');
    }
  };

  if (!profile) {
    return (
      <div className="p-4">
        <div className="text-center py-8">
          <p className="text-gray-500">No profile data available</p>
        </div>
      </div>
    );
  }

  // Profile Highlights data
  const audience = profile.audience || null;
  const audienceCountries = audience?.countries ?? [];
  const credibilityScore = audience?.credibility_score ?? 0;

  return (
    <div className="p-4">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={profile.image_url}
                alt={profile.full_name}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/user/profile-placeholder.png'; // Fallback image
                }}
              />
              {profile.is_verified && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                  <Verified className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
              </div>
              <p className="text-lg opacity-90">@{profile.platform_username}</p>
              <p className="text-sm opacity-80 mt-2 max-w-md">{profile.introduction}</p>
              <div className="flex items-center mt-3 space-x-4 text-sm">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{formatLocation()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{profile.language || 'Not specified'}</span>
                </span>
                <a 
                  href={profile.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:opacity-80"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Profile</span>
                </a>
              </div>

              {/* Stats - reduced size */}
              <div className="flex items-center justify-start mt-4 space-x-4">
                {/* Followers - reduced size */}
                <div className="bg-white/20 rounded-lg px-3 py-1.5">
                  <div className="text-base font-bold">{formatNumber(profile.follower_count)}</div>
                  <div className="text-xs opacity-80">Followers</div>
                </div>
                
                {/* Influencer Tier - reduced size */}
                <div className="bg-white/20 rounded-lg px-3 py-1.5">
                  <div className="text-xs font-bold">{getInfluencerTier(profile.follower_count)}</div>
                  <div className="text-xs opacity-80">Tier</div>
                </div>
              </div>
              
              {/* Last Updated with Refresh and Copy URL - moved to separate row */}
              <div className="flex items-center space-x-3 mt-3 text-xs opacity-90">
                <span>Last updated: {new Date(profile.updated_at).toLocaleDateString()}</span>
                
                {/* Show buttons only when showButtons is true */}
                {showButtons && (
                  <>
                    {onRefresh && (
                      <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className="bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isRefreshing ? 'Refreshing data...' : 'Refresh data from source'}
                      >
                        <RefreshCw className={`w-3 h-3 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                    
                    {/* Copy URL Button */}
                    <button
                      onClick={handleCopyUrl}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-full transition-all duration-200 text-xs font-medium ${
                        urlCopied 
                          ? 'bg-green-500/20 text-green-100' 
                          : 'bg-white/20 hover:bg-white/30 text-white'
                      }`}
                      title="Copy public report URL"
                    >
                      {urlCopied ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Highlights - Removed top margin */}
          <div className="min-w-[280px] max-w-[320px] ml-6">
            <h4 className="font-semibold mb-2 text-white text-base border-b border-white/20 pb-1">Profile Highlights</h4>
            <ul className="space-y-1.5 text-xs text-white">
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="font-medium">{getInfluencerTier(profile.follower_count)}</span>
                <span className="text-white/80">with {formatNumber(profile.follower_count)} followers</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="font-medium">{getEngagementLevel(profile.engagement_rate).level} engagement</span>
                <span className="text-white/80">({profile.engagement_rate.toFixed(2)}%)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="text-white/80">Audience primarily from</span>
                <span className="font-medium">{audienceCountries.length > 0 ? audienceCountries[0].code : 'NA'}</span>
                <span className="text-white/80">({audienceCountries.length > 0 ? audienceCountries[0].value.toFixed(1) : '0'}%)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="font-medium">{(credibilityScore * 100).toFixed(1)}%</span>
                <span className="text-white/80">audience credibility</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="text-white/80">Best content:</span>
                <span className="font-medium">Reels</span>
                <span className="text-white/80">({formatNumber(profile.average_reels_views)} avg views)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-white/60 mt-0.5">•</span>
                <span className="text-white/80">Target:</span>
                <span className="font-medium">{profile.gender || 'Not specified'} {profile.age_group || 'Not specified'}</span>
              </li>
            </ul>
            
            {/* Contact Details - Positioned directly below Profile Highlights */}
            {profile.contact_details && profile.contact_details.length > 0 && (
              <div className="flex items-center mt-3 gap-2">
                {profile.contact_details.map((contact, index) => {
                  const contactPlatformInfo = getSocialPlatformIcon(contact.type);
                  const ContactIcon = contactPlatformInfo.icon;
                  
                  return (
                    <a
                      key={index}
                      href={contact.type === 'email' ? `mailto:${contact.value}` : contact.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group bg-white/20 hover:bg-white/30 rounded-lg p-2.5 transition-all duration-200"
                      title={`${contact.type}: ${contact.value}`}
                    >
                      <ContactIcon className="w-5 h-5 text-white" />
                      {contact.verified && (
                        <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                          <Verified className="w-2.5 h-2.5 text-white" />
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'audience', label: 'Audience', icon: Users },
          { id: 'content', label: 'Content', icon: Target },
          { id: 'pricing', label: 'Pricing', icon: DollarSign },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 min-w-0 ${
              activeSection === id
                ? 'bg-white text-purple-600 shadow-md'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>
 
      {/* Content */}
      <div>
        {activeSection === 'overview' && (
          <OverviewSection
            profile={profile}
            formatNumber={formatNumber}
            getEngagementLevel={getEngagementLevel}
            getInfluencerTier={getInfluencerTier}
          />
        )}
        {activeSection === 'audience' && (
          <AudienceTabsSection 
            profile={profile}
            formatNumber={formatNumber}
          />
        )}
        {activeSection === 'content' && (
          <ContentSection
            profile={profile}
            formatNumber={formatNumber}
          />
        )}
        {activeSection === 'pricing' && (
          <PricingSection
            pricing={pricing}
            price_explanations={price_explanations}
            profile={profile}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    </div>
  );
};

export default InfluencerProfileReport;