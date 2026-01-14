// src/app/api/v0/agent-assignments/today-tasks/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getTodayAssignedInfluencersServer } from '@/services/assignments/assignments.server';
import { extractBearerToken } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/agent-assignments/today-tasks called');
    
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Extract pagination parameters from URL query string
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 10;
    
    console.log('API Route: Extracted pagination parameters:', { page, pageSize });

    console.log('API Route: Calling FastAPI backend for today\'s assigned influencers...');
    const todayTasksData = await getTodayAssignedInfluencersServer(page, pageSize, authToken);
    
    console.log(`API Route: Successfully fetched ${todayTasksData.influencers?.length || 0} today's assigned influencers`);
    console.log('API Route: Pagination info:', todayTasksData.pagination);
    
    return NextResponse.json(todayTasksData);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch today\'s assigned influencers' },
      { status: 500 }
    );
  }
}