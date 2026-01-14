// src/app/api/v0/campaign-influencers/[id]/restore/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { restoreCampaignInfluencerServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * PATCH /api/v0/campaign-influencers/[id]/restore
 * Restore a soft-deleted campaign influencer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    console.log(`API Route: PATCH /api/v0/campaign-influencers/${id}/restore called`);
    
    if (!id) {
      return NextResponse.json(
        { error: 'Influencer ID parameter is required' },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend to restore influencer...');
    // Call FastAPI backend through server-side service with auth token
    const restoredInfluencer = await restoreCampaignInfluencerServer(id, authToken);
    
    console.log(`API Route: Successfully restored campaign influencer ${id}`);
    
    return NextResponse.json(restoredInfluencer);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to restore campaign influencer' },
      { status: 500 }
    );
  }
}