// src/app/api/v0/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CommentsServerService } from '@/services/comments/comments.server';
import { CreateCommentRequest } from '@/types/comment';

export async function POST(request: NextRequest) {
  try {
    // Extract token from standard Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const requestData: CreateCommentRequest = await request.json();
    
    // Validate required fields
    if (!requestData.content || typeof requestData.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (!requestData.entity_type || !requestData.entity_id) {
      return NextResponse.json(
        { error: 'Entity type and entity ID are required' },
        { status: 400 }
      );
    }
    
    const comment = await CommentsServerService.createComment(requestData, authToken);
    
    return NextResponse.json(comment, { status: 200 });
    
  } catch (error) {
    console.error('Error creating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}