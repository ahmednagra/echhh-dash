// src/app/api/v0/oauth/callback/[provider]/route.ts - FIXED with async params
import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallbackServer } from '@/services/oauth/oauth.server';

/**
 * GET /api/v0/oauth/callback/[provider]
 * Handle OAuth callback
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
    
    console.log(`API Route: GET /api/v0/oauth/callback/${provider} called`);
    
    if (!provider) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Provider parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract required callback parameters
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const link = searchParams.get('link');
    // NOTE: user_type is encoded in state, so we don't need it as a separate parameter
    
    console.log(`API Route: Callback params - code: ${code ? 'present' : 'missing'}, state: ${state ? 'present' : 'missing'}, link: ${link}`);
    
    if (!code || !state) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Missing required OAuth callback parameters (code, state)' 
        },
        { status: 400 }
      );
    }
    
    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service
    // NOTE: Removed userType parameter since it's already encoded in state
    const callbackResponse = await handleOAuthCallbackServer(
      provider, 
      code, 
      state, 
      link || undefined
    );
    
    console.log(`API Route: Successfully handled OAuth callback for ${provider}`);
    return NextResponse.json({
      success: true,
      data: callbackResponse
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
        error: 'Failed to handle OAuth callback' 
      },
      { status: 500 }
    );
  }
}