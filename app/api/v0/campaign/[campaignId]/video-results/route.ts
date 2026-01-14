// src/app/api/v0/campaign/[campaignId]/video-results/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getVideoResultsServer } from '@/services/video-results/video-results.server';

/**
 * GET /api/v0/campaign/[campaignId]/video-results
 * Get video results for a specific campaign
 * Supports both authenticated and public access (for shared reports)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`📊 Video Results API: GET /api/v0/campaign/${campaignId}/video-results called`);
    
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
    
    // CRITICAL: Check for public access headers (from shared reports)
    const isPublicAccess = request.headers.get('X-Public-Access') === 'true';
    const isInternalRequest = request.headers.get('X-Internal-Request') === 'shared-report';
    const isSharedReportAccess = isPublicAccess || isInternalRequest;
    
    if (isSharedReportAccess) {
      console.log('🔓 Video Results API: Public/Internal access request detected for shared report');
      console.log('🔓 Headers:', {
        publicAccess: isPublicAccess,
        internalRequest: isInternalRequest,
        userAgent: request.headers.get('User-Agent')?.substring(0, 100)
      });
      
      try {
        let results;
        
        // Option 1: Try with system/service token if available
        const systemToken = process.env.SYSTEM_SERVICE_TOKEN;
        
        if (systemToken) {
          console.log('🔓 Video Results API: Using system token for public access');
          results = await getVideoResultsServer(campaignId, page, limit, systemToken);
        } else {
          console.log('🔓 Video Results API: No system token, attempting public access method');
          
          // Option 2: Try calling the service without token (if your backend supports it)
          try {
            results = await getVideoResultsServer(campaignId, page, limit, null);
          } catch (noTokenError) {
            console.error('🔓 Video Results API: No-token access failed:', noTokenError);
            
            // Option 3: Try with a placeholder/public token if your system has one
            const publicToken = process.env.PUBLIC_ACCESS_TOKEN;
            if (publicToken) {
              console.log('🔓 Video Results API: Trying with public access token');
              results = await getVideoResultsServer(campaignId, page, limit, publicToken);
            } else {
              // If all else fails, return helpful error for public API to handle
              return NextResponse.json(
                { 
                  success: false,
                  error: 'Public access not properly configured. Campaign data cannot be accessed without authentication.',
                  details: 'System requires either SYSTEM_SERVICE_TOKEN or PUBLIC_ACCESS_TOKEN environment variable',
                  isPublicAccess: true,
                  redirectToPublicApi: true
                },
                { status: 503 }
              );
            }
          }
        }
        
        console.log(`🔓 Video Results API: Successfully fetched ${results?.results?.length || 0} results for public sharing`);
        
        // Return data in the expected format for public access
        return NextResponse.json({
          success: true,
          results: results?.results || [],
          total: results?.total || results?.results?.length || 0,
          page: page,
          limit: limit,
          // Add metadata for public access
          isPublicAccess: true,
          accessMethod: 'authenticated-api-public-mode',
          campaignId: campaignId
        });
        
      } catch (publicError) {
        console.error('🔓 Video Results API: Public access failed:', publicError);
        
        return NextResponse.json(
          { 
            success: false,
            error: 'Failed to fetch campaign data for public sharing',
            details: publicError instanceof Error ? publicError.message : 'Unknown error',
            isPublicAccess: true,
            campaignId: campaignId
          },
          { status: 500 }
        );
      }
    }
    
    // REGULAR AUTHENTICATED FLOW - Extract token from request
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      console.log('🔒 Video Results API: No authentication token found');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required. No access token found.' 
        },
        { status: 401 }
      );
    }
    
    console.log('🔒 Video Results API: Authenticated request, fetching data...');
    
    try {
      // Call the server service with the user's token
      const videoResults = await getVideoResultsServer(campaignId, page, limit, token);
      
      console.log(`🔒 Video Results API: Successfully fetched ${videoResults?.results?.length || 0} results for authenticated user`);
      
      // Return data in the standard authenticated format
      return NextResponse.json({
        success: true,
        results: videoResults.results || [],
        total: videoResults.total || 0,
        page: page,
        limit: limit,
        isAuthenticated: true,
        campaignId: campaignId
      });
      
    } catch (authError) {
      console.error('🔒 Video Results API: Authenticated request failed:', authError);
      
      if (authError instanceof Error) {
        // Handle specific error types
        if (authError.message.includes('401') || authError.message.includes('Unauthorized')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Authentication failed. Please log in again.' 
            },
            { status: 401 }
          );
        } else if (authError.message.includes('404') || authError.message.includes('not found')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Campaign not found or you do not have access to this campaign.' 
            },
            { status: 404 }
          );
        } else if (authError.message.includes('403') || authError.message.includes('Forbidden')) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Access denied. You do not have permission to view this campaign.' 
            },
            { status: 403 }
          );
        }
        
        return NextResponse.json(
          { 
            success: false,
            error: authError.message || 'Failed to fetch campaign data'
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: 'An unexpected error occurred while fetching campaign data'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('💥 Video Results API: Unexpected error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error occurred while processing the request',
        details: error instanceof Error ? error.message : 'Unknown error'
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
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Public-Access, X-Internal-Request',
      'Access-Control-Max-Age': '86400',
    },
  });
}

/**
 * POST method (if needed for your application)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    // Check if this is a public access request
    const isPublicAccess = request.headers.get('X-Public-Access') === 'true';
    
    if (isPublicAccess) {
      return NextResponse.json(
        { 
          success: false,
          error: 'POST operations not allowed for public access' 
        },
        { status: 403 }
      );
    }
    
    // Regular authenticated POST logic here
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('accessToken')?.value;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    // Handle POST request logic here
    const body = await request.json();
    
    // Your POST implementation...
    
    return NextResponse.json({
      success: true,
      message: 'POST operation completed successfully'
    });
    
  } catch (error) {
    console.error('POST Video Results API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process POST request' },
      { status: 500 }
    );
  }
}