// src/app/api/v0/oauth/[provider]/login/route.ts - FIXED with async params
import { NextRequest, NextResponse } from 'next/server';
import { initiateOAuthServer } from '@/services/oauth/oauth.server';

/**
 * GET /api/v0/oauth/[provider]/login
 * Initiate OAuth login flow
 * FIXED: Added async/await for params as required by Next.js 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  try {
    // FIXED: Await params before using its properties
    const { provider } = await params;
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('user_type');
    
    console.log(`API Route: GET /api/v0/oauth/${provider}/login called with user_type: ${userType}`);
    
    if (!provider) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Provider parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Validate user_type if provided
    if (userType && !['influencer', 'company', 'platform'].includes(userType)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid user_type. Must be influencer, company, or platform' 
        },
        { status: 400 }
      );
    }
    
    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service
    const authResponse = await initiateOAuthServer(provider, false, userType || undefined);
    
    console.log(`API Route: Successfully initiated OAuth login for ${provider}`);
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
        error: 'Failed to initiate OAuth login' 
      },
      { status: 500 }
    );
  }
}