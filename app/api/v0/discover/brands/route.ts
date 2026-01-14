// src/app/api/v0/discover/brands/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { brandsService } from '@/services/insights-iq/brands';
import { ProcessedBrand } from '@/services/insights-iq/brands/types';

/**
 * GET /api/v0/discover/brands
 * 
 * Fetches all available brands from InsightIQ API
 * Supports optional search query parameter
 * 
 * Query Parameters:
 * - q (optional): Search query to filter brands
 * 
 * Example: /api/v0/discover/brands?q=nike
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🏢 GET /api/v0/discover/brands - Starting request');

    // Extract search query from URL parameters
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('q') || '';

    console.log('🔍 Search query:', searchQuery || 'none');

    // Fetch brands with caching
    const response = await brandsService.getBrandsWithCache();

    if (!response.success) {
      console.error('❌ Failed to fetch brands:', response.error);
      return NextResponse.json(
        { 
          error: 'Failed to fetch brands',
          message: response.error,
          success: false 
        },
        { status: 500 }
      );
    }

    if (!response.data) {
      console.error('❌ No brands data received');
      return NextResponse.json(
        { 
          error: 'No brands data available',
          success: false 
        },
        { status: 500 }
      );
    }

    let filteredBrands: ProcessedBrand[] = response.data;

    // Apply search filter if query provided
    if (searchQuery.trim()) {
      filteredBrands = brandsService.searchBrands(response.data, searchQuery);
      console.log(`🔍 Filtered brands: ${filteredBrands.length} results for "${searchQuery}"`);
    }

    // Prepare response
    const responseData = {
      success: true,
      data: filteredBrands,
      total: filteredBrands.length,
      query: searchQuery || null,
      cached: true // Assuming cached data, could be enhanced to track this
    };

    console.log(`✅ Successfully returning ${filteredBrands.length} brands`);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour at CDN level
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('❌ Error in GET /api/v0/discover/brands:', error);
    
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