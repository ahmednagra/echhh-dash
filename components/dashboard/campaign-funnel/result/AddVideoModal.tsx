// src/components/dashboard/campaign-funnel/result/AddVideoModal.tsx
// ============================================================================
// REFACTORED: Uses centralized types, shared VideoMetricsForm, FB/LinkedIn support
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from 'react-icons/si';
import { Campaign } from '@/types/campaign';
import { ContentPostCreate } from '@/types/content-post';
import { ProcessedInstagramData } from '@/types/user-detailed-info';
import { createContentPost } from '@/services/content-posts';
import { fetchInstagramPostClient } from '@/services/insights-iq/posts/posts.client';
import {
  ContentPlatform,
  detectPlatformFromUrl,
  isValidPlatformUrl,
  getContentPlatformDisplay,
  getPlatformId,
  getWorkPlatformId,
  platformSupportsApiFetch,
  isManualOnlyPlatform,
  DATA_SOURCE_ENDPOINT_IDS,
  PLATFORM_IDS,
} from '@/constants/social-platforms';
import InfluencerDropdown, { SelectedInfluencerData } from './InfluencerDropdown';
import VideoMetricsForm from './VideoMetricsForm';
import {
  VideoMetricsFormData,
  DEFAULT_FORM_DATA,
  calculateEngagementRate,
  getPlatformContentType,
  getPlatformContentFormat,
  getProxiedImageUrl,
  formatNumber,
  extractPlatformPostId,
  buildUnifiedInitialMetadata,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface AddVideoModalProps {
  campaignData: Campaign | null;
  onClose: () => void;
  onSubmit: (videoData: any) => void;
}

interface VideoData {
  url: string;
  title: string;
  description: string;
  influencer: string;
}

type ModalStep = 'input' | 'preview' | 'manual_form' | 'saving';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Determine content type based on platform and URL
 */
const determineContentType = (
  platform: ContentPlatform,
  url: string,
  isVideo: boolean
): 'post' | 'reel' | 'story' | 'video' | 'carousel' | 'shorts' | 'facebook_reel' | 'facebook_video' | 'facebook_post' | 'linkedin_video' | 'linkedin_post' => {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('/shorts/')) return 'shorts';
  if (urlLower.includes('/reel/') || urlLower.includes('/reels/')) {
    return platform === 'facebook' ? 'facebook_reel' : 'reel';
  }
  if (urlLower.includes('/stories/')) return 'story';

  if (isVideo) {
    switch (platform) {
      case 'youtube': return urlLower.includes('shorts') ? 'shorts' : 'video';
      case 'tiktok': return 'video';
      case 'facebook': return 'facebook_video';
      case 'linkedin': return 'linkedin_video';
      default: return 'reel';
    }
  }

  switch (platform) {
    case 'facebook': return 'facebook_post';
    case 'linkedin': return 'linkedin_post';
    default: return 'post';
  }
};

/**
 * Determine content format
 */
const determineContentFormat = (
  url: string,
  isVideo: boolean
): 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'STORY' => {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('/stories/')) return 'STORY';
  if (isVideo) return 'VIDEO';
  return 'IMAGE';
};

/**
 * Transform manual form data to ContentPost format
 * 
 * CRITICAL: Uses buildUnifiedInitialMetadata to ensure manual entries
 * produce the SAME initial_metadata structure as API-fetched entries.
 * This allows backend's _create_snapshot_if_metadata_exists() to work
 * identically for both entry types.
 * 
 * @param formData - Form data from VideoMetricsForm
 * @param campaignId - Campaign UUID
 * @param selectedInfluencer - Campaign influencer UUID
 * @param platform - Detected content platform
 * @returns ContentPostCreate payload ready for API
 */
