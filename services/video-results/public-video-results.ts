// src/services/video-results/public-video-results.ts

import { VideoResult } from '@/types/user-detailed-info';

/**
 * Public video results service for shared campaign analytics
 * This service fetches campaign data without requiring user authentication
 */

interface PublicVideoResultsResponse {
  results: VideoResult[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Get video results for public sharing (no authentication required)
 */
export async function getPublicVideoResults(
  campaignId: string, 
  page: number = 1, 
  limit: number = 200
): Promise<VideoResult[]> {
  try {
    console.log(`🔓 PUBLIC SERVICE: Fetching public video results for campaign: ${campaignId}`);
    
    const response = await fetch(`/api/v0/public/campaign/${campaignId}?page=${page}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: No Authorization header for public access
      },
      // No credentials for public access
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PUBLIC SERVICE: API Error:', response.status, errorData);
      
      let errorMessage = 'Failed to fetch public campaign data';
      
      if (response.status === 404) {
        errorMessage = 'Campaign not found or not available for public sharing';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'This campaign is not available for public sharing';
      } else if (response.status >= 500) {
        errorMessage = 'Server error occurred while loading campaign data';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      throw new Error(errorMessage);
    }

    const data: { 
      success: boolean; 
      results: VideoResult[]; 
      total: number;
      isPublicAccess?: boolean;
      campaignId?: string;
    } = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Public API returned unsuccessful response');
    }

    console.log(`✅ PUBLIC SERVICE: Successfully fetched ${data.results?.length || 0} public video results`);
    
    // Log public access for debugging
    if (data.isPublicAccess) {
      console.log('🔓 PUBLIC SERVICE: Confirmed public access mode');
    }
    
    return data.results || [];
    
  } catch (error) {
    console.error('💥 PUBLIC SERVICE: Error fetching public video results:', error);
    throw error;
  }
}

/**
 * Server-side version for Next.js API routes
 */
export async function getPublicVideoResultsServer(
  campaignId: string,
  page: number = 1,
  limit: number = 200
): Promise<PublicVideoResultsResponse> {
  try {
    console.log(`🔍 PUBLIC SERVICE SERVER: Fetching public video results for campaign: ${campaignId}`);
    
    // Get the base URL for the current environment
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const url = `${baseUrl}/api/v0/public/campaign/${campaignId}?page=${page}&limit=${limit}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // CRITICAL: No Authorization header for public access
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ PUBLIC SERVICE SERVER: API Error:', response.status, errorData);
      
      let errorMessage = 'Failed to fetch public campaign data';
      
      if (response.status === 404) {
        errorMessage = 'Campaign not found or not available for public sharing';
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = 'This campaign is not available for public sharing';
      } else if (response.status >= 500) {
        errorMessage = 'Server error occurred while loading campaign data';
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Public API returned unsuccessful response');
    }

    console.log(`✅ PUBLIC SERVICE SERVER: Successfully fetched ${data.results?.length || 0} public video results`);
    
    return {
      results: data.results || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit
    };
    
  } catch (error) {
    console.error('💥 PUBLIC SERVICE SERVER: Error fetching public video results:', error);
    throw error;
  }
}

/**
 * Fallback function to try multiple endpoints if public API fails
 */
export async function getPublicVideoResultsWithFallback(
  campaignId: string,
  page: number = 1,
  limit: number = 200
): Promise<VideoResult[]> {
  const endpoints = [
    `/api/v0/public/campaign/${campaignId}`,
    `/api/campaigns/${campaignId}/video-results`, // Fallback to regular endpoint
  ];

  let lastError: Error | null = null;

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 PUBLIC SERVICE FALLBACK: Trying endpoint: ${endpoint}`);
      
      const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add public access headers
          'X-Public-Access': 'true',
          'X-Internal-Request': 'shared-report',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.results) {
          console.log(`✅ PUBLIC SERVICE FALLBACK: Success with ${endpoint}`);
          return data.results;
        } else if (data.results) {
          // Handle different response formats
          console.log(`✅ PUBLIC SERVICE FALLBACK: Success with ${endpoint} (alt format)`);
          return data.results;
        }
      }
      
      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(`${endpoint} failed: ${response.status} - ${errorData.error || 'Unknown error'}`);
      
    } catch (error) {
      console.error(`❌ PUBLIC SERVICE FALLBACK: ${endpoint} failed:`, error);
      lastError = error instanceof Error ? error : new Error(`${endpoint} failed with unknown error`);
    }
  }

  // If all endpoints failed, throw the last error
  throw lastError || new Error('All fallback endpoints failed');
}