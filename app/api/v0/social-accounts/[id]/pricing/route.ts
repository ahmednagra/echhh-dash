// src/app/api/v0/social-accounts/[id]/pricing/route.ts
// FINAL VERSION - Calls real backend API

import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';

interface RouteContext {
  params: {
    id: string;
  };
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    console.log('PUT /api/v0/social-accounts/[id]/pricing - Real backend call for account:', params.id);
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Social account ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('Request body received:', body);

    const { collaboration_price, currency = 'USD' } = body;

    // Validate request
    if (collaboration_price !== null && collaboration_price !== undefined) {
      const price = typeof collaboration_price === 'string' ? parseFloat(collaboration_price) : collaboration_price;
      if (isNaN(price) || price < 0) {
        return NextResponse.json(
          { success: false, error: 'collaboration_price must be a valid positive number or null' },
          { status: 400 }
        );
      }
    }

    // Get auth token
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get backend URL - use your working Postman URL
    const baseUrl = 'http://192.168.18.74:8001';
    const endpoint = `${baseUrl}/api/v0/social-accounts/${id}/pricing`;
    
    console.log('Calling backend endpoint:', endpoint);

    // Format request body to match your working Postman format
    const requestBody = {
      price: collaboration_price,  // Note: backend expects "price", not "collaboration_price"
      currency: currency
    };

    console.log('Backend request body:', requestBody);

    // Call your backend API (exactly like your working Postman request)
    const backendResponse = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(requestBody)
    });

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend API Error:', {
        status: backendResponse.status,
        error: errorText
      });
      throw new Error(`Backend API Error: ${backendResponse.status} - ${errorText}`);
    }

    const backendData = await backendResponse.json();
    console.log('Backend response data:', backendData);

    // Transform backend response to match frontend expectations
    const updatedAccount = {
      id: backendData.id || id,
      collaboration_price: backendData.collaboration_price || backendData.price,
      currency: backendData.currency || currency,
      updated_at: backendData.updated_at || new Date().toISOString(),
      // Include other account fields from backend response
      platform_id: backendData.platform_id || "1",
      account_handle: backendData.account_handle || "updated_account",
      full_name: backendData.full_name || "Updated Account",
      followers_count: backendData.followers_count || 0,
      is_verified: backendData.is_verified || false,
      is_private: backendData.is_private || false,
      is_business: backendData.is_business || false
    };

    console.log('Successfully updated pricing in backend:', {
      accountId: updatedAccount.id,
      collaboration_price: updatedAccount.collaboration_price,
      currency: updatedAccount.currency
    });

    // Return the format your service expects
    return NextResponse.json({
      success: true,
      data: updatedAccount
    }, { status: 200 });

  } catch (error) {
    console.error('API Route Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}