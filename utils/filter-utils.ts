// src/utils/filter-utils.ts
import {
  InfluencerSearchFilter,
  NumericRange,
  AudienceGenderFilter,
  AudienceAgeFilter,
  EngagementRate,
  SpecificContactDetail,
  AudienceLanguageFilter,
  CreatorLanguageFilter,
  AudienceInterestAffinity,
  HashtagFilter,
  MentionFilter,
  TopicRelevanceFilter,
  FollowerGrowthFilter,
  SubscriberGrowthFilter,
  ViewsGrowth,
  InstagramOptions,
  AudienceLocationsFilter,
} from '@/lib/creator-discovery-types';
import { CreatorLocationSelection } from '@/lib/types';

// Platform-specific filter configuration
export const PLATFORM_FILTERS = {
  instagram: {
    performance: ['followers', 'trending', 'engagements', 'reels_plays'],
    content: [
      'bio_phrase',
      'topics',
      'lookalike',
      'hashtags',
      'caption_keyword',
      'interests',
      'mentions',
      'partnerships',
    ],
    account: [
      'last_post',
      'account_type',
      'contacts',
      'is_verified',
      'has_contact_details',
      'has_sponsored_posts',
      'has_audience_info',
      'exclude_private_profiles',
    ],
  },
  tiktok: {
    performance: ['followers', 'trending', 'engagements'],
    content: [
      'bio_phrase',
      'topics',
      'lookalike',
      'hashtags',
      'caption_keyword',
      'mentions',
    ],
    account: [
      'last_post',
      'account_type',
      'contacts',
      'is_verified',
      'has_contact_details',
      'has_audience_info',
      'exclude_private_profiles',
    ],
  },
  youtube: {
    performance: ['followers', 'trending', 'engagements'],
    content: [
      'bio_phrase',
      'topics',
      'lookalike',
      'hashtags',
      'caption_keyword',
      'mentions',
    ],
    account: [
      'last_post',
      'account_type',
      'contacts',
      'is_verified',
      'has_contact_details',
      'is_official_artist',
      'has_audience_info',
      'exclude_private_profiles',
    ],
  },
};

/**
 * Check if a filter is available for the selected platform
 */
export function isFilterAvailable(
  platformName: string | undefined,
  section: 'performance' | 'content' | 'account',
  filterKey: string,
): boolean {
  if (!platformName) return true; // Show all if no platform selected

  const platform = platformName.toLowerCase();
  const config = PLATFORM_FILTERS[platform as keyof typeof PLATFORM_FILTERS];

  if (!config) return true; // Unknown platform, show all

  return config[section]?.includes(filterKey) ?? false;
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: string;
  category:
    | 'demographics'
    | 'performance'
    | 'content'
    | 'account'
    | 'platform'
    | 'other';
}

// Add a new interface for context that includes location and language data
export interface FilterContext {
  selectedCreatorLocations?: CreatorLocationSelection[];
  allFetchedLocations?: any[];
  getLocationNameById?: (id: string) => string;
  selectedLanguages?: {
    creatorLanguage?: { code: string; name: string };
    audienceLanguages?: { code: string; name: string }[];
  };
  getLanguageNameByCode?: (code: string) => string;
  selectedInterests?: {
    creator?: string[];
    audience?: { value: string; percentage_value: number }[];
  };
  selectedHashtags?: { name: string }[];
  selectedMentions?: { name: string }[];
  selectedTopics?: string[];
  selectedBrands?: string[];
  selectedContacts?: SpecificContactDetail[];
}

// Helper function to truncate long lists
function formatNamesList(names: string[], maxDisplay: number = 3): string {
  if (names.length === 0) return '';

  if (names.length <= maxDisplay) {
    return names.join(', ');
  }

  return `${names.slice(0, maxDisplay).join(', ')} +${names.length - maxDisplay} more`;
}

