// src/app/(dashboard)/messages/page.tsx
/**
 * Messages Page
 * 
 * Main messaging interface for social media conversations
 * Accessible to platform agents and other authorized users
 * 
 * Features:
 * - Account switching (Instagram, Facebook, WhatsApp)
 * - Conversation list with search
 * - Real-time chat interface
 * - Message sending and receiving
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MessagingProvider, useMessaging } from '@/context/MessagingContext';
import { getUserSocialConnections } from '@/services/agent-social-connections/agent-social-connections.client';
import { AgentSocialConnection } from '@/types/agent-social-connections';
import AccountSwitcher from '@/components/messaging/AccountSwitcher';
import ConversationList from '@/components/messaging/ConversationList';
import ChatWindow from '@/components/messaging/ChatWindow';
import { AlertCircle, MessageCircle } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * Messages Content Component
 * Contains the main messaging interface logic
 */
function MessagesContent() {
  const { user } = useAuth();
  const {
    activePlatformConnectionId,
    activePlatform,
    activeConversationThreadId,
    conversationThreads,
    messages,
    isLoading,
    error,
    selectPlatformConnection,
    selectConversationThread,
    sendMessage,
  } = useMessaging();

  const [connections, setConnections] = useState<AgentSocialConnection[]>([]);
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Load user's connected accounts
  useEffect(() => {
    async function loadConnections() {
      try {
        setConnectionsLoading(true);
        const userConnections = await getUserSocialConnections(undefined, true);
        setConnections(userConnections);

        // Auto-select first connection if available
        if (userConnections.length > 0 && !activePlatformConnectionId) {
          const firstConnection = userConnections[0];
          const platform = firstConnection.platform?.name.toLowerCase() as any;
          await selectPlatformConnection(firstConnection.id, platform);
        }
      } catch (error) {
        console.error('Error loading connections:', error);
      } finally {
        setConnectionsLoading(false);
      }
    }

    if (user) {
      loadConnections();
    }
  }, [user]);

  // Handle sending messages
  const handleSendMessage = async (request: any) => {
    try {
      setIsSending(true);
      await sendMessage(request);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  // Get active conversation
  const activeConversation = conversationThreads.find(
    (conv) => conv.id === activeConversationThreadId
  );

  // Get messages for active conversation
  const activeMessages = activeConversationThreadId 
    ? messages[activeConversationThreadId] || []
    : [];

  if (connectionsLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner message="Loading your accounts..." />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            No Connected Accounts
          </h2>
          <p className="text-gray-600 mb-6">
            Connect your social media accounts to start managing conversations and messages.
          </p>
          <a
            href="/settings/social-connections"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Connect Your First Account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your social media conversations
            </p>
          </div>
        </div>
      </div>

      {/* Account Switcher */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <AccountSwitcher
          connections={connections}
          activeConnectionId={activePlatformConnectionId}
          onConnectionSelect={(connection, platform) => {
            selectPlatformConnection(connection.id, platform);
          }}
          isLoading={isLoading}
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
            {error.retryable && (
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation List (Left Sidebar) */}
        <div className="w-96 flex-shrink-0">
          <ConversationList
            conversations={conversationThreads}
            activeConversationId={activeConversationThreadId}
            onConversationSelect={selectConversationThread}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Chat Window (Main Area) */}
        <div className="flex-1">
          <ChatWindow
            conversation={activeConversation || null}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isSending={isSending}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Messages Page (with Provider)
 */
export default function MessagesPage() {
  return (
    <MessagingProvider>
      <MessagesContent />
    </MessagingProvider>
  );
}
