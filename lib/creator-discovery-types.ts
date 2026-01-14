// src/lib/creator-discovery-types.ts

// Search Filter Types for Influencer Discovery API

// Enums for specific values
export type CreatorGenderType = 'ANY' | 'FEMALE' | 'GENDER_NEUTRAL' | 'MALE' | 'ORGANIZATION' | 'MALE_OR_FEMALE';
export type AudienceGenderType = 'MALE' | 'FEMALE' | 'ANY';
export type ComparisonOperator = 'GT';
export type AccountType = 'ANY' | 'PERSONAL' | 'BUSINESS' | 'CREATOR';
export type AudienceCredibilityCategory = 'BAD' | 'LOW' | 'NORMAL' | 'HIGH' | 'EXCELLENT';
export type CreatorAgeBracket = 'OVER_18' | 'OVER_21';
export type Operator = 'GT' | 'LT';
export type IntervalUnit = 'Month';
export type PlatformAccountType = 'ANY' | 'BUSINESS' | 'CREATOR' | 'PERSONAL' | 'PARTNERS' | 'AFFILIATES' | 'NULL';

export type SortField = 
    | 'AVERAGE_LIKES'
    | 'FOLLOWER_COUNT'
    | 'ENGAGEMENT_RATE'
    | 'DESCRIPTION'
    | 'AVERAGE_VIEWS'
    | 'CONTENT_COUNT'
    | 'REELS_VIEWS'
    | 'FOLLOWER_GROWTH'
    | 'TOTAL_VIEWS_GROWTH'
    | 'TOTAL_LIKES_GROWTH'
    | 'AUDIENCE_LOCATIONS'
    | 'AUDIENCE_LANGUAGE'
    | 'AUDIENCE_BRAND_AFFINITIES'
    | 'AUDIENCE_INTERESTS'
    | 'AUDIENCE_AGE'
    | 'CREATOR_LOOKALIKES'
    | 'AUDIENCE_LOOKALIKES'
    | 'AVERAGE_LIKE'
    | 'AUDIENCE_LOCATION'
    | 'TOPIC_RELEVANCE'
    | 'PEAK_VIEWERS'
    | 'AVG_CONCURRENT_VIEWERS'
    | 'AIRTIME'
    | 'HOURS_WATCHED';

export type SortOrder = 'DESCENDING' | 'ASCENDING';
export type AudienceSource = 'ANY' | 'LIKERS' | 'FOLLOWERS' | 'COMMENTERS';
export type PostType = 'ALL' | 'VIDEOS' | 'SHORTS' | 'STREAMS';

// Contact detail types
export type ContactDetailType = 
    | 'BBM'
    | 'EMAIL'
    | 'FACEBOOK'
    | 'INSTAGRAM'
    | 'ITUNES'
    | 'KAKAO'
    | 'KIK'
    | 'LINED'
    | 'LINKTREE'
    | 'PHONE'
    | 'PINTEREST'
    | 'SARAHAH'
    | 'SAYAT'
    | 'SKYPE'
    | 'SNAPCHAT'
    | 'TELEGRAM'
    | 'TIKTOK'
    | 'TUMBLR'
    | 'TWITCHTV'
    | 'TWITTER'
    | 'VIBER'
    | 'VK'
    | 'WECHAT'
    | 'WEIBO'
    | 'WHATSAPP'
    | 'YOUTUBE';

// Contact preference types
export type ContactPreference = 'MUST_HAVE' | 'SHOULD_HAVE';

// Range interface for numeric values
export interface NumericRange {
  min: number;
  max: number;
}

// Audience gender filter with operator and percentage
export interface AudienceGenderFilter {
  type: AudienceGenderType;
  operator: ComparisonOperator;
  percentage_value: number;
}

// Sort configuration
export interface SortConfiguration {
  field: SortField;
  order: SortOrder;
}

