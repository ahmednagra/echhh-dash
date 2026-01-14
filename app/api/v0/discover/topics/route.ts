// src/app/api/v0/discover/topics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { topicsService } from '@/services/insights-iq/topics';
import type { TopicsServiceResponse } from '@/services/insights-iq/topics';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const work_platform_id = searchParams.get('work_platform_id') || 'instagram';
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('🎯 Topics API called with params:', {
      query,
      work_platform_id,
      limit
    });

    // Convert query (q) parameter to identifier for the service
    const serviceOptions = {
      identifier: query, // Pass query as identifier to 3rd party API
      work_platform_id,
      limit
    };

    // Get topics with caching
    const response = await topicsService.getTopicsWithCache(serviceOptions);

    if (!response.success) {
      console.error('❌ Topics service error:', response.error);
      return NextResponse.json(
        { 
          success: false, 
          error: response.error || 'Failed to fetch topics',
          data: [],
          total: 0
        },
        { status: 500 }
      );
    }

    const topics = response.data || [];
    
    console.log(`✅ Topics API returning ${topics.length} topics`);

    return NextResponse.json({
      success: true,
      data: topics,
      total: topics.length,
      query: query || null,
      meta: {
        work_platform_id,
        limit,
        cached: true // Assuming cached since we use getTopicsWithCache
      }
    });

  } catch (error) {
    console.error('❌ Topics API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error',
        data: [],
        total: 0
      },
      { status: 500 }
    );
  }
}