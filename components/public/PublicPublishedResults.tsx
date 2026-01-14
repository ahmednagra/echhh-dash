// src/components/public/PublicPublishedResults.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { PublicContentPostsResponse } from '@/types/public-content-posts';
import PublicCampaignAnalytics from './PublicCampaignAnalytics';
import PublicSentimentAnalysis from './PublicSentimentAnalysis';

interface PublicPublishedResultsProps {
  data: PublicContentPostsResponse;
  token: string;
}

type TabType = 'posts' | 'analytics' | 'sentiment';

const PublicPublishedResults: React.FC<PublicPublishedResultsProps> = ({
  data,
  token,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const { content_posts, campaign_info, session_info } = data;

  // Format number utility
  const formatNumber = (num: number | null | undefined): string => {
    if (!num || num === 0) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Format currency utility
  const formatCurrency = (amount: number | null | undefined): string => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  };

  // Format date utility
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format relative time
  const formatRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const diffInMilliseconds = todayStart.getTime() - dateStart.getTime();
      const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));

      if (diffInDays === 0) return 'Today';
      if (diffInDays === 1) return 'Yesterday';
      if (diffInDays === -1) return 'Tomorrow';
      if (diffInDays > 1 && diffInDays < 30) return `${diffInDays} days ago`;
      if (diffInDays < -1) return `${Math.abs(diffInDays)} days from now`;
      if (diffInDays >= 30 && diffInDays < 365) {
        const months = Math.floor(diffInDays / 30);
        return months === 1 ? '1 month ago' : `${months} months ago`;
      }
      const years = Math.floor(diffInDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Get proxied image URL
  const getProxiedImageUrl = (url: string): string => {
    if (!url) return '/default-avatar.png';
    
    // If already proxied, return as-is
    if (url.startsWith('/api/')) return url;
    
    // Check if it's an Instagram/Facebook CDN URL
    if (
      url.includes('instagram.com') ||
      url.includes('fbcdn.net') ||
      url.includes('cdninstagram.com')
    ) {
      return `/api/v0/instagram/image-proxy?url=${encodeURIComponent(url)}`;
    }
    
    return url;
  };

  // Extract post metrics from backend response
  const getPostMetrics = (post: any) => {
    const likes = post.engagement?.like_count || 0;
    const comments = post.engagement?.comment_count || 0;
    const views = post.engagement?.view_count || 0;
    const shares = post.engagement?.share_count || 0;
    const followers = post.influencer?.followers || 0;
    const collaborationPrice = post.influencer?.total_price || post.influencer?.collaboration_price || 0;

    const totalEngagement = likes + comments + shares;
    const engagementRate = followers > 0 ? ((totalEngagement / followers) * 100).toFixed(2) + '%' : '0.00%';
    const cpv = views > 0 ? collaborationPrice / views : 0;
    const cpe = totalEngagement > 0 ? collaborationPrice / totalEngagement : 0;

    return {
      likes,
      comments,
      views,
      shares,
      followers,
      engagementRate,
      cpv,
      cpe,
      collaborationPrice,
    };
  };

  // Video click handler - Redirect to Instagram
  const handleVideoClick = (post: any) => {
    // Open Instagram post directly in new tab
    if (post.content_url) {
      window.open(post.content_url, '_blank');
    } else if (post.platform_post_id) {
      // Fallback: construct Instagram URL from shortcode
      window.open(`https://www.instagram.com/p/${post.platform_post_id}/`, '_blank');
    } else {
      console.warn('No content URL or shortcode found for this post');
    }
  };

  // Sorting function
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnKey, direction });
    setCurrentPage(1);
  };

  // Get sort icon
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-400 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3.5 h-3.5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3 h-3 text-gray-300 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg className="w-3 h-3 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg className="w-3.5 h-3.5 text-purple-600 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  // Filter posts by search term
  const filteredPosts = content_posts.filter((post) =>
    post.influencer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.influencer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort posts
  const sortedPosts = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return filteredPosts;

    return [...filteredPosts].sort((a, b) => {
      const aMetrics = getPostMetrics(a);
      const bMetrics = getPostMetrics(b);

      let aValue: any, bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = (a.influencer?.full_name || a.influencer?.username || '').toLowerCase();
          bValue = (b.influencer?.full_name || b.influencer?.username || '').toLowerCase();
          break;
        case 'followers':
          aValue = aMetrics.followers;
          bValue = bMetrics.followers;
          break;
        case 'likes':
          aValue = aMetrics.likes;
          bValue = bMetrics.likes;
          break;
        case 'comments':
          aValue = aMetrics.comments;
          bValue = bMetrics.comments;
          break;
        case 'shares':
          aValue = aMetrics.shares;
          bValue = bMetrics.shares;
          break;
        case 'views':
          aValue = aMetrics.views;
          bValue = bMetrics.views;
          break;
        case 'engagementRate':
          aValue = parseFloat(aMetrics.engagementRate);
          bValue = parseFloat(bMetrics.engagementRate);
          break;
        case 'cpv':
          aValue = aMetrics.cpv;
          bValue = bMetrics.cpv;
          break;
        case 'cpe':
          aValue = aMetrics.cpe;
          bValue = bMetrics.cpe;
          break;
        case 'postDate':
          aValue = new Date(a.posted_at || 0).getTime();
          bValue = new Date(b.posted_at || 0).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updated_at || a.created_at || 0).getTime();
          bValue = new Date(b.updated_at || b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return sortConfig.direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredPosts, sortConfig]);

  // Pagination
  const totalItems = sortedPosts.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
    setShowPageSizeDropdown(false);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3);
        if (totalPages > 4) pages.push('...');
        if (totalPages > 3) pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        if (totalPages > 4) pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          if (i > 1) pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();
  const pageSizeOptions = [10, 20, 25, 50, 100];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return renderPostsTab();
      case 'analytics':
        // Show campaign-wide analytics for all posts
        return (
          <PublicCampaignAnalytics
            posts={content_posts}
            campaignName={campaign_info.name}
            onBack={() => setActiveTab('posts')}
          />
        );
      case 'sentiment':
        // Show sentiment analysis for all posts
        return (
          <PublicSentimentAnalysis
            posts={content_posts}
            campaignName={campaign_info.name}
            onBack={() => setActiveTab('posts')}
          />
        );
      default:
        return null;
    }
  };

  const renderPostsTab = () => {
    return (
      <div className="pt-4">
        {/* Search Bar */}
        <div className="flex items-center justify-between mb-6 px-4">
          <div className="relative flex-1 mr-4">
            <input
              type="text"
              placeholder="Search Influencer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow w-full relative">
          <div className="w-full min-w-full table-fixed max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8">
                    <button
                      onClick={() => handleSort('name')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Post ({totalItems})
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('name')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('followers')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Followers
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('followers')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('likes')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Likes
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('likes')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('comments')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Comments
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('comments')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('shares')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Shares
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('shares')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('views')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Views
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('views')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('engagementRate')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Eng Rate
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('engagementRate')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('cpv')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        CPV
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('cpv')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('cpe')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        CPE
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('cpe')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <button
                      onClick={() => handleSort('postDate')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Post Date
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('postDate')}
                      </div>
                    </button>
                  </th>
                  <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14">
                    <span className="truncate">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPosts.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center">
                      <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500">No published posts found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedPosts.map((post) => {
                    const metrics = getPostMetrics(post);
                    return (
                      <tr key={post.id} className="hover:bg-gray-50">
                        {/* Influencer Column */}
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 relative">
                              <div
                                className="relative group cursor-pointer"
                                onClick={() => handleVideoClick(post)}
                              >
                                <img
                                  src={getProxiedImageUrl(post.thumbnail_url || post.media_url || '')}
                                  alt={`${post.influencer?.username} video`}
                                  className="w-16 h-12 rounded-lg object-cover shadow-md ring-1 ring-gray-200 group-hover:shadow-lg transition-all duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/dummy-image.jpg';
                                  }}
                                />

                                {/* Play button overlay */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                                    <svg className="w-3 h-3 text-pink-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>

                                {/* Duration badge */}
                                {post.duration && (
                                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                    {Math.round(parseFloat(post.duration))}s
                                  </div>
                                )}

                                {/* Instagram indicator */}
                                <div className="absolute top-1 left-1 w-4 h-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center shadow-sm">
                                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-xs font-medium text-gray-900 flex items-center">
                                <span className="truncate">
                                  {post.influencer?.full_name || post.influencer?.username || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 truncate">
                                  @{post.influencer?.username || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Stats Columns */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(metrics.followers)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(metrics.likes)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(metrics.comments)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(metrics.shares)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {metrics.views > 0 ? formatNumber(metrics.views) : 'N/A'}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {metrics.engagementRate}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatCurrency(metrics.cpv)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatCurrency(metrics.cpe)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {post.posted_at ? formatDate(post.posted_at) : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {post.posted_at ? formatRelativeTime(post.posted_at) : 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Actions Column */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs">
                          <div className="flex items-center justify-center">
                            <button
                              onClick={() => {
                                if (post.content_url) {
                                  window.open(post.content_url, '_blank');
                                }
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded hover:bg-gray-50"
                              title="View on Instagram"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalItems > 0 && (
            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-gray-200">
              <div className="flex items-center mb-4 sm:mb-0">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {pageNumbers.map((pageNum, index) => (
                    <div key={index}>
                      {pageNum === '...' ? (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                          ...
                        </span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(pageNum as number)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            pageNum === currentPage
                              ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                              : 'bg-white text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-gray-700 mr-3">
                  Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                  <span className="font-medium">{endIndex}</span> of{' '}
                  <span className="font-medium">{totalItems}</span> entries
                </p>
                <div className="ml-2 relative page-size-dropdown">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPageSizeDropdown(!showPageSizeDropdown);
                    }}
                    className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none flex items-center"
                  >
                    Show {pageSize}
                    <svg
                      className={`-mr-1 ml-1 h-5 w-5 transform transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {showPageSizeDropdown && (
                    <div className="absolute right-0 bottom-full mb-1 w-32 bg-white border border-gray-300 rounded-md shadow-lg z-50">
                      <div className="py-1">
                        {pageSizeOptions.map((option) => (
                          <button
                            key={option}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePageSizeChange(option);
                            }}
                            className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              pageSize === option
                                ? 'bg-pink-50 text-pink-600 font-medium'
                                : 'text-gray-700'
                            }`}
                          >
                            Show {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          {campaign_info.name} - Published Results
        </h1>
        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Read-only view
          </span>
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Expires: {formatDate(session_info.expires_at)}
          </span>
          <span className="inline-flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            {content_posts.length} post{content_posts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'posts'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Posts
            </span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'analytics'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              View Analytics
            </span>
          </button>
          <button
            onClick={() => setActiveTab('sentiment')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'sentiment'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Sentiment Analysis
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderTabContent()}</div>
    </div>
  );
};

export default PublicPublishedResults;