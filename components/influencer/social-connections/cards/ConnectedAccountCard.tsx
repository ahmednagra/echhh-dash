// =============================================================================
// src/components/influencer/social-connections/cards/ConnectedAccountCard.tsx
// =============================================================================
// Card component for displaying connected social media accounts
// =============================================================================

'use client';

import React, { useState } from 'react';
import {
  MessageCircle,
  Settings,
  RefreshCw,
  Trash2,
  ExternalLink,
  MoreVertical,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { InfluencerSocialConnection, SocialPlatformType } from '@/types/influencer-social-connections';
import PlatformIcon from '../icons/PlatformIcon';
import StatusBadge, { VerifiedBadge, AccountTypeBadge } from '../ui/StatusBadge';
import { MiniStatCard } from '../ui/StatCard';
import {
  formatFollowerCount,
  formatEngagementRate,
  formatRelativeTime,
  formatTokenExpiry,
  buildProfileUrl,
  connectionNeedsAttention,
  getConnectionHealth,
} from '@/utils/social-connections.utils';

// =============================================================================
// TYPES
// =============================================================================

interface ConnectedAccountCardProps {
  connection: InfluencerSocialConnection;
  onViewMessages?: (connectionId: string) => void;
  onOpenSettings?: (connectionId: string) => void;
  onRefreshToken?: (connectionId: string) => void;
  onDisconnect?: (connectionId: string) => void;
  isRefreshing?: boolean;
  isDisconnecting?: boolean;
  className?: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function ConnectedAccountCard({
  connection,
  onViewMessages,
  onOpenSettings,
  onRefreshToken,
  onDisconnect,
  isRefreshing = false,
  isDisconnecting = false,
  className = '',
}: ConnectedAccountCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const platform = (connection.platform?.slug as SocialPlatformType) || 'instagram';
  const needsAttention = connectionNeedsAttention(connection);
  const health = getConnectionHealth(connection);
  const profileUrl = buildProfileUrl(platform, connection.platform_username);

  return (
    <div
      className={`
        bg-gray-50 rounded-2xl p-5 border transition-all duration-200
        ${needsAttention
          ? 'border-yellow-300 bg-gradient-to-b from-yellow-50 to-white'
          : 'border-gray-200 hover:bg-white hover:shadow-sm'
        }
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {connection.profile_image_url ? (
            <img
              src={connection.profile_image_url}
              alt={connection.display_name || connection.platform_username}
              className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold text-lg">
              {(connection.display_name || connection.platform_username).charAt(0).toUpperCase()}
            </div>
          )}
          
          {/* Platform Badge */}
          <div className="absolute -bottom-1 -right-1">
            <PlatformIcon
              platform={platform}
              size="sm"
              showBackground
              className="w-5 h-5 border-2 border-white rounded-md"
            />
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {connection.display_name || connection.platform_username}
            </h4>
            {connection.is_verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-gray-500 truncate">
            @{connection.platform_username}
          </p>
        </div>

        {/* Status & Menu */}
        <div className="flex items-center gap-2">
          <StatusBadge status={connection.status} size="sm" />
          
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                  <a
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Profile
                  </a>
                  {onRefreshToken && (
                    <button
                      onClick={() => {
                        onRefreshToken(connection.id);
                        setShowMenu(false);
                      }}
                      disabled={isRefreshing}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                      Refresh Token
                    </button>
                  )}
                  <div className="border-t border-gray-100 my-1" />
                  {onDisconnect && (
                    <button
                      onClick={() => {
                        onDisconnect(connection.id);
                        setShowMenu(false);
                      }}
                      disabled={isDisconnecting}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Disconnect
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {needsAttention && (
        <div className="flex items-center gap-2 p-2.5 mb-4 bg-yellow-100 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            {connection.status === 'expired'
              ? 'Token expired. Please refresh to continue.'
              : connection.error_count > 0
                ? `${connection.error_count} error(s) occurred. Check connection health.`
                : 'Token expiring soon. Consider refreshing.'}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <MiniStatCard
          label="Followers"
          value={formatFollowerCount(connection.followers_count)}
        />
        <MiniStatCard
          label="Engagement"
          value={formatEngagementRate(connection.engagement_rate)}
        />
        <MiniStatCard
          label="Posts"
          value={formatFollowerCount(connection.posts_count)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {onViewMessages && connection.is_dm_enabled && (
          <button
            onClick={() => onViewMessages(connection.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg
                     bg-purple-100 text-purple-700 font-medium text-sm
                     hover:bg-purple-600 hover:text-white transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Messages
          </button>
        )}
        
        {onOpenSettings && (
          <button
            onClick={() => onOpenSettings(connection.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg
                     bg-gray-100 text-gray-600 font-medium text-sm
                     hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          <AccountTypeBadge type={connection.account_type} />
        </div>
        <span>Connected {formatRelativeTime(connection.connected_at)}</span>
      </div>
    </div>
  );
}

// =============================================================================
// COMPACT VARIANT
// =============================================================================

interface ConnectedAccountCompactProps {
  connection: InfluencerSocialConnection;
  onSelect?: (connectionId: string) => void;
  isSelected?: boolean;
  className?: string;
}

export function ConnectedAccountCompact({
  connection,
  onSelect,
  isSelected = false,
  className = '',
}: ConnectedAccountCompactProps) {
  const platform = (connection.platform?.slug as SocialPlatformType) || 'instagram';

  return (
    <button
      onClick={() => onSelect?.(connection.id)}
      className={`
        w-full flex items-center gap-3 p-3 rounded-xl border transition-all
        ${isSelected
          ? 'border-purple-300 bg-purple-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
        ${className}
      `}
    >
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        {connection.profile_image_url ? (
          <img
            src={connection.profile_image_url}
            alt={connection.platform_username}
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
            {connection.platform_username.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="absolute -bottom-1 -right-1">
          <PlatformIcon platform={platform} size="sm" showBackground className="w-4 h-4" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          @{connection.platform_username}
        </p>
        <p className="text-xs text-gray-500">
          {formatFollowerCount(connection.followers_count)} followers
        </p>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        {connection.status === 'active' ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
      </div>
    </button>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

export function ConnectedAccountCardSkeleton() {
  return (
    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-24 bg-gray-200 rounded mb-1" />
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="h-6 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="h-14 bg-gray-200 rounded-lg" />
        <div className="h-14 bg-gray-200 rounded-lg" />
        <div className="h-14 bg-gray-200 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
        <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
}