import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignInfluencerShortlistedStatusServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface UpdateShortlistedStatusRequest {
  shortlisted_status_id: string;
}

interface UpdateShortlistedStatusResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

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
    
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { success: false, error: 'Bearer token is required' },
        { status: 401 }
      );
    }

    const updateData: UpdateShortlistedStatusRequest = await request.json();
    
    if (!updateData.shortlisted_status_id) {
      return NextResponse.json(
        { success: false, error: 'shortlisted_status_id is required' },
        { status: 400 }
      );
    }

    console.log('API Route: Calling FastAPI backend for shortlisted status update...');
    
    // Use the new function specifically for shortlisted status
    const updatedInfluencer = await updateCampaignInfluencerShortlistedStatusServer(
      id, 
      updateData, 
      authToken
    );
    
    console.log('API Route: Successfully updated shortlisted status');
    
    const response: UpdateShortlistedStatusResponse = {
      success: true,
      data: updatedInfluencer,
      message: 'Shortlisted status updated successfully'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Route Error:', error);
    
    const response: UpdateShortlistedStatusResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update shortlisted status'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}