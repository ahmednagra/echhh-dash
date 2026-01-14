// src/app/api/v0/public/price-negotiations/[negotiationId]/accept/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PublicPriceNegotiationServerService } from '@/services/public-price-negotiation/public-price-negotiation.server';
import { AcceptPublicNegotiationRequest } from '@/types/public-price-negotiation';

interface RouteParams {
  params: {
    negotiationId: string;
  };
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { negotiationId } = params;
    console.log(`📞 API Route: POST /public/price-negotiations/${negotiationId}/accept`);
    
    const requestData: AcceptPublicNegotiationRequest = await request.json();
    
    // Validation
    if (!requestData.token) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Token is required' 
        },
        { status: 400 }
      );
    }
    
    if (!negotiationId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Negotiation ID is required' 
        },
        { status: 400 }
      );
    }
    
    const result = await PublicPriceNegotiationServerService.acceptPublicNegotiation(
      negotiationId, 
      requestData
    );
    
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
        error: 'Failed to accept public negotiation' 
      },
      { status: 500 }
    );
  }
}