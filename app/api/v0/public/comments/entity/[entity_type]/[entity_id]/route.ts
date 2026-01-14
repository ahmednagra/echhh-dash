// src/app/api/v0/public/comments/entity/[entity_type]/[entity_id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getPublicCommentsServer } from '@/services/public-comments/public-comments.server';
import { GetPublicCommentsParams } from '@/types/public-comments';

interface RouteContext {
  params: {
    entity_type: string;
    entity_id: string;
  };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { entity_type, entity_id } = params;
    const { searchParams } = new URL(request.url);
    
    // Extract required token parameter
    const token = searchParams.get('token');
    if (!token) {
      return NextResponse.json(
        {
          detail: [{
            type: 'missing',
            loc: ['query', 'token'],
            msg: 'Field required',
            input: null
          }]
        },
        { status: 422 }
      );
    }
    
    // Extract optional pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    // Validate pagination parameters
    if (page < 1) {
      return NextResponse.json(
        { detail: 'Page must be greater than 0' },
        { status: 400 }
      );
    }
    
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { detail: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }
    
    const requestParams: GetPublicCommentsParams = {
      entity_type,
      entity_id,
      token,
      page,
      limit
    };
    
    const result = await getPublicCommentsServer(requestParams);
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error fetching public comments:', error);
    
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
      
      // Check for not found errors
      if (errorMessage.includes('not found') || errorMessage.includes('404')) {
        return NextResponse.json(
          { detail: 'Entity not found' },
          { status: 404 }
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