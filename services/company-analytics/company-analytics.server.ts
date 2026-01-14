// src/services/company-analytics/company-analytics.server.ts

import { serverApiClient } from '@/lib/server-api';
import { ENDPOINTS } from '@/services/api/endpoints';
import { 
  BackendCompanyAnalyticsResponse,
  GetCompanyAnalyticsRequest,
  CompanyAnalyticsInfluencer
} from '@/types/company-analytics';

// Interface matching your actual FastAPI response
interface ActualBackendResponse {
  social_accounts: Array<{
    id: string;
    influencer_id: string | null;
    platform_id: string;
    platform_account_id: string;
    account_handle: string;
    full_name: string;
    profile_pic_url: string;
    profile_pic_url_hd: string | null;
    account_url: string;
    is_private: boolean;
    is_verified: boolean;
    is_business: boolean;
    media_count: number;
    followers_count: number;
    following_count: number;
    subscribers_count: number | null;
    likes_count: number;
    biography: string;
    has_highlight_reels: boolean;
    category_id: string | null;
    has_clips: boolean;
    created_at: string;
    updated_at: string;
    is_deleted: boolean;
    deleted_at: string | null;
    deleted_by: string | null;
  }>;
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  };
  company_id: string;
  company_name: string;
  filters_applied: any;
}

// Transform social account to influencer format
function transformSocialAccountToInfluencer(socialAccount: ActualBackendResponse['social_accounts'][0]): CompanyAnalyticsInfluencer {
  console.log(`🔄 Transforming social account:`, {
    id: socialAccount.id,
    name: socialAccount.full_name,
    handle: socialAccount.account_handle,
    followers: socialAccount.followers_count
  });

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

  console.log(`✅ Transformed influencer:`, {
    id: transformedInfluencer.id,
    name: transformedInfluencer.name,
    followers: transformedInfluencer.followers,
    engagementRate: transformedInfluencer.engagementRate,
    accountType: transformedInfluencer.accountType
  });

  return transformedInfluencer;
}

export async function getCompanyAnalyticsServer(
  companyId: string,
  filters?: Omit<GetCompanyAnalyticsRequest, 'companyId'>,
  authToken?: string
): Promise<BackendCompanyAnalyticsResponse> {
  try {
    console.log(`🚀 Server Service: Getting analytics for company ${companyId}`);
    console.log(`📋 Filters:`, filters);
    
    // Use the ENDPOINTS configuration
    let endpoint = ENDPOINTS.COMPANY_ANALYTICS.BY_COMPANY(companyId);
    
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
      console.log(`🔗 Query string: ${queryString}`);
    }

    console.log(`📞 Server Service: Calling serverApiClient with endpoint: ${endpoint}`);
    
    // Use serverApiClient instead of direct fetch
    const response = await serverApiClient.get<ActualBackendResponse>(
      endpoint,
      {},
      authToken
    );
    
    console.log(`📦 Server Service: Response status: ${response.status}`);
    
    if (response.error) {
      console.error(`❌ Server Service: API Error:`, response.error);
      throw new Error(response.error.message);
    }
    
    if (!response.data) {
      console.error(`❌ Server Service: No response data received`);
      throw new Error('No response data received from server');
    }
    
    const data = response.data;
    
    console.log(`📊 Server Service: Raw API response structure:`, {
      socialAccountsCount: data.social_accounts?.length || 0,
      companyId: data.company_id,
      companyName: data.company_name,
      paginationPage: data.pagination?.page,
      paginationTotal: data.pagination?.total_items
    });

    // Log first social account for debugging
    if (data.social_accounts && data.social_accounts.length > 0) {
      const firstAccount = data.social_accounts[0];
      console.log(`👤 Server Service: First social account:`, {
        id: firstAccount.id,
        name: firstAccount.full_name,
        handle: firstAccount.account_handle,
        followers: firstAccount.followers_count,
        verified: firstAccount.is_verified,
        business: firstAccount.is_business
      });
    }
    
    // Transform the response to match expected format
    console.log(`🔄 Server Service: Starting transformation of ${data.social_accounts.length} social accounts...`);
    const transformedInfluencers: CompanyAnalyticsInfluencer[] = data.social_accounts.map(
      transformSocialAccountToInfluencer
    );

    console.log(`✅ Server Service: Transformation completed: ${transformedInfluencers.length} influencers`);

    // Return in expected format
    const transformedResponse: BackendCompanyAnalyticsResponse = {
      influencers: transformedInfluencers,
      total: data.pagination.total_items,
      page: data.pagination.page,
      limit: data.pagination.page_size,
      total_pages: data.pagination.total_pages
    };

    console.log(`🎉 Server Service: Final response:`, {
      influencersCount: transformedResponse.influencers.length,
      total: transformedResponse.total,
      page: transformedResponse.page,
      totalPages: transformedResponse.total_pages
    });

    return transformedResponse;
  } catch (error) {
    console.error(`💥 Server Service: Error for company ${companyId}:`, error);
    
    if (error instanceof Error) {
      console.error(`💥 Server Service: Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    throw error;
  }
}