// src/components/dashboard/campaign-funnel/result/EditVideoModal.tsx

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { VideoResult } from '@/types/user-detailed-info';
import { detectPlatformFromUrl, ContentPlatform } from '@/constants/social-platforms';
import VideoMetricsForm from './VideoMetricsForm';
import {
  VideoMetricsFormData,
  videoResultToFormData,
  formDataToUpdatePayload,
} from './types';

interface EditVideoModalProps {
  video: VideoResult;
  onClose: () => void;
  onSubmit: (videoData: any) => void;
}

const EditVideoModal: React.FC<EditVideoModalProps> = ({ video, onClose, onSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get initial form data from video using centralized transformer
  const initialFormData = useMemo(() => videoResultToFormData(video), [video]);

  // Detect platform from video URL for icon display
  // Priority: content_url > content_type mapping > fallback to instagram
  const detectedPlatform = useMemo((): ContentPlatform | null => {
    // 1. Try to detect from content_url (most reliable)
    if (video.content_url) {
      const detected = detectPlatformFromUrl(video.content_url);
      if (detected) {
        console.log('✅ Platform detected from content_url:', detected);
        return detected;
      }
    }

    // 2. Try to detect from content_type (e.g., 'facebook_video', 'linkedin_post')
    if (video.content_type) {
      const contentTypeLower = video.content_type.toLowerCase();
      if (contentTypeLower.includes('facebook')) return 'facebook';
      if (contentTypeLower.includes('linkedin')) return 'linkedin';
      if (contentTypeLower.includes('tiktok')) return 'tiktok';
      if (contentTypeLower.includes('youtube') || contentTypeLower.includes('shorts')) return 'youtube';
      if (contentTypeLower.includes('instagram') || contentTypeLower.includes('reel')) return 'instagram';
    }

    // 3. Fallback: detect from profileUrl in form data
    if (initialFormData.profileUrl) {
      const detected = detectPlatformFromUrl(initialFormData.profileUrl);
      if (detected) {
        console.log('✅ Platform detected from profileUrl:', detected);
        return detected;
      }
    }

    // 4. Default fallback
    console.log('⚠️ Could not detect platform, defaulting to instagram');
    return 'instagram';
  }, [video.content_url, video.content_type, initialFormData.profileUrl]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = useCallback(async (formData: VideoMetricsFormData) => {
    setIsLoading(true);
    setSubmitError(null);

    try {
      // Transform form data to API payload using centralized transformer
      const updateData = formDataToUpdatePayload(formData, video);

      console.log('🔄 EditVideoModal: Updating video with data:', updateData);
      console.log('📤 EditVideoModal: Updated values:', {
        likes: formData.likes,
        comments: formData.comments,
        shares: formData.shares,
        views: formData.views,
        followers: formData.followers,
        collaborationPrice: formData.collaborationPrice,
      });

      await onSubmit(updateData);
    } catch (error) {
      console.error('💥 EditVideoModal: Error updating video:', error);
      setSubmitError('Failed to update video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [video, onSubmit]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Video Details</h3>
              <p className="text-sm text-gray-600">Update the video information and metrics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-full hover:bg-white/50"
            disabled={isLoading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6">
          {/* Submit Error Alert */}
          {submitError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
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
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          )}

          {/* Shared Video Metrics Form */}
          <VideoMetricsForm
            mode="edit"
            platform={detectedPlatform}
            initialData={initialFormData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default EditVideoModal;