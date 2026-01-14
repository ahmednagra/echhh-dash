// =============================================================================
// src/utils/social-connections.utils.ts
// =============================================================================
// Utility functions for influencer social media connections
// =============================================================================

import { 
  ConnectionStatus,
  InfluencerSocialConnection,
  SocialPlatformType,
} from '@/types/influencer-social-connections';

import {
  STATUS_BADGE_STYLES,
  OAUTH_ERROR_MESSAGES,
} from '@/constants/social-platforms';
import { CONNECTION_STATUS_LABELS } from '@/types/influencer-social-connections';

// =============================================================================
// NUMBER FORMATTING
// =============================================================================

/**
 * Format large numbers with K, M, B suffixes
 * @example formatFollowerCount(1234567) => "1.2M"
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1_000_000_000) {
    return `${(count / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return count.toString();
}

/**
 * Format engagement rate as percentage
 * @example formatEngagementRate(0.0523) => "5.23%"
 */
export function formatEngagementRate(rate: number | null): string {
  if (rate === null || rate === undefined) return 'N/A';
  return `${(rate * 100).toFixed(2)}%`;
}

/**
 * Format number with locale-aware separators
 * @example formatNumber(1234567) => "1,234,567"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// =============================================================================
// DATE/TIME FORMATTING
// =============================================================================

/**
 * Format date to relative time string
 * @example formatRelativeTime(new Date()) => "just now"
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w ago`;
  
  return then.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: then.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Format token expiration time
 * @example formatTokenExpiry("2024-12-31T23:59:59Z") => "Expires in 23 days"
 */
export function formatTokenExpiry(expiresAt: string | null): string {
  if (!expiresAt) return 'No expiration';
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffInHours = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 0) return 'Expired';
  if (diffInHours < 1) return 'Expires soon';
  if (diffInHours < 24) return `Expires in ${diffInHours}h`;
  if (diffInHours < 168) return `Expires in ${Math.floor(diffInHours / 24)}d`;
  return `Expires in ${Math.floor(diffInHours / 168)}w`;
}

/**
 * Format date to standard display format
 */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format datetime to standard display format
 */
export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

/**
 * Get status display label
 */
export function getStatusLabel(status: ConnectionStatus): string {
  return CONNECTION_STATUS_LABELS[status] || 'Unknown';
}

/**
 * Get status badge styling
 */
export function getStatusBadgeStyle(status: ConnectionStatus) {
  return STATUS_BADGE_STYLES[status] || STATUS_BADGE_STYLES.error;
}

/**
 * Check if connection needs attention
 */
export function connectionNeedsAttention(connection: InfluencerSocialConnection): boolean {
  return (
    connection.status !== 'active' ||
    connection.error_count > 0 ||
    isTokenExpiringSoon(connection.token_expires_at)
  );
}

/**
 * Check if token is expiring soon (within 24 hours)
 */
export function isTokenExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const hoursUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilExpiry > 0 && hoursUntilExpiry < 24;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

// =============================================================================
// CONNECTION HELPERS
// =============================================================================

/**
 * Get connection health status
 */
export function getConnectionHealth(connection: InfluencerSocialConnection): 'healthy' | 'warning' | 'critical' {
  if (connection.status !== 'active') return 'critical';
  if (connection.error_count >= 3) return 'critical';
  if (connection.error_count > 0) return 'warning';
  if (isTokenExpiringSoon(connection.token_expires_at)) return 'warning';
  return 'healthy';
}

/**
 * Get enabled features count for a connection
 */
export function getEnabledFeaturesCount(connection: InfluencerSocialConnection): number {
  let count = 0;
  if (connection.is_dm_enabled) count++;
  if (connection.is_comments_enabled) count++;
  if (connection.is_posting_enabled) count++;
  if (connection.is_insights_enabled) count++;
  return count;
}

/**
 * Group connections by platform
 */
export function groupConnectionsByPlatform(
  connections: InfluencerSocialConnection[]
): Record<SocialPlatformType, InfluencerSocialConnection[]> {
  return connections.reduce((acc, connection) => {
    const platform = connection.platform?.slug as SocialPlatformType || 'instagram';
    if (!acc[platform]) {
      acc[platform] = [];
    }
    acc[platform].push(connection);
    return acc;
  }, {} as Record<SocialPlatformType, InfluencerSocialConnection[]>);
}

