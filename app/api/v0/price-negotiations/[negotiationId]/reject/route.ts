// src/app/api/v0/price-negotiations/[negotiationId]/reject/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';
import { PriceNegotiationServerService } from '@/services/price-negotiation/price-negotiation.server';

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
    
    const rejectedNegotiation = await PriceNegotiationServerService.rejectNegotiation(
      negotiationId, 
      authToken
    );
    
    return NextResponse.json(rejectedNegotiation, { status: 200 });
    
  } catch (error) {
    console.error('Error rejecting negotiation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}