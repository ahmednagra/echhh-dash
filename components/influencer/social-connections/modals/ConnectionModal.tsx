// =============================================================================
// src/components/influencer/social-connections/modals/ConnectionModal.tsx
// =============================================================================
// Modal component for initiating OAuth connection flow
// =============================================================================

'use client';

import React, { useEffect, useCallback } from 'react';
import { X, Shield, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SocialPlatformConfig, OAuthFlowState } from '@/types/influencer-social-connections';
import PlatformIcon from '../icons/PlatformIcon';
import { ScopesSummary } from '../ui/FeatureTag';
import { INSTAGRAM_SCOPES } from '@/constants/social-platforms';

// =============================================================================
// TYPES
// =============================================================================

interface ConnectionModalProps {
  isOpen: boolean;
  platform: SocialPlatformConfig | null;
  oauthState: OAuthFlowState;
  onClose: () => void;
  onConnect: (platformId: string, scopes: string[]) => void;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ConnectionModal({
  isOpen,
  platform,
  oauthState,
  onClose,
  onConnect,
  className = '',
}: ConnectionModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && oauthState.step !== 'redirecting') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, oauthState.step]);

  // Handle connect button click
  const handleConnect = useCallback(() => {
    if (platform) {
      const allScopes = [...platform.requiredScopes, ...platform.optionalScopes];
      onConnect(platform.id, allScopes);
    }
  }, [platform, onConnect]);

  if (!isOpen || !platform) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={oauthState.step === 'idle' || oauthState.step === 'error' ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl
          transform transition-all duration-300
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          ${className}
        `}
      >
        {/* Close Button */}
        {(oauthState.step === 'idle' || oauthState.step === 'error' || oauthState.step === 'success') && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-gray-100 text-gray-500
                     hover:bg-gray-200 hover:text-gray-700 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Content based on step */}
        {oauthState.step === 'success' ? (
          <SuccessContent onClose={onClose} platform={platform} />
        ) : oauthState.step === 'error' ? (
          <ErrorContent
            error={oauthState.error}
            onRetry={handleConnect}
            onClose={onClose}
            platform={platform}
          />
        ) : oauthState.step === 'initiating' || oauthState.step === 'redirecting' || oauthState.step === 'processing' ? (
          <LoadingContent step={oauthState.step} platform={platform} />
        ) : (
          <IdleContent
            platform={platform}
            onConnect={handleConnect}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// IDLE CONTENT - Initial connection screen
// =============================================================================

interface IdleContentProps {
  platform: SocialPlatformConfig;
  onConnect: () => void;
  onClose: () => void;
}

function IdleContent({ platform, onConnect, onClose }: IdleContentProps) {
  const allScopes = [...platform.requiredScopes, ...platform.optionalScopes];

  return (
    <>
      {/* Header */}
      <div className="p-6 pb-0">
        <PlatformIcon
          platform={platform.slug}
          size="xl"
          showBackground
          className="mb-5"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Connect {platform.displayName}
        </h2>
        <p className="text-gray-500">
          Link your {platform.displayName} account to manage your presence directly from Echooo.
        </p>
      </div>

      {/* Body */}
      <div className="p-6">
        {/* Steps */}
        <div className="space-y-4 mb-6">
          <ConnectionStep
            number={1}
            title={`Sign in to ${platform.displayName}`}
            description={`You'll be redirected to ${platform.displayName} to log in securely.`}
          />
          <ConnectionStep
            number={2}
            title="Authorize Echooo"
            description="Grant Echooo permission to access your account data."
          />
          <ConnectionStep
            number={3}
            title="Start Managing"
            description="Access DMs, comments, and insights instantly."
          />
        </div>

        {/* Permissions */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Permissions We'll Request</h3>
          </div>
          <ScopesSummary scopes={allScopes} />
        </div>

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl mb-6">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-blue-900 font-medium">Secure Connection</p>
            <p className="text-xs text-blue-700 mt-0.5">
              We never store your password. All data is encrypted and you can disconnect anytime.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 px-4 rounded-xl font-semibold text-gray-600
                     bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConnect}
            className={`
              flex-1 py-3.5 px-4 rounded-xl font-semibold text-white
              flex items-center justify-center gap-2
              shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all
              ${getButtonGradient(platform.slug)}
            `}
          >
            <ExternalLink className="w-4 h-4" />
            Connect {platform.displayName}
          </button>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// LOADING CONTENT
// =============================================================================

interface LoadingContentProps {
  step: 'initiating' | 'redirecting' | 'processing';
  platform: SocialPlatformConfig;
}

function LoadingContent({ step, platform }: LoadingContentProps) {
  const messages = {
    initiating: 'Preparing secure connection...',
    redirecting: `Redirecting to ${platform.displayName}...`,
    processing: 'Processing your connection...',
  };

  return (
    <div className="p-8 text-center">
      <div className={`
        w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
        ${getButtonGradient(platform.slug)}
      `}>
        <Loader2 className="w-10 h-10 text-white animate-spin" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {step === 'redirecting' ? 'Opening Authorization' : 'Please Wait'}
      </h3>
      <p className="text-gray-500">{messages[step]}</p>
      
      {step === 'redirecting' && (
        <p className="text-sm text-gray-400 mt-4">
          A new window should open. If it doesn't,{' '}
          <button className="text-purple-600 hover:underline">click here</button>.
        </p>
      )}
    </div>
  );
}

// =============================================================================
// SUCCESS CONTENT
// =============================================================================

interface SuccessContentProps {
  platform: SocialPlatformConfig;
  onClose: () => void;
}

function SuccessContent({ platform, onClose }: SuccessContentProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center animate-scale-in">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Successfully Connected!
      </h3>
      <p className="text-gray-500 mb-6">
        Your {platform.displayName} account has been linked to Echooo.
      </p>
      <button
        onClick={onClose}
        className="w-full py-3.5 px-4 rounded-xl font-semibold text-white
                 bg-green-600 hover:bg-green-700 transition-colors"
      >
        Done
      </button>
    </div>
  );
}

// =============================================================================
// ERROR CONTENT
// =============================================================================

interface ErrorContentProps {
  error: string | null;
  platform: SocialPlatformConfig;
  onRetry: () => void;
  onClose: () => void;
}

function ErrorContent({ error, platform, onRetry, onClose }: ErrorContentProps) {
  return (
    <div className="p-8 text-center">
      <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Connection Failed
      </h3>
      <p className="text-gray-500 mb-2">
        {error || `We couldn't connect your ${platform.displayName} account.`}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        Please try again or contact support if the issue persists.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-600
                   bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 px-4 rounded-xl font-semibold text-white
                   bg-purple-600 hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface ConnectionStepProps {
  number: number;
  title: string;
  description: string;
}

function ConnectionStep({ number, title, description }: ConnectionStepProps) {
  return (
    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 
                    flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getButtonGradient(platform: string): string {
  const gradients: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400',
    tiktok: 'bg-black',
    youtube: 'bg-red-600',
    twitter: 'bg-black',
    facebook: 'bg-blue-600',
  };
  return gradients[platform] || 'bg-purple-600';
}

// =============================================================================
// CSS ANIMATION (add to global styles)
// =============================================================================

// @keyframes scale-in {
//   from { transform: scale(0); }
//   to { transform: scale(1); }
// }
// .animate-scale-in {
//   animation: scale-in 0.5s ease-out;
// }