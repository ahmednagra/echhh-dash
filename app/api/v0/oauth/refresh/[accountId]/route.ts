// src/app/api/v0/oauth/refresh/[accountId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { refreshOAuthTokenServer } from '@/services/oauth/oauth.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * POST /api/v0/oauth/refresh/[accountId]
 * Refresh OAuth token
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const { accountId } = params;
    
    console.log(`API Route: POST /api/v0/oauth/refresh/${accountId} called`);
    
    if (!accountId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Account ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const refreshResponse = await refreshOAuthTokenServer(accountId, authToken);
    
    console.log(`API Route: Successfully refreshed OAuth token for ${accountId}`);
    return NextResponse.json({
      success: true,
      data: refreshResponse
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
        error: 'Failed to refresh OAuth token' 
      },
      { status: 500 }
    );
  }
}