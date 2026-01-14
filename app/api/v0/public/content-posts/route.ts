// src/app/api/v0/public/content-posts/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPublicContentPostsServer } from '@/services/public-content-posts/public-content-posts.server';

/**
 * GET /api/v0/public/content-posts
 * Fetch published content posts using public session token
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📞 API Route: GET /api/v0/public/content-posts');

    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');

    // Validation
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log(`🔍 Fetching public content posts (page: ${page}, limit: ${limit})`);

    const result = await getPublicContentPostsServer({ token, page, limit });

    console.log('✅ API Route: Public content posts fetched successfully');
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('❌ API Route: Error in GET /public/content-posts:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}