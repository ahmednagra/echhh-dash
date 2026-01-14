// // src/components/dashboard/campaign-funnel/result/AddVideoModal.tsx
//
// 'use client';
//
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from 'react-icons/si';
// import { Campaign } from '@/types/campaign';
// import { ContentPostCreate } from '@/types/content-post';
// import { ProcessedInstagramData } from '@/types/user-detailed-info';
// import { createContentPost } from '@/services/content-posts';
// import { fetchInstagramPostClient } from '@/services/insights-iq/posts/posts.client';
// import {
//   ContentPlatform,
//   detectPlatformFromUrl,
//   isValidPlatformUrl,
//   getContentPlatformDisplay,
//   isManualOnlyPlatform,
// } from '@/constants/social-platforms';
// import {
//   usePlatformConfig,
//   getDynamicPlatformIdAsync,
//   getDynamicDataSourceEndpointIdAsync,
// } from '@/hooks/queries/usePlatformConfig';
//
// import { useDataSourceEndpointId } from '@/hooks/queries/useExternalApiEndpoints'
// // ============================================================================
// import InfluencerDropdown from './InfluencerDropdown';
// import VideoMetricsForm from './VideoMetricsForm';
// import {
//   VideoMetricsFormData,
//   DEFAULT_FORM_DATA,
//   getProxiedImageUrl,
//   formatNumber,
//   extractPlatformPostId,
//   buildUnifiedInitialMetadata,
// } from './types';
//
// // ============================================================================
// // TYPES
// // ============================================================================
//
// interface AddVideoModalProps {
//   campaignData: Campaign | null;
//   onClose: () => void;
//   onSubmit: (videoData: VideoData) => void;
// }
//
// interface VideoData {
//   url: string;
//   title: string;
//   description: string;
//   influencer: string;
// }
//
// interface SelectedInfluencerInfo {
//   name: string;
//   username: string;
//   profilePic: string;
// }
//
// interface SubmitStatus {
//   type: 'success' | 'error' | null;
//   message: string;
//   details?: string;
// }
//
// type ModalStep = 'input' | 'preview' | 'manual_form' | 'saving';
//
// type ContentType =
//   | 'post' | 'reel' | 'story' | 'video' | 'carousel' | 'shorts'
//   | 'facebook_reel' | 'facebook_video' | 'facebook_post'
//   | 'linkedin_video' | 'linkedin_post';
//
// type ContentFormat = 'VIDEO' | 'IMAGE' | 'CAROUSEL' | 'STORY';
//
// // ============================================================================
// // CONSTANTS
// // ============================================================================
//
// const INITIAL_VIDEO_DATA: VideoData = {
//   url: '',
//   title: '',
//   description: '',
//   influencer: '',
// };
//
// const INITIAL_SUBMIT_STATUS: SubmitStatus = { type: null, message: '' };
//
// const AUTO_CLOSE_DELAY_MS = 2000;
//
// // ============================================================================
// // HELPER FUNCTIONS
// // ============================================================================
//
// /**
//  * Determine content type based on platform and URL
//  */
// const determineContentType = (
//   platform: ContentPlatform,
//   url: string,
//   isVideo: boolean
// ): ContentType => {
//   const urlLower = url.toLowerCase();
//
//   if (urlLower.includes('/shorts/')) return 'shorts';
//   if (urlLower.includes('/reel/') || urlLower.includes('/reels/')) {
//     return platform === 'facebook' ? 'facebook_reel' : 'reel';
//   }
//   if (urlLower.includes('/stories/')) return 'story';
//
//   if (isVideo) {
//     const videoTypeMap: Record<ContentPlatform, ContentType> = {
//       youtube: urlLower.includes('shorts') ? 'shorts' : 'video',
//       tiktok: 'video',
//       facebook: 'facebook_video',
//       linkedin: 'linkedin_video',
//       instagram: 'reel',
//     };
//     return videoTypeMap[platform] || 'reel';
//   }
//
//   const postTypeMap: Record<ContentPlatform, ContentType> = {
//     facebook: 'facebook_post',
//     linkedin: 'linkedin_post',
//     instagram: 'post',
//     tiktok: 'post',
//     youtube: 'post',
//   };
//   return postTypeMap[platform] || 'post';
// };
//
// /**
//  * Determine content format based on URL and video flag
//  */
// const determineContentFormat = (url: string, isVideo: boolean): ContentFormat => {
//   const urlLower = url.toLowerCase();
//   if (urlLower.includes('/stories/')) return 'STORY';
//   if (isVideo) return 'VIDEO';
//   return 'IMAGE';
// };
//
// /**
//  * Build full content URL from shortcode/ID if needed
//  */
// const buildContentUrl = (url: string, platform: ContentPlatform): string => {
//   if (url.startsWith('http')) return url;
//
//   const urlBuilders: Record<ContentPlatform, (id: string) => string> = {
//     youtube: (id) => `https://www.youtube.com/watch?v=${id}`,
//     tiktok: (id) => `https://www.tiktok.com/video/${id}`,
//     facebook: (id) => `https://www.facebook.com/videos/${id}`,
//     linkedin: (id) => `https://www.linkedin.com/posts/${id}`,
//     instagram: (id) => `https://www.instagram.com/p/${id}/`,
//   };
//
//   return urlBuilders[platform]?.(url) || url;
// };
//
// /**
//  * Extract hashtags from caption text
//  */
// const extractHashtags = (data: ProcessedInstagramData): string[] => {
//   const caption = data.post.caption || '';
//   const matches = caption.match(/#\w+/g);
//   return matches ? matches.map(tag => tag.slice(1)) : [];
// };
//
// /**
//  * Extract mentions from caption text
//  */
// const extractMentions = (data: ProcessedInstagramData): string[] => {
//   const caption = data.post.caption || '';
//   const matches = caption.match(/@\w+/g);
//   return matches ? matches.map(mention => mention.slice(1)) : [];
// };
//
// /**
//  * Parse API error into user-friendly message
//  */
// const parseApiError = (error: unknown): { message: string; details: string } => {
//   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
//
//   const errorMappings: Array<{ pattern: RegExp; message: string; details: string }> = [
//     {
//       pattern: /409|already exists/i,
//       message: 'Duplicate Post Detected',
//       details: 'This post has already been added to your campaign. Please try a different URL.',
//     },
//     {
//       pattern: /404.*endpoint/i,
//       message: 'Resource Not Found',
//       details: 'Manual entry endpoint not configured. Please contact support.',
//     },
//     {
//       pattern: /404.*platform/i,
//       message: 'Resource Not Found',
//       details: 'Platform not recognized. Please check the URL.',
//     },
//     {
//       pattern: /404.*influencer/i,
//       message: 'Resource Not Found',
//       details: 'Selected influencer not found. Please select a different influencer.',
//     },
//     {
//       pattern: /404|not found/i,
//       message: 'Resource Not Found',
//       details: errorMessage,
//     },
//     {
//       pattern: /401|unauthorized/i,
//       message: 'Authentication Error',
//       details: 'Your session may have expired. Please refresh the page and try again.',
//     },
//     {
//       pattern: /400/,
//       message: 'Invalid Request',
//       details: 'Please check all fields and try again.',
//     },
//     {
//       pattern: /500/,
//       message: 'Server Error',
//       details: 'Something went wrong on our end. Please try again later.',
//     },
//   ];
//
//   for (const mapping of errorMappings) {
//     if (mapping.pattern.test(errorMessage)) {
//       return { message: mapping.message, details: mapping.details };
//     }
//   }
//
//   return { message: 'Failed to Save Video', details: errorMessage };
// };
//
// /**
//  * Validate Instagram shortcode format
//  */
// const isValidInstagramCode = (value: string): boolean => {
//   return /^[a-zA-Z0-9_-]+$/.test(value) && value.length > 5;
// };
//
// /**
//  * Validate URL format
//  */
// const isValidUrl = (value: string): boolean => {
//   try {
//     new URL(value);
//     return isValidPlatformUrl(value);
//   } catch {
//     return false;
//   }
// };
//
// // ============================================================================
// // PLATFORM ICON COMPONENT
// // ============================================================================
//
// interface PlatformIconProps {
//   platform: ContentPlatform | null;
//   size?: number;
// }
//
// const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 14 }) => {
//   if (!platform) return null;
//
//   const iconMap: Record<ContentPlatform, React.ReactNode> = {
//     instagram: <SiInstagram size={size} />,
//     tiktok: <SiTiktok size={size} />,
//     youtube: <SiYoutube size={size} />,
//     facebook: <SiFacebook size={size} />,
//     linkedin: <SiLinkedin size={size} />,
//   };
//
//   return <>{iconMap[platform]}</>;
// };
//
// // ============================================================================
// // STATUS BANNER COMPONENT (DRY - Used in Preview & Manual Form)
// // ============================================================================
//
// interface StatusBannerProps {
//   status: SubmitStatus;
//   onDismiss: () => void;
// }
//
// const StatusBanner: React.FC<StatusBannerProps> = ({ status, onDismiss }) => {
//   if (!status.type) return null;
//
//   const isSuccess = status.type === 'success';
//
//   return (
//     <div
//       className={`rounded-lg p-3 sm:p-4 border-2 ${
//         isSuccess ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
//       }`}
//     >
//       <div className="flex items-start gap-3">
//         <div
//           className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
//             isSuccess ? 'bg-green-100' : 'bg-red-100'
//           }`}
//         >
//           <svg
//             className={`w-6 h-6 sm:w-7 sm:h-7 ${isSuccess ? 'text-green-600' : 'text-red-600'}`}
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d={isSuccess ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'}
//             />
//           </svg>
//         </div>
//         <div className="flex-1 min-w-0">
//           <h4
//             className={`text-sm sm:text-base font-semibold ${
//               isSuccess ? 'text-green-800' : 'text-red-800'
//             }`}
//           >
//             {status.message}
//           </h4>
//           {status.details && (
//             <p
//               className={`text-xs sm:text-sm mt-1 ${
//                 isSuccess ? 'text-green-700' : 'text-red-700'
//               }`}
//             >
//               {status.details}
//             </p>
//           )}
//           {isSuccess && (
//             <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
//               <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
//                 />
//               </svg>
//               Closing automatically...
//             </p>
//           )}
//           {!isSuccess && (
//             <button
//               type="button"
//               onClick={onDismiss}
//               className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline"
//             >
//               Dismiss and try again
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
//
// // ============================================================================
// // INFLUENCER DISPLAY COMPONENT (DRY - Used in Preview & Manual Form)
// // ============================================================================
//
// interface InfluencerCompactDisplayProps {
//   influencerData: SelectedInfluencerInfo | null;
//   fallbackData?: { profile_pic_url?: string; full_name?: string; username?: string };
//   onChangeClick: () => void;
// }
//
// const InfluencerCompactDisplay: React.FC<InfluencerCompactDisplayProps> = ({
//                                                                              influencerData,
//                                                                              fallbackData,
//                                                                              onChangeClick,
//                                                                            }) => (
//   <div className="bg-green-50 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-green-200 flex items-center justify-between gap-2">
//     <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 flex-1">
//       <svg
//         className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 flex-shrink-0"
//         fill="none"
//         stroke="currentColor"
//         viewBox="0 0 24 24"
//       >
//         <path
//           strokeLinecap="round"
//           strokeLinejoin="round"
//           strokeWidth={2}
//           d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
//         />
//       </svg>
//       <img
//         src={getProxiedImageUrl(influencerData?.profilePic || fallbackData?.profile_pic_url || '')}
//         alt="Influencer"
//         className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
//         onError={(e) => {
//           (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
//         }}
//       />
//       <div className="min-w-0 flex-1">
//         <span className="text-xs sm:text-sm font-medium text-gray-900 truncate block">
//           {influencerData?.name || fallbackData?.full_name || 'Selected'}
//         </span>
//         <span className="text-[10px] sm:text-xs text-gray-500 truncate block">
//           @{influencerData?.username || fallbackData?.username || 'unknown'}
//         </span>
//       </div>
//       <span className="bg-green-100 text-green-800 text-[8px] sm:text-[10px] font-medium px-1 sm:px-1.5 py-0.5 rounded-full flex-shrink-0">
//         ✓ Selected
//       </span>
//     </div>
//     <button
//       type="button"
//       onClick={onChangeClick}
//       className="text-[10px] sm:text-xs text-blue-600 hover:text-blue-700 font-medium flex-shrink-0"
//     >
//       Change
//     </button>
//   </div>
// );
//
// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================
//
// const AddVideoModal: React.FC<AddVideoModalProps> = ({
//                                                        campaignData,
//                                                        onClose,
//                                                        onSubmit,
//                                                      }) => {
//   const campaignId = campaignData?.id || '';
//
//   // ============================================================================
//   // CHANGED: React Query hook replaces manual state + useEffect initialization
//   // ============================================================================
//   const {
//     isInitialized: isPlatformConfigReady,
//     error: platformConfigError,
//   } = usePlatformConfig();
//   // ============================================================================
//
//   // ============================================================================
//   // STATE
//   // ============================================================================
//
//   const [formData, setFormData] = useState<VideoData>(INITIAL_VIDEO_DATA);
//   const [manualFormData, setManualFormData] = useState<VideoMetricsFormData>({
//     ...DEFAULT_FORM_DATA,
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   // REMOVED: const [isPlatformConfigReady, setIsPlatformConfigReady] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [instagramData, setInstagramData] = useState<ProcessedInstagramData | null>(null);
//   const [step, setStep] = useState<ModalStep>('input');
//   const [fetchError, setFetchError] = useState<string | null>(null);
//   const [selectedInfluencer, setSelectedInfluencer] = useState<string>('');
//   const [detectedPlatform, setDetectedPlatform] = useState<ContentPlatform | null>(null);
//   const [showInfluencerDropdown, setShowInfluencerDropdown] = useState(true);
//   const [selectedInfluencerData, setSelectedInfluencerData] = useState<SelectedInfluencerInfo | null>(null);
//   const [submitStatus, setSubmitStatus] = useState<SubmitStatus>(INITIAL_SUBMIT_STATUS);
//
//   // ============================================================================
//   // MEMOIZED VALUES
//   // ============================================================================
//
//   const platformDisplay = useMemo(() => {
//     return detectedPlatform ? getContentPlatformDisplay(detectedPlatform) : null;
//   }, [detectedPlatform]);
//
//   const isManualOnly = useMemo(() => {
//     return detectedPlatform ? isManualOnlyPlatform(detectedPlatform) : false;
//   }, [detectedPlatform]);
//
//   // ============================================================================
//   // EFFECTS
//   // ============================================================================
//
//   // CHANGED: Handle platform config error from React Query
//   useEffect(() => {
//     if (platformConfigError) {
//       console.error('❌ AddVideoModal: Platform config error:', platformConfigError);
//       setErrors((prev) => ({
//         ...prev,
//         platform: 'Failed to load platform configuration. Please refresh the page.',
//       }));
//     }
//   }, [platformConfigError]);
//
//   // Log when platform config is ready
//   useEffect(() => {
//     if (isPlatformConfigReady) {
//       console.log('✅ AddVideoModal: Platform config ready');
//     }
//   }, [isPlatformConfigReady]);
//
//   // Auto-detect platform when URL changes
//   useEffect(() => {
//     if (formData.url.trim()) {
//       const platform = detectPlatformFromUrl(formData.url);
//       setDetectedPlatform(platform);
//
//       if (platform && isManualOnlyPlatform(platform)) {
//         setManualFormData((prev) => ({
//           ...prev,
//           profileUrl: formData.url,
//         }));
//       }
//     } else {
//       setDetectedPlatform(null);
//     }
//   }, [formData.url]);
//
//   // ============================================================================
//   // VALIDATION
//   // ============================================================================
//
//   const validateForm = useCallback((): boolean => {
//     const newErrors: Record<string, string> = {};
//
//     if (!formData.url.trim()) {
//       newErrors.url = 'Video URL is required';
//     } else if (!isValidPlatformUrl(formData.url) && !isValidInstagramCode(formData.url)) {
//       newErrors.url = 'Please enter a valid Instagram, TikTok, YouTube, Facebook, or LinkedIn URL';
//     }
//
//     if (!isPlatformConfigReady) {
//       newErrors.platform = 'Platform configuration is loading. Please wait.';
//     }
//
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   }, [formData.url, isPlatformConfigReady]);
//
//   // ============================================================================
//   // HANDLERS
//   // ============================================================================
//
//   const handleInputChange = useCallback(
//     (field: keyof VideoData, value: string | number) => {
//       setFormData((prev) => ({ ...prev, [field]: value }));
//       if (errors[field]) {
//         setErrors((prev) => ({ ...prev, [field]: '' }));
//       }
//     },
//     [errors]
//   );
//
//   const handleBack = useCallback(() => {
//     if (step === 'manual_form') {
//       setStep('input');
//       setFetchError(null);
//       setErrors({});
//     } else if (step === 'preview') {
//       setStep('input');
//       setInstagramData(null);
//       setErrors({});
//     }
//   }, [step]);
//
//   const dismissStatus = useCallback(() => {
//     setSubmitStatus(INITIAL_SUBMIT_STATUS);
//   }, []);
//
//   /**
//    * Transform manual form data to ContentPost format (async for dynamic IDs)
//    * CHANGED: Uses getDynamicPlatformIdAsync and getDynamicDataSourceEndpointIdAsync
//    */
//   const transformManualToContentPost = async (
//     data: VideoMetricsFormData,
//     platform: ContentPlatform
//   ): Promise<ContentPostCreate> => {
//     const [platformId, dataSourceEndpointId] = await Promise.all([
//       getDynamicPlatformIdAsync(platform),
//       getDynamicDataSourceEndpointIdAsync(isManualOnlyPlatform(platform) ? 'MANUAL' : 'INSIGHTIQ'),
//     ]);
//
//     const platformPostId = extractPlatformPostId(data.profileUrl, platform);
//     const contentUrl = buildContentUrl(data.profileUrl, platform);
//     const contentType = determineContentType(platform, data.profileUrl, data.isVideo);
//     const contentFormat = determineContentFormat(data.profileUrl, data.isVideo);
//
//     const initialMetadata = buildUnifiedInitialMetadata({
//       likes: data.likes || 0,
//       comments: data.comments || 0,
//       shares: data.shares || 0,
//       views: data.views || 0,
//       plays: data.views || 0,
//       saves: 0,
//       username: data.influencerUsername || '',
//       fullName: data.fullName || '',
//       followers: data.followers || 0,
//       isVerified: false,
//       platform,
//       provider: 'manual',
//       title: data.title || '',
//       caption: data.description || '',
//       mediaUrl: data.thumbnailUrl || undefined,
//       thumbnailUrl: data.thumbnailUrl || undefined,
//       duration: data.duration || undefined,
//       postedAt: data.postDate || undefined,
//     });
//
//     return {
//       campaign_id: campaignId,
//       campaign_influencer_id: selectedInfluencer,
//       platform_id: platformId,
//       data_source_endpoint_id: dataSourceEndpointId,
//       platform_post_id: platformPostId,
//       content_url: contentUrl,
//       content_type: contentType,
//       content_format: contentFormat,
//       title: data.title || 'Post',
//       caption: data.description || '',
//       media_url: data.thumbnailUrl || undefined,
//       thumbnail_url: data.thumbnailUrl || undefined,
//       duration: data.duration > 0 ? data.duration : undefined,
//       hashtags: [],
//       mentions: [],
//       collaborators: [],
//       sponsors: [],
//       links: [],
//       likes_and_views_disabled: false,
//       is_pinned: false,
//       tracking_status: 'active',
//       posted_at: data.postDate || new Date().toISOString(),
//       first_tracked_at: new Date().toISOString(),
//       last_tracked_at: new Date().toISOString(),
//       initial_metadata: initialMetadata,
//     };
//   };
//
//   /**
//    * Transform API-fetched data to ContentPost format (async for dynamic IDs)
//    * CHANGED: Uses getDynamicPlatformIdAsync and getDynamicDataSourceEndpointIdAsync
//    */
//   const transformFetchedToContentPost = async (
//     apiData: ProcessedInstagramData,
//     platform: ContentPlatform
//   ): Promise<ContentPostCreate> => {
//     const [platformId, dataSourceEndpointId] = await Promise.all([
//       getDynamicPlatformIdAsync(platform),
//       getDynamicDataSourceEndpointIdAsync('INSIGHTIQ'),
//     ]);
//
//     const rawData = apiData.raw_response?.data?.[0];
//
//     const initialMetadata = buildUnifiedInitialMetadata({
//       likes: apiData.post.likes_count || 0,
//       comments: apiData.post.comments_count || 0,
//       shares: apiData.post.shares_count || 0,
//       views: apiData.post.view_counts || 0,
//       plays: apiData.post.play_counts || apiData.post.view_counts || 0,
//       saves: rawData?.engagement?.save_count || 0,
//       username: apiData.user.username || '',
//       fullName: apiData.user.full_name || '',
//       followers: apiData.user.followers_count || 0,
//       isVerified: apiData.user.is_verified || false,
//       profileUrl: rawData?.profile?.url || null,
//       profileImageUrl: apiData.user.profile_pic_url || rawData?.profile?.image_url || null,
//       platform,
//       provider: 'insightiq',
//       title: apiData.post.title || apiData.post.caption?.substring(0, 100) || '',
//       caption: apiData.post.caption || '',
//       mediaUrl: rawData?.media_url || apiData.post.display_url || undefined,
//       thumbnailUrl: rawData?.thumbnail_url || apiData.post.thumbnail_src || undefined,
//       duration: rawData?.duration || apiData.post.video_duration || undefined,
//       postedAt: rawData?.published_at || apiData.post.created_at || undefined,
//       rawData,
//     });
//
//     return {
//       campaign_id: campaignId,
//       campaign_influencer_id: selectedInfluencer,
//       platform_id: platformId,
//       data_source_endpoint_id: dataSourceEndpointId,
//       platform_post_id: apiData.post.post_id || apiData.post.shortcode || '',
//       content_url: formData.url,
//       content_type: determineContentType(platform, formData.url, apiData.post.is_video || false),
//       content_format: determineContentFormat(formData.url, apiData.post.is_video || false),
//       title: formData.title || apiData.post.title || apiData.post.caption?.substring(0, 100) || '',
//       caption: apiData.post.caption || formData.description || '',
//       media_url: rawData?.media_url || apiData.post.display_url || undefined,
//       thumbnail_url: rawData?.thumbnail_url || apiData.post.thumbnail_src || undefined,
//       duration: rawData?.duration || apiData.post.video_duration || undefined,
//       hashtags: extractHashtags(apiData),
//       mentions: extractMentions(apiData),
//       collaborators: [],
//       sponsors: [],
//       links: [],
//       likes_and_views_disabled: rawData?.likes_and_views_disabled ?? false,
//       is_pinned: rawData?.is_pinned ?? false,
//       tracking_status: 'active',
//       posted_at: rawData?.published_at || apiData.post.created_at || new Date().toISOString(),
//       first_tracked_at: new Date().toISOString(),
//       last_tracked_at: new Date().toISOString(),
//       initial_metadata: initialMetadata,
//     };
//   };
//
//   /**
//    * Fetch data for API-supported platforms
//    */
//   const fetchPlatformData = async () => {
//     if (!validateForm()) return;
//
//     setIsLoading(true);
//     setFetchError(null);
//
//     try {
//       console.log(`📡 AddVideoModal: Fetching ${detectedPlatform} data...`);
//
//       const input = isValidUrl(formData.url)
//         ? { url: formData.url }
//         : { code: formData.url };
//
//       const response = await fetchInstagramPostClient({
//         ...input,
//         platform: detectedPlatform || 'instagram',
//         preferredProvider: 'insightiq',
//       });
//
//       if (!response.success) {
//         throw new Error(response.message || 'Failed to fetch post data');
//       }
//
//       console.log(`✅ AddVideoModal: ${detectedPlatform} data fetched`);
//       setInstagramData(response);
//       setStep('preview');
//
//       setFormData((prev) => ({
//         ...prev,
//         title: response.post.caption || response.post.title || 'Post',
//         influencer: response.user.username || response.user.full_name || '',
//         description: response.post.caption || '',
//       }));
//     } catch (error) {
//       console.error('AddVideoModal: Error fetching data:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Failed to fetch post data';
//       setFetchError(errorMessage);
//
//       setManualFormData((prev) => ({
//         ...prev,
//         profileUrl: formData.url,
//         title: formData.title || 'Post',
//         description: formData.description || '',
//       }));
//
//       setStep('manual_form');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   /**
//    * Handle successful submission
//    */
//   const handleSuccessfulSubmit = useCallback(
//     (title: string) => {
//       setSubmitStatus({
//         type: 'success',
//         message: 'Video Added Successfully!',
//         details: `"${title}" has been added to your campaign.`,
//       });
//
//       setTimeout(() => {
//         onSubmit(formData);
//         onClose();
//       }, AUTO_CLOSE_DELAY_MS);
//     },
//     [formData, onSubmit, onClose]
//   );
//
//   /**
//    * Handle manual form submission
//    */
//   const handleManualFormSubmit = async (data: VideoMetricsFormData) => {
//     const validationErrors: Record<string, string> = {};
//
//     if (!selectedInfluencer?.trim()) {
//       validationErrors.influencer = 'Please select an influencer';
//     }
//
//     if (!data.profileUrl?.trim()) {
//       validationErrors.profileUrl = 'Video/Post URL is required';
//     } else {
//       const platform = detectedPlatform || 'instagram';
//       if (!isValidPlatformUrl(data.profileUrl, platform)) {
//         validationErrors.profileUrl = `Please enter a valid ${getContentPlatformDisplay(platform).name} URL`;
//       }
//     }
//
//     if (!data.influencerUsername?.trim()) {
//       validationErrors.influencerUsername = 'Username is required';
//     }
//
//     if (Object.keys(validationErrors).length > 0) {
//       setErrors(validationErrors);
//       setSubmitStatus({
//         type: 'error',
//         message: 'Missing Required Fields',
//         details: Object.values(validationErrors)[0],
//       });
//       return;
//     }
//
//     setErrors({});
//     setSubmitStatus(INITIAL_SUBMIT_STATUS);
//     setIsLoading(true);
//     setStep('saving');
//
//     try {
//       console.log('💾 Saving manual content post...');
//
//       const contentPostData = await transformManualToContentPost(
//         data,
//         detectedPlatform || 'instagram'
//       );
//
//       const missingFields = ['campaign_id', 'campaign_influencer_id', 'platform_id', 'data_source_endpoint_id', 'platform_post_id']
//         .filter((field) => !contentPostData[field as keyof ContentPostCreate]);
//
//       if (missingFields.length > 0) {
//         throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
//       }
//
//       const result = await createContentPost(contentPostData);
//       console.log('✅ Manual content post saved:', result);
//
//       handleSuccessfulSubmit(data.title || 'Post');
//     } catch (error) {
//       console.error('❌ Error saving manual content post:', error);
//
//       const { message, details } = parseApiError(error);
//       setSubmitStatus({ type: 'error', message, details });
//       setErrors({ profileUrl: details });
//       setStep('manual_form');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   /**
//    * Handle preview form submission (API-fetched data)
//    */
//   const handlePreviewSubmit = async () => {
//     if (!selectedInfluencer?.trim()) {
//       setErrors({ influencer: 'Please select an influencer' });
//       return;
//     }
//
//     if (!instagramData?.success) {
//       setErrors({ url: 'Please fetch post data first' });
//       return;
//     }
//
//     setIsLoading(true);
//     setStep('saving');
//     setSubmitStatus(INITIAL_SUBMIT_STATUS);
//
//     try {
//       console.log('💾 Saving fetched content post...');
//
//       const contentPostData = await transformFetchedToContentPost(
//         instagramData,
//         detectedPlatform || 'instagram'
//       );
//
//       const result = await createContentPost(contentPostData);
//       console.log('✅ Content post saved:', result);
//
//       handleSuccessfulSubmit(formData.title || 'Post');
//     } catch (error) {
//       console.error('❌ Error saving content post:', error);
//
//       const { message, details } = parseApiError(error);
//       setSubmitStatus({ type: 'error', message, details });
//       setStep('preview');
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   /**
//    * Main form submit handler
//    */
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     if (step === 'input') {
//       if (detectedPlatform && isManualOnlyPlatform(detectedPlatform)) {
//         setManualFormData((prev) => ({ ...prev, profileUrl: formData.url }));
//         setStep('manual_form');
//         return;
//       }
//       await fetchPlatformData();
//       return;
//     }
//
//     if (step === 'preview') {
//       await handlePreviewSubmit();
//     }
//   };
//
//   /**
//    * Handle influencer selection
//    */
//   const handleInfluencerSelect = useCallback(
//     (influencerData: { name: string; username: string; profilePicUrl: string } | null) => {
//       if (influencerData) {
//         setSelectedInfluencerData({
//           name: influencerData.name,
//           username: influencerData.username,
//           profilePic: influencerData.profilePicUrl,
//         });
//         handleInputChange('influencer', influencerData.name);
//         setManualFormData((prev) => ({
//           ...prev,
//           influencerUsername: influencerData.username,
//           fullName: influencerData.name,
//         }));
//         setShowInfluencerDropdown(false);
//       } else {
//         setSelectedInfluencerData(null);
//       }
//     },
//     [handleInputChange]
//   );
//
//   // ============================================================================
//   // RENDER: Input Step
//   // ============================================================================
//
//   const renderInputStep = () => (
//     <div className="space-y-6">
//       <div>
//         <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-2">
//           Video/Post URL *
//         </label>
//         <input
//           type="text"
//           id="videoUrl"
//           value={formData.url}
//           onChange={(e) => handleInputChange('url', e.target.value)}
//           placeholder="Paste URL from Instagram, TikTok, YouTube, Facebook, or LinkedIn"
//           className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 ${
//             errors.url
//               ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
//               : 'border-gray-300 focus:ring-pink-500 focus:border-pink-500'
//           }`}
//         />
//         {errors.url && (
//           <p className="mt-2 text-sm text-red-600 flex items-center">
//             <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             {errors.url}
//           </p>
//         )}
//
//         {detectedPlatform && platformDisplay && (
//           <div className="mt-3 flex items-center gap-2">
//             <span className="text-sm text-gray-500">Detected:</span>
//             <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${platformDisplay.bgClass}`}>
//               <PlatformIcon platform={detectedPlatform} size={12} />
//               <span>{platformDisplay.name}</span>
//               {isManualOnly && <span className="ml-1 text-xs opacity-75">(Manual Entry)</span>}
//             </div>
//           </div>
//         )}
//       </div>
//
//       {isManualOnly ? (
//         <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
//           <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <div>
//             <p className="text-sm font-medium text-blue-900">Manual Entry Required</p>
//             <p className="text-sm text-blue-800 mt-1">
//               {detectedPlatform === 'facebook' ? 'Facebook' : 'LinkedIn'} posts require manual data entry.
//               Click &quot;Continue&quot; to enter the post metrics manually.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-blue-50 rounded-lg p-4 flex items-start space-x-3">
//           <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//           </svg>
//           <div>
//             <p className="text-sm font-medium text-blue-900">Supported Platforms:</p>
//             <ul className="text-sm text-blue-800 mt-1 space-y-1">
//               {(['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin'] as ContentPlatform[]).map((p) => (
//                 <li key={p} className="flex items-center gap-1">
//                   <PlatformIcon platform={p} size={12} />
//                   {getContentPlatformDisplay(p).name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       )}
//     </div>
//   );
//
//   // ============================================================================
//   // RENDER: Preview Step
//   // ============================================================================
//
//   const renderPreviewStep = () => {
//     if (!instagramData) return null;
//
//     return (
//       <div className="space-y-2 sm:space-y-3">
//         <StatusBanner status={submitStatus} onDismiss={dismissStatus} />
//
//         {/* Platform Post Data Section */}
//         <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple-200">
//           <div className="flex items-center justify-between mb-2">
//             <h4 className="text-xs sm:text-sm font-semibold text-gray-800 flex items-center">
//               <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mr-1.5 sm:mr-2 flex-shrink-0">
//                 <PlatformIcon platform={detectedPlatform || 'instagram'} size={12} />
//               </div>
//               <span className="truncate">
//                 {detectedPlatform ? getContentPlatformDisplay(detectedPlatform).name : 'Instagram'} Post
//               </span>
//             </h4>
//             <span className="bg-green-100 text-green-800 text-[8px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
//               ✓ Fetched
//             </span>
//           </div>
//
//           {/* User Profile */}
//           <div className="bg-white rounded-lg p-2 mb-2 border border-gray-100">
//             <div className="flex items-center justify-between gap-2">
//               <div className="flex items-center space-x-2 min-w-0 flex-1">
//                 <img
//                   src={getProxiedImageUrl(instagramData.user.profile_pic_url || '')}
//                   alt={instagramData.user.username || 'Profile'}
//                   className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
//                   onError={(e) => {
//                     (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
//                   }}
//                 />
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-gray-900 text-[11px] sm:text-xs flex items-center gap-1 truncate">
//                     <span className="truncate">{instagramData.user.full_name || instagramData.user.username}</span>
//                     {instagramData.user.is_verified && (
//                       <svg className="w-3 h-3 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
//                         <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     )}
//                   </p>
//                   <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">@{instagramData.user.username}</p>
//                 </div>
//               </div>
//               <div className="flex gap-2 sm:gap-3 text-center flex-shrink-0">
//                 <div>
//                   <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
//                     {formatNumber(instagramData.user.followers_count || 0)}
//                   </p>
//                   <p className="text-[8px] sm:text-[10px] text-gray-500">Followers</p>
//                 </div>
//                 <div className="hidden sm:block">
//                   <p className="text-xs font-semibold text-gray-900">
//                     {formatNumber(instagramData.user.posts_count || 0)}
//                   </p>
//                   <p className="text-[10px] text-gray-500">Posts</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//
//           {/* Post Metrics */}
//           <div className="bg-white rounded-lg p-2 border border-gray-100">
//             <div className="flex gap-2">
//               {(instagramData.post.thumbnail_src || instagramData.post.display_url) && (
//                 <img
//                   src={getProxiedImageUrl(instagramData.post.thumbnail_src || instagramData.post.display_url || '')}
//                   alt="Post"
//                   className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
//                   onError={(e) => {
//                     (e.target as HTMLImageElement).src = '/user/profile-placeholder.png';
//                   }}
//                 />
//               )}
//               <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-1">
//                 {[
//                   { label: 'Likes', value: instagramData.post.likes_count, color: 'red', icon: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
//                   { label: 'Comments', value: instagramData.post.comments_count, color: 'blue', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
//                   { label: 'Shares', value: instagramData.post.shares_count, color: 'yellow', icon: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z' },
//                   { label: 'Views', value: instagramData.post.view_counts || instagramData.post.play_counts, color: 'green', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
//                 ].map((metric) => (
//                   <div key={metric.label} className={`text-center p-1 sm:p-1.5 bg-${metric.color}-50 rounded`}>
//                     <p className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center gap-0.5">
//                       <svg className={`w-2 h-2 sm:w-2.5 sm:h-2.5 text-${metric.color}-500`} fill={metric.label === 'Likes' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={metric.icon} />
//                       </svg>
//                       <span className="hidden sm:inline">{metric.label}</span>
//                     </p>
//                     <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
//                       {formatNumber(metric.value || 0)}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//             {instagramData.post.caption && (
//               <div className="mt-2 pt-2 border-t border-gray-100 hidden sm:block">
//                 <p className="text-[10px] text-gray-600 line-clamp-2">{instagramData.post.caption}</p>
//               </div>
//             )}
//           </div>
//         </div>
//
//         {/* Influencer Selection */}
//         {campaignData && (
//           showInfluencerDropdown || !selectedInfluencer ? (
//             <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
//               <InfluencerDropdown
//                 campaignData={campaignData}
//                 value={selectedInfluencer}
//                 onChange={(id) => {
//                   setSelectedInfluencer(id);
//                   if (errors.influencer) {
//                     setErrors((prev) => ({ ...prev, influencer: '' }));
//                   }
//                 }}
//                 onInfluencerSelect={handleInfluencerSelect}
//                 error={errors.influencer}
//                 videoResult={instagramData}
//                 renderMode="dropdown"
//                 platform={detectedPlatform}
//               />
//             </div>
//           ) : (
//             <InfluencerCompactDisplay
//               influencerData={selectedInfluencerData}
//               fallbackData={instagramData?.user}
//               onChangeClick={() => setShowInfluencerDropdown(true)}
//             />
//           )
//         )}
//         {errors.influencer && !showInfluencerDropdown && (
//           <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.influencer}</p>
//         )}
//
//         {/* Form Fields */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
//           <div className="sm:col-span-2">
//             <label htmlFor="videoTitle" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
//               Video Title *
//             </label>
//             <input
//               type="text"
//               id="videoTitle"
//               value={formData.title}
//               onChange={(e) => handleInputChange('title', e.target.value)}
//               placeholder="Enter video title"
//               className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm"
//             />
//           </div>
//           <div>
//             <label htmlFor="influencer" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
//               Influencer Name *
//             </label>
//             <input
//               type="text"
//               id="influencer"
//               value={formData.influencer}
//               onChange={(e) => handleInputChange('influencer', e.target.value)}
//               placeholder="Influencer name"
//               className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm"
//             />
//           </div>
//           <div className="sm:col-span-2">
//             <label htmlFor="description" className="block text-[10px] sm:text-xs font-medium text-gray-700 mb-0.5 sm:mb-1">
//               Description <span className="text-gray-400">(Optional)</span>
//             </label>
//             <textarea
//               id="description"
//               rows={2}
//               value={formData.description}
//               onChange={(e) => handleInputChange('description', e.target.value)}
//               placeholder="Notes or description"
//               className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-xs sm:text-sm resize-none"
//             />
//           </div>
//         </div>
//       </div>
//     );
//   };
//
//   // ============================================================================
//   // RENDER: Manual Form Step
//   // ============================================================================
//
//   const renderManualFormStep = () => (
//     <div className="space-y-4 sm:space-y-6">
//       <StatusBanner status={submitStatus} onDismiss={dismissStatus} />
//
//       {/* Platform Badge */}
//       {detectedPlatform && (
//         <div className="flex items-center gap-2 p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
//           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
//             {detectedPlatform === 'linkedin' ? (
//               <SiLinkedin className="w-4 h-4 sm:w-5 sm:h-5 text-[#0A66C2]" />
//             ) : (
//               <SiFacebook className="w-4 h-4 sm:w-5 sm:h-5 text-[#1877F2]" />
//             )}
//           </div>
//           <div>
//             <p className="text-xs sm:text-sm font-medium text-gray-900">
//               {getContentPlatformDisplay(detectedPlatform).name}
//             </p>
//             <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] sm:text-xs font-medium bg-gray-200 text-gray-600">
//               Manual Entry
//             </span>
//           </div>
//         </div>
//       )}
//
//       {/* Influencer Selection */}
//       {campaignData && (
//         showInfluencerDropdown || !selectedInfluencer ? (
//           <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
//             <InfluencerDropdown
//               campaignData={campaignData}
//               value={selectedInfluencer}
//               onChange={(id) => {
//                 setSelectedInfluencer(id);
//                 if (errors.influencer) {
//                   setErrors((prev) => ({ ...prev, influencer: '' }));
//                 }
//               }}
//               onInfluencerSelect={handleInfluencerSelect}
//               error={errors.influencer}
//               renderMode="dropdown"
//               platform={detectedPlatform}
//             />
//           </div>
//         ) : (
//           <InfluencerCompactDisplay
//             influencerData={selectedInfluencerData}
//             onChangeClick={() => setShowInfluencerDropdown(true)}
//           />
//         )
//       )}
//       {errors.influencer && !showInfluencerDropdown && (
//         <p className="text-red-500 text-[10px] sm:text-xs mt-1">{errors.influencer}</p>
//       )}
//
//       <VideoMetricsForm
//         mode="manual_add"
//         platform={detectedPlatform}
//         initialData={manualFormData}
//         onSubmit={handleManualFormSubmit}
//         onCancel={onClose}
//         onBack={handleBack}
//         isLoading={isLoading}
//         fetchError={fetchError}
//         externalErrors={errors}
//       />
//     </div>
//   );
//
//   // ============================================================================
//   // RENDER: Saving Step
//   // ============================================================================
//
//   const renderSavingStep = () => (
//     <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
//       {submitStatus.type === 'success' ? (
//         <div className="text-center">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
//             <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
//             </svg>
//           </div>
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{submitStatus.message}</h3>
//           <p className="text-sm text-gray-600 mb-4">{submitStatus.details}</p>
//           <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
//             <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
//             </svg>
//             Closing automatically...
//           </div>
//         </div>
//       ) : (
//         <div className="text-center">
//           <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
//             <div className="absolute inset-0 rounded-full border-4 border-pink-200" />
//             <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
//             <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
//               <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
//               </svg>
//             </div>
//           </div>
//           <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Saving Your Video</h3>
//           <p className="text-sm text-gray-600">Please wait while we add this post to your campaign...</p>
//         </div>
//       )}
//     </div>
//   );
//
//   // ============================================================================
//   // RENDER: Header Helpers
//   // ============================================================================
//
//   const getHeaderTitle = (): string => {
//     if (submitStatus.type === 'success') return '✓ Success!';
//     if (submitStatus.type === 'error' && step === 'preview') return '⚠ Error';
//
//     const titles: Record<ModalStep, string> = {
//       input: 'Add New Video',
//       manual_form: 'Manual Entry',
//       preview: 'Review & Save',
//       saving: 'Saving...',
//     };
//     return titles[step] || 'Add Video';
//   };
//
//   const getHeaderSubtitle = (): string => {
//     if (submitStatus.type === 'success') return 'Video added to your campaign';
//     if (submitStatus.type === 'error' && step === 'preview') return 'Please review the error below';
//
//     const subtitles: Record<ModalStep, string> = {
//       input: 'Enter a URL from any supported platform',
//       manual_form: `Enter ${detectedPlatform || 'post'} metrics manually`,
//       preview: 'Review the fetched data and save',
//       saving: 'Processing your request...',
//     };
//     return subtitles[step] || '';
//   };
//
//   // ============================================================================
//   // MAIN RENDER
//   // ============================================================================
//
//   return (
//     <div
//       className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4"
//       onClick={onClose}
//     >
//       <div
//         className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
//           <div className="flex items-center space-x-2 sm:space-x-3">
//             <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center flex-shrink-0">
//               <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//               </svg>
//             </div>
//             <div className="min-w-0">
//               <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{getHeaderTitle()}</h3>
//               <p className="text-[10px] sm:text-xs text-gray-600 truncate">{getHeaderSubtitle()}</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 sm:p-1.5 rounded-full hover:bg-white/50 flex-shrink-0"
//             disabled={isLoading}
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//
//         {/* Content */}
//         <div className="max-h-[calc(90vh-100px)] sm:max-h-[calc(85vh-120px)] overflow-y-auto">
//           {step === 'saving' ? (
//             <div className="p-3 sm:p-4">{renderSavingStep()}</div>
//           ) : step === 'manual_form' ? (
//             <div className="p-3 sm:p-4">{renderManualFormStep()}</div>
//           ) : (
//             <form onSubmit={handleSubmit} className="p-3 sm:p-4">
//               {step === 'input' && renderInputStep()}
//               {step === 'preview' && renderPreviewStep()}
//
//               {submitStatus.type !== 'success' && (
//                 <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:space-x-2 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-200">
//                   {step === 'preview' && (
//                     <button
//                       type="button"
//                       onClick={handleBack}
//                       disabled={isLoading}
//                       className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium text-xs sm:text-sm disabled:opacity-50 flex items-center justify-center"
//                     >
//                       <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                       </svg>
//                       Back
//                     </button>
//                   )}
//                   <button
//                     type="button"
//                     onClick={onClose}
//                     disabled={isLoading}
//                     className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium text-xs sm:text-sm disabled:opacity-50"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     type="submit"
//                     disabled={isLoading || !isPlatformConfigReady}
//                     className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center shadow-lg"
//                   >
//                     {isLoading ? (
//                       <>
//                         <svg className="animate-spin -ml-1 mr-1 sm:mr-1.5 h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                         </svg>
//                         <span className="hidden sm:inline">{step === 'input' ? 'Processing...' : 'Saving...'}</span>
//                         <span className="sm:hidden">{step === 'input' ? 'Wait...' : 'Save...'}</span>
//                       </>
//                     ) : (
//                       <>
//                         <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d={step === 'input' ? 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' : 'M5 13l4 4L19 7'}
//                           />
//                         </svg>
//                         <span className="hidden sm:inline">
//                           {step === 'input' ? (isManualOnly ? 'Continue' : 'Fetch Data') : 'Save Video'}
//                         </span>
//                         <span className="sm:hidden">{step === 'input' ? (isManualOnly ? 'Next' : 'Fetch') : 'Save'}</span>
//                       </>
//                     )}
//                   </button>
//                 </div>
//               )}
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default AddVideoModal;



// src/components/dashboard/campaign-funnel/result/AddVideoModal.tsx
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from 'react-icons/si';

// ============================================================================
// IMPORTS FROM PROJECT FILES (DRY - No duplicate definitions)
// ============================================================================

// Types - From @/types/
import type { Campaign } from '@/types/campaign';
import type { ContentPostCreate, ProcessedInstagramData } from '@/types/content-post';

// Services - From @/services/
import { createContentPost } from '@/services/content-posts';
import { fetchInstagramPostClient } from '@/services/insights-iq/posts/posts.client';

// Platform Constants - From @/constants/
import {
  ContentPlatform,
  detectPlatformFromUrl,
  isValidPlatformUrl,
  getContentPlatformDisplay,
  isManualOnlyPlatform,
} from '@/constants/social-platforms';

// React Query Hooks - Dynamic ID Resolution
import {
  usePlatformConfig,
  getDynamicPlatformIdAsync,
  getDynamicDataSourceEndpointIdAsync,
} from '@/hooks/queries/usePlatformConfig';

// Local Components
import InfluencerDropdown from './InfluencerDropdown';
import VideoMetricsForm from './VideoMetricsForm';

// Local Types & Utilities - From ./types.ts (DRY - all shared utilities)
import type { VideoMetricsFormData, InitialMetadataInput } from './types';
import {
  // Existing exports
  DEFAULT_FORM_DATA,
  getProxiedImageUrl,
  formatNumber,
  extractPlatformPostId,
  buildUnifiedInitialMetadata,
  // New exports (add to types.ts from types-additions.ts)
  determineContentType,
  determineContentFormat,
  buildContentUrl,
  extractHashtags,
  extractMentions,
  parseApiError,
  isValidInstagramCode,
} from './types';

// ============================================================================
// MODAL-SPECIFIC TYPES (Only what's unique to this modal)
// ============================================================================

interface AddVideoModalProps {
  campaignData: Campaign | null;
  onClose: () => void;
  onSubmit: (data: { url: string; title: string; description: string; influencer: string }) => void;
}

interface SelectedInfluencerInfo {
  name: string;
  username: string;
  profilePic: string;
}

interface SubmitStatus {
  type: 'success' | 'error' | null;
  message: string;
  details?: string;
}

type ModalStep = 'input' | 'preview' | 'manual_form' | 'saving';

// ============================================================================
// CONSTANTS
// ============================================================================

const INITIAL_FORM = { url: '', title: '', description: '', influencer: '' };
const INITIAL_STATUS: SubmitStatus = { type: null, message: '' };
const AUTO_CLOSE_MS = 2000;

const PLATFORM_ICONS: Record<ContentPlatform, React.ComponentType<{ size?: number }>> = {
  instagram: SiInstagram, tiktok: SiTiktok, youtube: SiYoutube, facebook: SiFacebook, linkedin: SiLinkedin,
};

// ============================================================================
// INLINE COMPONENTS (DRY - Minimal, reusable)
// ============================================================================

const PlatformIcon: React.FC<{ platform: ContentPlatform | null; size?: number }> = ({ platform, size = 14 }) => {
  if (!platform) return null;
  const Icon = PLATFORM_ICONS[platform];
  return Icon ? <Icon size={size} /> : null;
};

const Spinner: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => (
  <svg className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const StatusBanner: React.FC<{ status: SubmitStatus; onDismiss: () => void }> = ({ status, onDismiss }) => {
  if (!status.type) return null;
  const ok = status.type === 'success';
  return (
    <div className={`rounded-lg p-3 border-2 ${ok ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${ok ? 'bg-green-100' : 'bg-red-100'}`}>
          <svg className={`w-6 h-6 ${ok ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ok ? 'M5 13l4 4L19 7' : 'M6 18L18 6M6 6l12 12'} />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-semibold ${ok ? 'text-green-800' : 'text-red-800'}`}>{status.message}</h4>
          {status.details && <p className={`text-xs mt-1 ${ok ? 'text-green-700' : 'text-red-700'}`}>{status.details}</p>}
          {ok ? <p className="text-xs text-green-600 mt-2 flex items-center gap-1"><Spinner size="sm" /> Closing...</p>
            : <button type="button" onClick={onDismiss} className="text-xs text-red-600 hover:text-red-700 font-medium mt-2 underline">Dismiss</button>}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const AddVideoModal: React.FC<AddVideoModalProps> = ({ campaignData, onClose, onSubmit }) => {
  const campaignId = campaignData?.id || '';

  // React Query - Platform config for dynamic ID resolution
  const { isInitialized: configReady, error: configError } = usePlatformConfig();

  // State
  const [form, setForm] = useState(INITIAL_FORM);
  const [manualForm, setManualForm] = useState<VideoMetricsFormData>({ ...DEFAULT_FORM_DATA });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiData, setApiData] = useState<ProcessedInstagramData | null>(null);
  const [step, setStep] = useState<ModalStep>('input');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [influencerId, setInfluencerId] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform | null>(null);
  const [showDropdown, setShowDropdown] = useState(true);
  const [influencerInfo, setInfluencerInfo] = useState<SelectedInfluencerInfo | null>(null);
  const [status, setStatus] = useState<SubmitStatus>(INITIAL_STATUS);

  // Derived
  const platformDisplay = useMemo(() => platform ? getContentPlatformDisplay(platform) : null, [platform]);
  const isManual = useMemo(() => platform ? isManualOnlyPlatform(platform) : false, [platform]);

  // Effects
  useEffect(() => {
    if (configError) setErrors(p => ({ ...p, platform: 'Platform config failed. Refresh page.' }));
  }, [configError]);

  useEffect(() => {
    const url = form.url.trim();
    const detected = url ? detectPlatformFromUrl(url) : null;
    setPlatform(detected);
    if (detected && isManualOnlyPlatform(detected)) setManualForm(p => ({ ...p, profileUrl: url }));
  }, [form.url]);

  // Handlers
  const updateForm = useCallback((field: keyof typeof form, value: string) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  }, [errors]);

  const goBack = useCallback(() => {
    setStep('input');
    setApiData(null);
    setFetchError(null);
    setErrors({});
  }, []);

  const onInfluencerSelect = useCallback((data: { name: string; username: string; profilePicUrl: string } | null) => {
    if (data) {
      setInfluencerInfo({ name: data.name, username: data.username, profilePic: data.profilePicUrl });
      updateForm('influencer', data.name);
      setManualForm(p => ({ ...p, influencerUsername: data.username, fullName: data.name }));
      setShowDropdown(false);
    } else {
      setInfluencerInfo(null);
    }
  }, [updateForm]);

  const handleSuccess = useCallback((title: string) => {
    setStatus({ type: 'success', message: 'Video Added!', details: `"${title}" added to campaign.` });
    setTimeout(() => { onSubmit(form); onClose(); }, AUTO_CLOSE_MS);
  }, [form, onSubmit, onClose]);

  // ============================================================================
  // UNIFIED CONTENT POST BUILDER (DRY - Single function for both flows)
  // ============================================================================

  const buildContentPost = useCallback(async (
    source: 'manual' | 'api',
    data: VideoMetricsFormData | ProcessedInstagramData
  ): Promise<ContentPostCreate> => {
    const isManualEntry = source === 'manual';
    const contentUrl = isManualEntry ? (data as VideoMetricsFormData).profileUrl : form.url;
    const plat = platform || 'instagram';

    // DYNAMIC ID RESOLUTION (React Query cache)
    const [platformId, endpointId] = await Promise.all([
      getDynamicPlatformIdAsync(plat),
      getDynamicDataSourceEndpointIdAsync(isManualEntry || isManualOnlyPlatform(plat) ? 'MANUAL' : 'INSIGHTIQ'),
    ]);

    // Base IDs (required by backend)
    const ids = {
      campaign_id: campaignId,
      campaign_influencer_id: influencerId,
      platform_id: platformId,
      data_source_endpoint_id: endpointId,
      platform_post_id: isManualEntry
        ? extractPlatformPostId((data as VideoMetricsFormData).profileUrl, plat)
        : (data as ProcessedInstagramData).post.post_id || (data as ProcessedInstagramData).post.shortcode || '',
    };

    // Validate required IDs
    const missing = Object.entries(ids).filter(([, v]) => !v?.trim()).map(([k]) => k);
    if (missing.length) throw new Error(`Missing: ${missing.join(', ')}`);

    if (isManualEntry) {
      const d = data as VideoMetricsFormData;
      return {
        ...ids,
        content_url: buildContentUrl(d.profileUrl, plat),
        content_type: determineContentType(plat, d.profileUrl, d.isVideo),
        content_format: determineContentFormat(d.profileUrl, d.isVideo),
        title: d.title || 'Post',
        caption: d.description || '',
        media_url: d.thumbnailUrl || undefined,
        thumbnail_url: d.thumbnailUrl || undefined,
        duration: d.duration > 0 ? d.duration : undefined,
        hashtags: [], mentions: [], collaborators: [], sponsors: [], links: [],
        likes_and_views_disabled: false,
        is_pinned: false,
        tracking_status: 'active',
        posted_at: d.postDate || new Date().toISOString(),
        first_tracked_at: new Date().toISOString(),
        last_tracked_at: new Date().toISOString(),
        initial_metadata: buildUnifiedInitialMetadata({
          likes: d.likes || 0, comments: d.comments || 0, shares: d.shares || 0,
          views: d.views || 0, plays: d.views || 0, saves: 0,
          username: d.influencerUsername || '', fullName: d.fullName || '',
          followers: d.followers || 0, isVerified: false, platform: plat, provider: 'manual',
          title: d.title || '', caption: d.description || '',
          mediaUrl: d.thumbnailUrl, thumbnailUrl: d.thumbnailUrl,
          duration: d.duration, postedAt: d.postDate,
        }),
      };
    }

    // API-fetched data
    const api = data as ProcessedInstagramData;
    const raw = api.raw_response?.data?.[0];
    const caption = api.post.caption || '';

    return {
      ...ids,
      content_url: contentUrl,
      content_type: determineContentType(plat, contentUrl, api.post.is_video || false),
      content_format: determineContentFormat(contentUrl, api.post.is_video || false),
      title: form.title || api.post.title || caption.substring(0, 100) || '',
      caption: form.description || caption,
      media_url: raw?.media_url || api.post.display_url || undefined,
      thumbnail_url: raw?.thumbnail_url || api.post.thumbnail_src || undefined,
      duration: raw?.duration || api.post.video_duration || undefined,
      hashtags: extractHashtags(caption),
      mentions: extractMentions(caption),
      collaborators: [], sponsors: [], links: [],
      likes_and_views_disabled: raw?.likes_and_views_disabled ?? false,
      is_pinned: raw?.is_pinned ?? false,
      tracking_status: 'active',
      posted_at: raw?.published_at || api.post.created_at || new Date().toISOString(),
      first_tracked_at: new Date().toISOString(),
      last_tracked_at: new Date().toISOString(),
      initial_metadata: buildUnifiedInitialMetadata({
        likes: api.post.likes_count || 0, comments: api.post.comments_count || 0,
        shares: api.post.shares_count || 0, views: api.post.view_counts || 0,
        plays: api.post.play_counts || api.post.view_counts || 0,
        saves: raw?.engagement?.save_count || 0,
        username: api.user.username || '', fullName: api.user.full_name || '',
        followers: api.user.followers_count || 0, isVerified: api.user.is_verified || false,
        profileUrl: raw?.profile?.url, profileImageUrl: api.user.profile_pic_url,
        platform: plat, provider: 'insightiq',
        title: api.post.title || caption.substring(0, 100) || '', caption,
        mediaUrl: raw?.media_url || api.post.display_url,
        thumbnailUrl: raw?.thumbnail_url || api.post.thumbnail_src,
        duration: raw?.duration || api.post.video_duration,
        postedAt: raw?.published_at || api.post.created_at, rawData: raw,
      }),
    };
  }, [campaignId, influencerId, platform, form.url, form.title, form.description]);

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  const onManualSubmit = async (data: VideoMetricsFormData) => {
    const errs: Record<string, string> = {};
    if (!influencerId?.trim()) errs.influencer = 'Select an influencer';
    if (!data.profileUrl?.trim()) errs.profileUrl = 'URL required';
    else if (!isValidPlatformUrl(data.profileUrl, platform || 'instagram')) errs.profileUrl = 'Invalid URL';
    if (!data.influencerUsername?.trim()) errs.influencerUsername = 'Username required';

    if (Object.keys(errs).length) {
      setErrors(errs);
      setStatus({ type: 'error', message: 'Missing Fields', details: Object.values(errs)[0] });
      return;
    }

    setErrors({});
    setStatus(INITIAL_STATUS);
    setLoading(true);
    setStep('saving');

    try {
      await createContentPost(await buildContentPost('manual', data));
      handleSuccess(data.title || 'Post');
    } catch (e) {
      const { message, details } = parseApiError(e);
      setStatus({ type: 'error', message, details });
      setErrors({ profileUrl: details });
      setStep('manual_form');
    } finally {
      setLoading(false);
    }
  };

  const onPreviewSubmit = async () => {
    if (!influencerId?.trim()) { setErrors({ influencer: 'Select an influencer' }); return; }
    if (!apiData?.success) { setErrors({ url: 'Fetch data first' }); return; }

    setLoading(true);
    setStep('saving');
    setStatus(INITIAL_STATUS);

    try {
      await createContentPost(await buildContentPost('api', apiData));
      handleSuccess(form.title || 'Post');
    } catch (e) {
      const { message, details } = parseApiError(e);
      setStatus({ type: 'error', message, details });
      setStep('preview');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    if (!form.url.trim()) { setErrors({ url: 'URL required' }); return; }
    if (!isValidPlatformUrl(form.url) && !isValidInstagramCode(form.url)) { setErrors({ url: 'Invalid URL' }); return; }
    if (!configReady) { setErrors({ platform: 'Config loading...' }); return; }

    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetchInstagramPostClient({
        ...(form.url.startsWith('http') ? { url: form.url } : { code: form.url }),
        platform: platform || 'instagram',
        preferredProvider: 'insightiq',
      });
      if (!res.success) throw new Error(res.message || 'Fetch failed');

      setApiData(res);
      setStep('preview');
      setForm(p => ({
        ...p,
        title: res.post.caption || res.post.title || 'Post',
        influencer: res.user.username || res.user.full_name || '',
        description: res.post.caption || '',
      }));
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Fetch failed');
      setManualForm(p => ({ ...p, profileUrl: form.url, title: form.title || 'Post', description: form.description || '' }));
      setStep('manual_form');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'input') {
      if (platform && isManualOnlyPlatform(platform)) {
        setManualForm(p => ({ ...p, profileUrl: form.url }));
        setStep('manual_form');
        return;
      }
      await fetchData();
      return;
    }
    if (step === 'preview') await onPreviewSubmit();
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderInfluencer = (result?: ProcessedInstagramData | null) => {
    if (!campaignData) return null;
    if (showDropdown || !influencerId) {
      return (
        <div className="bg-gray-50 rounded-lg p-2 sm:p-3 border border-gray-200">
          <InfluencerDropdown
            campaignData={campaignData}
            value={influencerId}
            onChange={id => { setInfluencerId(id); if (errors.influencer) setErrors(p => ({ ...p, influencer: '' })); }}
            onInfluencerSelect={onInfluencerSelect}
            error={errors.influencer}
            videoResult={result}
            renderMode="dropdown"
            platform={platform}
          />
        </div>
      );
    }
    return (
      <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <img src={getProxiedImageUrl(influencerInfo?.profilePic || result?.user?.profile_pic_url || '')} alt="" className="w-7 h-7 rounded-full object-cover" onError={e => { (e.target as HTMLImageElement).src = '/user/profile-placeholder.png'; }} />
          <div>
            <span className="text-sm font-medium text-gray-900 block">{influencerInfo?.name || result?.user?.full_name || 'Selected'}</span>
            <span className="text-xs text-gray-500 block">@{influencerInfo?.username || result?.user?.username || ''}</span>
          </div>
          <span className="bg-green-100 text-green-800 text-[10px] font-medium px-1.5 py-0.5 rounded-full">✓</span>
        </div>
        <button type="button" onClick={() => setShowDropdown(true)} className="text-xs text-blue-600 hover:text-blue-700 font-medium">Change</button>
      </div>
    );
  };

  const getHeader = () => {
    if (status.type === 'success') return { title: '✓ Success!', sub: 'Added to campaign' };
    if (status.type === 'error' && step === 'preview') return { title: '⚠ Error', sub: 'Review error below' };
    const map: Record<ModalStep, { title: string; sub: string }> = {
      input: { title: 'Add New Video', sub: 'Enter URL from any platform' },
      preview: { title: 'Review & Save', sub: 'Review fetched data' },
      manual_form: { title: 'Manual Entry', sub: `Enter ${platform || 'post'} metrics` },
      saving: { title: 'Saving...', sub: 'Processing...' },
    };
    return map[step];
  };

  const header = getHeader();

  // ============================================================================
  // RENDER: Steps
  // ============================================================================

  const InputStep = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">Video/Post URL *</label>
        <input id="url" type="text" value={form.url} onChange={e => updateForm('url', e.target.value)} placeholder="Paste URL from Instagram, TikTok, YouTube, Facebook, or LinkedIn" className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.url ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'}`} />
        {errors.url && <p className="mt-2 text-sm text-red-600 flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>{errors.url}</p>}
        {platform && platformDisplay && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500">Detected:</span>
            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white ${platformDisplay.bgClass}`}>
              <PlatformIcon platform={platform} size={12} />
              <span>{platformDisplay.name}</span>
              {isManual && <span className="ml-1 opacity-75">(Manual)</span>}
            </div>
          </div>
        )}
      </div>
      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          {isManual ? (
            <><p className="text-sm font-medium text-blue-900">Manual Entry Required</p><p className="text-sm text-blue-800 mt-1">{platform === 'facebook' ? 'Facebook' : 'LinkedIn'} posts require manual entry.</p></>
          ) : (
            <><p className="text-sm font-medium text-blue-900">Supported Platforms:</p>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                {(['instagram', 'tiktok', 'youtube', 'facebook', 'linkedin'] as ContentPlatform[]).map(p => (
                  <li key={p} className="flex items-center gap-1"><PlatformIcon platform={p} size={12} />{getContentPlatformDisplay(p).name}</li>
                ))}
              </ul></>
          )}
        </div>
      </div>
    </div>
  );

  const PreviewStep = () => {
    if (!apiData) return null;
    return (
      <div className="space-y-3">
        <StatusBanner status={status} onDismiss={() => setStatus(INITIAL_STATUS)} />
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-xl p-3 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-800 flex items-center">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center mr-2">
                <PlatformIcon platform={platform || 'instagram'} size={12} />
              </div>
              {platformDisplay?.name || 'Instagram'} Post
            </h4>
            <span className="bg-green-100 text-green-800 text-[10px] font-medium px-2 py-0.5 rounded-full">✓ Fetched</span>
          </div>
          <div className="bg-white rounded-lg p-2 mb-2 border border-gray-100">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <img src={getProxiedImageUrl(apiData.user.profile_pic_url || '')} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" onError={e => { (e.target as HTMLImageElement).src = '/user/profile-placeholder.png'; }} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-xs flex items-center gap-1 truncate">
                    {apiData.user.full_name || apiData.user.username}
                    {apiData.user.is_verified && <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate">@{apiData.user.username}</p>
                </div>
              </div>
              <div className="text-center"><p className="text-xs font-semibold text-gray-900">{formatNumber(apiData.user.followers_count || 0)}</p><p className="text-[10px] text-gray-500">Followers</p></div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-2 border border-gray-100">
            <div className="flex gap-2">
              {(apiData.post.thumbnail_src || apiData.post.display_url) && <img src={getProxiedImageUrl(apiData.post.thumbnail_src || apiData.post.display_url || '')} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" onError={e => { (e.target as HTMLImageElement).src = '/user/profile-placeholder.png'; }} />}
              <div className="flex-1 grid grid-cols-4 gap-1">
                {[{ l: 'Likes', v: apiData.post.likes_count, c: 'red' }, { l: 'Comments', v: apiData.post.comments_count, c: 'blue' }, { l: 'Shares', v: apiData.post.shares_count, c: 'yellow' }, { l: 'Views', v: apiData.post.view_counts || apiData.post.play_counts, c: 'green' }].map(m => (
                  <div key={m.l} className={`text-center p-1.5 bg-${m.c}-50 rounded`}><p className="text-[10px] text-gray-500 hidden sm:block">{m.l}</p><p className="text-xs font-semibold text-gray-900">{formatNumber(m.v || 0)}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {renderInfluencer(apiData)}
        {errors.influencer && !showDropdown && <p className="text-red-500 text-xs">{errors.influencer}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => updateForm('title', e.target.value)} placeholder="Video title" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Influencer *</label>
            <input value={form.influencer} onChange={e => updateForm('influencer', e.target.value)} placeholder="Name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Description <span className="text-gray-400">(Optional)</span></label>
            <textarea rows={2} value={form.description} onChange={e => updateForm('description', e.target.value)} placeholder="Notes" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none" />
          </div>
        </div>
      </div>
    );
  };

  const ManualStep = () => (
    <div className="space-y-4">
      <StatusBanner status={status} onDismiss={() => setStatus(INITIAL_STATUS)} />
      {platform && (
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
            {platform === 'linkedin' ? <SiLinkedin className="w-5 h-5 text-[#0A66C2]" /> : <SiFacebook className="w-5 h-5 text-[#1877F2]" />}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{getContentPlatformDisplay(platform).name}</p>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">Manual</span>
          </div>
        </div>
      )}
      {renderInfluencer()}
      {errors.influencer && !showDropdown && <p className="text-red-500 text-xs">{errors.influencer}</p>}
      <VideoMetricsForm mode="manual_add" platform={platform} initialData={manualForm} onSubmit={onManualSubmit} onCancel={onClose} onBack={goBack} isLoading={loading} fetchError={fetchError} externalErrors={errors} />
    </div>
  );

  const SavingStep = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {status.type === 'success' ? (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{status.message}</h3>
          <p className="text-sm text-gray-600 mb-4">{status.details}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500"><Spinner size="sm" /> Closing...</div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-pink-200" />
            <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Saving...</h3>
          <p className="text-sm text-gray-600">Adding to campaign...</p>
        </div>
      )}
    </div>
  );

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{header.title}</h3>
              <p className="text-xs text-gray-600">{header.sub}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-white/50" disabled={loading}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(85vh-120px)] overflow-y-auto">
          {step === 'saving' ? <div className="p-4"><SavingStep /></div>
            : step === 'manual_form' ? <div className="p-4"><ManualStep /></div>
              : (
                <form onSubmit={onSubmitForm} className="p-4">
                  {step === 'input' && <InputStep />}
                  {step === 'preview' && <PreviewStep />}

                  {status.type !== 'success' && (
                    <div className="flex items-center gap-2 pt-4 mt-4 border-t border-gray-200">
                      {step === 'preview' && (
                        <button type="button" onClick={goBack} disabled={loading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 font-medium text-sm disabled:opacity-50 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Back
                        </button>
                      )}
                      <button type="button" onClick={onClose} disabled={loading} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 font-medium text-sm disabled:opacity-50">Cancel</button>
                      <button type="submit" disabled={loading || !configReady} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 font-medium text-sm flex items-center justify-center shadow-lg">
                        {loading ? <><Spinner size="sm" /><span className="ml-1.5">{step === 'input' ? 'Processing...' : 'Saving...'}</span></>
                          : <><svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={step === 'input' ? 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' : 'M5 13l4 4L19 7'} /></svg>{step === 'input' ? (isManual ? 'Continue' : 'Fetch Data') : 'Save Video'}</>}
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