// src/app/api/v0/tags/campaign-influencer/[id]/add/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { addTagToInfluencerServer } from '@/services/tags/tags.server';
import { AddTagToInfluencerRequest } from '@/types/tags';

/**
 * POST /api/v0/tags/campaign-influencer/[id]/add
 * Add a tag to a campaign influencer
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
    const requestData: AddTagToInfluencerRequest = await request.json();
    
    // Validate - need either tag_id or tag_name
    if (!requestData.tag_id && !requestData.tag_name) {
      return NextResponse.json(
        { error: 'Either tag_id or tag_name is required' },
        { status: 400 }
      );
    }
    
    const result = await addTagToInfluencerServer(
      campaignInfluencerId,
      requestData,
      authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ API Route: Error adding tag to influencer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}