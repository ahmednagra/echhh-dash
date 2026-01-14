// src/app/api/v0/oauth/accounts/[accountId]/route.ts - FIXED with async params
import { NextRequest, NextResponse } from 'next/server';
import { unlinkOAuthAccountServer } from '@/services/oauth/oauth.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * DELETE /api/v0/oauth/accounts/[accountId]
 * Unlink OAuth account
 * FIXED: Added async/await for params as required by Next.js 15
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  try {
    // FIXED: Await params before using its properties
    const { accountId } = await params;
    
    console.log(`API Route: DELETE /api/v0/oauth/accounts/${accountId} called`);
    
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
    const unlinkResponse = await unlinkOAuthAccountServer(accountId, authToken);
    
    console.log(`API Route: Successfully unlinked OAuth account ${accountId}`);
    return NextResponse.json({
      success: true,
      data: unlinkResponse
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
        error: 'Failed to unlink OAuth account' 
      },
      { status: 500 }
    );
  }
}