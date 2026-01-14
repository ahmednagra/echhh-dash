// src/components/messaging/AccountSwitcher.tsx
/**
 * Account Switcher Component
 * 
 * Allows users to switch between different connected social media accounts
 * Shows platform icon, username, and connection status
 * 
 * Design: Similar to Slack workspace switcher or Discord server list
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle, AlertCircle, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { AgentSocialConnection } from '@/types/agent-social-connections';
import { MessagingPlatform } from '@/types/messaging';

interface AccountSwitcherProps {
  connections: AgentSocialConnection[];
  activeConnectionId: string | null;
  onConnectionSelect: (connection: AgentSocialConnection, platform: MessagingPlatform) => void;
  isLoading?: boolean;
}

export default function AccountSwitcher({
  connections,
  activeConnectionId,
  onConnectionSelect,
  isLoading = false,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get active connection details
  const activeConnection = connections.find((conn) => conn.id === activeConnectionId);

  // Map platform names to icons
  const getPlatformIcon = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name === 'instagram') return <Instagram className="w-5 h-5" />;
    if (name === 'facebook') return <Facebook className="w-5 h-5" />;
    if (name === 'whatsapp') return <MessageCircle className="w-5 h-5" />;
    return <MessageCircle className="w-5 h-5" />;
  };

  // Map platform name to MessagingPlatform enum
  const getPlatformEnum = (platformName: string): MessagingPlatform => {
    const name = platformName.toLowerCase();
    if (name === 'instagram') return MessagingPlatform.INSTAGRAM;
    if (name === 'facebook') return MessagingPlatform.FACEBOOK;
    if (name === 'whatsapp') return MessagingPlatform.WHATSAPP;
    return MessagingPlatform.INSTAGRAM; // default
  };

  // Get platform color
  const getPlatformColor = (platformName: string) => {
    const name = platformName.toLowerCase();
    if (name === 'instagram') return 'text-pink-600 bg-pink-50';
    if (name === 'facebook') return 'text-blue-600 bg-blue-50';
    if (name === 'whatsapp') return 'text-green-600 bg-green-50';
    return 'text-gray-600 bg-gray-50';
  };

  const handleConnectionSelect = (connection: AgentSocialConnection) => {
    const platform = getPlatformEnum(connection.platform?.name || '');
    onConnectionSelect(connection, platform);
    setIsOpen(false);
  };

  if (connections.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            No connected accounts found. Please connect a social media account in Settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Selected Account Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {activeConnection ? (
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Platform Icon */}
            <div className={`flex-shrink-0 p-2 rounded-lg ${getPlatformColor(activeConnection.platform?.name || '')}`}>
              {getPlatformIcon(activeConnection.platform?.name || '')}
            </div>
            
            {/* Account Info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  @{activeConnection.platform_username}
                </p>
                {activeConnection.is_active && (
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {activeConnection.platform?.name}
              </p>
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-500">Select an account</span>
        )}
        
        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 px-2 py-1">
                Connected Accounts ({connections.length})
              </p>
            </div>
            
            <div className="p-2 space-y-1">
              {connections.map((connection) => (
                <button
                  key={connection.id}
                  onClick={() => handleConnectionSelect(connection)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                    connection.id === activeConnectionId
                      ? 'bg-indigo-50 border border-indigo-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  {/* Platform Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-lg ${getPlatformColor(connection.platform?.name || '')}`}>
                    {getPlatformIcon(connection.platform?.name || '')}
                  </div>
                  
                  {/* Account Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        @{connection.platform_username}
                      </p>
                      {connection.is_active && (
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {connection.platform?.name}
                      {connection.display_name && ` • ${connection.display_name}`}
                    </p>
                  </div>
                  
                  {/* Selection Indicator */}
                  {connection.id === activeConnectionId && (
                    <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}