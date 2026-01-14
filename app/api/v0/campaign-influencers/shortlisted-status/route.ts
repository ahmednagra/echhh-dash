// src/app/api/v0/campaign-influencers/shortlisted-status/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateCampaignInfluencerShortlistedStatusServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface UpdateShortlistedStatusRequest {
  influencer_ids: string[]; // Now always an array
  shortlisted_status_id: string;
}

interface UpdateShortlistedStatusResponse {
  success: boolean;
  updated_count?: number;
  failed_count?: number;
  errors?: string[];
  message?: string;
  data?: any; // For single updates
}

/**
 * PATCH /api/v0/campaign-influencers/shortlisted-status
 * Update campaign influencers shortlisted status (single or bulk)
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('API Route: PATCH /api/v0/campaign-influencers/shortlisted-status called');
    
    // Parse request body
    const requestData: UpdateShortlistedStatusRequest = await request.json();
    console.log('API Route: Request data:', requestData);
    
    // Basic validation
    if (!requestData || !requestData.influencer_ids || !requestData.shortlisted_status_id) {
      return NextResponse.json(
        { 
          success: false,
          message: 'influencer_ids array and shortlisted_status_id are required' 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(requestData.influencer_ids) || requestData.influencer_ids.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'influencer_ids must be a non-empty array' 
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

    const influencerCount = requestData.influencer_ids.length;
    console.log(`API Route: Updating ${influencerCount} influencer(s) shortlisted status`);
    
    // Process each influencer update
    const results = await Promise.allSettled(
      requestData.influencer_ids.map(async (influencerId) => {
        try {
          console.log(`Updating influencer ${influencerId} with status ${requestData.shortlisted_status_id}`);
          
          const updatedInfluencer = await updateCampaignInfluencerShortlistedStatusServer(
            influencerId,
            { shortlisted_status_id: requestData.shortlisted_status_id },
            authToken
          );
          
          return { success: true, influencerId, data: updatedInfluencer };
        } catch (error) {
          console.error(`Failed to update influencer ${influencerId}:`, error);
          return { 
            success: false, 
            influencerId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    // Count successful and failed updates
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    );
    const failed = results.filter(result => 
      result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    );

    const errors = failed.map(result => {
      if (result.status === 'rejected') {
        return result.reason;
      } else if (result.status === 'fulfilled') {
        return result.value.error || 'Unknown error';
      }
      return 'Unknown error';
    });

    console.log(`API Route: Update completed. Success: ${successful.length}, Failed: ${failed.length}`);
    
    // For single influencer, return the data
if (influencerCount === 1 && successful.length === 1) {
  const successfulResult = successful[0];
  
  // Type guard to ensure it's a fulfilled result
  if (successfulResult.status === 'fulfilled') {
    const response: UpdateShortlistedStatusResponse = {
      success: true,
      data: successfulResult.value.data,
      message: 'Shortlisted status updated successfully'
    };
    return NextResponse.json(response);
  }
}
    
    // For bulk updates, return counts
    const response: UpdateShortlistedStatusResponse = {
      success: successful.length > 0,
      updated_count: successful.length,
      failed_count: failed.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully updated ${successful.length} influencer(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('API Route Error:', error);
    
    const response: UpdateShortlistedStatusResponse = {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update shortlisted status'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}