/**
 * Sort connections by various criteria
 */
export function sortConnections(
  connections: InfluencerSocialConnection[],
  sortBy: 'created_at' | 'followers_count' | 'engagement_rate' | 'status' = 'created_at',
  order: 'asc' | 'desc' = 'desc'
): InfluencerSocialConnection[] {
  return [...connections].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'followers_count':
        comparison = a.followers_count - b.followers_count;
        break;
      case 'engagement_rate':
        comparison = (a.engagement_rate || 0) - (b.engagement_rate || 0);
        break;
      case 'status':
        const statusOrder: ConnectionStatus[] = ['active', 'pending', 'expired', 'error', 'revoked', 'suspended'];
        comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        break;
      case 'created_at':
      default:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
}

// =============================================================================
// OAUTH HELPERS
// =============================================================================

/**
 * Get user-friendly OAuth error message
 */
export function getOAuthErrorMessage(errorCode: string): string {
  return OAUTH_ERROR_MESSAGES[errorCode] || 'An unexpected error occurred. Please try again.';
}

/**
 * Generate a cryptographically secure state parameter
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate PKCE code verifier for enhanced security
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate PKCE code challenge from verifier
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(digest));
}

/**
 * Base64 URL encode helper
 */
function base64URLEncode(buffer: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate platform slug
 */
export function isValidPlatform(platform: string): platform is SocialPlatformType {
  const validPlatforms: SocialPlatformType[] = ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'];
  return validPlatforms.includes(platform as SocialPlatformType);
}

/**
 * Validate OAuth state parameter format
 */
export function isValidOAuthState(state: string): boolean {
  // State should be a 64-character hex string
  return /^[a-f0-9]{64}$/i.test(state);
}

/**
 * Validate connection ID format (UUID)
 */
export function isValidConnectionId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

// =============================================================================
// PLATFORM-SPECIFIC HELPERS
// =============================================================================

/**
 * Build Instagram profile URL
 */
export function buildInstagramProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}`;
}

/**
 * Build TikTok profile URL
 */
export function buildTikTokProfileUrl(username: string): string {
  return `https://www.tiktok.com/@${username}`;
}

/**
 * Build platform profile URL
 */
export function buildProfileUrl(platform: SocialPlatformType, username: string): string {
  switch (platform) {
    case 'instagram':
      return buildInstagramProfileUrl(username);
    case 'tiktok':
      return buildTikTokProfileUrl(username);
    case 'youtube':
      return `https://www.youtube.com/@${username}`;
    case 'twitter':
      return `https://x.com/${username}`;
    case 'facebook':
      return `https://www.facebook.com/${username}`;
    default:
      return '#';
  }
}

// =============================================================================
// ANALYTICS HELPERS
// =============================================================================

/**
 * Calculate total followers across all connections
 */
export function calculateTotalFollowers(connections: InfluencerSocialConnection[]): number {
  return connections.reduce((sum, conn) => sum + (conn.followers_count || 0), 0);
}

/**
 * Calculate average engagement rate across connections
 */
export function calculateAverageEngagement(connections: InfluencerSocialConnection[]): number {
  const validConnections = connections.filter(c => c.engagement_rate !== null);
  if (validConnections.length === 0) return 0;
  
  const totalEngagement = validConnections.reduce(
    (sum, conn) => sum + (conn.engagement_rate || 0), 
    0
  );
  return totalEngagement / validConnections.length;
}

/**
 * Get connection statistics summary
 */
export function getConnectionStatistics(connections: InfluencerSocialConnection[]) {
  const grouped = groupConnectionsByPlatform(connections);
  
  return {
    total: connections.length,
    active: connections.filter(c => c.status === 'active').length,
    needsAttention: connections.filter(connectionNeedsAttention).length,
    totalFollowers: calculateTotalFollowers(connections),
    averageEngagement: calculateAverageEngagement(connections),
    byPlatform: Object.entries(grouped).reduce((acc, [platform, conns]) => {
      acc[platform as SocialPlatformType] = conns.length;
      return acc;
    }, {} as Record<SocialPlatformType, number>),
  };
}