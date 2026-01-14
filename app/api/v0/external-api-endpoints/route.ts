// src/app/api/v0/external-api-endpoints/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getActiveExternalApiEndpointsServer } from '@/services/platform/platform.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/external-api-endpoints/active
 * Get all active external API endpoints
 * 
 * This route proxies to FastAPI: GET /v0/external-api-endpoints/active/list
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎯 External API Endpoints: GET /api/v0/external-api-endpoints/active');

    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ No Bearer token provided');
      return NextResponse.json(
        { success: false, error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    const endpoints = await getActiveExternalApiEndpointsServer(authToken);

    console.log(`✅ Returning ${endpoints.length} active endpoints`);

    return NextResponse.json({
      success: true,
      data: endpoints,
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // Cache 5 min
      }
    });

  } catch (error) {
    console.error('❌ Error in external-api-endpoints API:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch external API endpoints',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
