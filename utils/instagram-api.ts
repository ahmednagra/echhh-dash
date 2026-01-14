// src/utils/instagram-api.ts

import { InstagramSearchResponse, InstagramProfileResponse } from '@/types/instagram';

/**
 * Search Instagram profiles by keyword
 */
export async function searchProfiles(keyword: string): Promise<InstagramSearchResponse> {
  try {
    // Make sure keyword is valid
    if (!keyword || keyword.trim().length < 2) {
      throw new Error("Invalid search keyword");
    }

    const encodedKeyword = encodeURIComponent(keyword.trim());
    const response = await fetch(`/api/v0/instagram/search?keyword=${encodedKeyword}&proxyImage=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a unique header to prevent caching issues
        'X-Request-Time': Date.now().toString(),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error in searchProfiles:", error);
    throw error;
  }
}

/**
 * Get detailed information about an Instagram profile
 */
export async function getProfileDetails(userId: string): Promise<InstagramProfileResponse> {
  try {
    // Make sure userId is valid
    if (!userId || userId.trim().length === 0) {
      throw new Error("Invalid user ID");
    }

    const encodedUserId = encodeURIComponent(userId.trim());
    const response = await fetch(`/api/v0/instagram/profile?userId=${encodedUserId}&includePosts=true&proxyImage=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add a unique header to prevent caching issues
        'X-Request-Time': Date.now().toString(),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error in getProfileDetails:", error);
    throw error;
  }
}


/**
 * Get detailed information about an Instagram video
 */
export async function getPostDetails(shortcode: string): Promise<any> {
  try {
    if (!shortcode || shortcode.trim().length === 0) {
      throw new Error("Invalid video shortcode");
    }

    const encodedShortcode = encodeURIComponent(shortcode.trim());
    const response = await fetch(`/api/v0/instagram/post?shortcode=${encodedShortcode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Time': Date.now().toString(),
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.error || `API request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    return await response.json();
  } catch (error) {
    console.error("API Error in getVideoDetails:", error);
    throw error;
  }
}