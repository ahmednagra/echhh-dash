// src/services/assignments/assignments.client.ts

import { nextjsApiClient } from '@/lib/nextjs-api';
import { AgentAssignmentsResponse } from '@/types/assignments';
import { AssignmentInfluencersResponse, ContactAttemptResponse } from '@/types/assignment-influencers';

// Type for completion status filter
export type CompletionStatus = 'completed' | 'incomplete' | undefined;

/**
 * Get today's assigned influencers via Next.js API route (client-side)
 */
export async function getTodayAssignedInfluencers(
  page: number = 1,
  pageSize: number = 10
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log('🚀 Client Service: Starting getTodayAssignedInfluencers call with pagination:', { page, pageSize });
    
    if (typeof window === 'undefined') {
      throw new Error('getTodayAssignedInfluencers can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    const endpoint = `/api/v0/agent-assignments/today-tasks?${queryParams.toString()}`;
    const response = await nextjsApiClient.get<AssignmentInfluencersResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        influencers: [],
        pagination: { page, page_size: pageSize, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getTodayAssignedInfluencers:', error);
    throw error;
  }
}

/**
 * Record a contact attempt for a campaign influencer
 */
export async function recordContactAttempt(assignedinfluencerId: string): Promise<ContactAttemptResponse> {
  try {
    const endpoint = `/api/v0/assigned-influencers/${assignedinfluencerId}/record-contact`;
    const response = await nextjsApiClient.post<ContactAttemptResponse>(endpoint, {});
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from contact attempt API');
    }
    
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error recording contact attempt:', error);
    throw error;
  }
}

/**
 * Get agent assignments for the logged-in user (client-side)
 * @param completionStatus - Filter: 'completed', 'incomplete', or undefined for all
 */
export async function getAgentAssignments(
  completionStatus?: CompletionStatus
): Promise<AgentAssignmentsResponse> {
  try {
    console.log('🚀 Client Service: Starting getAgentAssignments call', { completionStatus });
    
    if (typeof window === 'undefined') {
      throw new Error('getAgentAssignments can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (completionStatus) {
      queryParams.append('completion_status', completionStatus);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v0/agent-assignments${queryString ? `?${queryString}` : ''}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<AgentAssignmentsResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        assignments: [],
        pagination: { page: 1, page_size: 100, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.assignments?.length || 0} agent assignments`);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAgentAssignments:', error);
    throw error;
  }
}

/**
 * Get assignment influencers for a specific assignment
 */
export async function getAssignmentInfluencers(
  assignmentId: string,
  page: number = 1,
  pageSize: number = 10,
  type?: 'active' | 'archived' | 'completed'
): Promise<AssignmentInfluencersResponse> {
  try {
    console.log(`🚀 Client Service: Starting getAssignmentInfluencers for assignment ${assignmentId}`);
    
    if (typeof window === 'undefined') {
      throw new Error('getAssignmentInfluencers can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString()
    });
    
    if (type) {
      queryParams.append('type', type);
    }
    
    const endpoint = `/api/v0/assigned-influencers/agent-assignment/${assignmentId}?${queryParams}`;
    const response = await nextjsApiClient.get<AssignmentInfluencersResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        influencers: [],
        pagination: { page: 1, page_size: pageSize, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.influencers?.length || 0} assignment influencers`);
    return response.data;
  } catch (error) {
    console.error('💥 Client Service: Error in getAssignmentInfluencers:', error);
    throw error;
  }
}

/**
 * Get agent assignments by agent ID (client-side)
 * @param agentId - The agent ID to fetch assignments for
 * @param completionStatus - Filter: 'completed', 'incomplete', or undefined for all
 */
export async function getAgentAssignmentsById(
  agentId: string,
  completionStatus?: CompletionStatus
): Promise<AgentAssignmentsResponse> {
  try {
    console.log(`🚀 Client Service: Starting getAgentAssignmentsById for agent ${agentId}`, { completionStatus });
    
    if (typeof window === 'undefined') {
      throw new Error('getAgentAssignmentsById can only be called from browser');
    }
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (completionStatus) {
      queryParams.append('completion_status', completionStatus);
    }
    
    const queryString = queryParams.toString();
    const endpoint = `/api/v0/agent-assignments/${agentId}${queryString ? `?${queryString}` : ''}`;
    console.log(`📞 Client Service: Making API call to ${endpoint}`);
    
    const response = await nextjsApiClient.get<AgentAssignmentsResponse>(endpoint);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      return {
        assignments: [],
        pagination: { page: 1, page_size: 100, total_items: 0, total_pages: 1, has_next: false, has_previous: false }
      };
    }
    
    console.log(`✅ Client Service: Successfully fetched ${response.data.assignments?.length || 0} assignments for agent ${agentId}`);
    return response.data;
  } catch (error) {
    console.error(`💥 Client Service: Error in getAgentAssignmentsById for agent ${agentId}:`, error);
    throw error;
  }
}