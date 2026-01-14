// src/app/api/v0/comments/[commentId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { CommentsServerService } from '@/services/comments/comments.server';
import { UpdateCommentRequest } from '@/types/comment';

export async function PUT(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params;
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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
    
    const requestData: UpdateCommentRequest = await request.json();
    
    // Validate required fields
    if (!requestData.content || typeof requestData.content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }
    
    const comment = await CommentsServerService.updateComment(commentId, requestData, authToken);
    
    return NextResponse.json(comment, { status: 200 });
    
  } catch (error) {
    console.error('Error updating comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const { commentId } = params;
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'Comment ID is required' },
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
    
    const response = await CommentsServerService.deleteComment(commentId, authToken);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting comment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}