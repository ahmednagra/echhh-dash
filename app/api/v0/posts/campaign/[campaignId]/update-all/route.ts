// src/app/api/v0/results/campaign/[campaignId]/update-all/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { updateAllVideoResultsWithDataServer } from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface BatchUpdateRequest {
  result_id: string;
  update_data: {
    user_ig_id?: string;
    full_name?: string;
    influencer_username?: string;
    profile_pic_url?: string;
    post_id?: string;
    title?: string;
    views_count?: number;
    plays_count?: number;
    likes_count?: number;
    comments_count?: number;
    media_preview?: string;
    duration?: number;
    thumbnail?: string;
    post_created_at?: string;
    post_result_obj?: any;
  };
}

interface BatchUpdateRequestBody {
  updates: BatchUpdateRequest[];
}

/**
 * POST /api/v0/posts/campaign/[campaignId]/update-all
 * Batch update all video results for a specific campaign with fresh data
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { campaignId } = params;
    
    console.log(`API Route: POST /api/v0/posts/campaign/${campaignId}/update-all called`);
    
    if (!campaignId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Campaign ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Parse request body
    const requestBody: BatchUpdateRequestBody = await request.json();
    console.log('API Route: Request body:', {
      hasUpdates: !!requestBody.updates,
      updatesCount: requestBody.updates?.length || 0
    });
    
    // Validate request body
    if (!requestBody.updates || !Array.isArray(requestBody.updates) || requestBody.updates.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Updates array is required and must not be empty' 
        },
        { status: 400 }
      );
    }
    
    // Validate each update has required fields
    for (const update of requestBody.updates) {
      if (!update.result_id || !update.update_data) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Each update must have result_id and update_data' 
          },
          { status: 400 }
        );
      }
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log(`API Route: Calling FastAPI backend to batch update ${requestBody.updates.length} video results...`);
    // Call FastAPI backend through server-side service with auth token
    const updatedResults = await updateAllVideoResultsWithDataServer(
      campaignId, 
      requestBody.updates, 
      authToken
    );
    
    console.log(`API Route: Successfully batch updated video results for campaign ${campaignId}`);
    return NextResponse.json({
      success: true,
      results: updatedResults.results,
      // total: updatedResults.total || updatedResults.results.length
    });
  } catch (error) {
    console.error('API Route Error:', error);
    
    if (error instanceof Error) {
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
        error: 'Failed to batch update video results' 
      },
      { status: 500 }
    );
  }
}