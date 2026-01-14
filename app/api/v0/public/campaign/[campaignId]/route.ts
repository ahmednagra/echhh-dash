// src/app/api/v0/public/campaign/[campaignId]/route.ts

import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v0/public/campaign/[campaignId]
 * Get video results for a specific campaign - PUBLIC ACCESS (no auth required)
 * This endpoint is designed for shared campaign analytics reports
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`🔓 Public API Route: GET /api/v0/public/campaign/${campaignId} called`);
    
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
    const limit = parseInt(searchParams.get('limit') || '200');
    
    console.log(`🔓 Public API Route: Fetching data for campaign ${campaignId}, page ${page}, limit ${limit}`);
    
    let videoResults;
    
    try {
      // Get the base URL for internal API calls
      const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
      
      // First, try to call the internal/private video results API with a system approach
      // This calls your existing authenticated API but bypasses auth for public sharing
      const internalApiUrl = `${baseUrl}/api/v0/campaign/${campaignId}/video-results`;
      
      console.log(`🔓 Public API Route: Calling internal API: ${internalApiUrl}`);
      
      const response = await fetch(internalApiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add a special header to indicate this is a public/internal request
          'X-Public-Access': 'true',
          'X-Internal-Request': 'shared-report',
        },
      });
      
      if (!response.ok) {
        console.error(`🔓 Public API Route: Internal API failed with status ${response.status}`);
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Internal API call failed: ${response.status} - ${errorText}`);
      }
      
      const internalData = await response.json();
      console.log(`🔓 Public API Route: Internal API response:`, {
        success: internalData.success,
        resultsCount: internalData.results?.length || 0,
        total: internalData.total
      });
      
      if (!internalData.success) {
        throw new Error(internalData.error || 'Internal API returned unsuccessful response');
      }
      
      videoResults = {
        results: internalData.results || [],
        total: internalData.total || internalData.results?.length || 0,
        page: page,
        limit: limit
      };
      
    } catch (internalApiError) {
      console.error('🔓 Public API Route: Internal API call failed:', internalApiError);
      
      // If internal API fails, try direct database access (if you have it configured)
      // For now, we'll return an appropriate error
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign data not available for public sharing. The campaign may not exist or public sharing may not be enabled.',
          details: internalApiError instanceof Error ? internalApiError.message : 'Unknown error',
          isPublicAccess: true
        },
        { status: 404 }
      );
    }
    
    console.log(`🔓 Public API Route: Successfully prepared ${videoResults.results.length} results for public sharing`);
    
    // Transform the backend response to match expected format
    const transformedResponse = {
      success: true,
      results: videoResults.results,
      total: videoResults.total,
      page: page,
      limit: limit,
      // Add metadata for public sharing
      isPublicAccess: true,
      accessTimestamp: new Date().toISOString(),
      campaignId: campaignId
    };
    
    // Set CORS headers for public access
    const response = NextResponse.json(transformedResponse);
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('Cache-Control', 'public, max-age=300'); // Cache for 5 minutes
    
    return response;
    
  } catch (error) {
    console.error('🔓 Public API Route Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaign analytics data for public sharing',
        details: errorMessage,
        isPublicAccess: true,
        campaignId: params.campaignId
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Public-Access, X-Internal-Request',
      'Access-Control-Max-Age': '86400',
    },
  });
}