// src/app/api/v0/content-posts/[contentPostId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { deleteContentPostServer, updateContentPostServer } from '@/services/content-posts/content-post.server';

/**
 * PUT /api/v0/content-posts/[contentPostId]
 * Update a content post
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { contentPostId: string } }
) {
  try {
    const { contentPostId } = params;
    
    console.log(`🔄 API Route: PUT /api/v0/content-posts/${contentPostId} called`);
    
    if (!contentPostId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content Post ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Parse request body
    const updateData = await request.json();
    console.log('📋 API Route: Update data received:', Object.keys(updateData));
    
    // Basic validation
    if (!updateData || Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Update data is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('🔑 API Route: Token extracted:', authToken ? '✅ Token found' : '❌ No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('🚀 API Route: Calling FastAPI backend...');
    
    // Call FastAPI backend through server-side service with auth token
    const result = await updateContentPostServer(contentPostId, updateData, authToken);
    
    console.log(`✅ API Route: Successfully updated content post ${contentPostId}`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update content post';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: statusCode }
    );
  }
}
/**
 * DELETE /api/v0/content-posts/[contentPostId]
 * Delete a content post
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contentPostId: string } }
) {
  try {
    const { contentPostId } = params;
    
    console.log(`📥 API Route: DELETE /api/v0/content-posts/${contentPostId} called`);
    
    if (!contentPostId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Content Post ID parameter is required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    console.log('API Route: Token extracted:', authToken ? 'Token found' : 'No token found');
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('🚀 API Route: Calling FastAPI backend...');
    
    // Call FastAPI backend through server-side service with auth token
    await deleteContentPostServer(contentPostId, authToken);
    
    console.log(`✅ API Route: Successfully deleted content post ${contentPostId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Content post deleted successfully'
    });
    
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete content post';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage 
      },
      { status: statusCode }
    );
  }
}