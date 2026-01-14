// src/services/influencers/influencers.types.ts
//Example types, please replace with real ones
export interface Influencer {
    id: string;
    username: string;
    full_name: string;
    bio: string | null;
    profile_image_url: string | null;
    followers_count: number;
    following_count: number;
    engagement_rate: number;
    platform: 'instagram' | 'tiktok' | 'youtube' | 'twitter';
    created_at: string;
    updated_at: string;
  }
  
  export interface InfluencerAnalytics {
    id: string;
    influencer_id: string;
    followers_growth: {
      date: string;
      count: number;
    }[];
    engagement_trend: {
      date: string;
      rate: number;
    }[];
    content_performance: {
      id: string;
      url: string;
      likes: number;
      comments: number;
      shares: number;
      impressions: number;
      published_at: string;
    }[];
  }
  
  export interface InfluencerSearchParams {
    platform?: string;
    category?: string;
    min_followers?: number;
    max_followers?: number;
    min_engagement?: number;
    location?: string;
    query?: string;
    page?: number;
    limit?: number;
  }
  
  export interface InfluencerListResponse {
    items: Influencer[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
  }