// src/app/api/v0/content-posts/campaign/[campaignId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getContentPostsServer } from '@/services/content-posts/content-post.server';
import { extractBearerToken } from '@/lib/auth-utils';

/**
 * GET /api/v0/content-posts/campaign/[campaignId]
 * Get content posts for a specific campaign
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID parameter is required' },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '200'); // ← Changed default to 200

    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 },
      );
    }

    const response = await getContentPostsServer(
      {
        campaign_id: campaignId,
        page: page,
        size: limit, // ← CHANGED: page_size → size (backend parameter name)
      },
      authToken,
    );

    // ✅ NEW: Handle response with pagination from backend
    let items: any[] = [];
    let pagination: any = null;

    if (response && typeof response === 'object') {
      // Backend returns { items: [], pagination: {} }
      if ('items' in response) {
        items = (response as any).items || [];
        pagination = (response as any).pagination || null;
      } else if ('data' in response && (response as any).data) {
        const dataObj = (response as any).data;
        if ('items' in dataObj && Array.isArray(dataObj.items)) {
          items = dataObj.items;
          pagination = dataObj.pagination || null;
        } else if (Array.isArray(dataObj)) {
          items = dataObj;
        }
      }
    } else if (Array.isArray(response)) {
      items = response;
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid data format received from backend' },
        { status: 500 },
      );
    }

    // ✅ Use backend pagination if available, otherwise calculate
    const finalPagination = pagination || {
      page: page,
      page_size: limit,
      total_items: items.length,
      total_pages: Math.ceil(items.length / limit) || 1,
      has_next: false,
      has_previous: page > 1,
    };

    return NextResponse.json({
      items: items,
      pagination: finalPagination,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch content posts',
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/v0/content-posts/campaign/[campaignId]
 * Batch update all content posts for a campaign
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { campaignId: string } },
) {
  try {
    const { campaignId } = params;

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID parameter is required' },
        { status: 400 },
      );
    }

    const requestBody = await request.json();
    const updatesData = requestBody.updates;

    if (
      !updatesData ||
      !Array.isArray(updatesData) ||
      updatesData.length === 0
    ) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 },
      );
    }

    const authToken = extractBearerToken(request);

    if (!authToken) {
      return NextResponse.json(
        { error: 'Bearer token is required' },
        { status: 401 },
      );
    }

    const { updateAllContentPostsWithDataServer } = await import(
      '@/services/content-posts/content-post.server'
    );
    const result = await updateAllContentPostsWithDataServer(
      campaignId,
      updatesData,
      authToken,
    );

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to batch update content posts',
      },
      { status: 500 },
    );
  }
}
