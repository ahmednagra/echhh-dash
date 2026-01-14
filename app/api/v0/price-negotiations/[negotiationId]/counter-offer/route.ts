// src/app/api/v0/price-negotiations/[negotiationId]/counter-offer/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { PriceNegotiationServerService } from '@/services/price-negotiation/price-negotiation.server';
import { CreateCounterOfferRequest } from '@/types/price-negotiation';

export async function POST(
  request: NextRequest,
  { params }: { params: { negotiationId: string } }
) {
  try {
    // Extract token from standard Authorization header
    const authToken = extractBearerToken(request);
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }
    
    const negotiationId = params.negotiationId;
    
    if (!negotiationId) {
      return NextResponse.json(
        { error: 'Negotiation ID is required' },
        { status: 400 }
      );
    }
    
    const requestData: CreateCounterOfferRequest = await request.json();
    
    // Validate required fields
    if (!requestData.counter_price || typeof requestData.counter_price !== 'number') {
      return NextResponse.json(
        { error: 'Counter price is required and must be a number' },
        { status: 400 }
      );
    }
    
    if (!requestData.currency || typeof requestData.currency !== 'string') {
      return NextResponse.json(
        { error: 'Currency is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (requestData.counter_price <= 0) {
      return NextResponse.json(
        { error: 'Counter price must be greater than 0' },
        { status: 400 }
      );
    }
    
    const counterOffer = await PriceNegotiationServerService.createCounterOffer(
      negotiationId, 
      requestData, 
      authToken
    );
    
    return NextResponse.json(counterOffer, { status: 200 });
    
  } catch (error) {
    console.error('Error creating counter offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}