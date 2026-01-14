// src/app/api/v0/platforms/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPlatformsServer, getPlatformsByStatusServer } from '@/services/platform/platform.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/platforms
 * Get all platforms or filter by status
 * 
 * Query Parameters:
 * - status: string (optional) - Filter by ACTIVE/INACTIVE status
 * 
 * Example: /api/v0/platforms?status=ACTIVE
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎯 Platforms API called:', request.url);

    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get('status');

    let platforms;
    
    if (statusParam) {
      // Filter by status
      console.log(`📋 Filtering platforms by status: ${statusParam}`);
      platforms = await getPlatformsByStatusServer(statusParam, authToken);
    } else {
      // Get all platforms
      console.log('📋 Fetching all platforms');
      platforms = await getPlatformsServer(authToken);
    }

    console.log(`✅ Returning ${platforms.length} platforms`);

    return NextResponse.json({
      success: true,
      data: platforms,
      total: platforms.length
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('❌ Error in platforms API route:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platformss',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { 
      success: false,
      error: 'Method not allowed' 
    },
    { status: 405 }
  );
}