// src/app/api/v0/agent-assignments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAgentAssignmentsServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CompletionStatus } from '@/types/assignments';

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/agent-assignments called');
    
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const completionStatus = searchParams.get('completion_status') as CompletionStatus;
    
    console.log('API Route: Query params:', { completionStatus });

    console.log('API Route: Calling FastAPI backend...');
    const agentAssignmentsData = await getAgentAssignmentsServer(completionStatus, authToken);
    
    console.log(`API Route: Successfully fetched ${agentAssignmentsData.assignments?.length || 0} agent assignments`);
    return NextResponse.json(agentAssignmentsData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch agent assignments' },
      { status: 500 }
    );
  }
}