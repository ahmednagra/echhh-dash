// src/app/api/v0/campaign-influencers/[id]/price-approval/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { approvePriceServer } from '@/services/campaign-influencers/campaign-influencers.server';
import { PriceApprovalRequest } from '@/types/campaign-influencers';

/**
 * PATCH /api/v0/campaign-influencers/[id]/price-approval
 * Approve or reject price for campaign influencer
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    console.log('📍 API Route: PATCH /api/v0/campaign-influencers/[id]/price-approval');
    console.log('🆔 Influencer ID:', params.id);
    
    // Extract Bearer token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      console.error('❌ API Route: No auth token provided');
      return NextResponse.json(
        { success: false, error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const data: PriceApprovalRequest = await request.json();
    console.log('📋 API Route: Request data:', data);
    
    // Validation
    if (!data.action) {
      return NextResponse.json(
        { success: false, error: 'Action (approve/reject) is required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(data.action)) {
      return NextResponse.json(
        { success: false, error: 'Action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    console.log('📞 API Route: Calling server service...');
    
    // Call server service
    const result = await approvePriceServer(params.id, data, authToken);
    
    console.log('✅ API Route: Success:', result);
    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('💥 API Route: Error in price approval:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to process price approval';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}