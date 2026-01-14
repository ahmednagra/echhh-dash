// src/app/api/v0/profile-analytics/by-handle/[platformAccountId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getProfileAnalyticsByHandleServer } from '@/services/profile-analytics';
import { 
  isSuccessfulAnalyticsResponse, 
  isAnalyticsNotFoundError,
  isAnalyticsApiError 
} from '@/types/profile-analytics';

export async function GET(
  request: NextRequest,
  { params }: { params: { platformAccountId: string } }
) {
  try {
    const { platformAccountId } = params;

    if (!platformAccountId) {
      return NextResponse.json(
        { detail: 'Platform account ID is required' },
        { status: 400 }
      );
    }

    console.log(`API Route: Getting profile analytics for platform account ${platformAccountId}`);

    // Extract auth token from request headers
    const authHeader = request.headers.get('authorization');
    // const authToken = authHeader?.replace('Bearer ', '');
    const authToken = '';

    // if (!authToken) {
    //   return NextResponse.json(
    //     { detail: 'Authentication token is required' },
    //     { status: 401 }
    //   );
    // }

    // Call server service to get profile analytics
    const result = await getProfileAnalyticsByHandleServer(platformAccountId, authToken);
    
    // Handle different response types
    if (isSuccessfulAnalyticsResponse(result)) {
      console.log('API Route: Profile analytics retrieved successfully', {
        analyticsCount: result.analytics_count
      });
      return NextResponse.json(result, { status: 200 });
    } 
    else if (isAnalyticsNotFoundError(result)) {
      console.log('API Route: Profile analytics not found', {
        detail: result.detail
      });
      return NextResponse.json(result, { status: 404 });
    }
    else if (isAnalyticsApiError(result)) {
      console.error('API Route: API error response', result);
      return NextResponse.json(result, { status: 500 });
    }
    else {
      console.warn('API Route: Unknown response type', result);
      return NextResponse.json(
        { detail: 'Unknown response format from backend' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Route: Error getting profile analytics:', error);
   
    if (error instanceof Error) {
      // Check if it's a "not found" error from the server
      if (error.message.includes('not found') || error.message.includes('404')) {
        return NextResponse.json(
          { detail: 'Social account not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { detail: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}