// Configuration for filter metadata
export const FILTER_CONFIG = {
  // Platform & Basic
  work_platform_id: {
    label: 'Platform',
    category: 'platform' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) => value,
  },

  // Demographics
  creator_locations: {
    label: 'Creator Locations',
    category: 'demographics' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) {
        return '';
      }

      const locationNames: string[] = [];

      if (context?.selectedCreatorLocations) {
        value.forEach((id) => {
          const location = context.selectedCreatorLocations?.find(
            (loc) => loc.id === id,
          );
          if (location) {
            const displayName = location.display_name || location.name;
            if (displayName && !displayName.includes('Loading')) {
              locationNames.push(displayName);
            }
          }
        });
      }

      if (locationNames.length === 0 && context?.allFetchedLocations) {
        value.forEach((id) => {
          const location = context.allFetchedLocations?.find(
            (loc) => loc.id === id,
          );
          if (location) {
            const displayName = location.display_name || location.name;
            if (displayName && !displayName.includes('Loading')) {
              locationNames.push(displayName);
            }
          }
        });
      }

      if (locationNames.length === 0) {
        return `${value.length} location${value.length !== 1 ? 's' : ''}`;
      }

      return formatNamesList(locationNames, 2);
    },
  },
  audience_locations: {
    label: 'Audience Locations',
    category: 'demographics' as const,
    type: 'array',
    valueFormatter: (
      value: AudienceLocationsFilter[],
      context?: FilterContext,
    ) => {
      if (value.length === 0) {
        return '';
      }

      const locationDisplays: string[] = [];

      value.forEach((audienceLocation) => {
        let locationName = '';

        // Try multiple sources to get the location name
        if (context?.allFetchedLocations) {
          const location = context.allFetchedLocations.find(
            (loc) => loc.id === audienceLocation.location_id,
          );
          if (location) {
            locationName = location.display_name || location.name;
          }
        }

        if (!locationName && context?.getLocationNameById) {
          locationName = context.getLocationNameById(
            audienceLocation.location_id,
          );
        }

        // Only add if we have a proper name
        if (locationName && !locationName.includes('Location ')) {
          locationDisplays.push(
            `${locationName} (${audienceLocation.percentage_value}%)`,
          );
        }
      });

      if (locationDisplays.length === 0) {
        return `${value.length} location${value.length !== 1 ? 's' : ''}`;
      }

      return formatNamesList(locationDisplays, 2);
    },
  },
  creator_gender: {
    label: 'Creator Gender',
    category: 'demographics' as const,
    type: 'enum',
    excludeValues: ['ANY'],
    valueFormatter: (value: string, context?: FilterContext) =>
      value.replace(/_/g, ' '),
  },
  audience_gender: {
    label: 'Audience Gender',
    category: 'demographics' as const,
    type: 'object',
    valueFormatter: (value: AudienceGenderFilter, context?: FilterContext) =>
      `${value.type.replace(/_/g, ' ')} ≥${value.percentage_value}%`,
  },
  creator_age: {
    label: 'Creator Age',
    category: 'demographics' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatRange(value.min, value.max),
  },
  audience_age: {
    label: 'Audience Age',
    category: 'demographics' as const,
    type: 'object',
    valueFormatter: (value: AudienceAgeFilter, context?: FilterContext) =>
      `${value.min}-${value.max} (≥${value.percentage_value}%)`,
  },
  audience_language: {
    label: 'Audience Language',
    category: 'demographics' as const,
    type: 'array',
    valueFormatter: (
      value: AudienceLanguageFilter[],
      context?: FilterContext,
    ) => {
      if (value.length === 0) {
        return '';
      }

      const languageDisplays: string[] = [];

      value.forEach((audienceLanguage) => {
        let displayName = audienceLanguage.code.toUpperCase();

        if (context?.selectedLanguages?.audienceLanguages) {
          const selectedLang = context.selectedLanguages.audienceLanguages.find(
            (lang) => lang.code === audienceLanguage.code,
          );
          if (selectedLang) {
            displayName = selectedLang.name;
          }
        }

        if (
          displayName === audienceLanguage.code.toUpperCase() &&
          context?.getLanguageNameByCode
        ) {
          const nameFromFunction = context.getLanguageNameByCode(
            audienceLanguage.code,
          );
          if (nameFromFunction) {
            displayName = nameFromFunction;
          }
        }

        languageDisplays.push(
          `${displayName} (${audienceLanguage.percentage_value}%)`,
        );
      });

      return formatNamesList(languageDisplays, 2);
    },
  },
  creator_language: {
    label: 'Creator Language',
    category: 'demographics' as const,
    type: 'object',
    valueFormatter: (value: CreatorLanguageFilter, context?: FilterContext) => {
      if (context?.selectedLanguages?.creatorLanguage) {
        return context.selectedLanguages.creatorLanguage.name;
      }
      return value.code.toUpperCase();
    },
  },
  creator_age_bracket: {
    label: 'Creator Age Bracket',
    category: 'demographics' as const,
    type: 'enum',
    valueFormatter: (value: string, context?: FilterContext) =>
      value.replace(/_/g, ' '),
  },

  // Performance
  follower_count: {
    label: 'Followers',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  subscriber_count: {
    label: 'Subscribers',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  content_count: {
    label: 'Content Count',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatRange(value.min, value.max),
  },
  engagement_rate: {
    label: 'Engagement Rate',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: EngagementRate, context?: FilterContext) =>
      `≥${value.percentage_value}%`,
  },
  average_likes: {
    label: 'Avg Likes',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  average_views: {
    label: 'Avg Views',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  total_engagements: {
    label: 'Total Engagements',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  follower_growth: {
    label: 'Follower Growth',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: FollowerGrowthFilter, context?: FilterContext) =>
      `≥${value.percentage_value}% in ${value.interval} ${value.interval_unit.toLowerCase()}${value.interval > 1 ? 's' : ''}`,
  },
  subscriber_growth: {
    label: 'Subscriber Growth',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: SubscriberGrowthFilter, context?: FilterContext) =>
      `≥${value.percentage_value}% in ${value.interval} ${value.interval_unit.toLowerCase()}${value.interval > 1 ? 's' : ''}`,
  },
  views_growth: {
    label: 'Views Growth',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: ViewsGrowth, context?: FilterContext) =>
      `≥${value.percentage_value}% in ${value.interval} ${value.interval_unit.toLowerCase()}${value.interval > 1 ? 's' : ''}`,
  },
  share_count: {
    label: 'Share Count',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },
  save_count: {
    label: 'Save Count',
    category: 'performance' as const,
    type: 'object',
    valueFormatter: (value: NumericRange, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },

  // Content
  description_keywords: {
    label: 'Keywords',
    category: 'content' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) => value,
  },
  bio_phrase: {
    label: 'Bio Phrase',
    category: 'content' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) => value,
  },
  hashtags: {
    label: 'Hashtags',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: HashtagFilter[], context?: FilterContext) => {
      if (value.length === 0) return '';

      const hashtagNames = value.map((hashtag) => `#${hashtag.name}`);
      return formatNamesList(hashtagNames, 3);
    },
  },
  mentions: {
    label: 'Mentions',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: MentionFilter[], context?: FilterContext) => {
      if (value.length === 0) return '';

      const mentionNames = value.map((mention) => `@${mention.name}`);
      return formatNamesList(mentionNames, 3);
    },
  },
  audience_interests: {
    label: 'Audience Interests',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) return '';
      return formatNamesList(value, 3);
    },
  },
  creator_interests: {
    label: 'Creator Interests',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) return '';
      return formatNamesList(value, 3);
    },
  },
  audience_brand_affinities: {
    label: 'Audience Brands',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) return '';
      return formatNamesList(value, 3);
    },
  },
  creator_brand_affinities: {
    label: 'Creator Brands',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) return '';
      return formatNamesList(value, 3);
    },
  },
  brand_sponsors: {
    label: 'Brand Sponsors',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (value: string[], context?: FilterContext) => {
      if (value.length === 0) return '';
      return formatNamesList(value, 3);
    },
  },
  topic_relevance: {
    label: 'Topics AI',
    category: 'content' as const,
    type: 'object',
    valueFormatter: (value: TopicRelevanceFilter, context?: FilterContext) => {
      if (!value.name || value.name.length === 0) return '';
      return formatNamesList(value.name, 3);
    },
  },
  creator_lookalikes: {
    label: 'Creator Lookalikes',
    category: 'content' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) => `@${value}`,
  },
  audience_lookalikes: {
    label: 'Audience Lookalikes',
    category: 'content' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) => `@${value}`,
  },
  audience_interest_affinities: {
    label: 'Interest Affinities',
    category: 'content' as const,
    type: 'array',
    valueFormatter: (
      value: AudienceInterestAffinity[],
      context?: FilterContext,
    ) => {
      if (value.length === 0) return '';

      const affinityNames = value.map(
        (affinity) => `${affinity.value} (${affinity.percentage_value}%)`,
      );
      return formatNamesList(affinityNames, 2);
    },
  },

  // Account
  is_verified: {
    label: 'Verified',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  has_contact_details: {
    label: 'Has Contact',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  specific_contact_details: {
    label: 'Contact Details',
    category: 'account' as const,
    type: 'array',
    valueFormatter: (
      value: SpecificContactDetail[],
      context?: FilterContext,
    ) => {
      if (value.length === 0) return '';

      const contactNames = value.map((contact) => {
        const formattedType =
          contact.type.charAt(0) + contact.type.slice(1).toLowerCase();
        const preference =
          contact.preference === 'MUST_HAVE' ? ' (Must)' : ' (Should)';
        return `${formattedType}${preference}`;
      });

      return formatNamesList(contactNames, 2);
    },
  },
  has_sponsored_posts: {
    label: 'Has Sponsored Posts',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  is_official_artist: {
    label: 'Official Artist',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  has_audience_info: {
    label: 'Has Audience Info',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  exclude_private_profiles: {
    label: 'Exclude Private',
    category: 'account' as const,
    type: 'boolean',
    valueFormatter: (value: boolean, context?: FilterContext) => 'Yes',
  },
  platform_account_type: {
    label: 'Platform Account Type',
    category: 'account' as const,
    type: 'enum',
    excludeValues: ['ANY'],
    valueFormatter: (value: string, context?: FilterContext) =>
      value.replace(/_/g, ' '),
  },
  creator_account_type: {
    label: 'Creator Account Type',
    category: 'account' as const,
    type: 'array',
    excludeValues: ['ANY'],
    valueFormatter: (value: string[], context?: FilterContext) => {
      const filteredTypes = value.filter((type) => type !== 'ANY');
      if (filteredTypes.length === 0) return '';

      const formattedTypes = filteredTypes.map((type) =>
        type.replace(/_/g, ' '),
      );
      return formatNamesList(formattedTypes, 2);
    },
  },
  last_post_timestamp: {
    label: 'Last Post After',
    category: 'account' as const,
    type: 'string',
    valueFormatter: (value: string, context?: FilterContext) =>
      new Date(value).toLocaleDateString(),
  },
  audience_credibility_category: {
    label: 'Audience Credibility',
    category: 'account' as const,
    type: 'enum',
    valueFormatter: (value: string, context?: FilterContext) => value,
  },
  audience_credibility_score: {
    label: 'Credibility Score',
    category: 'account' as const,
    type: 'number',
    valueFormatter: (value: number, context?: FilterContext) => `≥${value}`,
  },
  post_type: {
    label: 'Post Type',
    category: 'account' as const,
    type: 'enum',
    excludeValues: ['ALL'],
    valueFormatter: (value: string, context?: FilterContext) => value,
  },
  audience_source: {
    label: 'Audience Source',
    category: 'account' as const,
    type: 'enum',
    excludeValues: ['ANY'],
    valueFormatter: (value: string, context?: FilterContext) =>
      value.replace(/_/g, ' '),
  },

  // Nested filters
  'instagram_options.reel_views': {
    label: 'Reel Views',
    category: 'performance' as const,
    type: 'nested',
    path: ['instagram_options', 'reel_views'],
    valueFormatter: (value: any, context?: FilterContext) =>
      formatNumberRange(value.min, value.max),
  },

  // Pagination & Sorting (usually not shown as active filters)
  sort_by: {
    label: 'Sort By',
    category: 'other' as const,
    type: 'object',
    valueFormatter: (value: any, context?: FilterContext) =>
      `${value.field} (${value.order})`,
  },
  limit: {
    label: 'Limit',
    category: 'other' as const,
    type: 'number',
    valueFormatter: (value: number, context?: FilterContext) =>
      value.toString(),
  },
  offset: {
    label: 'Offset',
    category: 'other' as const,
    type: 'number',
    valueFormatter: (value: number, context?: FilterContext) =>
      value.toString(),
  },
} as const;

// Helper functions for formatting
function formatRange(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${min}-${max}`;
  if (min !== undefined) return `${min}+`;
  if (max !== undefined) return `up to ${max}`;
  return '';
}

function formatNumberRange(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined)
    return `${min.toLocaleString()}-${max.toLocaleString()}`;
  if (min !== undefined) return `${min.toLocaleString()}+`;
  if (max !== undefined) return `up to ${max.toLocaleString()}`;
  return '';
}

// Check if a value is considered "active" (not empty/default)
function isActiveValue(value: any, config: any): boolean {
  if (value === undefined || value === null) return false;

  switch (config.type) {
    case 'boolean':
      return value === true;
    case 'string':
      return typeof value === 'string' && value.trim().length > 0;
    case 'number':
      return typeof value === 'number' && value > 0;
    case 'array':
      return Array.isArray(value) && value.length > 0;
    case 'enum':
      return (
        value &&
        (!config.excludeValues || !config.excludeValues.includes(value))
      );
    case 'object':
      return (
        value && typeof value === 'object' && Object.keys(value).length > 0
      );
    default:
      return Boolean(value);
  }
}

// Get nested value from object using path
function getNestedValue(obj: any, path: string[]): any {
  return path.reduce((current, key) => current?.[key], obj);
}

// Set nested value in object using path
function setNestedValue(obj: any, path: string[], value: any): any {
  const newObj = { ...obj };
  let current = newObj;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    } else {
      current[key] = { ...current[key] };
    }
    current = current[key];
  }

  const lastKey = path[path.length - 1];
  if (value === undefined) {
    delete current[lastKey];
    // Clean up empty parent objects
    if (Object.keys(current).length === 0 && path.length > 1) {
      return setNestedValue(obj, path.slice(0, -1), undefined);
    }
  } else {
    current[lastKey] = value;
  }

  return newObj;
}

/**
 * Smart function to get all active filters
 */
export function getActiveFilters(
  searchParams: InfluencerSearchFilter,
  pendingFilters: Partial<InfluencerSearchFilter> = {},
  context?: FilterContext,
): ActiveFilter[] {
  const combinedFilters = { ...searchParams, ...pendingFilters };
  const activeFilters: ActiveFilter[] = [];

  // Filters to exclude from active filters display
  const excludedFilters = ['limit', 'work_platform_id', 'sort_by', 'offset'];

  // Process all configured filters
  Object.entries(FILTER_CONFIG).forEach(([filterKey, config]) => {
    // Skip excluded filters
    if (excludedFilters.includes(filterKey)) {
      return;
    }

    let value: any;

    if (config.type === 'nested' && 'path' in config) {
      // Handle nested filters
      value = getNestedValue(combinedFilters, Array.from(config.path));
    } else {
      // Handle regular filters
      value = combinedFilters[filterKey as keyof InfluencerSearchFilter];
    }

    if (isActiveValue(value, config)) {
      try {
        // Pass context to the valueFormatter
        const formattedValue = (config as any).valueFormatter(value, context);
        if (formattedValue) {
          activeFilters.push({
            key: filterKey,
            label: config.label,
            value: formattedValue,
            category: config.category,
          });
        }
      } catch (error) {
        console.warn(`Error formatting value for filter ${filterKey}:`, error);
      }
    }
  });

  // Handle any unknown filters that might exist but aren't in config
  Object.entries(combinedFilters).forEach(([key, value]) => {
    // Skip excluded filters and already processed filters
    if (
      excludedFilters.includes(key) ||
      FILTER_CONFIG[key as keyof typeof FILTER_CONFIG]
    ) {
      return;
    }

    if (value !== undefined && value !== null) {
      // Try to format unknown filters generically
      let formattedValue: string;

      if (typeof value === 'boolean') {
        formattedValue = value ? 'Yes' : 'No';
      } else if (typeof value === 'string') {
        formattedValue = value;
      } else if (typeof value === 'number') {
        formattedValue = value.toString();
      } else if (Array.isArray(value)) {
        formattedValue = `${value.length} item${value.length > 1 ? 's' : ''}`;
      } else if (typeof value === 'object') {
        formattedValue = 'Custom filter';
      } else {
        formattedValue = String(value);
      }

      activeFilters.push({
        key,
        label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        value: formattedValue,
        category: 'other',
      });
    }
  });

  return activeFilters;
}

/**
 * Smart function to remove a filter
 */
export function removeFilter(
  filterKey: string,
  currentFilters: Partial<InfluencerSearchFilter>,
): Partial<InfluencerSearchFilter> {
  const updates: Partial<InfluencerSearchFilter> = { ...currentFilters };
  const config = FILTER_CONFIG[filterKey as keyof typeof FILTER_CONFIG];

  if (config && config.type === 'nested' && 'path' in config) {
    // Handle nested filters
    return setNestedValue(updates, Array.from(config.path), undefined);
  } else {
    // Handle regular filters
    (updates as any)[filterKey] = undefined;
  }

  return updates;
}

/**
 * Get filters grouped by category
 */
export function getActiveFiltersByCategory(
  searchParams: InfluencerSearchFilter,
  pendingFilters: Partial<InfluencerSearchFilter> = {},
  context?: FilterContext,
): Record<string, ActiveFilter[]> {
  const activeFilters = getActiveFilters(searchParams, pendingFilters, context);

  return activeFilters.reduce(
    (grouped, filter) => {
      if (!grouped[filter.category]) {
        grouped[filter.category] = [];
      }
      grouped[filter.category].push(filter);
      return grouped;
    },
    {} as Record<string, ActiveFilter[]>,
  );
}

/**
 * Get count of active filters by category
 */
export function getActiveFilterCounts(
  searchParams: InfluencerSearchFilter,
  pendingFilters: Partial<InfluencerSearchFilter> = {},
  context?: FilterContext,
): Record<string, number> {
  const groupedFilters = getActiveFiltersByCategory(
    searchParams,
    pendingFilters,
    context,
  );

  return Object.entries(groupedFilters).reduce(
    (counts, [category, filters]) => {
      counts[category] = filters.length;
      return counts;
    },
    {} as Record<string, number>,
  );
}

/**
 * Check if any filters are active
 */
export function hasActiveFilters(
  searchParams: InfluencerSearchFilter,
  pendingFilters: Partial<InfluencerSearchFilter> = {},
  context?: FilterContext,
): boolean {
  return getActiveFilters(searchParams, pendingFilters, context).length > 0;
}
