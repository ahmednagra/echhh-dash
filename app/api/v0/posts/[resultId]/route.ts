// src/app/api/v0/results/[resultId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  getVideoResultServer,
  updateVideoResultServer,
  deleteVideoResultServer 
} from '@/services/video-results/video-results.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { UpdateVideoResultRequest } from '@/types/user-detailed-info';

/**
 * GET /api/v0/results/[resultId]
 * Get video result by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;
    
    console.log(`API Route: GET /api/v0/results/${resultId} called`);
    
    if (!resultId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Result ID parameter is required' 
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
    const videoResult = await getVideoResultServer(resultId, authToken);
    
    console.log(`API Route: Successfully fetched video result ${resultId}`);
    return NextResponse.json(videoResult);
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
        error: 'Failed to fetch video result' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v0/results/[resultId]
 * Update video result
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;
    
    console.log(`API Route: PUT /api/v0/results/${resultId} called`);
    
    if (!resultId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Result ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updateData: UpdateVideoResultRequest = await request.json();
    console.log('API Route: Update data:', updateData);
    
    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Update data is required' 
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
    const updatedResult = await updateVideoResultServer(resultId, updateData, authToken);
    
    console.log(`API Route: Successfully updated video result ${resultId}`);
    return NextResponse.json({
      success: true,
      data: updatedResult
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
        error: 'Failed to update video result' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v0/results/[resultId]
 * Delete video result
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { resultId: string } }
) {
  try {
    const { resultId } = params;
    
    console.log(`API Route: DELETE /api/v0/results/${resultId} called`);
    
    if (!resultId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Result ID parameter is required' 
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
    await deleteVideoResultServer(resultId, authToken);
    
    console.log(`API Route: Successfully deleted video result ${resultId}`);
    return NextResponse.json({
      success: true
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
        error: 'Failed to delete video result' 
      },
      { status: 500 }
    );
  }
}