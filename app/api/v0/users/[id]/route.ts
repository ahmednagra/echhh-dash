// src/app/api/v0/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUserServer, updateUserServer } from '@/services/users/users.server';
import { UpdateUserRequest } from '@/types/users';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET /api/v0/users/[id] - Get user by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Call server service to get user from FastAPI
    const user = await getUserServer(params.id, authToken);

    console.log('✅ API Route: Successfully retrieved user');
    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/users/[id]:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get user';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * PUT /api/v0/users/[id] - Update user by ID
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // Parse request body
    let updateData: UpdateUserRequest;
    try {
      updateData = await request.json();
      console.log('📋 API Route: Parsed update data:', updateData);
    } catch (error) {
      console.error('❌ API Route: Failed to parse request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate update data
    if (!updateData || typeof updateData !== 'object') {
      console.error('❌ API Route: Invalid update data format');
      return NextResponse.json(
        { success: false, error: 'Invalid update data format' },
        { status: 400 }
      );
    }

    // Call server service to update user in FastAPI
    const updatedUser = await updateUserServer(params.id, updateData, authToken);

    console.log('✅ API Route: Successfully updated user');
    return NextResponse.json({
      success: true,
      data: updatedUser
    });

  } catch (error) {
    console.error('💥 API Route: Error in PUT /api/v0/users/[id]:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
    const statusCode = errorMessage.includes('not found') ? 404 : 
                      errorMessage.includes('validation') || errorMessage.includes('Invalid') ? 400 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * DELETE /api/v0/users/[id] - Delete user by ID (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    
    // Get auth token from request
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with delete request');

    // Call FastAPI delete endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    console.log('✅ API Route: Successfully deleted user');
    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('💥 API Route: Error in DELETE /api/v0/users/[id]:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    const statusCode = errorMessage.includes('not found') ? 404 :
                      errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}