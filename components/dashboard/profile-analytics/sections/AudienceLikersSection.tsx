// src/components/dashboard/profile-analytics/sections/AudienceLikersSection.tsx
'use client';

import { 
  Users, 
  Flag,
  MapPin, 
  Languages,
  UserCheck,
  Star,
  Heart,
  Verified,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Eye,
  AlertCircle
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience_likers?: Profile['audience_likers'];
}

interface AudienceLikersSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceLikersSection: React.FC<AudienceLikersSectionProps> = ({
  profile,
  formatNumber
}) => {
  // Country code to name mapping
  const countryNames: { [key: string]: string } = {
    'PK': 'Pakistan',
    'US': 'United States',
    'IN': 'India',
    'SA': 'Saudi Arabia',
    'GB': 'United Kingdom',
    'AE': 'United Arab Emirates',
    'BD': 'Bangladesh',
    'TR': 'Turkey',
    'CA': 'Canada',
    'AU': 'Australia',
    'FR': 'France',
    'DE': 'Germany',
    'IT': 'Italy',
    'ES': 'Spain',
    'BR': 'Brazil',
    'MX': 'Mexico',
    'ID': 'Indonesia',
    'MY': 'Malaysia',
    'TH': 'Thailand',
    'SG': 'Singapore',
    'JP': 'Japan',
    'KR': 'South Korea',
    'CN': 'China',
    'RU': 'Russia',
    'EG': 'Egypt',
    'NG': 'Nigeria',
    'ZA': 'South Africa',
    'AR': 'Argentina',
    'CL': 'Chile',
    'CO': 'Colombia',
    'PE': 'Peru'
  };

  // Language code to name mapping
  const languageNames: { [key: string]: string } = {
    'en': 'English',
    'ar': 'Arabic',
    'de': 'German',
    'ur': 'Urdu',
    'ru': 'Russian',
    'es': 'Spanish',
    'fr': 'French',
    'pt': 'Portuguese',
    'it': 'Italian',
    'th': 'Thai',
    'id': 'Indonesian',
    'az': 'Azerbaijani',
    'he': 'Hebrew',
    'nl': 'Dutch',
    'tr': 'Turkish',
    'fa': 'Persian',
    'arz': 'Egyptian Arabic',
    'da': 'Danish',
    'sw': 'Swahili',
    'ckb': 'Central Kurdish',
    'pnb': 'Punjabi',
    'hi': 'Hindi',
    'bn': 'Bengali',
    'vi': 'Vietnamese',
    'pl': 'Polish',
    'uk': 'Ukrainian',
    'sco': 'Scots',
    'fi': 'Finnish',
    'other': 'Other'
  };

  const getCountryName = (code: string) => countryNames[code] || code;
  const getLanguageName = (code: string) => languageNames[code] || code.toUpperCase();

  const getFollowerTypeColor = (type: string) => {
    switch (type) {
      case 'real': return 'bg-green-500';
      case 'mass_followers': return 'bg-yellow-500';
      case 'suspicious': return 'bg-red-500';
      case 'influencers': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getFollowerTypeLabel = (type: string) => {
    switch (type) {
      case 'real': return 'Real Followers';
      case 'mass_followers': return 'Mass Followers';
      case 'suspicious': return 'Suspicious';
      case 'influencers': return 'Influencers';
      default: return type.replace('_', ' ');
    }
  };

  const getCredibilityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Calculate percentage for likers interests (matching AudienceSection approach)
  const calculateInterestPercentages = () => {
    const interests = profile?.audience_likers?.interests || [];
    const totalSum = interests.reduce((sum, interest) => sum + (interest.value || 0), 0);
    
    return interests.map(interest => ({
      ...interest,
      percentage: totalSum > 0 ? ((interest.value || 0) / totalSum) * 100 : 0
    }));
  };

  // Filter states with 10% or higher percentage
  const getFilteredStates = () => {
    return profile?.audience_likers?.states?.filter(state => (state.value || 0) >= 10) || [];
  };

  const shouldShowStates = () => {
    return getFilteredStates().length > 0;
  };

  // Prepare data for charts
  const prepareGenderPieData = () => {
    return profile?.audience_likers?.gender_distribution?.map(gender => ({
      id: gender.gender,
      label: gender.gender,
      value: gender.value,
      color: gender.gender === 'MALE' ? '#3B82F6' : '#EC4899'
    })) || [];
  };

  const prepareAgeData = () => {
    return profile?.audience_likers?.gender_age_distribution ? profile.audience_likers.gender_age_distribution
      .reduce((acc: any[], curr) => {
        const existing = acc.find(item => item.age_range === curr.age_range);
        if (existing) {
          existing.value += curr.value;
        } else {
          acc.push({ age_range: curr.age_range, value: curr.value });
        }
        return acc;
      }, [])
      .sort((a, b) => {
        const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
        return ageOrder.indexOf(a.age_range) - ageOrder.indexOf(b.age_range);
      }) : [];
  };

  const prepareAgePieData = () => {
    const ageData = prepareAgeData();
    const colors = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    return ageData.map((age, index) => ({
      id: age.age_range,
      label: `${age.age_range} years`,
      value: age.value,
      color: colors[index] || '#6B7280'
    }));
  };

  const prepareGenderAgeBarData = () => {
    if (!profile?.audience_likers?.gender_age_distribution) return [];
    
    const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-64'];
    
    return ageRanges.map(ageRange => {
      const maleData = profile.audience_likers.gender_age_distribution.find(
        item => item.age_range === ageRange && item.gender === 'MALE'
      );
      const femaleData = profile.audience_likers.gender_age_distribution.find(
        item => item.age_range === ageRange && item.gender === 'FEMALE'
      );
      
      return {
        ageRange,
        Male: maleData?.value || 0,
        Female: femaleData?.value || 0
      };
    });
  };

  // Helper function to determine if a score range contains the user's score
  const isUserScoreRange = (min: number | null, max: number | null, userScore: number) => {
    const userScorePercent = userScore * 100;
    if (min === null || min === undefined) {
      return userScorePercent <= (max ?? 100);
    }
    if (max === null || max === undefined) {
      return userScorePercent >= min;
    }
    return userScorePercent >= min && userScorePercent <= max;
  };

  // Prepare credibility score data with proper sorting (left to right)
  const prepareCredibilityScoreData = () => {
    if (!profile?.audience_likers?.credibility_score_band) {
      console.log('No likers credibility score band data available');
      return [];
    }
    
    const userScore = profile?.audience_likers?.credibility_score || 0;
    console.log('Likers credibility score:', userScore, 'as percentage:', userScore * 100);
    
    // Sort the data by minimum score to ensure left-to-right ordering
    const sortedData = profile.audience_likers.credibility_score_band
      .map((band, index) => {
        const minScore = band.min ?? 0;
        const maxScore = band.max ?? 100;
        const isUserRange = isUserScoreRange(band.min, band.max, userScore);
        
        console.log(`Likers Band ${index}: ${minScore}-${maxScore}, User in range: ${isUserRange}, Profile count: ${band.total_profile_count}`);
        
        return {
          id: `range-${index}`,
          scoreRange: minScore === 0 && band.min === null 
            ? `0-${maxScore.toFixed(0)}%` 
            : maxScore === 100 && band.max === null 
            ? `${minScore.toFixed(0)}%+` 
            : `${minScore.toFixed(0)}-${maxScore.toFixed(0)}%`,
          profileCount: band.total_profile_count,
          median: (band as any).is_median === 'True' || (band as any).is_median === true ? 1 : 0,
          userRange: isUserRange ? 1 : 0,
          minScore: minScore,
          maxScore: maxScore,
          sortOrder: minScore, // Use minimum score for sorting
          rawBand: band // Keep original for debugging
        };
      })
      .sort((a, b) => {
        // Sort by minimum score (ascending) to get left-to-right order
        if (a.sortOrder === b.sortOrder) {
          return a.maxScore - b.maxScore;
        }
        return a.sortOrder - b.sortOrder;
      });
    
    console.log('Sorted likers credibility data:', sortedData);
    return sortedData;
  };

  const audienceLikers = profile?.audience_likers;

  // Check if likers data is available and has meaningful content
  const hasLikersData = audienceLikers && (
    (audienceLikers.countries && audienceLikers.countries.length > 0) ||
    (audienceLikers.gender_distribution && audienceLikers.gender_distribution.length > 0) ||
    audienceLikers.credibility_score !== undefined ||
    (audienceLikers.interests && audienceLikers.interests.length > 0)
  );

  if (!hasLikersData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Likers Data Available</h3>
          <p className="text-gray-400 mt-2">
            Likers analytics data is not available for this profile. This could be because:
          </p>
          <div className="mt-4 text-left max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Limited engagement:</strong> The profile may not have received enough likes for analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Privacy settings:</strong> Likes data might be restricted or private.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Recent profile:</strong> Insufficient like history for meaningful analysis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Likers Summary - Top overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Countries</p>
              <p className="text-2xl font-bold text-purple-600">{audienceLikers?.countries?.length || 0}</p>
              <p className="text-xs text-gray-500">represented</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Flag className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Languages</p>
              <p className="text-2xl font-bold text-blue-600">{audienceLikers?.languages?.length || 0}</p>
              <p className="text-xs text-gray-500">spoken</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Languages className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Interests</p>
              <p className="text-2xl font-bold text-green-600">{audienceLikers?.interests?.length || 0}</p>
              <p className="text-xs text-gray-500">categories</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Notable Likers</p>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(audienceLikers?.significant_likers?.length || 0)}</p>
              <p className="text-xs text-gray-500">influencers</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Credibility Score</p>
              <p className="text-2xl font-bold text-emerald-600">{((audienceLikers?.credibility_score || 0) * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-500">quality</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Gender Distribution and Top Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution - Updated styling */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Distribution
          </h4>
          <div className="h-80">
            <ResponsivePie
              data={prepareGenderPieData()}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.4}
              padAngle={3}
              cornerRadius={4}
              activeOuterRadiusOffset={12}
              colors={({ data }) => data.color}
              borderWidth={3}
              borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={3}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#FFFFFF"
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
              arcLabel={(d) => `${d.value.toFixed(1)}%`}
              theme={{
                text: {
                  fontSize: 12,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                },
                tooltip: {
                  container: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    fontSize: '14px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }
                }
              }}
              tooltip={({ datum }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{datum.label}</div>
                    <div className="text-blue-300 font-bold text-sm">{datum.value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center group">
            <Flag className="w-5 h-5 mr-2" />
            Top Countries
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Countries where your likers are located, ranked by percentage
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {audienceLikers?.countries?.map((country, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium">{getCountryName(country.code)}</span>
                <span className="text-purple-600 font-semibold">{country.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Age Distribution and Top Cities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution - Updated styling */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Age Distribution
          </h4>
          <div className="h-80">
            <ResponsivePie
              data={prepareAgePieData()}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.4}
              padAngle={2}
              cornerRadius={4}
              activeOuterRadiusOffset={12}
              colors={({ data }) => data.color}
              borderWidth={3}
              borderColor={{ from: 'color', modifiers: [['darker', 0.3]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={3}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor="#FFFFFF"
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
              arcLabel={(d) => `${d.value.toFixed(1)}%`}
              theme={{
                text: {
                  fontSize: 12,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                },
                tooltip: {
                  container: {
                    background: '#1F2937',
                    color: '#F9FAFB',
                    fontSize: '14px',
                    borderRadius: '8px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }
                }
              }}
              tooltip={({ datum }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{datum.label}</div>
                    <div className="text-blue-300 font-bold text-sm">{datum.value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Top Cities */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center group">
            <MapPin className="w-5 h-5 mr-2" />
            Top Cities
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Cities with the highest concentration of your likers
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {audienceLikers?.cities?.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-sm">{city.name}</span>
                <span className="text-purple-600 font-semibold text-sm">{city.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Breakdown by Age and Likers Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender breakdown by age - Updated styling to match AudienceSection */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Breakdown by Age
          </h4>
          <div className="h-80">
            <ResponsiveBar
              data={prepareGenderAgeBarData()}
              keys={['Male', 'Female']}
              indexBy="ageRange"
              margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
              padding={0.02}
              groupMode="grouped"
              innerPadding={3}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              colors={['#3B82F6', '#EC4899']}
              defs={[
                {
                  id: 'maleGradient',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#3B82F6' },
                    { offset: 100, color: '#1D4ED8' }
                  ]
                },
                {
                  id: 'femaleGradient',
                  type: 'linearGradient',
                  colors: [
                    { offset: 0, color: '#EC4899' },
                    { offset: 100, color: '#DB2777' }
                  ]
                }
              ]}
              fill={[
                {
                  match: {
                    id: 'Male'
                  },
                  id: 'maleGradient'
                },
                {
                  match: {
                    id: 'Female'
                  },
                  id: 'femaleGradient'
                }
              ]}
              borderRadius={4}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 8,
                tickRotation: 0,
                legend: 'Age Range',
                legendPosition: 'middle',
                legendOffset: 32
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 12,
                tickRotation: 0,
                legend: 'Percentage (%)',
                legendPosition: 'middle',
                legendOffset: -60,
                format: value => `${value}%`
              }}
              enableLabel={true}
              label={d => `${(d.value ?? 0).toFixed(1)}%`}
              labelSkipWidth={8}
              labelSkipHeight={8}
              labelTextColor="#ffffff"
              labelFormat={(value) => `${Number(value).toFixed(1)}%`}
              legends={[
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 120,
                  translateY: 0,
                  itemsSpacing: 4,
                  itemWidth: 100,
                  itemHeight: 20,
                  itemDirection: 'left-to-right',
                  itemOpacity: 0.85,
                  symbolSize: 20,
                  effects: [
                    {
                      on: 'hover',
                      style: {
                        itemOpacity: 1
                      }
                    }
                  ]
                }
              ]}
              animate={true}
              motionConfig="gentle"
              theme={{
                background: 'transparent',
                text: {
                  fontSize: 14,
                  fill: '#374151',
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 700
                },
                axis: {
                  domain: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    }
                  },
                  legend: {
                    text: {
                      fontSize: 15,
                      fill: '#6b7280',
                      fontWeight: 700
                    }
                  },
                  ticks: {
                    line: {
                      stroke: '#e5e7eb',
                      strokeWidth: 1
                    },
                    text: {
                      fontSize: 13,
                      fill: '#6b7280',
                      fontWeight: 700
                    }
                  }
                },
                grid: {
                  line: {
                    stroke: '#f3f4f6',
                    strokeWidth: 1
                  }
                }
              }}
              tooltip={({ id, value, indexValue }) => (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                  <div className="flex items-center space-x-3">
                    <div className="font-bold text-sm">{indexValue} years - {id}</div>
                    <div className="text-blue-300 font-bold text-sm">{value.toFixed(1)}%</div>
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Likers Quality - Removed Credibility Score */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <UserCheck className="w-5 h-5 mr-2" />
            Likers Quality
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Assessment of liker authenticity and engagement quality
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-6">
            {audienceLikers.follower_types && (
              <div>
                <h4 className="font-medium mb-3">Follower Types</h4>
                <div className="space-y-3">
                  {audienceLikers.follower_types.map((type, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-600">{getFollowerTypeLabel(type.name)}</span>
                        <span className="font-medium">{type.value?.toFixed(1) || '0.0'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getFollowerTypeColor(type.name)}`}
                          style={{ width: `${type.value || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {audienceLikers.significant_likers_percentage !== undefined && (
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Significant Likers</span>
                  <span className="font-medium">{audienceLikers.significant_likers_percentage?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            )}

            {audienceLikers.likers_not_followers_percentage !== undefined && (
              <div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Likers Not Followers</span>
                  <span className="font-medium">{audienceLikers.likers_not_followers_percentage?.toFixed(1) || '0.0'}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Affinity and Likers Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Affinity - Updated to match AudienceSection format */}
        {audienceLikers.brand_affinity && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Award className="w-5 h-5 mr-2" />
              Brand Affinity
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Brands and companies your likers show interest in
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {audienceLikers.brand_affinity.map((brand, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">{brand.name}</span>
                  <span className="font-medium text-sm">{((brand.value || 0) * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Likers Interests - Updated with percentage calculation */}
        {audienceLikers.interests && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Target className="w-5 h-5 mr-2" />
              Likers Interests
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Topics and categories your likers are most interested in (calculated as percentage of total)
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {calculateInterestPercentages().map((interest, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">{interest.name}</span>
                  <span className="font-medium text-sm">{interest.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credibility Score Distribution and Follower Reachability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credibility Score Distribution - Updated to match AudienceSection */}
        {audienceLikers.credibility_score_band && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-6 flex items-center group">
              <Shield className="w-5 h-5 mr-2" />
              Credibility Score Distribution
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    How your likers' credibility scores compare to other profiles
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            
            {/* Summary Stats moved above chart */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(audienceLikers.credibility_score_band?.reduce((sum, band) => sum + band.total_profile_count, 0) || 0)}
                </div>
                <div className="text-sm text-gray-600 font-medium">Total Profiles</div>
              </div>
              <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300 shadow-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {((audienceLikers.credibility_score || 0) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                  <span className="mr-1">🎯</span>
                  Likers Score
                </div>
              </div>
            </div>
            
            {/* Enhanced Nivo Bar Chart with fixed left-to-right ordering */}
            <div className="h-64 w-full">
              <ResponsiveBar
                data={prepareCredibilityScoreData()}
                keys={['profileCount']}
                indexBy="scoreRange"
                margin={{ top: 20, right: 30, bottom: 70, left: 60 }}
                padding={0.15}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={({ data }) => {
                  // Debug logging
                  console.log('Likers Bar data:', data, 'userRange:', data.userRange, 'median:', data.median);
                  
                  if (data.userRange === 1) {
                    console.log('Applying orange color for likers user range');
                    return '#f97316'; // Orange for user's range
                  }
                  if (data.median === 1) {
                    console.log('Applying purple color for likers median');
                    return '#8b5cf6'; // Purple for median
                  }
                  console.log('Applying blue color for likers regular');
                  return '#3b82f6'; // Blue for regular
                }}
                defs={[
                  {
                    id: 'gradientBlue',
                    type: 'linearGradient',
                    colors: [
                      { offset: 0, color: '#3b82f6' },
                      { offset: 100, color: '#1d4ed8' }
                    ]
                  },
                  {
                    id: 'gradientOrange',
                    type: 'linearGradient',
                    colors: [
                      { offset: 0, color: '#f97316' },
                      { offset: 100, color: '#ea580c' }
                    ]
                  },
                  {
                    id: 'gradientPurple',
                    type: 'linearGradient',
                    colors: [
                      { offset: 0, color: '#8b5cf6' },
                      { offset: 100, color: '#7c3aed' }
                    ]
                  }
                ]}
                fill={[
                  {
                    match: (d) => {
                      const isUserRange = (d.data as any).userRange === 1;
                      console.log('Likers Fill match for user range:', isUserRange, d.data);
                      return isUserRange;
                    },
                    id: 'gradientOrange'
                  },
                  {
                    match: (d) => {
                      const isMedian = (d.data as any).median === 1;
                      console.log('Likers Fill match for median:', isMedian, d.data);
                      return isMedian;
                    },
                    id: 'gradientPurple'
                  },
                  {
                    match: '*',
                    id: 'gradientBlue'
                  }
                ]}
                borderRadius={4}
                borderWidth={(bar) => {
                  const isUserRange = (bar.data as any).userRange === 1;
                  console.log('Likers Border width for user range:', isUserRange, bar.data);
                  return isUserRange ? 4 : 1;
                }}
                borderColor={(bar) => {
                  const isUserRange = (bar.data as any).userRange === 1;
                  return isUserRange ? '#ea580c' : '#1e293b';
                }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 8,
                  tickRotation: -35,
                  legend: 'Credibility Score Range (Low → High)',
                  legendPosition: 'middle',
                  legendOffset: 55,
                  format: (value) => value
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Number of Profiles',
                  legendPosition: 'middle',
                  legendOffset: -50,
                  format: (value) => formatNumber(Number(value))
                }}
                enableLabel={false}
                animate={true}
                motionConfig="gentle"
                theme={{
                  background: 'transparent',
                  text: {
                    fontSize: 11,
                    fill: '#374151',
                    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                    fontWeight: 500
                  },
                  axis: {
                    domain: {
                      line: {
                        stroke: '#e5e7eb',
                        strokeWidth: 1
                      }
                    },
                    legend: {
                      text: {
                        fontSize: 12,
                        fill: '#6b7280',
                        fontWeight: 600
                      }
                    },
                    ticks: {
                      line: {
                        stroke: '#e5e7eb',
                        strokeWidth: 1
                      },
                      text: {
                        fontSize: 10,
                        fill: '#6b7280',
                        fontWeight: 500
                      }
                    }
                  },
                  grid: {
                    line: {
                      stroke: '#f3f4f6',
                      strokeWidth: 1
                    }
                  },
                  tooltip: {
                    container: {
                      background: '#1f2937',
                      color: '#f9fafb',
                      fontSize: '12px',
                      borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }
                  }
                }}
                tooltip={({ value, data }) => {
                  console.log('Likers Tooltip data:', data);
                  return (
                    <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="font-semibold text-sm">Range: {data.scoreRange}</div>
                        <div className="text-blue-300 text-sm">Profiles: {formatNumber(Number(value))}</div>
                      </div>
                      {data.userRange === 1 && (
                        <div className="text-orange-300 text-xs mt-2 font-bold text-center">🎯 YOUR LIKERS SCORE RANGE</div>
                      )}
                      {data.median === 1 && data.userRange !== 1 && (
                        <div className="text-purple-300 text-xs mt-2 text-center">📊 Median Range</div>
                      )}
                    </div>
                  );
                }}
                role="application"
                ariaLabel="Credibility score distribution chart for likers showing score ranges from low to high"
              />
            </div>
            
            {/* Enhanced Legend */}
            <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-t from-blue-500 to-blue-600 rounded"></div>
                <span className="text-gray-600">Regular</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-t from-purple-500 to-purple-600 rounded"></div>
                <span className="text-gray-600">Median</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-t from-orange-500 to-orange-600 rounded border-2 border-orange-700"></div>
                <span className="text-gray-600 font-semibold">🎯 Your Likers</span>
              </div>
            </div>
          </div>
        )}

        {/* Follower Reachability */}
        {audienceLikers.follower_reachability && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Eye className="w-5 h-5 mr-2" />
              Liker Reachability
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Distribution of likers by their own following count
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {audienceLikers.follower_reachability.map((reach, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    {reach.following_range === '-500' ? 'Under 500' :
                     reach.following_range === '1500-' ? 'Over 1500' :
                     reach.following_range} following
                  </div>
                  <div className="text-2xl font-bold text-emerald-600">{reach.value?.toFixed(1) || '0.0'}%</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${reach.value || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Likers Languages and Likers Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audienceLikers.languages && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Languages className="w-5 h-5 mr-2" />
              Likers Languages
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Primary languages spoken by your likers
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceLikers.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                  <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {audienceLikers.ethnicities && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              Likers Ethnicity
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Ethnic background distribution of your likers
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-3">
              {audienceLikers.ethnicities.map((ethnicity, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">{ethnicity.name}</span>
                    <span className="font-medium">{ethnicity.value?.toFixed(1) || '0.0'}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${ethnicity.value || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Notable Likers - 6 items per row grid layout */}
      {audienceLikers.significant_likers && audienceLikers.significant_likers.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Star className="w-5 h-5 mr-2" />
            Notable Likers ({audienceLikers.significant_likers_percentage?.toFixed(1) || '0.0'}% of total)
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  High-profile likers with significant reach and influence
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {audienceLikers.significant_likers.map((liker, index) => (
              <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-gray-50">
                <img
                  src={liker.image_url}
                  alt={liker.platform_username}
                  className="w-16 h-16 rounded-full object-cover flex-shrink-0 mb-2"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/64x64?text=User';
                  }}
                />
                <div className="text-center min-w-0 w-full">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <span className="font-medium text-xs truncate max-w-20">@{liker?.platform_username}</span>
                    {liker.is_verified && <Verified className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                  </div>
                  <div className="text-xs text-gray-500">{formatNumber(liker?.follower_count || 0)} followers</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AudienceLikersSection;