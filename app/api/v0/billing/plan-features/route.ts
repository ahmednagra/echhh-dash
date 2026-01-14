// src/app/api/v0/billing/plan-features/route.ts

/**
 * 🔌 Plan Features API Routes - Base CRUD Operations
 * 
 * Handles:
 * - GET: List all plan features with filtering and pagination
 * - POST: Create new plan feature relationship
 * 
 * Pattern: API Route → Server Service → FastAPI Backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { listPlanFeaturesServer, assignFeatureToPlanServer } from '@/services/billing/plan-features/plan-features.server';
import type { CreatePlanFeatureRequest, PlanFeatureFilter } from '@/types/billing/plan-features';

/**
 * GET /api/v0/billing/plan-features
 * List all plan features with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔵 API Route: GET /api/v0/billing/plan-features - Starting request');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: Authentication token is missing');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: PlanFeatureFilter & { page?: number; page_size?: number } = {
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '25'),
    };

    // Optional filters
    if (searchParams.get('plan_id')) {
      filters.plan_id = searchParams.get('plan_id')!;
    }
    if (searchParams.get('feature_id')) {
      filters.feature_id = searchParams.get('feature_id')!;
    }
    if (searchParams.get('plan_code')) {
      filters.plan_code = searchParams.get('plan_code')!;
    }
    if (searchParams.get('feature_code')) {
      filters.feature_code = searchParams.get('feature_code')!;
    }
    if (searchParams.get('feature_category')) {
      filters.feature_category = searchParams.get('feature_category')!;
    }
    if (searchParams.get('limit_type')) {
      filters.limit_type = searchParams.get('limit_type') as 'unlimited' | 'disabled' | 'limited';
    }
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search')!;
    }

    console.log('📋 API Route: Request filters:', filters);

    // Call server service
    const result = await listPlanFeaturesServer(authToken, filters);

    console.log('✅ API Route: Successfully fetched plan features list');
    console.log('📊 API Route: Response data:', {
      success: result.success,
      totalItems: result.pagination?.total_items,
      itemsReturned: result.data?.length
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plan-features:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 API Route: Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/billing/plan-features
 * Create new plan feature relationship
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🟢 API Route: POST /api/v0/billing/plan-features - Starting request');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: Authentication token is missing');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: CreatePlanFeatureRequest = await request.json();
    console.log('📋 API Route: Request data:', {
      plan_id: requestData.plan_id,
      feature_id: requestData.feature_id,
      limit_value: requestData.limit_value
    });

    // Validation
    if (!requestData.plan_id || !requestData.feature_id) {
      console.error('❌ API Route: Validation failed - plan_id and feature_id are required');
      return NextResponse.json(
        { error: 'plan_id and feature_id are required' },
        { status: 400 }
      );
    }

    if (requestData.limit_value !== null && requestData.limit_value !== undefined) {
      if (typeof requestData.limit_value !== 'number') {
        console.error('❌ API Route: Validation failed - limit_value must be a number or null');
        return NextResponse.json(
          { error: 'limit_value must be a number or null' },
          { status: 400 }
        );
      }

      if (requestData.limit_value < -1) {
        console.error('❌ API Route: Validation failed - limit_value must be -1 or greater');
        return NextResponse.json(
          { error: 'limit_value must be -1 (unlimited), null (disabled), or 0+ (specific limit)' },
          { status: 400 }
        );
      }
    }

    // Call server service
    const result = await assignFeatureToPlanServer(authToken, requestData);

    console.log('✅ API Route: Successfully created plan feature');
    console.log('📊 API Route: Created plan feature ID:', result.data?.id);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/billing/plan-features:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 API Route: Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    // Handle specific error cases
    if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 409 }
      );
    }

    if (errorMessage.includes('not found')) {
      return NextResponse.json(
        { error: errorMessage },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}