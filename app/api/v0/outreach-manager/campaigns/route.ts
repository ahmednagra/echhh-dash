// src/app/api/v0/outreach-manager/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getOutreachManagerCampaignsServer } from '@/services/outreach-manager-campaigns/outreach-manager-campaigns.server';

/**
 * GET /api/v0/outreach-manager/campaigns
 * Get all campaigns with aggregated stats for outreach manager
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📍 API Route: GET /api/v0/outreach-manager/campaigns called');

    // Extract bearer token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '10');
    const search = searchParams.get('search') || undefined;

    console.log('📋 API Route: Query params:', { page, pageSize, search });

    // Call server service
    const result = await getOutreachManagerCampaignsServer(
      page,
      pageSize,
      search,
      authToken
    );

    console.log(`✅ API Route: Returning ${result.campaigns?.length || 0} campaigns`);
    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/outreach-manager/campaigns:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch campaigns';
    const statusCode = errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}