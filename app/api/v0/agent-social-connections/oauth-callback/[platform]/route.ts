// src/app/api/v0/agent-social-connections/oauth-callback/[platform]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCallbackServer } from '@/services/agent-social-connections';
import { extractBearerToken } from '@/lib/auth-utils';
import { OAuthCallbackRequest } from '@/types/agent-social-connections';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  try {
    console.log('✅ API Route Hit: POST /api/v0/agent-social-connections/oauth-callback/[platform]');
    
    // Await params (Next.js 15 requirement)
    const { platform } = await params;
    
    if (!platform) {
      return NextResponse.json(
        { error: { message: 'Platform parameter is required' } },
        { status: 400 }
      );
    }
    
    // Extract auth token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: { message: 'Authentication required' } },
        { status: 401 }
      );
    }
    
    // Parse request body
    const callbackData: OAuthCallbackRequest = await request.json();
    console.log('📦 OAuth callback data received:', { 
      platform, 
      hasCode: !!callbackData.code, 
      codeLength: callbackData.code?.length,
      hasState: !!callbackData.state,
      stateLength: callbackData.state?.length
    });
    
    // Validate required fields - only code is required, state is optional
    if (!callbackData.code) {
      console.error('❌ Missing code parameter');
      return NextResponse.json(
        { error: { message: 'Missing required OAuth authorization code' } },
        { status: 400 }
      );
    }
    
    // Ensure state is at least an empty string
    if (!callbackData.state) {
      console.log('ℹ️ No state parameter, setting to empty string (normal for Instagram)');
      callbackData.state = '';
    }
    
    console.log('🚀 Calling backend with:', {
      platform,
      codePreview: callbackData.code.substring(0, 20) + '...',
      hasState: !!callbackData.state
    });
    
    // Call server service
    const result = await handleOAuthCallbackServer(platform, callbackData, authToken);
    
    console.log(`✅ Successfully handled OAuth callback for ${platform}`);
    console.log('📤 Returning result:', {
      success: result.success,
      hasConnection: !!result.connection,
      redirectUrl: result.redirect_url
    });
    
    return NextResponse.json({ data: result });
    
  } catch (error) {
    console.error('💥 API Route Error (POST /agent-social-connections/oauth-callback/[platform]):', error);
    
    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Failed to handle OAuth callback';
    const errorDetails = error instanceof Error ? error.stack : undefined;
    
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: { 
          message: errorMessage
        } 
      },
      { status: 500 }
    );
  }
}