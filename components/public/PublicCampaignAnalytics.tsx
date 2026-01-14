// src/components/public/PublicCampaignAnalytics.tsx

import React, { useMemo } from 'react';
import { PublicContentPost } from '@/types/public-content-posts';

interface PublicCampaignAnalyticsProps {
  posts: PublicContentPost[];
  campaignName: string;
  onBack?: () => void;
}

const PublicCampaignAnalytics: React.FC<PublicCampaignAnalyticsProps> = ({
  posts,
  campaignName,
  onBack,
}) => {
  // Calculate aggregate metrics from all posts
  const metrics = useMemo(() => {
    if (!posts || posts.length === 0) {
      return {
        totalFollowers: 0,
        totalLikes: 0,
        totalComments: 0,
        totalViews: 0,
        totalShares: 0,
        totalImpressions: 0,
        reach: 0,
        avgEngagementRate: 0,
        avgEngagementRateViews: 0,
        totalCPV: 0,
        totalCPE: 0,
        viewsToFollowersRatio: 0,
        totalPosts: 0,
        totalCollaborationCost: 0,
      };
    }

    // Get unique followers (use max for single influencer, sum for multiple)
    const uniqueInfluencers = new Set(posts.map((p) => p.influencer?.username));
    const totalFollowers =
      uniqueInfluencers.size === 1
        ? Math.max(...posts.map((p) => p.influencer?.followers || 0))
        : posts.reduce((sum, p) => sum + (p.influencer?.followers || 0), 0);

    // Calculate totals
    const totalLikes = posts.reduce(
      (sum, p) => sum + (p.engagement?.like_count || 0),
      0,
    );
    const totalComments = posts.reduce(
      (sum, p) => sum + (p.engagement?.comment_count || 0),
      0,
    );
    const totalViews = posts.reduce(
      (sum, p) => sum + (p.engagement?.view_count || 0),
      0,
    );
    const totalShares = posts.reduce(
      (sum, p) => sum + (p.engagement?.share_count || 0),
      0,
    );

    const totalEngagements = totalLikes + totalComments + totalShares;
    const totalCollaborationCost = posts.reduce(
      (sum, p) => sum + (p.influencer?.collaboration_price || 0),
      0,
    );

    // Calculate engagement rate (follower-based, same as calculateEngagementRate)
    const avgEngagementRate =
      totalFollowers > 0
        ? ((totalLikes + totalComments + totalShares) / totalFollowers) * 100
        : 0;

    const avgEngagementRateViews =
      totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;

    const totalCPV = totalViews > 0 ? totalCollaborationCost / totalViews : 0;
    const totalCPE =
      totalEngagements > 0 ? totalCollaborationCost / totalEngagements : 0;
    const viewsToFollowersRatio =
      totalFollowers > 0 ? totalViews / totalFollowers : 0;

    // Impressions and reach (estimated if not available)
    const totalImpressions = totalViews * 1.3; // Estimated multiplier
    const reach = totalViews * 0.85; // Estimated unique reach

    return {
      totalFollowers,
      totalLikes,
      totalComments,
      totalViews,
      totalShares,
      totalImpressions: Math.round(totalImpressions),
      reach: Math.round(reach),
      avgEngagementRate,
      avgEngagementRateViews,
      totalCPV,
      totalCPE,
      viewsToFollowersRatio,
      totalPosts: posts.length,
      totalCollaborationCost,
    };
  }, [posts]);

  // Format number utility
  const formatNumber = (num: number): string => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Format currency with proper decimals (matching main page)
  const formatCurrency = (amount: number): string => {
    if (!amount || amount === 0) return '0.0000';
    // Show 4 decimal places for small amounts
    if (amount < 1) {
      return amount.toFixed(4);
    }
    return amount.toFixed(2);
  };

  // Calculate engagement distribution
  const engagementDistribution = useMemo(() => {
    const total =
      metrics.totalLikes +
      metrics.totalComments +
      metrics.totalShares +
      metrics.totalViews;
    if (total === 0) return { likes: 0, comments: 0, shares: 0, views: 0 };

    return {
      likes: (metrics.totalLikes / total) * 100,
      comments: (metrics.totalComments / total) * 100,
      shares: (metrics.totalShares / total) * 100,
      views: (metrics.totalViews / total) * 100,
    };
  }, [metrics]);

  // Get top performing posts
  const topPerformingPosts = useMemo(() => {
    return [...posts]
      .sort((a, b) => {
        const aEngagement =
          (a.engagement?.like_count || 0) +
          (a.engagement?.comment_count || 0) +
          (a.engagement?.share_count || 0);
        const bEngagement =
          (b.engagement?.like_count || 0) +
          (b.engagement?.comment_count || 0) +
          (b.engagement?.share_count || 0);
        return bEngagement - aEngagement;
      })
      .slice(0, 3);
  }, [posts]);

  // Get unique influencers with aggregated stats
  const topPerformingInfluencers = useMemo(() => {
    const influencerMap = new Map();

    posts.forEach((post) => {
      const username = post.influencer?.username;
      if (!username) return;

      if (!influencerMap.has(username)) {
        influencerMap.set(username, {
          username,
          full_name: post.influencer?.full_name,
          img_url: post.influencer?.img_url,
          followers: post.influencer?.followers || 0,
          totalLikes: 0,
          totalComments: 0,
          totalViews: 0,
          posts: 0,
          engagementRate: 0,
        });
      }

      const influencer = influencerMap.get(username);
      influencer.totalLikes += post.engagement?.like_count || 0;
      influencer.totalComments += post.engagement?.comment_count || 0;
      influencer.totalViews += post.engagement?.view_count || 0;
      influencer.posts += 1;
    });

    // Calculate engagement rates and return top performer
    return Array.from(influencerMap.values())
      .map((inf) => {
        const totalEngagement = inf.totalLikes + inf.totalComments;
        inf.engagementRate =
          inf.followers > 0
            ? (totalEngagement / inf.followers / inf.posts) * 100
            : 0;
        return inf;
      })
      .sort((a, b) => b.engagementRate - a.engagementRate)
      .slice(0, 1);
  }, [posts]);

  // Generate chart data points for Views Over Time
  const viewsChartData = useMemo(() => {
    // Sort posts by date and accumulate views
    const sortedPosts = [...posts].sort(
      (a, b) =>
        new Date(a.posted_at || 0).getTime() -
        new Date(b.posted_at || 0).getTime(),
    );

    let cumulativeViews = 0;
    return sortedPosts.map((post, index) => {
      cumulativeViews += post.engagement?.view_count || 0;
      return {
        date: post.posted_at
          ? new Date(post.posted_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
          : '',
        views: cumulativeViews,
        index,
      };
    });
  }, [posts]);

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6">
        <div className="flex items-center">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Campaign Analytics
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Campaign: {campaignName} • Date:{' '}
              {new Date().toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500 mr-4">
            Total Influencers:{' '}
            <span className="font-semibold text-gray-900">
              {new Set(posts.map((p) => p.influencer?.username)).size}
            </span>
          </span>
          <button className="flex items-center px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Sentiment Analysis
          </button>
          <button className="flex items-center px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
            Share Report
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Performance Overview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 mx-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performance Overview
          </h3>

          {/* Metrics Grid - 4x3 layout matching main page */}
          <div className="grid grid-cols-4 gap-4">
            {/* Row 1 */}
            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Followers</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalFollowers)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total Likes</span>
                <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalLikes)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total Comments</span>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 2H6c-1.1 0-2 .9-2 2v16l4-4h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalComments)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total Views</span>
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalViews)}
              </p>
            </div>

            {/* Row 2 */}
            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total Shares</span>
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalShares)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Impressions</span>
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.totalImpressions)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Reach</span>
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(metrics.reach)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  Avg Engagement Rate
                </span>
                <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.avgEngagementRate.toFixed(2)}%
              </p>
            </div>

            {/* Row 3 */}
            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total CPV</span>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">$</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalCPV)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">Total CPE</span>
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">₹</span>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(metrics.totalCPE)}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  Views to Followers Ratio
                </span>
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.viewsToFollowersRatio.toFixed(1)}x
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">
                  Avg Engagement Rate (Views)
                </span>
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {metrics.avgEngagementRateViews.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Insights Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 mx-6">
        <div className="p-6">
          <div className="flex items-center space-x-2 mb-6 no-print">
            <h2 className="text-xl font-bold text-gray-800">
              Detailed Insights
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Engagement Distribution */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium text-gray-600">
                  Engagement Distribution
                </h3>
                <div className="relative group">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      Breakdown of total engagement across likes, comments,
                      shares, and views. Shows how users interact with your
                      content across different engagement types.
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-4">
                {(() => {
                  const data = [
                    {
                      label: 'Likes',
                      value: metrics.totalLikes,
                      color: 'bg-gradient-to-r from-pink-500 to-pink-600',
                    },
                    {
                      label: 'Comments',
                      value: metrics.totalComments,
                      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
                    },
                    {
                      label: 'Shares',
                      value: metrics.totalShares,
                      color: 'bg-gradient-to-r from-green-500 to-green-600',
                    },
                    {
                      label: 'Views',
                      value: metrics.totalViews,
                      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
                    },
                  ];
                  const maxValue = Math.max(...data.map((item) => item.value));

                  return data.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span className="text-gray-900 font-semibold">
                          {formatNumber(item.value)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                          style={{
                            width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                            animationDelay: `${index * 0.2}s`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {maxValue > 0
                          ? `${((item.value / maxValue) * 100).toFixed(1)}%`
                          : '0%'}{' '}
                        of total
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <div className="text-lg font-bold text-gray-900">
                  {formatNumber(
                    metrics.totalLikes +
                      metrics.totalComments +
                      metrics.totalShares +
                      metrics.totalViews,
                  )}
                </div>
                <div className="text-xs text-gray-500">Total Interactions</div>
              </div>
            </div>

            {/* Views Over Time Chart */}
            <div className="md:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                        Views Over Time
                      </h2>
                      <div className="relative group">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200 no-print">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </button>
                        <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                          <div className="relative">
                            Cumulative view count showing campaign momentum over
                            time. Each data point represents the total
                            accumulated views up to that date.
                            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mt-1 text-sm">
                      Cumulative view progression over time
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500">Total Views</p>
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      {formatNumber(metrics.totalViews)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div style={{ height: '280px', width: '100%' }}>
                  {viewsChartData.length > 0 ? (
                    <div className="relative h-full">
                      <svg className="w-full h-full" viewBox="0 0 900 280">
                        <defs>
                          <linearGradient
                            id="viewsGradient"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#2563EB"
                              stopOpacity="0.1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#2563EB"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map((i) => (
                          <line
                            key={`grid-${i}`}
                            x1="70"
                            y1={40 + i * 42}
                            x2="830"
                            y2={40 + i * 42}
                            stroke="#F3F4F6"
                            strokeWidth="1"
                            strokeDasharray="none"
                          />
                        ))}

                        {/* Y-axis labels */}
                        {[0, 1, 2, 3, 4].map((i) => {
                          const maxViews = Math.max(
                            ...viewsChartData.map((p) => p.views),
                          );
                          const roundedMax = Math.ceil(maxViews / 1000) * 1000;
                          const value = roundedMax * (1 - i / 4);
                          return (
                            <text
                              key={`y-label-${i}`}
                              x="60"
                              y={40 + i * 42 + 5}
                              textAnchor="end"
                              className="fill-gray-500 text-xs font-medium"
                            >
                              {formatNumber(value)}
                            </text>
                          );
                        })}

                        {/* Area under curve */}
                        <path
                          d={(() => {
                            const maxViews = Math.max(
                              ...viewsChartData.map((p) => p.views),
                            );
                            if (maxViews === 0) return '';

                            const divisor = Math.max(
                              1,
                              viewsChartData.length - 1,
                            );

                            const points = viewsChartData
                              .map((item, index) => {
                                const x = 70 + (index / divisor) * 760;
                                const y = 208 - (item.views / maxViews) * 168;
                                return { x, y };
                              })
                              .filter(
                                (point) => !isNaN(point.x) && !isNaN(point.y),
                              );

                            if (points.length === 0) return '';

                            let path = `M ${points[0].x},${points[0].y}`;

                            // Create smooth curve using catmull-rom spline approximation
                            for (let i = 1; i < points.length; i++) {
                              const current = points[i];
                              const previous = points[i - 1];

                              // Control points for smooth curve
                              const cp1x =
                                previous.x + (current.x - previous.x) * 0.3;
                              const cp1y = previous.y;
                              const cp2x =
                                current.x - (current.x - previous.x) * 0.3;
                              const cp2y = current.y;

                              path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
                            }

                            // Close path for area fill
                            path += ` L ${points[points.length - 1].x},208 L ${points[0].x},208 Z`;
                            return path;
                          })()}
                          fill="url(#viewsGradient)"
                        />

                        {/* Main line */}
                        <path
                          d={(() => {
                            const maxViews = Math.max(
                              ...viewsChartData.map((p) => p.views),
                            );
                            if (maxViews === 0) return '';

                            const divisor = Math.max(
                              1,
                              viewsChartData.length - 1,
                            );

                            const points = viewsChartData
                              .map((item, index) => {
                                const x = 70 + (index / divisor) * 760;
                                const y = 208 - (item.views / maxViews) * 168;
                                return { x, y };
                              })
                              .filter(
                                (point) => !isNaN(point.x) && !isNaN(point.y),
                              );

                            if (points.length === 0) return '';

                            let path = `M ${points[0].x},${points[0].y}`;

                            // Create smooth curve
                            for (let i = 1; i < points.length; i++) {
                              const current = points[i];
                              const previous = points[i - 1];

                              // Control points for smooth curve
                              const cp1x =
                                previous.x + (current.x - previous.x) * 0.3;
                              const cp1y = previous.y;
                              const cp2x =
                                current.x - (current.x - previous.x) * 0.3;
                              const cp2y = current.y;

                              path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
                            }

                            return path;
                          })()}
                          fill="none"
                          stroke="#2563EB"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Data points */}
                        {viewsChartData.map((item, index) => {
                          const maxViews = Math.max(
                            ...viewsChartData.map((p) => p.views),
                          );
                          if (maxViews === 0) return null;

                          const divisor = Math.max(
                            1,
                            viewsChartData.length - 1,
                          );
                          const x = 70 + (index / divisor) * 760;
                          const y = 208 - (item.views / maxViews) * 168;

                          if (
                            isNaN(x) ||
                            isNaN(y) ||
                            !isFinite(x) ||
                            !isFinite(y)
                          ) {
                            return null;
                          }

                          return (
                            <g key={index}>
                              <circle
                                cx={x}
                                cy={y}
                                r="8"
                                fill="#ffffff"
                                stroke="#2563EB"
                                strokeWidth="2"
                                className="cursor-pointer"
                              />
                            </g>
                          );
                        })}

                        {/* X-axis labels */}
                        {viewsChartData.map((item, index) => {
                          const divisor = Math.max(
                            1,
                            viewsChartData.length - 1,
                          );
                          const x = 70 + (index / divisor) * 760;

                          if (isNaN(x) || !isFinite(x)) return null;
                          return (
                            <text
                              key={`x-label-${index}`}
                              x={x}
                              y="265"
                              textAnchor="middle"
                              className="fill-gray-500 text-xs font-medium"
                            >
                              {item.date}
                            </text>
                          );
                        })}
                      </svg>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z"
                          />
                        </svg>
                        <p className="text-gray-500 text-sm">
                          No view data available
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Views will appear here once data is collected
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performing Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 mx-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performing Posts
            </h3>
            <div className="flex items-center space-x-3">
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>All Posts</option>
                <option>High Engagement</option>
                <option>High Views</option>
              </select>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Sort by Engagement</option>
                <option>Sort by Views</option>
                <option>Sort by Likes</option>
                <option>Sort by Comments</option>
                <option>Sort by Date</option>
              </select>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Show 12</option>
                <option>Show 20</option>
                <option>Show 30</option>
                <option>Show 50</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {topPerformingPosts.map((post, index) => {
              const commentCount = post.engagement?.comment_count || 0;
              const shareCount = post.engagement?.share_count || 0;

              // Add the shortcode extraction function
              const extractShortcodeFromUrl = (url: string): string | null => {
                if (!url) return null;
                const instagramRegex =
                  /(?:instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+))/;
                const match = url.match(instagramRegex);
                return match ? match[1] : null;
              };

              // Handle click to open Instagram
              const handlePostClick = () => {
                let shortcode = null;

                // Try to get shortcode from post URL if available
                if (post.content_url) {
                  shortcode = extractShortcodeFromUrl(post.content_url);
                }

                // If no shortcode found, try to extract from other URL fields
                if (!shortcode && post.media_url) {
                  shortcode = extractShortcodeFromUrl(post.media_url);
                }

                // If still no shortcode, try to use platform_post_id if it looks like a shortcode
                if (
                  !shortcode &&
                  post.platform_post_id &&
                  !/^\d+$/.test(post.platform_post_id)
                ) {
                  shortcode = post.platform_post_id;
                }

                if (shortcode) {
                  window.open(
                    `https://www.instagram.com/p/${shortcode}/`,
                    '_blank',
                  );
                } else {
                  console.warn(
                    'No valid shortcode found for Instagram redirect',
                  );
                  // Optional: Fallback to opening the content URL directly if available
                  if (post.content_url) {
                    window.open(post.content_url, '_blank');
                  }
                }
              };

              return (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer"
                  onClick={handlePostClick}
                >
                  {/* Post Thumbnail */}
                  <div className="relative aspect-square overflow-hidden">
                    <img
                      src={
                        post.thumbnail_url ||
                        post.media_url ||
                        '/dummy-image.jpg'
                      }
                      alt={post.influencer?.username || 'Post thumbnail'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/dummy-image.jpg';
                      }}
                    />

                    {/* Instagram indicator */}
                    <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                      <svg
                        className="w-2 h-2 text-white"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </div>

                    {/* Rank badge */}
                    <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full font-medium text-[10px]">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Post Stats */}
                  <div className="p-2">
                    <div className="flex items-center space-x-1 mb-1.5">
                      <img
                        src={post.influencer?.img_url || '/default-avatar.png'}
                        alt={post.influencer?.username || 'Profile'}
                        className="w-4 h-4 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/default-avatar.png';
                        }}
                      />
                      <span className="text-xs font-medium text-gray-700 truncate">
                        @{post.influencer?.username || 'Unknown'}
                      </span>
                    </div>

                    {/* Stats grid */}
                    <div
                      className={`grid gap-0.5 text-[10px] ${shareCount > 0 ? 'grid-cols-2' : 'grid-cols-2'}`}
                    >
                      <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                        <div className="flex items-center justify-center space-x-0.5">
                          <svg
                            className="w-2 h-2 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {formatNumber(post.engagement?.view_count || 0)}
                          </span>
                        </div>
                      </div>
                      <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                        <div className="flex items-center justify-center space-x-0.5">
                          <svg
                            className="w-2 h-2 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium text-gray-700">
                            {formatNumber(post.engagement?.like_count || 0)}
                          </span>
                        </div>
                      </div>
                      {commentCount > 0 && (
                        <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                          <div className="flex items-center justify-center space-x-0.5">
                            <svg
                              className="w-2 h-2 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                            <span className="font-medium text-gray-700">
                              {formatNumber(commentCount)}
                            </span>
                          </div>
                        </div>
                      )}
                      {shareCount > 0 && (
                        <div className="text-center bg-gray-50 rounded px-1 py-0.5">
                          <div className="flex items-center justify-center space-x-0.5">
                            <svg
                              className="w-2 h-2 text-purple-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                              />
                            </svg>
                            <span className="font-medium text-gray-700">
                              {formatNumber(shareCount)}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Influencers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mx-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performing Influencers
            </h3>
            <div className="flex items-center space-x-3">
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>All Influencers</option>
                <option>Verified Only</option>
                <option>Top Performers</option>
              </select>
              <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>Sort by Engagement</option>
                <option>Sort by Views</option>
                <option>Sort by Followers</option>
                <option>Sort by Posts</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {topPerformingInfluencers.map((influencer, index) => {
              // Calculate engagement exactly like AnalyticsView.tsx
              const totalEngagement =
                influencer.totalLikes +
                influencer.totalComments +
                (influencer.totalShares > 0 ? influencer.totalShares : 0);

              // Calculate engagement rate exactly like AnalyticsView.tsx
              const engagementRate =
                influencer.followers > 0
                  ? (totalEngagement / influencer.followers) * 100
                  : 0;

              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  {/* Rank Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      #{index + 1}
                    </div>
                  </div>

                  {/* Profile Image */}
                  <div className="relative mb-4">
                    <div className="w-20 h-20 mx-auto relative">
                      <img
                        src={influencer.img_url || '/default-avatar.png'}
                        alt={influencer.username}
                        className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/default-avatar.png';
                        }}
                      />
                      {/* Instagram gradient ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-1">
                        <div className="w-full h-full rounded-full bg-white"></div>
                      </div>
                      <img
                        src={influencer.img_url || '/default-avatar.png'}
                        alt={influencer.username}
                        className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/default-avatar.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Influencer Info */}
                  <div className="text-center mb-4">
                    <h4 className="font-bold text-gray-900 mb-1 text-sm">
                      {influencer.full_name || influencer.username}
                    </h4>
                    <p className="text-xs text-gray-500">
                      @{influencer.username}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="space-y-3">
                    {/* Main metric - Followers */}
                    <div className="bg-white rounded-lg p-3 border border-gray-100">
                      <div className="text-center">
                        <div className="text-xl font-bold text-gray-900">
                          {formatNumber(influencer.followers)}
                        </div>
                        <div className="text-xs text-gray-500">Followers</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Engagement - using exact same calculation as AnalyticsView */}
                      <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatNumber(totalEngagement)}
                        </div>
                        <div className="text-xs text-gray-500">Engagement</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatNumber(influencer.totalViews)}
                        </div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {influencer.posts}
                        </div>
                        <div className="text-xs text-gray-500">Posts</div>
                      </div>
                      <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {engagementRate.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Eng Rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicCampaignAnalytics;
