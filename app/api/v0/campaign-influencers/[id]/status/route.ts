// src/app/api/v0/campaign-influencers/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignInfluencerStatusServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteContext {
  params: {
    id: string;
  };
}

/**
 * PATCH /api/v0/campaign-influencers/{id}/status
 * Update campaign influencer status
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Campaign influencer ID is required' 
        },
        { status: 400 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ API Route: Invalid JSON in request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body' 
        },
        { status: 400 }
      );
    }

    const { assigned_influencer_id, status_id } = body;

    // Validate required fields
    if (!status_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'status_id is required' 
        },
        { status: 400 }
      );
    }

    // Get auth token
    const authToken = await extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required' 
        },
        { status: 401 }
      );
    }

    console.log(`🔄 API Route: Updating campaign influencer status ${id} to ${status_id}`);

    // Call server service
    const result = await updateCampaignInfluencerStatusServer(
      id,
      assigned_influencer_id,
      status_id,
      authToken
    );

    console.log('✅ API Route: Campaign influencer status updated successfully');

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('💥 API Route: Error updating campaign influencer status:', error);
    
    // Return appropriate error response
    const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}