const transformManualToContentPost = (
  formData: VideoMetricsFormData,
  campaignId: string,
  selectedInfluencer: string,
  platform: ContentPlatform
): ContentPostCreate => {
  // Use centralized function for deterministic post ID extraction
  // This ensures same URL always produces same platform_post_id for duplicate detection
  const platformPostId = extractPlatformPostId(formData.profileUrl, platform);

  const contentType = determineContentType(platform, formData.profileUrl, formData.isVideo);
  const contentFormat = determineContentFormat(formData.profileUrl, formData.isVideo);

  // Build proper URL if needed
  let contentUrl = formData.profileUrl;
  if (contentUrl && !contentUrl.startsWith('http')) {
    switch (platform) {
      case 'youtube':
        contentUrl = `https://www.youtube.com/watch?v=${contentUrl}`;
        break;
      case 'tiktok':
        contentUrl = `https://www.tiktok.com/video/${contentUrl}`;
        break;
      case 'facebook':
        contentUrl = `https://www.facebook.com/videos/${contentUrl}`;
        break;
      case 'linkedin':
        contentUrl = `https://www.linkedin.com/posts/${contentUrl}`;
        break;
      case 'instagram':
      default:
        contentUrl = `https://www.instagram.com/p/${contentUrl}/`;
        break;
    }
  }

  // Build unified initial_metadata using centralized helper
  // This ensures manual entries match API-fetched entries structure
  const initialMetadata = buildUnifiedInitialMetadata({
    // Engagement metrics
    likes: formData.likes || 0,
    comments: formData.comments || 0,
    shares: formData.shares || 0,
    views: formData.views || 0,
    plays: formData.views || 0,  // For video content, plays = views
    saves: 0,
    
    // Influencer info
    username: formData.influencerUsername || '',
    fullName: formData.fullName || '',
    followers: formData.followers || 0,
    isVerified: false,
    
    // Platform info
    platform: platform,
    provider: 'manual',
    
    // Content metadata
    title: formData.title || '',
    caption: formData.description || '',
    mediaUrl: formData.thumbnailUrl || undefined,
    thumbnailUrl: formData.thumbnailUrl || undefined,
    duration: formData.duration || undefined,
    postedAt: formData.postDate || undefined,
  });

  return {
    campaign_id: campaignId,
    campaign_influencer_id: selectedInfluencer,
    platform_id: getPlatformId(platform),
    data_source_endpoint_id: isManualOnlyPlatform(platform)
      ? DATA_SOURCE_ENDPOINT_IDS.MANUAL
      : DATA_SOURCE_ENDPOINT_IDS.INSIGHTIQ,
    platform_post_id: platformPostId,
    content_url: contentUrl,
    content_type: contentType,
    content_format: contentFormat,
    title: formData.title || 'Post',
    caption: formData.description || '',
    media_url: formData.thumbnailUrl || undefined,
    thumbnail_url: formData.thumbnailUrl || undefined,
    duration: formData.duration > 0 ? formData.duration : undefined,
    hashtags: [],
    mentions: [],
    collaborators: [],
    sponsors: [],
    links: [],
    likes_and_views_disabled: false,
    is_pinned: false,
    tracking_status: 'active',
    posted_at: formData.postDate || new Date().toISOString(),
    first_tracked_at: new Date().toISOString(),
    last_tracked_at: new Date().toISOString(),
    // CRITICAL: Uses unified metadata structure
    initial_metadata: initialMetadata,
  };
};

/**
 * Extract hashtags from Instagram data
 */
