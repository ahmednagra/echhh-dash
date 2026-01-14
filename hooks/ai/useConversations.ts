// src/hooks/ai/useConversations.ts

/**
 * useConversations Hook
 * 
 * Dedicated hook for managing AI conversations list.
 * Useful for conversation sidebars and history views.
 * 
 * @module hooks/ai/useConversations
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getConversations,
  getConversation,
  deleteConversation,
} from '@/services/ai/conversations.client';
import { AIConversation, GetConversationsParams } from '@/types/ai';

// =============================================================================
// TYPES
// =============================================================================

export interface UseConversationsOptions {
  /** Campaign ID to filter conversations */
  campaignId?: string;
  /** Auto-load on mount */
  autoLoad?: boolean;
  /** Page size */
  pageSize?: number;
}

export interface UseConversationsReturn {
  // State
  conversations: AIConversation[];
  selectedConversation: AIConversation | null;
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  
  // Pagination
  hasMore: boolean;
  offset: number;
  
  // Actions
  loadConversations: (params?: GetConversationsParams) => Promise<void>;
  loadMore: () => Promise<void>;
  selectConversation: (conversationId: string) => Promise<void>;
  removeConversation: (conversationId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  clearError: () => void;
}

// =============================================================================
// HOOK IMPLEMENTATION
// =============================================================================

export function useConversations(options: UseConversationsOptions = {}): UseConversationsReturn {
  const {
    campaignId,
    autoLoad = false,
    pageSize = 20,
  } = options;

  // State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<AIConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [offset, setOffset] = useState(0);

  // ==========================================================================
  // LOAD CONVERSATIONS
  // ==========================================================================

  const loadConversations = useCallback(async (params?: GetConversationsParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const finalParams: GetConversationsParams = {
        campaign_id: campaignId,
        limit: pageSize,
        offset: 0,
        ...params,
      };

      console.log('📋 useConversations: Loading', finalParams);

      const response = await getConversations(finalParams);

      if (response.success && response.data) {
        setConversations(response.data.conversations || []);
        setTotalCount(response.data.total_count || 0);
        setOffset(response.data.offset || 0);
        console.log(`✅ useConversations: Loaded ${response.data.conversations?.length || 0} conversations`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversations';
      console.error('❌ useConversations:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, pageSize]);

  // ==========================================================================
  // LOAD MORE
  // ==========================================================================

  const loadMore = useCallback(async () => {
    if (conversations.length >= totalCount) {
      console.log('⚠️ useConversations: No more to load');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newOffset = offset + pageSize;

      const response = await getConversations({
        campaign_id: campaignId,
        limit: pageSize,
        offset: newOffset,
      });

      if (response.success && response.data?.conversations) {
        setConversations(prev => [...prev, ...response.data.conversations]);
        setOffset(newOffset);
        console.log(`✅ useConversations: Loaded ${response.data.conversations.length} more`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load more';
      console.error('❌ useConversations:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [campaignId, pageSize, offset, totalCount, conversations.length]);

  // ==========================================================================
  // SELECT CONVERSATION
  // ==========================================================================

  const selectConversation = useCallback(async (conversationId: string) => {
    // Check if already in list
    const existing = conversations.find(c => c.id === conversationId);
    
    if (existing) {
      setSelectedConversation(existing);
      return;
    }

    // Fetch from API
    try {
      setIsLoading(true);
      const response = await getConversation(conversationId);
      
      if (response.success && response.data) {
        setSelectedConversation(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load conversation';
      console.error('❌ useConversations:', errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [conversations]);

  // ==========================================================================
  // REMOVE CONVERSATION
  // ==========================================================================

  const removeConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await deleteConversation(conversationId);
      
      if (response.success) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        setTotalCount(prev => Math.max(0, prev - 1));
        
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
        
        console.log('✅ useConversations: Deleted conversation');
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete';
      console.error('❌ useConversations:', errorMessage);
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedConversation?.id]);

  // ==========================================================================
  // REFRESH
  // ==========================================================================

  const refresh = useCallback(async () => {
    await loadConversations({ offset: 0 });
  }, [loadConversations]);

  // ==========================================================================
  // CLEAR ERROR
  // ==========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==========================================================================
  // AUTO LOAD
  // ==========================================================================

  useEffect(() => {
    if (autoLoad) {
      loadConversations();
    }
  }, [autoLoad, loadConversations]);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    conversations,
    selectedConversation,
    isLoading,
    error,
    totalCount,
    hasMore: conversations.length < totalCount,
    offset,
    loadConversations,
    loadMore,
    selectConversation,
    removeConversation,
    refresh,
    clearError,
  };
}

export default useConversations;