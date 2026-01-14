// src/app/api/v0/public/outreach/ready-to-onboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Public API endpoint for outreach data
 * This endpoint provides read-only access without authentication
 */

export async function GET(request: NextRequest) {
  try {
    console.log('🔓 PUBLIC API: Processing public outreach request');
    
    // Get the base URL for the backend API
    const appEnv = process.env.NEXT_PUBLIC_APP_ENV || 'local';
    let backendBaseUrl = '';
    
    if (appEnv === 'production') {
      backendBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_PRO!;
    } else if (appEnv === 'development') {
      backendBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_DEV!;
    } else if (appEnv === 'local') {
      backendBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    } else {
      backendBaseUrl = process.env.NEXT_PUBLIC_FASTAPI_BASE_URL_LOC!;
    }

    // Fallback if not set
    if (!backendBaseUrl) {
      console.warn('⚠️ No backend base URL set. Using localhost fallback.');
      backendBaseUrl = 'http://127.0.0.1:8000';
    }

    const backendUrl = `${backendBaseUrl}/v0/public/outreach/ready-to-onboard`;
    
    console.log(`🌐 PUBLIC API: Forwarding to backend: ${backendUrl}`);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: No Authorization header for public access
        'X-Forwarded-For': request.headers.get('x-forwarded-for') || '',
        'User-Agent': request.headers.get('user-agent') || '',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PUBLIC API: Backend error:', response.status, errorData);
      
      return NextResponse.json(
        { 
          success: false, 
          error: errorData.error || 'Failed to fetch outreach data',
          statusCode: response.status
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    console.log(`✅ PUBLIC API: Successfully fetched ${data.influencers?.length || 0} influencers`);
    
    // Add CORS headers for public access
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    });

    return NextResponse.json(data, { headers });
    
  } catch (error) {
    console.error('💥 PUBLIC API: Error in public outreach endpoint:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}