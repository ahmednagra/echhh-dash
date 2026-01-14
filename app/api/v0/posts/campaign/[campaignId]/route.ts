// src/app/api/v0/results/campaign/[campaignId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVideoResultsServer } from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/results/campaign/[campaignId]
 * Get video results for a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`API Route: GET /api/v0/results/campaign/${campaignId} called`);
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
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
    const videoResults = await getVideoResultsServer(campaignId, page, limit, authToken);
    
    console.log(`API Route: Successfully fetched video results for campaign ${videoResults}`);
    
    // Transform the backend response to match our expected format
    const transformedResponse = {
      success: true,
      results: videoResults.results || [],
      total: videoResults.results || 0,
      page: page,
      limit: limit
    };
    
    return NextResponse.json(transformedResponse);
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
        error: 'Failed to fetch video results' 
      },
      { status: 500 }
    );
  }
}