// Audience age filter
export interface AudienceAgeFilter {
    min: number; // Minimum age of audience
    max: number; // Maximum age of audience
    percentage_value: number; // Filter by percentage of audience in the given age range
}

// Specific contact details filter
export interface SpecificContactDetail {
    type: ContactDetailType;
    preference: ContactPreference;
}

// Audience language filter
export interface AudienceLanguageFilter {
    code: string; // 2 letter language code as per ISO 639-1
    percentage_value: string; // Percentage value for the comparison, "greater than or equal to" comparison
}

// Creator language filter
export interface CreatorLanguageFilter {
    code: string; // 2 letter language code as per ISO 639-1
}

// Audience interest affinities filter
export interface AudienceInterestAffinity {
    value: string; // Name of the interest
    operation: string; // Name of the operation (GT)
    percentage_value: number; // Percentage value
}

// Engagement rate filter
export interface EngagementRate {
    //Percentage value for the comparison, which would always be a "greater than or equal to" comparison
    percentage_value: string;
}

// Instagram reel views filter
export interface ReelViewsFilter {
    min: number; // Minimum average reels views of creator
    max: number; // Maximum average reels views of creator
}

// Audience locations filter
export interface AudienceLocationsFilter {
    location_id: string; // InsightIQ's location identifier
    percentage_value: number; // Percentage value for the comparison
    operator?: string; // Comparison operator (GT)
}


export interface ViewsGrowth {
    operator: Operator; // Comparison operator (GT)
    interval_unit: IntervalUnit;
    interval: number; 
    percentage_value: number;
}

// Instagram options container
export interface InstagramOptions {
    reel_views?: ReelViewsFilter;
}

// Follower growth filter
export interface FollowerGrowthFilter {
    interval: number; // Time interval of growth (required)
    interval_unit: string; // Unit of time interval (MONTH) (required)
    operator: string; // Comparison operator (GT) (required)
    percentage_value: number; // Percentage value for the comparison (required)
}

// Subscriber growth filter
export interface SubscriberGrowthFilter {
    interval: number; // Time interval of growth (required)
    interval_unit: string; // Unit of time interval (MONTH) (required)
    operator: string; // Comparison operator (GT) (required)
    percentage_value: number; // Percentage value for the comparison (required)
}

// Hashtags filter
export interface HashtagFilter {
    name: string; // Hashtag name without # prefix (required)
}

// Mentions filter
export interface MentionFilter {
    name: string; // Mention name without @ prefix (required)
}

// Topic relevance filter
export interface TopicRelevanceFilter {
    name: string[]; // Array of topic names
    weight: number; // Weight value (default: 0.5)
    threshold: number; // Threshold value (default: 0.55)
}

// Main search filter interface
export interface InfluencerSearchFilter {
  // Target platform to search public profiles on  
  work_platform_id?: string;

  // Filter profiles by follower count
  follower_count?: NumericRange;

  // Filter profiles by subscriber count
  subscriber_count?: NumericRange;

  // Filter profiles by content count
  content_count?: NumericRange;
  
  // Filter profiles by audience gender
  audience_gender?: AudienceGenderFilter; 

  // Filter profiles on the basis of the gender of the creator. ORGANIZATION is only valid for Twitch platform
  creator_gender?: CreatorGenderType; 

  // Filter profiles by audience age
  audience_age?: AudienceAgeFilter;

  // Filter profiles by creator age
  creator_age?: NumericRange;

  // Filter profiles by a list of keywords that can be found in profile
  // bio/introduction/description/phrases in the video or captions for YouTube.
  description_keywords?: string;

  // Filter profiles by platform verification status
  is_verified?: boolean;

  // Filter profiles by availability of contact details
  has_contact_details?: boolean;

  // Filter profiles by specific contact details with preference
  specific_contact_details?: SpecificContactDetail[];

  // Filter profiles by audience's language
  audience_language?: AudienceLanguageFilter[];

  // Filter profiles by creator's language
  creator_language?: CreatorLanguageFilter;

