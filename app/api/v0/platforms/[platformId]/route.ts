// src/app/api/v0/platforms/[platformId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPlatformByIdServer } from '@/services/platform/platform.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/platforms/[platformId]
 * Get a specific platform by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platformId: string } }
) {
  try {
    const { platformId } = params;
    
    console.log(`🎯 Platform by ID API called for: ${platformId}`);
    
    if (!platformId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Platform ID is required' 
        },
        { status: 400 }
      );
    }

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

    console.log(`📋 Fetching platform with ID: ${platformId}`);
    
    // Call FastAPI backend through server-side service with auth token
    const platform = await getPlatformByIdServer(platformId, authToken);
    
    if (!platform) {
      console.log(`❌ Platform not found with ID: ${platformId}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Platform not found' 
        },
        { status: 404 }
      );
    }
    
    console.log(`✅ Platform found: ${platform.name}`);
    
    return NextResponse.json({
      success: true,
      data: platform
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching platform by ID:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch platform',
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