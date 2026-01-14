// src/app/api/v0/instagram/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchInstagramCommentsServer } from '@/services/insights-iq/comments/comments.server';
import { InstagramCommentRequest } from '@/types/instagram-comments';

/**
 * POST /api/v0/instagram/comments
 * Fetch Instagram comments for a specific post/reel
 * 
 * Request Body:
 * {
 *   content_url: string (required) - Instagram post/reel URL
 *   work_platform_id: string (required) - Platform UUID
 *   offset?: number (optional, default: 0)
 *   limit?: number (optional, max: 15, default: 15)
 *   sort_by?: 'likes' | 'recent' (optional, default: 'likes')
 * }
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 API Route: POST /api/v0/instagram/comments');

    // Extract auth token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: Missing authentication token');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication token is required. Please log in first.' 
        },
        { status: 401 }
      );
    }

    console.log('✅ API Route: Auth token validated');

    // Parse request body
    const requestData: InstagramCommentRequest = await request.json();

    // Validate required fields
    if (!requestData.content_url) {
      console.error('❌ API Route: Missing content_url');
      return NextResponse.json(
        { 
          success: false,
          error: 'content_url is required. Please provide an Instagram post/reel URL.' 
        },
        { status: 400 }
      );
    }

    if (!requestData.work_platform_id) {
      console.error('❌ API Route: Missing work_platform_id');
      return NextResponse.json(
        { 
          success: false,
          error: 'work_platform_id is required. Please provide a valid platform UUID.' 
        },
        { status: 400 }
      );
    }

    // Validate content_url format (basic Instagram URL check)
    const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\/[a-zA-Z0-9_-]+\/?/;
    if (!instagramUrlPattern.test(requestData.content_url)) {
      console.error('❌ API Route: Invalid Instagram URL format');
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid Instagram URL format. URL must be a valid Instagram post, reel, or IGTV link.' 
        },
        { status: 400 }
      );
    }

    // Validate and enforce limit (max 15)
    if (requestData.limit && requestData.limit > 15) {
      console.warn('⚠️ API Route: Limit exceeds maximum, capping at 15');
      requestData.limit = 15;
    }

    // Validate offset (must be non-negative)
    if (requestData.offset && requestData.offset < 0) {
      console.error('❌ API Route: Invalid offset value');
      return NextResponse.json(
        { 
          success: false,
          error: 'offset must be a non-negative number.' 
        },
        { status: 400 }
      );
    }

    // Validate sort_by parameter
    if (requestData.sort_by && !['likes', 'recent'].includes(requestData.sort_by)) {
      console.error('❌ API Route: Invalid sort_by value');
      return NextResponse.json(
        { 
          success: false,
          error: 'sort_by must be either "likes" or "recent".' 
        },
        { status: 400 }
      );
    }

    console.log('✅ API Route: Validation passed, calling server service...');

    // Call server service to fetch comments
    const result = await fetchInstagramCommentsServer(requestData, authToken);

    console.log('📊 API Route: Server service responded:', {
      success: result.success,
      comments_count: result.comments?.length || 0,
    });

    // Return response
    if (result.success) {
      console.log('✅ API Route: Comments fetched successfully');
      return NextResponse.json(result, { status: 200 });
    } else {
      console.error('❌ API Route: Failed to fetch comments:', result.error);
      return NextResponse.json(result, { status: 500 });
    }

  } catch (error) {
    console.error('💥 API Route: Unexpected error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        comments: [],
        pagination: {
          offset: 0,
          limit: 15,
          total: 0,
          has_more: false,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}