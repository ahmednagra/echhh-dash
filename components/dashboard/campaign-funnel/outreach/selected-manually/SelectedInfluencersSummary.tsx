// src/components/dashboard/campaign-funnel/outreach/selected-manually/SelectedInfluencersSummary.tsx
'use client';

import React, { useMemo } from 'react';
import { formatNumber } from '@/utils/format';

interface SelectedInfluencersSummaryProps {
  selectedInfluencers: Set<string>;
  influencers: any[];
  onClearSelection: () => void;
  averageViews?: Record<string, number | null>; // NEW: Add averageViews prop
}

const SelectedInfluencersSummary: React.FC<SelectedInfluencersSummaryProps> = ({
  selectedInfluencers,
  influencers,
  onClearSelection,
  averageViews = {}, // NEW: Default to empty object
}) => {
  // Determine if we're showing all influencers or just selected ones
  const isShowingAll = selectedInfluencers.size === 0;

  const summary = useMemo(() => {
    // If no influencers selected, use ALL influencers; otherwise filter by selected
    const selectedData = isShowingAll
      ? influencers
      : influencers.filter((inf) => selectedInfluencers.has(inf.id));

    if (selectedData.length === 0) return null;

    const totals = selectedData.reduce(
      (acc, influencer, index) => {
        acc.followers += influencer.social_account?.followers_count || 0;
        // Total Avg Likes - Only add if it's a valid number
        const avgLikesValue =
          influencer.social_account?.additional_metrics?.average_likes;
        if (
          typeof avgLikesValue === 'number' &&
          !isNaN(avgLikesValue) &&
          avgLikesValue > 0
        ) {
          acc.avgLikes += avgLikesValue;
        }

        // Total Average Views - Only add if it's a valid number
        const avgViewsFromState = averageViews[influencer.id];
        const avgViewsFromMetrics =
          influencer.social_account?.additional_metrics?.average_views;

        let influencerViews = 0;
        if (
          typeof avgViewsFromState === 'number' &&
          !isNaN(avgViewsFromState) &&
          avgViewsFromState > 0
        ) {
          influencerViews = avgViewsFromState;
        } else if (
          typeof avgViewsFromMetrics === 'number' &&
          !isNaN(avgViewsFromMetrics) &&
          avgViewsFromMetrics > 0
        ) {
          influencerViews = avgViewsFromMetrics;
        }
        acc.avgViews += influencerViews;

        // Budget logic: Use total_price if price_approved, otherwise skip
        const priceApproved = Boolean(influencer.price_approved);
        if (priceApproved) {
          const totalPrice = parseFloat(influencer.total_price) || 0;
          acc.budget += totalPrice;
        }

        // Calculate CPV: Use total_price if approved, otherwise use collaboration_price
        const cpvBudget = priceApproved
          ? parseFloat(influencer.total_price) || 0
          : Number(influencer.collaboration_price) || 0;

        if (influencerViews > 0 && cpvBudget > 0) {
          acc.cpvSum += cpvBudget / influencerViews;
          acc.cpvCount += 1;
        }

        // Calculate engagement rate with proper format handling
        const engagementRate =
          influencer.social_account?.additional_metrics?.engagementRate || 0;
        if (typeof engagementRate === 'number') {
          if (engagementRate < 1) {
            // Decimal format (0.0337) → multiply by 100
            acc.engagementRateSum += engagementRate * 100;
          } else {
            // Already percentage format (1.86) → use as-is
            acc.engagementRateSum += engagementRate;
          }
        }
        return acc;
      },
      {
        followers: 0,
        avgLikes: 0,
        avgViews: 0, // NEW: Track total average views
        budget: 0,
        cpvSum: 0, // NEW: Sum of all CPV values
        cpvCount: 0, // NEW: Count of influencers with valid CPV
        engagementRateSum: 0,
      },
    );

    // NEW: Calculate average CPV from actual formula
    const avgCpv = totals.cpvCount > 0 ? totals.cpvSum / totals.cpvCount : 0;

    const avgEngagementRate =
      selectedData.length > 0
        ? totals.engagementRateSum / selectedData.length
        : 0;

    return {
      count: selectedData.length,
      followers: formatNumber(totals.followers),
      avgViews: formatNumber(totals.avgViews), // NEW: Format average views
      avgLikes: formatNumber(totals.avgLikes),
      budget: `$${totals.budget.toFixed()}`,
      cpv: avgCpv.toFixed(4), // NEW: Remove $ sign from CPV
      engagementRate: `${avgEngagementRate.toFixed(2)}%`,
    };
  }, [selectedInfluencers, influencers, averageViews, isShowingAll]); // NEW: Add averageViews to dependency array

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
          <p className="text-lg font-bold text-gray-900">{summary.budget}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-1">Avg CPV</p>
          <p className="text-lg font-bold text-gray-900">{summary.cpv}</p>
        </div>
      </div>
    </div>
  );
};

export default SelectedInfluencersSummary;
