import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { copyInfluencersToCampaignServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { CopyInfluencersRequest } from '@/types/campaign-influencers';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ currentListId: string }> }
) {
  try {
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Await params
    const { currentListId } = await params;
    
    console.log(`📋 API Route: Copy-to called for listId: ${currentListId}`);
    
    // Parse request body
    const requestData: CopyInfluencersRequest = await request.json();
    
    // Validation
    if (!requestData.target_list_id) {
      return NextResponse.json(
        { success: false, error: 'target_list_id is required' },
        { status: 400 }
      );
    }
    
    if (!requestData.influencer_ids || !Array.isArray(requestData.influencer_ids)) {
      return NextResponse.json(
        { success: false, error: 'influencer_ids array is required' },
        { status: 400 }
      );
    }
    
    if (requestData.influencer_ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'influencer_ids array cannot be empty' },
        { status: 400 }
      );
    }
    
    // Call server service
    const result = await copyInfluencersToCampaignServer(
      currentListId,
      requestData,
      authToken
    );
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ API Route: Error in copy-to:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}