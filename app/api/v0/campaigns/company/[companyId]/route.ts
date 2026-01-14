// src/app/api/v0/campaigns/company/[companyId]/route.ts - FIXED

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyCampaignsServer } from '@/services/campaign/campaign.server';
import { extractBearerToken } from '@/lib/auth-utils';
import { 
  GetCampaignsRequest,
  CampaignFilters 
} from '@/types/campaign';

/**
 * GET /api/v0/campaigns/company/[companyId]
 * Get all campaigns for a specific company
 * FIXED: Added async/await for params as required by Next.js 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    // FIXED: Await params before using its properties
    const { companyId } = await params;
    
    // Basic UUID validation for company ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (!uuidRegex.test(companyId)) {
      console.warn(`⚠️ API Route: Invalid UUID format for company ID: ${companyId}`);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid company ID format' 
        },
        { status: 400 }
      );
    }
    
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

    // Call FastAPI backend through server-side service with auth token
    const campaigns = await getCompanyCampaignsServer(companyId, filters, authToken);
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 50,
        total: campaigns.length
      }
    });
  } catch (error) {
    console.error('💥 API Route Error:', error);
    
    if (error instanceof Error) {
      // Handle not found errors
      if (error.message.includes('404') || error.message.includes('not found')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Company not found or no campaigns available' 
          },
          { status: 404 }
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
        error: 'Failed to fetch company campaigns' 
      },
      { status: 500 }
    );
  }
}