// src/app/api/v0/profile-analytics/exists/[platformAccountId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { checkProfileAnalyticsExistsServer } from '@/services/profile-analytics/profile-analytics.server';
import { CheckProfileAnalyticsExistsResponse } from '@/types/profile-analytics';

/**
 * GET /api/v0/profile-analytics/exists/[platformAccountId]
 * Check if profile analytics exists for an influencer
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { platformAccountId: string } }
) {
  try {
    console.log('🌐 API Route: GET /api/v0/profile-analytics/exists/[platformAccountId]');
    console.log('📋 API Route: Platform Account ID:', params.platformAccountId);

    // Extract auth token from request headers
    const authHeader = request.headers.get('authorization');
    const authToken = authHeader?.replace('Bearer ', '');

    console.log('🔑 API Route: Auth token check:', authToken ? 'Token exists' : 'No token');

    if (!authToken) {
      console.warn('⚠️ API Route: No authorization token provided');
      const response: CheckProfileAnalyticsExistsResponse = {
        success: false,
        error: 'No authorization token provided'
      };
      return NextResponse.json(response, { status: 401 });
    }

    if (!params.platformAccountId) {
      console.warn('⚠️ API Route: No platform account ID provided');
      const response: CheckProfileAnalyticsExistsResponse = {
        success: false,
        error: 'Platform account ID is required'
      };
      return NextResponse.json(response, { status: 400 });
    }

    console.log('📞 API Route: Calling server service...');
    
    // Call the server-side service
    const analyticsData = await checkProfileAnalyticsExistsServer(
      params.platformAccountId,
      authToken
    );

    console.log('✅ API Route: Server service completed successfully');
    console.log('📊 API Route: Analytics result:', {
      exists: analyticsData.exists,
      analyticsCount: analyticsData.analytics_count
    });

    const response: CheckProfileAnalyticsExistsResponse = {
      success: true,
      data: analyticsData
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('💥 API Route: Error in profile analytics check:', error);

    let errorMessage = 'Failed to check profile analytics existence';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('💥 API Route: Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });

      // Handle specific error types
      if (error.message.includes('authentication') || error.message.includes('token')) {
        statusCode = 401;
      } else if (error.message.includes('not found')) {
        statusCode = 404;
      } else if (error.message.includes('validation') || error.message.includes('invalid')) {
        statusCode = 400;
      }
    }

    const response: CheckProfileAnalyticsExistsResponse = {
      success: false,
      error: errorMessage
    };

    return NextResponse.json(response, { status: statusCode });
  }
}