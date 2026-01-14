// src/utils/influencer-mapper.ts

/**
 * Shared Influencer Mapping Utility
 * 
 * V9: Updated to accept InfluencerSearchResults type directly from AI responses
 * 
 * This file provides unified mapping functions for transforming influencer data
 * from various sources (InsightIQ API, AI responses) into the standard format
 * used throughout the application.
 * 
 * Used by:
 * - /api/v0/discover/search/route.ts (manual filters)
 * - DiscoverTab.tsx (AI-discovered influencers)
 */

import { DiscoverInfluencer } from '@/lib/types';
import { Influencer as InsightIQInfluencer, DiscoveredCreatorsResults } from '@/types/insights-iq';
import { InfluencerSearchResults, UnifiedInfluencer } from '@/types/ai';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Raw influencer data from InsightIQ API or AI response's raw_data
 * V9: Updated creator_location to support both string and object formats
 */
export interface RawInfluencerData {
  // Core identifiers
  external_id?: string;
  id?: string;
  platform_username?: string;
  username?: string;
  
  // Display info
  full_name?: string;
  display_name?: string;
  name?: string;
  image_url?: string;
  profile_picture?: string;
  profileImage?: string;
  url?: string;
  profile_url?: string;
  introduction?: string;
  bio?: string;
  
  // Metrics
  follower_count?: number;
  followers?: number;
  engagement_rate?: number;
  engagementRate?: number;
  engagements?: string;
  average_likes?: number;
  average_views?: number | null;
  subscriber_count?: number | null;
  content_count?: number | null;
  
  // Demographics
  is_verified?: boolean;
  isVerified?: boolean;
  age_group?: string | null;
  gender?: string | null;
  language?: string;
  creator_age?: number | string | null;
  age?: number | string | null;
  
  // Location - V9: Support both string and object formats
  creator_location?: {
    city?: string;
    state?: string | null;
    country?: string;
  } | string | null;
  location?: {
    city?: string;
    state?: string | null;
    country?: string;
  } | string | null;
  
  // Contacts
  contact_details?: Array<{ type: string; value: string }>;
  contacts?: Array<{ type: string; value: string }>;
  
  // Platform info
  platform_account_type?: string;
  account_type?: string;
  platform?: string;
  work_platform?: {
    id?: string;
    name?: string;
    logo_url?: string;
  };
  
  // Advanced metrics
  filter_match?: Record<string, any>;
  livestream_metrics?: any;
  instagram_options?: {
    reel_views?: number | { min: number; max: number };
  };
  average_reel_views?: number;
  
  // Audience data
  audience_locations?: any[];
  audience_age_groups?: any[];
  audience_age_distribution?: any[];
  audience_location_distribution?: any[];
  audience_gender_distribution?: any[];
  demographic_data?: {
    audience_locations?: any[];
    audience_age?: any;
    audience_gender?: any[];
  };
  
  // AI response specific - contains InsightIQ-like structure
  raw_data?: RawInfluencerData;
}

/**
 * Normalized influencer format used by the discover API and components
 * This matches the format returned by /api/v0/discover/search
 */
