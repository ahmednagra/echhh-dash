// src/services/insights-iq/userhandles/userhandles.client.ts
// Client-side service for userhandles operations

import { nextjsApiClient } from '@/lib/nextjs-api';

// ============================================================================
// TYPES
// ============================================================================

interface UserhandleResult {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: string | number;
  is_verified: boolean;
}

interface UserhandlesApiResponse {
  success: boolean;
  data: UserhandleResult[];
  total: number;
  query: string;
  error?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_VERSION = '/api/v0';
const USERHANDLES_ENDPOINT = '/discover/userhandles';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate browser environment
 */
function validateBrowser(functionName: string): void {
  if (typeof window === 'undefined') {
    throw new Error(`${functionName} can only be called from browser`);
  }
}

/**
 * Parse followers count from string or number
 */
function parseFollowersCount(followers: string | number): number {
  if (typeof followers === 'number') {
    return followers;
  }
  return parseInt(followers, 10) || 0;
}

// ============================================================================
// CLIENT FUNCTIONS
// ============================================================================

/**
 * Search userhandles by username
 * 
 * @param query - Username to search for
 * @param options - Optional search parameters
 * @returns Promise<UserhandlesApiResponse>
 */
export async function searchUserhandlesClient(
  query: string,
  options?: {
    type?: 'search' | 'lookalike' | 'topic-tags';
    limit?: number;
    work_platform_id?: string;
  },
): Promise<UserhandlesApiResponse> {
  try {
    validateBrowser('searchUserhandlesClient');

    if (!query || query.trim().length < 2) {
      return {
        success: false,
        data: [],
        total: 0,
        query: query || '',
        error: 'Query must be at least 2 characters',
      };
    }

    const cleanQuery = query.trim().replace(/^@/, '');
    
    const queryParams = new URLSearchParams({
      q: cleanQuery,
      type: options?.type || 'search',
      limit: (options?.limit || 10).toString(),
    });

    if (options?.work_platform_id) {
      queryParams.append('work_platform_id', options.work_platform_id);
    }

    const endpoint = `${API_VERSION}${USERHANDLES_ENDPOINT}?${queryParams.toString()}`;

    console.log(`📞 Userhandles Client: Searching at ${endpoint}`);

    const response = await nextjsApiClient.get<UserhandlesApiResponse>(endpoint);

    if (response.error) {
      console.error('❌ Userhandles Client: API Error:', response.error);
      throw new Error(response.error.message);
    }

    if (!response.data) {
      throw new Error('No response data received');
    }

    console.log(`✅ Userhandles Client: Found ${response.data.data?.length || 0} results`);

    return response.data;
  } catch (error) {
    console.error('💥 Userhandles Client: Error in searchUserhandlesClient:', error);
    
    return {
      success: false,
      data: [],
      total: 0,
      query: query || '',
      error: error instanceof Error ? error.message : 'Failed to search userhandles',
    };
  }
}

/**
 * Fetch followers count for a specific username
 * 
 * Uses userhandles search API to find the user and extract their follower count.
 * Falls back to 0 if user is not found or on any error.
 * 
 * @param username - Instagram username to look up
 * @returns Promise<number> - Follower count or 0 if not found
 */
export async function fetchFollowersCountClient(username: string): Promise<number> {
  try {
    validateBrowser('fetchFollowersCountClient');

    if (!username || username.trim().length < 2) {
      return 0;
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    console.log(`📞 Userhandles Client: Fetching followers for @${cleanUsername}`);

    const response = await searchUserhandlesClient(cleanUsername, {
      type: 'search',
      limit: 5,
    });

    if (!response.success || !response.data || response.data.length === 0) {
      console.log(`⚠️ Userhandles Client: No results for @${cleanUsername}`);
      return 0;
    }

    // Try to find exact username match first
    const exactMatch = response.data.find(
      (user) => user.username.toLowerCase() === cleanUsername.toLowerCase(),
    );

    if (exactMatch) {
      const followers = parseFollowersCount(exactMatch.followers);
      console.log(`✅ Userhandles Client: Exact match found - @${cleanUsername} has ${followers} followers`);
      return followers;
    }

    // Fallback to first result if no exact match
    const firstResult = response.data[0];
    const followers = parseFollowersCount(firstResult.followers);
    console.log(`⚠️ Userhandles Client: No exact match, using first result - ${followers} followers`);
    return followers;
  } catch (error) {
    console.error(`💥 Userhandles Client: Error fetching followers for @${username}:`, error);
    return 0;
  }
}

/**
 * Batch fetch followers counts for multiple usernames
 * 
 * @param usernames - Array of usernames to look up
 * @returns Promise<Map<string, number>> - Map of username to follower count
 */
export async function fetchMultipleFollowersCounts(
  usernames: string[],
): Promise<Map<string, number>> {
  const results = new Map<string, number>();

  if (!usernames || usernames.length === 0) {
    return results;
  }

  console.log(`📞 Userhandles Client: Batch fetching followers for ${usernames.length} users`);

  // Process in parallel with a small batch size to avoid rate limiting
  const batchSize = 3;
  for (let i = 0; i < usernames.length; i += batchSize) {
    const batch = usernames.slice(i, i + batchSize);
    
    const batchResults = await Promise.all(
      batch.map(async (username) => {
        const count = await fetchFollowersCountClient(username);
        return { username, count };
      }),
    );

    batchResults.forEach(({ username, count }) => {
      results.set(username.toLowerCase(), count);
    });

    // Small delay between batches to avoid rate limiting
    if (i + batchSize < usernames.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  console.log(`✅ Userhandles Client: Batch complete - fetched ${results.size} follower counts`);

  return results;
}
