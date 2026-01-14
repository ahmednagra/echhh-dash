// src/services/outreach-agents/outreach-agents.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  OutreachAgentsResponse, 
  OutreachAgentStats,
  OutreachAgent 
} from '@/types/outreach-agents';

/**
 * Get outreach agents from FastAPI backend (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getOutreachAgentsServer(
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    search?: string;
    agent_type?: string;
    status?: string;
  },
  authToken?: string
): Promise<OutreachAgentsResponse> {
  try {
    console.log('Server: Fetching outreach agents from FastAPI with pagination:', { page, pageSize, filters });
    
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
    
    const endpointWithParams = `${ENDPOINTS.OUTREACH_AGENTS.LIST}?${queryParams.toString()}`;
    console.log('Server: Calling FastAPI endpoint:', endpointWithParams);
    
    const response = await serverApiClient.get<OutreachAgentsResponse>(
      endpointWithParams,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching outreach agents:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No outreach agents data received from FastAPI');
      return {
        agents: [],
        pagination: {
          page: page,
          page_size: pageSize,
          total_items: 0,
          total_pages: 1,
          has_next: false,
          has_previous: false
        }
      };
    }
    
    console.log(`Server: Outreach agents fetched successfully: ${response.data.agents?.length || 0} agents`);
    console.log('Server: Pagination data:', response.data.pagination);
    
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching outreach agents:', error);
    throw error;
  }
}

/**
 * Get outreach agent statistics from FastAPI backend (server-side)
 */
export async function getOutreachAgentStatsServer(
  authToken?: string
): Promise<OutreachAgentStats> {
  try {
    console.log('Server: Fetching outreach agent stats from FastAPI');
    
    const response = await serverApiClient.get<OutreachAgentStats>(
      ENDPOINTS.OUTREACH_AGENTS.STATS,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching agent stats:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.warn('Server: No agent stats data received from FastAPI');
      // Return default matching EXACT backend response structure
      return {
        total_agents: 0,
        active_agents: 0,
        inactive_agents: 0,
        available_agents: 0,
        busy_agents: 0,
        automation_enabled: 0,
        total_agent_assignments: 0,
        total_active_lists: 0, // ← Backend field name
        total_lists: 0,
        total_social_connections: 0,
        total_messages_today: 0,
        total_active_influencers: 0, // ← Backend field name
        total_influencers: 0,
        total_assigned_influencers: 0,
        total_completed_influencers: 0,
        total_pending_influencers: 0,
        total_archived_influencers: 0,
        average_completion_rate: 0
      };
    }
    
    console.log('Server: Agent stats fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching agent stats:', error);
    throw error;
  }
}

/**
 * Get single outreach agent by ID (server-side)
 */
export async function getOutreachAgentByIdServer(
  agentId: string,
  authToken?: string
): Promise<OutreachAgent> {
  try {
    console.log(`Server: Fetching outreach agent ${agentId} from FastAPI`);
    
    const response = await serverApiClient.get<OutreachAgent>(
      ENDPOINTS.OUTREACH_AGENTS.DETAIL(agentId),
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching agent:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('Agent not found');
    }
    
    console.log('Server: Agent fetched successfully:', response.data.id);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching agent:', error);
    throw error;
  }
}