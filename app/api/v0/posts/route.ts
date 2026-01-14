// src/app/api/v0/results/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createVideoResultServer } from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CreateVideoResultRequest } from '@/types/user-detailed-info';

/**
 * POST /api/v0/results
 * Create a new video result
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: POST /api/v0/results called');
    
    // Parse request body
    const data: CreateVideoResultRequest = await request.json();
    console.log('API Route: Request data:', data);
    
    // Basic validation
    if (!data || !data.campaign_id || !data.post_id || !data.influencer_username) {
      return NextResponse.json(
        { 
          success: false,
          error: 'campaign_id, post_id, and influencer_username are required' 
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
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const videoResult = await createVideoResultServer(data, authToken);
    
    console.log('API Route: Successfully created video result');
    return NextResponse.json({
      success: true,
      data: videoResult
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
        error: 'Failed to create video result' 
      },
      { status: 500 }
    );
  }
}