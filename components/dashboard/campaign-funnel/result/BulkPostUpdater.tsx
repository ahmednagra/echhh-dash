
// src/components/dashboard/campaign-funnel/result/BulkPostUpdater.tsx
'use client';

import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { updateAllContentPostsWithData } from '@/services/content-posts/content-post.client';
import { fetchInstagramPostClient } from '@/services/insights-iq/posts/posts.client';
import { VideoResult } from '@/types/user-detailed-info';
import { detectPlatformFromUrl, ContentPlatform } from '@/constants/social-platforms';
import { toast } from 'react-hot-toast';
import {
  VideoMetricsFormData,
  videoResultToFormData,
  formDataToUpdatePayload,
  fetchFollowersCount,
  buildFormDataFromAPIResponse,
  classifyApiError,
  isApiSupported,
  isManualOnly,
  ContentPostUpdatePayload,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

interface BulkPostUpdaterProps {
  videoResults: VideoResult[];
  campaignId: string;
  onUpdateSuccess: (updatedResults: VideoResult[]) => void;
  onUpdateError: (error: unknown) => void;
  isUpdating: boolean;
  onUpdateStart: () => void;
  onUpdateEnd: () => void;
  onRefetchResults: () => Promise<void>;
}

interface ProgressState {
  total: number;
  completed: number;
  current: string;
  currentPlatform: ContentPlatform | null;
  errors: number;
  skipped: number;
  successful: number;
}

interface ProcessedPost {
  username: string;
  platform: ContentPlatform | null;
  status: 'success' | 'error' | 'skipped' | 'processing' | 'pending' | 'paused';
  message?: string;
  errorType?: string;
  contentUrl?: string;
  timestamp?: string;
}

type ModalPhase = 'processing' | 'paused' | 'completing' | 'completed';

// ============================================================================
// PLATFORM ICON COMPONENT
// ============================================================================

const PlatformIcon: React.FC<{ platform: ContentPlatform | null; size?: 'sm' | 'md' }> = ({ 
  platform, 
  size = 'md' 
}) => {
  const sizeClass = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';

  if (platform === 'instagram') {
    return (
      <div className={`${sizeClass} rounded-md bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
        </svg>
      </div>
    );
  }
  
  if (platform === 'tiktok') {
    return (
      <div className={`${sizeClass} rounded-md bg-black flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
        </svg>
      </div>
    );
  }
  
  if (platform === 'youtube') {
    return (
      <div className={`${sizeClass} rounded-md bg-red-600 flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      </div>
    );
  }
  
  if (platform === 'facebook') {
    return (
      <div className={`${sizeClass} rounded-md bg-blue-600 flex items-center justify-center`}>
        <svg className={`${iconSize} text-white`} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </div>
    );
  }
  
  if (platform === 'linkedin') {
    return (
      <div className={`${sizeClass} rounded-md bg-blue-700 flex items-center justify-center`}>
        <span className="text-white text-xs font-bold">in</span>
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-md bg-gray-400 flex items-center justify-center`}>
      <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    </div>
  );
};

// ============================================================================
// COMPACT PROGRESS MODAL COMPONENT
// ============================================================================

const CompactProgressModal: React.FC<{
  isOpen: boolean;
  progress: ProgressState;
  processedPosts: ProcessedPost[];
  phase: ModalPhase;
  estimatedTimeRemaining: number;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetryFailed: () => void;
  onClose: () => void;
}> = ({ 
  isOpen, 
  progress, 
  processedPosts, 
  phase, 
  estimatedTimeRemaining,
  onPause,
  onResume,
  onCancel,
  onRetryFailed,
  onClose,
}) => {
  if (!isOpen) return null;

  const percentage = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  const isCompleted = phase === 'completed';
  const isPaused = phase === 'paused';
  const hasErrors = progress.errors > 0;
  const hasIssues = progress.errors > 0 || progress.skipped > 0;

  // Get 3 posts to display: last completed, current processing, next pending
  const getVisiblePosts = (): ProcessedPost[] => {
    const completed = processedPosts.filter(p => p.status === 'success' || p.status === 'error' || p.status === 'skipped');
    const processing = processedPosts.find(p => p.status === 'processing');
    const pending = processedPosts.filter(p => p.status === 'pending' || p.status === 'paused');

    const visible: ProcessedPost[] = [];
    
    // Add last completed (if any)
    if (completed.length > 0) {
      visible.push(completed[completed.length - 1]);
    }
    
    // Add current processing
    if (processing) {
      visible.push(processing);
    }
    
    // Add next pending (if any)
    if (pending.length > 0 && visible.length < 3) {
      visible.push(pending[0]);
    }

    // Fill remaining slots with more completed if needed
    if (visible.length < 3 && completed.length > 1) {
      const remaining = completed.slice(-3).filter(p => !visible.includes(p));
      visible.unshift(...remaining.slice(-(3 - visible.length)));
    }

    return visible.slice(0, 3);
  };

  const visiblePosts = getVisiblePosts();

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `~${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.ceil(seconds % 60);
    return `~${mins}m ${secs}s`;
  };

  // Determine gradient bar color based on state
  const getGradientBar = () => {
    if (isCompleted && !hasIssues) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    if (isCompleted && hasIssues) return 'bg-gradient-to-r from-amber-400 to-orange-500';
    if (isPaused) return 'bg-amber-400';
    return 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400';
  };

  // Progress ring color
  const getProgressColor = () => {
    if (isCompleted && !hasIssues) return '#10B981';
    if (isCompleted && hasIssues) return '#F59E0B';
    if (isPaused) return '#F59E0B';
    return 'url(#progressGradient)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-xl shadow-2xl w-[380px] overflow-hidden"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        {/* Gradient Top Bar */}
        <div className={`h-1.5 ${getGradientBar()}`} />
        
        {/* Header + Progress */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              {isCompleted ? (
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    hasIssues ? 'bg-amber-100' : 'bg-green-100'
                  }`}>
                    {hasIssues ? (
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">
                      {hasIssues ? 'Completed' : 'Complete!'}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {hasIssues ? 'With some issues' : `${progress.successful} posts updated`}
                    </p>
                  </div>
                </div>
              ) : isPaused ? (
                <>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-800">Paused</h2>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      {progress.total - progress.completed} remaining
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{progress.completed} of {progress.total} completed</p>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-gray-800">Updating Posts</h2>
                  <p className="text-xs text-gray-500">
                    {progress.completed} of {progress.total} • {formatTime(estimatedTimeRemaining)}
                  </p>
                </>
              )}
            </div>
            
            {/* Circular Progress */}
            {!isCompleted && (
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90">
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6"/>
                      <stop offset="100%" stopColor="#EC4899"/>
                    </linearGradient>
                  </defs>
                  <circle cx="28" cy="28" r="24" stroke="#E5E7EB" strokeWidth="5" fill="none"/>
                  <circle 
                    cx="28" 
                    cy="28" 
                    r="24" 
                    stroke={getProgressColor()}
                    strokeWidth="5" 
                    fill="none"
                    strokeDasharray="150.8"
                    strokeDashoffset={150.8 - (150.8 * percentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-sm font-bold ${isPaused ? 'text-amber-600' : 'text-purple-600'}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
            )}
            
            {isCompleted && (
              <span className={`text-2xl font-bold ${hasIssues ? 'text-amber-500' : 'text-green-500'}`}>
                100%
              </span>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-gray-50 rounded-lg py-2 px-3 text-center">
              <span className="text-lg font-bold text-gray-700">{progress.total}</span>
              <span className="text-xs text-gray-500 ml-1">Total</span>
            </div>
            <div className="flex-1 bg-green-50 rounded-lg py-2 px-3 text-center">
              <span className="text-lg font-bold text-green-600">{progress.successful}</span>
              <span className="text-xs text-green-600 ml-1">Done</span>
            </div>
            <div className="flex-1 bg-amber-50 rounded-lg py-2 px-3 text-center">
              <span className="text-lg font-bold text-amber-600">{progress.skipped}</span>
              <span className="text-xs text-amber-600 ml-1">Skip</span>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg py-2 px-3 text-center">
              <span className="text-lg font-bold text-red-500">{progress.errors}</span>
              <span className="text-xs text-red-500 ml-1">Fail</span>
            </div>
          </div>

          {/* Progress Bar */}
          {!isCompleted && (
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isPaused ? 'bg-amber-400' : 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          )}
        </div>

        {/* Live Feed - Only show when processing or paused */}
        {!isCompleted && visiblePosts.length > 0 && (
          <div className="px-4 pb-3">
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">Live Feed</span>
                <span className="text-xs text-gray-400">3 visible</span>
              </div>
              
              {visiblePosts.map((post, idx) => (
                <div 
                  key={idx}
                  className={`px-3 py-2.5 flex items-center justify-between ${
                    idx < visiblePosts.length - 1 ? 'border-b border-gray-100' : ''
                  } ${
                    post.status === 'processing' ? 'bg-blue-50' : 
                    post.status === 'pending' || post.status === 'paused' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <PlatformIcon platform={post.platform} />
                    <span className="text-sm text-gray-700 truncate">@{post.username}</span>
                  </div>
                  
                  {/* Status Icon */}
                  {post.status === 'success' && (
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {post.status === 'processing' && (
                    <svg className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                  )}
                  {(post.status === 'pending' || post.status === 'paused') && (
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  )}
                  {post.status === 'skipped' && (
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                    </svg>
                  )}
                  {post.status === 'error' && (
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Issues List - Show on completion with errors */}
        {isCompleted && hasIssues && (
          <div className="px-4 pb-3 space-y-2">
            {processedPosts.filter(p => p.status === 'skipped').slice(0, 2).map((post, idx) => (
              <div key={`skip-${idx}`} className="bg-amber-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-amber-100">
                <PlatformIcon platform={post.platform} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 truncate">@{post.username}</p>
                  <p className="text-xs text-amber-600">{post.message || 'Skipped'}</p>
                </div>
              </div>
            ))}
            {processedPosts.filter(p => p.status === 'error').slice(0, 2).map((post, idx) => (
              <div key={`err-${idx}`} className="bg-red-50 rounded-lg p-2.5 flex items-center gap-2.5 border border-red-100">
                <PlatformIcon platform={post.platform} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-700 truncate">@{post.username}</p>
                  <p className="text-xs text-red-600">{post.message || 'Failed'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 pb-4 flex gap-2">
          {!isCompleted && !isPaused && (
            <>
              <button 
                onClick={onPause}
                className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Pause
              </button>
              <button 
                onClick={onCancel}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          
          {isPaused && (
            <>
              <button 
                onClick={onResume}
                className="flex-1 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-pink-600 transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/25"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
              </button>
              <button 
                onClick={onCancel}
                className="flex-1 px-3 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
          
          {isCompleted && (
            <>
              {hasErrors && (
                <button 
                  onClick={onRetryFailed}
                  className="flex-1 px-3 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Retry ({progress.errors})
                </button>
              )}
              <button 
                onClick={onClose}
                className={`${hasErrors ? 'flex-1' : 'w-full'} px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-purple-500/25`}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>

      {/* Keyframes */}
      <style jsx>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const BulkPostUpdater: React.FC<BulkPostUpdaterProps> = memo(({
  videoResults,
  campaignId,
  onUpdateSuccess,
  onUpdateError,
  isUpdating,
  onUpdateStart,
  onUpdateEnd,
  onRefetchResults,
}) => {
  // State
  const [progress, setProgress] = useState<ProgressState>({
    total: 0,
    completed: 0,
    current: '',
    currentPlatform: null,
    errors: 0,
    skipped: 0,
    successful: 0,
  });
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [processedPosts, setProcessedPosts] = useState<ProcessedPost[]>([]);
  const [modalPhase, setModalPhase] = useState<ModalPhase>('processing');
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(0);
  const [isPausedRef, setIsPausedRef] = useState(false);
  const [isCancelledRef, setIsCancelledRef] = useState(false);
  const startTimeRef = useRef<number>(0);
  const pauseResolveRef = useRef<(() => void) | null>(null);

  // Reset state helper
  const resetState = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      current: '',
      currentPlatform: null,
      errors: 0,
      skipped: 0,
      successful: 0,
    });
    setProcessedPosts([]);
    setModalPhase('processing');
    setEstimatedTimeRemaining(0);
    setIsPausedRef(false);
    setIsCancelledRef(false);
  }, []);

  // Pause handler
  const handlePause = useCallback(() => {
    setIsPausedRef(true);
    setModalPhase('paused');
    // Update pending posts to paused status
    setProcessedPosts(prev => 
      prev.map(p => p.status === 'pending' ? { ...p, status: 'paused' as const } : p)
    );
  }, []);

  // Resume handler
  const handleResume = useCallback(() => {
    setIsPausedRef(false);
    setModalPhase('processing');
    // Update paused posts back to pending
    setProcessedPosts(prev => 
      prev.map(p => p.status === 'paused' ? { ...p, status: 'pending' as const } : p)
    );
    // Resolve the pause promise if waiting
    if (pauseResolveRef.current) {
      pauseResolveRef.current();
      pauseResolveRef.current = null;
    }
  }, []);

  // Cancel handler
  const handleCancel = useCallback(() => {
    setIsCancelledRef(true);
    setShowProgressModal(false);
    resetState();
    onUpdateEnd();
    toast('Update cancelled', { icon: '🛑' });
  }, [onUpdateEnd, resetState]);

  // Close handler
  const handleClose = useCallback(async () => {
    setShowProgressModal(false);
    resetState();
    onUpdateEnd();
    await onRefetchResults();
  }, [onUpdateEnd, onRefetchResults, resetState]);

  // Retry failed handler
  const handleRetryFailed = useCallback(() => {
    const failedPosts = processedPosts.filter(p => p.status === 'error');
    if (failedPosts.length === 0) return;
    
    // TODO: Implement retry logic for failed posts
    toast.success(`Retrying ${failedPosts.length} failed posts...`);
  }, [processedPosts]);

  // Wait for unpause helper
  const waitForUnpause = useCallback((): Promise<void> => {
    return new Promise(resolve => {
      if (!isPausedRef) {
        resolve();
        return;
      }
      pauseResolveRef.current = resolve;
    });
  }, [isPausedRef]);

  // Main bulk update handler
  const handleBulkUpdate = useCallback(async () => {
    onUpdateStart();
    resetState();
    setShowProgressModal(true);
    startTimeRef.current = Date.now();

    const totalPosts = videoResults.length;
    
    // Filter API-supported vs manual-only
    const apiSupportedPosts = videoResults.filter(video => {
      const platform = detectPlatformFromUrl(video.content_url || '');
      return isApiSupported(platform);
    });

    const manualOnlyPosts = videoResults.filter(video => {
      const platform = detectPlatformFromUrl(video.content_url || '');
      return isManualOnly(platform);
    });

    const skippedCount = manualOnlyPosts.length;

    // Initialize progress
    setProgress({
      total: totalPosts,
      completed: 0,
      current: '',
      currentPlatform: null,
      errors: 0,
      skipped: skippedCount,
      successful: 0,
    });

    // Initialize processed posts list
    const initialPosts: ProcessedPost[] = [];

    // Add skipped posts first
    manualOnlyPosts.forEach(video => {
      const platform = detectPlatformFromUrl(video.content_url || '');
      initialPosts.push({
        username: video.influencer_username || 'Unknown',
        platform,
        status: 'skipped',
        message: 'Manual update only',
        contentUrl: video.content_url,
      });
    });

    // Add pending posts
    apiSupportedPosts.forEach(video => {
      const platform = detectPlatformFromUrl(video.content_url || '');
      initialPosts.push({
        username: video.influencer_username || 'Unknown',
        platform,
        status: 'pending',
        contentUrl: video.content_url,
      });
    });

    setProcessedPosts(initialPosts);

    // Track counts
    let completedCount = skippedCount;
    let successCount = 0;
    let errorCount = 0;
    const updatesData: Array<{ result_id: string; update_data: ContentPostUpdatePayload }> = [];

    // Process each API-supported post
    for (let i = 0; i < apiSupportedPosts.length; i++) {
      // Check for cancellation
      if (isCancelledRef) break;

      // Check for pause
      if (isPausedRef) {
        await waitForUnpause();
      }

      const video = apiSupportedPosts[i];
      const platform = detectPlatformFromUrl(video.content_url || '');
      const username = video.influencer_username || 'Unknown';

      // Update progress
      setProgress(prev => ({
        ...prev,
        current: username,
        currentPlatform: platform,
      }));

      // Update estimated time
      if (completedCount > skippedCount) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const avgTimePerPost = elapsed / (completedCount - skippedCount);
        const remaining = (apiSupportedPosts.length - (i)) * avgTimePerPost;
        setEstimatedTimeRemaining(Math.max(0, remaining));
      }

      // Update post status to processing
      setProcessedPosts(prev => 
        prev.map(p => 
          p.contentUrl === video.content_url && p.status === 'pending'
            ? { ...p, status: 'processing' as const }
            : p
        )
      );

      try {
        // Skip if no content URL
        if (!video.content_url) {
          throw new Error('No content URL');
        }

        // Get current form data
        const currentFormData = videoResultToFormData(video);

        // Call InsightIQ API
        const apiResponse = await fetchInstagramPostClient({
          url: video.content_url,
          platform: platform as ContentPlatform,
          preferredProvider: 'insightiq',
        });

        if (!apiResponse.success) {
          throw new Error(apiResponse.message || 'API request failed');
        }

        // Fetch enhanced followers
        let enhancedFollowers = currentFormData.followers;
        const fetchedUsername = apiResponse.user?.username?.trim();
        if (fetchedUsername) {
          const fetched = await fetchFollowersCount(fetchedUsername);
          if (fetched > 0) enhancedFollowers = fetched;
        }

        // Build updated form data using centralized function
        const updatedFormData = buildFormDataFromAPIResponse(
          apiResponse,
          currentFormData,
          enhancedFollowers
        );

        // Transform to API payload
        const updatePayload = formDataToUpdatePayload(updatedFormData, video);
        updatesData.push({ result_id: video.id, update_data: updatePayload });

        // Update post status to success
        setProcessedPosts(prev => 
          prev.map(p => 
            p.contentUrl === video.content_url && p.status === 'processing'
              ? { ...p, status: 'success' as const }
              : p
          )
        );

        successCount++;

      } catch (err) {
        const classified = classifyApiError(err, username);
        
        // Update status to error
        setProcessedPosts(prev => 
          prev.map(p => 
            p.contentUrl === video.content_url && p.status === 'processing'
              ? { 
                  ...p, 
                  status: 'error' as const, 
                  message: classified.userMessage,
                  errorType: classified.type,
                } 
              : p
          )
        );

        errorCount++;
        console.warn(`⚠️ Failed for ${username}:`, classified.userMessage);
      }

      completedCount++;
      setProgress(prev => ({
        ...prev,
        completed: completedCount,
        successful: successCount,
        errors: errorCount,
      }));

      // Rate limiting delay
      if (i < apiSupportedPosts.length - 1 && !isCancelledRef) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Check if cancelled
    if (isCancelledRef) return;

    // Finalizing phase
    if (updatesData.length > 0) {
      setModalPhase('completing');
      setProgress(prev => ({ ...prev, current: 'Saving...' }));

      try {
        const results = await updateAllContentPostsWithData(campaignId, updatesData);
        onUpdateSuccess(results as unknown as VideoResult[]);
      } catch (err) {
        console.error('Failed to save updates:', err);
        onUpdateError(err);
      }
    }

    // Completion
    setModalPhase('completed');
    setProgress(prev => ({ ...prev, completed: totalPosts, current: '' }));
    setEstimatedTimeRemaining(0);

    // Show summary toast
    if (errorCount > 0 || skippedCount > 0) {
      toast.success(
        `Updated ${successCount} posts` +
        (skippedCount > 0 ? ` • ${skippedCount} skipped` : '') +
        (errorCount > 0 ? ` • ${errorCount} failed` : ''),
        { duration: 4000 }
      );
    } else {
      toast.success(`Successfully updated ${successCount} posts!`, { duration: 3000 });
    }

  }, [
    videoResults, 
    campaignId, 
    onUpdateStart, 
    onUpdateSuccess, 
    onUpdateError, 
    resetState,
    isPausedRef,
    isCancelledRef,
    waitForUnpause,
  ]);

  // Count for button display
  const totalCount = videoResults.length;

  return (
    <>
      {/* Update All Button */}
      <button
        onClick={handleBulkUpdate}
        disabled={isUpdating || totalCount === 0}
        className="group flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUpdating ? (
          <>
            <svg className="animate-spin w-4 h-4 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Updating...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 mr-2 text-blue-500 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Update All</span>
            <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-semibold">
              {totalCount}
            </span>
          </>
        )}
      </button>

      {/* Compact Progress Modal */}
      <CompactProgressModal
        isOpen={showProgressModal}
        progress={progress}
        processedPosts={processedPosts}
        phase={modalPhase}
        estimatedTimeRemaining={estimatedTimeRemaining}
        onPause={handlePause}
        onResume={handleResume}
        onCancel={handleCancel}
        onRetryFailed={handleRetryFailed}
        onClose={handleClose}
      />
    </>
  );
});

BulkPostUpdater.displayName = 'BulkPostUpdater';

export default BulkPostUpdater;