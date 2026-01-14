// src/app/api/v0/influencers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractBearerToken } from '@/lib/auth-utils';

// POST /api/v0/influencers - Create a new influencer
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/v0/influencers - Creating influencer');

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log('📊 Influencer creation request:', { 
      username: body.username,
      name: body.name,
      email: body.email ? 'provided' : 'not provided',
      phone: body.phone ? 'provided' : 'not provided'
    });

    // Validate required fields
    if (!body.username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // For now, create a mock influencer ID since we don't have backend connection
    // In real implementation, this would call your backend API
    const mockInfluencer = {
      id: `inf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username: body.username,
      name: body.name || body.username,
      email: body.email || null,
      phone: body.phone || null,
      profile_data: body.profile_data || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('✅ Influencer created successfully:', mockInfluencer.id);
    return NextResponse.json(mockInfluencer, { status: 201 });

  } catch (error) {
    console.error('💥 Error in POST /api/v0/influencers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/v0/influencers - List influencers with pagination
export async function GET(request: NextRequest) {
  try {
    console.log('📋 GET /api/v0/influencers');

    // Get auth token using the utility function
    const authToken = extractBearerToken(request);
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For now, return empty list since we don't have backend connection
    // In real implementation, this would call your backend API
    const mockResponse = {
      influencers: [],
      pagination: {
        page: 1,
        page_size: 20,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_previous: false
      }
    };

    console.log('✅ Retrieved influencers successfully');
    return NextResponse.json(mockResponse);

  } catch (error) {
    console.error('💥 Error in GET /api/v0/influencers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}