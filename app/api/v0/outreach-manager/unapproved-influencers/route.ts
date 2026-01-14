// src/app/api/v0/outreach-manager/unapproved-influencers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUnapprovedInfluencersServer } from '@/services/outreach-manager-campaigns/outreach-manager-campaigns.server';

/**
 * GET /api/v0/outreach-manager/unapproved-influencers
 * Get all unapproved influencers across all campaigns
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log(
      '📍 API Route: GET /api/v0/outreach-manager/unapproved-influencers called',
    );

    // Extract bearer token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 },
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('page_size') || '50');
    const search = searchParams.get('search') || undefined;

    console.log('📋 API Route: Query params:', { page, pageSize, search });

    // Call server service
    const result = await getUnapprovedInfluencersServer(
      page,
      pageSize,
      search,
      authToken,
    );

    console.log(
      `✅ API Route: Returning ${result.influencers?.length || 0} unapproved influencers`,
    );
    return NextResponse.json(result);
  } catch (error) {
    console.error(
      '💥 API Route: Error in GET /api/v0/outreach-manager/unapproved-influencers:',
      error,
    );

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch unapproved influencers';
    const statusCode =
      errorMessage.includes('Forbidden') || errorMessage.includes('permission')
        ? 403
        : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode },
    );
  }
}