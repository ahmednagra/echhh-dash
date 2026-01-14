// src/components/messaging/ChatWindow.tsx
/**
 * Chat Window Component
 * 
 * Main chat interface showing messages and input
 * Handles message display, sending, and real-time updates
 * 
 * Design: Similar to WhatsApp/Messenger chat interface
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Smile, MoreVertical, Phone, Video, Info } from 'lucide-react';
import { Message, ConversationThread, SendMessageRequest, MessageContentType } from '@/types/messaging';
import { format, isSameDay } from 'date-fns';

interface ChatWindowProps {
  conversation: ConversationThread | null;
  messages: Message[];
  onSendMessage: (request: SendMessageRequest) => Promise<void>;
  isLoading?: boolean;
  isSending?: boolean;
}

export default function ChatWindow({
  conversation,
  messages,
  onSendMessage,
  isLoading = false,
  isSending = false,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when conversation changes
  useEffect(() => {
    if (conversation) {
      inputRef.current?.focus();
    }
  }, [conversation]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending || !conversation) return;

    const recipientId = conversation.participants[0]?.platformUserId;
    if (!recipientId) return;

    try {
      await onSendMessage({
        recipientId,
        textContent: messageText.trim(),
        contentType: MessageContentType.TEXT,
      });
      
      setMessageText('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: { date: Date; messages: Message[] }[], message) => {
    const messageDate = new Date(message.sentAt);
    const lastGroup = groups[groups.length - 1];
    
    if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
      lastGroup.messages.push(message);
    } else {
      groups.push({ date: messageDate, messages: [message] });
    }
    
    return groups;
  }, []);

  // Format date header
  const formatDateHeader = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';
    return format(date, 'MMMM d, yyyy');
  };

  // Format message time
  const formatMessageTime = (date: Date) => {
    return format(new Date(date), 'h:mm a');
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-12 h-12 text-indigo-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-sm text-gray-500">
            Choose a conversation from the list to start messaging
          </p>
        </div>
      </div>
    );
  }

  const participant = conversation.participants[0];

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Participant Avatar */}
            {participant.profileImageUrl ? (
              <img
                src={participant.profileImageUrl}
                alt={participant.displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-medium">
                  {participant.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            {/* Participant Info */}
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {participant.displayName}
              </h2>
              <p className="text-sm text-gray-500">
                @{participant.username}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Video className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Info className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50 p-6 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date Header */}
                <div className="flex justify-center mb-4">
                  <span className="px-4 py-1 bg-white rounded-full text-xs font-medium text-gray-500 shadow-sm">
                    {formatDateHeader(group.date)}
                  </span>
                </div>

                {/* Messages */}
                <div className="space-y-3">
                  {group.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] ${
                          message.isFromCurrentUser
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        } rounded-2xl px-4 py-2.5 shadow-sm`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.textContent}
                        </p>
                        <div className={`flex items-center justify-end space-x-1 mt-1`}>
                          <span
                            className={`text-xs ${
                              message.isFromCurrentUser ? 'text-indigo-200' : 'text-gray-400'
                            }`}
                          >
                            {formatMessageTime(message.sentAt)}
                          </span>
                          {message.isFromCurrentUser && message.deliveryStatus === 'read' && (
                            <svg className="w-4 h-4 text-indigo-200" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-3">
          {/* Attachment Button */}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <Paperclip className="w-5 h-5 text-gray-600" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isSending || !conversation.canReply}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              rows={1}
              style={{
                minHeight: '48px',
                maxHeight: '120px',
              }}
            />
            
            {/* Emoji Button */}
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending || !conversation.canReply}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {!conversation.canReply && (
          <p className="text-xs text-red-500 mt-2">
            You cannot reply to this conversation
          </p>
        )}
      </div>
    </div>
  );
}