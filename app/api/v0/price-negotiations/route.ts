// src/app/api/v0/price-negotiations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { PriceNegotiationServerService } from '@/services/price-negotiation/price-negotiation.server';
import { GetPriceNegotiationsParams } from '@/types/price-negotiation';

export async function GET(request: NextRequest) {
  try {
    // Extract token from standard Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const campaign_influencer_id = searchParams.get('campaign_influencer_id');
    const proposed_by_type = searchParams.get('proposed_by_type') as 'client' | 'influencer' | null;
    const is_current_active = searchParams.get('is_current_active');
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    
    // Validate required parameters
    if (!campaign_influencer_id) {
      return NextResponse.json(
        { error: 'campaign_influencer_id is required' },
        { status: 400 }
      );
    }
    
    const params: GetPriceNegotiationsParams = {
      campaign_influencer_id,
      ...(proposed_by_type && { proposed_by_type }),
      ...(is_current_active !== null && { is_current_active: is_current_active === 'true' }),
      ...(page && { page: parseInt(page) }),
      ...(size && { size: parseInt(size) }),
    };
    
    const negotiations = await PriceNegotiationServerService.getPriceNegotiations(params, authToken);
    
    return NextResponse.json(negotiations, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching price negotiations:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}