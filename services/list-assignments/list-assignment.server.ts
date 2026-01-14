// src/services/list-assignments/list-assignment.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface StatusBrief {
  id: string;
  name: string;
}

export interface ListAssignmentResponse {
  id: string;
  list_id: string;
  agent_id: string;
  status_id: string;
  created_at: string;
  updated_at: string;
  status?: StatusBrief;
}

export interface CreateListAssignmentRequest {
  list_id: string;
}

export interface UpdateAssignmentStatusRequest {
  status_id: string;
}

// Status IDs as constants
export const ASSIGNMENT_STATUS = {
  ACTIVE: 'fa60af64-94db-4497-a869-05cff259349d',
  INACTIVE: 'bd78fb93-49b6-48ed-9a5e-8778711ada39'
} as const;

/**
 * Create a new list assignment (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function createListAssignment(
  data: CreateListAssignmentRequest, 
  authToken: string
): Promise<ListAssignmentResponse> {
  try {
    console.log('Server: Creating list assignment with data:', data);
    
    const response = await serverApiClient.post<ListAssignmentResponse>(
      ENDPOINTS.LIST_ASSIGNMENTS.CREATE,
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error creating list assignment:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: List assignment created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error creating list assignment:', error);
    throw error;
  }
}

/**
 * Update assignment status (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  data: UpdateAssignmentStatusRequest,
  authToken: string
): Promise<ListAssignmentResponse> {
  try {
    console.log(`Server: Updating assignment ${assignmentId} status:`, data);
    
    const response = await serverApiClient.patch<ListAssignmentResponse>(
      ENDPOINTS.LIST_ASSIGNMENTS.UPDATE_STATUS(assignmentId),
      data,
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error updating assignment status:', response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No data received from FastAPI server');
    }
    
    console.log('Server: Assignment status updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error updating assignment status:', error);
    throw error;
  }
}

/**
 * Get list assignment by ID (server-side)
 * Calls FastAPI backend from Next.js API route
 */
export async function getListAssignmentByIdServer(
  assignmentId: string,
  authToken: string
): Promise<ListAssignmentResponse | null> {
  try {
    console.log(`Server: Fetching assignment ${assignmentId}`);
    
    const response = await serverApiClient.get<ListAssignmentResponse>(
      ENDPOINTS.LIST_ASSIGNMENTS.DETAIL(assignmentId),
      {},
      authToken
    );
    
    if (response.error) {
      if (response.status === 404) {
        console.warn(`Assignment not found with ID ${assignmentId}`);
        return null;
      }
      console.error('Server: FastAPI Error fetching assignment:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('Server: Assignment fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Server: Error fetching assignment:', error);
    throw error;
  }
}

/**
 * Get all assignments for a specific list (server-side)
 */
export async function getAssignmentsByListServer(
  listId: string,
  authToken: string
): Promise<ListAssignmentResponse[]> {
  try {
    console.log(`Server: Fetching assignments for list ${listId}`);
    
    const response = await serverApiClient.get<ListAssignmentResponse[]>(
      ENDPOINTS.LIST_ASSIGNMENTS.BY_LIST(listId),
      {},
      authToken
    );
    
    if (response.error) {
      console.error('Server: FastAPI Error fetching assignments by list:', response.error);
      throw new Error(response.error.message);
    }
    
    console.log('Server: Assignments by list fetched successfully:', response.data);
    return response.data || [];
  } catch (error) {
    console.error('Server: Error fetching assignments by list:', error);
    throw error;
  }
}

/**
 * Helper function to start outreach (server-side)
 */
export async function startOutreachServer(
  assignmentId: string, 
  authToken: string
): Promise<ListAssignmentResponse> {
  return updateAssignmentStatus(assignmentId, { 
    status_id: ASSIGNMENT_STATUS.ACTIVE 
  }, authToken);
}

/**
 * Helper function to stop outreach (server-side)
 */
export async function stopOutreachServer(
  assignmentId: string, 
  authToken: string
): Promise<ListAssignmentResponse> {
  return updateAssignmentStatus(assignmentId, { 
    status_id: ASSIGNMENT_STATUS.INACTIVE 
  }, authToken);
}