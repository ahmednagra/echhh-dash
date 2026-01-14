// src/app/(dashboard)/@company/chat/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/chat';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { useChat } from '@/hooks/useChat';
// import { useChat } from '@/hooks/ai';
import { MessageSquare } from 'lucide-react';

/**
 * Standalone Chat Page for Company Users - Improved Version
 * 
 * Features:
 * - Conversations list sidebar
 * - Split-view layout
 * - Professional design
 * - Conversation management
 * 
 * Route: /chat (for @company parallel route)
 */
export default function CompanyChatPage() {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  
  const {
    messages,
    conversations,
    isLoading,
    loadConversations,
    createNewConversation,
    deleteConversation,
  } = useChat({
    conversationId: activeConversationId,
    autoLoad: true,
  });

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle conversation selection
  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
  };

  // Handle new conversation
  const handleNewConversation = async () => {
    const newConv = await createNewConversation('New Conversation');
    if (newConv) {
      setActiveConversationId(newConv.id);
    }
  };

  // Handle delete conversation
  const handleDeleteConversation = async (id: string) => {
    await deleteConversation(id);
    if (activeConversationId === id) {
      setActiveConversationId(undefined);
    }
  };

  // Mock conversations for demo (remove this when backend is ready)
  const mockConversations = conversations.length === 0 ? [
    {
      id: '1',
      user_id: 'user1',
      company_id: 'company1',
      title: 'Campaign Strategy Discussion',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString(),
      message_count: 5,
      is_active: true,
      last_message: {
        id: 'msg1',
        conversation_id: '1',
        role: 'assistant' as const,
        content: 'I recommend focusing on micro-influencers for better engagement rates...',
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      campaign: {
        id: 'camp1',
        name: 'Summer Beauty Sale',
      }
    },
    {
      id: '2',
      user_id: 'user1',
      company_id: 'company1',
      title: 'Influencer Discovery',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      updated_at: new Date(Date.now() - 7200000).toISOString(),
      message_count: 3,
      is_active: true,
      last_message: {
        id: 'msg2',
        conversation_id: '2',
        role: 'assistant' as const,
        content: 'I found 25 fashion influencers matching your criteria...',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    },
    {
      id: '3',
      user_id: 'user1',
      company_id: 'company1',
      title: 'Budget Planning',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date(Date.now() - 86400000).toISOString(),
      message_count: 8,
      is_active: true,
      last_message: {
        id: 'msg3',
        conversation_id: '3',
        role: 'user' as const,
        content: 'What should be my budget for a campaign with 10 influencers?',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    },
  ] : conversations;

  return (
    <div className="h-[calc(100vh-64px)] flex bg-gray-50">
      {/* Left: Conversations List */}
      <ConversationsList
        conversations={mockConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isLoading={isLoading}
      />

      {/* Right: Chat Interface */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConversationId ? (
          <ChatInterface 
            variant="fullpage" 
            conversationId={activeConversationId}
          />
        ) : (
          // Empty State (No conversation selected)
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center mb-6">
              <MessageSquare className="w-12 h-12 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to AI Assistant
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Select a conversation from the list or start a new one to chat with your AI assistant about campaigns, influencers, and marketing strategies.
            </p>
            <button
              onClick={handleNewConversation}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start New Conversation
            </button>

            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
              {[
                {
                  title: 'Campaign Planning',
                  description: 'Get help with strategy and execution',
                  icon: '🎯'
                },
                {
                  title: 'Find Influencers',
                  description: 'Discover perfect matches for your brand',
                  icon: '👥'
                },
                {
                  title: 'Analytics Insights',
                  description: 'Understand your campaign performance',
                  icon: '📊'
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}