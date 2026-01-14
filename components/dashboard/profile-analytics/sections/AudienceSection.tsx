// src/components/dashboard/profile-analytics/sections/AudienceSection.tsx
'use client';

import { 
  Users, 
  Flag,
  MapPin, 
  Languages,
  UserCheck,
  Star,
  Verified,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Eye
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience: Profile['audience'];
}

interface AudienceSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceSection: React.FC<AudienceSectionProps> = ({
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

  // Calculate percentage for audience interests
  const calculateInterestPercentages = () => {
    const interests = profile?.audience?.interests || [];
    const totalSum = interests.reduce((sum, interest) => sum + (interest.value || 0), 0);
    
    return interests.map(interest => ({
      ...interest,
      percentage: totalSum > 0 ? ((interest.value || 0) / totalSum) * 100 : 0
    }));
  };

  // Filter states with 10% or higher percentage
  const getFilteredStates = () => {
    return profile?.audience?.states?.filter(state => (state.value || 0) >= 10) || [];
  };

  const shouldShowStates = () => {
    return getFilteredStates().length > 0;
  };

  // Prepare data for charts
  const prepareGenderPieData = () => {
    return profile?.audience?.gender_distribution?.map(gender => ({
      id: gender.gender,
      label: gender.gender,
      value: gender.value,
      color: gender.gender === 'MALE' ? '#3B82F6' : '#EC4899'
    })) || [];
  };

  const prepareAgeData = () => {
    return profile?.audience?.gender_age_distribution ? profile.audience.gender_age_distribution
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

  // NEW: Prepare Gender-Age Pie Data with enhanced colors and animations
  const prepareGenderAgePieData = () => {
    if (!profile?.audience?.gender_age_distribution) return [];
    
    // Define colors for different age ranges and genders
    const colorScheme = {
      'MALE': {
        '13-17': '#1E3A8A', // Dark Blue
        '18-24': '#3B82F6', // Blue
        '25-34': '#60A5FA', // Light Blue
        '35-44': '#93C5FD', // Lighter Blue
        '45-64': '#DBEAFE'  // Very Light Blue
      },
      'FEMALE': {
        '13-17': '#BE185D', // Dark Pink
        '18-24': '#EC4899', // Pink
        '25-34': '#F472B6', // Light Pink
        '35-44': '#F9A8D4', // Lighter Pink
        '45-64': '#FCE7F3'  // Very Light Pink
      }
    };
    
    return profile.audience.gender_age_distribution.map((item, index) => ({
      id: `${item.gender}-${item.age_range}`,
      label: `${item.gender === 'MALE' ? 'Male' : 'Female'} ${item.age_range}`,
      value: item.value,
      color: colorScheme[item.gender as keyof typeof colorScheme]?.[item.age_range as keyof typeof colorScheme['MALE']] || '#6B7280',
      gender: item.gender,
      ageRange: item.age_range
    })).sort((a, b) => {
      // Sort by age range first, then by gender (Male first)
      const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
      const ageComparison = ageOrder.indexOf(a.ageRange) - ageOrder.indexOf(b.ageRange);
      if (ageComparison !== 0) return ageComparison;
      return a.gender === 'MALE' ? -1 : 1;
    });
  };

  const prepareGenderAgeBarData = () => {
    if (!profile?.audience?.gender_age_distribution) return [];
    
    const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-64'];
    
    return ageRanges.map(ageRange => {
      const maleData = profile.audience.gender_age_distribution.find(
        item => item.age_range === ageRange && item.gender === 'MALE'
      );
      const femaleData = profile.audience.gender_age_distribution.find(
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
    if (!profile?.audience?.credibility_score_band) {
      console.log('No credibility score band data available');
      return [];
    }
    
    const userScore = profile?.audience?.credibility_score || 0;
    console.log('User credibility score:', userScore, 'as percentage:', userScore * 100);
    
    // Sort the data by minimum score to ensure left-to-right ordering
    const sortedData = profile.audience.credibility_score_band
      .map((band, index) => {
        const minScore = band.min ?? 0;
        const maxScore = band.max ?? 100;
        const isUserRange = isUserScoreRange(band.min, band.max, userScore);
        
        console.log(`Band ${index}: ${minScore}-${maxScore}, User in range: ${isUserRange}, Profile count: ${band.total_profile_count}`);
        
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
          sortOrder: minScore // Use minimum score for sorting
        };
      })
      .sort((a, b) => {
        // Sort by minimum score (ascending) to get left-to-right order
        if (a.sortOrder === b.sortOrder) {
          return a.maxScore - b.maxScore;
        }
        return a.sortOrder - b.sortOrder;
      });
    
    console.log('Sorted credibility data:', sortedData);
    return sortedData;
  };

  // NEW: Prepare horizontal bar data for follower reachability
  const prepareHorizontalBarData = () => {
    const reachabilityData = profile?.audience?.follower_reachability || [];
    
    // Define specific order: Green at bottom, Red at top
    const displayOrder = [
      { range: '1000-1500', color: '#EF4444' },    // Red - Top position
      { range: 'Over 1,500', color: '#F97316' },   // Orange - Second from top  
      { range: '500-1000', color: '#EAB308' },     // Yellow - Third from top
      { range: 'Under 500', color: '#22C55E' }     // Green - Bottom position
    ];
    
    return displayOrder.map((orderItem, index) => {
      // Find matching data by checking all possible range formats
      const dataItem = reachabilityData.find(item => {
        const itemLabel = item.following_range === '-500' ? 'Under 500' :
                         item.following_range === '1500-' ? 'Over 1,500' :
                         item.following_range === '500-1000' ? '500-1000' :
                         item.following_range === '1000-1500' ? '1000-1500' :
                         item.following_range;
        return itemLabel === orderItem.range || 
               (orderItem.range === '500-1000' && item.following_range === '500-1000') ||
               (orderItem.range === '1000-1500' && item.following_range === '1000-1500');
      });
      
      return {
        id: dataItem?.following_range || orderItem.range,
        label: orderItem.range,
        value: dataItem?.value || 0,
        color: orderItem.color,
        index: index
      };
    });
  };

  // NEW: Updated Horizontal Bar Chart Component
  const HorizontalBarChart = () => {
    const barData = prepareHorizontalBarData();
    
    return (
      <div className="w-full h-full">
        {/* Custom Horizontal Bar Chart */}
        <div className="space-y-3 py-4">
          {barData.map((item, index) => (
            <div 
              key={item.id}
              className="group relative"
              style={{ 
                animation: `slideInLeft 0.8s ease-out ${index * 0.2}s both` 
              }}
            >
              {/* Bar Container */}
              <div className="flex items-center space-x-4">
                {/* Label */}
                <div className="w-20 text-right">
                  <div className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {item.label}
                  </div>
                </div>
                
                {/* Bar Track */}
                <div className="flex-1 relative rounded-full h-8 overflow-hidden">
                  {/* Animated Bar */}
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out group-hover:brightness-110 relative overflow-hidden"
                    style={{
                      width: `${Math.max(item.value, 8)}%`, // Minimum 8% width for better text visibility
                      backgroundColor: item.color,
                      backgroundImage: `linear-gradient(45deg, 
                        rgba(255,255,255,0.1) 25%, 
                        transparent 25%, 
                        transparent 50%, 
                        rgba(255,255,255,0.1) 50%, 
                        rgba(255,255,255,0.1) 75%, 
                        transparent 75%, 
                        transparent)`,
                      backgroundSize: '20px 20px',
                      animation: `barExpand 1.2s ease-out ${index * 0.3 + 0.5}s both, shimmer 3s ease-in-out ${index * 0.5 + 2}s infinite`,
                      boxShadow: `0 2px 8px ${item.color}40, inset 0 1px 0 rgba(255,255,255,0.3)`
                    }}
                  >
                    {/* Shine Effect */}
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        animation: 'shine 2s ease-in-out infinite'
                      }}
                    ></div>
                    
                    {/* Percentage Text */}
                    <div className="absolute inset-0 flex items-center justify-center px-2">
                      <span 
                        className="text-white font-bold text-sm drop-shadow-lg text-center"
                        style={{ 
                          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                          animation: `textFadeIn 1s ease-out ${index * 0.3 + 1}s both`,
                          minWidth: 'fit-content',
                          whiteSpace: 'nowrap',
                          zIndex: 10
                        }}
                      >
                        {item.value.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none rounded-full"
                    style={{
                      background: `radial-gradient(ellipse at center, ${item.color}60 0%, transparent 70%)`,
                      filter: 'blur(4px)'
                    }}
                  ></div>
                </div>
                
                {/* Value Display */}
                <div className="w-16 text-left">
                  <div 
                    className="text-sm font-bold group-hover:scale-110 transition-transform duration-300"
                    style={{ color: item.color }}
                  >
                    {item.value.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              {/* Enhanced Hover Tooltip */}
              <div className="absolute left-1/2 bottom-full mb-2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none z-30">
                <div className="bg-gray-900 text-white text-xs px-4 py-3 rounded-xl shadow-2xl border border-gray-700 whitespace-nowrap">
                  <div className="text-center">
                    <div className="font-bold text-yellow-300 mb-1">{item.value.toFixed(1)}% of audience</div>
                    <div className="text-gray-300">follows {item.label} accounts</div>
                  </div>
                  {/* Tooltip Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Enhanced Legend */}
        <div className="border-t border-gray-200 pt-6 mt-4 mb-12">
          <div className="grid grid-cols-2 gap-3 pb-8">
            {barData.map((item, index) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 cursor-pointer group border border-transparent hover:border-gray-200 hover:shadow-md"
                style={{ 
                  animation: `legendSlideIn 0.6s ease-out ${index * 0.15 + 1.8}s both` 
                }}
              >
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-md flex-shrink-0 group-hover:scale-125 transition-all duration-300 shadow-lg"
                    style={{ 
                      backgroundColor: item.color,
                      boxShadow: `0 0 20px ${item.color}40`
                    }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-300">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-gray-900 group-hover:text-black transition-colors duration-300">
                    {item.value.toFixed(1)}%
                  </span>
                  <div className="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-gray-500 transition-colors duration-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Enhanced CSS Animations */}
        <style jsx>{`
          @keyframes slideInLeft {
            from {
              transform: translateX(-100px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          @keyframes barExpand {
            from {
              width: 0 !important;
            }
            to {
              width: ${({ value }) => Math.max(value, 2)}% !important;
            }
          }
          
          @keyframes textFadeIn {
            from {
              opacity: 0;
              transform: translateX(10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes shine {
            0% {
              transform: translateX(-100%);
            }
            50% {
              transform: translateX(0%);
            }
            100% {
              transform: translateX(100%);
            }
          }
          
          @keyframes shimmer {
            0%, 100% {
              background-position-x: -100%;
            }
            50% {
              background-position-x: 100%;
            }
          }
          
          @keyframes legendSlideIn {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Audience Summary - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Countries</p>
              <p className="text-2xl font-bold text-purple-600">{profile?.audience?.countries?.length || 0}</p>
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
              <p className="text-2xl font-bold text-blue-600">{profile?.audience?.languages?.length || 0}</p>
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
              <p className="text-2xl font-bold text-green-600">{profile?.audience?.interests?.length || 0}</p>
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
              <p className="text-gray-600 text-sm">Notable Followers</p>
              <p className="text-2xl font-bold text-orange-600">{formatNumber(profile?.audience?.significant_followers?.length || 0)}</p>
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
              <p className="text-2xl font-bold text-emerald-600">{((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%</p>
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
        {/* Gender Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Gender Distribution
          </h4>
          <div className="h-96">
            <ResponsivePie
              data={prepareGenderPieData()}
              margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
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
              enableArcLabels={false}
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
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
                  Countries where your audience is located, ranked by percentage
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.countries?.map((country, index) => (
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
        {/* Age Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Age Distribution
          </h4>
          <div className="h-96">
            <ResponsivePie
              data={prepareAgePieData()}
              margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
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
              enableArcLabels={false}
              arcLinkLabel={(d) => `${d.id}: ${d.value.toFixed(1)}%`}
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
                  Cities with the highest concentration of your audience
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.cities?.map((city, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-sm">{city.name}</span>
                <span className="text-purple-600 font-semibold text-sm">{city.value?.toFixed(1) || '0.0'}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gender Breakdown by Age (NOW PIE CHART) and Audience Quality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender breakdown by age - Updated to Pie Chart with Enhanced Styling */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h4 className="text-lg font-semibold mb-4 flex items-center group">
            <Users className="w-5 h-5 mr-2" />
            Gender Breakdown by Age
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Detailed breakdown showing gender distribution across different age groups
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h4>
          <div className="h-96">
            <ResponsivePie
              data={prepareGenderAgePieData()}
              margin={{ top: 20, right: 60, bottom: 20, left: 60 }}
              innerRadius={0.5}
              padAngle={1.5}
              cornerRadius={6}
              activeOuterRadiusOffset={15}
              colors={({ data }) => data.color}
              borderWidth={2}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              
              // Enhanced arc link labels
              arcLinkLabelsSkipAngle={8}
              arcLinkLabelsTextColor="#374151"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
              arcLinkLabel={(d) => `${d.data.label}: ${d.value.toFixed(1)}%`}
              
              // Arc labels (on slices) - REMOVED
              enableArcLabels={false}
              
              // Enhanced animations
              animate={true}
              motionConfig={{
                mass: 1,
                tension: 120,
                friction: 14,
                clamp: false,
                precision: 0.01,
                velocity: 0
              }}
              
              // Custom theme
              theme={{
                text: {
                  fontSize: 11,
                  fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
                  fontWeight: 600
                },
                tooltip: {
                  container: {
                    background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)',
                    color: '#F9FAFB',
                    fontSize: '13px',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)'
                  }
                }
              }}
              
              // Enhanced Custom Tooltip
              tooltip={({ datum }) => (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white p-4 rounded-xl shadow-2xl border border-gray-600 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <div 
                      className="w-4 h-4 rounded-full shadow-lg"
                      style={{ 
                        backgroundColor: datum.color,
                        boxShadow: `0 0 10px ${datum.color}50`
                      }}
                    ></div>
                    <div className="font-bold text-sm text-white">{datum.data.label}</div>
                  </div>
                  <div className="flex items-center justify-between space-x-4">
                    <span className="text-gray-300 text-xs">Percentage:</span>
                    <span className="text-blue-300 font-bold text-sm">{datum.value.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                      <span className="text-xs text-gray-400">
                        {datum.data.gender === 'MALE' ? '👨' : '👩'} {datum.data.ageRange} years
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              // Interactive features
              isInteractive={true}
              onMouseEnter={(datum, event) => {
                // Add subtle glow effect on hover (handled by CSS)
              }}
              
              // Custom legends (positioned at bottom right) - REMOVED
              // legends={[...]}
            />
          </div>
          
          {/* Custom Legend Below Chart - REMOVED */}
        </div>

        {/* Audience Quality - Removed Credibility Score */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <UserCheck className="w-5 h-5 mr-2" />
            Audience Quality
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Assessment of follower authenticity and engagement quality
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Follower Types</h4>
              <div className="space-y-3">
                {profile?.audience?.follower_types?.map((type, index) => (
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
            
            <div>
              <div className="flex justify-between">
                <span className="text-gray-600">Significant Followers</span>
                <span className="font-medium">{profile?.audience?.significant_followers_percentage?.toFixed(1) || '0.0'}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Affinity and Audience Interests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brand Affinity - Updated to match Audience Interests format */}
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
                  Brands and companies your audience shows interest in
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {profile?.audience?.brand_affinity?.map((brand, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700 text-sm">{brand.name}</span>
                <span className="font-medium text-sm">{((brand.value || 0) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Audience Interests - Updated with percentage calculation */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Target className="w-5 h-5 mr-2" />
            Audience Interests
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Topics and categories your audience is most interested in (calculated as percentage of total)
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
      </div>

      {/* Credibility Score Distribution and Follower Reachability */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Credibility Score Distribution - Fixed to display left to right with user score highlighting */}
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
                  How your credibility score compares to other profiles
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          
          {/* Summary Stats moved above chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="text-center bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <div className="text-2xl font-bold text-green-600">
                {formatNumber(profile?.audience?.credibility_score_band?.reduce((sum, band) => sum + band.total_profile_count, 0) || 0)}
              </div>
              <div className="text-sm text-gray-600 font-medium">Total Profiles</div>
            </div>
            <div className="text-center bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300 shadow-lg">
              <div className="text-2xl font-bold text-orange-600">
                {((profile?.audience?.credibility_score || 0) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 font-medium flex items-center justify-center">
                <span className="mr-1">🎯</span>
                Your Score
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
                console.log('Bar data:', data, 'userRange:', data.userRange, 'median:', data.median);
                
                if (data.userRange === 1) {
                  console.log('Applying orange color for user range');
                  return '#f97316'; // Orange for user's range
                }
                if (data.median === 1) {
                  console.log('Applying purple color for median');
                  return '#8b5cf6'; // Purple for median
                }
                console.log('Applying blue color for regular');
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
                    console.log('Fill match for user range:', isUserRange, d.data);
                    return isUserRange;
                  },
                  id: 'gradientOrange'
                },
                {
                  match: (d) => {
                    const isMedian = (d.data as any).median === 1;
                    console.log('Fill match for median:', isMedian, d.data);
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
              borderWidth={1}
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
                console.log('Tooltip data:', data);
                return (
                  <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="font-semibold text-sm">Range: {data.scoreRange}</div>
                      <div className="text-blue-300 text-sm">Profiles: {formatNumber(Number(value))}</div>
                    </div>
                    {data.userRange === 1 && (
                      <div className="text-orange-300 text-xs mt-2 font-bold text-center">🎯 YOUR SCORE RANGE</div>
                    )}
                    {data.median === 1 && data.userRange !== 1 && (
                      <div className="text-purple-300 text-xs mt-2 text-center">📊 Median Range</div>
                    )}
                  </div>
                );
              }}
              role="application"
              ariaLabel="Credibility score distribution chart showing score ranges from low to high"
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
              <span className="text-gray-600 font-semibold">🎯 Your Score</span>
            </div>
          </div>
        </div>

        {/* NEW: Follower Reachability - Updated with Horizontal Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Eye className="w-5 h-5 mr-2" />
            Follower Reachability
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Distribution of followers by their own following count
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          
          {/* Horizontal Bar Chart Implementation */}
          <div className="h-96 w-full overflow-hidden pb-8">
            <HorizontalBarChart />
          </div>
        </div>
      </div>

      {/* Audience Languages and Audience Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Languages className="w-5 h-5 mr-2" />
            Audience Languages
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Primary languages spoken by your audience members
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {profile?.audience?.languages?.map((lang, index) => (
              <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            Audience Ethnicity
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Ethnic background distribution of your audience
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="space-y-3">
            {profile?.audience?.ethnicities?.map((ethnicity, index) => (
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
      </div>

      {/* Notable Followers - 6 items per row grid layout */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center group">
          <Star className="w-5 h-5 mr-2" />
          Notable Followers ({profile?.audience?.significant_followers_percentage?.toFixed(1) || '0.0'}% of total)
          <div className="relative ml-2">
            <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
              ?
            </div>
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                High-profile followers with significant reach and influence
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          </div>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
          {profile?.audience?.significant_followers?.map((follower, index) => (
            <div key={index} className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-gray-50">
              <img
                src={follower.image_url}
                alt={follower.platform_username}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0 mb-2"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/64x64?text=User';
                }}
              />
              <div className="text-center min-w-0 w-full">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <span className="font-medium text-xs truncate max-w-20">@{follower?.platform_username}</span>
                  {follower.is_verified && <Verified className="w-3 h-3 text-blue-500 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500">{formatNumber(follower?.follower_count || 0)} followers</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AudienceSection;