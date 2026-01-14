// src/components/messaging/ConversationList.tsx
/**
 * Conversation List Component
 * 
 * Displays list of conversation threads in sidebar
 * Shows participant info, last message preview, unread counts, timestamps
 * 
 * Design: Similar to WhatsApp/Messenger conversation list
 */

'use client';

import React, { useMemo } from 'react';
import { Search, Pin, Volume2, VolumeX } from 'lucide-react';
import { ConversationThread } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: ConversationThread[];
  activeConversationId: string | null;
  onConversationSelect: (conversationId: string) => void;
  isLoading?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onConversationSelect,
  isLoading = false,
  searchQuery = '',
  onSearchChange,
}: ConversationListProps) {
  
  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter((conv) => {
      const participantNames = conv.participants
        .map((p) => `${p.username} ${p.displayName}`.toLowerCase())
        .join(' ');
      
      const lastMessageText = conv.lastMessage?.textContent?.toLowerCase() || '';
      
      return participantNames.includes(query) || lastMessageText.includes(query);
    });
  }, [conversations, searchQuery]);

  // Sort conversations: pinned first, then by last message time
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      // Pinned conversations come first
      if (a.metadata.isPinned && !b.metadata.isPinned) return -1;
      if (!a.metadata.isPinned && b.metadata.isPinned) return 1;
      
      // Then sort by last message time
      const timeA = a.lastMessage?.sentAt || a.updatedAt;
      const timeB = b.lastMessage?.sentAt || b.updatedAt;
      
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    });
  }, [filteredConversations]);

  // Format relative time
  const formatTime = (date: Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: false });
    } catch {
      return '';
    }
  };

  // Get participant display info
  const getParticipantInfo = (conversation: ConversationThread) => {
    const participant = conversation.participants[0];
    if (!participant) return { name: 'Unknown', avatar: null };
    
    return {
      name: participant.displayName || participant.username,
      username: participant.username,
      avatar: participant.profileImageUrl,
      isVerified: participant.isVerified,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Search Bar */}
      {onSearchChange && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {sortedConversations.length === 0 ? (
          <div className="flex items-center justify-center h-64 px-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange?.('')}
                  className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedConversations.map((conversation) => {
              const participant = getParticipantInfo(conversation);
              const isActive = conversation.id === activeConversationId;
              const hasUnread = conversation.unreadMessageCount > 0;

              return (
                <button
                  key={conversation.id}
                  onClick={() => onConversationSelect(conversation.id)}
                  className={`w-full px-4 py-3 flex items-start space-x-3 hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-indigo-50 border-l-4 border-indigo-600' : 'border-l-4 border-transparent'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {participant.avatar ? (
                      <img
                        src={participant.avatar}
                        alt={participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white font-medium text-lg">
                          {participant.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Unread Indicator */}
                    {hasUnread && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {conversation.unreadMessageCount > 9 ? '9+' : conversation.unreadMessageCount}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0 text-left">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2 min-w-0">
                        <h3 className={`text-sm font-medium truncate ${
                          hasUnread ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {participant.name}
                        </h3>
                        
                        {participant.isVerified && (
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        
                        {conversation.metadata.isPinned && (
                          <Pin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                        
                        {conversation.metadata.isMuted && (
                          <VolumeX className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      {conversation.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                          {formatTime(conversation.lastMessage.sentAt)}
                        </span>
                      )}
                    </div>

                    {/* Last Message Preview */}
                    <div className="flex items-center space-x-2">
                      <p className={`text-sm truncate ${
                        hasUnread ? 'font-medium text-gray-900' : 'text-gray-500'
                      }`}>
                        {conversation.lastMessage?.textContent || 'No messages yet'}
                      </p>
                    </div>

                    {/* Username */}
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      @{participant.username}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}