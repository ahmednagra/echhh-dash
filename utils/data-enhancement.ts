// src/utils/data-enhancement.ts

/**
 * Utility functions for enhancing campaign list member data
 */

/**
 * Helper function to parse JSON safely with detailed logging
 */
export function parseJSONSafely(jsonString: any, defaultValue: any = null, fieldName?: string) {
  if (!jsonString) {
    if (fieldName) console.log(`📋 ${fieldName}: No data provided, using default`);
    return defaultValue;
  }
  
  if (typeof jsonString === 'object') {
    if (fieldName) console.log(`📋 ${fieldName}: Already an object`);
    return jsonString;
  }
  
  if (typeof jsonString === 'string') {
    try {
      const parsed = JSON.parse(jsonString);
      if (fieldName) console.log(`📋 ${fieldName}: Successfully parsed JSON`);
      return parsed;
    } catch (error) {
      if (fieldName) console.warn(`⚠️ ${fieldName}: Failed to parse JSON, using default. Error:`, error);
      return defaultValue;
    }
  }
  
  if (fieldName) console.warn(`⚠️ ${fieldName}: Unknown data type, using default`);
  return defaultValue;
}

/**
 * Enhanced function to reconstruct complete influencer data from stored additional_metrics
 */
export function enhanceInfluencerMemberData(memberData: any) {
  if (!memberData) {
    console.warn('⚠️ No member data provided to enhance');
    return memberData;
  }

  if (!memberData?.social_account?.additional_metrics) {
    console.log('📋 No additional_metrics found, returning original data');
    return memberData;
  }

  const metrics = memberData.social_account.additional_metrics;
  console.log('🔄 Enhancing influencer data with keys:', Object.keys(metrics));
  
  // Parse JSON fields back to objects with detailed logging
  const enhancedMetrics = {
    ...metrics,
    
    // Parse location data
    creator_location: parseJSONSafely(
      metrics.creator_location, 
      {
        city: metrics.creator_city || 'Unknown',
        state: metrics.creator_state || null,
        country: metrics.creator_country || 'Unknown'
      },
      'creator_location'
    ),
    
    // Parse contact details
    contact_details: parseJSONSafely(
      metrics.contact_details, 
      [],
      'contact_details'
    ),
    
    // Parse filter match data with comprehensive fallback
    filter_match: parseJSONSafely(
      metrics.filter_match,
      {
        creator_gender: metrics.creator_gender_filter || metrics.gender || 'UNKNOWN',
        creator_locations: parseJSONSafely(metrics.creator_locations_filter, [], 'creator_locations_filter'),
        brand_sponsors: null,
        creator_age: null,
        creator_brand_affinities: null,
        follower_growth: null,
        subscriber_growth: null,
        creator_interests: null,
        creator_language: null,
        creator_lookalikes: null,
        content_count: null,
        instagram_options: null,
        audience_age: null,
        audience_gender: null,
        audience_brand_affinities: null,
        audience_interests: null,
        audience_language: null,
        audience_locations: null,
        audience_lookalikes: null,
        topic_relevance: null,
        views_growth: null,
        audience_ethnicity: null,
        audience_credibility_score: null,
        share_count: null,
        save_count: null
      },
      'filter_match'
    ),
    
    // Parse work platform data
    work_platform: parseJSONSafely(
      metrics.work_platform,
      {
        id: metrics.platform_id || 'unknown',
        name: metrics.platform_name || 'Unknown Platform',
        logo_url: metrics.platform_logo || ''
      },
      'work_platform'
    ),
    
    // Parse livestream metrics
    livestream_metrics: parseJSONSafely(
      metrics.livestream_metrics, 
      null,
      'livestream_metrics'
    ),
    
    // Ensure numeric values are properly typed with fallbacks
    engagement_rate: safeParseFloat(
      metrics.engagement_rate || metrics.engagementRate, 
      0,
      'engagement_rate'
    ),
    engagementRate: safeParseFloat(
      metrics.engagementRate || metrics.engagement_rate, 
      0,
      'engagementRate'
    ),
    average_likes: safeParseInt(
      metrics.average_likes, 
      0,
      'average_likes'
    ),
    average_views: safeParseInt(
      metrics.average_views, 
      null,
      'average_views'
    ),
    content_count: safeParseInt(
      metrics.content_count, 
      null,
      'content_count'
    ),
    subscriber_count: safeParseInt(
      metrics.subscriber_count, 
      null,
      'subscriber_count'
    ),
  };

  console.log('✅ Enhanced member data with parsed JSON fields');
  console.log('📊 Enhanced fields available:', {
    has_creator_location: !!enhancedMetrics.creator_location,
    has_contact_details: Array.isArray(enhancedMetrics.contact_details) && enhancedMetrics.contact_details.length > 0,
    has_filter_match: !!enhancedMetrics.filter_match,
    has_work_platform: !!enhancedMetrics.work_platform,
    has_livestream_metrics: !!enhancedMetrics.livestream_metrics,
  });

  // Return enhanced member data
  return {
    ...memberData,
    social_account: {
      ...memberData.social_account,
      additional_metrics: enhancedMetrics
    }
  };
}

