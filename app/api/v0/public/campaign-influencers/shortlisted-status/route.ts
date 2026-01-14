// src/app/api/v0/public/campaign-influencers/shortlisted-status/route.ts
// ⭐ CREATE THIS NEW FILE

import { NextRequest, NextResponse } from 'next/server';
import { updatePublicShortlistedStatusServer } from '@/services/public-campaign-influencers/public-campaign-influencers.server';

interface UpdatePublicShortlistedStatusBulkRequest {
  influencer_ids: string[];
  shortlisted_status_id: string;
  token: string;
}

/**
 * POST /api/v0/public/campaign-influencers/shortlisted-status
 * Update shortlisted status for one or multiple influencers
 */
export async function PATCH(request: NextRequest) {
  try {
    console.log('📞 API Route: PATCH /public/campaign-influencers/shortlisted-status');
    
    const requestData: UpdatePublicShortlistedStatusBulkRequest = await request.json();
    
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
    
    if (!requestData.influencer_ids || !Array.isArray(requestData.influencer_ids) || requestData.influencer_ids.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'influencer_ids must be a non-empty array' 
        },
        { status: 400 }
      );
    }

    console.log(`🔄 Processing ${requestData.influencer_ids.length} influencer(s)`);
    
    // Process all influencers
    const results = await Promise.allSettled(
      requestData.influencer_ids.map(async (influencerId) => {
        try {
          const result = await updatePublicShortlistedStatusServer(
            influencerId,
            {
              token: requestData.token,
              shortlisted_status_id: requestData.shortlisted_status_id
            }
          );
          return { success: true, influencerId, data: result };
        } catch (error) {
          console.error(`Failed to update ${influencerId}:`, error);
          return { 
            success: false, 
            influencerId, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      })
    );

    // Count successes and failures
    const successful = results.filter(
      result => result.status === 'fulfilled' && result.value.success
    );
    const failed = results.filter(
      result => result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
    );

    const errors = failed.map(result => {
      if (result.status === 'rejected') {
        return result.reason;
      } else if (result.status === 'fulfilled') {
        return result.value.error || 'Unknown error';
      }
      return 'Unknown error';
    });

    console.log(`✅ Updated: ${successful.length}, ❌ Failed: ${failed.length}`);

    // For single influencer, return the data directly
    if (requestData.influencer_ids.length === 1 && successful.length === 1) {
      const successfulResult = successful[0];
      if (successfulResult.status === 'fulfilled') {
        return NextResponse.json({
          success: true,
          data: successfulResult.value.data,
          message: 'Shortlisted status updated successfully'
        }, { status: 200 });
      }
    }

    // For bulk, return counts
    return NextResponse.json({
      success: successful.length > 0,
      updated_count: successful.length,
      failed_count: failed.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully updated ${successful.length} influencer(s)${failed.length > 0 ? `, ${failed.length} failed` : ''}`
    }, { status: 200 });
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
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