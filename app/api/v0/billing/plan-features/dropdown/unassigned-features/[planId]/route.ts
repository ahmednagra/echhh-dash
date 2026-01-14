// src/app/api/v0/billing/plan-features/dropdown/unassigned-features/[planId]/route.ts

/**
 * Plan Features API Routes - Get Unassigned Features for Plan Dropdown
 * 
 * Handles:
 * - GET: Get all features NOT assigned to a specific plan (for dropdown selection)
 * 
 * Pattern: API Route → Server Service → FastAPI Backend
 * FastAPI Endpoint: /billing/plan-features/dropdown/unassigned-features/{plan_id}
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { fetchUnassignedFeaturesServer } from '@/services/billing/plan-features/plan-features.server';

interface RouteParams {
  params: Promise<{ planId: string }>;
}

/**
 * GET /api/v0/billing/plan-features/dropdown/unassigned-features/[planId]
 * Get all unassigned features for a specific plan (dropdown data)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { planId } = await params;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    const result = await fetchUnassignedFeaturesServer(authToken, planId, category, search);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    if (errorMessage.includes('not found')) {
      return NextResponse.json({ error: errorMessage }, { status: 404 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}