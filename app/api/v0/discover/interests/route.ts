// src/app/api/v0/discover/interests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { interestsService } from '@/services/insights-iq/interests';
import { ProcessedInterest } from '@/services/insights-iq/interests/types';

/**
 * GET /api/v0/discover/interests
 * 
 * Fetches all available interests from InsightIQ API
 * Supports optional search query parameter
 * 
 * Query Parameters:
 * - q (optional): Search query to filter interests
 * 
 * Example: /api/v0/discover/interests?q=fashion
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🎯 GET /api/v0/discover/interests - Starting request');

    // Extract search query from URL parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';

    console.log('🔍 Search query:', searchQuery || 'none');

    // Fetch interests with caching
    const response = await interestsService.getInterestsWithCache();

    if (!response.success) {
      console.error('❌ Failed to fetch interests:', response.error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch interests',
          message: response.error,
          success: false 
        },
        { status: 500 }
      );
    }

    if (!response.data) {
      console.error('❌ No interests data received');
      return NextResponse.json(
        { 
          error: 'No interests data available',
          success: false 
        },
        { status: 500 }
      );
    }

    let filteredInterests: ProcessedInterest[] = response.data;

    // Apply search filter if query provided
    if (searchQuery.trim()) {
      filteredInterests = interestsService.searchInterests(response.data, searchQuery);
      console.log(`🔍 Filtered interests: ${filteredInterests.length} results for "${searchQuery}"`);
    }

    // Prepare response
    const responseData = {
      success: true,
      data: filteredInterests,
      total: filteredInterests.length,
      query: searchQuery || null,
      cached: true // Assuming cached data, could be enhanced to track this
    };

    console.log(`✅ Successfully returning ${filteredInterests.length} interests`);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour at CDN level
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/v0/discover/interests:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    );
  }
}