// src/services/profile-refresh/profile-analytics-mapper.ts
// Maps InsightIQ Profile Analytics response to StandardizedProfile format
// Follows the same naming conventions as discovery results and search influencers

import { StandardizedProfile, ContactDetail, CreatorLocation } from '@/types/campaign-influencers';
import { InsightIQProfileAnalyticsResponse, Profile } from '@/types/insightiq/profile-analytics';
import { 
  AudienceDemographics, 
  AudienceLocation, 
  AudienceAgeGroup, 
  GenderDistribution,
  FilterMatch 
} from '@/types/insights-iq';

/**
 * Country code to name mapping for common countries
 */
const COUNTRY_CODE_TO_NAME: Record<string, string> = {
  'PK': 'Pakistan',
  'IN': 'India',
  'AE': 'UAE',
  'SA': 'Saudi Arabia',
  'BD': 'Bangladesh',
  'US': 'United States',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'AU': 'Australia',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
  'BR': 'Brazil',
  'MX': 'Mexico',
  'TR': 'Turkey',
  'ID': 'Indonesia',
  'MY': 'Malaysia',
  'PH': 'Philippines',
  'SG': 'Singapore',
  'JP': 'Japan',
  'KR': 'South Korea',
  'CN': 'China',
  'RU': 'Russia',
  'EG': 'Egypt',
  'NG': 'Nigeria',
  'ZA': 'South Africa',
  'KE': 'Kenya',
  'NL': 'Netherlands',
  'SE': 'Sweden',
  'NO': 'Norway',
  'DK': 'Denmark',
  'FI': 'Finland',
  'PL': 'Poland',
  'AT': 'Austria',
  'CH': 'Switzerland',
  'BE': 'Belgium',
  'PT': 'Portugal',
  'GR': 'Greece',
  'IE': 'Ireland',
  'NZ': 'New Zealand',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'PE': 'Peru',
  'VE': 'Venezuela',
  'TH': 'Thailand',
  'VN': 'Vietnam',
  'QA': 'Qatar',
  'KW': 'Kuwait',
  'BH': 'Bahrain',
  'OM': 'Oman',
  'JO': 'Jordan',
  'LB': 'Lebanon',
  'IL': 'Israel',
  'MA': 'Morocco',
  'TN': 'Tunisia',
  'LK': 'Sri Lanka',
  'NP': 'Nepal',
  'MM': 'Myanmar',
  'AF': 'Afghanistan',
  'IQ': 'Iraq',
  'IR': 'Iran',
};

/**
 * Maps InsightIQ Profile Analytics response to StandardizedProfile format
 */
