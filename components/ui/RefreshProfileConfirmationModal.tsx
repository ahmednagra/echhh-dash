// src/components/ui/RefreshProfileConfirmationModal.tsx
// Confirmation and progress modal for refreshing influencer profile data
// Shows warning about API cost before proceeding, then displays progress

import React from 'react';
import { AlertTriangle, RefreshCw, X, CheckCircle } from 'react-feather';
import { RefreshProgressState, REFRESH_TOTAL_STEPS } from '@/types/profile-refresh';

interface RefreshProfileConfirmationModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Whether a refresh operation is in progress */
  isRefreshing: boolean;
  /** Current progress state */
  progress: RefreshProgressState;
  /** Influencer username being refreshed (for display) */
  username?: string;
  /** Callback when user confirms the refresh */
  onConfirm: () => void;
  /** Callback when user cancels or closes the modal */
  onCancel: () => void;
}

/**
 * Modal component for confirming and tracking profile data refresh operations
 * 
 * States:
 * 1. Confirmation - Shows warning about API cost with confirm/cancel buttons
 * 2. Loading - Shows progress bar and current operation step
 */
export const RefreshProfileConfirmationModal: React.FC<RefreshProfileConfirmationModalProps> = ({
  isOpen,
  isRefreshing,
  progress,
  username,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;
  
  const progressPercentage = progress.totalSteps > 0 
    ? (progress.step / progress.totalSteps) * 100 
    : 0;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={!isRefreshing ? onCancel : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refresh-modal-title"
      >
        {!isRefreshing ? (
          // Confirmation State
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 
                    id="refresh-modal-title"
                    className="text-lg font-semibold text-gray-900"
                  >
                    Refresh Profile Data
                  </h3>
                  {username && (
                    <p className="text-sm text-gray-500">@{username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Warning message */}
            <div className="mb-6">
              <p className="text-gray-600 leading-relaxed">
                This action will fetch comprehensive profile analytics from our premium data provider. 
                This is a <span className="font-medium text-amber-600">metered API call</span> that 
                incurs additional costs.
              </p>
            </div>
            
            {/* What will be updated */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Data that will be updated:
              </h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Audience demographics (age, gender, location)
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Engagement metrics and analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Contact information
                </li>
                <li className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                  Profile details and verification status
                </li>
              </ul>
            </div>
            
            {/* Action buttons */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>
        ) : (
          // Loading State
          <div className="p-6">
            <div className="flex flex-col items-center py-4">
              {/* Animated spinner */}
              <div className="relative mb-6">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-purple-200" />
                <div 
                  className="absolute inset-0 animate-spin rounded-full h-14 w-14 border-4 border-transparent border-t-purple-600"
                  style={{ animationDuration: '1s' }}
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Refreshing Profile Data
              </h3>
              
              {username && (
                <p className="text-sm text-gray-500 mb-4">@{username}</p>
              )}
              
              {/* Progress message */}
              <p className="text-sm text-gray-600 mb-6 text-center min-h-[20px]">
                {progress.message || 'Initializing...'}
              </p>
              
              {/* Progress bar */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span>{progress.step}/{progress.totalSteps}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
              
              {/* Note */}
              <p className="text-xs text-gray-400 mt-6 text-center">
                Please wait while we fetch the latest data...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RefreshProfileConfirmationModal;