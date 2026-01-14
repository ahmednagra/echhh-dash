// src/app/api/v0/agent-social-connections/connect/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectPlatformAccountServer } from '@/services/agent-social-connections/agent-social-connections.server';
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
    const platformRequest = await request.json();
    console.log('Connect platform request:', platformRequest);

    // Call server service
    const connection = await connectPlatformAccountServer(platformRequest, authToken);

    return NextResponse.json({ data: connection });
  } catch (error) {
    console.error('API Route Error (POST /agent-social-connections/connect):', error);
    return NextResponse.json(
      { 
        error: { 
          message: error instanceof Error ? error.message : 'Failed to connect platform account' 
        } 
      },
      { status: 500 }
    );
  }
}