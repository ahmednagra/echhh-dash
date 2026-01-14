// =============================================================================
// src/app/(dashboard)/@influencer/settings/social-connections/page.tsx
// =============================================================================
// Social Connections settings page for influencer users
// Allows connecting and managing social media accounts
// =============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, HelpCircle, Shield, Link2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Types
import {
  InfluencerSocialConnection,
  OAuthFlowState,
  SocialPlatformType,
  ConnectionStatistics,
} from '@/types/influencer-social-connections';

// Constants
import {
  SOCIAL_PLATFORMS,
  getPlatformsInOrder,
  getEnabledPlatforms,
} from '@/constants/social-platforms';

// Utils
import {
  getConnectionStatistics,
  formatFollowerCount,
  formatEngagementRate,
  groupConnectionsByPlatform,
} from '@/utils/social-connections.utils';

// Components
import {
  PlatformCard,
  PlatformCardSkeleton,
  ConnectedAccountCard,
  ConnectedAccountCardSkeleton,
  ConnectionModal,
  StatCard,
  StatsGrid,
  StatCardSkeleton,
  PlatformIcon,
} from '@/components/influencer/social-connections';

// Hooks & Context
import { useAuth } from '@/context/AuthContext';

// =============================================================================
// TYPES
// =============================================================================

