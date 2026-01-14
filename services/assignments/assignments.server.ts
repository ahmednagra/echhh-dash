// src/services/assignments/assignments.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { AgentAssignmentsResponse } from '@/types/assignments';
import { AssignmentInfluencersResponse, ContactAttemptResponse } from '@/types/assignment-influencers';
import { CompletionStatus } from '@/types/assignments';

/**
 * Get today's assigned influencers from FastAPI backend (server-side)
 */
export async function getTodayAssignedInfluencersServer(
  page: number = 1,
  pageSize: number = 10,
  authToken?: string
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log('Server: Fetching today\'s assigned influencers from FastAPI with pagination:', { page, pageSize });
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    const endpointWithParams = `${ENDPOINTS.AGENT_ASSIGNMENTS.TODAY_TASKS}?${queryParams.toString()}`;
    
    const response = await serverApiClient.get<AssignmentInfluencersResponse>(
      endpointWithParams,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        influencers: [],
        pagination: { page, page_size: pageSize, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`Server: Today's assigned influencers fetched successfully: ${response.data.influencers?.length || 0} influencers`);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching today\'s assigned influencers:', error);
    throw error;
  }
}

/**
 * Record a contact attempt for a campaign influencer (server-side)
 */
export async function recordContactAttemptServer(
  assignedInfluencerId: string,
  authToken?: string
): Promise<ContactAttemptResponse> {
  try {
    console.log(`Server: Recording contact attempt for influencer ${assignedInfluencerId}`);
    
    const response = await serverApiClient.post<ContactAttemptResponse>(
      ENDPOINTS.ASSIGNED_INFLUENCERS.RECORD_CONTACT_ATTEMPT(assignedInfluencerId),
      {},
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Contact attempt recorded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error(`Server: Error recording contact attempt for influencer ${assignedInfluencerId}:`, error);
    throw error;
  }
}

/**
 * Get agent assignments for the logged-in user (server-side)
 * @param completionStatus - Filter: 'completed', 'incomplete', or undefined for all
 * @param authToken - Authentication token
 */
export async function getAgentAssignmentsServer(
  completionStatus?: CompletionStatus,
  authToken?: string
): Promise<AgentAssignmentsResponse> {
  try {
    console.log('Server: Fetching agent assignments from FastAPI', { completionStatus });
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (completionStatus) {
      queryParams.append('completion_status', completionStatus);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.ASSIGNMENTS.LIST}${queryString ? `?${queryString}` : ''}`;
    
    const response = await serverApiClient.get<AgentAssignmentsResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        assignments: [],
        pagination: { page: 1, page_size: 100, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`Server: Agent assignments fetched successfully: ${response.data.assignments?.length || 0} assignments`);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching agent assignments:', error);
    throw error;
  }
}

/**
 * Get assignment influencers for a specific assignment (server-side)
 */
export async function getAssignmentInfluencersServer(
  assignmentId: string,
  page: number = 1,
  pageSize: number = 10,
  type?: 'active' | 'archived' | 'completed',
  authToken?: string
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log(`Server: Fetching assignment influencers for assignment ${assignmentId}`);
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: pageSize.toString()
    });
    
    if (type) {
      queryParams.append('type', type);
    }
    
    const endpoint = `${ENDPOINTS.ASSIGNMENTS.INFLUENCERS_LIST(assignmentId)}?${queryParams}`;
    
    const response = await serverApiClient.get<AssignmentInfluencersResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        influencers: [],
        pagination: { page: 1, page_size: pageSize, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`Server: Assignment influencers fetched successfully: ${response.data.influencers?.length || 0} influencers`);
    return response.data;
  } catch (error) {
    console.error(`Server: Error fetching assignment influencers for ${assignmentId}:`, error);
    throw error;
  }
}

/**
 * Get agent assignments by agent ID from FastAPI backend (server-side)
 * @param agentId - The agent ID to fetch assignments for
 * @param completionStatus - Filter: 'completed', 'incomplete', or undefined for all
 * @param authToken - Authentication token
 */
export async function getAgentAssignmentsByIdServer(
  agentId: string,
  completionStatus?: CompletionStatus,
  authToken?: string
): Promise<AgentAssignmentsResponse> {
  try {
    console.log(`🚀 Server: Fetching assignments for agent ${agentId} from FastAPI`, { completionStatus });
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (completionStatus) {
      queryParams.append('completion_status', completionStatus);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `${ENDPOINTS.AGENT_ASSIGNMENTS.BY_AGENT_ID(agentId)}${queryString ? `?${queryString}` : ''}`;
    
    const response = await serverApiClient.get<AgentAssignmentsResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        assignments: [],
        pagination: { page: 1, page_size: 100, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`✅ Server: Agent assignments fetched successfully: ${response.data.assignments?.length || 0} assignments`);
    return response.data;
  } catch (error) {
    console.error(`💥 Server: Error fetching assignments for agent ${agentId}:`, error);
    throw error;
  }
}