// src/app/api/v0/billing/subscriptions/route.ts

/**
 * Subscriptions API Route
 * Handles subscription list and creation requests
 * Path matches FastAPI backend: /api/v0/billing/subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  getSubscriptionsServer,
  createPlanBasedSubscriptionServer 
} from '@/services/billing/subscription/subscription.server';
import type { 
  SubscriptionFilters,
  CreatePlanBasedSubscriptionRequest
} from '@/types/billing/subscription';

/**
 * GET /api/v0/billing/subscriptions
 * Fetch subscriptions list with filters and pagination
 */
export async function GET(request: NextRequest) {
  try {
    console.log('API Route: GET /api/v0/billing/subscriptions called');
    
    // Extract authentication token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.warn('API Route: No authentication token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Authentication token is required' 
        },
        { status: 401 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const filters: SubscriptionFilters = {
      // Pagination
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      page_size: searchParams.get('page_size') ? parseInt(searchParams.get('page_size')!) : 25,
      
      // ✅ FIXED: Status filter - Backend expects 'status' (name string)
      status: searchParams.get('status_id') || undefined,
      
      // Plan filters
      plan_id: searchParams.get('plan_id') || undefined,
      
      // Company filters
      company_id: searchParams.get('company_id') || undefined,
      
      // User filters
      created_by: searchParams.get('created_by') || undefined,
      
      // Date filters
      created_after: searchParams.get('created_after') || undefined,
      created_before: searchParams.get('created_before') || undefined,
      
      // ✅ FIXED: Trial filters - Backend expects these exact names
      has_trial_period: searchParams.get('has_trial_period') === 'true' ? true : 
                        searchParams.get('has_trial_period') === 'false' ? false : undefined,
      trial_currently_active: searchParams.get('trial_currently_active') === 'true' ? true : 
                              searchParams.get('trial_currently_active') === 'false' ? false : undefined,
      
      // ✅ FIXED: Cancellation filters - Backend expects these exact names
      will_not_auto_renew: searchParams.get('will_not_auto_renew') === 'true' ? true :
                           searchParams.get('will_not_auto_renew') === 'false' ? false : undefined,
      is_cancelled: searchParams.get('is_cancelled') === 'true' ? true :
                    searchParams.get('is_cancelled') === 'false' ? false : undefined,
      
      // Other filters
      is_deleted: searchParams.get('is_deleted') === 'true' ? true :
                  searchParams.get('is_deleted') === 'false' ? false : false,
      search: searchParams.get('search') || undefined,
      
      // Sorting
      sort_by: (searchParams.get('sort_by') as any) || 'created_at',
      sort_order: (searchParams.get('sort_order') as any) || 'desc',
    };

    console.log('API Route: Parsed filters:', filters);

    // Call server service to fetch from FastAPI
    const result = await getSubscriptionsServer(filters, authToken);

    console.log('API Route: Successfully fetched subscriptions:', {
      total: result.total,
      page: result.page
    });

    // Return the FastAPI response as-is
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Route: Error in GET /api/v0/billing/subscriptions:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { 
        success: false,
        error: errorMessage,
        message: 'Failed to fetch subscriptions'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/billing/subscriptions
 * Create a new plan-based subscription
 * ✅ NEW HANDLER
 */
export async function POST(request: NextRequest) {
  try {
    console.log('API Route: POST /api/v0/billing/subscriptions called');

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
    let requestData: CreatePlanBasedSubscriptionRequest;
    try {
      requestData = await request.json();
      console.log('API Route: Parsed subscription data:', {
        company_id: requestData.company_id,
        plan_id: requestData.plan_id,
        period: `${requestData.current_period_start} to ${requestData.current_period_end}`,
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

    // Validate required fields
    if (!requestData.company_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company ID is required'
        },
        { status: 400 }
      );
    }

    if (!requestData.plan_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Plan ID is required'
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

    // Validate dates
    const periodStart = new Date(requestData.current_period_start);
    const periodEnd = new Date(requestData.current_period_end);

    if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss)'
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

    // Call server service to create subscription in FastAPI
    const result = await createPlanBasedSubscriptionServer(requestData, authToken);

    console.log('API Route: Successfully created subscription');

    // Return the FastAPI response
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('API Route: Error in POST /api/v0/billing/subscriptions:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        message: 'Failed to create subscription'
      },
      { status: 500 }
    );
  }
}