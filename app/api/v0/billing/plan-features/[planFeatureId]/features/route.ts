// src/app/api/v0/billing/plan-features/[planFeatureId]/features/route.ts

/**
 * Plan Features API Routes - Get Features for Plan
 * 
 * Handles:
 * - GET: Get all features assigned to a specific plan
 * 
 * Pattern: API Route → Server Service → FastAPI Backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchFeaturesForPlanServer } from '@/services/billing/plan-features/plan-features.server';

interface RouteParams {
  params: Promise<{ planFeatureId: string }>;
}

/**
 * GET /api/v0/billing/plan-features/[planId]/features
 * Get all features for a specific plan
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { planFeatureId: planId } = await params;
    
    const { searchParams } = new URL(request.url);
    const includeDisabled = searchParams.get('include_disabled') === 'true';

    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const result = await fetchFeaturesForPlanServer(planId, authToken, includeDisabled);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}