// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ShortlistedSummaryV2.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import CountUp from 'react-countup';
import { 
  Users, Eye, Heart, TrendingUp, 
  DollarSign, Target, MapPin, BarChart3 
} from 'lucide-react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';

// ============ TYPES ============
interface ShortlistedSummaryV2Props {
  selectedInfluencers: string[];
  influencers: CampaignListMember[];
  onClearSelection: () => void;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  color: 'blue' | 'purple' | 'pink' | 'green' | 'orange' | 'cyan';
  delay?: number;
  decimals?: number;
  formatAsCompact?: boolean; // NEW: Format as K, M
}

// ============ NUMBER FORMATTER (K, M) ============
const formatCompactNumber = (num: number): { value: number; suffix: string; decimals: number } => {
  if (num >= 1000000) {
    return { value: num / 1000000, suffix: 'M', decimals: 2 };
  }
  if (num >= 1000) {
    return { value: num / 1000, suffix: 'K', decimals: num >= 10000 ? 0 : 1 };
  }
  return { value: num, suffix: '', decimals: 0 };
};

// ============ COLOR MAP (Gradient/Transparent) ============
const colorMap = {
  blue: {
    bg: 'from-blue-100/60 to-blue-50/30',
    icon: 'bg-blue-500',
    text: 'text-blue-600',
  },
  purple: {
    bg: 'from-purple-100/60 to-purple-50/30',
    icon: 'bg-purple-500',
    text: 'text-purple-600',
  },
  pink: {
    bg: 'from-pink-100/60 to-pink-50/30',
    icon: 'bg-pink-500',
    text: 'text-pink-600',
  },
  green: {
    bg: 'from-emerald-100/60 to-emerald-50/30',
    icon: 'bg-emerald-500',
    text: 'text-emerald-600',
  },
  orange: {
    bg: 'from-orange-100/60 to-orange-50/30',
    icon: 'bg-orange-500',
    text: 'text-orange-600',
  },
  cyan: {
    bg: 'from-cyan-100/60 to-cyan-50/30',
    icon: 'bg-cyan-500',
    text: 'text-cyan-600',
  },
};

// ============ STAT CARD COMPONENT ============
const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  color,
  delay = 0,
  decimals = 0,
  formatAsCompact = false,
}) => {
  const colors = colorMap[color];
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  // Format number if compact mode enabled
  const displayData = formatAsCompact 
    ? formatCompactNumber(value)
    : { value, suffix, decimals };

  const finalSuffix = formatAsCompact 
    ? displayData.suffix + suffix 
    : suffix;

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl p-3
        bg-gradient-to-br ${colors.bg}
        border border-white/50
        transition-all duration-300 ease-out
        cursor-default
        hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
      style={{ transitionDelay: `${delay * 50}ms` }}
    >
      <div className="relative z-10">
        {/* Icon */}
        <div className={`
          w-9 h-9 rounded-lg ${colors.icon}
          flex items-center justify-center mb-2
        `}>
          <Icon className="w-4 h-4 text-white" />
        </div>

        {/* Label */}
        <p className="text-[10px] font-semibold text-gray-500 mb-0.5 uppercase tracking-wide">
          {label}
        </p>

        {/* Value */}
        <div className={`text-lg font-bold ${colors.text} flex items-baseline`}>
          <span className="text-xs mr-0.5">{prefix}</span>
          <CountUp
            end={displayData.value}
            duration={1.5}
            delay={delay}
            separator=","
            decimals={formatAsCompact ? displayData.decimals : decimals}
            decimal="."
            enableScrollSpy
            scrollSpyOnce
          />
          <span className="text-xs ml-0.5">{finalSuffix}</span>
        </div>
      </div>
    </div>
  );
};

// ============ GENDER BAR COMPONENT (Compact) ============
const GenderBar: React.FC<{ male: number; female: number }> = ({ male, female }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-1.5">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out"
          style={{ width: animate ? `${male}%` : '0%' }}
        />
        <div
          className="bg-gradient-to-r from-pink-400 to-pink-500 transition-all duration-1000 ease-out delay-150"
          style={{ width: animate ? `${female}%` : '0%' }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
          M: {male.toFixed(1)}%
        </span>
        <span className="flex items-center gap-1">
          F: {female.toFixed(1)}%
          <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
        </span>
      </div>
    </div>
  );
};

