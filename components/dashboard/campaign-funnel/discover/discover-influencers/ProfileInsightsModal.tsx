// src/components/dashboard/campaign-funnel/discover/discover-influencers/ProfileInsightsModal.tsx
import React, { useState, useEffect } from 'react';
import { Influencer } from '@/types/insights-iq';
import { checkProfileAnalyticsExists } from '@/services/profile-analytics';
import { ProfileAnalyticsExistsResponse } from '@/types/profile-analytics';
import { useRouter } from 'next/navigation';
import { Platform } from '@/types/platform';

interface ProfileInsightsModalProps {
  selectedPlatform?: Platform | null;
  isOpen: boolean;
  onClose: () => void;
  influencer: Influencer | null;
  onFetchPosts?: (influencer: Influencer) => Promise<any[]>;
}

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  comments: number;
  views?: number;
  createdAt: string;
  type: 'image' | 'video' | 'carousel';
}

interface BudgetEntry {
  currency: string;
  price: number;
}

interface ImportMetadata {
  budget?: BudgetEntry[];
  other_array?: any[];
  [key: string]: any;
}

const ProfileInsightsModal: React.FC<ProfileInsightsModalProps> = ({
  selectedPlatform,
  isOpen,
  onClose,
  influencer,
  onFetchPosts,
}) => {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'budget'>(
    'overview',
  );

  // New state for analytics check
  const [analyticsData, setAnalyticsData] =
    useState<ProfileAnalyticsExistsResponse | null>(null);
  const [checkingAnalytics, setCheckingAnalytics] = useState(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  // Fetch posts when modal opens and influencer changes
  useEffect(() => {
    if (isOpen && influencer && onFetchPosts && activeTab === 'posts') {
      setLoadingPosts(true);
      onFetchPosts(influencer)
        .then((fetchedPosts) => {
          setPosts(fetchedPosts || []);
        })
        .catch((error) => {
          console.error('Failed to fetch posts:', error);
          setPosts([]);
        })
        .finally(() => {
          setLoadingPosts(false);
        });
    }
  }, [isOpen, influencer, onFetchPosts, activeTab]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setPosts([]);
      setActiveTab('overview');
      setAnalyticsData(null);
      setAnalyticsError(null);
    }
  }, [isOpen]);

  if (!isOpen || !influencer) return null;

  const formatNumber = (num: number | string | undefined) => {
    if (!num) return 'N/A';
    const numValue = typeof num === 'string' ? parseFloat(num) : num;
    if (isNaN(numValue)) return 'N/A';
    if (numValue >= 1000000) return `${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `${(numValue / 1000).toFixed(1)}K`;
    return numValue.toLocaleString();
  };

  const formatEngagementRate = (rate: number | string | undefined) => {
    if (!rate) return 'N/A';
    const numValue = typeof rate === 'string' ? parseFloat(rate) : rate;
    if (isNaN(numValue)) return 'N/A';
    // Multiply by 100 to match table display (raw value is decimal like 0.0279)
    return `${(numValue * 100).toFixed(2)}%`;
  };

  // Helper to detect platform type
  const getPlatformName = (): string => {
    return (
      selectedPlatform?.name?.toLowerCase() ||
      influencer.work_platform?.name?.toLowerCase() ||
      ''
    );
  };

  const isInstagram = (): boolean => getPlatformName().includes('instagram');
  const isYouTube = (): boolean => getPlatformName().includes('youtube');
  const isTikTok = (): boolean => getPlatformName().includes('tiktok');

  // Get follower/subscriber count based on platform
  const getFollowerCount = (): number | string | undefined => {
    if (isYouTube()) {
      return influencer.subscriber_count || undefined;
    }
    return influencer.followers;
  };

  // Get follower/subscriber label based on platform
  const getFollowerLabel = (): string => {
    if (isYouTube()) {
      return 'Subscribers';
    }
    return 'Followers';
  };

  // Get views count based on platform
  const getViewsCount = (): number | string | undefined => {
    if (isInstagram()) {
      // For Instagram, show reel_views
      const reelViews =
        influencer.instagram_options?.reel_views ||
        influencer.filter_match?.instagram_options?.reel_views;

      if (reelViews) {
        // If it's a range object with min/max, calculate average
        if (
          typeof reelViews === 'object' &&
          'min' in reelViews &&
          'max' in reelViews
        ) {
          return (reelViews.min + reelViews.max) / 2;
        }
        // If it's a direct number
        if (typeof reelViews === 'number') {
          return reelViews;
        }
      }
      return undefined;
    }
    // For TikTok/YouTube, show average_views
    return influencer.average_views || undefined;
  };

  // Get views label based on platform
  const getViewsLabel = (): string => {
    if (isInstagram()) {
      return 'Reel Views';
    }
    return 'Avg Views';
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString();
  };

  // Extract budget data from import_metadata
  const getBudgetData = (): BudgetEntry[] => {
    try {
      // Try multiple paths to find import_metadata
      let importMetadata: ImportMetadata | null = null;

      // Path 1: Direct on influencer object
      if ((influencer as any).import_metadata) {
        importMetadata = (influencer as any).import_metadata;
      }
      // Path 2: Inside additional_metrics
      else if ((influencer as any).additional_metrics?.import_metadata) {
        importMetadata = (influencer as any).additional_metrics.import_metadata;
      }

      if (importMetadata && Array.isArray(importMetadata.budget)) {
        return importMetadata.budget;
      }

      return [];
    } catch (error) {
      return [];
    }
  };

  const budgetData = getBudgetData();

  const handleOpenProfile = () => {
    if (influencer.url) {
      window.open(influencer.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleProfileAnalytics = async () => {
    console.log(
      'handleProfileAnalytics called: ',
      influencer,
      selectedPlatform,
    );
    if (!influencer?.id || !selectedPlatform?.id) return;

    setCheckingAnalytics(true);
    setAnalyticsError(null);

    try {
      // Use platform account ID to check analytics
      const platformAccountId = influencer.external_id || influencer.id || '';
      const result = await checkProfileAnalyticsExists(platformAccountId);

      setAnalyticsData(result);

      // Navigate to analytics page
      const params = new URLSearchParams({
        user: influencer.id,
        username: influencer.username,
        platform: selectedPlatform.work_platform_id,
      });

      const url = `/profile-analytics?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Failed to check analytics:', error);
      setAnalyticsError(
        error instanceof Error ? error.message : 'Failed to check analytics',
      );
    } finally {
      setCheckingAnalytics(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with opacity */}
        <div
          className="fixed inset-0 bg-black transition-opacity"
          onClick={onClose}
          style={{ opacity: '50%' }}
        ></div>

        {/* Modal panel - Mobile-like width */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full max-w-sm w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Profile Insights
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Profile Info */}
            <div className="mt-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img
                    src={influencer.profileImage || '/default-avatar.png'}
                    alt={influencer.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  {influencer.isVerified && (
                    <span className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold mt-3">{influencer.name}</h2>
                <p className="text-sm text-gray-500">@{influencer.username}</p>
                {influencer.introduction && (
                  <p className="text-sm text-gray-700 mt-2 px-2">
                    {influencer.introduction}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mt-4">
              <button
                onClick={handleOpenProfile}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors font-medium"
              >
                View Profiles
              </button>
              <button
                onClick={handleProfileAnalytics}
                disabled={checkingAnalytics}
                className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  checkingAnalytics
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
                {checkingAnalytics ? 'Checking...' : 'Profile Analytics'}
              </button>

              {/* Show analytics error if any */}
              {analyticsError && (
                <div className="text-xs text-red-600 text-center mt-1">
                  {analyticsError}
                </div>
              )}

              {/* Show analytics status if available */}
              {analyticsData && !checkingAnalytics && (
                <div className="text-xs text-gray-600 text-center mt-1">
                  {analyticsData.exists
                    ? `${analyticsData.analytics_count} analytics reports available`
                    : 'No analytics reports found'}
                </div>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">
                  {formatNumber(getFollowerCount())}
                </div>
                <div className="text-xs text-gray-500">
                  {getFollowerLabel()}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">
                  {formatEngagementRate(influencer.engagementRate)}
                </div>
                <div className="text-xs text-gray-500">Engagement</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">
                  {formatNumber(influencer.average_likes)}
                </div>
                <div className="text-xs text-gray-500">Avg Likes</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-gray-900">
                  {formatNumber(getViewsCount())}
                </div>
                <div className="text-xs text-gray-500">{getViewsLabel()}</div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mt-4 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'posts'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Recent Posts
                </button>
                <button
                  onClick={() => setActiveTab('budget')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'budget'
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Budget
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-4 max-h-80 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Additional Profile Info */}
                  <div className="space-y-2">
                    {influencer.content_count && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">
                          Total Posts
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatNumber(influencer.content_count)}
                        </span>
                      </div>
                    )}
                    {influencer.age_group && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">Age Group</span>
                        <span className="text-sm font-medium text-gray-900">
                          {influencer.age_group}
                        </span>
                      </div>
                    )}
                    {influencer.platform_account_type && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-sm text-gray-500">
                          Account Type
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {influencer.platform_account_type}
                        </span>
                      </div>
                    )}
                    {/* Show platform account ID for debugging */}
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Platform ID</span>
                      <span className="text-xs font-mono text-gray-600">
                        {influencer.external_id || influencer.id || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'posts' && (
                <div>
                  {loadingPosts ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {posts.map((post) => (
                        <div key={post.id} className="relative group">
                          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                            <img
                              src={post.imageUrl}
                              alt="Post"
                              className="w-full h-full object-cover"
                            />
                            {post.type === 'video' && (
                              <div className="absolute top-2 right-2 bg-black bg-opacity-60 rounded-full p-1">
                                <svg
                                  className="h-3 w-3 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="text-white text-center text-xs space-y-1">
                              <div className="flex items-center justify-center gap-2">
                                <span>❤️ {formatNumber(post.likes)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="mt-2 text-sm">No posts available</p>
                      <p className="text-xs">
                        Posts will be loaded when available
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'budget' && (
                <div className="space-y-4">
                  {/* Budget Information */}
                  <div className="space-y-2">
                    {budgetData.length > 0 ? (
                      budgetData.map((budget, index) => (
                        <div
                          key={index}
                          className="flex justify-between py-2 border-b border-gray-100"
                        >
                          <span className="text-sm text-gray-500">
                            {budget.currency}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(budget.price)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="mt-2 text-sm">
                          No budget information available
                        </p>
                      </div>
                    )}
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

export default ProfileInsightsModal;
