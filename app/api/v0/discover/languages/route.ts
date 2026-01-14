// src/app/api/v0/discover/languages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { LanguagesService } from '@/services/insights-iq/languages';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    let result;
    
    if (search) {
      // Search languages by query
      const languages = await LanguagesService.searchLanguages(search);
      result = { languages };
    } else {
      // Get all languages
      result = await LanguagesService.getLanguages();
    }

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200', // Cache for 1 day, stale for 12 hours
      },
    });

  } catch (error) {
    console.error('Languages API error:', error);
    
    // Handle specific InsightIQ service errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = errorMessage.includes('API error:') ? 502 : 500;
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch languages',
        message: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }
}