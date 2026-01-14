// src/app/api/v0/outreach-agent-manager/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getOutreachAgentManagerStatsServer } from '@/services/outreach-agent-manager/outreach-agent-manager.server';

/**
 * GET /api/v0/outreach-agent-manager/stats - Get outreach agent manager statistics
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Call server service to get outreach agent manager stats from FastAPI
    const stats = await getOutreachAgentManagerStatsServer(authToken);

    console.log('✅ API Route: Successfully retrieved outreach agent manager stats');
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/outreach-agent-manager/stats:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get outreach agent manager statistics';
    const statusCode = errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}