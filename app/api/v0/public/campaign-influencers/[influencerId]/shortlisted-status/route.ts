// src/app/api/v0/public/campaign-influencers/[influencerId]/shortlisted-status/route.ts
// NEW FILE - Create this file

import { NextRequest, NextResponse } from 'next/server';
import { updatePublicShortlistedStatusServer } from '@/services/public-campaign-influencers/public-campaign-influencers.server';
import { UpdatePublicShortlistedStatusRequest } from '@/types/public-campaign-influencers';

interface RouteParams {
  params: {
    influencerId: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { influencerId } = params;
    console.log(`📞 API Route: POST /public/campaign-influencers/${influencerId}/shortlisted-status`);
    
    const requestData: UpdatePublicShortlistedStatusRequest = await request.json();
    
    // Validation
    if (!requestData.token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token is required' 
        },
        { status: 400 }
      );
    }
    
    if (!requestData.shortlisted_status_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Shortlisted status ID is required' 
        },
        { status: 400 }
      );
    }
    
    if (!influencerId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Influencer ID is required' 
        },
        { status: 400 }
      );
    }
    
    const result = await updatePublicShortlistedStatusServer(influencerId, requestData);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 400 }
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('Invalid or expired session token')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Session token expired. Please refresh the page.' 
          },
          { status: 401 }
        );
      }
      
      // Handle unauthorized errors
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update shortlisted status' 
      },
      { status: 500 }
    );
  }
}