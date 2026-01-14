// src/app/api/v0/campaigns/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { 
  createCampaignServer, 
  // getCampaignsServer 
} from '@/services/campaign/campaign.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  CreateCampaignRequest, 
  GetCampaignsRequest,
  CampaignFilters 
} from '@/types/campaign';

/**
 * GET /api/v0/campaigns
 * Get all campaigns with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }
    
    // Extract query parameters for filters
    const { searchParams } = new URL(request.url);
    
    const filters: GetCampaignsRequest = {
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      sort_by: searchParams.get('sort_by') || undefined,
      sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') || undefined,
      filters: {} as CampaignFilters
    };
    
    // Extract filter parameters
    if (searchParams.get('status_id')) {
      filters.filters!.status_id = searchParams.get('status_id')!;
    }
    if (searchParams.get('category_id')) {
      filters.filters!.category_id = searchParams.get('category_id')!;
    }
    if (searchParams.get('company_id')) {
      filters.filters!.company_id = searchParams.get('company_id')!;
    }
    if (searchParams.get('include_deleted')) {
      filters.filters!.include_deleted = searchParams.get('include_deleted') === 'true';
    }
    if (searchParams.get('search')) {
      filters.filters!.search = searchParams.get('search')!;
    }
    if (searchParams.get('date_from')) {
      filters.filters!.date_from = searchParams.get('date_from')!;
    }
    if (searchParams.get('date_to')) {
      filters.filters!.date_to = searchParams.get('date_to')!;
    }

    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    // const campaigns = await getCampaignsServer(filters, authToken);
    
    // console.log(`✅ API Route: Successfully fetchedddd: ${campaigns}`);
    // return NextResponse.json({
    //   success: true,
    //   data: campaigns,
    //   pagination: {
    //     page: filters.page || 1,
    //     limit: filters.limit || 50,
    //     total: campaigns.length
    //   }
    // });
  } catch (error) {
    console.error('💥 API Route Errorrrr:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch campaigns' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v0/campaigns
 * Create a new campaign
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📍 API Route: POST /api/v0/campaigns called');
    
    // Parse request body
    const data: CreateCampaignRequest = await request.json();
    console.log('📋 API Route: Request data:', data);
    
    // Basic validation
    if (!data || !data.name || !data.brand_name || !data.company_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'name, brand_name, and company_id are required' 
        },
        { status: 400 }
      );
    }
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.log('❌ API Route: No Bearer token provided');
      return NextResponse.json(
        { 
          success: false,
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }

    console.log('📞 API Route: Calling FastAPI backend...');
    // Call FastAPI backend through server-side service with auth token
    const campaign = await createCampaignServer(data, authToken);
    
    console.log('✅ API Route: Successfully created campaign');
    return NextResponse.json({
      success: true,
      data: campaign,
      message: 'Campaign created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('validation') || error.message.includes('required')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 400 }
        );
      }
      
      // Handle authentication errors
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message 
          },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false,
          error: error.message 
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create campaign' 
      },
      { status: 500 }
    );
  }
}