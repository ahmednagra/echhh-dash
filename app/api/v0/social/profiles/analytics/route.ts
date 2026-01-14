// src/app/api/v0/social/profiles/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { InsightIQBaseService } from '@/services/insights-iq/base.service';
import { INSIGHTIQ_ENDPOINTS } from '@/services/insights-iq/endpoints';
import { InsightIQProfileAnalyticsResponse } from '@/types/insightiq/profile-analytics';

// Create an instance of the base service for direct 3rd party API calls
const insightIQService = new InsightIQBaseService();

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { identifier, work_platform_id } = requestBody;

    if (!identifier) {
      return NextResponse.json(
        { error: 'identifier is required' },
        { status: 400 }
      );
    }

    if (!work_platform_id) {
      return NextResponse.json(
        { error: 'work_platform_id is required' },
        { status: 400 }
      );
    }

    console.log(`API Route: Fetching profile analytics from InsightIQ for identifier ${identifier} on platform ${work_platform_id}`);

    // Prepare request body for InsightIQ API
    const insightIqRequestBody = {
      identifier,
      work_platform_id
    };
    
    // Call InsightIQ API directly using the base service
    const result = await insightIQService.makeRequest<InsightIQProfileAnalyticsResponse>(
      INSIGHTIQ_ENDPOINTS.profileAnalytics.getAnalytics,
      {
        method: 'POST',
        body: insightIqRequestBody
      }
    );

    if (!result.success) {
      console.error('API Route: InsightIQ API error:', result.error);
      return NextResponse.json(
        { error: result.error?.message || 'Failed to fetch profile analytics from InsightIQ' },
        { status: result.error?.status_code || 500 }
      );
    }

    console.log('API Route: Successfully fetched profile analytics from InsightIQ');
    return NextResponse.json(result.data);
  } catch (error) {
    console.error('API Route: Error fetching profile analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}