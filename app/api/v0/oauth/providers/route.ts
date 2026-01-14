// src/app/api/v0/oauth/providers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOAuthProvidersServer } from '@/services/oauth/oauth.server';

/**
 * GET /api/v0/oauth/providers
 * Get available OAuth providers
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/oauth/providers called');
    
    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service
    const providers = await getOAuthProvidersServer();
    
    console.log(`API Route: Successfully fetched ${providers.count} OAuth providers`);
    return NextResponse.json({
      success: true,
      data: providers
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
        error: 'Failed to fetch OAuth providers' 
      },
      { status: 500 }
    );
  }
}