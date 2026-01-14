// src/app/api/v0/content-posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  createContentPostServer,
  getContentPostsServer
} from '@/services/content-posts/content-post.server';
import { ContentPostCreate, validContentTypes } from '@/types/content-post';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 API Route: POST /api/v0/content-posts called');

    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No authentication token provided');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    let requestData: ContentPostCreate;

    try {
      requestData = await request.json();
      console.log('📋 API Route: Request data parsed successfully');
    } catch (parseError) {
      console.error('❌ API Route: Failed to parse request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    const requiredFields = [
      'campaign_id',
      'campaign_influencer_id',
      'content_url',
      'content_type'
    ];

    const missingFields = requiredFields.filter(field => !requestData[field as keyof ContentPostCreate]);

    if (missingFields.length > 0) {
      console.error('❌ API Route: Missing required fields:', missingFields);
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log('✅ API Route: All required fields present');

    // Validate content_url format
    if (requestData.content_url && !isValidUrl(requestData.content_url)) {
      console.error('❌ API Route: Invalid content URL format');
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid content_url format'
        },
        { status: 400 }
      );
    }

    // Validate content_type
    if (requestData.content_type && !validContentTypes.includes(requestData.content_type)) {
      console.error('❌ API Route: Invalid content type:', requestData.content_type);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid content_type. Must be one of: ${validContentTypes.join(', ')}`
        },
        { status: 400 }
      );
    }
    console.log('✅ API Route: Additional validation passed');

    console.log('🚀 API Route: Calling server service...');

    const result = await createContentPostServer(requestData, authToken);

    console.log('✅ API Route: Content post created successfully:', result.id);

    return NextResponse.json(
      {
        success: true,
        data: result,
        message: 'Content post created successfully'
      },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/content-posts:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to create content post';

    let statusCode = 500;
    if (errorMessage.includes('not found')) {
      statusCode = 404;
    } else if (errorMessage.includes('already exists')) {
      statusCode = 409;
    } else if (errorMessage.includes('required') || errorMessage.includes('invalid')) {
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: statusCode }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('📥 API Route: GET /api/v0/content-posts called');

    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No authentication token provided');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Authentication token validated');

    const { searchParams } = new URL(request.url);

    const queryParams = {
      campaign_id: searchParams.get('campaign_id') || undefined,
      campaign_influencer_id: searchParams.get('campaign_influencer_id') || undefined,
      platform_id: searchParams.get('platform_id') || undefined,
      content_type: searchParams.get('content_type') || undefined,
      tracking_status: searchParams.get('tracking_status') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : undefined,
    };

    console.log('📋 API Route: Query parameters extracted:', queryParams);

    if (queryParams.content_type) {
      const validContentTypes = ['post', 'reel', 'story', 'video', 'carousel'];
      if (!validContentTypes.includes(queryParams.content_type)) {
        console.error('❌ API Route: Invalid content_type filter');
        return NextResponse.json(
          {
            success: false,
            error: `Invalid content_type. Must be one of: ${validContentTypes.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    if (queryParams.tracking_status) {
      const validStatuses = ['active', 'paused', 'completed'];
      if (!validStatuses.includes(queryParams.tracking_status)) {
        console.error('❌ API Route: Invalid tracking_status filter');
        return NextResponse.json(
          {
            success: false,
            error: `Invalid tracking_status. Must be one of: ${validStatuses.join(', ')}`
          },
          { status: 400 }
        );
      }
    }

    if (queryParams.page && queryParams.page < 1) {
      console.error('❌ API Route: Invalid page number');
      return NextResponse.json(
        {
          success: false,
          error: 'Page number must be greater than 0'
        },
        { status: 400 }
      );
    }

    if (queryParams.page_size && (queryParams.page_size < 1 || queryParams.page_size > 100)) {
      console.error('❌ API Route: Invalid page_size');
      return NextResponse.json(
        {
          success: false,
          error: 'Page size must be between 1 and 100'
        },
        { status: 400 }
      );
    }

    console.log('✅ API Route: Query parameter validation passed');

    console.log('🚀 API Route: Calling server service...');

    const result = await getContentPostsServer(queryParams, authToken);

    console.log(`✅ API Route: Successfully fetched ${result.length} content posts`);

    return NextResponse.json(
      {
        success: true,
        data: result,
        count: result.length,
        filters: queryParams
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/content-posts:', error);

    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch content posts';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage
      },
      { status: 500 }
    );
  }
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}