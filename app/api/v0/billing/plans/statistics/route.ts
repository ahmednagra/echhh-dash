// src/app/api/v0/billing/plans/statistics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchPlanStatisticsFromServer } from '@/services/billing/plans';

/**
 * GET /api/v0/billing/plans/statistics
 * Fetch comprehensive plan statistics and analytics
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 API Route: GET /api/v0/billing/plans/statistics called');

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

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend for statistics...');
    const response = await fetchPlanStatisticsFromServer(token);

    console.log('✅ API Route: Successfully retrieved plan statistics:', {
      total_plans: response.data?.total_plans,
      active_plans: response.data?.active_plans
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans/statistics:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch plan statistics';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}