// src/app/api/v0/billing/plan-features/bulk/route.ts

/**
 * 🔌 Plan Features API Routes - Bulk Create
 * 
 * Handles:
 * - POST: Bulk create plan feature relationships
 * 
 * Pattern: API Route → Server Service → FastAPI Backend
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { bulkCreatePlanFeaturesServer } from '@/services/billing/plan-features/plan-features.server';
import type { PlanFeatureBulkCreateRequest } from '@/types/billing/plan-features';

/**
 * POST /api/v0/billing/plan-features/bulk
 * Bulk create plan feature relationships
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🟢 API Route: POST /api/v0/billing/plan-features/bulk - Starting request');

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
    const requestData: PlanFeatureBulkCreateRequest = await request.json();
    console.log('📋 API Route: Bulk create request:', {
      relationshipsCount: requestData.relationships?.length
    });

    // Validation
    if (!requestData.relationships || !Array.isArray(requestData.relationships)) {
      console.error('❌ API Route: Validation failed - relationships array is required');
      return NextResponse.json(
        { error: 'relationships array is required' },
        { status: 400 }
      );
    }

    if (requestData.relationships.length === 0) {
      console.error('❌ API Route: Validation failed - relationships array cannot be empty');
      return NextResponse.json(
        { error: 'relationships array cannot be empty' },
        { status: 400 }
      );
    }

    if (requestData.relationships.length > 100) {
      console.error('❌ API Route: Validation failed - maximum 100 relationships allowed');
      return NextResponse.json(
        { error: 'Maximum 100 relationships allowed per request' },
        { status: 400 }
      );
    }

    // Validate each relationship
    for (let i = 0; i < requestData.relationships.length; i++) {
      const rel = requestData.relationships[i];
      if (!rel.plan_id || !rel.feature_id) {
        console.error(`❌ API Route: Validation failed - relationship ${i} missing plan_id or feature_id`);
        return NextResponse.json(
          { error: `Relationship at index ${i} is missing plan_id or feature_id` },
          { status: 400 }
        );
      }

      if (rel.limit_value !== null && rel.limit_value !== undefined) {
        if (typeof rel.limit_value !== 'number' || rel.limit_value < -1) {
          console.error(`❌ API Route: Validation failed - relationship ${i} has invalid limit_value`);
          return NextResponse.json(
            { error: `Relationship at index ${i} has invalid limit_value (must be -1, null, or 0+)` },
            { status: 400 }
          );
        }
      }
    }

    // Call server service
    const result = await bulkCreatePlanFeaturesServer(authToken, requestData);

    console.log('✅ API Route: Successfully bulk created plan features');
    console.log('📊 API Route: Bulk create statistics:', {
      totalRequested: result.statistics?.total_requested,
      successful: result.statistics?.successful,
      skipped: result.statistics?.skipped
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('💥 API Route: Error in POST /api/v0/billing/plan-features/bulk:', error);

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