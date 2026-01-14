// src/app/api/v0/users/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { updateUserStatusServer } from '@/services/users/users.server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PUT /api/v0/users/[id]/status - Update user status (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    console.log(`🚀 API Route: PUT /api/v0/users/${id}/status`);
    
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
    let statusData;
    try {
      statusData = await request.json();
      console.log('📋 API Route: Parsed status data:', statusData);
    } catch (error) {
      console.error('❌ API Route: Failed to parse request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate status data
    if (!statusData || !statusData.status) {
      console.error('❌ API Route: Invalid status data format');
      return NextResponse.json(
        { success: false, error: 'Status is required' },
        { status: 400 }
      );
    }

    // Validate status value
    const validStatuses = ['active', 'inactive', 'pending', 'suspended'];
    if (!validStatuses.includes(statusData.status)) {
      console.error('❌ API Route: Invalid status value:', statusData.status);
      return NextResponse.json(
        { success: false, error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Call server service to update user status in FastAPI
    await updateUserStatusServer(id, statusData.status, authToken);

    console.log('✅ API Route: Successfully updated user status');
    return NextResponse.json({
      success: true,
      message: 'User status updated successfully'
    });

  } catch (error) {
    console.error('💥 API Route: Error in PUT /api/v0/users/[id]/status:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
    const statusCode = errorMessage.includes('not found') ? 404 : 
                      errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}