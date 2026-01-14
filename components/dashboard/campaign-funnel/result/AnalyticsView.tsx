// src/components/dashboard/campaign-funnel/result/AnalyticsView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { getContentPostsByCampaign } from '@/services/content-posts/content-post.client';
import { VideoResult } from '@/types/user-detailed-info';
import { Campaign } from '@/types/campaign';
import { exportToPDF, exportToPrint, generateExportFilename} from '@/utils/pdfExportUtils';
import PerformanceOverview from './PerformanceOverview';
import DetailedInsights from './DetailedInsights';
import { AnalyticsData, getPostData, getProxiedImageUrl } from './types';
import { ThumbnailPlatformIcon } from './VideoMetricsForm';
import { detectPlatformFromUrl, ContentPlatform } from '@/constants/social-platforms';
import { getAllCampaignInfluencers } from '@/services/campaign-influencers/campaign-influencers.client';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

// Add this helper function at the top of your component (after the imports)
const extractShortcodeFromUrl = (url: string): string | null => {
  if (!url) return null;

  // Match Instagram post or reel URLs and extract shortcode
  const instagramRegex = /(?:instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+))/;
  const match = url.match(instagramRegex);
  return match ? match[1] : null;
};

interface AnalyticsViewProps {
  onBack: () => void;
  campaignData?: Campaign | null;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onBack,
  campaignData,
}) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalClicks: 0,
    totalImpressions: 0,
    totalReach: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0,
    totalShares: 0,
    totalFollowers: 0,
    totalPosts: 0,
    totalInfluencers: 0,
    averageEngagementRate: 0,
    totalCPV: 0,
    totalCPE: 0,
    viewsToFollowersRatio: 0,
    commentToViewsRatio: 0,
    postsByDate: [],
    topPerformers: [],
    topPosts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareStatus, setShareStatus] = useState<'idle' | 'copying' | 'copied'>(
    'idle',
  );
  const [videoResults, setVideoResults] = useState<VideoResult[]>([]);
  // const [showSentimentAnalysis, setShowSentimentAnalysis] = useState(false);
  const [campaignInfluencersMap, setCampaignInfluencersMap] = useState<Map<string, CampaignListMember>>(new Map());

  // // Handler for sentiment analysis button
  // const handleSentimentAnalysis = () => {
  //   if (!campaignData?.id) {
  //     console.error('Campaign ID not available');
  //     return;
  //   }
  //   setShowSentimentAnalysis(true);
  // };

  // // Handler for coming back from sentiment analysis
  // const handleBackFromSentiment = () => {
  //   setShowSentimentAnalysis(false);
  // };

  // Sorting and filtering states
  const [postsSortBy, setPostsSortBy] = useState<
    'views' | 'likes' | 'comments' | 'engagement' | 'date'
  >('engagement');
  const [postsFilterBy, setPostsFilterBy] = useState<
    'all' | 'high-engagement' | 'high-views'
  >('all');
  const [influencersSortBy, setInfluencersSortBy] = useState<
    'engagement' | 'views' | 'followers' | 'posts'
  >('engagement');
  const [influencersFilterBy, setInfluencersFilterBy] = useState<
    'all' | 'verified' | 'top-performers'
  >('all');

  // Pagination states for posts
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage, setPostsPerPage] = useState(20);

  const exportContentRef = useRef<HTMLDivElement>(null);

  // const getProxiedImageUrl = (originalUrl: string): string => {
  //   if (!originalUrl) return '/user/profile-placeholder.png';

  //   if (
  //     originalUrl.startsWith('/api/') ||
  //     originalUrl.startsWith('/user/') ||
  //     originalUrl.startsWith('data:')
  //   ) {
  //     return originalUrl;
  //   }

  //   if (
  //     originalUrl.includes('instagram.com') ||
  //     originalUrl.includes('fbcdn.net') ||
  //     originalUrl.includes('cdninstagram.com')
  //   ) {
  //     return `/api/v0/instagram/image-proxy?url=${encodeURIComponent(originalUrl)}`;
  //   }

  //   return originalUrl;
  // };

  // // FIXED: Use EXACT same getPostData function as PublishedResults.tsx
  // const getPostData = (video: VideoResult) => {
  //   // FIXED: Check for preserved CPV/CPE values first
  //   const preservedCPV = (video as any)._preservedCPV;
  //   const preservedCPE = (video as any)._preservedCPE;

  //   // FIXED: Check for preserved videoPlayCount values
  //   const preservedVideoPlayCount = (video as any)._preservedVideoPlayCount;

  //   const postData = video.post_result_obj?.data;

  //   // UPDATED: Handle InsightIQ data structure (data is an array)
  //   const insightIQData = Array.isArray(video.post_result_obj?.data)
  //     ? video.post_result_obj.data[0]
  //     : null;

  //   if (!postData || (!postData.edge_media_preview_like && !insightIQData)) {
  //     // When no post data, use whichever is greater between views_count and plays_count
  //     const viewsFromAPI = Math.max(0, video.views_count || 0);
  //     const playsFromAPI = Math.max(0, video.plays_count || 0);
  //     const finalViews = Math.max(viewsFromAPI, playsFromAPI);
  //     const likes = Math.max(0, video.likes_count || 0);
  //     const comments = Math.max(0, video.comments_count || 0);

  //     // UPDATED: Proper shares handling with multiple fallbacks
  //     const shares = Math.max(0, video.shares_count || 0);
  //     const collaborationPrice = video.collaboration_price || 0;

  //     // FIXED: Use preserved values if available, otherwise calculate
  //     let cpv, cpe;

  //     if (preservedCPV !== undefined && preservedCPV !== null) {
  //       cpv = preservedCPV;
  //     } else {
  //       cpv =
  //         collaborationPrice > 0 && finalViews > 0
  //           ? collaborationPrice / finalViews
  //           : 0;
  //     }

  //     if (preservedCPE !== undefined && preservedCPE !== null) {
  //       cpe = preservedCPE;
  //     } else {
  //       const totalEngagements = likes + comments + (shares > 0 ? shares : 0);
  //       cpe =
  //         collaborationPrice > 0 && totalEngagements > 0
  //           ? collaborationPrice / totalEngagements
  //           : 0;
  //     }

  //     // FIXED: Use preserved videoPlayCount if available, otherwise use plays
  //     const videoPlayCount =
  //       preservedVideoPlayCount !== undefined &&
  //       preservedVideoPlayCount !== null
  //         ? preservedVideoPlayCount
  //         : playsFromAPI;

  //     return {
  //       likes,
  //       comments,
  //       plays: playsFromAPI,
  //       actualViews: finalViews,
  //       shares,
  //       followers: video.followers_count || 0,
  //       engagementRate: '0%',
  //       videoUrl: null,
  //       thumbnailUrl: getProxiedImageUrl(
  //         video.thumbnail || video.media_preview || '',
  //       ),
  //       isVideo: false,
  //       duration: video.duration || 0,
  //       collaborationPrice,
  //       cpv,
  //       cpe,
  //       videoPlayCount,
  //     };
  //   }

  //   // UPDATED: Handle InsightIQ data structure
  //   let likes, comments, shares, videoPlaysFromAPI, followers;

  //   if (insightIQData && insightIQData.engagement) {
  //     // Extract from InsightIQ structure
  //     likes = Math.max(0, insightIQData.engagement.like_count || 0);
  //     comments = Math.max(0, insightIQData.engagement.comment_count || 0);
  //     shares = Math.max(
  //       0,
  //       insightIQData.engagement.share_count || video.shares_count || 0,
  //     );
  //     videoPlaysFromAPI = Math.max(0, insightIQData.engagement.view_count || 0);
  //     followers = Math.max(
  //       0,
  //       insightIQData.profile?.follower_count || video.followers_count || 0,
  //     );
  //   } else {
  //     // Extract from EnsembleData structure (existing logic)
  //     likes = Math.max(
  //       0,
  //       postData.edge_media_preview_like?.count ||
  //         postData.edge_liked_by?.count ||
  //         video.likes_count ||
  //         0,
  //     );

  //     comments = Math.max(
  //       0,
  //       postData.edge_media_to_comment?.count ||
  //         postData.edge_media_preview_comment?.count ||
  //         postData.edge_media_to_parent_comment?.count ||
  //         video.comments_count ||
  //         0,
  //     );

  //     shares = Math.max(
  //       0,
  //       video.shares_count || // Primary: video level shares
  //         postData.shares_count || // Secondary: post data level shares
  //         postData.edge_media_to_share?.count || // Tertiary: Instagram API format
  //         0, // Default: 0 if no data
  //     );

  //     videoPlaysFromAPI = Math.max(
  //       0,
  //       postData.video_view_count || postData.video_play_count || 0,
  //     );
  //     followers = Math.max(
  //       0,
  //       video.followers_count || postData.owner?.edge_followed_by?.count || 0,
  //     );
  //   }

  //   // FIXED: Focus on video_play_count from API for the Views column, but use preserved value if available
  //   const videoPlayCount =
  //     preservedVideoPlayCount !== undefined && preservedVideoPlayCount !== null
  //       ? preservedVideoPlayCount
  //       : videoPlaysFromAPI;

  //   // Keep existing logic for other view calculations (for backwards compatibility)
  //   const generalViewsFromAPI = Math.max(0, video.views_count || 0);
  //   const playsFromVideo = Math.max(0, video.plays_count || 0);

  //   // Take the maximum of all available view/play counts for views
  //   const views = Math.max(
  //     videoPlaysFromAPI,
  //     generalViewsFromAPI,
  //     playsFromVideo,
  //   );
  //   const plays = Math.max(videoPlaysFromAPI, playsFromVideo);

  //   // Calculate engagement rate - include shares if > 0
  //   const totalEngagementForRate = likes + comments + (shares > 0 ? shares : 0);
  //   const engagementRate =
  //     followers > 0
  //       ? ((totalEngagementForRate / followers) * 100).toFixed(2) + '%'
  //       : '0%';

  //   // CRITICAL FIX: Enhanced collaboration price retrieval from multiple locations
  //   const collaborationPrice =
  //     video.collaboration_price || // Primary: video level collaboration price
  //     postData.collaboration_price || // Secondary: post data level collaboration price
  //     (insightIQData && insightIQData.collaboration_price) || // Tertiary: InsightIQ data collaboration price
  //     (Array.isArray(video.post_result_obj?.data) &&
  //       video.post_result_obj.data[0] &&
  //       video.post_result_obj.data[0].collaboration_price) || // Quaternary: InsightIQ array format
  //     0; // Default: 0 if no data

  //   // FIXED: Use preserved CPV/CPE values if available, otherwise calculate
  //   let cpv, cpe;

  //   if (preservedCPV !== undefined && preservedCPV !== null) {
  //     cpv = preservedCPV;
  //   } else {
  //     cpv =
  //       collaborationPrice > 0 && videoPlayCount > 0
  //         ? collaborationPrice / videoPlayCount
  //         : 0;
  //   }

  //   if (preservedCPE !== undefined && preservedCPE !== null) {
  //     cpe = preservedCPE;
  //   } else {
  //     const totalEngagements = likes + comments + (shares > 0 ? shares : 0);
  //     cpe =
  //       collaborationPrice > 0 && totalEngagements > 0
  //         ? collaborationPrice / totalEngagements
  //         : 0;
  //   }

  //   // UPDATED: Handle thumbnail URL from both structures
  //   let thumbnailUrl = '/dummy-image.jpg';

  //   if (insightIQData && insightIQData.thumbnail_url) {
  //     thumbnailUrl = insightIQData.thumbnail_url;
  //   } else if (postData) {
  //     if (postData.display_resources && postData.display_resources.length > 0) {
  //       thumbnailUrl =
  //         postData.display_resources[postData.display_resources.length - 1].src;
  //     } else if (postData.thumbnail_src) {
  //       thumbnailUrl = postData.thumbnail_src;
  //     } else if (postData.display_url) {
  //       thumbnailUrl = postData.display_url;
  //     }
  //   }

  //   // Fallback to video-level thumbnail
  //   if (!thumbnailUrl || thumbnailUrl === '/dummy-image.jpg') {
  //     if (video.thumbnail) {
  //       thumbnailUrl = video.thumbnail;
  //     } else if (video.media_preview) {
  //       thumbnailUrl = video.media_preview;
  //     }
  //   }

  //   if (
  //     thumbnailUrl &&
  //     !thumbnailUrl.startsWith('/api/') &&
  //     !thumbnailUrl.startsWith('/user/')
  //   ) {
  //     if (
  //       thumbnailUrl.includes('instagram.com') ||
  //       thumbnailUrl.includes('fbcdn.net') ||
  //       thumbnailUrl.includes('cdninstagram.com')
  //     ) {
  //       thumbnailUrl = `/api/v0/instagram/image-proxy?url=${encodeURIComponent(thumbnailUrl)}`;
  //     }
  //   }

  //   // UPDATED: Handle video URL from both structures
  //   let videoUrl = null;
  //   if (insightIQData && insightIQData.media_url) {
  //     videoUrl = insightIQData.media_url;
  //   } else if (postData && postData.video_url) {
  //     videoUrl = postData.video_url;
  //   }

  //   return {
  //     likes,
  //     comments,
  //     plays,
  //     actualViews: views,
  //     shares,
  //     followers,
  //     engagementRate,
  //     videoUrl,
  //     thumbnailUrl,
  //     isVideo: insightIQData
  //       ? insightIQData.format === 'VIDEO'
  //       : postData.is_video || postData.__typename === 'GraphVideo',
  //     duration: insightIQData
  //       ? insightIQData.duration
  //       : postData.video_duration || video.duration || 0,
  //     collaborationPrice,
  //     cpv,
  //     cpe,
  //     videoPlayCount,
  //   };
  // };

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

  // Filter and sort functions for posts
  const getFilteredAndSortedPosts = () => {
    let filtered = [...analyticsData.topPosts];

    if (postsFilterBy === 'high-engagement') {
      const avgEngagement =
        filtered.reduce((sum, post) => sum + post.totalEngagement, 0) /
        filtered.length;
      filtered = filtered.filter(
        (post) => post.totalEngagement > avgEngagement,
      );
    } else if (postsFilterBy === 'high-views') {
      // UPDATED: Use videoPlayCount for filtering high-views posts
      const avgViews =
        filtered.reduce(
          (sum, post) => sum + (post.videoPlayCount || post.views),
          0,
        ) / filtered.length;
      filtered = filtered.filter(
        (post) => (post.videoPlayCount || post.views) > avgViews,
      );
    }

    filtered.sort((a, b) => {
      switch (postsSortBy) {
        case 'views':
          // UPDATED: Use videoPlayCount for sorting by views
          return (b.videoPlayCount || b.views) - (a.videoPlayCount || a.views);
        case 'likes':
          return b.likes - a.likes;
        case 'comments':
          return b.comments - a.comments;
        case 'date':
          return (
            new Date(b.postDate).getTime() - new Date(a.postDate).getTime()
          );
        case 'engagement':
        default:
          return b.totalEngagement - a.totalEngagement;
      }
    });

    return filtered;
  };

  // Pagination logic for posts
  const getPaginatedPosts = () => {
    const filteredPosts = getFilteredAndSortedPosts();
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    return {
      posts: filteredPosts.slice(startIndex, endIndex),
      totalPosts: filteredPosts.length,
      totalPages: Math.ceil(filteredPosts.length / postsPerPage),
    };
  };

  // Reset to first page when filters change
  const handleFilterChange = (filterType: 'sort' | 'filter', value: string) => {
    setCurrentPage(1);
    if (filterType === 'sort') {
      setPostsSortBy(value as any);
    } else {
      setPostsFilterBy(value as any);
    }
  };

  // Filter and sort functions for influencers
  const getFilteredAndSortedInfluencers = () => {
    let filtered = [...analyticsData.topPerformers];

    if (influencersFilterBy === 'verified') {
      filtered = filtered.filter((influencer) => influencer.isVerified);
    } else if (influencersFilterBy === 'top-performers') {
      const avgEngagement =
        filtered.reduce((sum, inf) => sum + inf.totalEngagement, 0) /
        filtered.length;
      filtered = filtered.filter((inf) => inf.totalEngagement > avgEngagement);
    }

    filtered.sort((a, b) => {
      switch (influencersSortBy) {
        case 'views':
          // UPDATED: Use totalVideoPlayCount for sorting by views (will be added in processing)
          return (
            (b.totalVideoPlayCount || b.totalViews) -
            (a.totalVideoPlayCount || a.totalViews)
          );
        case 'followers':
          return b.followers - a.followers;
        case 'posts':
          return b.totalPosts - a.totalPosts;
        case 'engagement':
        default:
          return b.totalEngagement - a.totalEngagement;
      }
    });

    return filtered;
  };

  // Share and export functions (unchanged)
  const handleShareReport = async () => {
    if (!campaignData?.id || !campaignData?.name) {
      console.error('No campaign data available for sharing');
      return;
    }

    setIsSharing(true);
    setShareStatus('copying');

    try {
      const shareId = `${campaignData.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const expiresAt = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const requestBody = {
        shareId,
        campaignId: campaignData.id,
        campaignName: campaignData.name,
        analyticsData,
        createdAt: new Date().toISOString(),
        expiresAt,
      };

      const response = await fetch('/api/shared-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create shared report');
      }

      const result = await response.json();

      const baseUrl = window.location.origin;
      const shareUrl = `${baseUrl}/campaign-analytics-report/${campaignData.id}`;

      // Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareStatus('copied');

        // Reset status after 3 seconds
        setTimeout(() => {
          setShareStatus('idle');
        }, 3000);
      } catch (clipboardError) {
        console.warn('Clipboard copy failed:', clipboardError);
        // Fallback: select and copy using document.execCommand
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);

        setShareStatus('copied');
        setTimeout(() => {
          setShareStatus('idle');
        }, 3000);
      }
    } catch (error) {
      console.error('Error sharing report:', error);
      setShareStatus('idle');
      // You can add a toast notification here if you have a toast system
      alert(
        `Failed to generate share link: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleExportPDF = async () => {
    if (!exportContentRef.current) {
      console.error('Export content ref not found');
      return;
    }

    setIsExporting(true);

    try {
      const filename = generateExportFilename(campaignData?.name, 'Analytics');

      const result = await exportToPDF(exportContentRef.current, {
        filename,
        quality: 0.8,
        format: 'a4',
        orientation: 'portrait',
        margin: 5,
        backgroundColor: '#f8fafc',
        cropWhitespace: true,
      });

      if (result.success) {
        console.log('PDF export completed successfully:', result.filename);
      } else {
        console.error('PDF export failed:', result.error);
        alert(result.error || 'Failed to export PDF');
      }
    } catch (error) {
      console.error('Unexpected error during PDF export:', error);
      alert('An unexpected error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintExport = async () => {
    if (!exportContentRef.current) {
      console.error('Export content ref not found');
      return;
    }

    try {
      const title = `Campaign Analytics - ${campaignData?.name || 'Export'}`;
      const result = await exportToPrint(exportContentRef.current, title);

      if (!result.success) {
        console.error('Print export failed:', result.error);
        alert(result.error || 'Failed to export via print');
      }
    } catch (error) {
      console.error('Print export error:', error);
      alert('Print export failed');
    }
  };

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!campaignData?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log(
          '🔍 AnalyticsView: Fetching content posts for campaign:',
          campaignData.id,
        );
        const results = await getContentPostsByCampaign(
          campaignData.id,
          1,
          200,
        ); // 👈 NEW API CALL
        console.log(
          '✅ AnalyticsView: Fetched content posts:',
          results?.length,
        );
        setVideoResults(results);
        
          // NEW: Fetch campaign influencers for YouTube subscriber lookup
          let influencersMap = new Map<string, CampaignListMember>();
          
          // Check if any YouTube content exists
          const hasYouTubeContent = results.some((video) => 
            video.content_url?.toLowerCase().includes('youtube.com') ||
            video.content_url?.toLowerCase().includes('youtu.be')
          );

          if (hasYouTubeContent && campaignData.campaign_lists?.[0]?.id) {
            try {
              const listId = campaignData.campaign_lists[0].id;
              console.log('📺 AnalyticsView: Fetching campaign influencers for YouTube...');
              const influencersResponse = await getAllCampaignInfluencers(listId);
              
              if (influencersResponse?.success && influencersResponse.influencers) {
                influencersResponse.influencers.forEach((inf) => {
                  if (inf.id) {
                    influencersMap.set(inf.id, inf as CampaignListMember);
                  }
                  // Also map by username for fallback
                  const username = (inf.social_account as any)?.account_handle?.toLowerCase();
                  if (username) {
                    influencersMap.set(`username_${username}`, inf as CampaignListMember);
                  }
                });
                setCampaignInfluencersMap(influencersMap);
                console.log('✅ AnalyticsView: Loaded campaign influencers:', influencersMap.size);
              }
            } catch (err) {
              console.warn('⚠️ AnalyticsView: Could not fetch campaign influencers:', err);
            }
          }
          
        // Group videos by influencer to ensure unique counting
        const influencerGroups = new Map<string, VideoResult[]>();
        results.forEach((video) => {
          const key = video.influencer_username.toLowerCase();
          if (!influencerGroups.has(key)) {
            influencerGroups.set(key, []);
          }
          influencerGroups.get(key)!.push(video);
        });

        // Initialize totals - using exact same logic as table
        let totalLikes = 0;
        let totalComments = 0;
        let totalViews = 0; // This will be based on videoPlayCount for consistency
        let totalShares = 0;
        let totalFollowers = 0;

        // NEW: Track collaboration price metrics exactly as displayed
        let totalCollaborationPrice = 0;
        let postsWithCollaborationPrice = 0;

        // For calculating average engagement rate
        let totalEngagementRate = 0;
        let influencersWithFollowers = 0;

        // Enhanced date processing for posts by date chart
        const postDateMap = new Map<
          string,
          {
            count: number;
            views: number;
            posts: Array<{
              influencerName: string;
              username: string;
              avatar: string;
              views: number;
              likes: number;
              comments: number;
              shares: number;
            }>;
          }
        >();

        const influencerPerformanceData: Array<{
          name: string;
          username: string;
          avatar: string;
          clicks: number;
          isVerified: boolean;
          totalPosts: number;
          totalLikes: number;
          totalComments: number;
          totalViews: number;
          totalVideoPlayCount: number; // UPDATED: Added for consistency with PublishedResults
          totalShares: number;
          avgEngagementRate: number;
          totalEngagement: number;
          followers: number;
          platform: ContentPlatform | null;
          subscriberCount: number;                 // ADD THIS
        }> = [];

        const allPostsData: Array<{
          id: string;
          influencerName: string;
          username: string;
          avatar: string;
          thumbnail: string;
          contentUrl: string;                    // ADD THIS
          platform: ContentPlatform | null;      // ADD THIS
          likes: number;
          comments: number;
          views: number;
          videoPlayCount: number; // UPDATED: Added videoPlayCount field
          plays: number;
          shares: number;
          engagementRate: number;
          isVerified: boolean;
          postId: string;
          totalEngagement: number;
          postDate: string;
          collaborationPrice: number; // NEW: Added collaboration price
        }> = [];

        // FIXED: Process each post using exact same getPostData logic
        results.forEach((video) => {
          const postDataDetail = getPostData(video);

          // Sum post metrics using exact values from table
          totalLikes += postDataDetail.likes;
          totalComments += postDataDetail.comments;
          // FIXED: Use videoPlayCount exactly as displayed in Views column
          totalViews += postDataDetail.videoPlayCount || postDataDetail.actualViews || 0;
          totalShares += postDataDetail.shares;

          // NEW: Track collaboration prices exactly as displayed
          if (postDataDetail.collaborationPrice > 0) {
            totalCollaborationPrice += postDataDetail.collaborationPrice;
            postsWithCollaborationPrice++;
          }

          const totalEngagement =
            postDataDetail.likes +
            postDataDetail.comments +
            (postDataDetail.shares > 0 ? postDataDetail.shares : 0);
          allPostsData.push({
            id: video.id,
            influencerName: video.full_name || video.influencer_username,
            username: video.influencer_username,
            avatar: postDataDetail.thumbnailUrl,
            thumbnail: postDataDetail.thumbnailUrl,
            contentUrl: video.content_url || '',                           // ADD THIS
            platform: detectPlatformFromUrl(video.content_url || ''),      // ADD THIS
            likes: postDataDetail.likes,
            comments: postDataDetail.comments,
            views: postDataDetail.actualViews,
            videoPlayCount: postDataDetail.videoPlayCount || 0, // UPDATED: Add videoPlayCount field
            plays: postDataDetail.plays,
            shares: postDataDetail.shares,
            engagementRate:
              parseFloat(postDataDetail.engagementRate.replace('%', '')) || 0,
            isVerified: false, // Will be set based on post data
            postId: (() => {
              // Try to get shortcode from post_result_obj.data.shortcode (EnsembleData format)
              if (
                video.post_result_obj?.data &&
                !Array.isArray(video.post_result_obj.data)
              ) {
                return video.post_result_obj.data.shortcode;
              }

              // Try to extract from InsightIQ URL format (data is array)
              if (
                Array.isArray(video.post_result_obj?.data) &&
                video.post_result_obj.data[0]?.url
              ) {
                return extractShortcodeFromUrl(
                  video.post_result_obj.data[0].url,
                );
              }

              // Fallback: try post_id if it looks like a shortcode (not numeric)
              if (video.post_id && !/^\d+$/.test(video.post_id)) {
                return video.post_id;
              }

              return null;
            })(),
            totalEngagement,
            postDate: video.post_created_at || video.created_at,
            collaborationPrice: postDataDetail.collaborationPrice,
          });
        });

        // Process each unique influencer using exact same logic
        influencerGroups.forEach((videos, username) => {
          let influencerTotalLikes = 0;
          let influencerTotalComments = 0;
          let influencerTotalViews = 0;
          let influencerTotalVideoPlayCount = 0;
          let influencerTotalShares = 0;
          let influencerFollowers = 0;
          let influencerAvatar = '';
          let influencerName = '';
          let isVerified = false;
          let influencerPlatform: ContentPlatform | null = null;
          let influencerSubscriberCount = 0;                           // ADD THIS
          let campaignInfluencerId: string | null = null;              // ADD THIS

          videos.forEach((video) => {
            const postDataDetail = getPostData(video);

            influencerTotalLikes += postDataDetail.likes;
            influencerTotalComments += postDataDetail.comments;
            influencerTotalViews += postDataDetail.actualViews;
            influencerTotalVideoPlayCount += postDataDetail.videoPlayCount || 0;
            influencerTotalShares += postDataDetail.shares;

            // Take the maximum followers count for this influencer
            if (postDataDetail.followers > influencerFollowers) {
              influencerFollowers = postDataDetail.followers;
            }

            if (!influencerName || video.full_name) {
              influencerName = video.full_name || video.influencer_username;
              influencerAvatar = postDataDetail.thumbnailUrl;
              // Check verification from post data
              isVerified =
                video.post_result_obj?.data?.owner?.is_verified || false;
            }
            
             // ADD: Detect platform from content URL
            if (!influencerPlatform && video.content_url) {
              influencerPlatform = detectPlatformFromUrl(video.content_url);
            }

            // ADD: Get campaign_influencer_id for subscriber lookup
            if (!campaignInfluencerId && video.campaign_influencer_id) {
              campaignInfluencerId = video.campaign_influencer_id;
            }

            // Enhanced date processing - UPDATED: Use videoPlayCount for views
            let postDate = null;
            if (video.post_created_at) {
              postDate = video.post_created_at;
            } else if (video.created_at) {
              postDate = video.created_at;
            }

            const postViews =
              postDataDetail.videoPlayCount || postDataDetail.actualViews;
            if (postDate && postViews > 0) {
              try {
                const dateKey = new Date(postDate).toISOString().split('T')[0];
                const existing = postDateMap.get(dateKey) || {
                  count: 0,
                  views: 0,
                  posts: [],
                };

                postDateMap.set(dateKey, {
                  count: existing.count + 1,
                  views: existing.views + postViews,
                  posts: [
                    ...existing.posts,
                    {
                      influencerName:
                        video.full_name || video.influencer_username,
                      username: video.influencer_username,
                      avatar: postDataDetail.thumbnailUrl,
                      views: postViews,
                      likes: postDataDetail.likes,
                      comments: postDataDetail.comments,
                      shares: postDataDetail.shares,
                    },
                  ],
                });
              } catch (dateError) {
                console.warn('Invalid date for video:', video.id, postDate);
              }
            }
          });

          // ADD: Lookup subscriber count for YouTube influencers
          if (influencerPlatform === 'youtube') {
            // Method 1: Lookup by campaign_influencer_id
            if (campaignInfluencerId && influencersMap.has(campaignInfluencerId)) {
              const campaignInfluencer = influencersMap.get(campaignInfluencerId)!;
              influencerSubscriberCount = 
                campaignInfluencer.social_account?.subscribers_count ||
                (campaignInfluencer.social_account?.additional_metrics as any)?.subscriber_count ||
                0;
            }
            
            // Method 2: Fallback - lookup by username
            if (influencerSubscriberCount === 0) {
              const usernameKey = `username_${username}`;
              if (influencersMap.has(usernameKey)) {
                const campaignInfluencer = influencersMap.get(usernameKey)!;
                influencerSubscriberCount = 
                  campaignInfluencer.social_account?.subscribers_count ||
                  (campaignInfluencer.social_account?.additional_metrics as any)?.subscriber_count ||
                  0;
              }
            }

            // Update followers to subscriber count for YouTube
            if (influencerSubscriberCount > 0) {
              influencerFollowers = influencerSubscriberCount;
            }
            
            console.log(`📺 YouTube @${username}: ${influencerSubscriberCount.toLocaleString()} subscribers`);
          }
          
          // Add unique influencer followers to total
          totalFollowers += influencerFollowers;

          // Calculate individual influencer engagement rate
          let avgEngagementRate = 0;
          if (influencerFollowers > 0) {
            const influencerTotalEngagement =
              influencerTotalLikes +
              influencerTotalComments +
              (influencerTotalShares > 0 ? influencerTotalShares : 0);
            avgEngagementRate =
              (influencerTotalEngagement / influencerFollowers) * 100;
            totalEngagementRate += avgEngagementRate;
            influencersWithFollowers++;
          }

          const influencerTotalEngagement =
            influencerTotalLikes +
            influencerTotalComments +
            (influencerTotalShares > 0 ? influencerTotalShares : 0);
          const influencerClicks = Math.round(influencerTotalEngagement * 0.03);

          influencerPerformanceData.push({
            name: influencerName,
            username: username,
            avatar: influencerAvatar,
            clicks: influencerClicks,
            isVerified,
            totalPosts: videos.length,
            totalLikes: influencerTotalLikes,
            totalComments: influencerTotalComments,
            totalViews: influencerTotalViews,
            totalVideoPlayCount: influencerTotalVideoPlayCount,
            totalShares: influencerTotalShares,
            avgEngagementRate,
            totalEngagement: influencerTotalEngagement,
            followers: influencerFollowers,
            platform: influencerPlatform,           // ADD THIS
            subscriberCount: influencerSubscriberCount,  // ADD THIS
          });
        });

        // Convert posts by date to array with proper sorting and cumulative calculation
        const sortedPostsByDate = Array.from(postDateMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          );

        let cumulativeViews = 0;
        const postsByDate = sortedPostsByDate.map((item) => {
          cumulativeViews += item.views;
          return {
            date: item.date,
            count: item.count,
            views: item.views,
            cumulativeViews: cumulativeViews,
            posts: item.posts,
          };
        });

        const topPerformers = influencerPerformanceData.sort(
          (a, b) => b.totalEngagement - a.totalEngagement,
        );

        const topPosts = allPostsData.sort(
          (a, b) => b.totalEngagement - a.totalEngagement,
        );

        const totalPosts = results.length;
        const totalInfluencers = influencerGroups.size;

        // Calculate average engagement rate using exact same formula as table
        const totalEngagement =
          totalLikes + totalComments + (totalShares > 0 ? totalShares : 0);
        const averageEngagementRate =
          totalFollowers > 0 ? (totalEngagement / totalFollowers) * 100 : 0;

        // Calculate clicks (typically 2-5% of total engagement)
        const totalClicks = Math.round(totalEngagement * 0.03);

        // Calculate impressions using industry standard formulas
        const videoPosts = results.filter((video) => {
          const postData = getPostData(video);
          return (postData.videoPlayCount || postData.actualViews) > 0;
        }).length;
        const photoPosts = totalPosts - videoPosts;

        // FIXED: Use totalViews (which is now based on videoPlayCount) for impression calculation
        const videoImpressions = Math.round(totalViews * 1.3);
        const photoImpressions = Math.round(
          (photoPosts * totalFollowers * 0.4) / totalInfluencers,
        );
        const totalImpressions = videoImpressions + photoImpressions;

        // Calculate reach (unique users who saw content) - FIXED: Use new totalViews
        const estimatedReach = Math.round(totalImpressions * 0.65);
        const totalReach = Math.min(
          estimatedReach,
          Math.max(totalViews, totalImpressions * 0.5),
        );

        // Calculate new metrics - FIXED: Use new totalViews for ratios
        const viewsToFollowersRatio =
          totalFollowers > 0 ? (totalViews / totalFollowers) * 100 : 0;
        const commentToViewsRatio =
          totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0;

        // FIXED: Calculate CPV and CPE based on actual collaboration prices as displayed
        const newTotalCPV =
          totalViews > 0 ? totalCollaborationPrice / totalViews : 0;
        const newTotalCPE =
          totalEngagement > 0 ? totalCollaborationPrice / totalEngagement : 0;

        setAnalyticsData({
          totalClicks,
          totalImpressions,
          totalReach,
          totalLikes,
          totalComments,
          totalViews, // This is now based on videoPlayCount for consistency with table
          totalShares,
          totalFollowers,
          totalPosts,
          totalInfluencers,
          averageEngagementRate,
          totalCPV: newTotalCPV, // FIXED: Use calculation based on actual displayed collaboration prices
          totalCPE: newTotalCPE, // FIXED: Use calculation based on actual displayed collaboration prices
          viewsToFollowersRatio,
          commentToViewsRatio,
          postsByDate,
          topPerformers,
          topPosts,
        });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [campaignData?.id]);

  // Rest of the component remains the same...
  if (isLoading) {
    return (
      <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
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
            <p className="text-gray-500">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const { posts: paginatedPosts, totalPosts, totalPages } = getPaginatedPosts();

  return (
    <div className="pt-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
      {/* Header with Back and Export Buttons */}
      <div className="no-print flex items-center justify-between mb-8 px-6">
        <button
          onClick={onBack}
          className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all duration-200 font-medium"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </button>

        <div className="flex items-center space-x-3">
          {/* Button container with Sentiment Analysis and other action buttons */}
          <div className="bg-white rounded-full flex overflow-hidden shadow-sm border border-gray-200 relative">

            {/* Separator */}
            <div className="w-px bg-gray-200" />

            <button
              onClick={handleShareReport}
              disabled={isSharing || !campaignData?.id}
              className={`flex items-center px-6 py-1.5 text-sm font-medium transition-all duration-200 hover:ring-2 hover:ring-sky-400 hover:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                isSharing ||
                shareStatus === 'copying' ||
                shareStatus === 'copied'
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg'
                  : 'bg-gradient-to-r from-sky-300 to-sky-200 text-sky-700 shadow-md'
              }`}
            >
              {isSharing ? (
                <>
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
                      d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Generating...
                </>
              ) : shareStatus === 'copying' ? (
                <>
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
                      d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Copying...
                </>
              ) : shareStatus === 'copied' ? (
                <>
                  <svg
                    className="w-4 h-4 mr-2 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  URL Copied!
                </>
              ) : (
                <>
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
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                  Share Report
                </>
              )}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`flex items-center px-6 py-1.5 text-sm font-medium transition-all duration-200 hover:ring-2 hover:ring-sky-400 hover:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                isExporting
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-sky-200 to-sky-300 text-sky-700 shadow-md'
              }`}
            >
              {isExporting ? (
                <>
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
                      d="M4 12a8 8 0 818-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Exporting...
                </>
              ) : (
                <>
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
                </>
              )}
            </button>

            {/* Tooltip for share status */}
            {shareStatus === 'copied' && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                Link copied to clipboard!
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content to be exported */}
      <div
        ref={exportContentRef}
        className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-6"
      >
        {/* PDF-only header section */}
        <div className="print-only">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Campaign Analytics
          </h1>
          {campaignData && (
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="mr-3">Campaign: {campaignData.name}</span>
              <span>•</span>
              <span className="ml-3">
                Date: {new Date().toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="border-b border-gray-200 mb-6"></div>
        </div>

        {/* Campaign Info Banner */}
        {campaignData && (
          <div className="mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {campaignData.name}
                  </h2>
                </div>
                <div className="text-right ml-8">
                  <div className="relative group">
                    <p className="text-sm text-gray-500">Total Influencers</p>
                    <p className="text-2xl font-bold text-pink-600">
                      {analyticsData.totalInfluencers}
                    </p>
                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                      <div className="relative">
                        Total number of unique influencers participating in this
                        campaign. Each creator is counted only once, regardless
                        of how many posts they published.
                        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Overview Section */}
        <PerformanceOverview analyticsData={analyticsData} />

        {/* Detailed Insights Section */}
        <DetailedInsights analyticsData={analyticsData} />

        {/* Top Performing Posts Section - UPDATED with smaller cards and pagination */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Top Performing Posts
              </h3>
              <div className="flex items-center space-x-4">
                {/* Posts Filters */}
                <div className="flex items-center space-x-2 no-print">
                  <select
                    value={postsFilterBy}
                    onChange={(e) =>
                      handleFilterChange('filter', e.target.value)
                    }
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Posts</option>
                    <option value="high-engagement">High Engagement</option>
                    <option value="high-views">High Views</option>
                  </select>
                  <select
                    value={postsSortBy}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="engagement">Sort by Engagement</option>
                    <option value="views">Sort by Views</option>
                    <option value="likes">Sort by Likes</option>
                    <option value="comments">Sort by Comments</option>
                    <option value="date">Sort by Date</option>
                  </select>

                  {/* Posts per page selector */}
                  <select
                    value={postsPerPage}
                    onChange={(e) => {
                      setPostsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={12}>Show 12</option>
                    <option value={20}>Show 20</option>
                    <option value={30}>Show 30</option>
                    <option value={50}>Show 50</option>
                  </select>
                </div>
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
                  <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      Top performing posts ranked by total engagement. These
                      posts generated the highest interaction rates and can
                      provide insights into what content types resonate best
                      with your target audience.
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* UPDATED: Smaller post cards with 6 columns on large screens */}
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {paginatedPosts.length > 0 ? (
                paginatedPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer"
                    onClick={() => {
                          // Use contentUrl directly for all platforms
                          if (post.contentUrl) {
                            window.open(post.contentUrl, '_blank');
                            return;
                          }
                          
                          // Fallback: try to get URL from videoResults
                          const video = videoResults.find((v) => v.id === post.id);
                          if (video?.content_url) {
                            window.open(video.content_url, '_blank');
                            return;
                          }
                          
                          // Legacy fallback for Instagram shortcode
                          let shortcode = null;
                          if (video) {
                            if (video.post_result_obj?.data && !Array.isArray(video.post_result_obj.data)) {
                              shortcode = video.post_result_obj.data.shortcode;
                            }
                            if (!shortcode && Array.isArray(video.post_result_obj?.data) && video.post_result_obj.data[0]?.url) {
                              shortcode = extractShortcodeFromUrl(video.post_result_obj.data[0].url);
                            }
                            if (!shortcode && video.post_id && !/^\d+$/.test(video.post_id)) {
                              shortcode = video.post_id;
                            }
                          }
                          
                          if (shortcode) {
                            window.open(`https://www.instagram.com/p/${shortcode}/`, '_blank');
                          } else {
                            console.warn('No valid URL found for post redirect');
                          }
                        }}
                  >
                    {/* Post Thumbnail - UPDATED: Smaller aspect ratio */}
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={post.thumbnail}
                        alt={`${post.username} post`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/dummy-image.jpg';
                        }}
                      />

                      {/* Platform indicator - Dynamic based on content URL */}
                      <ThumbnailPlatformIcon
                        platform={post.platform}
                        size="sm"
                        className="absolute top-1 left-1"
                      />

                      {/* Rank badge - UPDATED: Smaller size and adjusted position */}
                      <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-full font-medium text-[10px]">
                        #{(currentPage - 1) * postsPerPage + index + 1}
                      </div>
                    </div>

                    {/* Post Stats - UPDATED: More compact layout */}
                    <div className="p-2">
                      <div className="flex items-center space-x-1 mb-1.5">
                        <img
                          src={post.avatar}
                          alt={post.username}
                          className="w-4 h-4 rounded-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/user/profile-placeholder.png';
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {post.username}
                        </span>
                        {post.isVerified && (
                          <svg
                            className="w-2.5 h-2.5 text-blue-500 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Stats grid - UPDATED: More compact with smaller text */}
                      <div
                        className={`grid gap-0.5 text-[10px] ${post.shares > 0 ? 'grid-cols-2' : 'grid-cols-2'}`}
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
                              {formatNumber(
                                Math.max(0, post.videoPlayCount || post.views),
                              )}
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
                              {formatNumber(post.likes)}
                            </span>
                          </div>
                        </div>
                        {/* Only show additional stats if there's enough space */}
                        {post.comments > 0 && (
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
                                {formatNumber(post.comments)}
                              </span>
                            </div>
                          </div>
                        )}
                        {post.shares > 0 && (
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
                                {formatNumber(post.shares)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">
                    No posts found with current filters
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between no-print">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * postsPerPage + 1} to{' '}
                  {Math.min(currentPage * postsPerPage, totalPosts)} of{' '}
                  {totalPosts} posts
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-2 text-sm rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Influencers Section */}
        <div className="mb-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Top Performing Influencers
              </h3>
              <div className="flex items-center space-x-4">
                {/* Influencers Filters */}
                <div className="flex items-center space-x-2 no-print">
                  <select
                    value={influencersFilterBy}
                    onChange={(e) =>
                      setInfluencersFilterBy(e.target.value as any)
                    }
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Influencers</option>
                    <option value="verified">Verified Only</option>
                    <option value="top-performers">Top Performers</option>
                  </select>
                  <select
                    value={influencersSortBy}
                    onChange={(e) =>
                      setInfluencersSortBy(e.target.value as any)
                    }
                    className="text-xs border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="engagement">Sort by Engagement</option>
                    <option value="views">Sort by Views</option>
                    <option value="followers">Sort by Followers</option>
                    <option value="posts">Sort by Posts</option>
                  </select>
                </div>
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
                  <div className="absolute bottom-full right-0 mb-2 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="relative">
                      All influencers ranked by total engagement (likes +
                      comments + shares). Shows which creators generated the
                      most interaction with their audience and delivered the
                      best performance for your campaign.
                      <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {(() => {
                const filteredAndSortedInfluencers =
                  getFilteredAndSortedInfluencers();
                return filteredAndSortedInfluencers.length > 0 ? (
                  filteredAndSortedInfluencers.map((influencer, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group"
                    >
                      {/* Rank Badge */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          #{index + 1}
                        </div>
                        {influencer.isVerified && (
                          <svg
                            className="w-5 h-5 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>

                      {/* Profile Image */}
                      <div className="relative mb-4">
                        <div className="w-20 h-20 mx-auto relative">
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/user/profile-placeholder.png';
                            }}
                          />
                          {/* Instagram gradient ring */}
                          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-1">
                            <div className="w-full h-full rounded-full bg-white"></div>
                          </div>
                          <img
                            src={influencer.avatar}
                            alt={influencer.name}
                            className="absolute inset-1 w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                '/user/profile-placeholder.png';
                            }}
                          />
                        </div>
                      </div>

                      {/* Influencer Info */}
                      <div className="text-center mb-4">
                        <h4 className="font-bold text-gray-900 mb-1 text-sm">
                          {influencer.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          @{influencer.username}
                        </p>
                      </div>

                      {/* Stats Grid */}
                      <div className="space-y-3">

                        {/* Main metric - Followers/Subscribers */}
                        <div className="bg-white rounded-lg p-3 border border-gray-100">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {formatNumber(
                                            influencer.platform === 'youtube' && (influencer.subscriberCount ?? 0) > 0
                                              ? (influencer.subscriberCount ?? 0)
                                              : influencer.followers
                                          )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Followers
                              {/* {influencer.platform === 'youtube' ? 'Subscribers' : 'Followers'} */}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {/* Engagement */}
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatNumber(influencer.totalEngagement)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Engagement
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            {/* UPDATED: Display totalVideoPlayCount if available, otherwise fall back to totalViews */}
                            <div className="text-sm font-semibold text-gray-900">
                              {formatNumber(
                                Math.max(
                                  0,
                                  influencer.totalVideoPlayCount ||
                                    influencer.totalViews,
                                ),
                              )}
                            </div>
                            <div className="text-xs text-gray-500">Views</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <div className="text-sm font-semibold text-gray-900">
                              {influencer.totalPosts}
                            </div>
                            <div className="text-xs text-gray-500">Posts</div>
                          </div>
                          <div className="bg-white rounded-lg p-2 border border-gray-100 text-center">
                            <div className="text-sm font-semibold text-gray-900">
                              {influencer.avgEngagementRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              Eng Rate
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <p className="text-gray-500">
                      No influencers found with current filters
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;
