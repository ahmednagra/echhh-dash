// For discovered influencers (3rd party API)
export interface DiscoverInfluencer {
  id: string;
  username: string;
  name: string;
  profileImage?: string;
  followers: string;
  engagements: string;
  engagementRate: string;
  avgLikes: number;
  avg_comments: number;
  platform: string
  status: string;
  engagement_rate: number;
  isVerified: boolean;
  isOnPlatform: boolean;
  match: {
    gender: string;
    country: string;
  };
  contact_attempts: number;
  next_contact_at?: string | null;
  collaboration_price?: number | null;
  last_contacted_at?: string | null;
  onboarded_at?: string | null;
  responded_at?: string | null;
  updated_at: string;
}

export interface DiscoverApiResponse {
  influencers: DiscoverInfluencer[];
  totalResults: number;
}
  
  // For platform-registered influencers
  export interface PlatformInfluencer {
    id: string; // Our internal ID
    username: string;
    name: string;
    email: string;
    // ... other platform-specific fields
  }


  export interface DiscoverSearchParams {
    audience_source: string;
    sort: {
      field: string;
      direction: 'asc' | 'desc';
    };
    filter: {
      audience_source: string; // 👈 Move it inside here
      ads_brands: string[];
      age: {
        left_number: string;
        right_number: string;
      };
      niches?: string[];
      account_type?: string[];
      with_contact?: string[];
      audience_age: string[];
      audience_brand: string[];
      audience_brand_category: string[];
      // audience_gender: {
      //   code: string;
      //   weight: number;
      // };
      hashtags?: string[];
      languages?: string[];
      audience_geo: Array<{
        id: number;
        weight: number;
      }>;
      audience_lang: Record<string, unknown>;
      audience_race: {
        code: string;
        weight: number;
      };
      brand: string[];
      brand_category: string[];
      engagement_rate: {
        operator: string;
        value: number | null;
      };
      engagements: {
        left_number: string;
        right_number: string;
      };
      followers: {
        left_number: string;
        right_number: string;
        growth_period?: string; // e.g. "3 months"
        growth_rate?: string;   // e.g. ">10%"
      };
      reels_plays: {
        left_number: string;
        right_number: string;
      };
      gender: {
        code: string;
        weight: number;
      };
      geo: Array<{
        id: number;
        weight: number;
      }>;
      keywords: string;
      lang: Record<string, unknown>;
      last_posted: string | null;
      relevance: {
        value: string;
        weight: string;
      };
      text: string;
      views: {
        left_number: string;
        right_number: string;
      };
      saves: {
        left_number: string;
        right_number: string;
      };
      shares: {
        left_number: string;
        right_number: string;
      };
    };
    paging: {
      skip: number;
      limit: number;
    };
    n: number,
  }

//---------------------------------------New-----------------------------------------
// Updated Location interface to support string IDs and match API response
export interface Location {
  id: string; // UUID from API
  name: string;
  display_name?: string; // Optional display name from API
  type?: 'CITY' | 'COUNTRY' | 'STATE' | 'REGION'; // Match API type values
}

// Updated GeoLocation interface for filter usage
export interface GeoLocation {
  id: string; // Changed from number to string (UUID)
  weight: number;
}

// Creator location selection interface
export interface CreatorLocationSelection {
  id: string;
  name: string;
  display_name?: string;
  type?: 'CITY' | 'COUNTRY' | 'STATE' | 'REGION';
}

// API response interface for locations
export interface LocationSearchResponse {
  success: boolean;
  data: Location[];
  meta?: {
    search_string: string;
    limit: number;
    offset: number;
    count: number;
    total?: number;
  };
  error?: {
    type: string;
    code: string;
    message: string;
    status_code: number;
  };
}

