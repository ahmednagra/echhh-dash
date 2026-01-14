// src/app/api/v0/billing/plans/code/[planCode]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchPlanByCodeServer } from '@/services/billing/plans';

/**
 * GET /api/v0/billing/plans/code/[planCode]
 * Get a specific plan by its unique code
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ planCode: string }> }
) {
  try {
    const { planCode } = await context.params;
    console.log(`📋 API Route: GET /api/v0/billing/plans/code/${planCode} called`);

    // Extract auth token
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authentication token provided');
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend...');
    const result = await fetchPlanByCodeServer(planCode, authToken);
    
    console.log(`✅ API Route: Successfully fetched plan with code: ${planCode}`);
    
    return NextResponse.json(result, { status: 200 });

  } catch (error: any) {
    console.error(`💥 API Route: Error in GET /api/v0/billing/plans/code/[planCode]:`, error);
    
    const statusCode = error.status || 500;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}