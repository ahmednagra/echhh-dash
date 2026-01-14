// src/app/api/v0/comments/entity/[entity_type]/[entity_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CommentsServerService } from '@/services/comments/comments.server';
import { GetCommentsParams } from '@/types/comment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity_type: string; entity_id: string }> }
) {
  try {
    const { entity_type, entity_id } = await params;
    
    if (!entity_type || !entity_id) {
      return NextResponse.json(
        { error: 'Entity type and entity ID are required' },
        { status: 400 }
      );
    }
    
    // Extract token from standard Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    
    const queryParams: GetCommentsParams = {
      entity_type: entity_type as 'campaign_influencer' | 'campaign' | 'influencer',
      entity_id: entity_id,
      include_private: searchParams.get('include_private') === 'true',
      include_replies: searchParams.get('include_replies') === 'true',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      size: searchParams.get('size') ? parseInt(searchParams.get('size')!, 10) : 20,
    };
    
    // Validate pagination params
    if (queryParams.page && queryParams.page < 1) {
      return NextResponse.json(
        { error: 'Page must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (queryParams.size && (queryParams.size < 1 || queryParams.size > 100)) {
      return NextResponse.json(
        { error: 'Size must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    const response = await CommentsServerService.getCommentsByEntity(queryParams, authToken);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}