export interface NormalizedInfluencer {
  id: string;
  username: string;
  name: string;
  profileImage: string;
  followers: number;
  engagements: string;
  engagementRate: number;
  isVerified: boolean;
  age_group: string | null;
  average_likes: number;
  average_views: number | null;
  contact_details: Array<{ type: string; value: string }>;
  content_count: number | null;
  creator_location: {
    city: string;
    state: string | null;
    country: string;
  } | null;
  external_id: string;
  gender: string | null;
  introduction: string;
  language: string;
  livestream_metrics: any;
  platform_account_type: string;
  subscriber_count: number | null;
  url: string;
  filter_match: Record<string, any> | null;
  creator_age: number | string | null;
  audience_locations: any[];
  audience_age_groups: any[];
  audience_demographics: {
    age_distribution: any[];
    location_distribution: any[];
    gender_distribution: any[];
  };
  instagram_options: {
    reel_views: number | null;
  };
  work_platform: {
    id: string;
    name: string;
    logo_url: string;
  };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normalizes location data which can be either a string or an object
 * V9: Handle both formats from different API sources
 */
function normalizeLocation(location: any): { city: string; state: string | null; country: string } | null {
  if (!location) return null;
  
  // If it's a string, try to parse it as country name
  if (typeof location === 'string') {
    return {
      city: '',
      state: null,
      country: location,
    };
  }
  
  // If it's an object, extract fields
  if (typeof location === 'object') {
    return {
      city: location.city || '',
      state: location.state || null,
      country: location.country || '',
    };
  }
  
  return null;
}

// =============================================================================
// MAPPING FUNCTIONS
// =============================================================================

/**
 * Maps raw influencer data (from InsightIQ API or AI response) to normalized format.
 * This is the single source of truth for influencer data transformation.
 * 
 * @param item - Raw influencer data from any source
 * @returns Normalized influencer object matching the discover API format
 */
export function mapToNormalizedInfluencer(item: RawInfluencerData): NormalizedInfluencer {
  // If item has raw_data (AI response format), use that as the primary source
  const source = item;
  
  // Extract location - check multiple possible sources and normalize
  const location = normalizeLocation(source.creator_location) || 
                   normalizeLocation(item.location) || 
                   null;
  
  // Extract contacts - check multiple possible sources
  const contacts = source.contact_details || item.contacts || [];
  
  // Extract work platform with defaults
  const workPlatform = source.work_platform || {
    id: '9bb8913b-ddd9-430b-a66a-d74d846e6c66',
    name: 'Instagram',
    logo_url: 'https://cdn.insightiq.ai/platforms_logo/logos/logo_instagram.png',
  };

  return {
    // Core identifiers
    id: source.external_id || item.id || '',
    external_id: source.external_id || item.id || '',
    username: source.platform_username || item.username || '',
    
    // Display info
    name: source.full_name || item.display_name || item.name || '',
    profileImage: source.image_url || item.profile_picture || item.profileImage || '',
    url: source.url || item.profile_url || '',
    introduction: source.introduction || item.bio || '',
    
    // Metrics
    followers: source.follower_count || item.follower_count || item.followers || 0,
    engagements: source.engagements || item.engagements || '',
    engagementRate: source.engagement_rate || item.engagement_rate || item.engagementRate || 0,
    average_likes: source.average_likes || item.average_likes || 0,
    average_views: source.average_views ?? item.average_views ?? null,
    subscriber_count: source.subscriber_count ?? item.subscriber_count ?? null,
    content_count: source.content_count ?? item.content_count ?? null,
    
    // Demographics
    isVerified: source.is_verified ?? item.is_verified ?? item.isVerified ?? false,
    age_group: source.age_group || item.age_group || null,
    gender: source.gender || item.gender || null,
    language: source.language || item.language || 'en',
    creator_age: source.creator_age || source.age || item.creator_age || item.age || null,
    
    // Location - V9: Use normalized location
    creator_location: location,
    
    // Contacts
    contact_details: contacts.map((c: any) => ({
      type: c.type || '',
      value: c.value || '',
    })),
    
    // Platform info
    platform_account_type: source.platform_account_type || item.account_type || 'CREATOR',
    work_platform: {
      id: workPlatform.id || '',
      name: workPlatform.name || 'Instagram',
      logo_url: workPlatform.logo_url || '',
    },
    
    // Advanced metrics
    filter_match: source.filter_match || item.filter_match || null,
    livestream_metrics: source.livestream_metrics || item.livestream_metrics || null,
    
    // Instagram-specific options
    instagram_options: {
      reel_views: source.instagram_options?.reel_views ||
                  item.instagram_options?.reel_views ||
                  source.filter_match?.instagram_options?.reel_views ||
                  item.filter_match?.instagram_options?.reel_views ||
                  source.average_reel_views ||
                  item.average_reel_views ||
                  null,
    },
    
    // Audience data
    audience_locations: source.audience_locations ||
                       item.audience_locations ||
                       source.filter_match?.audience_locations ||
                       item.filter_match?.audience_locations ||
                       source.demographic_data?.audience_locations ||
                       item.demographic_data?.audience_locations ||
                       [],
    audience_age_groups: source.audience_age_groups ||
                        item.audience_age_groups ||
                        source.filter_match?.audience_age ||
                        item.filter_match?.audience_age ||
                        source.demographic_data?.audience_age ||
                        item.demographic_data?.audience_age ||
                        [],
    audience_demographics: {
      age_distribution: source.audience_age_distribution ||
                       item.audience_age_distribution ||
                       source.filter_match?.audience_age ||
                       item.filter_match?.audience_age ||
                       [],
      location_distribution: source.audience_location_distribution ||
                            item.audience_location_distribution ||
                            source.filter_match?.audience_locations ||
                            item.filter_match?.audience_locations ||
                            [],
      gender_distribution: source.audience_gender_distribution ||
                          item.audience_gender_distribution ||
                          source.filter_match?.audience_gender ||
                          item.filter_match?.audience_gender ||
                          [],
    },
  };
}

/**
 * Maps an array of raw influencers to normalized format.
 * 
 * @param items - Array of raw influencer data
 * @returns Array of normalized influencer objects
 */
export function mapInfluencersToNormalized(items: RawInfluencerData[]): NormalizedInfluencer[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  return items.map(mapToNormalizedInfluencer);
}

/**
 * Maps normalized influencer to DiscoverInfluencer format (for list display).
 * This is used by the DiscoverTab component for the influencer list.
 * 
 * @param influencer - Normalized influencer object
 * @returns DiscoverInfluencer object for list display
 */
export function mapToDiscoverInfluencer(influencer: NormalizedInfluencer): DiscoverInfluencer {
  return {
    id: influencer.id || influencer.external_id || '',
    username: influencer.username || '',
    name: influencer.name || '',
    profileImage: influencer.profileImage || '',
    followers: String(influencer.followers || 0),
    engagements: influencer.engagements || '',
    engagementRate: influencer.engagementRate 
      ? `${(influencer.engagementRate * 100).toFixed(2)}%` 
      : '0%',
    avgLikes: influencer.average_likes || 0,
    avg_comments: 0,
    platform: influencer.work_platform?.name?.toLowerCase() || 'instagram',
    status: 'active',
    engagement_rate: influencer.engagementRate || 0,
    isVerified: influencer.isVerified || false,
    isOnPlatform: false,
    match: {
      gender: influencer.gender || '',
      country: influencer.creator_location?.country || '',
    },
    contact_attempts: 0,
    next_contact_at: null,
    collaboration_price: null,
    last_contacted_at: null,
    onboarded_at: null,
    responded_at: null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Maps normalized influencers to DiscoverInfluencer format.
 * 
 * @param influencers - Array of normalized influencers
 * @returns Array of DiscoverInfluencer objects
 */
export function mapToDiscoverInfluencers(influencers: NormalizedInfluencer[]): DiscoverInfluencer[] {
  if (!influencers || !Array.isArray(influencers)) {
    return [];
  }
  return influencers.map(mapToDiscoverInfluencer);
}

/**
 * Creates a DiscoveredCreatorsResults object from normalized influencers.
 * This matches the format expected by DiscoveredInfluencers component.
 * 
 * @param influencers - Array of normalized influencers
 * @param metadata - Pagination metadata
 * @returns DiscoveredCreatorsResults object
 */
export function createDiscoveredCreatorsResults(
  influencers: NormalizedInfluencer[],
  metadata: {
    offset?: number;
    limit?: number;
    total_results?: number;
  } = {}
): DiscoveredCreatorsResults {
  return {
    influencers: influencers as unknown as InsightIQInfluencer[],
    metadata: {
      offset: metadata.offset || 0,
      limit: metadata.limit || influencers.length,
      total_results: metadata.total_results || influencers.length,
    },
  };
}

// =============================================================================
// AI RESPONSE HELPERS
// =============================================================================

/**
 * Processes AI search results and returns data in the same format as manual filters.
 * This ensures consistent data structure regardless of the source.
 * 
 * V9: Updated to accept InfluencerSearchResults type directly (no type casting needed)
 * 
 * @param aiSearchResults - The search_results object from AI response
 * @returns Object with influencers and metadata matching manual filter response
 */
export function processAISearchResults(aiSearchResults: InfluencerSearchResults): {
  influencers: NormalizedInfluencer[];
  discoverInfluencers: DiscoverInfluencer[];
  discoveredCreatorsResults: DiscoveredCreatorsResults;
  totalResults: number;
} {
  // V9: Cast to RawInfluencerData[] - UnifiedInfluencer is now compatible
  const rawInfluencers = aiSearchResults.influencers as unknown as RawInfluencerData[];
  
  // Map AI influencers to normalized format (same as route.ts does)
  const normalizedInfluencers = mapInfluencersToNormalized(rawInfluencers);
  
  // Map to DiscoverInfluencer format for list display
  const discoverInfluencers = mapToDiscoverInfluencers(normalizedInfluencers);
  
  // Create DiscoveredCreatorsResults for detailed view
  const discoveredCreatorsResults = createDiscoveredCreatorsResults(
    normalizedInfluencers,
    {
      offset: aiSearchResults.offset || aiSearchResults.metadata?.offset || 0,
      limit: aiSearchResults.limit || aiSearchResults.metadata?.limit || normalizedInfluencers.length,
      total_results: aiSearchResults.total_count || aiSearchResults.metadata?.total_results || normalizedInfluencers.length,
    }
  );
  
  return {
    influencers: normalizedInfluencers,
    discoverInfluencers,
    discoveredCreatorsResults,
    totalResults: aiSearchResults.total_count || aiSearchResults.metadata?.total_results || normalizedInfluencers.length,
  };
}