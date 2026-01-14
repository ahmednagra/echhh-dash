// src/app/api/v0/billing/plans/[id]/features/unassigned/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchUnassignedFeaturesServer } from '@/services/billing/plan-features/plan-features.server';

/**
 * GET /api/v0/billing/plans/[id]/features/unassigned
 * Fetch features that are NOT assigned to a specific plan
 * Used for adding new features to a plan
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: planId } = await context.params;
    console.log(`📋 API Route: GET /api/v0/billing/plans/${planId}/features/unassigned called`);

    if (!planId) {
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
    console.log('📞 API Route: Calling FastAPI backend for unassigned features...');
    const response = await fetchUnassignedFeaturesServer(token, planId);

    console.log('✅ API Route: Successfully fetched unassigned features');

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans/[id]/features/unassigned:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch unassigned features';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}