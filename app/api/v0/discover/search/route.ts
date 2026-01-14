// src/app/api/v0/discover/search/route.ts
import { NextResponse } from 'next/server';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

// Remove force-dynamic to allow caching
// export const dynamic = 'force-dynamic'; // Remove this line

// In-memory cache with TTL
interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 36000 * 1000; // 10 hours in milliseconds

/**
 * Creates a cache key from search filters
 */
function createCacheKey(filters: InfluencerSearchFilter): string {
  // Sort object keys to ensure consistent cache keys for same filters
  const sortedFilters = Object.keys(filters)
    .sort()
    .reduce((result, key) => {
      result[key as keyof InfluencerSearchFilter] = filters[key as keyof InfluencerSearchFilter];
      return result;
    }, {} as any);
  
  return Buffer.from(JSON.stringify(sortedFilters)).toString('base64');
}

/**
 * Retrieves data from cache if valid
 */
function getCachedData(cacheKey: string): any | null {
  const entry = cache.get(cacheKey);
  
  if (!entry) return null;
  
  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(cacheKey);
    return null;
  }
  
  return entry.data;
}

/**
 * Stores data in cache
 */
function setCachedData(cacheKey: string, data: any): void {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl: CACHE_TTL
  });
  
  // Cleanup old entries periodically
  if (cache.size > 100) {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        cache.delete(key);
      }
    }
  }
}

/**
 * Formats a number into a readable string format
 */
function formatNumber(num: number): string {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Creates a Base64 encoded Basic Authentication header
 */
function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return Buffer.from(credentials).toString('base64');
}

/**
 * POST /api/v0/discover/search
 * Searches for influencers based on provided filters with caching
 */
export async function POST(request: Request) {
  console.log('✅ API Route Hit: /api/v0/discover/search');

  try {
    const filters: InfluencerSearchFilter = await request.json();
    const cacheKey = createCacheKey(filters);
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      console.log('🎯 Cache hit - returning cached data');
      return NextResponse.json(cachedResult);
    }
    
    console.log('💿 Cache miss - fetching from external API');
    
    // Environment variables
    const apiUrl = process.env.INSIGHTIQ_BASE_URL;
    const clientId = process.env.INSIGHTIQ_CLIENT_ID;
    const clientSecret = process.env.INSIGHTIQ_CLIENT_SECRET;
    
    // Validate required environment variables
    if (!apiUrl || !clientId || !clientSecret) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { 
          error: "configuration_error",
          message: "Missing required API configuration"
        },
        { status: 500 }
      );
    }

    // Construct API endpoint
    const endpoint = `${apiUrl}/social/creators/profiles/search`;

    // Create dynamic Basic Auth header
    const basicAuth = createBasicAuthHeader(clientId, clientSecret);

    // Timeout configuration
    const TIMEOUT_DURATION = 30000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    console.log(`🔄 Making request to external API with ${TIMEOUT_DURATION / 1000}s timeout...`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify(filters),
        signal: controller.signal,
        // For POST requests, you might want to disable Next.js fetch cache
        cache: 'no-store'
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('External API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });

        return NextResponse.json(
          { 
            error: "external_api_error",
            status: response.status,
            message: errorText || `HTTP ${response.status}: ${response.statusText}`
          },
          { status: 502 }
        );
      }

      const data = await response.json();
      console.log(`✅ Successfully received data with ${data.data?.length || 0} influencers`);

      // Transform and normalize response data
      const influencers = data.data?.map((item: any) => ({
        id: item?.external_id,
        username: item.platform_username,
        name: item.full_name,
        profileImage: item.image_url,
        followers: item.follower_count,
        engagements: item?.engagements,
        engagementRate: item.engagement_rate,
        isVerified: item.is_verified || false,
        age_group: item.age_group,
        average_likes: item.average_likes,
        average_views: item.average_views,
        contact_details: item.contact_details,
        content_count: item.content_count,
        creator_location: item.creator_location,
        external_id: item.external_id,
        gender: item.gender,
        introduction: item.introduction,
        language: item.language,
        livestream_metrics: item.livestream_metrics,
        platform_account_type: item.platform_account_type,
        subscriber_count: item.subscriber_count,
        url: item.url,
        filter_match: item.filter_match,

              // ADD THESE NEW FIELDS:
        creator_age: item.creator_age || item.age || null,
        audience_locations: item.audience_locations || 
                          item.filter_match?.audience_locations || 
                          item.demographic_data?.audience_locations || 
                          [],
        audience_age_groups: item.audience_age_groups || 
                            item.filter_match?.audience_age || 
                            item.demographic_data?.audience_age || 
                            [],
        audience_demographics: {
          age_distribution: item.audience_age_distribution || 
                          item.filter_match?.audience_age || 
                          [],
          location_distribution: item.audience_location_distribution || 
                                item.filter_match?.audience_locations || 
                                [],
          gender_distribution: item.audience_gender_distribution || 
                              item.filter_match?.audience_gender || 
                              []
        },
        
        // Enhanced reel views handling
        instagram_options: {
          ...item.instagram_options,
          reel_views: item.instagram_options?.reel_views || 
                    item.filter_match?.instagram_options?.reel_views ||
                    item.average_reel_views ||
                    null
        },
        
        work_platform: {
          id: item.work_platform?.id,
          name: item.work_platform?.name,
          logo_url: item.work_platform?.logo_url
        }
      })) || [];

      const result = {
        success: true,
        data: {
          influencers,
          total_count: influencers.length,
        },
        metadata: data.metadata,
        cached: false,
        cacheKey: cacheKey.substring(0, 16) + '...' // For debugging
      };

      // Cache the successful result
      setCachedData(cacheKey, { ...result, cached: true });
      
      return NextResponse.json(result);

    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error(`Request timeout after ${TIMEOUT_DURATION / 1000} seconds`);
        return NextResponse.json(
          { 
            error: "timeout_error",
            message: `Request timed out after ${TIMEOUT_DURATION / 1000} seconds. The external API may be experiencing delays.`
          },
          { status: 408 }
        );
      }
      
      throw fetchError;
    }

  } catch (error: any) {
    console.error('Route Handler Error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    return NextResponse.json(
      { 
        error: "internal_error",
        message: error.message || "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}