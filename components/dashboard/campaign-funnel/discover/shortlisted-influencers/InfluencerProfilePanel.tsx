// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/InfluencerProfilePanel.tsx

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, MapPin, User, ExternalLink, Tag, Briefcase } from 'react-feather';
import { BsGenderMale, BsGenderFemale } from 'react-icons/bs';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { formatNumber } from '@/utils/format';

interface InfluencerProfilePanelProps {
  member: CampaignListMember | null;
  isOpen: boolean;
  onClose: () => void;
  getAdditionalMetric: (
    member: CampaignListMember,
    key: string,
    defaultValue?: any,
  ) => any;
  formatLocation: (member: CampaignListMember) => string;
  formatEngagementRate: (member: CampaignListMember) => string;
  getPlatformIcon: (member: CampaignListMember) => React.ReactNode;
}

// Chart colors
const AGE_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
];
const GENDER_COLORS = ['#3b82f6', '#ec4899', '#9ca3af'];
const LOCATION_COLORS = ['#8b5cf6', '#f97316', '#0ea5e9', '#14b8a6', '#f43f5e'];

const InfluencerProfilePanel: React.FC<InfluencerProfilePanelProps> = ({
  member,
  isOpen,
  onClose,
  getAdditionalMetric,
  formatLocation,
  formatEngagementRate,
  getPlatformIcon,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => onClose(), 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Parse audience demographics data
  const audienceData = useMemo(() => {
    if (!member) return null;

    const audienceDemographics = getAdditionalMetric(
      member,
      'audience_demographics',
    );
    const filterMatch = getAdditionalMetric(member, 'filter_match');

    // Age Distribution
    let ageDistribution: { group: string; percentage: number }[] = [];

    if (audienceDemographics?.age_distribution) {
      const ageDist = audienceDemographics.age_distribution;
      if (Array.isArray(ageDist)) {
        ageDistribution = ageDist
          .map((item: any) => ({
            group:
              item.age_range ||
              item.range ||
              `${item.min || ''}-${item.max || ''}`,
            percentage:
              item.percentage_value || item.percentage || item.weight || 0,
          }))
          .filter((item: any) => item.percentage > 0);
      } else if (typeof ageDist === 'object' && ageDist.min !== undefined) {
        ageDistribution = [
          {
            group: `${ageDist.min}-${ageDist.max}`,
            percentage: ageDist.percentage_value || 100,
          },
        ];
      }
    }

    if (ageDistribution.length === 0 && filterMatch?.audience_age) {
      const audienceAge = filterMatch.audience_age;
      if (Array.isArray(audienceAge)) {
        ageDistribution = audienceAge
          .map((item: any) => ({
            group: item.age_range || `${item.min || ''}-${item.max || ''}`,
            percentage: item.percentage_value || item.percentage || 0,
          }))
          .filter((item: any) => item.percentage > 0);
      }
    }

    // Gender Distribution
    let genderDistribution: { type: string; percentage: number }[] = [];

    if (audienceDemographics?.gender_distribution) {
      genderDistribution = audienceDemographics.gender_distribution.map(
        (item: any) => ({
          type: item.type || 'Unknown',
          percentage: item.percentage_value || item.percentage || 0,
        }),
      );
    } else if (filterMatch?.audience_gender) {
      genderDistribution = filterMatch.audience_gender.map((item: any) => ({
        type: item.type || 'Unknown',
        percentage: item.percentage_value || item.percentage || 0,
      }));
    }

    // Location Distribution
    let locationDistribution: { name: string; percentage: number }[] = [];

    let audienceLocations = getAdditionalMetric(member, 'audience_locations');
    if (!audienceLocations && audienceDemographics?.location_distribution) {
      audienceLocations = audienceDemographics.location_distribution;
    }
    if (!audienceLocations && filterMatch?.audience_locations) {
      audienceLocations = filterMatch.audience_locations;
    }

    if (Array.isArray(audienceLocations)) {
      locationDistribution = audienceLocations
        .map((item: any) => ({
          name: item.name || item.country || 'Unknown',
          percentage:
            item.percentage_value || item.percentage || item.weight || 0,
        }))
        .filter((item: any) => item.percentage > 0)
        .slice(0, 5);
    }

    return {
      ageDistribution,
      genderDistribution,
      locationDistribution,
    };
  }, [member, getAdditionalMetric]);

  // Get tags - using type assertion since TypeScript doesn't recognize the property
  const tags = useMemo(() => {
    if (!member) return [];
    // Use type assertion to access tags property
    return (member as any).tags || [];
  }, [member]);

  // Get past campaigns - using type assertion
  const pastCampaigns = useMemo(() => {
    if (!member) return [];
    return (
      getAdditionalMetric(member, 'past_campaigns') ||
      (member as any).past_campaigns ||
      []
    );
  }, [member, getAdditionalMetric]);

  // Get shortlisted status - using type assertion
  const shortlistedStatus = useMemo(() => {
    if (!member) return null;
    return (member as any).shortlisted_status || null;
  }, [member]);

  // Generate SVG for donut chart
  const generateDonutChart = (
    data: { percentage: number }[],
    colors: string[],
  ) => {
    if (!data || data.length === 0) return null;

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
          stroke={colors[index % colors.length]}
          strokeWidth="3"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
        />
      );
    });
  };

  if (!member) return null;

  // Get all profile data
  const fullName =
    member.social_account?.full_name ||
    getAdditionalMetric(member, 'name') ||
    'Unknown';
  const username = member.social_account?.account_handle || '';
  const profilePic =
    member.social_account?.profile_pic_url || '/default-avatar.png';
  const isVerified = member.social_account?.is_verified || false;
  const bio =
    getAdditionalMetric(member, 'introduction') ||
    getAdditionalMetric(member, 'biography') ||
    '';
  const location = formatLocation(member);
  const gender =
    getAdditionalMetric(member, 'gender') ||
    getAdditionalMetric(member, 'creator_gender') ||
    '';
  const followersCount = member.social_account?.followers_count || 0;
  const engagementRate = formatEngagementRate(member);
  const avgViews =
    getAdditionalMetric(member, 'average_views') ||
    getAdditionalMetric(member, 'average_reel_views') ||
    0;
  const avgLikes = getAdditionalMetric(member, 'average_likes') || 0;
  const contentCount =
    member.social_account?.media_count ||
    getAdditionalMetric(member, 'content_count') ||
    0;
  const platformUrl = member.social_account?.account_url || '';
  const ageGroup = getAdditionalMetric(member, 'age_group') || '';
  const language = getAdditionalMetric(member, 'language') || '';
  const accountType =
    getAdditionalMetric(member, 'platform_account_type') || '';
  const addedAt =
    member.created_at || getAdditionalMetric(member, 'added_at') || '';
  const addedThrough =
    getAdditionalMetric(member, 'added_through') ||
    (member as any).added_through ||
    '';

  // Format gender display
  const formatGender = (g: string) => {
    if (!g) return '';
    const lower = g.toLowerCase();
    if (lower === 'male' || lower === 'm') return 'Male';
    if (lower === 'female' || lower === 'f') return 'Female';
    return g.charAt(0).toUpperCase() + g.slice(1);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      {/* TRANSPARENT Backdrop - NO BLACK OVERLAY (Fix #6) */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={handleBackdropClick} />
      )}

      {/* Panel */}
      {/* Panel - slides in from right with shadow and border */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-200 ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header - Light Professional Design */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center justify-between p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Creator Profile
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Profile Header */}
          <div className="px-4 pb-4">
            <div className="flex items-center gap-4">
              <img
                src={profilePic}
                alt={fullName}
                className="w-20 h-20 rounded-full border-2 border-purple-100 shadow-md object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 truncate">
                    {fullName}
                  </h3>
                  {isVerified && (
                    <svg
                      className="w-5 h-5 text-blue-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-500 text-sm">@{username}</p>
                {platformUrl && (
                  <a
                    href={platformUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View Profile
                  </a>
                )}
              </div>
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white border-2 border-purple-200 flex items-center justify-center text-purple-600 shadow-sm">
                {getPlatformIcon(member)}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-180px)] p-4 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-600">
                {formatNumber(followersCount)}
              </p>
              <p className="text-xs text-gray-500">Followers</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-pink-600">
                {engagementRate}
              </p>
              <p className="text-xs text-gray-500">Eng. Rate</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-600">
                {formatNumber(avgViews)}
              </p>
              <p className="text-xs text-gray-500">Avg Views</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-green-600">
                {formatNumber(avgLikes)}
              </p>
              <p className="text-xs text-gray-500">Avg Likes</p>
            </div>
          </div>

          {/* Bio */}
          {bio && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Bio</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{bio}</p>
            </div>
          )}

          {/* Profile Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Profile Details
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {location && location !== 'N/A' && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{location}</span>
                </div>
              )}
              {gender && (
                <div className="flex items-center gap-2 text-sm">
                  {gender.toLowerCase().includes('male') ? (
                    <BsGenderMale className="w-4 h-4 text-blue-500" />
                  ) : (
                    <BsGenderFemale className="w-4 h-4 text-pink-500" />
                  )}
                  <span className="text-gray-600">{formatGender(gender)}</span>
                </div>
              )}
              {ageGroup && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Age: {ageGroup}</span>
                </div>
              )}
              {language && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-gray-400 text-center">🌐</span>
                  <span className="text-gray-600">{language}</span>
                </div>
              )}
              {contentCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 text-gray-400 text-center">📷</span>
                  <span className="text-gray-600">
                    {formatNumber(contentCount)} posts
                  </span>
                </div>
              )}
              {accountType && (
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600 capitalize">
                    {accountType.toLowerCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Audience Demographics */}
          {audienceData &&
            (audienceData.ageDistribution.length > 0 ||
              audienceData.genderDistribution.length > 0 ||
              audienceData.locationDistribution.length > 0) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-4">
                  Audience Demographics
                </h4>

                <div className="grid grid-cols-3 gap-4">
                  {/* Age Distribution */}
                  <div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          {audienceData.ageDistribution.length > 0 &&
                            generateDonutChart(
                              audienceData.ageDistribution,
                              AGE_COLORS,
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {audienceData.ageDistribution[0]?.percentage.toFixed(
                              0,
                            ) || '0'}
                            %
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-600">
                        Age
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {audienceData.ageDistribution
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={item.group}
                            className="flex items-center text-xs"
                          >
                            <span
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{ backgroundColor: AGE_COLORS[index] }}
                            />
                            <span className="text-gray-600 truncate flex-1">
                              {item.group}
                            </span>
                            <span className="font-medium ml-1">
                              {item.percentage.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Gender Distribution */}
                  <div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          {audienceData.genderDistribution.length > 0 &&
                            generateDonutChart(
                              audienceData.genderDistribution,
                              GENDER_COLORS,
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {audienceData.genderDistribution[0]?.percentage.toFixed(
                              0,
                            ) || '0'}
                            %
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-600">
                        Gender
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {audienceData.genderDistribution.map((item, index) => (
                        <div
                          key={item.type}
                          className="flex items-center text-xs"
                        >
                          <span
                            className="w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: GENDER_COLORS[index] }}
                          />
                          <span className="text-gray-600 truncate flex-1 capitalize">
                            {item.type.toLowerCase()}
                          </span>
                          <span className="font-medium ml-1">
                            {item.percentage.toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Distribution */}
                  <div>
                    <div className="flex flex-col items-center">
                      <div className="relative w-20 h-20">
                        <svg viewBox="0 0 36 36" className="w-full h-full">
                          <circle
                            cx="18"
                            cy="18"
                            r="15.91549430918954"
                            fill="transparent"
                            stroke="#e5e7eb"
                            strokeWidth="1"
                          />
                          {audienceData.locationDistribution.length > 0 &&
                            generateDonutChart(
                              audienceData.locationDistribution,
                              LOCATION_COLORS,
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-bold">
                            {audienceData.locationDistribution[0]?.percentage.toFixed(
                              0,
                            ) || '0'}
                            %
                          </span>
                        </div>
                      </div>
                      <p className="mt-1 text-xs font-medium text-gray-600">
                        Location
                      </p>
                    </div>
                    <div className="mt-2 space-y-1">
                      {audienceData.locationDistribution
                        .slice(0, 3)
                        .map((item, index) => (
                          <div
                            key={item.name}
                            className="flex items-center text-xs"
                          >
                            <span
                              className="w-2 h-2 rounded-full mr-1.5"
                              style={{
                                backgroundColor: LOCATION_COLORS[index],
                              }}
                            />
                            <span className="text-gray-600 truncate flex-1">
                              {item.name}
                            </span>
                            <span className="font-medium ml-1">
                              {item.percentage.toFixed(0)}%
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: any, index: number) => (
                  <span
                    key={index}
                    className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium"
                  >
                    {typeof tag === 'string' ? tag : tag.tag || tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Past Campaigns - Show ALL */}
          {pastCampaigns.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Past Campaigns ({pastCampaigns.length})
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {pastCampaigns.map((campaign: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded-md border border-gray-200 gap-2"
                  >
                    {/* Campaign Name */}
                    <span className="text-sm text-gray-700 truncate flex-1 min-w-0">
                      {campaign.campaign_name ||
                        campaign.name ||
                        'Unnamed Campaign'}
                    </span>

                    {/* Price */}
                    {campaign.total_price && (
                      <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                        {campaign.currency || 'PKR'}
                        {formatNumber(campaign.total_price)}
                      </span>
                    )}

                    {/* Added Date */}
                    {(campaign.added_at ||
                      campaign.created_at ||
                      campaign.date) && (
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(
                          campaign.added_at ||
                            campaign.created_at ||
                            campaign.date,
                        )}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Meta Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Additional Info
            </h4>
            <div className="space-y-2 text-sm">
              {addedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Added on:</span>
                  <span className="text-gray-700">{formatDate(addedAt)}</span>
                </div>
              )}
              {addedThrough && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Added through:</span>
                  <span className="text-gray-700 capitalize">
                    {String(addedThrough).replace(/_/g, ' ')}
                  </span>
                </div>
              )}
              {shortlistedStatus?.name && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: shortlistedStatus.color
                        ? `${shortlistedStatus.color}20`
                        : '#e5e7eb',
                      color: shortlistedStatus.color || '#374151',
                    }}
                  >
                    {shortlistedStatus.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InfluencerProfilePanel;
