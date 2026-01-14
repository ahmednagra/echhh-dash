// src/app/api/v0/public/comments/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPublicCommentServer } from '@/services/public-comments/public-comments.server';
import { CreatePublicCommentRequest } from '@/types/public-comments';

export async function POST(request: NextRequest) {
  try {
    const requestData: CreatePublicCommentRequest = await request.json();
    
    // Validate required fields
    if (!requestData.content || typeof requestData.content !== 'string') {
      return NextResponse.json(
        {
          detail: [{
            type: 'missing',
            loc: ['body', 'content'],
            msg: 'Content is required and must be a string',
            input: requestData.content
          }]
        },
        { status: 422 }
      );
    }
    
    if (!requestData.entity_type || !requestData.entity_id) {
      return NextResponse.json(
        {
          detail: [{
            type: 'missing',
            loc: ['body', requestData.entity_type ? 'entity_id' : 'entity_type'],
            msg: 'Entity type and entity ID are required',
            input: null
          }]
        },
        { status: 422 }
      );
    }
    
    if (!requestData.token) {
      return NextResponse.json(
        {
          detail: [{
            type: 'missing',
            loc: ['body', 'token'],
            msg: 'Token is required for public comment creation',
            input: null
          }]
        },
        { status: 422 }
      );
    }
    
    // Set default values
    const commentData: CreatePublicCommentRequest = {
      ...requestData,
      comment_type: requestData.comment_type || 'comment',
      is_private: requestData.is_private ?? false,
    };
    
    const result = await createPublicCommentServer(commentData);
    
    return NextResponse.json(result, { status: 201 });
    
  } catch (error) {
    console.error('API Route: Error creating public comment:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      // Check for authentication errors
      if (errorMessage.includes('Invalid or expired session token')) {
        return NextResponse.json(
          { detail: 'Invalid or expired session token' },
          { status: 401 }
        );
      }
      
      // Check for validation errors
      if (errorMessage.includes('validation')) {
        return NextResponse.json(
          { detail: errorMessage },
          { status: 422 }
        );
      }
      
      // Check for permission errors
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        return NextResponse.json(
          { detail: 'Insufficient permissions to create comment' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { detail: errorMessage },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { detail: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}