  // Filter profiles by audience interests (list of interest names)
  // Only for Instagram. Returns creators whose audience match even 1 of these interests
  audience_interests?: string[];

  // Filter profiles by audience interest affinities with percentage values
  audience_interest_affinities?: AudienceInterestAffinity[];

  // Filter profiles by creator interests (list of interest names)
  // Only for Instagram. Returns creators whose audience match even 1 of these interests
  creator_interests?: string[];

  // Filter profiles by audience brand affinities (list of brand names)
  // Only for Instagram
  audience_brand_affinities?: string[];

  // Filter profiles by creator brand affinities (list of brand names)
  // Only for Instagram
  creator_brand_affinities?: string[];

  //Filter profiles by average likes
  average_likes?: NumericRange; 

  //Filter profiles by average views
  average_views?: NumericRange;

  //Filter profiles by engagement rates
  engagement_rate?: EngagementRate;

  //Filter profiles which have sponsored posts. Only for Instagram.
  has_sponsored_posts?: boolean;

  //Filter profiles which have been sponsored by certain brands, 
  //which will return creators who match even 1 of these brands. Only for Instagram.
  brand_sponsors?: string[];

  // Instagram-specific options
  instagram_options?: InstagramOptions;

  // Filter profiles by audience locations with percentage and operator
  audience_locations?: AudienceLocationsFilter[];

  // Filter profiles by follower growth rate
  follower_growth?: FollowerGrowthFilter;

  // Filter profiles by subscriber growth rate
  subscriber_growth?: SubscriberGrowthFilter;

  // Filter profiles by the phrase they use in their bio
  bio_phrase?: string;

  // Filter profiles by hashtags
  hashtags?: HashtagFilter[];

  // Filter profiles by mentions
  mentions?: MentionFilter[];

  // Filter profiles by topic relevance
  topic_relevance?: TopicRelevanceFilter;

  // Filter profiles whose posts look like the given handle/username (without @)
  audience_lookalikes?: string;

  // Filter profiles by platform account type
  platform_account_type?: PlatformAccountType;

  // Filter profiles by creator account type (array of AccountType)
  creator_account_type?: AccountType[];

  // Filter profiles whose posts look like the given handle/username (without @)
  creator_lookalikes?: string;

  // Filter profiles by the timestamp (ISO 8601) of last post
  // Example: "2019-08-24T14:15:22"
  last_post_timestamp?: string;

  // Filter profiles by creator locations (InsightIQ's location identifiers)
  creator_locations?: string[];
  
  // Sort configuration
  sort_by?: SortConfiguration;
  
  // The number of search results to be returned. 
  // It can be between 1 to 100. The default value is 10. 
  // Limit + offset should be less than 500.
  limit?: number;
  
  // The number of search results to skip. Use this argument for pagination. 
  // The default value is 0. Limit + offset should be less than 500.
  offset?: number;
  
  // Audience source for filtering
  audience_source?: AudienceSource;
  
  // Filter profiles by total number of engagements
  total_engagements?: NumericRange;

  // Filter profiles according to the given credibility categories given
  audience_credibility_category?: AudienceCredibilityCategory;

  // Filter profiles according to the given credibility score or higher
  // >= 0, <= 1
  audience_credibility_score?: number;

  // Filter YouTube profiles which are official artists
  // Default:false
  is_official_artist?: boolean;

  // Fetches only profiles with audience info
  has_audience_info?: boolean;

  // Filter TikTok profiles by count of shares
  share_count?: NumericRange;

  // Filter TikTok profiles by count of saves
  save_count?: NumericRange;

  //Filter to exclude private profiles
  //Default:false
  exclude_private_profiles?: boolean;

  // Only for Twitch
  creator_age_bracket?: CreatorAgeBracket;

  // This filter is only applicable to YouTube. For other platforms, it will be ignored.
  post_type?: PostType;

  // Filter profiles by views growth rate
  views_growth?: ViewsGrowth;

}