export function mapInsightIQToStandardizedProfile(
  analyticsResponse: InsightIQProfileAnalyticsResponse,
  platformId: string
): StandardizedProfile {
  const profile = analyticsResponse.profile;
  
  if (!profile) {
    throw new Error('Profile data is missing in analytics response');
  }
  
  // Map creator location
  const creatorLocation = mapCreatorLocation(profile);
  
  // Map contact details
  const contactDetails = mapContactDetails(profile);
  
  // Map audience demographics from profile.audience
  const audienceDemographics = mapAudienceDemographics(profile);
  
  // Extract audience data for filter_match (needed by UI columns)
  const audienceAge = audienceDemographics?.age_distribution || null;
  const audienceGender = audienceDemographics?.gender_distribution || null;
  const audienceLocations = audienceDemographics?.location_distribution || null;
  
  // Map creator age from age_group string (e.g., "25-34")
  const creatorAge = mapCreatorAge(profile.age_group);
  
  // Build the StandardizedProfile with consistent naming
  const standardizedProfile: StandardizedProfile & {
    filter_match?: FilterMatch;
    audience_demographics?: AudienceDemographics;
    audience_locations?: AudienceLocation[];
    audience_age_groups?: AudienceAgeGroup;
  } = {
    // Required fields
    id: profile.external_id,
    username: profile.platform_username,
    name: profile.full_name || profile.platform_username,
    profileImage: profile.image_url || '',
    followers: profile.follower_count || 0,
    isVerified: profile.is_verified || false,
    url: profile.url || '',
    provider_source: 'nanoinfluencer',
    fetched_at: new Date().toISOString(),
    
    // Optional profile fields
    following_count: 0,
    engagementRate: profile.engagement_rate || 0,
    age_group: profile.age_group || null,
    average_likes: profile.average_likes || 0,
    average_views: profile.average_reels_views || null,
    content_count: profile.content_count || null,
    gender: profile.gender || null,
    introduction: profile.introduction || '',
    language: profile.language || '',
    platform_account_type: profile.platform_account_type || 'personal',
    subscriber_count: profile.subscriber_count || null,
    external_id: profile.external_id,
    
    // Location and contacts
    creator_location: creatorLocation,
    contact_details: contactDetails,
    
    // filter_match - MUST include audience data for UI columns!
    filter_match: {
      creator_gender: profile.gender || null,
      creator_language: profile.language || null,
      creator_locations: creatorLocation?.country ? [creatorLocation.country] : null,
      creator_age: creatorAge,
      
      // AUDIENCE DATA - Required for UI columns!
      audience_age: audienceAge,
      audience_gender: audienceGender,
      audience_locations: audienceLocations,
      
      // Other fields
      audience_language: null,
      audience_interests: null,
      brand_sponsors: null,
      creator_brand_affinities: null,
      follower_growth: null,
      subscriber_growth: null,
      creator_interests: null,
      creator_lookalikes: null,
      content_count: profile.content_count || null,
      instagram_options: profile.platform_account_type === 'CREATOR' ? {
        reel_views: profile.average_reels_views || null,
      } : null,
      audience_brand_affinities: null,
      audience_lookalikes: null,
      topic_relevance: null,
      views_growth: null,
      audience_ethnicity: null,
      audience_credibility_score: null,
      share_count: null,
      save_count: null,
    },
    
    // Top-level audience data
    audience_demographics: audienceDemographics,
    audience_locations: audienceLocations || undefined,
    audience_age_groups: audienceAge || undefined,
  };
  
  return standardizedProfile;
}

/**
 * Maps age_group string (e.g., "25-34") to creator_age object
 */
function mapCreatorAge(ageGroup?: string | null): { min: number; max: number } | null {
  if (!ageGroup) return null;
  
  const parts = ageGroup.split('-');
  if (parts.length !== 2) return null;
  
  const min = parseInt(parts[0], 10);
  const max = parseInt(parts[1], 10);
  
  if (isNaN(min) || isNaN(max)) return null;
  
  return { min, max };
}

/**
 * Maps profile location to CreatorLocation format
 */
function mapCreatorLocation(profile: Profile): CreatorLocation | undefined {
  if (!profile.location) {
    return undefined;
  }
  
  return {
    city: profile.location.city || undefined,
    state: profile.location.state || undefined,
    country: profile.location.country || undefined,
  };
}

/**
 * Maps profile contact details to ContactDetail[] format
 */
function mapContactDetails(profile: Profile): ContactDetail[] {
  if (!profile.contact_details || !Array.isArray(profile.contact_details)) {
    return [];
  }
  
  return profile.contact_details.map(contact => ({
    type: contact.type?.toLowerCase() || 'unknown',
    value: contact.value || '',
    contact_type: contact.label || contact.type || 'unknown',
    is_primary: false,
  }));
}

/**
 * Maps InsightIQ audience data to AudienceDemographics format
 * 
 * IMPORTANT: InsightIQ uses profile.audience (not profile.audience_followers)
 */
function mapAudienceDemographics(profile: Profile): AudienceDemographics | undefined {
  // InsightIQ stores audience data in profile.audience
  const audience = (profile as any).audience;
  
  // Pass the influencer's age_group to match audience age distribution
  const ageDistribution = mapAgeDistribution(audience.gender_age_distribution, profile.age_group);
  const locationDistribution = mapLocationDistribution(audience.countries);
  const genderDistribution = mapGenderDistribution(audience.gender_distribution);
  
  return {
    age_distribution: ageDistribution,
    location_distribution: locationDistribution,
    gender_distribution: genderDistribution,
  };
}

