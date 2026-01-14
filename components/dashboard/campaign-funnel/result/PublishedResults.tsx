// src/components/dashboard/campaign-funnel/result/PublishedResults.tsx
'use client';

import React, { useState, useEffect } from 'react';
import AddVideoModal from './AddVideoModal';
import EditVideoModal from './EditVideoModal';
import SinglePostUpdater from './SinglePostUpdater';
import BulkPostUpdater from './BulkPostUpdater';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/types/campaign';
import { formatNumber } from '@/utils/format';
import {getContentPostsByCampaign, deleteContentPost, updateContentPost} from '@/services/content-posts/content-post.client';
import { toast } from 'react-hot-toast';
import { createPublicSession } from '@/services/public-sessions/public-sessions.client';
import { detectPlatformFromUrl } from '@/constants/social-platforms';
import { ThumbnailPlatformIcon } from './VideoMetricsForm';
import {getPostData, getProxiedImageUrl, formatCurrency, formatDate, formatRelativeTime, classifyApiError} from './types';
import { getAllCampaignInfluencers } from '@/services/campaign-influencers/campaign-influencers.client';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import Button from '@/components/ui/Button';
import { Plus, Share2, Settings } from 'lucide-react';

// Add this helper function at the top of your component (after the imports)
const extractShortcodeFromUrl = (url: string): string | null => {
  if (!url) return null;

  // Match Instagram post or reel URLs and extract shortcode
  const instagramRegex = /(?:instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+))/;
  const match = url.match(instagramRegex);
  return match ? match[1] : null;
};

interface PublishedResultsProps {
  campaignData?: Campaign | null;
  onVideoCountChange?: (count: number) => void;
}