interface PageState {
  connections: InfluencerSocialConnection[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function SocialConnectionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // ==========================================================================
  // STATE
  // ==========================================================================

  const [state, setState] = useState<PageState>({
    connections: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
  });

  const [oauthFlow, setOauthFlow] = useState<OAuthFlowState>({
    step: 'idle',
    platform: null,
    authorizationUrl: null,
    state: null,
    error: null,
    errorDescription: null,
  });

  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatformType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const platforms = getPlatformsInOrder();
  const statistics = getConnectionStatistics(state.connections);
  const groupedConnections = groupConnectionsByPlatform(state.connections);

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const loadConnections = useCallback(async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setState(prev => ({ ...prev, isRefreshing: true }));
      }

      // TODO: Replace with actual API call
      // const response = await getInfluencerSocialConnections();
      // setState(prev => ({ ...prev, connections: response.connections }));

      // Mock data for development
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        connections: MOCK_CONNECTIONS,
        isLoading: false,
        isRefreshing: false,
        error: null,
      }));
    } catch (error) {
      console.error('Failed to load connections:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefreshing: false,
        error: error instanceof Error ? error.message : 'Failed to load connections',
      }));
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  // Handle OAuth callback
  useEffect(() => {
    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setOauthFlow({
        step: 'error',
        platform: null,
        authorizationUrl: null,
        state: null,
        error: error,
        errorDescription: errorDescription,
      });
      setIsModalOpen(true);
      // Clean URL
      router.replace('/settings/social-connections', { scroll: false });
    } else if (code && stateParam) {
      handleOAuthCallback(code, stateParam);
    }
  }, [searchParams, router]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const handleConnectPlatform = useCallback((platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    setSelectedPlatform(platform.slug);
    setOauthFlow({
      step: 'idle',
      platform: platform.slug,
      authorizationUrl: null,
      state: null,
      error: null,
      errorDescription: null,
    });
    setIsModalOpen(true);
  }, [platforms]);

  const handleInitiateConnection = useCallback(async (platformId: string, scopes: string[]) => {
    try {
      setOauthFlow(prev => ({ ...prev, step: 'initiating' }));

      // TODO: Replace with actual API call
      // const response = await initiateInfluencerOAuth({ platform_id: platformId, requested_scopes: scopes });

      // Mock OAuth URL for development
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockAuthUrl = `https://www.instagram.com/oauth/authorize?client_id=MOCK_CLIENT_ID&redirect_uri=${encodeURIComponent(window.location.origin + '/settings/social-connections')}&scope=${scopes.join(',')}&response_type=code&state=mock_state_123`;

      setOauthFlow(prev => ({
        ...prev,
        step: 'redirecting',
        authorizationUrl: mockAuthUrl,
        state: 'mock_state_123',
      }));

      // In production, redirect to OAuth URL
      // window.location.href = mockAuthUrl;

      // For demo, simulate success after delay
      setTimeout(() => {
        setOauthFlow(prev => ({ ...prev, step: 'success' }));
        loadConnections();
      }, 2000);

    } catch (error) {
      console.error('Failed to initiate OAuth:', error);
      setOauthFlow(prev => ({
        ...prev,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to initiate connection',
      }));
    }
  }, [loadConnections]);

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      setOauthFlow(prev => ({ ...prev, step: 'processing' }));
      setIsModalOpen(true);

      // TODO: Replace with actual API call
      // await completeInfluencerOAuth({ code, state });

      await new Promise(resolve => setTimeout(resolve, 2000));

      setOauthFlow(prev => ({ ...prev, step: 'success' }));
      loadConnections();

    } catch (error) {
      console.error('OAuth callback failed:', error);
      setOauthFlow(prev => ({
        ...prev,
        step: 'error',
        error: error instanceof Error ? error.message : 'Failed to complete connection',
      }));
    }
  };

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedPlatform(null);
    setOauthFlow({
      step: 'idle',
      platform: null,
      authorizationUrl: null,
      state: null,
      error: null,
      errorDescription: null,
    });
  }, []);

  const handleViewMessages = useCallback((connectionId: string) => {
    router.push(`/messages?connection=${connectionId}`);
  }, [router]);

  const handleOpenSettings = useCallback((connectionId: string) => {
    router.push(`/settings/social-connections/${connectionId}`);
  }, [router]);

  const handleRefreshToken = useCallback(async (connectionId: string) => {
    try {
      setActionLoading(connectionId);
      
      // TODO: Replace with actual API call
      // await refreshInfluencerConnectionToken(connectionId);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadConnections(false);
      
    } catch (error) {
      console.error('Failed to refresh token:', error);
    } finally {
      setActionLoading(null);
    }
  }, [loadConnections]);

  const handleDisconnect = useCallback(async (connectionId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this account?')) {
      return;
    }

    try {
      setActionLoading(connectionId);
      
      // TODO: Replace with actual API call
      // await disconnectInfluencerConnection(connectionId);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setState(prev => ({
        ...prev,
        connections: prev.connections.filter(c => c.id !== connectionId),
      }));
      
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setActionLoading(null);
    }
  }, []);

  const handleRefreshAll = useCallback(() => {
    loadConnections(true);
  }, [loadConnections]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  const selectedPlatformConfig = selectedPlatform ? SOCIAL_PLATFORMS[selectedPlatform] : null;

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="mb-8">
        <Link
          href="/settings"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Back to Settings
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Connect Your Accounts
            </h1>
            <p className="text-gray-500 max-w-2xl">
              Link your social media accounts to manage messages, schedule posts, and track 
              engagement all from one place.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              disabled={state.isRefreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-white border border-gray-200 text-gray-700
                       hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${state.isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                       bg-white border border-gray-200 text-gray-700
                       hover:bg-gray-50 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              Help
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <section className="mb-8">
        <StatsGrid columns={4}>
          {state.isLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Connected Accounts"
                value={statistics.total}
                variant="total"
                icon={<Link2 className="w-6 h-6" />}
              />
              <StatCard
                label="Instagram Accounts"
                value={statistics.byPlatform.instagram || 0}
                variant="instagram"
                icon={<PlatformIcon platform="instagram" size="md" />}
              />
              <StatCard
                label="TikTok Accounts"
                value={statistics.byPlatform.tiktok || 0}
                variant="tiktok"
                icon={<PlatformIcon platform="tiktok" size="md" />}
              />
              <StatCard
                label="Total Followers"
                value={formatFollowerCount(statistics.totalFollowers)}
                variant="default"
                icon={
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </>
          )}
        </StatsGrid>
      </section>

      {/* Error Banner */}
      {state.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-900">{state.error}</p>
            <button
              onClick={() => loadConnections()}
              className="text-sm text-red-700 hover:text-red-800 underline mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Available Platforms - 2 columns */}
        <section className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Platforms</h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect your social accounts to unlock powerful features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {state.isLoading ? (
              <>
                <PlatformCardSkeleton />
                <PlatformCardSkeleton />
                <PlatformCardSkeleton />
                <PlatformCardSkeleton />
              </>
            ) : (
              platforms.map(platform => (
                <PlatformCard
                  key={platform.id}
                  platform={platform}
                  connectedCount={groupedConnections[platform.slug]?.length || 0}
                  isConnecting={oauthFlow.platform === platform.slug && oauthFlow.step !== 'idle'}
                  onConnect={handleConnectPlatform}
                />
              ))
            )}
          </div>
        </section>

        {/* Connected Accounts Panel - 1 column */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-fit">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Connected Accounts</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage your linked social profiles
            </p>
          </div>

          {state.isLoading ? (
            <div className="space-y-4">
              <ConnectedAccountCardSkeleton />
              <ConnectedAccountCardSkeleton />
            </div>
          ) : state.connections.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {state.connections.map(connection => (
                <ConnectedAccountCard
                  key={connection.id}
                  connection={connection}
                  onViewMessages={handleViewMessages}
                  onOpenSettings={handleOpenSettings}
                  onRefreshToken={handleRefreshToken}
                  onDisconnect={handleDisconnect}
                  isRefreshing={actionLoading === connection.id}
                  isDisconnecting={actionLoading === connection.id}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Security Notice */}
      <section className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-4">
        <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Your Data is Secure</h3>
          <p className="text-sm text-blue-700 mt-1">
            We use industry-standard OAuth 2.0 authentication. Your passwords are never stored, 
            and all data is encrypted. You can revoke access at any time from your social media settings.
          </p>
        </div>
      </section>

      {/* Connection Modal */}
      <ConnectionModal
        isOpen={isModalOpen}
        platform={selectedPlatformConfig}
        oauthState={oauthFlow}
        onClose={handleCloseModal}
        onConnect={handleInitiateConnection}
      />
    </div>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

function EmptyState() {
  return (
    <div className="text-center py-10 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Link2 className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No accounts connected
      </h3>
      <p className="text-sm text-gray-500">
        Connect your first social media account to get started.
      </p>
    </div>
  );
}

// =============================================================================
// MOCK DATA (Remove in production)
// =============================================================================

const MOCK_CONNECTIONS: InfluencerSocialConnection[] = [
  {
    id: '1',
    influencer_user_id: 'user-1',
    platform_id: 'instagram',
    platform_user_id: '12345678',
    platform_username: 'sarahjohnson_official',
    display_name: 'Sarah Johnson',
    profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    bio: 'Fashion & Lifestyle Creator',
    followers_count: 1200000,
    following_count: 1500,
    posts_count: 342,
    engagement_rate: 0.048,
    average_likes: 45000,
    average_comments: 1200,
    account_type: 'creator',
    is_verified: true,
    token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    token_scopes: ['instagram_business_basic', 'instagram_business_manage_messages', 'instagram_business_manage_comments'],
    instagram_business_account_id: 'ig_12345',
    facebook_page_id: null,
    facebook_page_name: null,
    status: 'active',
    last_sync_at: new Date().toISOString(),
    last_error_at: null,
    last_error_message: null,
    error_count: 0,
    is_dm_enabled: true,
    is_comments_enabled: true,
    is_posting_enabled: true,
    is_insights_enabled: true,
    webhook_subscribed: true,
    webhook_subscription_id: 'webhook_123',
    connected_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    platform: {
      id: 'instagram',
      name: 'Instagram',
      slug: 'instagram',
      logo_url: '/images/platforms/instagram-logo.svg',
      category: 'social',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: '2',
    influencer_user_id: 'user-1',
    platform_id: 'instagram',
    platform_user_id: '87654321',
    platform_username: 'lifestyle.sarah',
    display_name: 'Lifestyle by Sarah',
    profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    bio: 'Daily inspiration & lifestyle tips',
    followers_count: 85000,
    following_count: 800,
    posts_count: 156,
    engagement_rate: 0.062,
    average_likes: 4200,
    average_comments: 180,
    account_type: 'business',
    is_verified: false,
    token_expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    token_scopes: ['instagram_business_basic', 'instagram_business_manage_messages'],
    instagram_business_account_id: 'ig_87654',
    facebook_page_id: null,
    facebook_page_name: null,
    status: 'active',
    last_sync_at: new Date().toISOString(),
    last_error_at: null,
    last_error_message: null,
    error_count: 0,
    is_dm_enabled: true,
    is_comments_enabled: false,
    is_posting_enabled: false,
    is_insights_enabled: false,
    webhook_subscribed: false,
    webhook_subscription_id: null,
    connected_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    platform: {
      id: 'instagram',
      name: 'Instagram',
      slug: 'instagram',
      logo_url: '/images/platforms/instagram-logo.svg',
      category: 'social',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
];