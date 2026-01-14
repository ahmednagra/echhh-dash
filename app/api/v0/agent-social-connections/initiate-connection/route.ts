// src/app/api/v0/agent-social-connections/initiate-connection/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { initiateOAuthConnectionServer } from '@/services/agent-social-connections/agent-social-connections.server';
import { extractBearerToken } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Get auth token
    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // Parse request body
    const initiateRequest = await request.json();
    console.log('Initiate OAuth connection request:', initiateRequest);

    // Call server service
    const oauthResponse = await initiateOAuthConnectionServer(initiateRequest, authToken);

    return NextResponse.json({ data: oauthResponse });
  } catch (error) {
    console.error('API Route Error (POST /agent-social-connections/initiate-connection):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to initiate OAuth connection' 
        } 
      },
      { status: 500 }
    );
  }
}

