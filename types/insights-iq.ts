//src/types/insights-iq.ts

// Contact details type
export interface ContactDetail {
  type: string;
  value: string;
}

// Work platform type
export interface WorkPlatform {
  id: string;
  name: string;
  logo_url: string;
}

// Creator location interface
export interface CreatorLocation {
  city?: string;
  state?: string | null;
  country?: string;
}

// NEW: Audience location interface
export interface AudienceLocation {
  name?: string;
  country?: string;
  location_id?: string;
  percentage_value?: number | null;
  percentage?: number;
  weight?: number;
}

// NEW: Audience age group interface - flexible to handle both object and array structures
export interface AudienceAgeGroup {
  age_range?: string;
  range?: string;
  min?: number;
  max?: number;
  percentage_value?: number;
  percentage?: number;
  weight?: number;
}

// NEW: Gender distribution interface
export interface GenderDistribution {
  type: string;
  percentage_value: number;
}

// NEW: Audience demographics interface
export interface AudienceDemographics {
  age_distribution?: AudienceAgeGroup | AudienceAgeGroup[];
  location_distribution?: AudienceLocation[];
  gender_distribution?: GenderDistribution[];
}

// NEW: Enhanced filter match interface with flexible types
export interface FilterMatch {
  brand_sponsors?: any;
  creator_age?: any; // Can be object with min/max or other formats
  creator_brand_affinities?: any;
  follower_growth?: any;
  subscriber_growth?: any;
  creator_gender?: string;
  creator_interests?: any;
  creator_language?: any;
  creator_locations?: string[];
  creator_lookalikes?: any;
  content_count?: any;
  instagram_options?: {
    reel_views?: number | { min: number; max: number };
  };
  audience_age?: any; // Can be object with min/max or array
  audience_gender?: GenderDistribution[];
  audience_brand_affinities?: any;
  audience_interests?: any;
  audience_language?: any;
  audience_locations?: AudienceLocation[];
  audience_lookalikes?: any;
  topic_relevance?: any;
  views_growth?: any;
  audience_ethnicity?: any;
  audience_credibility_score?: any;
  share_count?: any;
  save_count?: any;
}

// NEW: Instagram options interface
export interface InstagramOptions {
  reel_views?: number | { min: number; max: number };
}

// NEW: Additional metrics interface
export interface AdditionalMetrics {
  average_reel_views?: number;
  reel_views?: number;
  audience_insights?: AudienceDemographics;
  creator_demographics?: {
    age?: number | string;
    age_group?: string;
  };
}

// ENHANCED: Main influencer type with new demographic fields
export interface Influencer {
  // Existing fields
  id: string | null;
  username: string;
  name: string;
  age_group: string | null;
  average_likes: number;
  average_views: number | null;
  contact_details: ContactDetail[];
  content_count: number | null;
  engagementRate: number; // Changed from string to number for better handling
  engagements: string;
  external_id: string | null;
  followers: number; // Changed from string to number for better handling
  following?: number;
  following_count?: number;
  gender: string | null;
  introduction: string;
  isVerified: boolean;
  language: string;
  livestream_metrics: any | null;
  platform_account_type: string;
  profileImage: string;
  subscriber_count: number | null;
  url: string;
  work_platform: WorkPlatform;

  // NEW: Enhanced demographic fields
  creator_age?: number | string | null;
  creator_location?: CreatorLocation;
  audience_locations?: AudienceLocation[];
  audience_age_groups?: any; // Flexible type to handle different structures
  audience_demographics?: AudienceDemographics;
  category?: string; // New field for category
  // NEW: Enhanced reel views fields
  reel_views?: number;
  average_reel_views?: number;
  
  // NEW: Enhanced filter match data
  filter_match?: FilterMatch;
  
  // NEW: Instagram-specific options
  instagram_options?: InstagramOptions;
  
  // NEW: Additional demographic data source
  demographic_data?: {
    audience_locations?: AudienceLocation[];
    audience_age?: any;
    audience_gender?: GenderDistribution[];
  };
  
  // NEW: Enhanced additional metrics for storing complete data
  additional_metrics?: AdditionalMetrics;
  // Import metadata for CSV imported data (budget, etc.)
  import_metadata?: {
    budget?: Array<{
      currency: string;
      price: number;
    }>;
  };
}



// Metadata type for pagination/search results
export interface Metadata {
  limit: number;
  offset: number;
  total_results: number;
}

// Main wrapper type for discovered creators results
export interface DiscoveredCreatorsResults {
  influencers: Influencer[];
  metadata: Metadata;
}