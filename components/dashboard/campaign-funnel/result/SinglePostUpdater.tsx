// src/components/dashboard/campaign-funnel/result/SinglePostUpdater.tsx
// ============================================================================
// REFACTORED: Uses centralized types.ts - No duplicate functions
// ============================================================================

'use client';

import React, { memo, useCallback } from 'react';
import { updateContentPost } from '@/services/content-posts/content-post.client';
import { fetchInstagramPostClient } from '@/services/insights-iq/posts/posts.client';
import { VideoResult } from '@/types/user-detailed-info';
import { detectPlatformFromUrl, ContentPlatform } from '@/constants/social-platforms';
import {
  // Types
  VideoMetricsFormData,
  // Functions - ALL from types.ts (Single Source)
  isApiSupported,
  isManualOnly,
  videoResultToFormData,
  formDataToUpdatePayload,
  fetchFollowersCount,
  buildFormDataFromAPIResponse,
  classifyApiError,
} from './types';

// ============================================================================
// PROPS
// ============================================================================

interface SinglePostUpdaterProps {
  videoResult: VideoResult;
  onUpdateSuccess: (updatedResult: VideoResult) => void;
  onUpdateError: (error: unknown) => void;
  isUpdating: boolean;
  onUpdateStart: (videoId: string) => void;
  onUpdateEnd: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

const SinglePostUpdater: React.FC<SinglePostUpdaterProps> = memo(({
  videoResult,
  onUpdateSuccess,
  onUpdateError,
  isUpdating,
  onUpdateStart,
  onUpdateEnd,
}) => {
  const handleUpdate = useCallback(async () => {
    onUpdateStart(videoResult.id);

    try {
      const platform = detectPlatformFromUrl(videoResult.content_url || '');

      // Manual-only platforms (Facebook, LinkedIn) - success without API call
      if (isManualOnly(platform)) {
        onUpdateSuccess(videoResult);
        return;
      }

      // Unsupported platform
      if (!isApiSupported(platform)) {
        throw new Error('Unsupported platform for auto-update.');
      }

      // Step 1: Get current form data
      const currentFormData = videoResultToFormData(videoResult);

      // Step 2: Validate URL
      if (!videoResult.content_url) {
        throw new Error('No valid URL found for this post.');
      }

      // Step 3: Call InsightIQ API
      const apiResponse = await fetchInstagramPostClient({
        url: videoResult.content_url,
        platform: platform as ContentPlatform,
        preferredProvider: 'insightiq',
      });

      if (!apiResponse.success) {
        const classified = classifyApiError(
          new Error(apiResponse.message || 'Failed to fetch post data'),
          videoResult.influencer_username
        );
        throw new Error(classified.userMessage);
      }

      // Step 4: Fetch enhanced followers count
      let enhancedFollowers = currentFormData.followers;
      const username = apiResponse.user?.username?.trim();
      if (username) {
        const fetched = await fetchFollowersCount(username);
        if (fetched > 0) enhancedFollowers = fetched;
      }

      // Step 5: Build updated form data (using centralized function)
      const updatedFormData = buildFormDataFromAPIResponse(
        apiResponse,
        currentFormData,
        enhancedFollowers
      );

      // Step 6: Transform to API payload (using centralized function)
      const updatePayload = formDataToUpdatePayload(updatedFormData, videoResult);

      // Step 7: Update via content-posts API
      const result = await updateContentPost(videoResult.id, updatePayload);

      // Step 8: Build updated VideoResult for UI
      const { content_format: _ignored, ...safeResult } = result as any;

      const updatedVideoResult: VideoResult = {
        ...videoResult,
        ...safeResult,
        likes_count: updatedFormData.likes,
        comments_count: updatedFormData.comments,
        views_count: updatedFormData.views,
        plays_count: updatedFormData.views,
        shares_count: updatedFormData.shares,
        followers_count: updatedFormData.followers,
        full_name: updatedFormData.fullName,
        influencer_username: updatedFormData.influencerUsername,
        thumbnail: updatedFormData.thumbnailUrl,
        updated_at: new Date().toISOString(),
        post_result_obj: {
          ...videoResult.post_result_obj,
          engagement: {
            like_count: updatedFormData.likes,
            comment_count: updatedFormData.comments,
            view_count: updatedFormData.views,
            share_count: updatedFormData.shares,
          },
          influencer: {
            full_name: updatedFormData.fullName,
            username: updatedFormData.influencerUsername,
            followers: updatedFormData.followers,
            collaboration_price: updatedFormData.collaborationPrice,
          },
        },
      };

      onUpdateSuccess(updatedVideoResult);

    } catch (error) {
      onUpdateError(error);
    } finally {
      onUpdateEnd();
    }
  }, [videoResult, onUpdateSuccess, onUpdateError, onUpdateStart, onUpdateEnd]);

  return (
    <button
      onClick={handleUpdate}
      disabled={isUpdating}
      className="text-blue-500 hover:text-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-blue-50"
      title="Update post data"
    >
      {isUpdating ? (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
    </button>
  );
});

SinglePostUpdater.displayName = 'SinglePostUpdater';

export default SinglePostUpdater;
