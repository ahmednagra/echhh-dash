// src/app/api/v0/users/[id]/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { verifyUserEmailServer } from '@/services/users/users.server';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * POST /api/v0/users/[id]/verify-email - Verify user email (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    console.log(`🔧 API Route: POST /api/v0/users/${params.id}/verify-email`);
    
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

    // Call server service to verify user email in FastAPI
    await verifyUserEmailServer(params.id, authToken);

    console.log('✅ API Route: Successfully verified user email');
    return NextResponse.json({
      success: true,
      message: 'User email verified successfully'
    });

  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/users/[id]/verify-email:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify user email';
    const statusCode = errorMessage.includes('not found') ? 404 : 
                      errorMessage.includes('Forbidden') || errorMessage.includes('permission') ? 403 : 500;
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}