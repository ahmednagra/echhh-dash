// src/app/api/v0/billing/plans/[id]/features/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchFeaturesForPlanServer } from '@/services/billing/plan-features/plan-features.server';

/**
 * GET /api/v0/billing/plans/[id]/features
 * Fetch all features assigned to a specific plan
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    console.log(`📋 API Route: GET /api/v0/billing/plans/${id}/features called`);

    if (!id) {
      console.error('❌ API Route: Plan ID is missing in route');
      return NextResponse.json(
        { success: false, error: 'Plan ID is missing in route' },
        { status: 400 }
      );
    }

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

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend for plan features...');
    const response = await fetchFeaturesForPlanServer(token, id);

    console.log('✅ API Route: Successfully fetched plan features');

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans/[id]/features:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch plan features';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}