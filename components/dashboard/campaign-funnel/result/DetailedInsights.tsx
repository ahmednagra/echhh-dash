// src/components/dashboard/campaign-funnel/result/DetailedInsights.tsx
'use client';

import { useState } from 'react';
import { AnalyticsData } from './types';

interface DetailedInsightsProps {
  analyticsData: AnalyticsData;
}

const DetailedInsights: React.FC<DetailedInsightsProps> = ({
  analyticsData,
}) => {
  const [hoveredDataPoint, setHoveredDataPoint] = useState<any>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const formatNumber = (num: number): string => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center space-x-2 mb-6 no-print">
        <h2 className="text-xl font-bold text-gray-800">Detailed Insights</h2>
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
                  Breakdown of total engagement across likes, comments, shares,
                  and views. Shows how users interact with your content across
                  different engagement types.
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
                  value: analyticsData.totalLikes,
                  color: 'bg-gradient-to-r from-pink-500 to-pink-600',
                },
                {
                  label: 'Comments',
                  value: analyticsData.totalComments,
                  color: 'bg-gradient-to-r from-blue-500 to-blue-600',
                },
                {
                  label: 'Shares',
                  value: analyticsData.totalShares,
                  color: 'bg-gradient-to-r from-green-500 to-green-600',
                },
                {
                  label: 'Views',
                  value: analyticsData.totalViews,
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
                analyticsData.totalLikes +
                  analyticsData.totalComments +
                  analyticsData.totalShares +
                  analyticsData.totalViews,
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
                        time. Each data point represents the total accumulated
                        views up to that date.
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
                  {formatNumber(analyticsData.totalViews)}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6">
            <div style={{ height: '280px', width: '100%' }}>
              {analyticsData.postsByDate.length > 0 ? (
                <div
                  className="relative h-full"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  {/* Custom chart implementation to match Follower Growth Trajectory */}
                  <div className="relative h-full bg-white">
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
                          ...analyticsData.postsByDate.map(
                            (p) => p.cumulativeViews,
                          ),
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
                      {/* Area under curve */}
                      <path
                        d={(() => {
                          const maxViews = Math.max(
                            ...analyticsData.postsByDate.map(
                              (p) => p.cumulativeViews,
                            ),
                          );
                          if (maxViews === 0) return '';

                          // FIX: Prevent division by zero
                          const divisor = Math.max(
                            1,
                            analyticsData.postsByDate.length - 1,
                          );

                          const points = analyticsData.postsByDate
                            .map((item, index) => {
                              const x = 70 + (index / divisor) * 760;
                              const y =
                                208 - (item.cumulativeViews / maxViews) * 168;
                              return { x, y };
                            })
                            .filter(
                              (point) => !isNaN(point.x) && !isNaN(point.y),
                            ); // FIX: Filter out invalid points

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
                            ...analyticsData.postsByDate.map(
                              (p) => p.cumulativeViews,
                            ),
                          );
                          if (maxViews === 0) return '';

                          // FIX: Prevent division by zero
                          const divisor = Math.max(
                            1,
                            analyticsData.postsByDate.length - 1,
                          );

                          const points = analyticsData.postsByDate
                            .map((item, index) => {
                              const x = 70 + (index / divisor) * 760;
                              const y =
                                208 - (item.cumulativeViews / maxViews) * 168;
                              return { x, y };
                            })
                            .filter(
                              (point) => !isNaN(point.x) && !isNaN(point.y),
                            ); // FIX: Filter out invalid points

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
                      {/* Data points */}
                      {analyticsData.postsByDate.map((item, index) => {
                        const maxViews = Math.max(
                          ...analyticsData.postsByDate.map(
                            (p) => p.cumulativeViews,
                          ),
                        );
                        if (maxViews === 0) return null;

                        // FIX: Prevent division by zero when only 1 or 0 posts
                        const divisor = Math.max(
                          1,
                          analyticsData.postsByDate.length - 1,
                        );
                        const x = 70 + (index / divisor) * 760;
                        const y = 208 - (item.cumulativeViews / maxViews) * 168;

                        // FIX: Validate coordinates before rendering
                        if (
                          isNaN(x) ||
                          isNaN(y) ||
                          !isFinite(x) ||
                          !isFinite(y)
                        ) {
                          console.warn(
                            `Invalid coordinates for data point ${index}:`,
                            { x, y, item },
                          );
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
                              onMouseEnter={() => setHoveredDataPoint(item)}
                              onMouseLeave={() => setHoveredDataPoint(null)}
                            />
                          </g>
                        );
                      })}

                      {/* X-axis labels */}
                      {analyticsData.postsByDate.map((item, index) => {
                        // FIX: Prevent division by zero
                        const divisor = Math.max(
                          1,
                          analyticsData.postsByDate.length - 1,
                        );
                        const x = 70 + (index / divisor) * 760;

                        // FIX: Skip invalid labels
                        if (isNaN(x) || !isFinite(x)) return null;
                        return (
                          <text
                            key={`x-label-${index}`}
                            x={x}
                            y="265"
                            textAnchor="middle"
                            className="fill-gray-500 text-xs font-medium"
                          >
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </text>
                        );
                      })}
                    </svg>

                    {/* Enhanced Tooltip with full post details */}
                    {hoveredDataPoint && (
                      <div
                        className="absolute z-20 bg-white rounded-xl shadow-2xl border border-gray-200 p-4 min-w-[280px] max-w-[400px] pointer-events-none"
                        style={{
                          left: mousePosition.x + 15,
                          top: mousePosition.y - 120,
                          transform:
                            mousePosition.x > 400
                              ? 'translateX(-100%)'
                              : 'none',
                        }}
                      >
                        <div className="mb-3">
                          <div className="font-semibold text-sm text-gray-900 mb-1">
                            {new Date(hoveredDataPoint.date).toLocaleDateString(
                              'en-US',
                              {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              },
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {hoveredDataPoint.count} post
                            {hoveredDataPoint.count !== 1 ? 's' : ''} published
                          </div>
                        </div>

                        <div className="space-y-2 text-sm mb-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Daily Views:</span>
                            <span className="font-medium text-blue-600">
                              {formatNumber(hoveredDataPoint.views)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-gray-100 pt-2">
                            <span className="text-gray-600">Total Views:</span>
                            <span className="font-bold text-gray-900">
                              {formatNumber(hoveredDataPoint.cumulativeViews)}
                            </span>
                          </div>
                        </div>

                        {/* Post Details */}
                        {hoveredDataPoint.posts &&
                          hoveredDataPoint.posts.length > 0 && (
                            <div className="border-t border-gray-100 pt-3">
                              <div className="text-xs font-medium text-gray-700 mb-2">
                                Posts on this date:
                              </div>
                              <div className="space-y-2 max-h-32 overflow-y-auto">
                                {hoveredDataPoint.posts
                                  .slice(0, 3)
                                  .map((post: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 text-xs"
                                    >
                                      <img
                                        src={post.avatar}
                                        alt={post.influencerName}
                                        className="w-6 h-6 rounded-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            '/user/profile-placeholder.png';
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 truncate">
                                          {post.influencerName}
                                        </div>
                                        <div className="text-gray-500">
                                          {formatNumber(post.views)} views •{' '}
                                          {formatNumber(post.likes)} likes •{' '}
                                          {formatNumber(post.comments)} comments
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                {hoveredDataPoint.posts.length > 3 && (
                                  <div className="text-xs text-gray-500 text-center pt-1">
                                    +{hoveredDataPoint.posts.length - 3} more
                                    post
                                    {hoveredDataPoint.posts.length - 3 !== 1
                                      ? 's'
                                      : ''}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                      </div>
                    )}
                  </div>
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
  );
};

export default DetailedInsights;
