// src/types/insightiq/profile-analytics.ts

export interface WorkPlatform {
  id: string;
  name: string;
  logo_url: string;
};
  

export interface Profile {
  external_id: string;
  platform_username: string;
  url: string;
  image_url: string;
  full_name: string;
  introduction: string;
  content_count: number;
  sponsored_posts_performance: any;
  is_verified: boolean;
  platform_account_type: string;
  gender: string;
  age_group: string;
  language: string;
  follower_count: number;
  subscriber_count: number | null;
  average_likes: number;
  average_dislikes: number | null;
  average_comments: number;
  average_views: number | null;
  average_reels_views: number;
  engagement_rate: number;
  reputation_history: Array<{
    month: string;
    follower_count: number;
    subscriber_count: number | null;
    following_count: number;
    average_likes: number;
    total_views: number | null;
    average_views: number | null;
    average_comments: number | null;
    total_likes: number | null;
  }>;
  location: {
    city: string | null;
    state: string | null;
    country: string | null;
  };
  top_hashtags: Array<{
    name: string;
    value: number;
  }>;
  top_mentions: Array<{
    name: string;
    value: number;
  }>;
  top_interests: Array<{
    name: string;
  }>;
  top_contents: Array<{
    type: string;
    url: string;
    title: string | null;
    description: string;
    thumbnail_url: string;
    engagement: {
      like_count: number;
      comment_count: number;
      view_count: number | null;
      play_count: number | null;
      share_count: number;
      save_count: number | null;
    };
    mentions: Array<{
      name: string;
    }> | null;
    published_at: string;
  }>;
  recent_contents: Array<{
    type: string;
    url: string;
    title: string | null;
    description: string;
    thumbnail_url: string | null;
    engagement: {
      like_count: number | null;
      comment_count: number;
      view_count: number | null;
      play_count: number | null;
      share_count: number | null;
      save_count: number | null;
    };
    mentions: Array<{
      name: string;
    }> | null;
    published_at: string;
  }>;
  sponsored_contents: any[];
  contact_details: Array<{
    type: string;
    value: string;
    label: string;
    verified: boolean | null;
  }>;
  report_generated_at: string;
  updated_at: string;
  engagement_rate_histogram: Array<{
    min: number | null;
    max: number;
    total_profile_count: number;
    is_median: string | null;
  }>;
  posts_hidden_likes_percentage_value: number;
  livestream_metrics: any;
  brand_affinity: any[];
  lookalikes: Array<{
    external_id: string;
    platform_username: string;
    url: string;
    image_url: string;
    follower_count: number;
    subscriber_count: number | null;
    is_verified: boolean;
  }>;
  audience: {
    countries: Array<{
      code: string;
      value: number;
    }>;
    states: Array<{
      name: string;
      value: number;
    }>;
    cities: Array<{
      name: string;
      value: number;
      latitude: number;
      longitude: number;
    }>;
    gender_age_distribution: Array<{
      gender: string;
      age_range: string;
      value: number;
    }>;
    ethnicities: Array<{
      name: string;
      value: number;
    }>;
    languages: Array<{
      code: string;
      value: number;
    }>;
    brand_affinity: Array<{
      name: string;
      value: number;
      id: string;
    }>;
    interests: Array<{
      name: string;
      value: number;
    }>;
    follower_types: Array<{
      name: string;
      value: number;
    }>;
    credibility_score: number;
    gender_distribution: Array<{
      gender: string;
      value: number;
    }>;
    lookalikes: Array<{
      external_id: string;
      platform_username: string;
      url: string;
      image_url: string;
      follower_count: number;
      subscriber_count: number | null;
      is_verified: boolean;
    }>;
    significant_followers_percentage: number;
    significant_followers: Array<{
      external_id: string;
      platform_username: string;
      url: string;
      image_url: string;
      follower_count: number;
      subscriber_count: number | null;
      is_verified: boolean;
    }>;
    credibility_score_band: Array<{
      min: number | null;
      max: number;
      total_profile_count: number;
    }>;
    follower_reachability: Array<{
      following_range: string;
      value: number;
    }>;
  };
  audience_likers: {
    countries: any;
    states: any;
    cities: any;
    gender_age_distribution: any;
    ethnicities: any;
    languages: any[];
    brand_affinity: any;
    interests: any;
    follower_types: any;
    credibility_score: any;
    gender_distribution: any;
    significant_likers_percentage: any;
    significant_likers: any;
    likers_not_followers_percentage: any;
    credibility_score_band: any;
  };
  audience_commenters: {
    countries: any;
    states: any;
    cities: any;
    gender_age_distribution: any;
    ethnicities: any;
    languages: any[];
    brand_affinity: any;
    interests: any;
    follower_types: any;
    credibility_score: any;
    gender_distribution: any;
    significant_commenters_percentage: any;
    significant_commenters: any;
  };
}

export interface Pricing {
  currency: string;
  post_type: {
    reels: {
      price_range: {
        min: number;
        max: number;
      };
    };
    story: {
      price_range: {
        min: number;
        max: number;
      };
    };
    static_post: {
      price_range: {
        min: number;
        max: number;
      };
    };
    carousel: {
      price_range: {
        min: number;
        max: number;
      };
    };
  };
};
  
export interface PriceExplanations {
  engagement: {
    level: string;
    description: string;
  };
  follower_level: {
    level: string;
    description: string;
  };
  audience_location: {
    level: string;
    description: string;
  };
  audience_credibility: {
    level: string;
    description: string;
  };
};
  
// Response from InsightIQ API
export interface InsightIQProfileAnalyticsResponse {
  id: string;
  work_platform: WorkPlatform | null;
  profile: Profile  | null;
  pricing: Pricing  | null;
  price_explanations: PriceExplanations | null;
  is_part_of_creator_list: boolean;
}