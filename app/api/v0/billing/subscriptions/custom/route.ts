// src/app/api/v0/billing/subscriptions/custom/route.ts

/**
 * Custom Subscriptions API Route
 * Handles custom subscription creation requests
 * Path: /api/v0/billing/subscriptions/custom
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { createCustomSubscriptionServer } from '@/services/billing/subscription/subscription.server';
import type { CreateCustomSubscriptionRequest } from '@/types/billing/subscription';

/**
 * POST /api/v0/billing/subscriptions/custom
 * Create a new custom subscription with specific items
 * ✅ NEW ENDPOINT
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: POST /api/v0/billing/subscriptions/custom called');

    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('API Route: No authentication token provided');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    console.log('API Route: Auth token found, parsing request body');

    // Parse request body
    let requestData: CreateCustomSubscriptionRequest;
    try {
      requestData = await request.json();
      console.log('API Route: Parsed custom subscription data:', {
        company_id: requestData.company_id,
        period: `${requestData.current_period_start} to ${requestData.current_period_end}`,
        items_count: requestData.subscription_items.length,
      });
    } catch (error) {
      console.error('API Route: Failed to parse request body:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body'
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // VALIDATION - Required Fields
    // ============================================================================

    if (!requestData.company_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required'
        },
        { status: 400 }
      );
    }

    if (!requestData.current_period_start) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current period start is required'
        },
        { status: 400 }
      );
    }

    if (!requestData.current_period_end) {
      return NextResponse.json(
        {
          success: false,
          error: 'Current period end is required'
        },
        { status: 400 }
      );
    }

    // ============================================================================
    // VALIDATION - Subscription Items
    // ============================================================================

    if (!requestData.subscription_items || !Array.isArray(requestData.subscription_items)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Subscription items array is required'
        },
        { status: 400 }
      );
    }

    if (requestData.subscription_items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least one subscription item is required'
        },
        { status: 400 }
      );
    }

    // Validate each subscription item
    for (let i = 0; i < requestData.subscription_items.length; i++) {
      const item = requestData.subscription_items[i];

      if (!item.feature_id) {
        return NextResponse.json(
          {
            success: false,
            error: `Subscription item ${i + 1}: feature_id is required`
          },
          { status: 400 }
        );
      }

      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: `Subscription item ${i + 1}: quantity must be a positive number`
          },
          { status: 400 }
        );
      }
    }

    // ============================================================================
    // VALIDATION - Date Formats and Logic
    // ============================================================================

    const periodStart = new Date(requestData.current_period_start);
    const periodEnd = new Date(requestData.current_period_end);

    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ssZ)'
        },
        { status: 400 }
      );
    }

    if (periodStart >= periodEnd) {
      return NextResponse.json(
        {
          success: false,
          error: 'Period end must be after period start'
        },
        { status: 400 }
      );
    }

    // Validate trial dates if provided
    if (requestData.trial_start && requestData.trial_end) {
      const trialStart = new Date(requestData.trial_start);
      const trialEnd = new Date(requestData.trial_end);

      if (isNaN(trialStart.getTime()) || isNaN(trialEnd.getTime())) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid trial date format'
          },
          { status: 400 }
        );
      }

      if (trialStart >= trialEnd) {
        return NextResponse.json(
          {
            success: false,
            error: 'Trial end must be after trial start'
          },
          { status: 400 }
        );
      }
    }

    console.log('API Route: Validation passed, calling server service');

    // ============================================================================
    // CALL SERVER SERVICE
    // ============================================================================

    const result = await createCustomSubscriptionServer(requestData, authToken);

    console.log('API Route: Successfully created custom subscription');

    // Return the FastAPI response
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('API Route: Error in POST /api/v0/billing/subscriptions/custom:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Failed to create custom subscription'
      },
      { status: 500 }
    );
  }
}