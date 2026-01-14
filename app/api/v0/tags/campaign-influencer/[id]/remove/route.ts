// src/app/api/v0/tags/campaign-influencer/[id]/remove/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { removeTagFromInfluencerServer } from '@/services/tags/tags.server';
import { RemoveTagFromInfluencerRequest } from '@/types/tags';

/**
 * POST /api/v0/tags/campaign-influencer/[id]/remove
 * Remove a tag from a campaign influencer
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Get campaign influencer ID from params
    const { id: campaignInfluencerId } = await params;
    
    if (!campaignInfluencerId) {
      return NextResponse.json(
        { error: 'Campaign influencer ID is required' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const requestData: RemoveTagFromInfluencerRequest = await request.json();
    
    // Validate
    if (!requestData.tag_id) {
      return NextResponse.json(
        { error: 'tag_id is required' },
        { status: 400 }
      );
    }
    
    const result = await removeTagFromInfluencerServer(
      campaignInfluencerId,
      requestData,
      authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ API Route: Error removing tag from influencer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}