// src/app/api/v0/billing/plan-features/[planFeatureId]/route.ts

/**
 * 🔌 Plan Features API Routes - Individual Operations
 * 
 * Handles:
 * - GET: Get single plan feature by ID
 * - PUT: Update plan feature relationship
 * - DELETE: Delete plan feature relationship
 * 
 * Pattern: API Route → Server Service → FastAPI Backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import {
  getPlanFeatureByIdServer,
  updatePlanFeatureServer,
  deletePlanFeatureServer
} from '@/services/billing/plan-features/plan-features.server';
import type { UpdatePlanFeatureRequest } from '@/types/billing/plan-features';

interface RouteParams {
  params: {
    planFeatureId: string;
  };
}

/**
 * GET /api/v0/billing/plan-features/[planFeatureId]
 * Get single plan feature by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { planFeatureId } = params;
    console.log(`🔵 API Route: GET /api/v0/billing/plan-features/${planFeatureId} - Starting request`);

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: Authentication token is missing');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planFeatureId)) {
      console.error('❌ API Route: Invalid UUID format');
      return NextResponse.json(
        { error: 'Invalid plan feature ID format' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await getPlanFeatureByIdServer(authToken, planFeatureId);

    console.log('✅ API Route: Successfully fetched plan feature');
    console.log('📊 API Route: Plan feature details:', {
      id: result.data?.id,
      plan_id: result.data?.plan?.id,
      feature_id: result.data?.feature?.id
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plan-features/[planFeatureId]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 API Route: Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    // Handle specific error cases
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
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

/**
 * PUT /api/v0/billing/plan-features/[planFeatureId]
 * Update plan feature relationship
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { planFeatureId } = params;
    console.log(`🟡 API Route: PUT /api/v0/billing/plan-features/${planFeatureId} - Starting request`);

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: Authentication token is missing');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planFeatureId)) {
      console.error('❌ API Route: Invalid UUID format');
      return NextResponse.json(
        { error: 'Invalid plan feature ID format' },
        { status: 400 }
      );
    }

    // Parse request body
    const requestData: UpdatePlanFeatureRequest = await request.json();
    console.log('📋 API Route: Update request data:', {
      limit_value: requestData.limit_value,
      hasMetadata: !!requestData.plan_feature_metadata
    });

    // Validation
    if (requestData.limit_value !== null && 
        requestData.limit_value !== undefined && 
        (typeof requestData.limit_value !== 'number' || requestData.limit_value < -1)) {
      console.error('❌ API Route: Validation failed - invalid limit_value');
      return NextResponse.json(
        { error: 'limit_value must be -1 (unlimited), null (disabled), or 0+ (specific limit)' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await updatePlanFeatureServer(authToken, planFeatureId, requestData);

    console.log('✅ API Route: Successfully updated plan feature');
    console.log('📊 API Route: Updated plan feature ID:', result.data?.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('💥 API Route: Error in PUT /api/v0/billing/plan-features/[planFeatureId]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 API Route: Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    // Handle specific error cases
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
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

/**
 * DELETE /api/v0/billing/plan-features/[planFeatureId]
 * Delete plan feature relationship
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { planFeatureId } = params;
    console.log(`🔴 API Route: DELETE /api/v0/billing/plan-features/${planFeatureId} - Starting request`);

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: Authentication token is missing');
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(planFeatureId)) {
      console.error('❌ API Route: Invalid UUID format');
      return NextResponse.json(
        { error: 'Invalid plan feature ID format' },
        { status: 400 }
      );
    }

    // Call server service
    const result = await deletePlanFeatureServer(planFeatureId, authToken);

    console.log('✅ API Route: Successfully deleted plan feature');
    console.log('📊 API Route: Deletion result:', {
      success: result.success,
      message: result.message
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('💥 API Route: Error in DELETE /api/v0/billing/plan-features/[planFeatureId]:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('💥 API Route: Error details:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error
    });

    // Handle specific error cases
    if (errorMessage.includes('not found') || errorMessage.includes('does not exist')) {
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