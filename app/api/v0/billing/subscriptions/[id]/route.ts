// src/app/api/v0/billing/subscriptions/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptionByIdServer } from '@/services/billing/subscription/subscription.server';

/**
 * GET /api/v0/billing/subscriptions/[id]
 * Get a single subscription by ID
 * Layer: NextJS API Route → Server Service → FastAPI
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract bearer token from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const subscriptionId = params.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { message: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Call server service
    const subscription = await getSubscriptionByIdServer(subscriptionId, token);

    return NextResponse.json(subscription);
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to fetch subscription' },
      { status: error.status || 500 }
    );
  }
}