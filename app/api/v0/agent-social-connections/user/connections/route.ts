// src/app/api/v0/agent-social-connections/user/connections/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserSocialConnectionsServer } from '@/services/agent-social-connections/agent-social-connections.server';
import { extractBearerToken } from '@/lib/auth-utils';
export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || undefined;
    const platformId = searchParams.get('platform_id') || undefined;
    const activeOnly = searchParams.get('active_only') !== 'false'; // default to true

    console.log('Get user connections request:', { userId, platformId, activeOnly });

    // Call server service
    const connections = await getUserSocialConnectionsServer(
      userId,
      platformId,
      activeOnly,
      authToken
    );

    return NextResponse.json({ data: connections });
  } catch (error) {
    console.error('API Route Error (GET /agent-social-connections/user/connections):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to fetch user social connections' 
        } 
      },
      { status: 500 }
    );
  }
}