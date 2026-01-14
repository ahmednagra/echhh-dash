// src/app/api/v0/agent-social-connections/[connectionId]/disconnect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { disconnectPlatformAccountServer } from '@/services/agent-social-connections/agent-social-connections.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: {
    connectionId: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Call server service
    const result = await disconnectPlatformAccountServer(params.connectionId, authToken);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error(`API Route Error (POST /agent-social-connections/${params.connectionId}/disconnect):`, error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to disconnect platform account' 
        } 
      },
      { status: 500 }
    );
  }
}