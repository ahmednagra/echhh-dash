// src/app/api/v0/tags/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getAllTagsServer } from '@/services/tags/tags.server';

/**
 * GET /api/v0/tags
 * Fetch all tags for the company
 */
export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const size = parseInt(searchParams.get('size') || '100', 10);
    
    const result = await getAllTagsServer(authToken, page, size);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('❌ API Route: Error fetching tags:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}