/**
 * Safe parsing for numeric values
 */
export function safeParseFloat(value: any, defaultValue: number | null = null, fieldName?: string): number | null {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  if (fieldName) {
    console.warn(`⚠️ ${fieldName}: Could not parse "${value}" as float, using default:`, defaultValue);
  }
  
  return defaultValue;
}

/**
 * Safe parsing for integer values
 */
export function safeParseInt(value: any, defaultValue: number | null = null, fieldName?: string): number | null {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  if (typeof value === 'number') {
    return Math.floor(value);
  }
  
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  
  if (fieldName) {
    console.warn(`⚠️ ${fieldName}: Could not parse "${value}" as integer, using default:`, defaultValue);
  }
  
  return defaultValue;
}

/**
 * Bulk enhance multiple influencer members
 */
export function bulkEnhanceInfluencerMembers(members: any[]): any[] {
  if (!Array.isArray(members)) {
    console.warn('⚠️ Members is not an array, returning empty array');
    return [];
  }
  
  console.log(`🔄 Bulk enhancing ${members.length} influencer members`);
  
  const enhanced = members.map((member, index) => {
    try {
      return enhanceInfluencerMemberData(member);
    } catch (error) {
      console.error(`❌ Error enhancing member at index ${index}:`, error);
      return member; // Return original if enhancement fails
    }
  });
  
  console.log(`✅ Successfully enhanced ${enhanced.length} members`);
  return enhanced;
}

/**
 * Validate that enhanced data has the expected structure
 */
export function validateEnhancedMember(member: any): {
  isValid: boolean;
  missingFields: string[];
  availableFields: string[];
} {
  const expectedFields = [
    'creator_location',
    'contact_details', 
    'filter_match',
    'work_platform',
    'engagement_rate',
    'average_likes'
  ];
  
  const metrics = member?.social_account?.additional_metrics || {};
  const availableFields = Object.keys(metrics);
  const missingFields = expectedFields.filter(field => !metrics[field]);
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    availableFields
  };
}

/**
 * Debug helper to log enhanced member structure
 */
export function debugEnhancedMember(member: any, memberIndex?: number) {
  const prefix = memberIndex !== undefined ? `Member ${memberIndex}:` : 'Member:';
  
  console.group(`🔍 ${prefix} Enhanced Data Debug`);
  
  const validation = validateEnhancedMember(member);
  console.log('✅ Validation:', validation);
  
  const metrics = member?.social_account?.additional_metrics;
  if (metrics) {
    console.log('📊 Location:', metrics.creator_location);
    console.log('📞 Contacts:', metrics.contact_details);
    console.log('🎯 Filter Match:', metrics.filter_match);
    console.log('💼 Platform:', metrics.work_platform);
    console.log('📈 Engagement:', metrics.engagement_rate || metrics.engagementRate);
    console.log('👍 Avg Likes:', metrics.average_likes);
  } else {
    console.warn('⚠️ No additional_metrics found');
  }
  
  console.groupEnd();
}