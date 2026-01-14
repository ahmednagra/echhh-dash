// src/components/dashboard/profile-analytics/sections/AnalyticsSection.tsx
'use client';

import { Profile, Pricing } from '@/types/insightiq/profile-analytics';
import { validateSectionProps, safeProfileAccess } from '@/types/section-component-types';

interface AnalyticsSectionProps {
  profile: Profile;
  pricing: Pricing | null;
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number) => string;
  getInfluencerTier: (followers: number) => string;
  getEngagementLevel: (rate: number) => { level: string };
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  profile,
  pricing,
  formatNumber,
  formatCurrency,
  getInfluencerTier,
  getEngagementLevel
}) => {
  // Validate props
  const validation = validateSectionProps(profile);
  if (!validation.isValid) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <p className="text-gray-500">{validation.error}</p>
        </div>
      </div>
    );
  }

  // Safe access to profile data with fallbacks
  const audience = safeProfileAccess(profile, p => p.audience, null);
  const audienceCountries = audience?.countries ?? [];
  const credibilityScore = audience?.credibility_score ?? 0;

  return (
    <div className="space-y-8">
      {/* Report Summary */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 text-white">
        <h3 className="text-xl font-semibold mb-6">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-medium mb-4">Profile Highlights</h4>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• {getInfluencerTier(profile.follower_count)} with {formatNumber(profile.follower_count)} followers</li>
              <li>• {getEngagementLevel(profile.engagement_rate).level} engagement rate ({profile.engagement_rate.toFixed(2)}%)</li>
              <li>• Audience primarily from {audienceCountries.length > 0 ? audienceCountries[0].code : 'NA'} ({audienceCountries.length > 0 ? audienceCountries[0].value.toFixed(1) : '0'}%)</li>
              <li>• {(credibilityScore * 100).toFixed(1)}% audience credibility score</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Collaboration Potential</h4>
            <ul className="space-y-2 text-sm opacity-90">
              {pricing && (
                <li>• Estimated post value: {formatCurrency(pricing.post_type.static_post.price_range.min)} - {formatCurrency(pricing.post_type.static_post.price_range.max)}</li>
              )}
              <li>• Best performing content type: Reels ({formatNumber(profile.average_reels_views)} avg views)</li>
              <li>• Target audience: {profile.gender || 'Not specified'} {profile.age_group || 'Not specified'}</li>
              <li>• Geographic reach: {audienceCountries.length}+ countries</li>
              <li>• Brand safety: {profile.is_verified ? 'Verified account' : 'Unverified account'}</li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-sm opacity-75">
            Report generated on {new Date(profile.report_generated_at).toLocaleDateString()} • 
            Data last updated {new Date(profile.updated_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;