// ============ LOCATION CARD COMPONENT (Compact) ============
const LocationCard: React.FC<{ 
  country: string; 
  percentage: number; 
  countryCode: string;
}> = ({ country, percentage, countryCode }) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <img
        src={`https://flagcdn.com/48x36/${countryCode?.toLowerCase() || 'pk'}.png`}
        alt={country}
        className="w-7 h-5 rounded object-cover border border-gray-200"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium text-gray-700">{country}</span>
          <span className="text-xs font-semibold text-emerald-600">{percentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: animate ? `${percentage}%` : '0%' }}
          />
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
const ShortlistedSummaryV2: React.FC<ShortlistedSummaryV2Props> = ({
  selectedInfluencers,
  influencers,
  onClearSelection,
}) => {
  const isShowingAll = selectedInfluencers.length === 0;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const summary = useMemo(() => {
    const activeInfluencers = influencers.filter(
      (inf) => !(inf as any).deleted_at,
    );

    const selectedData = isShowingAll
      ? activeInfluencers
      : activeInfluencers.filter((inf) =>
          selectedInfluencers.includes(inf.id || ''),
        );

    if (selectedData.length === 0) return null;

    const totals = selectedData.reduce(
      (acc, influencer) => {
        const additionalMetrics = influencer.social_account?.additional_metrics as any;
        const platformName =
          (influencer.social_account as any)?.platform?.name?.toLowerCase() ||
          (additionalMetrics?.work_platform?.name || '').toLowerCase();

        // Followers
        if (platformName === 'youtube') {
          acc.followers +=
            influencer.social_account?.subscribers_count ||
            additionalMetrics?.subscriber_count ||
            influencer.social_account?.followers_count || 0;
        } else {
          acc.followers += influencer.social_account?.followers_count || 0;
        }

        // Avg Likes
        const avgLikesValue = additionalMetrics?.average_likes;
        if (typeof avgLikesValue === 'number' && !isNaN(avgLikesValue) && avgLikesValue > 0) {
          acc.avgLikes += avgLikesValue;
        }

        // Avg Views
        const reelViews1 = additionalMetrics?.instagram_options?.reel_views;
        const reelViews2 = additionalMetrics?.filter_match?.instagram_options?.reel_views;
        const avgViewsValue = additionalMetrics?.average_views;

        if (typeof reelViews1 === 'number' && reelViews1 > 0) {
          acc.avgViews += reelViews1;
        } else if (typeof reelViews2 === 'number' && reelViews2 > 0) {
          acc.avgViews += reelViews2;
        } else if (typeof avgViewsValue === 'number' && avgViewsValue > 0) {
          acc.avgViews += avgViewsValue;
        }

        // Engagement Rate
        let engRate = additionalMetrics?.engagementRate || additionalMetrics?.engagement_rate || 0;
        if (typeof engRate === 'number' && engRate > 0) {
          if (engRate < 1) engRate = engRate * 100;
          acc.engagementRateSum += engRate;
          acc.engagementCount++;
        }

        // Budget
        const priceApproved = (influencer as any).price_approved;
        const totalPrice = (influencer as any).total_price;
        
        if (priceApproved && totalPrice) {
          const price = parseFloat(String(totalPrice)) || 0;
          acc.totalBudget += price;
          if (acc.avgViews > 0) {
            acc.cpvSum += price;
          }
        }

        // Gender distribution
        const filterMatch = additionalMetrics?.filter_match;
        const genderData = filterMatch?.audience_gender || 
          additionalMetrics?.audience_demographics?.gender_distribution;
        
        if (Array.isArray(genderData)) {
          genderData.forEach((gender: any) => {
            const type = (gender.type || '').toUpperCase();
            const percentage = gender.percentage_value || 0;
            if (type === 'MALE') acc.maleSum += percentage;
            else if (type === 'FEMALE') acc.femaleSum += percentage;
          });
          acc.genderCount++;
        }

        // Top location
        const audienceLocations = additionalMetrics?.audience_locations || 
          filterMatch?.audience_locations;
        
        if (Array.isArray(audienceLocations) && audienceLocations.length > 0) {
          const topLoc = audienceLocations[0];
          const locName = topLoc.name || topLoc.country || 'Unknown';
          const locPercentage = topLoc.percentage_value || 0;
          const locCode = topLoc.code || topLoc.country_code || 'PK';

          if (!acc.locationMap[locName]) {
            acc.locationMap[locName] = { total: 0, count: 0, code: locCode };
          }
          acc.locationMap[locName].total += locPercentage;
          acc.locationMap[locName].count++;
        }

        return acc;
      },
      {
        followers: 0,
        avgViews: 0,
        avgLikes: 0,
        engagementRateSum: 0,
        engagementCount: 0,
        totalBudget: 0,
        cpvSum: 0,
        maleSum: 0,
        femaleSum: 0,
        genderCount: 0,
        locationMap: {} as Record<string, { total: number; count: number; code: string }>,
      },
    );

    const avgEngagement = totals.engagementCount > 0 
      ? totals.engagementRateSum / totals.engagementCount 
      : 0;

    const avgCPV = totals.avgViews > 0 && totals.cpvSum > 0 
      ? totals.cpvSum / totals.avgViews 
      : 0;

    const avgMale = totals.genderCount > 0 ? totals.maleSum / totals.genderCount : 0;
    const avgFemale = totals.genderCount > 0 ? totals.femaleSum / totals.genderCount : 0;

    let topLocation: { name: string; percentage: number; countryCode: string } | null = null;
    const locationEntries = Object.entries(totals.locationMap);
    if (locationEntries.length > 0) {
      const sorted = locationEntries.sort((a, b) => 
        (b[1].total / b[1].count) - (a[1].total / a[1].count)
      );
      const top = sorted[0];
      topLocation = {
        name: top[0],
        percentage: parseFloat((top[1].total / top[1].count).toFixed(1)),
        countryCode: top[1].code,
      };
    }

    return {
      count: selectedData.length,
      followers: totals.followers,
      avgViews: totals.avgViews,
      avgLikes: totals.avgLikes,
      engagementRate: avgEngagement,
      totalBudget: totals.totalBudget,
      avgCPV: avgCPV,
      genderMale: avgMale,
      genderFemale: avgFemale,
      topLocation,
    };
  }, [selectedInfluencers, influencers, isShowingAll]);

  if (!summary) return null;

  return (
    <div
      className={`
        mb-4 p-4 rounded-xl bg-white
        border border-gray-100
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {/* Compact Header - Inline with icon */}
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            {isShowingAll ? 'All Influencers Summary' : 'Selected Summary'}
          </h3>
          <span className="text-xs text-gray-500">
            {summary.count} influencer{summary.count !== 1 ? 's' : ''}
          </span>
        </div>
        {!isShowingAll && (
          <button
            onClick={onClearSelection}
            className="ml-auto px-2 py-1 text-[10px] font-medium text-gray-500 
                       bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats Grid - WITH COMPACT NUMBER FORMATTING */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-3">
        <StatCard
          icon={Users}
          label="Total Followers"
          value={summary.followers}
          color="blue"
          delay={0}
          formatAsCompact={true}
        />
        <StatCard
          icon={Eye}
          label="Total Avg Views"
          value={summary.avgViews}
          color="purple"
          delay={0.05}
          formatAsCompact={true}
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Engagement"
          value={summary.engagementRate}
          suffix="%"
          color="pink"
          delay={0.1}
          decimals={2}
        />
        <StatCard
          icon={Heart}
          label="Total Avg Likes"
          value={summary.avgLikes}
          color="orange"
          delay={0.15}
          formatAsCompact={true}
        />
        <StatCard
          icon={DollarSign}
          label="Total Budget"
          value={summary.totalBudget}
          prefix="Rs"
          color="green"
          delay={0.2}
          formatAsCompact={true}
        />
        <StatCard
          icon={Target}
          label="Avg CPV"
          value={summary.avgCPV}
          color="cyan"
          delay={0.25}
          decimals={2}
        />
      </div>

      {/* Gender & Location Row - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3" />
            Audience Gender
          </p>
          <GenderBar male={summary.genderMale} female={summary.genderFemale} />
        </div>

        {summary.topLocation && (
          <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              Audience Locations
            </p>
            <LocationCard
              country={summary.topLocation.name}
              percentage={summary.topLocation.percentage}
              countryCode={summary.topLocation.countryCode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistedSummaryV2;