const extractHashtags = (data: ProcessedInstagramData): string[] => {
  const caption = data.post.caption || '';
  const matches = caption.match(/#\w+/g);
  return matches ? matches.map(tag => tag.slice(1)) : [];
};

/**
 * Extract mentions from Instagram data
 */
const extractMentions = (data: ProcessedInstagramData): string[] => {
  const caption = data.post.caption || '';
  const matches = caption.match(/@\w+/g);
  return matches ? matches.map(mention => mention.slice(1)) : [];
};

// ============================================================================
// PLATFORM ICON COMPONENT
// ============================================================================

interface PlatformIconProps {
  platform: ContentPlatform | null;
  size?: number;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 14 }) => {
  if (!platform) return null;

  switch (platform) {
    case 'instagram': return <SiInstagram size={size} />;
    case 'tiktok': return <SiTiktok size={size} />;
    case 'youtube': return <SiYoutube size={size} />;
    case 'facebook': return <SiFacebook size={size} />;
    case 'linkedin': return <SiLinkedin size={size} />;
    default: return null;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AddVideoModal: React.FC<AddVideoModalProps> = ({
  campaignData,
  onClose,
  onSubmit,
}) => {
  const campaignId = campaignData?.id || '';

  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<VideoData>({
    url: '',
    title: '',
    description: '',
    influencer: '',
  });

  const [manualFormData, setManualFormData] = useState<VideoMetricsFormData>({
    ...DEFAULT_FORM_DATA,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [instagramData, setInstagramData] = useState<ProcessedInstagramData | null>(null);
  const [step, setStep] = useState<ModalStep>('input');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
  const [detectedPlatform, setDetectedPlatform] = useState<ContentPlatform | null>(null);
  const [showInfluencerDropdown, setShowInfluencerDropdown] = useState(true);
  const [selectedInfluencerData, setSelectedInfluencerData] = useState<{
    name: string;
    username: string;
    profilePic: string;
  } | null>(null);
  
  // Success/Error state for API responses
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
    details?: string;
  }>({ type: null, message: '' });

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const platformDisplay = useMemo(() => {
    return detectedPlatform ? getContentPlatformDisplay(detectedPlatform) : null;
  }, [detectedPlatform]);

  const isManualOnly = useMemo(() => {
    return detectedPlatform ? isManualOnlyPlatform(detectedPlatform) : false;
  }, [detectedPlatform]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-detect platform when URL changes
  useEffect(() => {
    if (formData.url.trim()) {
      const platform = detectPlatformFromUrl(formData.url);
      setDetectedPlatform(platform);

      // If manual-only platform detected, pre-populate manual form
      if (platform && isManualOnlyPlatform(platform)) {
        setManualFormData((prev) => ({
          ...prev,
          profileUrl: formData.url,
        }));
      }
    } else {
      setDetectedPlatform(null);
    }
  }, [formData.url]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.url.trim()) {
      newErrors.url = 'Video URL is required';
    } else if (!isValidPlatformUrl(formData.url) && !isValidInstagramCode(formData.url)) {
      newErrors.url = 'Please enter a valid Instagram, TikTok, YouTube, Facebook, or LinkedIn URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return isValidPlatformUrl(string);
    } catch {
      return false;
    }
  };

  const isValidInstagramCode = (string: string): boolean => {
    return /^[a-zA-Z0-9_-]+$/.test(string) && string.length > 5;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = useCallback((field: keyof VideoData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  const handleBack = useCallback(() => {
    if (step === 'manual_form') {
      setStep('input');
      setFetchError(null);
      setErrors({});
    } else if (step === 'preview') {
      setStep('input');
      setInstagramData(null);
      setErrors({});
    }
  }, [step]);

  // Fetch data for API-supported platforms (IG/TikTok/YouTube)
  const fetchPlatformData = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setFetchError(null);

    try {
      console.log(`📡 AddVideoModal: Fetching ${detectedPlatform} data...`);

      let input: { url?: string; code?: string };
      if (isValidUrl(formData.url)) {
        input = { url: formData.url };
      } else {
        input = { code: formData.url };
      }

      const response = await fetchInstagramPostClient({
        ...input,
        platform: detectedPlatform || 'instagram',
        preferredProvider: 'insightiq',
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch post data');
      }

      console.log(`✅ AddVideoModal: ${detectedPlatform} data fetched successfully`);
      setInstagramData(response);
      setStep('preview');

      setFormData((prev) => ({
        ...prev,
        title: response.post.caption || response.post.title || 'Post',
        influencer: response.user.username || response.user.full_name || '',
        description: response.post.caption || '',
      }));
    } catch (error) {
      console.error('AddVideoModal: Error fetching data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post data';
      setFetchError(errorMessage);

      // Pre-populate manual form with available data
      if (formData.url) {
        setManualFormData((prev) => ({
          ...prev,
          profileUrl: formData.url,
          title: formData.title || 'Post',
          description: formData.description || '',
        }));
      }

      setStep('manual_form');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle manual form submission
  const handleManualFormSubmit = async (formData: VideoMetricsFormData) => {
    // ========================================================================
    // VALIDATION: Check all required fields before submission
    // Required by backend: campaign_id, campaign_influencer_id, platform_id,
    //                      data_source_endpoint_id, platform_post_id
    // ========================================================================
    
    const validationErrors: Record<string, string> = {};

    // 1. Validate Influencer Selection (campaign_influencer_id)
    if (!selectedInfluencer || selectedInfluencer.trim() === '') {
      validationErrors.influencer = 'Please select an influencer';
    }

    // 2. Validate URL (required for content_url and platform_post_id extraction)
    if (!formData.profileUrl || formData.profileUrl.trim() === '') {
      validationErrors.profileUrl = 'Video/Post URL is required';
    } else {
      // Validate URL format for the platform
      const platform = detectedPlatform || 'instagram';
      if (!isValidPlatformUrl(formData.profileUrl, platform)) {
        validationErrors.profileUrl = `Please enter a valid ${getContentPlatformDisplay(platform).name} URL`;
      }
    }

    // 3. Validate Username (required for tracking)
    if (!formData.influencerUsername || formData.influencerUsername.trim() === '') {
      validationErrors.influencerUsername = 'Username is required';
    }

    // If there are validation errors, show them and don't proceed
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show first error in status
      const firstError = Object.values(validationErrors)[0];
      setSubmitStatus({
        type: 'error',
        message: 'Missing Required Fields',
        details: firstError,
      });
      return;
    }

    // Clear previous errors and status
    setErrors({});
    setSubmitStatus({ type: null, message: '' });
    setIsLoading(true);
    setStep('saving');

    try {
      console.log('💾 Saving manual content post...');

      const contentPostData = transformManualToContentPost(
        formData,
        campaignId,
        selectedInfluencer,
        detectedPlatform || 'instagram'
      );

      // Log the payload for debugging
      console.log('📤 Payload being sent:', JSON.stringify(contentPostData, null, 2));

      // Validate the transformed data has required fields
      const missingFields: string[] = [];
      if (!contentPostData.campaign_id) missingFields.push('campaign_id');
      if (!contentPostData.campaign_influencer_id) missingFields.push('campaign_influencer_id');
      if (!contentPostData.platform_id) missingFields.push('platform_id');
      if (!contentPostData.data_source_endpoint_id) missingFields.push('data_source_endpoint_id');
      if (!contentPostData.platform_post_id) missingFields.push('platform_post_id');

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const result = await createContentPost(contentPostData);
      console.log('✅ Manual content post saved successfully:', result);

      // Show success message
      setSubmitStatus({
        type: 'success',
        message: 'Video Added Successfully!',
        details: `"${formData.title || 'Post'}" has been added to your campaign.`,
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSubmit(formData);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error saving manual content post:', error);
      
      // Parse error message for user-friendly display
      const errorMessage = error instanceof Error ? error.message : 'Failed to save content post';
      let userFriendlyMessage = 'Failed to Save Video';
      let errorDetails = errorMessage;

      // Handle specific error types
      if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
        userFriendlyMessage = 'Duplicate Post Detected';
        errorDetails = 'This post has already been added to your campaign. Please try a different URL.';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        userFriendlyMessage = 'Resource Not Found';
        if (errorMessage.toLowerCase().includes('endpoint')) {
          errorDetails = 'Manual entry endpoint not configured. Please contact support.';
        } else if (errorMessage.toLowerCase().includes('platform')) {
          errorDetails = 'Platform not recognized. Please check the URL.';
        } else if (errorMessage.toLowerCase().includes('influencer')) {
          errorDetails = 'Selected influencer not found. Please select a different influencer.';
        } else {
          errorDetails = errorMessage;
        }
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'Authentication Error';
        errorDetails = 'Your session may have expired. Please refresh the page and try again.';
      } else if (errorMessage.includes('400')) {
        userFriendlyMessage = 'Invalid Request';
        errorDetails = 'Please check all fields and try again.';
      } else if (errorMessage.includes('500')) {
        userFriendlyMessage = 'Server Error';
        errorDetails = 'Something went wrong on our end. Please try again later.';
      }

      setSubmitStatus({
        type: 'error',
        message: userFriendlyMessage,
        details: errorDetails,
      });
      
      setErrors({
        profileUrl: errorDetails,
      });
      setStep('manual_form');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle preview form submission (API-fetched data)
  const handlePreviewSubmit = async () => {
    if (!selectedInfluencer || selectedInfluencer.trim() === '') {
      setErrors({ influencer: 'Please select an influencer' });
      return;
    }

    if (!instagramData || !instagramData.success) {
      setErrors({ url: 'Please fetch post data first' });
      return;
    }

    setIsLoading(true);
    setStep('saving');
    setSubmitStatus({ type: null, message: '' }); // Reset status

    try {
      console.log('💾 Saving fetched content post...');

      const platform = detectedPlatform || 'instagram';
      const rawData = instagramData.raw_response?.data?.[0];

      // Build unified initial_metadata using centralized helper
      // Spread rawData to preserve full API response, then add structured fields
      const initialMetadata = buildUnifiedInitialMetadata({
        // Engagement metrics from API
        likes: instagramData.post.likes_count || 0,
        comments: instagramData.post.comments_count || 0,
        shares: instagramData.post.shares_count || 0,
        views: instagramData.post.view_counts || 0,
        plays: instagramData.post.play_counts || instagramData.post.view_counts || 0,
        saves: rawData?.engagement?.save_count || 0,
        
        // Influencer info from API
        username: instagramData.user.username || '',
        fullName: instagramData.user.full_name || '',
        followers: instagramData.user.followers_count || 0,
        isVerified: instagramData.user.is_verified || false,
        profileUrl: rawData?.profile?.url || null,
        profileImageUrl: instagramData.user.profile_pic_url || rawData?.profile?.image_url || null,
        
        // Platform info
        platform: platform,
        provider: 'insightiq',
        
        // Content metadata
        title: instagramData.post.title || instagramData.post.caption?.substring(0, 100) || '',
        caption: instagramData.post.caption || '',
        mediaUrl: rawData?.media_url || instagramData.post.display_url || undefined,
        thumbnailUrl: rawData?.thumbnail_url || instagramData.post.thumbnail_src || undefined,
        duration: rawData?.duration || instagramData.post.video_duration || undefined,
        postedAt: rawData?.published_at || instagramData.post.created_at || undefined,
        
        // Preserve full API response for additional data access
        rawData: rawData,
      });
      
      const contentPostData: ContentPostCreate = {
        campaign_id: campaignId,
        campaign_influencer_id: selectedInfluencer,
        platform_id: getPlatformId(platform),
        data_source_endpoint_id: DATA_SOURCE_ENDPOINT_IDS.INSIGHTIQ,
        platform_post_id: instagramData.post.post_id || instagramData.post.shortcode || '',
        content_url: formData.url,
        content_type: determineContentType(platform, formData.url, instagramData.post.is_video || false),
        content_format: determineContentFormat(formData.url, instagramData.post.is_video || false),
        title: formData.title || instagramData.post.title || instagramData.post.caption?.substring(0, 100) || '',
        caption: instagramData.post.caption || formData.description || '',
        media_url: rawData?.media_url || instagramData.post.display_url || undefined,
        thumbnail_url: rawData?.thumbnail_url || instagramData.post.thumbnail_src || undefined,
        duration: rawData?.duration || instagramData.post.video_duration || undefined,
        hashtags: extractHashtags(instagramData),
        mentions: extractMentions(instagramData),
        collaborators: [],
        sponsors: [],
        links: [],
        likes_and_views_disabled: rawData?.likes_and_views_disabled ?? false,
        is_pinned: rawData?.is_pinned ?? false,
        tracking_status: 'active',
        posted_at: rawData?.published_at || instagramData.post.created_at || new Date().toISOString(),
        first_tracked_at: new Date().toISOString(),
        last_tracked_at: new Date().toISOString(),
      //   initial_metadata: {
      //     ...rawData,
      //     engagement_snapshot: {
      //       likes: instagramData.post.likes_count || 0,
      //       comments: instagramData.post.comments_count || 0,
      //       views: instagramData.post.view_counts || 0,
      //       plays: instagramData.post.play_counts || 0,
      //       shares: instagramData.post.shares_count || 0,
      //     },
      //     platform_info: {
      //       platform: platform,
      //       provider: 'insightiq',
      //     },
      //     user_snapshot: {
      //       username: instagramData.user.username || null,
      //       full_name: instagramData.user.full_name || null,
      //       followers_count: instagramData.user.followers_count || 0,
      //       is_verified: instagramData.user.is_verified || false,
      //     },
      //   },
      // };
        initial_metadata: initialMetadata,
      };


      const result = await createContentPost(contentPostData);
      console.log('✅ Content post saved successfully:', result);

      // Show success message
      setSubmitStatus({
        type: 'success',
        message: 'Video Added Successfully!',
        details: `"${formData.title || 'Post'}" has been added to your campaign.`,
      });

      // Auto-close after 2 seconds
      setTimeout(() => {
        onSubmit(formData);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('❌ Error saving content post:', error);
      
      // Parse error message for user-friendly display
      const errorMessage = error instanceof Error ? error.message : 'Failed to save content post';
      let userFriendlyMessage = 'Failed to Save Video';
      let errorDetails = errorMessage;

      // Handle specific error types
      if (errorMessage.includes('409') || errorMessage.includes('already exists')) {
        userFriendlyMessage = 'Duplicate Post Detected';
        errorDetails = 'This post has already been added to your campaign. Please try a different URL.';
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        userFriendlyMessage = 'Authentication Error';
        errorDetails = 'Your session may have expired. Please refresh the page and try again.';
      } else if (errorMessage.includes('400')) {
        userFriendlyMessage = 'Invalid Request';
        errorDetails = 'Please check the video URL and try again.';
      } else if (errorMessage.includes('500')) {
        userFriendlyMessage = 'Server Error';
        errorDetails = 'Something went wrong on our end. Please try again later.';
      }

      setSubmitStatus({
        type: 'error',
        message: userFriendlyMessage,
        details: errorDetails,
      });
      setStep('preview'); // Go back to preview to show error
      setIsLoading(false);
      return;
    }
    
    setIsLoading(false);
  };

  // Main form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'input') {
      // Check if manual-only platform
      if (detectedPlatform && isManualOnlyPlatform(detectedPlatform)) {
        // Route directly to manual form
        setManualFormData((prev) => ({
          ...prev,
          profileUrl: formData.url,
        }));
        setStep('manual_form');
        return;
      }

      // API-supported platform - fetch data
      await fetchPlatformData();
      return;
    }

    if (step === 'preview') {
      await handlePreviewSubmit();
      return;
    }
  };

  // ============================================================================
  // RENDER: Input Step
  // ============================================================================

  const renderInputStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
          Video/Post URL *
        </label>
        <input
          type="text"
          id="videoUrl"
          value={formData.url}
          onChange={(e) => handleInputChange('url', e.target.value)}
          placeholder="Paste URL from Instagram, TikTok, YouTube, Facebook, or LinkedIn"
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
            errors.url
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
          }`}
        />
        {errors.url && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.url}
          </p>
        )}

        {/* Platform Detection Badge */}
        {detectedPlatform && platformDisplay && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Detected:</span>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${platformDisplay.bgClass}`}>
              <PlatformIcon platform={detectedPlatform} size={12} />
              <span>{platformDisplay.name}</span>
              {isManualOnly && (
                <span className="ml-1 text-xs opacity-75">(Manual Entry)</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry Notice for FB/LinkedIn */}
      {isManualOnly && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Manual Entry Required</p>
            <p className="text-sm text-blue-800 mt-1">
              {detectedPlatform === 'facebook' ? 'Facebook' : 'LinkedIn'} posts require manual data entry. 
              Click "Continue" to enter the post metrics manually.
            </p>
          </div>
        </div>
      )}

      {/* Info box for API-supported platforms */}
      {!isManualOnly && (
        <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Supported Platforms:</p>
            <ul className="text-sm text-blue-800 mt-1 space-y-1">
              <li className="flex items-center gap-1">
                <SiInstagram size={12} /> Instagram
              </li>
              <li className="flex items-center gap-1">
                <SiTiktok size={12} /> TikTok
              </li>
              <li className="flex items-center gap-1">
                <SiYoutube size={12} /> YouTube
              </li>
              <li className="flex items-center gap-1">
                <SiFacebook size={12} /> Facebook
              </li>
              <li className="flex items-center gap-1">
                <SiLinkedin size={12} /> LinkedIn
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // RENDER: Preview Step (for API-fetched data)
  // ============================================================================

  const renderPreviewStep = () => {
    if (!instagramData) return null;

    return (
      <div className="space-y-2 sm:space-y-3">
        {/* Success/Error Status Banner */}
        {submitStatus.type && (
          <div
            className={`rounded-lg p-3 sm:p-4 border-2 ${
              submitStatus.type === 'success'
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {submitStatus.type === 'success' ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm sm:text-base font-semibold ${
                  submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {submitStatus.message}
                </h4>
                {submitStatus.details && (
                  <p className={`text-xs sm:text-sm mt-1 ${
                    submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {submitStatus.details}
                  </p>
                )}
                {submitStatus.type === 'success' && (
                  <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                    <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Closing automatically...
                  </p>
                )}
                {submitStatus.type === 'error' && (
                  <button
                    type="button"
                    onClick={() => setSubmitStatus({ type: null, message: '' })}
                    className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline"
                  >
                    Dismiss and try again
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instagram Post Data Section - Responsive */}
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple-200">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mr-1.5 sm:mr-2 flex-shrink-0">
                <SiInstagram className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
              </div>
              <span className="truncate">{detectedPlatform ? getContentPlatformDisplay(detectedPlatform).name : 'Instagram'} Post</span>
            </h4>
            <span className="bg-green-100 text-green-800 text-[8px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              ✓ Fetched
            </span>
          </div>

          {/* User Profile - Responsive */}
          <div className="bg-white rounded-lg p-2 mb-2 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <img
                  src={getProxiedImageUrl(instagramData.user.profile_pic_url || '')}
                  alt={instagramData.user.username || 'Profile'}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-[11px] sm:text-xs flex items-center gap-1 truncate">
                    <span className="truncate">{instagramData.user.full_name || instagramData.user.username}</span>
                    {instagramData.user.is_verified && (
                      <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">@{instagramData.user.username}</p>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3 text-center flex-shrink-0">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">{formatNumber(instagramData.user.followers_count || 0)}</p>
                  <p className="text-[8px] sm:text-[10px] text-gray-500">Followers</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-semibold text-gray-900">{formatNumber(instagramData.user.posts_count || 0)}</p>
                  <p className="text-[10px] text-gray-500">Posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Post Content - Responsive Grid */}
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex gap-2">
              {/* Thumbnail */}
              {(instagramData.post.thumbnail_src || instagramData.post.display_url) && (
                <img
                  src={getProxiedImageUrl(instagramData.post.thumbnail_src || instagramData.post.display_url || '')}
                  alt="Post"
                  className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
              )}
              {/* Metrics Grid - 2x2 on mobile, 4x1 on larger screens */}
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
                <div className="text-center p-1 sm:p-1.5 bg-red-50 rounded">
                  <p className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    <span className="hidden sm:inline">Likes</span>
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">{formatNumber(instagramData.post.likes_count || 0)}</p>
                </div>
                <div className="text-center p-1 sm:p-1.5 bg-blue-50 rounded">
                  <p className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="hidden sm:inline">Comments</span>
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">{formatNumber(instagramData.post.comments_count || 0)}</p>
                </div>
                <div className="text-center p-1 sm:p-1.5 bg-yellow-50 rounded">
                  <p className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span className="hidden sm:inline">Shares</span>
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">{formatNumber(instagramData.post.shares_count || 0)}</p>
                </div>
                <div className="text-center p-1 sm:p-1.5 bg-green-50 rounded">
                  <p className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span className="hidden sm:inline">Views</span>
                  </p>
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">{formatNumber(instagramData.post.view_counts || instagramData.post.play_counts || 0)}</p>
                </div>
              </div>
            </div>
            {/* Caption - Hidden on very small screens */}
            {instagramData.post.caption && (
              <div className="mt-2 pt-2 border-t border-gray-100 hidden sm:block">
                <p className="text-[10px] text-gray-600 line-clamp-2">{instagramData.post.caption}</p>
              </div>
            )}
          </div>
        </div>

        {/* Influencer Selection - Responsive */}
        {campaignData && (
          showInfluencerDropdown || !selectedInfluencer ? (
            <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
              <InfluencerDropdown
                campaignData={campaignData}
                value={selectedInfluencer}
                onChange={(campaignInfluencerId) => {
                  setSelectedInfluencer(campaignInfluencerId);
                  if (errors.influencer) {
                    setErrors((prev) => ({ ...prev, influencer: '' }));
                  }
                }}
                onInfluencerSelect={(influencerData) => {
                  if (influencerData) {
                    setSelectedInfluencerData({
                      name: influencerData.name,
                      username: influencerData.username,
                      profilePic: influencerData.profilePicUrl,
                    });
                    handleInputChange('influencer', influencerData.name);
                    setShowInfluencerDropdown(false);
                  } else {
                    setSelectedInfluencerData(null);
                  }
                }}
                error={errors.influencer}
                videoResult={instagramData}
                renderMode="dropdown"
                platform={detectedPlatform}
              />
            </div>
          ) : (
            /* Compact Single-Row Display - Responsive */
            <div className="bg-green-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-green-200 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <img
                  src={getProxiedImageUrl(selectedInfluencerData?.profilePic || instagramData?.user?.profile_pic_url || '')}
                  alt="Influencer"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">
                    {selectedInfluencerData?.name || instagramData?.user?.full_name || 'Selected'}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 truncate block">
                    @{selectedInfluencerData?.username || instagramData?.user?.username || 'unknown'}
                  </span>
                </div>
                <span className="bg-green-100 text-green-800 text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0 hidden xs:inline-flex">
                  🎯 Matched
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowInfluencerDropdown(true)}
                className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
              >
                Change
              </button>
            </div>
          )
        )}
        {errors.influencer && !showInfluencerDropdown && (
          <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.influencer}</p>
        )}

        {/* Form Fields - Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="sm:col-span-2">
            <label htmlFor="videoTitle" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
              Video Title *
            </label>
            <input
              type="text"
              id="videoTitle"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter video title"
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="influencer" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
              Influencer Name *
            </label>
            <input
              type="text"
              id="influencer"
              value={formData.influencer}
              onChange={(e) => handleInputChange('influencer', e.target.value)}
              placeholder="Influencer name"
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
              Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={2}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Notes or description"
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm resize-none"
            />
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDER: Manual Form Step
  // ============================================================================

  const renderManualFormStep = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Success/Error Status Banner */}
      {submitStatus.type && (
        <div
          className={`rounded-lg p-3 sm:p-4 border-2 ${
            submitStatus.type === 'success'
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {submitStatus.type === 'success' ? (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm sm:text-base font-semibold ${
                submitStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {submitStatus.message}
              </h4>
              {submitStatus.details && (
                <p className={`text-xs sm:text-sm mt-1 ${
                  submitStatus.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {submitStatus.details}
                </p>
              )}
              {submitStatus.type === 'success' && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Closing automatically...
                </p>
              )}
              {submitStatus.type === 'error' && (
                <button
                  type="button"
                  onClick={() => setSubmitStatus({ type: null, message: '' })}
                  className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline"
                >
                  Dismiss and try again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Platform Badge */}
      {detectedPlatform && (
        <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
            {detectedPlatform === 'linkedin' ? (
              <SiLinkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A66C2]" />
            ) : (
              <SiFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" />
            )}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-900">
              {getContentPlatformDisplay(detectedPlatform).name}
            </p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-gray-200 text-gray-600">
              Manual Entry
            </span>
          </div>
        </div>
      )}

      {/* Influencer Selection - Collapsible like Preview Step */}
      {campaignData && (
        showInfluencerDropdown || !selectedInfluencer ? (
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
            <InfluencerDropdown
              campaignData={campaignData}
              value={selectedInfluencer}
              onChange={(campaignInfluencerId) => {
                setSelectedInfluencer(campaignInfluencerId);
                if (errors.influencer) {
                  setErrors((prev) => ({ ...prev, influencer: '' }));
                }
              }}
              onInfluencerSelect={(influencerData) => {
                if (influencerData) {
                  setSelectedInfluencerData({
                    name: influencerData.name,
                    username: influencerData.username,
                    profilePic: influencerData.profilePicUrl,
                  });
                  // Update manual form data with influencer info
                  setManualFormData((prev) => ({
                    ...prev,
                    influencerUsername: influencerData.username,
                    fullName: influencerData.name,
                  }));
                  // Auto-collapse after selection
                  setShowInfluencerDropdown(false);
                }
              }}
              error={errors.influencer}
              renderMode="dropdown"
              platform={detectedPlatform}
            />
          </div>
        ) : (
          /* Compact Single-Row Display when influencer is selected */
          <div className="bg-green-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-green-200 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <img
                src={getProxiedImageUrl(selectedInfluencerData?.profilePic || '')}
                alt="Influencer"
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">
                  {selectedInfluencerData?.name || 'Selected'}
                </span>
                <span className="text-[10px] sm:text-xs text-gray-500 truncate block">
                  @{selectedInfluencerData?.username || 'unknown'}
                </span>
              </div>
              <span className="bg-green-100 text-green-800 text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0">
                ✓ Selected
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfluencerDropdown(true)}
              className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
            >
              Change
            </button>
          </div>
        )
      )}
      {errors.influencer && !showInfluencerDropdown && (
        <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.influencer}</p>
      )}

      {/* Shared Video Metrics Form */}
      <VideoMetricsForm
        mode="manual_add"
        platform={detectedPlatform}
        initialData={manualFormData}
        onSubmit={handleManualFormSubmit}
        onCancel={onClose}
        onBack={handleBack}
        isLoading={isLoading}
        fetchError={fetchError}
        externalErrors={errors}
      />
    </div>
  );

  // ============================================================================
  // RENDER: Saving Step (Loading and Success Animation)
  // ============================================================================

  const renderSavingStep = () => {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
        {submitStatus.type === 'success' ? (
          // Success Animation
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {submitStatus.message}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {submitStatus.details}
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Closing automatically...
            </div>
          </div>
        ) : (
          // Loading Animation
          <div className="text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-pink-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Saving Your Video
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we add this post to your campaign...
            </p>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // RENDER: Modal Header
  // ============================================================================

  const getHeaderTitle = () => {
    if (submitStatus.type === 'success') return '✓ Success!';
    if (submitStatus.type === 'error' && step === 'preview') return '⚠ Error';
    
    switch (step) {
      case 'input': return 'Add New Video';
      case 'manual_form': return 'Manual Entry';
      case 'preview': return 'Review & Save';
      case 'saving': return 'Saving...';
      default: return 'Add Video';
    }
  };

  const getHeaderSubtitle = () => {
    if (submitStatus.type === 'success') return 'Video added to your campaign';
    if (submitStatus.type === 'error' && step === 'preview') return 'Please review the error below';
    
    switch (step) {
      case 'input': return 'Enter a URL from any supported platform';
      case 'manual_form': return `Enter ${detectedPlatform || 'post'} metrics manually`;
      case 'preview': return 'Review the fetched data and save';
      case 'saving': return 'Processing your request...';
      default: return '';
    }
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Responsive */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{getHeaderTitle()}</h3>
              <p className="text-[10px] sm:text-xs text-gray-600 truncate">{getHeaderSubtitle()}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 sm:p-1.5 rounded-full hover:bg-white/50 flex-shrink-0"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Responsive padding */}
        <div className="max-h-[calc(90vh-100px)] sm:max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Saving Step */}
          {step === 'saving' ? (
            <div className="p-3 sm:p-4">
              {renderSavingStep()}
            </div>
          ) : step === 'manual_form' ? (
            /* Manual Form Step - VideoMetricsForm handles its own form */
            <div className="p-3 sm:p-4">
              {renderManualFormStep()}
            </div>
          ) : (
            /* Input and Preview Steps - Use parent form */
            <form onSubmit={handleSubmit} className="p-3 sm:p-4">
              {step === 'input' && renderInputStep()}
              {step === 'preview' && renderPreviewStep()}

              {/* Action Buttons - Responsive - Hide when success */}
              {submitStatus.type !== 'success' && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200">
                  {step === 'preview' && (
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={isLoading}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center"
                    >
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium text-xs sm:text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center shadow-lg"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="hidden sm:inline">{step === 'input' ? 'Processing...' : 'Saving...'}</span>
                        <span className="sm:hidden">{step === 'input' ? 'Wait...' : 'Save...'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {step === 'input' ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        )}
                      </svg>
                      <span className="hidden sm:inline">{step === 'input' ? (isManualOnly ? 'Continue' : 'Fetch Data') : 'Save Video'}</span>
                      <span className="sm:hidden">{step === 'input' ? (isManualOnly ? 'Next' : 'Fetch') : 'Save'}</span>
                    </>
                  )}
                </button>
              </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddVideoModal;
