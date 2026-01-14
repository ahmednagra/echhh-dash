// src/app/api/v0/public/campaign-influencers/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPublicCampaignInfluencersServer } from '@/services/public-campaign-influencers/public-campaign-influencers.server';
import { PublicCampaignInfluencersRequest } from '@/types/public-campaign-influencers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Extract token from query parameters
    const token = searchParams.get('token');
    
    if (!token) {
      return NextResponse.json(
        { error: 'Session token is required' },
        { status: 400 }
      );
    }

    // Build request parameters
    const requestParams: PublicCampaignInfluencersRequest = {
      token,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validate pagination parameters
    if (requestParams.limit && (requestParams.limit < 1 || requestParams.limit > 100)) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    if (requestParams.page && requestParams.page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }

    const result = await getPublicCampaignInfluencersServer(requestParams);
    
    // Return the wrapped response from backend as-is
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Error in public campaign influencers route:', error);
    
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('Invalid or expired')) {
        return NextResponse.json(
          { error: 'Invalid or expired session token' },
          { status: 401 }
        );
      }
      
      if (error.message.includes('not permitted')) {
        return NextResponse.json(
          { error: 'Access not permitted for this session' },
          { status: 403 }
        );
      }
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}