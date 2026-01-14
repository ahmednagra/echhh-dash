// src/services/nanoinfluencer/profile/profile.client.ts
// Client service for NanoInfluencer profile API

import { StandardizedProfile } from '@/types/campaign-influencers';

export interface NanoInfluencerConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export interface NanoInfluencerResponse {
  code: number;
  data: {
    type: string;
    platform: string;
    id: string;
    username: string;
    name: string;
    subsCount: number;
    postCount: number;
    lastPostDate: string;
    country: string;
    postPerMonth: number;
    viewsMedian: number;
    likesMedian: number;
    commentsMedian: number;
    sharesMedian: number;
    favoritesMedian: string;
    erMedian: number;
    vrMedian: number;
    uid: string;
    avatar: string;
    followingCount: number;
    accountType: string;
    isPrivate: boolean;
    isVerified: boolean;
    email: Array<{
      type: string;
      value: string;
    }>;
    topics: string[];
    audiences: string[];
    links: string[];
    title: string;
    desc: string;
    gender: string;
  };
  quota: number;
  usage: number;
  cost: number;
  message: string;
}

/**
 * Fetch profile data from NanoInfluencer API
 * This is a client-side service that should only be called from browser
 */
export async function fetchNanoInfluencerProfile(
  username: string,
  platform: 'instagram' | 'tiktok' | 'youtube'
): Promise<StandardizedProfile> {
  if (typeof window === 'undefined') {
    throw new Error('NanoInfluencer client service can only be called from browser');
  }

  try {
    // Construct profile URL based on platform
    const profileUrl = constructProfileUrl(username, platform);
    
    // Call the NanoInfluencer API (this would be through your proxy endpoint)
    const response = await fetch('/api/v0/providers/nanoinfluencer/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        profile_url: profileUrl,
        platform: platform
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data: NanoInfluencerResponse = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || 'Failed to fetch profile from NanoInfluencer');
    }

    // Transform to standardized format
    return transformNanoInfluencerData(data.data, platform);

  } catch (error) {
    console.error('NanoInfluencer Profile Client: Error fetching profile:', error);
    throw error;
  }
}

/**
 * Construct profile URL based on platform and username
 */
function constructProfileUrl(username: string, platform: string): string {
  const cleanUsername = username.replace(/^@/, '');
  
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${cleanUsername}/`;
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanUsername}`;
    case 'youtube':
      return `https://www.youtube.com/@${cleanUsername}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

/**
 * Transform NanoInfluencer data to standardized profile format
 */
function transformNanoInfluencerData(data: any, platform: string): StandardizedProfile {
  return {
    id: data.uid || data.id,
    username: data.username,
    name: data.name,
    profileImage: data.avatar || '',
    followers: data.subsCount || 0,
    following_count: data.followingCount || 0,
    engagementRate: data.erMedian ? data.erMedian * 100 : 0, // Convert to percentage
    isVerified: data.isVerified || false,
    age_group: null,
    average_likes: data.likesMedian || 0,
    average_views: data.viewsMedian || null,
    contact_details: data.email ? data.email.map((email: any) => ({
      type: 'email',
      value: email.value,
      contact_type: email.type.toLowerCase(),
      is_primary: email.type === 'PUBLIC'
    })) : [],
    content_count: data.postCount || null,
    creator_location: {
      country: data.country || undefined,
      city: undefined,
      state: undefined
    },
    external_id: data.uid || data.id,
    gender: data.gender || '',
    introduction: data.title || data.desc || '',
    language: '', // NanoInfluencer doesn't provide language directly
    platform_account_type: data.accountType || 'personal',
    subscriber_count: data.subsCount || null,
    url: constructProfileUrl(data.username, platform),
    provider_source: 'nanoinfluencer',
    fetched_at: new Date().toISOString()
  };
}

/**
 * Validate NanoInfluencer configuration
 */
export function validateNanoInfluencerConfig(): boolean {
  // This would check environment variables
  const apiKey = process.env.NANOINFLUENCER_API_KEY;
  if (!apiKey) {
    console.error('NanoInfluencer API key is not configured');
    return false;
  }
  return true;
}