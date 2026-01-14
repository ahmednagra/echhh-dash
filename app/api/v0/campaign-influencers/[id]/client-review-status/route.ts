// src/app/api/v0/campaign-influencers/[id]/client-review-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignInfluencerClientReviewStatusServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { UpdateClientReviewStatusRequest, UpdateClientReviewStatusResponse } from '@/types/campaign-influencers';

/**
 * PATCH /api/v0/campaign-influencers/[id]/client-review-status
 * Update campaign influencer client review status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Campaign influencer ID is required' },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { success: false, error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const updateData: UpdateClientReviewStatusRequest = await request.json();
    
    if (!updateData.client_review_status_id) {
      return NextResponse.json(
        { success: false, error: 'client_review_status_id is required' },
        { status: 400 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const updatedInfluencer = await updateCampaignInfluencerClientReviewStatusServer(id, updateData, authToken);
    
    console.log('API Route: Successfully updated client review status');
    
    const response: UpdateClientReviewStatusResponse = {
      success: true,
      data: updatedInfluencer,
      message: 'Client review status updated successfully'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Route Error:', error);
    
    const response: UpdateClientReviewStatusResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update client review status'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}