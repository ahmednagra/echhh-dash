// src/app/api/v0/agent-assignments/[agent_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getAgentAssignmentsByIdServer } from '@/services/assignments/assignments.server';
import { CompletionStatus } from '@/types/assignments';

/**
 * GET /api/v0/agent-assignments/[agent_id]
 * Get assignments for a specific agent
 * 
 * Query Parameters:
 * - completion_status: 'completed' | 'incomplete' | undefined
 * 
 * ROLE PERMISSIONS: platform_outreach_manager
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agent_id: string }> }
) {
  try {
    const { agent_id } = await params;
    
    console.log(`API Route: GET /api/v0/agent-assignments/${agent_id} called`);
    
    // Extract bearer token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Agent ID check (from URL params)
    if (!agent_id) {
      return NextResponse.json(
        { error: 'Agent ID is required' },
        { status: 400 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const completionStatus = searchParams.get('completion_status') as CompletionStatus;
    
    console.log('API Route: Query params:', { completionStatus });
    
    // Call backend with token, agent ID, and completion status
    const assignments = await getAgentAssignmentsByIdServer(agent_id, completionStatus, authToken);
    
    console.log(`API Route: Successfully fetched ${assignments.assignments?.length || 0} assignments for agent ${agent_id}`);
    return NextResponse.json(assignments, { status: 200 });
  } catch (error) {
    console.error('❌ API Route Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch agent assignments';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}