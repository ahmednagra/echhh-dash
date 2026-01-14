// src/app/api/v0/public/price-negotiations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PublicPriceNegotiationServerService } from '@/services/public-price-negotiation/public-price-negotiation.server';
import { GetPublicPriceNegotiationsParams } from '@/types/public-price-negotiation';

export async function GET(request: NextRequest) {
  try {
    console.log('📞 API Route: GET /public/price-negotiations');
    
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const campaign_influencer_id = searchParams.get('campaign_influencer_id');
    const token = searchParams.get('token');
    const proposed_by_type = searchParams.get('proposed_by_type') as 'client' | 'influencer' | null;
    const is_current_active = searchParams.get('is_current_active');
    const page = searchParams.get('page');
    const size = searchParams.get('size');
    
    // Validation
    if (!campaign_influencer_id) {
      return NextResponse.json(
        { 
          success: false,
          error: 'campaign_influencer_id is required' 
        },
        { status: 400 }
      );
    }
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token is required' 
        },
        { status: 400 }
      );
    }
    
    const params: GetPublicPriceNegotiationsParams = {
      campaign_influencer_id,
      token,
      ...(proposed_by_type && { proposed_by_type }),
      ...(is_current_active !== null && { is_current_active: is_current_active === 'true' }),
      ...(page && { page: parseInt(page) }),
      ...(size && { size: parseInt(size) }),
    };
    
    const result = await PublicPriceNegotiationServerService.getPublicPriceNegotiations(params);
    
    return NextResponse.json(result, { status: 200 });
    
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
      if (error.message.includes('Invalid or expired session token')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Session token expired. Please refresh the page.' 
          },
          { status: 401 }
        );
      }
      
      // Handle unauthorized errors
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
        error: 'Failed to fetch public price negotiations' 
      },
      { status: 500 }
    );
  }
}