// src/services/profile-analytics/profile-analytics.server.ts
// Server-side service for calling FastAPI backend

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  // Profile Analytics Types
  AnalyticsExistenceResponse,
  SaveAnalyticsRequest,
  SaveAnalyticsResponse,
  BackendAnalyticsResponse,
  // Company Analytics Types
  BackendCompanyAnalyticsResponse,
  GetCompanyAnalyticsRequest,
  CompanyAnalyticsInfluencer,
  ActualApiResponse
} from '@/types/profile-analytics';

// ============= EXISTING PROFILE ANALYTICS FUNCTIONS =============

/**
 * Check if profile analytics exists for an influencer from FastAPI backend (server-side)
 */
export async function checkProfileAnalyticsExistsServer(
  platformAccountId: string,
  authToken?: string
): Promise<AnalyticsExistenceResponse> {
  try {
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.EXISTS(platformAccountId);
    
    const response = await serverApiClient.get<AnalyticsExistenceResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No profile analytics data received');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error checking profile analytics for ${platformAccountId}:`, error);
    throw error;
  }
}

/**
 * Get profile analytics by handle from FastAPI backend (server-side)
 */
export async function getProfileAnalyticsByHandleServer(
  platformAccountId: string,
  authToken?: string
): Promise<BackendAnalyticsResponse> {
  try {
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.BY_HANDLE(platformAccountId);
    
    const response = await serverApiClient.get<BackendAnalyticsResponse>(
      endpoint,
      {},
      authToken
    );
    
    // Handle different response scenarios
    if (response.error) {
      // Check if it's a 404 "not found" error
      if (response.status === 404) {
        // Return the error response as-is so the caller can handle it
        return response.data || { detail: response.error.message };
      }
      
      // For other errors, throw
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No profile analytics data received');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error getting profile analytics for ${platformAccountId}:`, error);
    throw error;
  }
}

/**
 * Save profile analytics with social account data to FastAPI backend (server-side)
 */
export async function saveProfileAnalyticsWithSocialAccountServer(
  requestData: SaveAnalyticsRequest,
  authToken?: string
): Promise<SaveAnalyticsResponse> {
  try {
    const endpoint = ENDPOINTS.PROFILE_ANALYTICS.WITH_SOCIAL_ACCOUNT;
    
    const response = await serverApiClient.post<SaveAnalyticsResponse>(
      endpoint,
      requestData,
      {}, // No additional query params needed
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error saving profile analytics:', error);
    throw error;
  }
}

// ============= COMPANY ANALYTICS FUNCTIONS =============

// Transform social account to influencer format
function transformSocialAccountToInfluencer(socialAccount: ActualApiResponse['social_accounts'][0]): CompanyAnalyticsInfluencer {
  // Calculate engagement rate based on available data
  let engagementRate = 0;
  if (socialAccount.followers_count > 0 && socialAccount.media_count > 0) {
    // Calculate average engagement per post
    const avgLikesPerPost = socialAccount.likes_count / socialAccount.media_count;
    engagementRate = (avgLikesPerPost / socialAccount.followers_count) * 100;
    // Cap at reasonable max engagement rate
    engagementRate = Math.min(engagementRate, 20);
  }

  // Extract location from biography or use default
  const extractLocationFromBio = (bio: string): string => {
    // Simple location extraction patterns
    const locationPatterns = [
      /📍\s*([^,\n]+)/i,  // Location emoji
      /Location:\s*([^,\n]+)/i,
      /Based in\s*([^,\n]+)/i,
      /([A-Z][a-z]+,\s*[A-Z][a-z]+)/  // City, Country pattern
    ];
    
    for (const pattern of locationPatterns) {
      const match = bio.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return "Not specified";
  };

  const location = extractLocationFromBio(socialAccount.biography || "");

  // Calculate average likes per post
  const avgLikes = socialAccount.media_count > 0 
    ? Math.floor(socialAccount.likes_count / socialAccount.media_count)
    : 0;

  // Estimate reel views (reels typically get 8-15x more views than likes)
  const reelViews = Math.floor(avgLikes * 10);
  
  // For now, we'll use placeholder values for analytics data that's not available
  const gender = "Not specified";
  const language = "English"; // Could be extracted from bio analysis
  const ageGroup = "25-34"; // Would come from analytics data

  const transformedInfluencer: CompanyAnalyticsInfluencer = {
    id: socialAccount.id,
    platform_account_id: socialAccount.platform_account_id,
    name: socialAccount.full_name,
    username: socialAccount.account_handle,
    followers: socialAccount.followers_count,
    engagementRate: Math.round(engagementRate * 100) / 100, // Round to 2 decimal places
    avgLikes: avgLikes,
    reelViews: reelViews,
    location: location,
    gender: gender,
    language: language,
    ageGroup: ageGroup,
    accountType: socialAccount.is_business ? 'Business' : 'Creator',
    profileImage: socialAccount.profile_pic_url || '',
    verified: socialAccount.is_verified,
    mediaCount: socialAccount.media_count
  };

  return transformedInfluencer;
}

export async function getCompanyAnalyticsServer(
  companyId: string,
  filters?: Omit<GetCompanyAnalyticsRequest, 'companyId'>,
  authToken?: string
): Promise<BackendCompanyAnalyticsResponse> {
  try {
    // Use the ENDPOINTS configuration
    let endpoint = ENDPOINTS.PROFILE_ANALYTICS.COMPANY(companyId);
    
    // Build query parameters using URLSearchParams
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.sortBy) queryParams.append('sort_by', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sort_order', filters.sortOrder);
    
    // Add query parameters to endpoint if they exist
    const queryString = queryParams.toString();
    if (queryString) {
      endpoint = `${endpoint}?${queryString}`;
    }

    // Use serverApiClient instead of direct fetch
    const response = await serverApiClient.get<ActualApiResponse>(
      endpoint,
      {},
      authToken
    );
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      throw new Error('No response data received from server');
    }
    
    const data = response.data;
    
    // Transform the response to match expected format
    const transformedInfluencers: CompanyAnalyticsInfluencer[] = data.social_accounts.map(
      transformSocialAccountToInfluencer
    );

    // Return in expected format
    const transformedResponse: BackendCompanyAnalyticsResponse = {
      influencers: transformedInfluencers,
      total: data.pagination.total_items,
      page: data.pagination.page,
      limit: data.pagination.page_size,
      total_pages: data.pagination.total_pages
    };

    return transformedResponse;
  } catch (error) {
    console.error(`Error for company ${companyId}:`, error);
    throw error;
  }
}