/**
 * Maps gender_age_distribution to get the audience percentage for the influencer's age group
 * 
 * The logic:
 * 1. Use the influencer's age_group (e.g., "25-34") as the target range
 * 2. Sum all audience values for that SAME age range (across all genders)
 * 3. Return the percentage of audience in that age bracket
 * 
 * NOTE: InsightIQ values are ALREADY percentages (e.g., 32.549 = 32.55%)
 * Do NOT multiply by 100!
 */
function mapAgeDistribution(
  genderAgeDistribution?: Array<{ gender: string; age_range: string; value: number }>,
  influencerAgeGroup?: string | null
): AudienceAgeGroup | undefined {
  if (!genderAgeDistribution || genderAgeDistribution.length === 0) {
    return undefined;
  }
  
  // If no influencer age group, find the dominant audience age range
  let targetAgeRange = influencerAgeGroup;
  
  if (!targetAgeRange) {
    // Fallback: find the age range with highest total percentage
    const ageRangeMap = new Map<string, number>();
    
    genderAgeDistribution.forEach(item => {
      if (!item.age_range) return;
      const current = ageRangeMap.get(item.age_range) || 0;
      ageRangeMap.set(item.age_range, current + (item.value || 0));
    });
    
    let topValue = 0;
    ageRangeMap.forEach((value, range) => {
      if (value > topValue) {
        topValue = value;
        targetAgeRange = range;
      }
    });
  }
  
  if (!targetAgeRange) {
    return undefined;
  }
  
  // Sum all values for the target age range (across all genders)
  let totalPercentage = 0;
  
  genderAgeDistribution.forEach(item => {
    if (!item.age_range) return;
    
    if (item.age_range === targetAgeRange) {
      totalPercentage += (item.value || 0);
      console.log(`[MAPPER] Adding ${item.gender} ${item.age_range}: ${item.value}`);
    }
  });
  
  if (totalPercentage === 0) {
    return undefined;
  }
  
  // Parse age range (e.g., "25-34")
  const rangeParts = targetAgeRange.split('-');
  const minAge = parseInt(rangeParts[0], 10) || 18;
  const maxAge = parseInt(rangeParts[1], 10) || 44;
  
  // Values are ALREADY percentages - just round, do NOT multiply by 100!
  return {
    min: minAge,
    max: maxAge,
    percentage_value: Math.round(totalPercentage),
  };
}

/**
 * Maps countries data to AudienceLocation[] format
 * Returns ONLY THE TOP country (highest percentage)
 * 
 * NOTE: InsightIQ values are ALREADY percentages (e.g., 62.1508 = 62.15%)
 * Do NOT multiply by 100!
 */
function mapLocationDistribution(
  countries?: Array<{ name?: string; code: string; value: number; id?: string }>
): AudienceLocation[] | undefined {
  if (!countries || countries.length === 0) {
    return undefined;
  }
  
  // Sort by value (percentage) descending and take only the TOP ONE
  const sortedCountries = [...countries].sort((a, b) => (b.value || 0) - (a.value || 0));
  const topCountry = sortedCountries[0];
  
  if (!topCountry) {
    return undefined;
  }
  
  // Map country code to name using our dictionary
  const countryName = topCountry.name || COUNTRY_CODE_TO_NAME[topCountry.code] || topCountry.code;
  
  // Return only ONE location
  // Values are ALREADY percentages - just round, do NOT multiply by 100!
  return [{
    name: countryName,
    location_id: topCountry.id || topCountry.code || undefined,
    percentage_value: Math.round(topCountry.value || 0),
  }];
}

/**
 * Maps gender distribution to GenderDistribution[] format
 * 
 * NOTE: InsightIQ values are ALREADY percentages (e.g., 60.3413 = 60.34%)
 * Do NOT multiply by 100!
 */
function mapGenderDistribution(
  genderDist?: Array<{ gender: string; value: number }>
): GenderDistribution[] | undefined {
  if (!genderDist || genderDist.length === 0) {
    return undefined;
  }
  
  // Values are ALREADY percentages - just round, do NOT multiply by 100!
  return genderDist.map(g => ({
    type: (g.gender?.toUpperCase() || 'UNKNOWN') as 'MALE' | 'FEMALE' | 'UNKNOWN',
    percentage_value: Math.round(g.value || 0),
  }));
}

/**
 * Formats follower count to display string (e.g., "46.1M", "125K")
 */
export function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}