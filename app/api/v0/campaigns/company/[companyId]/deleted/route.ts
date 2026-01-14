// src/app/api/v0/campaigns/company/[companyId]/deleted/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCompanyDeletedCampaignsServer } from '@/services/campaign/campaign.server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteParams {
  params: {
    companyId: string;
  };
}

/**
 * GET /api/v0/campaigns/company/[companyId]/deleted
 * Get deleted campaigns for a specific company
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    
    // Extract Bearer token from request headers
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      console.error('❌ API Route: No authorization header provided');
      return NextResponse.json(
        { 
          success: false, 
          error: 'Bearer token is required' 
        },
        { status: 401 }
      );
    }
    
    // Validate company ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(params.companyId)) {
      console.error(`❌ API Route: Invalid company ID format: ${params.companyId}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid company ID format' 
        },
        { status: 400 }
      );
    }
    
    // Parse query parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const sortBy = searchParams.get('sort_by') || undefined;
    const sortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || undefined;
    const search = searchParams.get('search') || undefined;
    const statusId = searchParams.get('status_id') || undefined;
    const categoryId = searchParams.get('category_id') || undefined;
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;
    
    console.log('📋 API Route: Query parameters:', {
      page,
      limit,
      sortBy,
      sortOrder,
      search,
      statusId,
      categoryId,
      dateFrom,
      dateTo
    });
    
    // Prepare filters for deleted campaigns
    const filters = {
      page,
      limit,
      sort_by: sortBy,
      sort_order: sortOrder,
      filters: {
        company_id: params.companyId,
        search,
        status_id: statusId,
        category_id: categoryId,
        date_from: dateFrom,
        date_to: dateTo,
      }
    };
    
    // Get deleted campaigns from server
    const deletedCampaigns = await getCompanyDeletedCampaignsServer(
      params.companyId,
      filters,
      authToken
    );
    
    console.log(`✅ API Route: Successfully fetched ${deletedCampaigns.length} deleted campaigns for company ${params.companyId}`);
    
    return NextResponse.json({
      success: true,
      data: deletedCampaigns,
      message: 'Deleted campaigns fetched successfully',
      pagination: {
        page: page || 1,
        limit: limit || 10,
        total: deletedCampaigns.length,
        total_pages: Math.ceil(deletedCampaigns.length / (limit || 10))
      }
    });
    
  } catch (error) {
    console.error('💥 API Route: Error fetching deleted campaigns:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch deleted campaigns';
    const statusCode = errorMessage.includes('not found') ? 404 : 500;
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}