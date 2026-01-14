// src/app/api/v0/campaign-influencers/remove-onboarded/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { removeOnboardedInfluencersServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { RemoveOnboardedRequest } from '@/types/campaign-influencers';

/**
 * PATCH /api/v0/campaign-influencers/remove-onboarded
 * Remove onboarded influencers
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('API Route: PATCH /api/v0/campaign-influencers/remove-onboarded called');
    
    // Parse request body
    const requestData: RemoveOnboardedRequest = await request.json();
    console.log('API Route: Request data:', requestData);
    
    // Basic validation
    if (!requestData || !requestData.campaign_list_id || !requestData.influencer_ids || requestData.influencer_ids.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'campaign_list_id and influencer_ids are required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          message: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const response = await removeOnboardedInfluencersServer(requestData, authToken);
    
    console.log('API Route: Successfully removed onboarded influencers');
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          message: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: 'Failed to remove onboarded influencers' 
      },
      { status: 500 }
    );
  }
}