const PublishedResults: React.FC<PublishedResultsProps> = ({
  campaignData,
  onVideoCountChange,
  // onShowAnalytics,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [showEditVideoModal, setShowEditVideoModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoResult | null>(null);
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [updatingVideoId, setUpdatingVideoId] = useState<string | null>(null);
  const [deletingVideoId, setDeletingVideoId] = useState<string | null>(null);

  // Video Player States
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedVideoData, setSelectedVideoData] =
    useState<VideoResult | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [videoError, setVideoError] = useState<string | null>(null);

  // Sorting states - updated to match ShortlistedTable
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

  // Pagination state - Changed default pageSize from 10 to 50
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // Campaign influencers map for YouTube subscriber lookup
  const [campaignInfluencersMap, setCampaignInfluencersMap] = useState<Map<string, CampaignListMember>>(new Map());
  

  /**
   * Get followers count with YouTube subscriber support
   * For YouTube posts, looks up subscriber_count from campaign influencers
   * This mirrors the exact logic used in AnalyticsView for consistency
   */
  const getFollowersWithYouTubeSupport = (video: VideoResult, baseFollowers: number): number => {
    // Detect if this is a YouTube post
    const contentUrl = video.content_url?.toLowerCase() || '';
    const isYouTube = contentUrl.includes('youtube.com') || contentUrl.includes('youtu.be');
    
    // For non-YouTube, return base followers
    if (!isYouTube) {
      return baseFollowers;
    }
    
    // For YouTube, try to get subscriber count from campaign influencers
    // Method 1: Lookup by campaign_influencer_id (same as AnalyticsView)
    if (video.campaign_influencer_id && campaignInfluencersMap.has(video.campaign_influencer_id)) {
      const campaignInfluencer = campaignInfluencersMap.get(video.campaign_influencer_id)!;
      const platformName = (campaignInfluencer.social_account as any)?.platform?.name?.toLowerCase();
      
      if (platformName === 'youtube') {
        const subscriberCount = 
          campaignInfluencer.social_account?.subscribers_count ||
          (campaignInfluencer.social_account?.additional_metrics as any)?.subscriber_count ||
          0;
        
        if (subscriberCount > 0) {
          console.log(`📺 YouTube subscribers for @${video.influencer_username}: ${subscriberCount.toLocaleString()} (by ID)`);
          return subscriberCount;
        }
      }
    }
    
    // Method 2: Lookup by username (fallback)
    const usernameKey = `username_${video.influencer_username?.toLowerCase()}`;
    if (campaignInfluencersMap.has(usernameKey)) {
      const campaignInfluencer = campaignInfluencersMap.get(usernameKey)!;
      const platformName = (campaignInfluencer.social_account as any)?.platform?.name?.toLowerCase();
      
      if (platformName === 'youtube') {
        const subscriberCount = 
          campaignInfluencer.social_account?.subscribers_count ||
          (campaignInfluencer.social_account?.additional_metrics as any)?.subscriber_count ||
          0;
        
        if (subscriberCount > 0) {
          console.log(`📺 YouTube subscribers for @${video.influencer_username}: ${subscriberCount.toLocaleString()} (by username)`);
          return subscriberCount;
        }
      }
    }
    
    // Fallback to base followers
    return baseFollowers;
  };

  // Video Click Handler - Opens Modal with Video Player
  const handleVideoClick = (video: VideoResult) => {
    const postData = getPostData(video);

    if (postData.isVideo && postData.videoUrl) {
      setSelectedVideoData(video);
      setVideoModalOpen(true);
    } else {
      // FIXED: Use content_url directly from content-posts API
      if (video.content_url) {
        window.open(video.content_url, '_blank');
      } else {
        console.warn('No content URL found for this post');
      }
    }
  };

  // Close Video Modal
  const closeVideoModal = () => {
    setVideoModalOpen(false);
    setSelectedVideoData(null);
    setVideoError(null); // Add this line to reset video error
  };

  // Update parent component with video count whenever videoResults changes
  useEffect(() => {
    if (onVideoCountChange) {
      onVideoCountChange(videoResults?.length || 0);
    }
  }, [videoResults?.length, onVideoCountChange]);

  // Fetch video results on component mount
  useEffect(() => {
    if (campaignData?.id) {
      fetchVideoResults();
    }
  }, [campaignData?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showPageSizeDropdown) {
        const target = event.target as Element;
        if (!target.closest('.page-size-dropdown')) {
          setShowPageSizeDropdown(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPageSizeDropdown]);

  // NEW CODE - Replace the fetchVideoResults function:
  const fetchVideoResults = async () => {
    if (!campaignData?.id) return;

    setIsLoading(true);
    try {
      console.log('🔍 Fetching content posts for campaign:', campaignData.id);

      // 🎯 Using content-posts API
      const results = await getContentPostsByCampaign(campaignData.id, 1, 200);

      console.log('📦 API returned results:', {
        isArray: Array.isArray(results),
        length: results?.length || 0,
        firstItem:
          results && results.length > 0
            ? {
                id: results[0].id,
                influencer: results[0].influencer_username,
                views: results[0].views_count,
              }
            : null,
      });

      // ✅ Update state with results (always set array, even if empty)
      setVideoResults(results || []);
      console.log('✅ Fetched content posts:', (results || []).length);

      // Debug: Log first item to verify data structure
      if (results && results.length > 0) {
        console.log('📊 Sample content post data:', {
          id: results[0].id,
          influencer: results[0].influencer_username,
          views: results[0].views_count,
          likes: results[0].likes_count,
          data_source: results[0].data_source, // Should show 'content-posts-api'
        });
      }
    } catch (error) {
      console.error('💥 Error fetching content posts:', error);
      setVideoResults([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaign influencers for YouTube subscriber lookup (same pattern as AnalyticsView)
  useEffect(() => {
    const fetchCampaignInfluencersForYouTube = async () => {
      // Skip if no campaign data or no video results yet
      if (!campaignData?.campaign_lists?.[0]?.id || videoResults.length === 0) return;
      
      // Check if any YouTube content exists before fetching (performance optimization)
      const hasYouTubeContent = videoResults.some((video) => 
        video.content_url?.toLowerCase().includes('youtube.com') ||
        video.content_url?.toLowerCase().includes('youtu.be')
      );
      
      if (!hasYouTubeContent) {
        console.log('📺 PublishedResults: No YouTube content, skipping influencer fetch');
        return;
      }
      
      try {
        const listId = campaignData.campaign_lists[0].id;
        console.log('📺 PublishedResults: Fetching campaign influencers for YouTube subscriber lookup...');
        
        const response = await getAllCampaignInfluencers(listId);
        
        if (response?.success && response.influencers) {
          const newInfluencersMap = new Map<string, CampaignListMember>();
          
          response.influencers.forEach((inf) => {
            // Map by ID (primary lookup method)
            if (inf.id) {
              newInfluencersMap.set(inf.id, inf as CampaignListMember);
            }
            // Also map by username for fallback lookup
            const username = (inf.social_account as any)?.account_handle?.toLowerCase();
            if (username) {
              newInfluencersMap.set(`username_${username}`, inf as CampaignListMember);
            }
          });
          
          setCampaignInfluencersMap(newInfluencersMap);
          console.log('✅ PublishedResults: Loaded campaign influencers for YouTube:', newInfluencersMap.size);
        }
      } catch (err) {
        console.warn('⚠️ PublishedResults: Could not fetch campaign influencers:', err);
      }
    };
    
    fetchCampaignInfluencersForYouTube();
  }, [campaignData?.campaign_lists, videoResults.length]);


  const handleEditVideo = (video: VideoResult) => {
    setEditingVideo(video);
    setShowEditVideoModal(true);
  };

    const handleUpdateEditedVideo = async (updatedData: any) => {
      if (!editingVideo) return;
      try {
        const result = await updateContentPost(editingVideo.id, updatedData);
        
        // Extract engagement and influencer data from the submitted payload
        const engagement = updatedData.initial_metadata?.engagement || {};
        const influencer = updatedData.initial_metadata?.influencer || {};
        
        // ✅ Properly map API response + submitted data to VideoResult structure
        setVideoResults((prev) =>
          prev.map((v) => {
            if (v.id !== editingVideo.id) return v;
            
            // Build updated post_result_obj with new engagement data
            const updatedPostResultObj = {
              ...v.post_result_obj,
              engagement: {
                like_count: engagement.like_count ?? v.post_result_obj?.engagement?.like_count ?? 0,
                comment_count: engagement.comment_count ?? v.post_result_obj?.engagement?.comment_count ?? 0,
                share_count: engagement.share_count ?? v.post_result_obj?.engagement?.share_count ?? 0,
                view_count: engagement.view_count ?? v.post_result_obj?.engagement?.view_count ?? 0,
                save_count: v.post_result_obj?.engagement?.save_count ?? 0,
              },
              influencer: {
                ...v.post_result_obj?.influencer,
                followers: influencer.followers ?? v.post_result_obj?.influencer?.followers ?? v.followers_count,
                collaboration_price: influencer.collaboration_price ?? v.post_result_obj?.influencer?.collaboration_price ?? v.collaboration_price,
                full_name: influencer.full_name || v.post_result_obj?.influencer?.full_name || v.full_name,
                username: influencer.username || v.post_result_obj?.influencer?.username || v.influencer_username,
              },
            };

            return {
              ...v,
              // API response fields
              title: result.title ?? v.title,
              caption: result.caption ?? v.caption,
              updated_at: result.updated_at || new Date().toISOString(),
              likes_count: engagement.like_count ?? v.likes_count,
              comments_count: engagement.comment_count ?? v.comments_count,
              shares_count: engagement.share_count ?? v.shares_count,
              views_count: engagement.view_count ?? v.views_count,
              plays_count: engagement.play_count ?? v.plays_count,
              // Map influencer data
              followers_count: influencer.followers ?? v.followers_count,
              collaboration_price: influencer.collaboration_price ?? v.collaboration_price,
              full_name: influencer.full_name || v.full_name,
              content_format: v.content_format,
              post_result_obj: updatedPostResultObj,
            } as VideoResult;
          })
        );
        
        setShowEditVideoModal(false);
        setEditingVideo(null);
        toast.success('Video updated successfully');
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to update video';
        toast.error(errorMessage);
      }
    };
  const handleDeleteVideo = async (videoId: string) => {
    setDeletingVideoId(videoId);
    try {
      console.log('🗑️ Deleting content post:', videoId);

      await deleteContentPost(videoId); // 👈 CHANGED THIS LINE

      // Remove the video from local state
      setVideoResults((prev) =>
        (prev || []).filter((video) => video.id !== videoId),
      );

      // // Clear any selection that includes this video
      // setSelectedVideos((prev) => {
      //   const newSelected = new Set(prev);
      //   newSelected.delete(videoId);
      //   return newSelected;
      // });

      console.log('✅ Video deleted successfully:', videoId);
    } catch (error) {
      console.error('💥 Error deleting video:', error);
      // You might want to show a toast notification here
    } finally {
      setDeletingVideoId(null);
      setShowDeleteConfirm(null);
    }
  };

  // Updated sorting function to match ShortlistedTable exactly
  const handleSort = (columnKey: string) => {
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    setSortConfig({ key: columnKey, direction });
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Get sort icon for column headers - exact replica from ShortlistedTable
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) {
      return (
        <div className="flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0.5">
          <svg
            className="w-3 h-3 text-gray-400 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3 h-3 text-gray-400 -mt-0.5 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }

    if (sortConfig.direction === 'asc') {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg
            className="w-3.5 h-3.5 text-purple-600 drop-shadow-md filter brightness-110"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3 h-3 text-gray-300 -mt-0.5 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center animate-pulse">
          <svg
            className="w-3 h-3 text-gray-300 drop-shadow-sm"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          <svg
            className="w-3.5 h-3.5 text-purple-600 -mt-0.5 drop-shadow-md filter brightness-110"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      );
    }
  };

  const filteredVideos = (videoResults || []).filter(
    (video) =>
      video.influencer_username
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      video.full_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Updated sorting logic to match ShortlistedTable exactly - UPDATED with shares support
  const sortedVideos = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return filteredVideos;
    }

    return [...filteredVideos].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      const aData = getPostData(a);
      const bData = getPostData(b);

      switch (sortConfig.key) {
        case 'name':
          aValue = (a.full_name || a.influencer_username).toLowerCase();
          bValue = (b.full_name || b.influencer_username).toLowerCase();
          break;
        case 'followers':
          aValue = Number(aData.followers) || 0;
          bValue = Number(bData.followers) || 0;
          break;
        case 'likes':
          aValue = Number(aData.likes) || 0;
          bValue = Number(bData.likes) || 0;
          break;
        case 'comments':
          aValue = Number(aData.comments) || 0;
          bValue = Number(bData.comments) || 0;
          break;
        case 'shares': // UPDATED: Added shares sorting
          aValue = Number(aData.shares) || 0;
          bValue = Number(bData.shares) || 0;
          break;
        case 'views': // UPDATED: Use videoPlayCount for sorting the Views column
          aValue = Number(aData.videoPlayCount) || 0;
          bValue = Number(bData.videoPlayCount) || 0;
          break;
        case 'engagementRate':
          aValue = parseFloat(aData.engagementRate.replace('%', '')) || 0;
          bValue = parseFloat(bData.engagementRate.replace('%', '')) || 0;
          break;
        case 'collaborationPrice':
          aValue = Number(aData.collaborationPrice) || 0;
          bValue = Number(bData.collaborationPrice) || 0;
          break;
        case 'cpv':
          aValue = Number(aData.cpv) || 0;
          bValue = Number(bData.cpv) || 0;
          break;
        case 'cpe':
          aValue = Number(aData.cpe) || 0;
          bValue = Number(bData.cpe) || 0;
          break;
        case 'postDate':
          aValue = new Date(a.post_created_at || 0).getTime();
          bValue = new Date(b.post_created_at || 0).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updated_at || a.created_at || 0).getTime();
          bValue = new Date(b.updated_at || b.created_at || 0).getTime();
          break;
        default:
          return 0;
      }

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue === null || bValue === undefined)
        return sortConfig.direction === 'asc' ? -1 : 1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      }

      // String comparison (convert to string if needed)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredVideos, sortConfig]);

  // Pagination calculations - Use sortedVideos instead of filteredVideos
  const totalItems = sortedVideos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedVideos = sortedVideos.slice(startIndex, endIndex);

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

  // Handle Share Results - Generate tokenized public URL
  const handleShareResults = async () => {
    try {
      if (!campaignData?.id) {
        toast.error('Campaign ID is required to create a shareable link');
        return;
      }

      console.log('📤 Creating public session for campaign:', campaignData.id);

      const sessionData = {
        session_type: 'campaign_results',
        resource_type: 'campaign',
        resource_id: campaignData.id,
        expires_in_hours: 72,
        permissions: {
          read: true,
          'comment:create': false,
          'comment:read': false,
          'comment:reply': false,
          'price_negotiation:create': false,
          'price_negotiation:read': false,
          'price_negotiation:approve': false,
          'price_negotiation:reject': false,
        },
        session_metadata: {
          page_name: "published_results", // ✅ Move page_name HERE
          client_name: 'Public Viewer',
          client_company: 'External',
          client_email: 'public@viewer.com',
          client_role: 'viewer',
        },
      };

      const sessionResponse = await createPublicSession(sessionData);

      if (sessionResponse && sessionResponse.public_url) {
        const originalUrl = new URL(sessionResponse.public_url);
        const token = originalUrl.searchParams.get('token');

        if (!token) {
          throw new Error('No token in public URL');
        }

        const baseUrl = window.location.origin;
        const customPublicUrl = `${baseUrl}/published-results?token=${token}`;

        await navigator.clipboard.writeText(customPublicUrl);
        setUrlCopied(true);

        toast.success('Shareable URL copied to clipboard!');

        setTimeout(() => setUrlCopied(false), 3000);
      } else {
        throw new Error('No public URL received from server');
      }
    } catch (error) {
      console.error('Error creating shareable URL:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to create shareable URL';
      toast.error(errorMessage);
    }
  };

  const pageNumbers = generatePageNumbers();
  const pageSizeOptions = [10, 20, 25, 50, 100];

  return (
    <div className="pt-4">
      {/* Updated Search Bar and Action Buttons */}
      <div className="flex items-center justify-between mb-6 px-4">
        {/* Expanded search input to fill more space */}
        <div className="relative flex-1 mr-4">
          <input
            type="text"
            placeholder="Search Influencer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-3 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21L16.514 16.506M19 10.5a8.5 8.5 0 11-17 0 8.5 8.5 0 0117 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-3 flex-shrink-0">
          {/* Add Video Button - Action variant */}
          <Button
            variant="action"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddVideoModal(true)}
            disabled={!campaignData?.id}
          >
            Add Video
          </Button>

          {/* Share Button - Action variant */}
          <Button
            variant="action"
            size="md"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={handleShareResults}
            disabled={!campaignData?.id}
          >
            {urlCopied ? 'URL Copied!' : 'Share'}
          </Button>

          {/* Bulk Post Updater Component */}
          {campaignData?.id && (
            <BulkPostUpdater
              campaignId={campaignData.id}
              videoResults={videoResults}
              onUpdateSuccess={(updatedResults) => {
                setVideoResults((prev) =>
                  (prev || []).map((existingVideo) => {
                    const updatedVideo = updatedResults.find((u) => u.id === existingVideo.id);
                    if (updatedVideo) {
                      return { ...existingVideo, ...updatedVideo, updated_at: new Date().toISOString() };
                    }
                    return existingVideo;
                  }),
                );
                toast.success(`Updated ${updatedResults.length} posts`);
              }}
              onUpdateError={(error) => {
                const classified = classifyApiError(error);
                toast.error(classified.userMessage);
              }}
              isUpdating={isUpdatingAll}
              onUpdateStart={() => setIsUpdatingAll(true)}
              onUpdateEnd={() => setIsUpdatingAll(false)}
              onRefetchResults={fetchVideoResults}
            />
          )}

          {/* Settings Button - Action variant */}
          <Button
            variant="action"
            size="md"
            leftIcon={<Settings className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="animate-spin h-8 w-8 text-pink-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-gray-500">Loading video results...</p>
          </div>
        </div>
      )}

      {/* No Campaign State */}
      {!campaignData?.id && !isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg
              className="h-16 w-16 text-gray-400 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-gray-500">No campaign selected</p>
          </div>
        </div>
      )}

      {/* Table with Sticky Header and Shares Column */}
      {!isLoading && campaignData?.id && (
        <div className="bg-white rounded-lg shadow w-full relative">
          <div className="w-full min-w-full table-fixed max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200 text-xs">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/8"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
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
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
                    <button
                      onClick={() => handleSort('updatedAt')}
                      className="flex items-center justify-between w-full cursor-pointer hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-200 group select-none"
                    >
                      <span className="group-hover:text-purple-700 transition-colors duration-200 truncate">
                        Updated at
                      </span>
                      <div className="transform group-hover:scale-110 transition-transform duration-200">
                        {getSortIcon('updatedAt')}
                      </div>
                    </button>
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/14"
                  >
                    <span className="truncate">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVideos.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center">
                      <svg
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-gray-500">No video results found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Add videos to see them here
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedVideos.map((video) => {
                    const postData = getPostData(video);
                    const isPlaying = playingVideo === video.id;

                    return (
                      <tr key={video.id} className="hover:bg-gray-50">
                        <td className="px-2 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 relative">
                              {isPlaying && postData.videoUrl ? (
                                <div className="w-16 h-12 rounded-lg overflow-hidden">
                                  <video
                                    src={postData.videoUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    onEnded={() => setPlayingVideo(null)}
                                  />
                                </div>
                              ) : (
                                <div
                                  className="relative group cursor-pointer"
                                  onClick={() => handleVideoClick(video)}
                                >
                                  <img
                                    src={postData.thumbnailUrl}
                                    alt={`${video.influencer_username} video`}
                                    className="w-16 h-12 rounded-lg object-cover shadow-md ring-1 ring-gray-200 group-hover:shadow-lg transition-all duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        '/dummy-image.jpg';
                                    }}
                                  />

                                  {/* Play button overlay */}
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/95 backdrop-blur-sm rounded-full p-2 shadow-lg transform group-hover:scale-110 transition-all duration-300">
                                      <svg
                                        className="w-3 h-3 text-pink-500 ml-0.5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path d="M8 5v14l11-7z" />
                                      </svg>
                                    </div>
                                  </div>

                                  {/* Duration badge */}
                                  {postData.duration > 0 && (
                                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                      {Math.floor(postData.duration)}s
                                    </div>
                                  )}

                                  {/* Platform indicator */}
                                  <ThumbnailPlatformIcon
                                    platform={detectPlatformFromUrl(video.content_url || '')}
                                    size="sm"
                                    className="absolute top-1 left-1"
                                  />
                                </div>
                              )}
                            </div>

                            <div className="ml-3 min-w-0 flex-1">
                              <div className="text-xs font-medium text-gray-900 flex items-center">
                                <span className="truncate">
                                  {video.full_name || video.influencer_username}
                                </span>
                                {video.post_result_obj?.data?.owner
                                  ?.is_verified && (
                                  <span
                                    className="ml-1 flex-shrink-0 text-blue-500"
                                    title="Verified"
                                  >
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-gray-500 truncate">
                                  @{video.influencer_username}
                                </p>
                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Stats */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {/* {postData.followers > 0
                            ? formatNumber(postData.followers)
                            : 'N/A'} */}
                              {(() => {
                                      const followers = getFollowersWithYouTubeSupport(video, postData.followers);
                                      return followers > 0 ? formatNumber(followers) : 'N/A';
                                    })()}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(postData.likes)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(postData.comments)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatNumber(postData.shares)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.videoPlayCount > 0
                            ? formatNumber(postData.videoPlayCount)
                            : 'N/A'}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {postData.engagementRate}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatCurrency(postData.cpv)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          {formatCurrency(postData.cpe)}
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {video.post_created_at
                                ? formatDate(video.post_created_at)
                                : 'N/A'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {video.post_created_at
                                ? formatRelativeTime(video.post_created_at)
                                : 'N/A'}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatDate(video.updated_at || video.created_at)}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(
                                video.updated_at || video.created_at,
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-2 py-4 whitespace-nowrap text-xs">
                          <div className="flex items-center space-x-2">
                            {/* Single Post Updater Component */}
                            <SinglePostUpdater
                              videoResult={video}
                              onUpdateSuccess={(updatedResult) => {
                                setVideoResults((prev) =>
                                  (prev || []).map((v) =>
                                    v.id === video.id
                                      ? { ...v, ...updatedResult, updated_at: new Date().toISOString() }
                                      : v,
                                  ),
                                );
                                toast.success(`Updated @${video.influencer_username}`);
                              }}
                              onUpdateError={(error) => {
                                const classified = classifyApiError(error, video.influencer_username);
                                toast.error(classified.userMessage);
                              }}
                              isUpdating={updatingVideoId === video.id}
                              onUpdateStart={(videoId) => setUpdatingVideoId(videoId)}
                              onUpdateEnd={() => setUpdatingVideoId(null)}
                            />

                            <button
                              onClick={() => handleEditVideo(video)}
                              className="text-green-500 hover:text-green-700 transition-colors duration-150 p-1 rounded hover:bg-green-50"
                              title="Edit video details"
                            >
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => {
                                if (video.content_url) {
                                  window.open(video.content_url, '_blank');
                                } else {
                                  console.warn(
                                    'No content URL found for Instagram redirect',
                                  );
                                }
                              }}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-1 rounded hover:bg-gray-50"
                              title="View on Instagram"
                            >
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
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </button>

                            <button
                              onClick={() => setShowDeleteConfirm(video.id)}
                              disabled={deletingVideoId === video.id}
                              className="text-red-500 hover:text-red-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50"
                              title="Delete video"
                            >
                              {deletingVideoId === video.id ? (
                                <svg
                                  className="animate-spin w-4 h-4"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                              ) : (
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
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              )}
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
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
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
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </nav>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-gray-700 mr-3">
                  Showing <span className="font-medium">{startIndex + 1}</span>{' '}
                  to <span className="font-medium">{endIndex}</span> of{' '}
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
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
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
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Video Result
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Are you sure you want to delete this video result? This action
                  cannot be undone and will permanently remove all associated
                  data.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteVideo(showDeleteConfirm)}
                  disabled={deletingVideoId === showDeleteConfirm}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {deletingVideoId === showDeleteConfirm ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {videoModalOpen && selectedVideoData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
        >
          <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-h-[90vh] w-full max-w-md flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={getProxiedImageUrl(
                      selectedVideoData.profile_pic_url ||
                        selectedVideoData.post_result_obj?.data?.owner
                          ?.profile_pic_url ||
                        '',
                    )}
                    alt={`${selectedVideoData.influencer_username} profile`}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/user/profile-placeholder.png';
                    }}
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-2 h-2 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.40z" />
                    </svg>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center">
                    <p className="font-medium text-sm truncate">
                      {selectedVideoData.full_name ||
                        selectedVideoData.influencer_username}
                    </p>
                    {selectedVideoData.post_result_obj?.data?.owner
                      ?.is_verified && (
                      <span
                        className="ml-1 flex-shrink-0 text-blue-500"
                        title="Verified"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    @{selectedVideoData.influencer_username}
                  </p>
                </div>
              </div>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

            {/* Error Fallback Banner - Shows at top when video fails */}
            {videoError && (
              <div className="bg-red-50 border-b border-red-200 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 text-red-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-red-800">
                      Video playback failed. The link may have expired.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (selectedVideoData.content_url) {
                        window.open(selectedVideoData.content_url, '_blank');
                      }
                    }}
                    className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium"
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                    View on Instagram
                  </button>
                </div>
              </div>
            )}

            <div className="relative bg-black flex items-center justify-center">
              {(() => {
                const postData = getPostData(selectedVideoData);

                return postData.videoUrl ? (
                  <video
                    src={postData.videoUrl}
                    className="w-full h-auto max-h-[50vh] object-contain"
                    controls
                    autoPlay
                    muted
                    onError={(e) => {
                      console.error('Video play error in modal:', e);
                      // Set error state to show fallback banner
                      setVideoError(selectedVideoData.id);
                    }}
                    onLoadStart={() => {
                      // Reset error state when video starts loading successfully
                      setVideoError(null);
                    }}
                  />
                ) : (
                  <div className="text-white text-center p-8 w-full">
                    <svg
                      className="w-16 h-16 mx-auto mb-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mb-4 text-lg">
                      Video not available for playback
                    </p>
                    <p className="mb-6 text-sm text-gray-300">
                      No video URL found for this post.
                    </p>
                    <button
                      onClick={() => {
                        if (selectedVideoData.content_url) {
                          window.open(selectedVideoData.content_url, '_blank');
                        }
                      }}
                      className="ml-3 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      View on Instagram
                    </button>
                  </div>
                );
              })()}
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {(() => {
                  const postData = getPostData(selectedVideoData);
                  return (
                    <>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {formatNumber(postData.likes)}
                        </p>
                        <p className="text-gray-500">Likes</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {formatNumber(postData.comments)}
                        </p>
                        <p className="text-gray-500">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {formatNumber(postData.shares)}
                        </p>
                        <p className="text-gray-500">Shares</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-gray-900">
                          {postData.videoPlayCount > 0
                            ? formatNumber(postData.videoPlayCount)
                            : 'N/A'}
                        </p>
                        <p className="text-gray-500">Views</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {selectedVideoData.post_result_obj?.data?.edge_media_to_caption
                ?.edges?.[0]?.node?.text && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {
                      selectedVideoData.post_result_obj.data
                        .edge_media_to_caption.edges[0].node.text
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideoModal && campaignData && (
        <AddVideoModal
          campaignData={campaignData}
          onClose={() => setShowAddVideoModal(false)}
          onSubmit={async (videoData) => {
            console.log('✅ Video added successfully:', videoData);

            // Close the modal first
            setShowAddVideoModal(false);

            // ✅ CRITICAL FIX: Immediately refetch all video results from the API
            // This ensures the newly saved video appears in the table
            try {
              console.log('🔄 Refreshing video results...');
              await fetchVideoResults();
              console.log('✅ Video results refreshed successfully');
            } catch (error) {
              console.error('❌ Error refreshing video results:', error);
              // You might want to show a toast notification here
            }
          }}
        />
      )}

      {/* Edit Video Modal */}
      {showEditVideoModal && editingVideo && (
        <EditVideoModal
          video={editingVideo}
          onClose={() => {
            setShowEditVideoModal(false);
            setEditingVideo(null);
          }}
          onSubmit={handleUpdateEditedVideo}
        />
      )}
    </div>
  );
};

export default PublishedResults;
