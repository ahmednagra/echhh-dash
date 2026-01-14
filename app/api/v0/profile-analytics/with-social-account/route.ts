// src/app/api/v0/profile-analytics/with-social-account/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { saveProfileAnalyticsWithSocialAccountServer } from '@/services/profile-analytics';
import { SaveProfileAnalyticsRequest } from '@/types/profile-analytics';

export async function POST(request: NextRequest) {
  try {
    console.log('API Route: Saving profile analytics with social account data');

    // Extract auth token from request headers
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication token is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const requestData: SaveProfileAnalyticsRequest = await request.json();

    // Validate request data
    if (!requestData.social_account_data || !requestData.analytics) {
      return NextResponse.json(
        { error: 'Both social_account_data and analytics are required' },
        { status: 400 }
      );
    }

    if (!requestData.social_account_data.platform_account_id) {
      return NextResponse.json(
        { error: 'platform_account_id is required in social_account_data' },
        { status: 400 }
      );
    }

    console.log('API Route: Request data validated successfully');

    // Call server service to save profile analytics
    const result = await saveProfileAnalyticsWithSocialAccountServer(requestData, authToken);

    console.log('API Route: Profile analytics saved successfully');
    return NextResponse.json(result);
  } catch (error) {
    console.error('API Route: Error saving profile analytics:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}