// src/app/api/v0/billing/plans/active/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchActivePlansFromServer } from '@/services/billing/plans';

/**
 * GET /api/v0/billing/plans/active
 * Fetch active plans for dropdown selection
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API Route: GET /api/v0/billing/plans/active called');

    // Extract auth token from headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('🔑 API Route: Auth token extracted');

    // Call server service
    console.log('📞 API Route: Calling FastAPI backend for active plans...');
    const response = await fetchActivePlansFromServer(token);

    console.log('✅ API Route: Successfully fetched active plans:', {
      count: response.data?.length || 0
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans/active:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch active plans';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}