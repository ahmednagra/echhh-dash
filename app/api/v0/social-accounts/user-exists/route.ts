// src/app/api/v0/social-accounts/user-exists/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { checkUsersExistServer } from '@/services/social-accounts/social-accounts.server';
import { UserExistsRequest } from '@/types/social-accounts';

// Handle preflight OPTIONS requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  try {

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No authentication token provided');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    let requestData: UserExistsRequest;
    try {
      requestData = await request.json();
    } catch (error) {
      console.error('❌ API Route: Invalid JSON in request body');
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!requestData.platform_account_ids || !Array.isArray(requestData.platform_account_ids)) {
      console.error('❌ API Route: Missing or invalid platform_account_ids');
      return NextResponse.json(
        { error: 'platform_account_ids array is required' },
        { status: 400 }
      );
    }

    if (requestData.platform_account_ids.length === 0) {
      console.log('⚠️ API Route: Empty platform_account_ids array provided');
      return NextResponse.json({
        results: []
      });
    }

    console.log('📋 API Route: Checking existence for IDs:', requestData.platform_account_ids);

    // Call server service
    const result = await checkUsersExistServer(requestData, authToken);
    
    console.log('✅ API Route: Successfully processed user existence check');
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('💥 API Route: Unexpected error in user-exists:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}