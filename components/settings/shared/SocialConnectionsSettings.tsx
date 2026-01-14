// src/components/settings/shared/SocialConnectionsSettings.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter, 
  Youtube,
  Plus,
  Trash2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Users,
  BarChart3,
  ExternalLink,
  Share2,
  Power,
  Eye
} from 'lucide-react';

import SettingsCard from './SettingsCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import services
import { 
  getUserSocialConnections,
  deleteSocialConnection,
  refreshConnectionToken,
  toggleConnectionAutomation,
  checkConnectionHealth,
  initiateOAuthConnection,
  checkOAuthStatus,
} from '@/services/agent-social-connections/agent-social-connections.client';
import { AgentSocialConnection } from '@/types/agent-social-connections';
import { getPlatformByName } from '@/services/platform/platforms.service';
import { getPlatformConfig, PLATFORM_NAMES } from '../../../utils/platform-helpers';

interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: React.ReactNode;
  max_accounts: number;
  color: string;
  gradient: string;
  description: string;
}

interface ConnectionStatus {
  [platformId: string]: {
    count: number;
    max_allowed: number;
    connections: AgentSocialConnection[];
  };
}

export default function SocialConnectionsSettings() {
  const [connections, setConnections] = useState<AgentSocialConnection[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({});
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      slug: 'instagram',
      icon: <Instagram className="w-5 h-5" />,
      max_accounts: 5,
      color: 'text-pink-600',
      gradient: 'from-purple-500 via-pink-500 to-orange-400',
      description: 'Connect Instagram business and creator accounts'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      slug: 'facebook',
      icon: <Facebook className="w-5 h-5" />,
      max_accounts: 5,
      color: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      description: 'Connect Facebook pages and profiles'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      slug: 'twitter',
      icon: <Twitter className="w-5 h-5" />,
      max_accounts: 5,
      color: 'text-blue-400',
      gradient: 'from-gray-800 to-gray-900',
      description: 'Connect Twitter/X accounts for engagement'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      slug: 'linkedin',
      icon: <Linkedin className="w-5 h-5" />,
      max_accounts: 3,
      color: 'text-blue-700',
      gradient: 'from-blue-600 to-blue-800',
      description: 'Connect LinkedIn professional profiles'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      slug: 'youtube',
      icon: <Youtube className="w-5 h-5" />,
      max_accounts: 3,
      color: 'text-red-600',
      gradient: 'from-red-500 to-red-700',
      description: 'Connect YouTube channels for content creators'
    }
  ];

  useEffect(() => {
    loadConnections();
  }, []);

  useEffect(() => {
    // Update connection status when connections change
    updateConnectionStatus();
  }, [connections]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      const userConnections = await getUserSocialConnections();
      setConnections(userConnections);
    } catch (error) {
      console.error('Error loading connections:', error);
      setError(error instanceof Error ? error.message : 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const updateConnectionStatus = () => {
    const status: ConnectionStatus = {};
    
    platforms.forEach(platform => {
      const platformConnections = connections.filter(conn => 
        conn.platform?.name?.toLowerCase() === platform.name.toLowerCase()
      );
      
      status[platform.id] = {
        count: platformConnections.length,
        max_allowed: platform.max_accounts,
        connections: platformConnections
      };
    });
    
    setConnectionStatus(status);
  };

  const handleConnectPlatform = async (platform: Platform) => {
    try {
      setIsConnecting(platform.id);
      setError(null);
      setMessage('');
      
      // Step 1: Get Instagram platform from database
      const instagramPlatform = await getPlatformByName(PLATFORM_NAMES.INSTAGRAM);
      
      if (!instagramPlatform) {
          throw new Error('Instagram platform not found in database. Please contact support.');
      }
      
      // Check if platform is active
      if (instagramPlatform.status !== 'ACTIVE') {
          throw new Error('Instagram platform is currently inactive. Please contact support.');
      }
      // Initiate OAuth flow
      const oauthResponse = await initiateOAuthConnection({
        platform_id: instagramPlatform.id,
        additional_scopes: ['instagram_manage_messages'],
        redirect_url: `${window.location.origin}/settings/social-connections`
      });

      // Redirect to OAuth URL
      // window.location.href = oauthResponse.authorization_url;
      window.location.href = "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=4127711784133506&redirect_uri=https://localhost:3000/settings/social-connections/callback/instagram&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";
      
    } catch (error) {
      console.error('Error initiating connection:', error);
      setError(error instanceof Error ? error.message : 'Failed to initiate connection');
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Failed to connect platform');
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnectAccount = async (connection: AgentSocialConnection) => {
    if (!window.confirm(`Are you sure you want to disconnect @${connection.platform_username}?`)) {
      return;
    }

    try {
      setActionLoading(connection.id);
      await deleteSocialConnection(connection.id);
      await loadConnections(); // Reload to get updated list
      setMessage(`Successfully disconnected @${connection.platform_username}`);
      setMessageType('success');
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect account');
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Failed to disconnect account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshToken = async (connection: AgentSocialConnection) => {
    try {
      setActionLoading(connection.id);
      await refreshConnectionToken(connection.id);
      await loadConnections(); // Reload to get updated status
      setMessage(`Token refreshed for @${connection.platform_username}`);
      setMessageType('success');
    } catch (error) {
      console.error('Error refreshing token:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh token');
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Failed to refresh token');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAutomation = async (connection: AgentSocialConnection, enabled: boolean) => {
    try {
      setActionLoading(connection.id);
      await toggleConnectionAutomation(connection.id, enabled);
      
      // Update local state
      setConnections(prevConnections => 
        prevConnections.map(conn => 
          conn.id === connection.id 
            ? { ...conn, agent: conn.agent ? { ...conn.agent, is_automation_enabled: enabled } : undefined }
            : conn
        )
      );
      
      setMessage(`Automation ${enabled ? 'enabled' : 'disabled'} for @${connection.platform_username}`);
      setMessageType('success');
    } catch (error) {
      console.error('Error toggling automation:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle automation');
      setMessageType('error');
      setMessage(error instanceof Error ? error.message : 'Failed to toggle automation');
    } finally {
      setActionLoading(null);
    }
  };

  const getConnectionStatusBadge = (connection: AgentSocialConnection) => {
    if (!connection.is_active) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Inactive</span>;
    }
    
    if (connection.automation_error_count > 0) {
      return <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Issues</span>;
    }
    
    return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Active</span>;
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = platforms.find(p => p.name.toLowerCase() === platformName.toLowerCase());
    return platform?.icon || <Share2 className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SettingsCard
          title="Social Account Connections"
          description="Loading your social media connections..."
          icon={<Share2 className="w-5 h-5" />}
        >
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </SettingsCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Information */}
      <SettingsCard
        title="Social Account Connections"
        description="Manage your connected social media accounts for outreach and relationship management"
        icon={<Share2 className="w-5 h-5" />}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Platform Agent Access</h3>
              <p className="text-sm text-blue-700 mt-1">
                As a Platform Agent, you can connect up to 5 accounts per platform to manage influencer outreach 
                and relationship building across multiple social networks.
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {(message || error) && (
          <div className={`p-4 rounded-md ${
            messageType === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message || error}
          </div>
        )}
      </SettingsCard>

      {/* Available Platforms */}
      <SettingsCard
        title="Connect New Accounts"
        description="Add social media accounts to expand your outreach capabilities"
        icon={<Plus className="w-5 h-5" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => {
            const status = connectionStatus[platform.id];
            const canConnect = !status || status.count < status.max_allowed;
            
            return (
              <div key={platform.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`${platform.color}`}>
                      {platform.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{platform.name}</h3>
                      <p className="text-sm text-gray-500">
                        {status?.count || 0}/{platform.max_accounts} connected
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{platform.description}</p>
                
                <button
                  onClick={() => handleConnectPlatform(platform)}
                  disabled={!canConnect || isConnecting === platform.id}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    canConnect
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isConnecting === platform.id ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Connecting...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      {canConnect ? `Connect ${platform.name}` : 'Limit Reached'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </SettingsCard>

      {/* Connected Accounts */}
      {connections.length > 0 && (
        <SettingsCard
          title="Connected Accounts"
          description="Manage your connected social media accounts"
          icon={<CheckCircle className="w-5 h-5" />}
        >
          <div className="space-y-4">
            {connections.map((connection) => (
              <div key={connection.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-gray-600">
                      {getPlatformIcon(connection.platform?.name || '')}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">
                          @{connection.platform_username}
                        </h4>
                        {getConnectionStatusBadge(connection)}
                      </div>
                      <p className="text-sm text-gray-500">
                        {connection.platform?.name} • Connected {new Date(connection.created_at).toLocaleDateString()}
                      </p>
                      {connection.display_name && (
                        <p className="text-sm text-gray-600">{connection.display_name}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Automation Toggle */}
                    <button
                      onClick={() => handleToggleAutomation(
                        connection, 
                        !connection.agent?.is_automation_enabled
                      )}
                      disabled={actionLoading === connection.id}
                      className={`flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                        connection.agent?.is_automation_enabled
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      {connection.agent?.is_automation_enabled ? 'Auto On' : 'Auto Off'}
                    </button>
                    
                    {/* Refresh Token */}
                    <button
                      onClick={() => handleRefreshToken(connection)}
                      disabled={actionLoading === connection.id}
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                      title="Refresh token"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    
                    {/* Disconnect */}
                    <button
                      onClick={() => handleDisconnectAccount(connection)}
                      disabled={actionLoading === connection.id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-md transition-colors"
                      title="Disconnect account"
                    >
                      {actionLoading === connection.id ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Connection Details */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <span className={`ml-1 ${connection.is_active ? 'text-green-600' : 'text-red-600'}`}>
                        {connection.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Errors:</span>
                      <span className={`ml-1 ${connection.automation_error_count > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {connection.automation_error_count}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Last Used:</span>
                      <span className="ml-1 text-gray-700">
                        {connection.last_automation_use_at 
                          ? new Date(connection.last_automation_use_at).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Platform:</span>
                      <span className="ml-1 text-gray-700">{connection.platform?.name}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SettingsCard>
      )}

      {/* Empty State */}
      {connections.length === 0 && (
        <SettingsCard
          title="No Connected Accounts"
          description="Connect your first social media account to get started"
          icon={<Users className="w-5 h-5" />}
        >
          <div className="text-center py-12">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Get Started with Social Connections</h3>
            <p className="text-gray-600 mb-6">
              Connect your social media accounts to start managing influencer outreach and relationships.
            </p>
            <p className="text-sm text-gray-500">
              Choose a platform above to connect your first account.
            </p>
          </div>
        </SettingsCard>
      )}
    </div>
  );
}