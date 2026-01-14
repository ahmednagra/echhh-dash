// src/app/api/v0/campaign-influencers/[id]/average-views/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  updateCampaignInfluencerAverageViewsServer, 
  getCampaignInfluencerByIdServer 
} from '@/services/avg-views/avg-views.server';
import { UpdateAverageViewsRequest } from '@/types/campaign-influencers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  
  try {
    const { id } = params;
    
    console.log(`📝 API Route: PUT /api/v0/campaign-influencers/${id}/average-views called`);
    console.log('🔍 Influencer ID:', id);
    
    if (!id) {
      console.log('❌ API Route: Missing influencer ID');
      return NextResponse.json(
        { error: 'Influencer ID is required', success: false },
        { status: 400 }
      );
    }

    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    console.log('🔐 Auth token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No authentication token');
      return NextResponse.json(
        { error: 'Authentication token is required', success: false },
        { status: 401 }
      );
    }

    let requestData: UpdateAverageViewsRequest;
    try {
      requestData = await request.json();
      console.log('📊 API Route: Request data:', requestData);
    } catch (parseError) {
      console.log('❌ API Route: Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request body', success: false },
        { status: 400 }
      );
    }
    
    // Validation
    if (requestData.average_views !== null && requestData.average_views !== undefined) {
      if (typeof requestData.average_views !== 'number' || requestData.average_views < 0) {
        console.log('❌ API Route: Invalid average_views value:', requestData.average_views);
        return NextResponse.json(
          { error: 'Average views must be a non-negative number or null', success: false },
          { status: 400 }
        );
      }
    }

    console.log('✅ API Route: Request data validated successfully');

    try {
      console.log('🔍 API Route: Checking if influencer exists...');
      // First verify the influencer exists
      const existingInfluencer = await getCampaignInfluencerByIdServer(id, authToken);
      console.log('📋 API Route: Existing influencer found:', existingInfluencer ? 'Yes' : 'No');
      
      if (!existingInfluencer) {
        console.log('❌ API Route: Campaign influencer not found');
        return NextResponse.json(
          { error: 'Campaign influencer not found', success: false },
          { status: 404 }
        );
      }

      console.log('🔄 API Route: Updating average views...');
      // Update the average views
      const result = await updateCampaignInfluencerAverageViewsServer(id, requestData, authToken);
      console.log('✅ API Route: Average views updated successfully');
      console.log('📊 API Route: Update result:', {
        success: result ? 'Yes' : 'No',
        hasData: result?.data ? 'Yes' : 'No'
      });
      
      return NextResponse.json(result, { status: 200 });
      
    } catch (serviceError) {
      console.log('❌ API Route: Service error occurred:', serviceError);
      console.log('🔍 API Route: Service error details:', {
        message: serviceError instanceof Error ? serviceError.message : 'Unknown error',
        name: serviceError instanceof Error ? serviceError.name : 'Unknown',
        stack: serviceError instanceof Error ? serviceError.stack : 'No stack trace'
      });
      
      if (serviceError instanceof Error) {
        if (serviceError.message.includes('404') || serviceError.message.includes('not found')) {
          console.log('🔍 API Route: Returning 404 - influencer not found');
          return NextResponse.json(
            { error: 'Campaign influencer not found', success: false },
            { status: 404 }
          );
        }
        
        if (serviceError.message.includes('401') || serviceError.message.includes('unauthorized')) {
          console.log('🔍 API Route: Returning 401 - authentication failed');
          return NextResponse.json(
            { error: 'Authentication failed', success: false },
            { status: 401 }
          );
        }
        
        console.log('🔍 API Route: Returning 500 - service error');
        return NextResponse.json(
          { error: serviceError.message, success: false },
          { status: 500 }
        );
      }
      
      console.log('🔍 API Route: Returning 500 - unknown error');
      return NextResponse.json(
        { error: 'Internal server error', success: false },
        { status: 500 }
      );
    }

  } catch (error) {
    console.log('💥 API Route: Unexpected error occurred:', error);
    console.log('🔍 API Route: Unexpected error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}

// Add GET method for debugging
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  
  return NextResponse.json({
    message: 'Average views API endpoint is working',
    method: 'GET',
    params,
    timestamp: new Date().toISOString()
  });
}