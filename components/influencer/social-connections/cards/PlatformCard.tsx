// =============================================================================
// src/components/influencer/social-connections/cards/PlatformCard.tsx
// =============================================================================
// Platform card component for connecting social media accounts
// =============================================================================

'use client';

import React from 'react';
import { Link2, Plus, Clock, ExternalLink } from 'lucide-react';
import { SocialPlatformConfig } from '@/types/influencer-social-connections';
import PlatformIcon from '../icons/PlatformIcon';
import { ConnectionCountBadge, ComingSoonBadge } from '../ui/StatusBadge';
import { FeatureTagsGroup } from '../ui/FeatureTag';

// =============================================================================
// TYPES
// =============================================================================

interface PlatformCardProps {
  platform: SocialPlatformConfig;
  connectedCount?: number;
  isConnecting?: boolean;
  onConnect: (platformId: string) => void;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function PlatformCard({
  platform,
  connectedCount = 0,
  isConnecting = false,
  onConnect,
  className = '',
}: PlatformCardProps) {
  const isConnected = connectedCount > 0;
  const isDisabled = !platform.isEnabled || platform.isComingSoon;

  const handleConnect = () => {
    if (!isDisabled && !isConnecting) {
      onConnect(platform.id);
    }
  };

  return (
    <div
      className={`
        relative bg-gray-50 rounded-2xl p-6 border-2 transition-all duration-200
        ${isConnected
          ? 'border-green-300 bg-gradient-to-b from-green-50 to-white'
          : isDisabled
            ? 'border-gray-200 opacity-75'
            : 'border-gray-200 hover:border-gray-300 hover:bg-white hover:shadow-md'
        }
        ${className}
      `}
    >
      {/* Coming Soon Badge */}
      {platform.isComingSoon && (
        <div className="absolute top-4 right-4">
          <ComingSoonBadge />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <PlatformIcon
          platform={platform.slug}
          size="xl"
          showBackground
        />
        
        {isConnected && !platform.isComingSoon && (
          <ConnectionCountBadge 
            count={connectedCount} 
            variant="success" 
          />
        )}
      </div>

      {/* Platform Info */}
      <h3 className="text-xl font-bold text-gray-900 mb-1">
        {platform.displayName}
      </h3>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">
        {getPlatformDescription(platform.slug)}
      </p>

      {/* Features */}
      <div className="mb-5">
        <FeatureTagsGroup
          features={platform.features.map(f => ({
            id: f.id,
            name: f.name,
            icon: f.icon as any,
            isEnabled: f.isEnabled,
          }))}
          maxVisible={4}
          size="sm"
        />
      </div>

      {/* Connect Button */}
      <button
        onClick={handleConnect}
        disabled={isDisabled || isConnecting}
        className={`
          w-full py-3.5 px-4 rounded-xl font-semibold text-sm
          flex items-center justify-center gap-2
          transition-all duration-200
          disabled:cursor-not-allowed
          ${platform.isComingSoon
            ? 'bg-gray-100 text-gray-400 border border-gray-200'
            : isConnected
              ? getConnectedButtonStyle(platform.slug)
              : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-600 hover:to-purple-700 shadow-md hover:shadow-lg hover:-translate-y-0.5'
          }
        `}
      >
        {isConnecting ? (
          <>
            <LoadingSpinner />
            Connecting...
          </>
        ) : platform.isComingSoon ? (
          <>
            <Clock className="w-4 h-4" />
            Coming Soon
          </>
        ) : isConnected ? (
          <>
            <Plus className="w-4 h-4" />
            Add Another Account
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            Connect {platform.displayName}
          </>
        )}
      </button>

      {/* Max Accounts Info */}
      {!platform.isComingSoon && isConnected && (
        <p className="text-xs text-gray-400 text-center mt-3">
          {connectedCount} of {platform.maxAccountsPerUser} accounts connected
        </p>
      )}
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getPlatformDescription(platform: string): string {
  const descriptions: Record<string, string> = {
    instagram: 'Manage DMs, comments, schedule posts, and track insights directly from your dashboard.',
    tiktok: 'View analytics, manage comments, and track video performance metrics.',
    youtube: 'Manage your channel, track subscribers, and engage with comments.',
    twitter: 'Schedule tweets, track engagement, and manage your presence.',
    facebook: 'Manage Page messages, posts, and track audience engagement.',
  };
  return descriptions[platform] || 'Connect to manage your account.';
}

function getConnectedButtonStyle(platform: string): string {
  const styles: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 shadow-md hover:shadow-lg',
    tiktok: 'bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg',
    youtube: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
    twitter: 'bg-black text-white hover:bg-gray-900 shadow-md hover:shadow-lg',
    facebook: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
  };
  return styles[platform] || 'bg-gray-800 text-white';
}

// =============================================================================
// LOADING SPINNER
// =============================================================================

function LoadingSpinner() {
  return (
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
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

export function PlatformCardSkeleton() {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-xl bg-gray-200" />
        <div className="w-24 h-6 rounded-full bg-gray-200" />
      </div>
      <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-4" />
      <div className="flex gap-2 mb-5">
        <div className="h-6 w-16 bg-gray-200 rounded" />
        <div className="h-6 w-20 bg-gray-200 rounded" />
        <div className="h-6 w-14 bg-gray-200 rounded" />
      </div>
      <div className="h-12 w-full bg-gray-200 rounded-xl" />
    </div>
  );
}