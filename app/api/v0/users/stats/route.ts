// src/app/api/v0/users/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUserStatsServer } from '@/services/users/users.server';

/**
 * GET /api/v0/users/stats - Get user statistics (admin only)
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

    // Call server service to get user stats from FastAPI
    const stats = await getUserStatsServer(authToken);

    console.log('✅ API Route: Successfully retrieved user stats');
    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/users/stats:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user statistics';
    const statusCode = errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}