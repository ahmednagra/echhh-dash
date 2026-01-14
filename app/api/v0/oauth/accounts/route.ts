// src/app/api/v0/oauth/accounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getLinkedAccountsServer } from '@/services/oauth/oauth.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/oauth/accounts
 * Get linked OAuth accounts
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/oauth/accounts called');
    
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
    const accounts = await getLinkedAccountsServer(authToken);
    
    console.log(`API Route: Successfully fetched ${accounts.count} linked accounts`);
    return NextResponse.json({
      success: true,
      data: accounts
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
        error: 'Failed to fetch linked accounts' 
      },
      { status: 500 }
    );
  }
}