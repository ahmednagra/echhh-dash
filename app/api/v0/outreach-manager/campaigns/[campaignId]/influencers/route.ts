// src/app/api/v0/outreach-manager/campaigns/[campaignId]/influencers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getCampaignInfluencersForManagerServer } from '@/services/outreach-manager-campaigns/outreach-manager-campaigns.server';

/**
 * GET /api/v0/outreach-manager/campaigns/[campaignId]/influencers
 * Get all influencers for a campaign with agent info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
): Promise<NextResponse> {
  try {
    const { campaignId } = await params;
    console.log(`📍 API Route: GET /api/v0/outreach-manager/campaigns/${campaignId}/influencers called`);

    // Extract bearer token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Validate campaign ID
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const search = searchParams.get('search') || undefined;

    console.log('📋 API Route: Query params:', { campaignId, page, pageSize, search });

    // Call server service
    const result = await getCampaignInfluencersForManagerServer(
      campaignId,
      page,
      pageSize,
      search,
      authToken
    );

    console.log(`✅ API Route: Returning ${result.influencers?.length || 0} influencers`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 API Route: Error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaign influencers';
    const statusCode = errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}