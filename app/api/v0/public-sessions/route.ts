// src/app/api/v0/public-sessions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { createPublicSessionServer } from '@/services/public-sessions/public-sessions.server';
import { CreatePublicSessionRequest } from '@/types/public-sessions';

export async function POST(request: NextRequest) {
  try {
    
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: CreatePublicSessionRequest = await request.json();
    
    // Validation
    if (!requestData.session_type) {
      return NextResponse.json(
        { error: 'Session type is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.resource_type) {
      return NextResponse.json(
        { error: 'Resource type is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.resource_id) {
      return NextResponse.json(
        { error: 'Resource ID is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.expires_in_hours || requestData.expires_in_hours <= 0) {
      return NextResponse.json(
        { error: 'Valid expires_in_hours is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.permissions) {
      return NextResponse.json(
        { error: 'Permissions are required' },
        { status: 400 }
      );
    }
    
    if (!requestData.session_metadata) {
      return NextResponse.json(
        { error: 'Session metadata is required' },
        { status: 400 }
      );
    }
    
    const result = await createPublicSessionServer(requestData, authToken);
    
    // Return the data directly (matches your API response structure)
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}