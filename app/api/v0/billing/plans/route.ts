// src/app/api/v0/billing/plans/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchPlansFromServer, createPlanOnServer } from '@/services/billing/plans';

// Type definitions for strict typing
type BillingInterval = 'month' | 'quarter' | 'year' | 'lifetime';
type Visibility = 'public' | 'private' | 'archived';
type SortBy = 'display_order' | 'name' | 'code' | 'amount' | 'created_at';
type SortOrder = 'asc' | 'desc';

/**
 * GET /api/v0/billing/plans
 * Fetch all plans with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 API Route: GET /api/v0/billing/plans called');

    // Extract auth token from headers FIRST
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      page: parseInt(searchParams.get('page') || '1'),
      page_size: parseInt(searchParams.get('page_size') || '100'),
      billing_interval: (searchParams.get('billing_interval') as BillingInterval) || undefined,
      visibility: (searchParams.get('visibility') as Visibility) || undefined,
      is_active: searchParams.get('is_active') ? searchParams.get('is_active') === 'true' : undefined,
      is_featured: searchParams.get('is_featured') ? searchParams.get('is_featured') === 'true' : undefined,
      min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
      currency: searchParams.get('currency') || undefined,
      is_deleted: searchParams.get('is_deleted') === 'true',
      search: searchParams.get('search') || undefined,
      sort_by: (searchParams.get('sort_by') as SortBy) || 'display_order',
      sort_order: (searchParams.get('sort_order') as SortOrder) || 'asc',
    };

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend...');
    const response = await fetchPlansFromServer(token, filters);

    console.log('✅ API Route: Successfully fetched plans:', {
      total: response.data?.length || 0,
      page: filters.page
    });

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('💥 API Route: Error in GET /api/v0/billing/plans:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to fetch plans';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}

/**
 * POST /api/v0/billing/plans
 * Create a new plan
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📝 API Route: POST /api/v0/billing/plans called');

    // Extract auth token
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ API Route: Missing authorization header');
      return NextResponse.json(
        { success: false, error: 'Authorization header missing' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Parse request body
    const body = await request.json();
    console.log('📋 API Route: Request body received');

    // Validate required fields
    const requiredFields = ['name', 'code', 'billing_interval', 'billing_interval_count', 'amount'];
    const missingFields = requiredFields.filter(field => !body[field] && body[field] !== 0);
    
    if (missingFields.length > 0) {
      console.error('❌ API Route: Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Call FastAPI backend through server service
    console.log('📞 API Route: Calling FastAPI backend to create plan...');
    const response = await createPlanOnServer(token, body);

    console.log('✅ API Route: Successfully created plan:', response.data?.name);

    return NextResponse.json(response, { status: 201 });

  } catch (error: any) {
    console.error('💥 API Route: Error in POST /api/v0/billing/plans:', error);
    
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'Failed to create plan';

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: statusCode }
    );
  }
}