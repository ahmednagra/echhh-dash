// src/app/api/v0/campaign-influencers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllCampaignInfluencersServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/campaign-influencers
 * Get campaign influencers by campaign_list_id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignListId = searchParams.get('campaign_list_id');
    
    if (!campaignListId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'campaign_list_id parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Check if this is an internal request for public sharing
    const isInternalRequest = request.headers.get('X-Internal-Request') === 'public-share';
    const systemToken = process.env.SYSTEM_AUTH_TOKEN || process.env.INTERNAL_API_TOKEN;
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    let effectiveToken = authToken;
    
    // If no auth token but this is an internal request, try to use system token
    if (!authToken && isInternalRequest && systemToken) {
      effectiveToken = systemToken;
      console.log('🔄 API Route: Using system token for internal public request');
    }
    
    if (!effectiveToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }
    
    // Call FastAPI backend through server-side service with auth token
    const response = await getAllCampaignInfluencersServer(campaignListId, effectiveToken);
    
    if (!response.success) {
      console.error('❌ API Route: Failed to fetch campaign influencers:', response.message);
      return NextResponse.json(
        { 
          success: false,
          error: response.message || 'Failed to fetch campaign influencers'
        },
        { status: 500 }
      );
    }
    
    console.log(`✅ API Route: Successfully fetched ${response.influencers.length} campaign influencers`);
    
    return NextResponse.json({
      success: true,
      influencers: response.influencers,
      pagination: response.pagination,
      total: response.influencers.length
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch campaign influencers'
      },
      { status: 500 }
    );
  }
}