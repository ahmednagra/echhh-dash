// src/components/dashboard/settings/SocialConnectionsSettings.tsx
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
  ExternalLink
} from 'lucide-react';

// Import services with correct relative paths
import { 
  getUserSocialConnections,
  createSocialConnection,
  deleteSocialConnection,
  validateConnectionToken,
  refreshConnectionToken,
  toggleConnectionAutomation,
  checkConnectionHealth,
  connectPlatformAccount,
  getSocialConnection,
  initiateOAuthConnection,
  checkOAuthStatus,
  AgentSocialConnection
} from '@/services/agent-social-connections/agent-social-connections.client';
import { getPlatformByName } from '@/services/platform/platforms.service';
import { getPlatformConfig, PLATFORM_NAMES } from '../../../utils/platform-helpers';

interface Platform {
  id: string;
  name: string;
  slug: string;
  icon: React.ComponentType<{ className?: string }>;
  max_accounts: number;
  color: string;
  gradient: string;
  description: string;
}

export default function SocialConnectionsSettings() {
  const [connections, setConnections] = useState<AgentSocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const platforms: Platform[] = [
    {
      id: 'instagram',
      name: 'Instagram',
      slug: 'instagram',
      icon: Instagram,
      max_accounts: 5,
      color: 'text-pink-600',
      gradient: 'from-purple-500 via-pink-500 to-orange-400',
      description: 'Connect Instagram business and creator accounts'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      slug: 'facebook',
      icon: Facebook,
      max_accounts: 5,
      color: 'text-blue-600',
      gradient: 'from-blue-600 to-blue-700',
      description: 'Connect Facebook pages and profiles'
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      slug: 'twitter',
      icon: Twitter,
      max_accounts: 5,
      color: 'text-blue-400',
      gradient: 'from-blue-400 to-blue-500',
      description: 'Connect Twitter/X accounts'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      slug: 'linkedin',
      icon: Linkedin,
      max_accounts: 5,
      color: 'text-blue-700',
      gradient: 'from-blue-700 to-blue-800',
      description: 'Connect LinkedIn profiles and company pages'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      slug: 'youtube',
      icon: Youtube,
      max_accounts: 5,
      color: 'text-red-600',
      gradient: 'from-red-500 to-red-600',
      description: 'Connect YouTube channels'
    }
  ];

  // Load connections on component mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading connections...');
      
      const connectionsData = await getUserSocialConnections();
      console.log('Loaded connections:', connectionsData);
      
      setConnections(connectionsData);
    } catch (err) {
      console.error('Error loading connections:', err);
      setError(err instanceof Error ? err.message : 'Failed to load connections');
      // Ensure connections is always an array, even on error
      setConnections([]);
    } finally {
      setLoading(false);
    }
  };

  const getConnectionsForPlatform = (platformSlug: string) => {
    // Ensure connections is an array before filtering
    if (!Array.isArray(connections)) {
      console.warn('Connections is not an array:', connections);
      return [];
    }
    return connections.filter(conn => conn.platform?.name.toLowerCase() === platformSlug);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const isTokenExpiringSoon = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const handleConnectAccount = async (platform: Platform) => {
    const connectedCount = getConnectionsForPlatform(platform.slug).length;
    if (connectedCount >= platform.max_accounts) {
      alert(`You can only connect up to ${platform.max_accounts} ${platform.name} accounts.`);
      return;
    }

    setIsConnecting(platform.slug);
    
    try {
      if (platform.slug === 'instagram') {
        await handleInstagramConnection();
      } else if (platform.slug === 'facebook') {
        await handleFacebookConnection();
      } else if (platform.slug === 'twitter') {
        await handleTwitterConnection();
      } else if (platform.slug === 'linkedin') {
        await handleLinkedInConnection();
      } else if (platform.slug === 'youtube') {
        await handleYouTubeConnection();
      } else {
        throw new Error(`${platform.name} connection not yet implemented`);
      }
    } catch (error) {
      console.error(`Error connecting to ${platform.name}:`, error);
      setError(error instanceof Error ? error.message : `Failed to connect to ${platform.name}`);
    } finally {
      setIsConnecting(null);
    }
  };

  const handleInstagramConnection = async () => {
    try {
      console.log('Initiating Instagram connection...');
      
      // Step 1: Get Instagram platform from database
      const instagramPlatform = await getPlatformByName(PLATFORM_NAMES.INSTAGRAM);
      
      if (!instagramPlatform) {
        throw new Error('Instagram platform not found in database. Please contact support.');
      }
      
      // Check if platform is active
      if (instagramPlatform.status !== 'ACTIVE') {
        throw new Error('Instagram platform is currently inactive. Please contact support.');
      }
      
      console.log('Found Instagram platform:', instagramPlatform);
      
      // Step 2: Initiate OAuth connection
      const initiateRequest = {
        platform_id: instagramPlatform.id,
        additional_scopes: ['instagram_manage_messages'] // Optional: add messaging scope
      };

      console.log('Initiating OAuth flow:', initiateRequest);

      // Step 3: Call initiate-connection API
      const oauthResponse = await initiateOAuthConnection(initiateRequest);
      
      console.log('OAuth initiation response:', oauthResponse);
      
      // Step 4: Open OAuth URL in popup/new tab
      const popup = window.open(
        oauthResponse.authorization_url,
        'instagram_oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups and try again.');
      }

      // Step 5: Poll for OAuth completion
      const connection = await pollOAuthStatus(oauthResponse.state, oauthResponse.platform, popup);
      
      // Step 6: Add the new connection to state
      setConnections(prev => [...prev, connection]);
      
      console.log('Instagram connection successful:', connection);
      
      // Show success message
      setError(null);
      alert(`Instagram account @${connection.platform_username} connected successfully!`);
      
    } catch (error) {
      console.error('Instagram connection error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          setError('Instagram platform not configured. Please contact administrator.');
        } else if (error.message.includes('inactive')) {
          setError('Instagram platform is currently inactive. Please contact administrator.');
        } else if (error.message.includes('popup')) {
          setError('Popup was blocked. Please allow popups and try again.');
        } else if (error.message.includes('OAuth was cancelled')) {
          setError('Instagram connection was cancelled.');
        } else if (error.message.includes('OAuth failed')) {
          setError(`Instagram connection failed: ${error.message}`);
        } else {
          setError(`Instagram connection failed: ${error.message}`);
        }
      } else {
        setError('Instagram connection failed due to an unknown error');
      }
      
      throw error;
    }
  };

  // Helper function to poll OAuth status
  const pollOAuthStatus = async (
    state: string, 
    platform: string, 
    popup: Window
  ): Promise<AgentSocialConnection> => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const pollInterval = setInterval(async () => {
        attempts++;

        // Check if popup was closed by user
        if (popup.closed) {
          clearInterval(pollInterval);
          reject(new Error('OAuth was cancelled by user'));
          return;
        }

        // Check if max attempts reached
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          popup.close();
          reject(new Error('OAuth timeout. Please try again.'));
          return;
        }

        try {
          // Poll OAuth status
          const statusResponse = await checkOAuthStatus(state, platform);
          
          console.log('OAuth status:', statusResponse);

          if (statusResponse.status === 'completed' && statusResponse.connection_id) {
            clearInterval(pollInterval);
            popup.close();
            
            // Get the full connection details
            const connection = await getSocialConnection(statusResponse.connection_id);
            resolve(connection);
          } else if (statusResponse.status === 'failed') {
            clearInterval(pollInterval);
            popup.close();
            reject(new Error(`OAuth failed: ${statusResponse.error_message || 'Unknown error'}`));
          } else if (statusResponse.status === 'expired') {
            clearInterval(pollInterval);
            popup.close();
            reject(new Error('OAuth session expired. Please try again.'));
          }
          // If status is 'pending', continue polling
        } catch (error) {
          console.error('Error polling OAuth status:', error);
          // Continue polling unless it's a critical error
          if (attempts % 10 === 0) { // Log every 10th attempt
            console.warn(`OAuth status check failed (attempt ${attempts}):`, error);
          }
        }
      }, 5000); // Poll every 5 seconds
    });
  };

  const handleFacebookConnection = async () => {
    try {
      const facebookPlatform = await getPlatformByName(PLATFORM_NAMES.FACEBOOK);
      
      if (!facebookPlatform) {
        throw new Error('Facebook platform not found in database.');
      }
      
      if (facebookPlatform.status !== 'ACTIVE') {
        throw new Error('Facebook platform is currently inactive.');
      }
      
      const config = getPlatformConfig('facebook');
      
      const platformRequest = {
        platform_id: facebookPlatform.id,
        platform_specific_data: {
          connection_type: config.connection_type,
          requested_permissions: config.permissions,
          work_platform_id: facebookPlatform.work_platform_id
        }
      };

      const newConnection = await connectPlatformAccount(platformRequest);
      setConnections(prev => [...prev, newConnection]);
      
      setError(null);
      alert('Facebook account connected successfully!');
      
    } catch (error) {
      console.error('Facebook connection error:', error);
      setError(error instanceof Error ? error.message : 'Facebook connection failed');
      throw error;
    }
  };

  const handleTwitterConnection = async () => {
    try {
      const twitterPlatform = await getPlatformByName(PLATFORM_NAMES.TWITTER);
      
      if (!twitterPlatform) {
        throw new Error('Twitter platform not found in database.');
      }
      
      if (twitterPlatform.status !== 'ACTIVE') {
        throw new Error('Twitter platform is currently inactive.');
      }
      
      const config = getPlatformConfig('twitter');
      
      const platformRequest = {
        platform_id: twitterPlatform.id,
        platform_specific_data: {
          connection_type: config.connection_type,
          requested_permissions: config.permissions,
          work_platform_id: twitterPlatform.work_platform_id
        }
      };

      const newConnection = await connectPlatformAccount(platformRequest);
      setConnections(prev => [...prev, newConnection]);
      
      setError(null);
      alert('Twitter account connected successfully!');
      
    } catch (error) {
      console.error('Twitter connection error:', error);
      setError(error instanceof Error ? error.message : 'Twitter connection failed');
      throw error;
    }
  };

  const handleLinkedInConnection = async () => {
    try {
      const linkedinPlatform = await getPlatformByName(PLATFORM_NAMES.LINKEDIN);
      
      if (!linkedinPlatform) {
        throw new Error('LinkedIn platform not found in database.');
      }
      
      if (linkedinPlatform.status !== 'ACTIVE') {
        throw new Error('LinkedIn platform is currently inactive.');
      }
      
      const config = getPlatformConfig('linkedin');
      
      const platformRequest = {
        platform_id: linkedinPlatform.id,
        platform_specific_data: {
          connection_type: config.connection_type,
          requested_permissions: config.permissions,
          work_platform_id: linkedinPlatform.work_platform_id
        }
      };

      const newConnection = await connectPlatformAccount(platformRequest);
      setConnections(prev => [...prev, newConnection]);
      
      setError(null);
      alert('LinkedIn account connected successfully!');
      
    } catch (error) {
      console.error('LinkedIn connection error:', error);
      setError(error instanceof Error ? error.message : 'LinkedIn connection failed');
      throw error;
    }
  };

  const handleYouTubeConnection = async () => {
    try {
      const youtubePlatform = await getPlatformByName(PLATFORM_NAMES.YOUTUBE);
      
      if (!youtubePlatform) {
        throw new Error('YouTube platform not found in database.');
      }
      
      if (youtubePlatform.status !== 'ACTIVE') {
        throw new Error('YouTube platform is currently inactive.');
      }
      
      const config = getPlatformConfig('youtube');
      
      const platformRequest = {
        platform_id: youtubePlatform.id,
        platform_specific_data: {
          connection_type: config.connection_type,
          requested_permissions: config.permissions,
          work_platform_id: youtubePlatform.work_platform_id
        }
      };

      const newConnection = await connectPlatformAccount(platformRequest);
      setConnections(prev => [...prev, newConnection]);
      
      setError(null);
      alert('YouTube account connected successfully!');
      
    } catch (error) {
      console.error('YouTube connection error:', error);
      setError(error instanceof Error ? error.message : 'YouTube connection failed');
      throw error;
    }
  };

  const handleDisconnectAccount = async (connectionId: string, platformName: string) => {
    if (!confirm(`Are you sure you want to disconnect this ${platformName} account?`)) {
      return;
    }

    setActionLoading(connectionId);
    
    try {
      await deleteSocialConnection(connectionId);
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefreshAccount = async (connectionId: string, platformName: string) => {
    setActionLoading(connectionId);
    
    try {
      const validationResult = await refreshConnectionToken(connectionId);
      
      // Update the connection in state
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, last_oauth_check_at: new Date().toISOString(), is_active: true }
            : conn
        )
      );
      
      console.log(`Successfully refreshed ${platformName} account`);
    } catch (error) {
      console.error('Error refreshing account:', error);
      setError(error instanceof Error ? error.message : 'Failed to refresh account');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAutomation = async (connectionId: string, enabled: boolean) => {
    setActionLoading(connectionId);
    
    try {
      await toggleConnectionAutomation(connectionId, enabled);
      
      // Update the connection in state
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connectionId 
            ? { ...conn, agent: conn.agent ? { ...conn.agent, is_automation_enabled: enabled } : undefined }
            : conn
        )
      );
      
      console.log(`Automation ${enabled ? 'enabled' : 'disabled'} for connection`);
    } catch (error) {
      console.error('Error toggling automation:', error);
      setError(error instanceof Error ? error.message : 'Failed to toggle automation');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg border border-gray-200 h-64"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Social Account Connections</h1>
        </div>
        <p className="text-lg text-gray-600">
          Manage your connected social media accounts for outreach and relationship management
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Platform Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const platformConnections = getConnectionsForPlatform(platform.slug);
          const canConnect = platformConnections.length < platform.max_accounts;

          return (
            <div key={platform.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Platform Header */}
              <div className={`bg-gradient-to-r ${platform.gradient} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <platform.icon className="w-8 h-8" />
                    <div>
                      <h3 className="font-semibold text-lg">{platform.name}</h3>
                      <p className="text-sm opacity-90">{platform.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {platformConnections.length}/{platform.max_accounts}
                    </div>
                    <div className="text-xs opacity-90">Connected</div>
                  </div>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="p-6">
                {platformConnections.length > 0 ? (
                  <div className="space-y-4 mb-4">
                    {platformConnections.map((connection) => (
                      <div 
                        key={connection.id} 
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900">
                                {connection.display_name || connection.platform_username}
                              </h4>
                              {connection.is_active ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>@{connection.platform_username}</p>
                              
                              <p className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>Connected {new Date(connection.created_at).toLocaleDateString()}</span>
                              </p>
                              
                              {connection.last_oauth_check_at && (
                                <p className="text-xs text-gray-500">
                                  Last sync: {new Date(connection.last_oauth_check_at).toLocaleString()}
                                </p>
                              )}
                              
                              {/* Automation Status */}
                              {connection.agent && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-xs font-medium">Automation:</span>
                                  <button
                                    onClick={() => handleToggleAutomation(
                                      connection.id, 
                                      !connection.agent?.is_automation_enabled
                                    )}
                                    disabled={actionLoading === connection.id}
                                    className={`text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                                      connection.agent.is_automation_enabled
                                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                    }`}
                                  >
                                    {connection.agent.is_automation_enabled ? 'Enabled' : 'Disabled'}
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Token Status */}
                            {connection.expires_at && (
                              <div className="mt-2">
                                {isTokenExpired(connection.expires_at) ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Token Expired
                                  </span>
                                ) : isTokenExpiringSoon(connection.expires_at) ? (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Expires Soon
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Active
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Error Status */}
                            {connection.automation_error_count > 0 && (
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                  {connection.automation_error_count} Errors
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Account Actions */}
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={() => handleRefreshAccount(connection.id, platform.name)}
                              disabled={actionLoading === connection.id}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                              title="Refresh Connection"
                            >
                              <RefreshCw 
                                className={`w-4 h-4 ${
                                  actionLoading === connection.id ? 'animate-spin' : ''
                                }`} 
                              />
                            </button>
                            
                            <button
                              onClick={() => handleDisconnectAccount(connection.id, platform.name)}
                              disabled={actionLoading === connection.id}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                              title="Disconnect Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <platform.icon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-sm">No {platform.name} accounts connected</p>
                  </div>
                )}

                {/* Connect New Account Button */}
                {canConnect && (
                  <button
                    onClick={() => handleConnectAccount(platform)}
                    disabled={isConnecting === platform.slug}
                    className={`w-full flex items-center justify-center space-x-2 px-4 py-3 
                      bg-gradient-to-r ${platform.gradient} text-white rounded-lg
                      hover:opacity-90 transition-opacity disabled:opacity-50`}
                  >
                    {isConnecting === platform.slug ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Connect {platform.name} Account</span>
                      </>
                    )}
                  </button>
                )}

                {!canConnect && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      Maximum accounts connected ({platform.max_accounts}/{platform.max_accounts})
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Connection Summary</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">
              {Array.isArray(connections) ? connections.filter(conn => conn.is_active).length : 0}
            </div>
            <div className="text-sm text-gray-600">Active Connections</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Array.isArray(connections) ? connections.filter(conn => conn.agent?.is_automation_enabled).length : 0}
            </div>
            <div className="text-sm text-gray-600">Automation Enabled</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Array.isArray(connections) ? new Set(connections.map(conn => conn.platform?.name)).size : 0}
            </div>
            <div className="text-sm text-gray-600">Platforms Connected</div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <BarChart3 className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-indigo-900">Pro Tip</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Connect multiple accounts per platform to diversify your outreach capabilities and 
                manage different types of influencer relationships effectively.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}