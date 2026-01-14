// src/app/api/v0/agent-social-connections/oauth-status/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOAuthStatusServer } from '@/services/agent-social-connections/agent-social-connections.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: {
    platform: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state');

    if (!state) {
      return NextResponse.json(
        { error: { message: 'State parameter is required' } },
        { status: 400 }
      );
    }

    console.log(`Checking OAuth status for ${params.platform} with state ${state}`);

    // Call server service
    const statusResponse = await checkOAuthStatusServer(params.platform, state, authToken);

    return NextResponse.json({ data: statusResponse });
  } catch (error) {
    console.error(`API Route Error (GET /agent-social-connections/oauth-status/${params.platform}):`, error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to check OAuth status' 
        } 
      },
      { status: 500 }
    );
  }
}