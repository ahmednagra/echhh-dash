// src/app/api/v0/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { getUsersServer, getUserStatsServer, createUserServer } from '@/services/users/users.server';
import { UserSearchParams } from '@/types/users';

/**
 * GET /api/v0/users - Get all users with optional filtering
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const params: UserSearchParams = {
      skip: searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      search: searchParams.get('search') || undefined,
      user_type: searchParams.get('user_type') as 'platform' | 'company' | 'influencer' | undefined,
      status: searchParams.get('status') as 'active' | 'inactive' | 'pending' | 'suspended' | undefined,
    };

    console.log('📋 API Route: Search params:', params);

    // Call server service to get users from FastAPI
    const result = await getUsersServer(params, authToken);

    // ✅ FIXED: Check if result has pagination info (users + total) or is just array
    let users: any[];
    let total: number;
    
    if (Array.isArray(result)) {
      // If backend returns just array, we need to handle it
      console.warn('⚠️ Backend returned array only. Pagination may not work correctly.');
      users = result;
      total = result.length; // This is the problem - only current page count
    } else {
      // If backend returns proper paginated response
      const resultData = result as any; // Type assertion to access properties
      users = resultData.users || resultData.data || [];
      total = resultData.total || resultData.count || 0;
    }

    // Wrap response in the format the frontend expects
    const response = {
      success: true,
      data: users,
      total: total,  // ✅ Now uses total from backend, not just array length
      skip: params.skip,
      limit: params.limit
    };

    console.log(`✅ API Route: Successfully retrieved ${users.length} users out of ${total} total`);
    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/users:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to get users';
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        data: [],
        total: 0,
        skip: 0,
        limit: 10
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/users - Create new user
 * ✅ Now follows API Flow Structure - calls server service
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🟢 API ROUTE: POST /api/v0/users called');
    
    // 1. Extract and validate authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token found');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.log('🔑 API Route: Auth token found, proceeding with request');

    // 2. Parse and validate request body
    let userData;
    try {
      userData = await request.json();
      console.log('📋 API Route: Parsed user data:', userData);
    } catch (error) {
      console.error('❌ API Route: Failed to parse request body:', error);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate required fields
    if (!userData.user_type) {
      return NextResponse.json(
        { success: false, error: 'User type is required' },
        { status: 400 }
      );
    }

    if (!userData.email || !userData.password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate user type
    const validUserTypes = ['b2b', 'b2c', 'platform', 'influencer'];
    if (!validUserTypes.includes(userData.user_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid user type: ${userData.user_type}` },
        { status: 400 }
      );
    }

    console.log('🟢 API ROUTE: Validation passed, calling server service');

    // 4. ✅ Call server service (following the API flow)
    const newUser = await createUserServer(userData, authToken);

    console.log('✅ API Route: Successfully created user via server service');
    
    // 5. Return success response
    return NextResponse.json({
      success: true,
      data: newUser
    }, { status: 201 });

  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/users:', error);
    
    // Better error message extraction
    let errorMessage = 'Failed to create user';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Determine status code based on error message
      if (errorMessage.includes('validation') || 
          errorMessage.includes('Invalid') ||
          errorMessage.includes('required')) {
        statusCode = 400;
      } else if (errorMessage.includes('unauthorized') || 
                 errorMessage.includes('Authentication')) {
        statusCode = 401;
      } else if (errorMessage.includes('already exists') ||
                 errorMessage.includes('duplicate')) {
        statusCode = 409;
      }
    }
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}