// src/services/outreach-agents/outreach-agents.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { OutreachAgentsResponse } from '@/types/outreach-agents';

const API_VERSION = '/api/v0';

/**
 * Get outreach agents list (client-side)
 * Calls Next.js API route which then calls FastAPI
 */
export async function getOutreachAgents(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    search?: string;
    agent_type?: string;
    status?: string;
  }
): Promise<OutreachAgentsResponse> {
  try {
    console.log('🚀 Client Service: Starting getOutreachAgents call with pagination:', { page, pageSize, filters });

    if (typeof window === 'undefined') {
      console.error('❌ Client Service: Not in browser environment');
      throw new Error('getOutreachAgents can only be called from browser');
    }

    // Check token exists
    const token = localStorage.getItem('accessToken');
    console.log('🔑 Client Service: Token check:', token ? 'Token exists' : 'No token found');

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });

    // Add optional filters
    if (filters?.search) {
      queryParams.append('search', filters.search);
    }
    if (filters?.agent_type && filters.agent_type !== 'all') {
      queryParams.append('agent_type', filters.agent_type);
    }
    if (filters?.status && filters.status !== 'all') {
      queryParams.append('status', filters.status);
    }

    const endpoint = `${API_VERSION}${ENDPOINTS.OUTREACH_AGENTS.LIST}?${queryParams.toString()}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);

    const response = await nextjsApiClient.get<OutreachAgentsResponse>(endpoint);

    console.log('📦 Client Service: Raw API response:', {
      hasError: !!response.error,
      hasData: !!response.data,
      status: response.status
    });

    if (response.error) {
      console.error('❌ Client Service: API returned error:', response.error.message);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      console.warn('⚠️ Client Service: No data returned from API');
      return {
        agents: [],
        pagination: {
          page: page,
          page_size: pageSize,
          total_items: 0,
          total_pages: 0,
          has_next: false,
          has_previous: false
        }
      };
    }

    console.log(`✅ Client Service: Successfully fetched ${response.data.agents?.length || 0} agents`);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getOutreachAgents:', error);
    throw error;
  }
}