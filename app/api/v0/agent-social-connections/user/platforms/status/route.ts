// src/app/api/v0/agent-social-connections/user/platforms/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUserPlatformConnectionsStatusServer } from '@/services/agent-social-connections/agent-social-connections.server';
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

    // Call server service
    const status = await getUserPlatformConnectionsStatusServer(userId, authToken);

    return NextResponse.json({ data: status });
  } catch (error) {
    console.error('API Route Error (GET /agent-social-connections/user/platforms/status):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to fetch platform connections status' 
        } 
      },
      { status: 500 }
    );
  }
}