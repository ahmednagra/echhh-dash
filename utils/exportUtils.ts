// src/utils/exportUtils.ts

import * as XLSX from 'xlsx';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

// Helper function to safely get additional metrics
const getAdditionalMetric = (
  member: CampaignListMember,
  key: string,
  defaultValue: any = null,
) => {
  const additionalMetrics = member?.social_account?.additional_metrics;
  if (!additionalMetrics || typeof additionalMetrics !== 'object') {
    return defaultValue;
  }

  const metricsObj = additionalMetrics as Record<string, any>;
  return metricsObj[key] ?? defaultValue;
};

// Helper function to safely parse JSON
const parseJSONSafely = (jsonString: any, defaultValue: any = null) => {
  if (!jsonString) return defaultValue;
  if (typeof jsonString === 'object') return jsonString;
  if (typeof jsonString === 'string') {
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }
  return defaultValue;
};

// Helper function to format numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to get engagement rate (UPDATED with conditional logic)
const getEngagementRate = (member: CampaignListMember): string => {
  const engagementRate =
    getAdditionalMetric(member, 'engagementRate') ||
    getAdditionalMetric(member, 'engagement_rate');

  if (typeof engagementRate === 'number') {
    // Check if value is less than 1 (0.something format)
    if (engagementRate < 1) {
      // For values like 0.095235404231272 -> multiply by 100 and show 2 decimal places
      return `${(engagementRate * 100).toFixed(2)}%`;
    } else {
      // For values like 7.295235404231272 -> show as-is with up to 2 decimal places
      const roundedRate = Math.round(engagementRate * 100) / 100; // Round to 2 decimal places
      return `${roundedRate}%`;
    }
  }

  if (typeof engagementRate === 'string' && engagementRate.includes('%')) {
    // Keep as-is for string values that already have % sign
    return engagementRate;
  }

  return 'N/A';
};

// NEW: Helper function to format audience age distribution
const formatAudienceAge = (member: CampaignListMember): string => {
  // Check multiple possible locations for audience age data based on your actual data structure

  // 1. Check filter_match.audience_age first (this is where your data is)
  const filterMatch = getAdditionalMetric(member, 'filter_match');
  let ageDistribution = filterMatch?.audience_age;

  // 2. Fallback to audience_demographics.age_distribution
  if (!ageDistribution) {
    const audienceDemographics = getAdditionalMetric(
      member,
      'audience_demographics',
    );
    ageDistribution = audienceDemographics?.age_distribution;
  }

  // 3. Fallback to audience_age_groups
  if (!ageDistribution) {
    ageDistribution = getAdditionalMetric(member, 'audience_age_groups');
  }

  if (!ageDistribution) {
    return 'N/A';
  }

  // Handle object with min/max structure (matches your data structure)
  if (
    typeof ageDistribution === 'object' &&
    !Array.isArray(ageDistribution) &&
    'min' in ageDistribution &&
    'max' in ageDistribution
  ) {
    const percentage = ageDistribution.percentage_value;
    const ageRange = `${ageDistribution.min}-${ageDistribution.max}`;

    if (percentage !== null && percentage !== undefined) {
      return `${ageRange} (${Math.round(percentage)}%)`;
    } else {
      return ageRange;
    }
  }

  // Handle array format
  if (Array.isArray(ageDistribution)) {
    const formattedAges = ageDistribution
      .slice(0, 2) // Show top 2 age groups
      .map((age: any) => {
        const range =
          age.age_range ||
          age.range ||
          `${age.min || 'N/A'}-${age.max || 'N/A'}`;
        const percentage = age.percentage_value || age.percentage;

        if (percentage !== null && percentage !== undefined) {
          return `${range} (${Math.round(percentage)}%)`;
        } else {
          return range;
        }
      })
      .filter(Boolean);

    return formattedAges.length > 0 ? formattedAges.join(', ') : 'N/A';
  }

  return 'N/A';
};

// NEW: Helper function to format age distribution details
const formatAgeDistribution = (member: CampaignListMember): string => {
  // Check filter_match.audience_age first (primary source based on your data)
  const filterMatch = getAdditionalMetric(member, 'filter_match');
  let ageDistribution = filterMatch?.audience_age;

  // Fallback to audience_demographics.age_distribution
  if (!ageDistribution) {
    const audienceDemographics = getAdditionalMetric(
      member,
      'audience_demographics',
    );
    ageDistribution = audienceDemographics?.age_distribution;
  }

  // Fallback to audience_age_groups
  if (!ageDistribution) {
    ageDistribution = getAdditionalMetric(member, 'audience_age_groups');
  }

  if (!ageDistribution) {
    return 'N/A';
  }

  // Handle array format - show all age groups with percentages
  if (Array.isArray(ageDistribution)) {
    const formattedAges = ageDistribution
      .map((age: any) => {
        const range =
          age.age_range ||
          age.range ||
          `${age.min || 'N/A'}-${age.max || 'N/A'}`;
        const percentage = age.percentage_value || age.percentage;

        if (percentage !== null && percentage !== undefined) {
          return `${range}: ${Math.round(percentage)}%`;
        } else {
          return `${range}: N/A`;
        }
      })
      .filter(Boolean);

    return formattedAges.length > 0 ? formattedAges.join(' | ') : 'N/A';
  }

  // Handle single object format (your data structure)
  if (
    typeof ageDistribution === 'object' &&
    'min' in ageDistribution &&
    'max' in ageDistribution
  ) {
    const percentage = ageDistribution.percentage_value;
    const ageRange = `${ageDistribution.min}-${ageDistribution.max}`;

    if (percentage !== null && percentage !== undefined) {
      return `${ageRange}: ${Math.round(percentage)}%`;
    } else {
      return `${ageRange}: N/A`;
    }
  }

  return 'N/A';
};

// NEW: Helper function to format audience gender distribution
const formatAudienceGender = (member: CampaignListMember): string => {
  // Check filter_match.audience_gender first (primary source based on your data)
  const filterMatch = getAdditionalMetric(member, 'filter_match');
  let genderDistribution = filterMatch?.audience_gender;

  // Fallback to audience_demographics.gender_distribution
  if (!genderDistribution) {
    const audienceDemographics = getAdditionalMetric(
      member,
      'audience_demographics',
    );
    genderDistribution = audienceDemographics?.gender_distribution;
  }

  if (
    !genderDistribution ||
    !Array.isArray(genderDistribution) ||
    genderDistribution.length === 0
  ) {
    return 'N/A';
  }

  // Format gender distribution with percentages
  const formattedGenders = genderDistribution
    .map((gender: any) => {
      const type = gender.type || gender.gender || 'Unknown';
      const percentage =
        gender.percentage_value || gender.value || gender.percentage;

      if (percentage !== null && percentage !== undefined) {
        return `${type}: ${Math.round(percentage)}%`;
      } else {
        return `${type}: N/A`;
      }
    })
    .filter(Boolean);

  // FIXED: Calculate missing gender percentage
  if (formattedGenders.length === 1) {
    // If only MALE is provided, calculate FEMALE
    if (
      formattedGenders[0].includes('MALE:') &&
      !formattedGenders[0].includes('FEMALE')
    ) {
      const maleMatch = formattedGenders[0].match(/MALE: (\d+(?:\.\d+)?)%/);
      if (maleMatch) {
        const malePercentage = parseFloat(maleMatch[1]);
        const femalePercentage = 100 - malePercentage;
        return `MALE: ${Math.round(malePercentage)}% | FEMALE: ${Math.round(femalePercentage)}%`;
      }
    }

    // If only FEMALE is provided, calculate MALE
    if (formattedGenders[0].includes('FEMALE:')) {
      const femaleMatch = formattedGenders[0].match(/FEMALE: (\d+(?:\.\d+)?)%/);
      if (femaleMatch) {
        const femalePercentage = parseFloat(femaleMatch[1]);
        const malePercentage = 100 - femalePercentage;
        return `MALE: ${Math.round(malePercentage)}% | FEMALE: ${Math.round(femalePercentage)}%`;
      }
    }
  }

  return formattedGenders.length > 0 ? formattedGenders.join(' | ') : 'N/A';
};

// NEW: Helper function to format audience locations
const formatAudienceLocations = (member: CampaignListMember): string => {
  // Check filter_match.audience_locations first
  const filterMatch = getAdditionalMetric(member, 'filter_match');
  let audienceLocations = filterMatch?.audience_locations;

  // Fallback to direct audience_locations field
  if (!audienceLocations) {
    audienceLocations = getAdditionalMetric(member, 'audience_locations');
  }

  // Fallback to audience_demographics.location_distribution
  if (!audienceLocations) {
    const audienceDemographics = getAdditionalMetric(
      member,
      'audience_demographics',
    );
    if (audienceDemographics?.location_distribution) {
      audienceLocations = audienceDemographics.location_distribution;
    }
  }

  // Based on your data structure, audience_locations appears to be an empty array
  // Let's check for creator_location as a fallback when audience location data is not available
  if (
    !audienceLocations ||
    !Array.isArray(audienceLocations) ||
    audienceLocations.length === 0
  ) {
    // Use creator location as fallback since audience location is empty in your data
    const creatorLocation = getAdditionalMetric(member, 'creator_location');
    if (creatorLocation && typeof creatorLocation === 'object') {
      const parsed = parseJSONSafely(creatorLocation, null);
      if (parsed && parsed.country) {
        return `${parsed.country} (Creator Location)`;
      }
    }
    return 'N/A';
  }

  // Format top locations with percentages if data exists
  const formattedLocations = audienceLocations
    .slice(0, 3) // Show top 3 locations
    .map((location: any) => {
      const locationName = location.name || location.country || 'Unknown';
      const percentage =
        location.percentage_value || location.value || location.percentage;

      if (percentage !== null && percentage !== undefined) {
        return `${locationName}: ${Math.round(percentage)}%`;
      } else {
        return locationName;
      }
    })
    .filter(Boolean);

  return formattedLocations.length > 0 ? formattedLocations.join(' | ') : 'N/A';
};

// Helper function to get contact by type
const getContactByType = (member: CampaignListMember, contactType: string) => {
  const contacts = member?.social_account?.contacts;

  if (Array.isArray(contacts) && contacts.length > 0) {
    const contactsOfType = contacts.filter(
      (contact) =>
        contact.contact_type?.toLowerCase() === contactType.toLowerCase(),
    );

    if (contactsOfType.length > 0) {
      return contactsOfType
        .map((contact) => {
          const primaryTag = contact.is_primary ? ' (Primary)' : '';
          return `${contact.value}${primaryTag}`;
        })
        .join('; ');
    }
  }

  return 'N/A';
};

// Helper function to get contact from both social_account.contacts and additional_metrics.contact_details
const getContactFromDetails = (
  member: CampaignListMember,
  contactType: string,
): string => {
  const allContactValues: string[] = [];

  // SOURCE 1: social_account.contacts (uses contact_type)
  const contacts = member?.social_account?.contacts;
  if (contacts && Array.isArray(contacts) && contacts.length > 0) {
    let matchingContacts: any[] = [];

    if (contactType === 'phone') {
      // For Contact column: include both phone and whatsapp
      matchingContacts = contacts.filter(
        (contact: any) =>
          contact.contact_type?.toLowerCase() === 'phone' ||
          contact.contact_type?.toLowerCase() === 'whatsapp',
      );
    } else {
      // For Email column: only email
      matchingContacts = contacts.filter(
        (contact: any) =>
          contact.contact_type?.toLowerCase() === contactType.toLowerCase(),
      );
    }

    matchingContacts.forEach((contact: any) => {
      if (contact.value) {
        allContactValues.push(contact.value);
      }
    });
  }

  // SOURCE 2: additional_metrics.contact_details (uses type)
  const contactDetails = getAdditionalMetric(member, 'contact_details');
  if (
    contactDetails &&
    Array.isArray(contactDetails) &&
    contactDetails.length > 0
  ) {
    let matchingDetails: any[] = [];

    if (contactType === 'phone') {
      // For Contact column: include both phone and whatsapp
      matchingDetails = contactDetails.filter(
        (contact: any) =>
          contact.type?.toLowerCase() === 'phone' ||
          contact.type?.toLowerCase() === 'whatsapp',
      );
    } else {
      // For Email column: only email
      matchingDetails = contactDetails.filter(
        (contact: any) =>
          contact.type?.toLowerCase() === contactType.toLowerCase(),
      );
    }

    matchingDetails.forEach((contact: any) => {
      if (contact.value) {
        allContactValues.push(contact.value);
      }
    });
  }

  // Remove duplicates (case-insensitive comparison)
  const uniqueValues = [
    ...new Set(allContactValues.map((val) => val.trim().toLowerCase())),
  ].map(
    (lowerVal) =>
      allContactValues.find((val) => val.trim().toLowerCase() === lowerVal) ||
      lowerVal,
  );

  if (uniqueValues.length === 0) {
    return 'N/A';
  }

  // Return all unique values joined by newline (each on separate row within same cell)
  return uniqueValues.join(' | ');
};

// NEW: Helper function to get social platform data from both sources
const getSocialPlatformData = (
  member: CampaignListMember,
  platformType: string,
): string => {
  const allValues: string[] = [];

  // SOURCE 1: social_account.contacts (manually added data)
  const contacts = member?.social_account?.contacts;
  if (contacts && Array.isArray(contacts) && contacts.length > 0) {
    contacts.forEach((contact: any) => {
      const contactType = (contact.contact_type || '').toLowerCase();
      const contactName = (contact.name || '').toLowerCase();

      // Check if contact_type matches OR if it's "other" type with matching name
      if (
        contactType === platformType.toLowerCase() ||
        (contactType === 'other' && contactName === platformType.toLowerCase())
      ) {
        if (contact.value) {
          allValues.push(contact.value);
        }
      }
    });
  }

  // SOURCE 2: additional_metrics.contact_details (API fetched data)
  const contactDetails = getAdditionalMetric(member, 'contact_details');
  if (
    contactDetails &&
    Array.isArray(contactDetails) &&
    contactDetails.length > 0
  ) {
    contactDetails.forEach((contact: any) => {
      const type = (contact.type || '').toLowerCase();
      if (type === platformType.toLowerCase()) {
        if (contact.value) {
          allValues.push(contact.value);
        }
      }
    });
  }

  // Remove duplicates
  const uniqueValues = [...new Set(allValues.map((val) => val.trim()))];

  if (uniqueValues.length === 0) {
    return 'N/A';
  }

  return uniqueValues.join(' | ');
};

// Helper function to format onboarded date
const formatOnboardedDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'N/A';
  }
};

// Export column definitions with NEW audience columns added
export interface ExportColumnDefinition {
  key: string;
  label: string;
  getValue: (member: CampaignListMember) => any;
}

export const getAllExportColumns = (): ExportColumnDefinition[] => [
  {
    key: 'name',
    label: 'Name',
    getValue: (member) =>
      member.social_account?.full_name ||
      getAdditionalMetric(member, 'name') ||
      '',
  },
  {
    key: 'username',
    label: 'Username',
    getValue: (member) =>
      member.social_account?.account_handle ||
      getAdditionalMetric(member, 'username') ||
      'N/A',
  },

  {
    key: 'location',
    label: 'Location',
    getValue: (member) => {
      console.log(
        '🔍 DEBUG: Processing location for member:',
        member.social_account?.account_handle,
      );

      // Try creator_location object first
      const locationData = getAdditionalMetric(member, 'creator_location');
      console.log('🔍 DEBUG: creator_location raw:', locationData);

      const parsed = parseJSONSafely(locationData, null);
      console.log('🔍 DEBUG: creator_location parsed:', parsed);

      // Handle parsed object with city and country
      if (parsed && typeof parsed === 'object') {
        if (parsed.city && parsed.country) {
          return parsed.state
            ? `${parsed.city}, ${parsed.state}, ${parsed.country}`
            : `${parsed.city}, ${parsed.country}`;
        }

        // If only country exists
        if (parsed.country) {
          return parsed.country;
        }

        // If only city exists
        if (parsed.city) {
          return parsed.city;
        }
      }

      // Fallback to separate fields
      const city = getAdditionalMetric(member, 'city');
      const state = getAdditionalMetric(member, 'state');
      const country = getAdditionalMetric(member, 'country');

      console.log(
        '🔍 DEBUG: Separate fields - city:',
        city,
        'state:',
        state,
        'country:',
        country,
      );

      if (city && country) {
        return state ? `${city}, ${state}, ${country}` : `${city}, ${country}`;
      }

      if (country) {
        return country;
      }

      if (city) {
        return city;
      }

      return 'N/A';
    },
  },

  {
    key: 'gender',
    label: 'Gender',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'gender');
      return value ? String(value).toUpperCase() : 'N/A';
    },
  },

  {
    key: 'age_group',
    label: 'Age Group',
    getValue: (member) => getAdditionalMetric(member, 'age_group') || 'N/A',
  },

  {
    key: 'followers',
    label: 'Followers',
    getValue: (member) =>
      member.social_account?.followers_count ||
      getAdditionalMetric(member, 'followers') ||
      0,
  },
  {
    key: 'verified',
    label: 'Verified',
    getValue: (member) => (member.social_account?.is_verified ? 'Yes' : 'No'),
  },

  {
    key: 'engagement_rate',
    label: 'Engagement Rate',
    getValue: (member) => getEngagementRate(member), // FIXED: Use consistent engagement rate calculation
  },

  {
    key: 'avg_likes',
    label: 'Average Likes',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'average_likes');
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    },
  },
  {
    key: 'avg_views',
    label: 'Reel Views',
    getValue: (member) => {
      console.log(
        '🔍 DEBUG: Processing avg_views (reel_views) for member:',
        member.social_account?.account_handle,
      );

      // PRIORITY 1: Check average_views first (most common in your data)
      const averageViews = getAdditionalMetric(member, 'average_views');
      console.log('🔍 DEBUG: average_views:', averageViews);

      if (
        averageViews !== null &&
        averageViews !== undefined &&
        typeof averageViews === 'number' &&
        averageViews > 0
      ) {
        return formatNumber(averageViews);
      }

      // PRIORITY 2: Check instagram_options.reel_views
      const instagramOptions = getAdditionalMetric(member, 'instagram_options');
      console.log('🔍 DEBUG: instagram_options:', instagramOptions);

      if (
        instagramOptions &&
        typeof instagramOptions === 'object' &&
        instagramOptions.reel_views
      ) {
        const value = instagramOptions.reel_views;
        console.log('🔍 DEBUG: Found reel_views in instagram_options:', value);
        return typeof value === 'number' ? formatNumber(value) : 'N/A';
      }

      // PRIORITY 3: Check filter_match.instagram_options.reel_views
      const filterMatch = getAdditionalMetric(member, 'filter_match');
      console.log('🔍 DEBUG: filter_match:', filterMatch);

      if (filterMatch?.instagram_options?.reel_views) {
        const value = filterMatch.instagram_options.reel_views;
        console.log(
          '🔍 DEBUG: Found reel_views in filter_match.instagram_options:',
          value,
        );
        return typeof value === 'number' ? formatNumber(value) : 'N/A';
      }

      // PRIORITY 4: Direct reel_views field
      const directValue = getAdditionalMetric(member, 'reel_views');
      console.log('🔍 DEBUG: Direct reel_views value:', directValue);

      return typeof directValue === 'number'
        ? formatNumber(directValue)
        : 'N/A';
    },
  },

  {
    key: 'audience_age_groups', // FIXED: Match table column key
    label: 'Audience Age',
    getValue: (member) => formatAudienceAge(member),
  },

  {
    key: 'age_distribution',
    label: 'Age Distribution',
    getValue: (member) => formatAgeDistribution(member),
  },
  {
    key: 'audience_gender_distribution', // FIXED: Match table column key
    label: 'Audience Gender',
    getValue: (member) => formatAudienceGender(member),
  },

  {
    key: 'audience_locations',
    label: 'Audience Locations',
    getValue: (member) => formatAudienceLocations(member),
  },

  // ========== NEW COLUMNS START ==========

  // Tags Column - Multiple tags joined with comma
  {
    key: 'tags',
    label: 'Tags',
    getValue: (member) => {
      const tags = (member as any).tags;
      if (!tags || !Array.isArray(tags) || tags.length === 0) return 'N/A';
      return tags
        .map((tag: any) => tag.tag || tag.name)
        .filter(Boolean)
        .join(', ');
    },
  },

  // X-Campaigns Column - Multiple past campaigns with names and prices
  {
    key: 'x_campaigns',
    label: 'X-Campaigns',
    getValue: (member) => {
      const pastCampaigns = (member as any).past_campaigns;
      if (
        !pastCampaigns ||
        !Array.isArray(pastCampaigns) ||
        pastCampaigns.length === 0
      ) {
        return 'N/A';
      }
      return pastCampaigns
        .map((campaign: any) => {
          const name = campaign.campaign_name || 'Unknown Campaign';
          const price = campaign.total_price;
          const currency = campaign.currency || '';
          if (price && Number(price) > 0) {
            return `${name} (${currency} ${formatNumber(Number(price))})`;
          }
          return name;
        })
        .join(' | ');
    },
  },

  // Language Column
  {
    key: 'language',
    label: 'Language',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'language');
      if (!value) return 'N/A';
      // Capitalize first letter
      return String(value).charAt(0).toUpperCase() + String(value).slice(1);
    },
  },

  // ========== SOCIAL PLATFORM COLUMNS (7 Separate Columns) ==========

  // TikTok Column
  {
    key: 'social_tiktok',
    label: 'TikTok',
    getValue: (member) => getSocialPlatformData(member, 'tiktok'),
  },

  // YouTube Column
  {
    key: 'social_youtube',
    label: 'YouTube',
    getValue: (member) => getSocialPlatformData(member, 'youtube'),
  },

  // Threads Column
  {
    key: 'social_threads',
    label: 'Threads',
    getValue: (member) => getSocialPlatformData(member, 'threads'),
  },

  // LinkedIn Column
  {
    key: 'social_linkedin',
    label: 'LinkedIn',
    getValue: (member) => getSocialPlatformData(member, 'linkedin'),
  },

  // Instagram Column
  {
    key: 'social_instagram',
    label: 'Instagram',
    getValue: (member) => getSocialPlatformData(member, 'instagram'),
  },

  // Twitter Column
  {
    key: 'social_twitter',
    label: 'Twitter',
    getValue: (member) => getSocialPlatformData(member, 'twitter'),
  },

  // Facebook Column
  {
    key: 'social_facebook',
    label: 'Facebook',
    getValue: (member) => getSocialPlatformData(member, 'facebook'),
  },

  // ========== END SOCIAL PLATFORM COLUMNS ==========

  // Total Price Column (with approval status)
  {
    key: 'total_price',
    label: 'Total Price',
    getValue: (member) => {
      const totalPrice = Number((member as any).total_price) || 0;
      const currency = member.currency || 'USD';
      const priceApproved = Boolean((member as any).price_approved);

      if (totalPrice <= 0) return 'N/A';

      const status = priceApproved ? 'Approved' : 'Pending';
      return `${currency} ${formatNumber(totalPrice)} (${status})`;
    },
  },

  // CPV Column (Cost Per View)
  {
    key: 'cpv',
    label: 'CPV',
    getValue: (member) => {
      const totalPrice = Number((member as any).total_price) || 0;

      // Get average views from multiple sources
      let avgViews = getAdditionalMetric(member, 'average_views') || 0;

      if (!avgViews || avgViews <= 0) {
        const instagramOptions = getAdditionalMetric(
          member,
          'instagram_options',
        );
        if (instagramOptions?.reel_views) {
          avgViews = instagramOptions.reel_views;
        }
      }

      if (!avgViews || avgViews <= 0) {
        const filterMatch = getAdditionalMetric(member, 'filter_match');
        if (filterMatch?.instagram_options?.reel_views) {
          avgViews = filterMatch.instagram_options.reel_views;
        }
      }

      if (totalPrice <= 0 || avgViews <= 0) return 'N/A';

      const cpv = totalPrice / avgViews;
      return cpv.toFixed(4);
    },
  },

  // Shortlisted Status Column
  {
    key: 'shortlisted_status',
    label: 'Shortlisted Status',
    getValue: (member) => {
      const status = (member as any).shortlisted_status;
      if (!status) return 'Pending';

      const statusName = status.name || status || 'Pending';
      // Capitalize and format
      return String(statusName)
        .split('_')
        .map(
          (word: string) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(' ');
    },
  },

  // Added At Column
  {
    key: 'added_at',
    label: 'Added At',
    getValue: (member) => {
      const createdAt = (member as any).created_at;
      return formatOnboardedDate(createdAt);
    },
  },

  // ========== NEW COLUMNS END ==========
  // Existing columns continue...
  {
    key: 'collaboration_price',
    label: 'Collaboration Price',
    getValue: (member) => {
      // Try multiple sources for the price data
      const priceRaw =
        member.collaboration_price ||
        (member.social_account as any)?.collaboration_price ||
        getAdditionalMetric(member, 'collaboration_price') ||
        getAdditionalMetric(member, 'price');

      const currency =
        member.currency || (member.social_account as any)?.currency || 'USD';

      // ✅ FIXED: Convert string to number if needed
      let price: number | null = null;

      if (priceRaw !== null && priceRaw !== undefined) {
        if (typeof priceRaw === 'string') {
          price = parseFloat(priceRaw);
        } else if (typeof priceRaw === 'number') {
          price = priceRaw;
        }
      }

      // ✅ FIXED: Check if price is a valid number (including 0)
      if (price !== null && !isNaN(price)) {
        return `${currency} ${formatNumber(price)}`;
      }

      return 'N/A';
    },
  },
  {
    key: 'currency',
    label: 'Currency',
    getValue: (member) => member.currency || 'N/A',
  },
  {
    key: 'email',
    label: 'Email',
    getValue: (member) => getContactByType(member, 'email'),
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    getValue: (member) => getContactByType(member, 'whatsapp'),
  },
  {
    key: 'onboarded_date',
    label: 'OnBoarded Date',
    getValue: (member) => {
      // Access onboarded_at from the member object (root level)
      const onboardedAt = (member as any).onboarded_at;
      return formatOnboardedDate(onboardedAt);
    },
  },
  {
    key: 'status',
    label: 'Status',
    getValue: (member) => {
      // Get status from the member object
      const status =
        (member as any).status ||
        (member as any).client_review_status?.name ||
        'pending_review';

      // Convert status to readable format
      return status
        .split('_')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    },
  },
  {
    key: 'telegram',
    label: 'Telegram',
    getValue: (member) => getContactByType(member, 'telegram'),
  },
  {
    key: 'phone',
    label: 'Phone',
    getValue: (member) => getContactByType(member, 'phone'),
  },

  {
    key: 'content_count',
    label: 'Content Count',
    getValue: (member) => {
      const value =
        getAdditionalMetric(member, 'content_count') ||
        member.social_account?.media_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    },
  },
  {
    key: 'subscriber_count',
    label: 'Subscribers',
    getValue: (member) => {
      const value =
        member.social_account?.subscribers_count ||
        getAdditionalMetric(member, 'subscriber_count');
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    },
  },
  {
    key: 'platform_account_type',
    label: 'Account Type',
    getValue: (member) => {
      const value = getAdditionalMetric(member, 'platform_account_type');
      if (!value) return 'N/A';
      return String(value)
        .replace('_', ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
    },
  },
  // NEW: Simple Price Column (without approval status)
  {
    key: 'price',
    label: 'Price',
    getValue: (member) => {
      const totalPrice = Number((member as any).total_price) || 0;
      const currency = member.currency || 'USD';

      if (totalPrice <= 0) return 'N/A';

      return `${currency} ${formatNumber(totalPrice)}`;
    },
  },
  {
    key: 'media_count',
    label: 'Media Count',
    getValue: (member) => {
      const value = member.social_account?.media_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    },
  },
  {
    key: 'following_count',
    label: 'Following',
    getValue: (member) => {
      const value = member.social_account?.following_count;
      return typeof value === 'number' ? formatNumber(value) : 'N/A';
    },
  },

  {
    key: 'contact_details_email',
    label: 'Email (Details)',
    getValue: (member) => getContactFromDetails(member, 'email'),
  },
  {
    key: 'contact_details_phone',
    label: 'Contact',
    getValue: (member) => getContactFromDetails(member, 'phone'),
  },
];

// Updated prepare data function - Username after Name, Profile URL in third position, CPV after Profile URL
const prepareExportData = (
  members: CampaignListMember[],
  visibleColumnKeys: string[],
) => {
  const allColumns = getAllExportColumns();

  // FIXED: Maintain the order from visibleColumnKeys, not from allColumns
  const visibleColumns = visibleColumnKeys
    .map((key) => allColumns.find((col) => col.key === key))
    .filter((col): col is ExportColumnDefinition => col !== undefined);

  console.log('🔍 DEBUG: Filtering columns...');
  console.log('🔍 DEBUG: Requested column keys:', visibleColumnKeys);
  console.log(
    '🔍 DEBUG: Available column keys:',
    allColumns.map((col) => col.key),
  );
  console.log(
    '🔍 DEBUG: Filtered visible columns:',
    visibleColumns.map((col) => col.key),
  );

  return members.map((member, index) => {
    const rowData: Record<string, any> = {};

    // Get the Profile URL and Username values for positioning
    const profileUrl =
      member.social_account?.account_url ||
      getAdditionalMetric(member, 'url') ||
      'N/A';

    const username =
      member.social_account?.account_handle ||
      getAdditionalMetric(member, 'username') ||
      'N/A';
    const usernameValue = username.startsWith('@') ? username : `@${username}`;

    // Get CPV value for positioning after Profile URL
    const cpvColumn = allColumns.find((col) => col.key === 'cpv');
    const cpvValue = cpvColumn ? cpvColumn.getValue(member) : 'N/A';
    const includeCpv = visibleColumnKeys.includes('cpv');

    // Process visible columns in order, but collect them first
    const columnData: Array<{ label: string; value: any; key: string }> = [];

    visibleColumns.forEach((column) => {
      const value = column.getValue(member);
      columnData.push({ label: column.label, value, key: column.key });

      // Debug log for first member only to avoid console spam
      if (index === 0) {
        console.log(
          `🔍 DEBUG: Column "${column.key}" (${column.label}):`,
          value,
        );

        // Special debug for audience columns
        if (column.key.includes('audience')) {
          const additionalMetrics = member?.social_account?.additional_metrics;
          console.log(`🔍 DEBUG: Raw additional_metrics for ${column.key}:`, {
            filter_match: additionalMetrics?.filter_match,
            audience_demographics: additionalMetrics,
            audience_locations: additionalMetrics,
            audience_age_groups: additionalMetrics,
          });
        }
      }
    });

    // FIXED: Only export columns that are explicitly selected
    // No auto-adding of Username, Profile URL, or any other columns

    // Simply add all visible columns in their selected order
    columnData.forEach((column) => {
      rowData[column.label] = column.value;
    });

    return rowData;
  });
};

// Export to Excel (XLSX)
export const exportToExcel = (
  members: CampaignListMember[],
  campaignName?: string,
  visibleColumnKeys?: string[],
) => {
  try {
    // KEY MAPPING: Map table column keys to export column keys
    // This ensures table column names translate correctly to export columns
    const keyMapping: Record<string, string | string[]> = {
      contact: ['contact_details_phone', 'contact_details_email', 'telegram'], // Table 'contact' -> Export phone, email, telegram
      social: [
        // Table 'social' -> Export all social platform columns
        'social_tiktok',
        'social_youtube',
        'social_threads',
        'social_linkedin',
        'social_instagram',
        'social_twitter',
        'social_facebook',
      ],
    };

    // Transform visible column keys using the mapping
    const transformVisibleColumns = (keys: string[]): string[] => {
      const transformed: string[] = [];

      keys.forEach((key) => {
        if (keyMapping[key]) {
          const mapped = keyMapping[key];
          if (Array.isArray(mapped)) {
            const allColumns = getAllExportColumns();
            mapped.forEach((mappedKey) => {
              const column = allColumns.find((col) => col.key === mappedKey);
              if (column) {
                // Only add if at least one member has data for this column
                const hasData = members.some((member) => {
                  const value = column.getValue(member);
                  return value && value !== 'N/A';
                });
                if (hasData) {
                  transformed.push(mappedKey);
                }
              }
            });
          } else {
            transformed.push(mapped);
          }
        } else {
          transformed.push(key);
        }
      });

      return transformed;
    };

    // Updated default columns to include new audience columns with FIXED keys
    // Updated default columns to include all new columns
    const defaultColumns = [
      'name',
      'username',
      'cpv',
      'location',
      'gender',
      'age_group',
      'followers',
      'verified',
      'engagement_rate',
      'avg_likes',
      'avg_views',
      'audience_age_groups',
      'age_distribution',
      'audience_gender_distribution',
      'audience_locations',
      'tags',
      'x_campaigns',
      'language',
      'total_price',
      'shortlisted_status',
      'added_at',
      'collaboration_price',
      'currency',
      'content_count',
      'subscriber_count',
      'platform_account_type',
      'price', // NEW: Price column after Account Type
      'media_count',
      'following_count',
      'onboarded_date',
      'status',
      'email',
      'whatsapp',
      'telegram',
      'phone',
      'contact_details_email',
      'contact_details_phone',
      // Social Platform Columns at the end
      'social_tiktok',
      'social_youtube',
      'social_threads',
      'social_linkedin',
      'social_instagram',
      'social_twitter',
      'social_facebook',
    ];
    // Start with visible columns or default columns
    // Start with visible columns or default columns
    let columnsToExport = visibleColumnKeys
      ? transformVisibleColumns(visibleColumnKeys)
      : defaultColumns;

    // REMOVED: No longer auto-add contact columns
    // Only export columns that user has explicitly selected

    // REMOVED: No longer auto-add social columns
    // Social columns will only be exported if they are in visibleColumnKeys

    const exportData = prepareExportData(members, columnsToExport);

    // Ensure we have data to export
    if (!exportData || exportData.length === 0) {
      throw new Error('No data to export');
    }

    // Debug: Log sample data from first row to verify data extraction
    if (exportData.length > 0) {
      const firstRow = exportData[0];
    }

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Create worksheet with data
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set dynamic column widths with wider columns for new audience data
    // Set dynamic column widths with wider columns for new columns
    const columnCount = Object.keys(exportData[0] || {}).length;
    const columnWidths = Array(columnCount)
      .fill(0)
      .map((_, index) => {
        const keys = Object.keys(exportData[0] || {});
        const key = keys[index];

        if (key && (key.includes('Name') || key.includes('Username'))) {
          return { wch: 25 };
        } else if (
          key &&
          (key.includes('Audience') || key.includes('Age Distribution'))
        ) {
          return { wch: 35 }; // Wider columns for audience demographic data
        } else if (key && key.includes('Location')) {
          return { wch: 30 }; // Wider for location data
        } else if (
          key &&
          (key === 'Email' ||
            key === 'WhatsApp' ||
            key === 'Telegram' ||
            key === 'Email (Details)')
        ) {
          return { wch: 30 }; // Wide columns for contact information
        } else if (key && key === 'Profile URL') {
          return { wch: 40 }; // Wide column for URLs
        } else if (key && key.includes('Collaboration Price')) {
          return { wch: 20 }; // Medium width for price
        } else if (key && (key === 'Tags' || key === 'X-Campaigns')) {
          return { wch: 40 }; // Wide columns for Tags and X-Campaigns (multiple values)
        } else if (key && key === 'Social Links') {
          return { wch: 50 }; // Extra wide for multiple social links
        } else if (key && key === 'Total Price') {
          return { wch: 25 }; // Medium width for total price with status
        } else if (key && key === 'Shortlisted Status') {
          return { wch: 18 }; // Width for status
        } else if (key && (key === 'Added At' || key === 'OnBoarded Date')) {
          return { wch: 15 }; // Width for dates
        } else if (key && key === 'CPV') {
          return { wch: 12 }; // Width for CPV
        } else if (key && key === 'Language') {
          return { wch: 12 }; // Width for language
        } else if (key && key === 'Price') {
          return { wch: 18 }; // Width for price
        } else if (
          key &&
          (key === 'TikTok' ||
            key === 'YouTube' ||
            key === 'Threads' ||
            key === 'LinkedIn' ||
            key === 'Instagram' ||
            key === 'Twitter' ||
            key === 'Facebook')
        ) {
          return { wch: 35 }; // Width for social platform URLs
        } else {
          return { wch: 15 };
        }
      });
    ws['!cols'] = columnWidths;

    // Add worksheet to workbook
    let sheetName = 'Shortlisted Influencers';

    if (campaignName) {
      const maxLength = 31;
      const suffix = ' Influencers';
      const availableLength = maxLength - suffix.length;

      if (campaignName.length <= availableLength) {
        sheetName = `${campaignName}${suffix}`;
      } else {
        const truncatedName =
          campaignName.substring(0, availableLength - 3) + '...';
        sheetName = `${truncatedName}${suffix}`;
      }

      if (sheetName.length > maxLength) {
        sheetName = sheetName.substring(0, maxLength);
      }
    }

    console.log(
      `📋 Using sheet name: "${sheetName}" (${sheetName.length} chars)`,
    );
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    let filename = `shortlisted_influencers_${timestamp}.xlsx`;

    if (campaignName) {
      const cleanCampaignName = campaignName
        .replace(/[^a-zA-Z0-9\s]/g, '_')
        .replace(/\s+/g, '_');
      filename = `${cleanCampaignName}_influencers_${timestamp}.xlsx`;
    }

    console.log(`💾 Using filename: "${filename}"`);

    // Save file
    XLSX.writeFile(wb, filename);

    console.log(
      '✅ Excel export completed successfully with Profile URL in second position',
    );
    return true;
  } catch (error) {
    console.error('❌ Error exporting to Excel:', error);
    throw new Error('Failed to export to Excel');
  }
};

// Updated main export function
export const exportInfluencers = async (
  members: CampaignListMember[],
  campaignName?: string,
  visibleColumnKeys?: string[],
) => {
  try {
    if (members.length === 0) {
      throw new Error('No influencers to export');
    }

    await exportToExcel(members, campaignName, visibleColumnKeys);
    return true;
  } catch (error) {
    console.error('❌ Export failed:', error);
    throw error;
  }
};
