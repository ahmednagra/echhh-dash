// src/app/api/v0/oauth/[provider]/link/route.ts - FIXED with async params
import { NextRequest, NextResponse } from 'next/server';
import { initiateOAuthServer } from '@/services/oauth/oauth.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/oauth/[provider]/link
 * Initiate OAuth account linking flow
 * FIXED: Added async/await for params as required by Next.js 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    // FIXED: Await params before using its properties
    const { provider } = await params;
    
    console.log(`API Route: GET /api/v0/oauth/${provider}/link called`);
    
    if (!provider) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Provider parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers (required for link mode)
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided for link mode');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required for account linking' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const authResponse = await initiateOAuthServer(provider, true, authToken);
    
    console.log(`API Route: Successfully initiated OAuth link for ${provider}`);
    return NextResponse.json({
      success: true,
      data: authResponse
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to initiate OAuth link' 
      },
      { status: 500 }
    );
  }
}