// src/types/section-component-types.ts
// Common types for section components

import { Profile, Pricing, PriceExplanations } from '@/types/insightiq/profile-analytics';

// Common formatter functions type
export interface FormatterFunctions {
  formatNumber: (num: number) => string;
  formatCurrency?: (amount: number) => string;
}

// Common analysis functions type
export interface AnalysisFunctions {
  getEngagementLevel: (rate: number) => { level: string; color: string; bg: string };
  getInfluencerTier: (followers: number) => string;
}

// Base props that most sections need
export interface BaseSectionProps extends FormatterFunctions {
  profile: Profile;
}

// Extended props for sections that need analysis functions
export interface AnalyticsSectionProps extends BaseSectionProps, AnalysisFunctions {
  formatCurrency: (amount: number) => string;
}

// Props for pricing section specifically
// export interface PricingSectionProps extends FormatterFunctions {
//   profile: Profile;
//   pricing: Pricing | null;
//   price_explanations: PriceExplanations | null;
//   formatCurrency: (amount: number) => string;
// }

// Props for sections that need all utilities
// export interface FullAnalyticsSectionProps extends BaseSectionProps, AnalysisFunctions {
//   pricing: Pricing | null;
//   formatCurrency: (amount: number) => string;
// }

// Type guard to check if profile data is complete
export function isProfileDataComplete(profile: Profile | null | undefined): profile is Profile {
  return !!(profile && 
    profile.external_id && 
    profile.platform_username && 
    profile.full_name &&
    typeof profile.follower_count === 'number' &&
    typeof profile.engagement_rate === 'number'
  );
}

// Helper to safely access nested profile properties
export function safeProfileAccess<T>(
  profile: Profile | null | undefined,
  accessor: (profile: Profile) => T,
  fallback: T
): T {
  try {
    if (!profile) return fallback;
    return accessor(profile) ?? fallback;
  } catch {
    return fallback;
  }
}

// Common validation for section components
export function validateSectionProps(profile: Profile | null | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!profile) {
    return { isValid: false, error: 'Profile data is required' };
  }

  if (!isProfileDataComplete(profile)) {
    return { isValid: false, error: 'Profile data is incomplete' };
  }

  return { isValid: true };
}