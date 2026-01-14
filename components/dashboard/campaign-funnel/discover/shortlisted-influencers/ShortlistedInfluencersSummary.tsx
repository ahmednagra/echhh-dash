// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedInfluencersSummary.tsx
'use client';

import React, { useMemo } from 'react';
import { formatNumber } from '@/utils/format';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

interface ShortlistedInfluencersSummaryProps {
  selectedInfluencers: string[];
  influencers: CampaignListMember[];
  onClearSelection: () => void;
}

const ShortlistedInfluencersSummary: React.FC<
  ShortlistedInfluencersSummaryProps
> = ({ selectedInfluencers, influencers, onClearSelection }) => {
  // Determine if we're showing all influencers or just selected ones
  const isShowingAll = selectedInfluencers.length === 0;
  const summary = useMemo(() => {
    // First filter out deleted influencers
    const activeInfluencers = influencers.filter(
      (inf) => !(inf as any).deleted_at,
    );

    // If no influencers selected, use ALL active influencers; otherwise filter by selected
    const selectedData = isShowingAll
      ? activeInfluencers
      : activeInfluencers.filter((inf) =>
          selectedInfluencers.includes(inf.id || ''),
        );

    if (selectedData.length === 0) return null;

    const totals = selectedData.reduce(
      (acc, influencer, index) => {
        const additionalMetrics = influencer.social_account
          ?.additional_metrics as any;

        // Total Followers/Subscribers
        const platformName =
          (influencer.social_account as any)?.platform?.name?.toLowerCase() ||
          (additionalMetrics?.work_platform?.name || '').toLowerCase();

        // For YouTube, prioritize subscriber_count
        if (platformName === 'youtube') {
          acc.followers +=
            influencer.social_account?.subscribers_count ||
            additionalMetrics?.subscriber_count ||
            influencer.social_account?.followers_count ||
            0;
        } else {
          acc.followers += influencer.social_account?.followers_count || 0;
        }

        // Total Avg Likes - Only add if it's a valid number
        const avgLikesValue = additionalMetrics?.average_likes;
        if (
          typeof avgLikesValue === 'number' &&
          !isNaN(avgLikesValue) &&
          avgLikesValue > 0
        ) {
          acc.avgLikes += avgLikesValue;
        }

        // Total Average Views - Only add if it's a valid number
        let avgViews = 0;
        const reelViews1 = additionalMetrics?.instagram_options?.reel_views;
        const reelViews2 =
          additionalMetrics?.filter_match?.instagram_options?.reel_views;
        const avgViewsValue = additionalMetrics?.average_views;

        if (
          typeof reelViews1 === 'number' &&
          !isNaN(reelViews1) &&
          reelViews1 > 0
        ) {
          avgViews = reelViews1;
        } else if (
          typeof reelViews2 === 'number' &&
          !isNaN(reelViews2) &&
          reelViews2 > 0
        ) {
          avgViews = reelViews2;
        } else if (
          typeof avgViewsValue === 'number' &&
          !isNaN(avgViewsValue) &&
          avgViewsValue > 0
        ) {
          avgViews = avgViewsValue;
        }
        acc.avgViews += avgViews;

        // Engagement Rate
        const engagementRate = additionalMetrics?.engagementRate || 0;
        acc.engagementRateSum += engagementRate * 100;

        // Budget: Only add total_price when price_approved is true
        const priceApproved = Boolean((influencer as any).price_approved);
        if (priceApproved) {
          const totalPrice = Number(influencer.total_price) || 0;
          acc.budget += totalPrice;

          // Track currency (use first approved influencer's currency)
          if (influencer.currency) {
            acc.currency = influencer.currency;
          }

          // CPV: Calculate only when price is approved and avgViews > 0
          if (avgViews > 0 && totalPrice > 0) {
            acc.cpvSum += totalPrice / avgViews;
            acc.cpvCount += 1;
          }
        }

        // Audience Gender - aggregate percentages
        const audienceGender =
          additionalMetrics?.filter_match?.audience_gender ||
          additionalMetrics?.audience_demographics?.gender_distribution ||
          [];

        let malePercent = 0;
        let femalePercent = 0;

        audienceGender.forEach(
          (g: { type: string; percentage_value: number }) => {
            if (g.type === 'MALE') {
              malePercent = g.percentage_value;
            } else if (g.type === 'FEMALE') {
              femalePercent = g.percentage_value;
            }
          },
        );

        // If only MALE exists, calculate FEMALE as remainder
        if (malePercent > 0 && femalePercent === 0) {
          femalePercent = 100 - malePercent;
        }
        // If only FEMALE exists, calculate MALE as remainder
        if (femalePercent > 0 && malePercent === 0) {
          malePercent = 100 - femalePercent;
        }

        if (audienceGender.length > 0) {
          acc.genderData.MALE += malePercent;
          acc.genderData.FEMALE += femalePercent;
          acc.genderData.count += 1;
        }

        // Audience Location - aggregate top locations
        const audienceLocations =
          additionalMetrics?.audience_locations ||
          additionalMetrics?.filter_match?.audience_locations ||
          additionalMetrics?.audience_demographics?.location_distribution ||
          [];

        audienceLocations.forEach(
          (loc: { name: string; percentage_value: number }) => {
            if (!acc.locationData[loc.name]) {
              acc.locationData[loc.name] = { total: 0, count: 0 };
            }
            acc.locationData[loc.name].total += loc.percentage_value;
            acc.locationData[loc.name].count += 1;
          },
        );

        return acc;
      },
      {
        followers: 0,
        avgLikes: 0,
        avgViews: 0,
        engagementRateSum: 0,
        budget: 0,
        currency: 'USD',
        cpvSum: 0,
        cpvCount: 0,
        genderData: { MALE: 0, FEMALE: 0, count: 0 },
        locationData: {} as Record<string, { total: number; count: number }>,
      },
    );

    // Calculate averages
    const avgEngagementRate =
      selectedData.length > 0
        ? totals.engagementRateSum / selectedData.length
        : 0;

    // Calculate average CPV
    const avgCpv = totals.cpvCount > 0 ? totals.cpvSum / totals.cpvCount : 0;

    // Calculate average gender distribution
    const avgMale =
      totals.genderData.count > 0
        ? (totals.genderData.MALE / totals.genderData.count).toFixed(1)
        : '0';
    const avgFemale =
      totals.genderData.count > 0
        ? (totals.genderData.FEMALE / totals.genderData.count).toFixed(1)
        : '0';

    // Get top location with country code mapping
    const countryCodeMap: Record<string, string> = {
      Pakistan: 'pk',
      India: 'in',
      'United States': 'us',
      'United Kingdom': 'gb',
      Canada: 'ca',
      Australia: 'au',
      Germany: 'de',
      France: 'fr',
      Brazil: 'br',
      Indonesia: 'id',
      Turkey: 'tr',
      'Saudi Arabia': 'sa',
      'United Arab Emirates': 'ae',
      Egypt: 'eg',
      Nigeria: 'ng',
      'South Africa': 'za',
      Mexico: 'mx',
      Spain: 'es',
      Italy: 'it',
      Netherlands: 'nl',
      Japan: 'jp',
      'South Korea': 'kr',
      China: 'cn',
      Russia: 'ru',
      Bangladesh: 'bd',
      Philippines: 'ph',
      Vietnam: 'vn',
      Thailand: 'th',
      Malaysia: 'my',
      Singapore: 'sg',
    };
    const topLocation = Object.entries(totals.locationData)
      .map(([name, data]) => ({
        name,
        avg: data.total / data.count,
        countryCode: countryCodeMap[name] || 'un', // 'un' for unknown
      }))
      .sort((a, b) => b.avg - a.avg)[0];

    return {
      count: selectedData.length,
      followers: formatNumber(totals.followers),
      avgViews: formatNumber(totals.avgViews),
      avgLikes: formatNumber(totals.avgLikes),
      engagementRate: `${avgEngagementRate.toFixed(2)}%`,
      budget: totals.budget,
      currency: totals.currency,
      cpv: avgCpv.toFixed(4),
      audienceGender: { male: avgMale, female: avgFemale },
      topLocation: topLocation
        ? {
            name: topLocation.name,
            percentage: topLocation.avg.toFixed(1),
            countryCode: topLocation.countryCode,
          }
        : null,
    };
  }, [selectedInfluencers, influencers, isShowingAll]);

  if (!summary) return null;

  return (
    <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center">
          <svg
            className="w-4 h-4 mr-2 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          {isShowingAll
            ? `All Influencers Summary (${summary.count})`
            : `Selected Influencers Summary (${summary.count} selected)`}
        </h3>
        {!isShowingAll && (
          <button
            onClick={onClearSelection}
            className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Total Followers
          </p>
          <p className="text-lg font-bold text-gray-900">{summary.followers}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Total Avg Views
          </p>
          <p className="text-lg font-bold text-gray-900">{summary.avgViews}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Avg Engagement Rate
          </p>
          <p className="text-lg font-bold text-gray-900">
            {summary.engagementRate}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">
            Total Avg Likes
          </p>
          <p className="text-lg font-bold text-gray-900">{summary.avgLikes}</p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Budget</p>
          <p className="text-lg font-bold text-gray-900">
            {(() => {
              const currencySymbols: Record<string, string> = {
                USD: '$',
                EUR: '€',
                GBP: '£',
                INR: '₹',
                PKR: '₨',
                AED: 'د.إ',
                CAD: 'C$',
                AUD: 'A$',
                JPY: '¥',
                SAR: '﷼',
                KWD: 'د.ك',
                QAR: '﷼',
                BHD: '.د.ب',
                OMR: '﷼',
                CNY: '¥',
                SGD: 'S$',
              };
              const symbol = currencySymbols[summary.currency] || '$';
              return `${symbol}${summary.budget.toLocaleString()}`;
            })()}
          </p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Avg CPV</p>
          <p className="text-lg font-bold text-gray-900">{summary.cpv}</p>
        </div>
        {/* Audience Gender Card - Stacked Bar */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Audience Gender
          </p>
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden flex">
              <div
                className="h-full bg-blue-400 transition-all duration-300"
                style={{ width: `${summary.audienceGender.male}%` }}
              />
              <div
                className="h-full bg-pink-400 transition-all duration-300"
                style={{ width: `${summary.audienceGender.female}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-blue-600 font-medium">
              M: {summary.audienceGender.male}%
            </span>
            <span className="text-pink-600 font-medium">
              F: {summary.audienceGender.female}%
            </span>
          </div>
        </div>

        {/* Top Location Card - With Flag */}
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Audience Locations
          </p>
          {summary.topLocation ? (
            <>
              <div className="flex items-center space-x-2 mb-2">
                {/* Country Flag */}
                <img
                  src={`https://flagcdn.com/24x18/${summary.topLocation.countryCode?.toLowerCase() || 'pk'}.png`}
                  alt={summary.topLocation.name}
                  className="w-6 h-4 rounded-sm object-cover shadow-sm"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                {/* Progress Bar */}
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${summary.topLocation.percentage}%` }}
                  />
                </div>
              </div>
              {/* Country Name and Percentage - Bottom */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">
                  {summary.topLocation.name}
                </span>
                <span className="font-bold text-green-600">
                  {summary.topLocation.percentage}%
                </span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">N/A</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShortlistedInfluencersSummary;
