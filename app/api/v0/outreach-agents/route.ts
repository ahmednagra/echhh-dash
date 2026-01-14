// src/app/api/v0/outreach-agents/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getOutreachAgentsServer } from '@/services/outreach-agents/outreach-agents.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/outreach-agents/stats
 * Get outreach agent statistics
 */
export async function GET(request: NextRequest) {
  try {
    
    const authToken = extractBearerToken(request);
    console.log('🔑 API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const page_size = parseInt(searchParams.get('page_size') || '10', 10);
    const agent_type = searchParams.get('agent_type') || undefined;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const statsData = await getOutreachAgentsServer(page, page_size, {search, agent_type, status}, authToken);
    
    console.log('✅ API Route: Successfully fetched agent stats');
    return NextResponse.json(statsData);
  } catch (error) {
    console.error('❌ API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch agent stats' },
      { status: 500 }
    );
  }
}