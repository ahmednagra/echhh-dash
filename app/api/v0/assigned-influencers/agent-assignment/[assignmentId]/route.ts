// src/app/api/v0/assigned-influencers/agent-assignment/[assignmentId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAssignmentInfluencersServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  try {
    const { assignmentId } = await params;
    console.log(`API Route: GET /api/v0/assigned-influencers/agent-assignment/${assignmentId} called`);
    
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const type = searchParams.get('type') as 'active' | 'archived' | 'completed' | null;

    console.log(`API Route: Fetching assignment influencers - Assignment: ${assignmentId}, Page: ${page}, Size: ${pageSize}, Type: ${type || 'all'}`);
    
    const assignmentInfluencersData = await getAssignmentInfluencersServer(
      assignmentId, 
      page, 
      pageSize, 
      type || undefined,
      authToken
    );
    
    console.log(`API Route: Successfully fetched ${assignmentInfluencersData.influencers?.length || 0} assignment influencers`);
    return NextResponse.json(assignmentInfluencersData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch assignment influencers' },
      { status: 500 }
    );
  }
}