// src/app/api/v0/discover/userhandles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { userhandlesService } from '@/services/insights-iq/userhandles';
import type { UserhandlesResponse } from '@/services/insights-iq/userhandles';

/**
 * GET /api/v0/discover/userhandles
 * Search for userhandles/influencers for lookalike discovery
 * 
 * Query Parameters:
 * - q: string (required) - Search query
 * - type: string (optional) - Type of search (lookalike, search, topic-tags)
 * - limit: number (optional) - Number of results to return
 * - work_platform_id: string (optional) - Platform ID
 * 
 * Example: /api/v0/discover/userhandles?q=cristiano&limit=10
 */
export async function GET(request: NextRequest): Promise<NextResponse<UserhandlesResponse>> {
  try {
    console.log('🎯 Userhandles API called:', request.url);

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const limitParam = searchParams.get('limit');
    const workPlatformId = searchParams.get('work_platform_id');

    // Validate required parameters
    if (!query) {
      console.error('❌ Missing required parameter: q');
      return NextResponse.json({
        success: false,
        data: [],
        total: 0,
        query: '',
        error: 'Query parameter "q" is required'
      }, { status: 400 });
    }

    // Parse optional parameters
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    if (limitParam && (isNaN(limit!) || limit! < 1 || limit! > 100)) {
      console.error('❌ Invalid limit parameter:', limitParam);
      return NextResponse.json({
        success: false,
        data: [],
        total: 0,
        query: query,
        error: 'Limit must be a number between 1 and 100'
      }, { status: 400 });
    }

    // Log request parameters
    console.log('📋 Request parameters:', {
      query,
      type: type || 'lookalike (default)',
      limit: limit || '20 (default)',
      workPlatformId: workPlatformId || '9bb8913b-ddd9-430b-a66a-d74d846e6c66 (default)'
    });

    // Call userhandles service
    const result = await userhandlesService.searchUserhandles(query, {
      type: type || undefined,
      limit: limit || undefined,
      work_platform_id: workPlatformId || undefined
    });

    // Log results
    if (result.success) {
      console.log(`✅ Found ${result.data.length} userhandles for query: "${query}"`);
    } else {
      console.error('❌ Userhandles search failed:', result.error);
    }

    // Return response
    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    console.error('💥 Unexpected error in userhandles API:', error);

    const errorResponse: UserhandlesResponse = {
      success: false,
      data: [],
      total: 0,
      query: '',
      error: 'Internal server error'
    };

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

/**
 * Handle unsupported HTTP methods
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}