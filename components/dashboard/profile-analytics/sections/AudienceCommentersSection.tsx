// src/components/dashboard/profile-analytics/sections/AudienceCommentersSection.tsx
'use client';

import { 
  Users,
  Flag,
  MapPin,
  Languages,
  UserCheck,
  MessageCircle,
  AlertCircle,
  Building2,
  TrendingUp,
  Shield,
  Award,
  Target,
  Star,
  Verified
} from 'lucide-react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsivePie } from '@nivo/pie';
import { Profile } from '@/types/insightiq/profile-analytics';

interface ProfileData {
  audience_commenters?: Profile['audience_commenters'];
}

interface AudienceCommentersSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceCommentersSection: React.FC<AudienceCommentersSectionProps> = ({
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

  // Filter states with 10% or higher percentage
  const getFilteredStates = () => {
    return profile?.audience_commenters?.states?.filter((state: { name: string; value?: number }) => (state.value || 0) >= 10) || [];
  };

  const shouldShowStates = () => {
    return getFilteredStates().length > 0;
  };

  // Prepare data for charts
  const prepareGenderPieData = () => {
    return profile?.audience_commenters?.gender_distribution?.map((gender: { gender: string; value: number }) => ({
      id: gender.gender,
      label: gender.gender,
      value: gender.value,
      color: gender.gender === 'MALE' ? '#3B82F6' : '#EC4899'
    })) || [];
  };

  const prepareAgeData = () => {
    return profile?.audience_commenters?.gender_age_distribution ? profile.audience_commenters.gender_age_distribution
      .reduce(
        (
          acc: { age_range: string; value: number }[],
          curr: { age_range: string; value: number }
        ) => {
          const existing = acc.find(item => item.age_range === curr.age_range);
          if (existing) {
            existing.value += curr.value;
          } else {
            acc.push({ age_range: curr.age_range, value: curr.value });
          }
          return acc;
        },
        []
      )
      .sort((a: { age_range: string; value: number }, b: { age_range: string; value: number }) => {
        const ageOrder = ['13-17', '18-24', '25-34', '35-44', '45-64'];
        return ageOrder.indexOf(a.age_range) - ageOrder.indexOf(b.age_range);
      }) : [];
  };

  const prepareAgePieData = () => {
    const ageData = prepareAgeData();
    const colors = ['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];
    
    return ageData.map((age: { age_range: string; value: number }, index: number) => ({
      id: age.age_range,
      label: `${age.age_range} years`,
      value: age.value,
      color: colors[index] || '#6B7280'
    }));
  };

  const prepareGenderAgeBarData = () => {
    if (!profile?.audience_commenters?.gender_age_distribution) return [];
    
    const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-64'];
    
    return ageRanges.map(ageRange => {
      const maleData = profile.audience_commenters?.gender_age_distribution.find(
        (item: { age_range: string; gender: string; value: number }) => item.age_range === ageRange && item.gender === 'MALE'
      );
      const femaleData = profile.audience_commenters?.gender_age_distribution.find(
        (item: { age_range: string; gender: string; value: number }) => item.age_range === ageRange && item.gender === 'FEMALE'
      );
      
      return {
        ageRange,
        Male: maleData?.value || 0,
        Female: femaleData?.value || 0
      };
    });
  };

  const audienceCommenters = profile?.audience_commenters;

  // Check if commenters data is available and has meaningful content
  const hasCommentersData = audienceCommenters && (
    (audienceCommenters.countries && audienceCommenters.countries.length > 0) ||
    (audienceCommenters.gender_distribution && audienceCommenters.gender_distribution.length > 0) ||
    audienceCommenters.credibility_score !== undefined ||
    (audienceCommenters.interests && audienceCommenters.interests.length > 0)
  );

  if (!hasCommentersData) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No Commenters Data Available</h3>
          <p className="text-gray-400 mt-2">
            Comments analytics data is not available for this profile. This could be because:
          </p>
          <div className="mt-4 text-left max-w-md mx-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Limited engagement:</strong> The profile may not have received enough comments for analysis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Privacy settings:</strong> Comments data might be restricted or private.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    <strong>Recent profile:</strong> Insufficient comment history for meaningful analysis.
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
      {/* Commenters Overview */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-xl font-semibold mb-6 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
          Active Commenters Analytics
        </h3>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Active Commenters</h4>
            <p className="text-gray-600 text-sm">
              Users who actively engage through comments on posts
            </p>
          </div>
        </div>

        {/* Combined Gender and Age Distribution */}
        {(audienceCommenters.gender_distribution || audienceCommenters.gender_age_distribution) && (
          <div className="mb-8">
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Gender & Age Distribution
            </h4>
            <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-lg p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gender Pie Chart */}
                {audienceCommenters.gender_distribution && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-bold mb-4 text-center text-gray-800">Gender Distribution</h5>
                    <div className="h-96">
                      <ResponsivePie
                        data={prepareGenderPieData()}
                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.4}
                        padAngle={3}
                        cornerRadius={4}
                        activeOuterRadiusOffset={12}
                        colors={['#3B82F6', '#EC4899']}
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
                            fontSize: 15,
                            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
                          },
                          tooltip: {
                            container: {
                              background: '#1F2937',
                              color: '#F9FAFB',
                              fontSize: '15px',
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              border: 'none'
                            }
                          }
                        }}
                        tooltip={({ datum }) => (
                          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                            <div className="font-bold text-xl">{datum.label}</div>
                            <div className="text-blue-300 font-bold text-xl">{datum.value.toFixed(1)}%</div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* Age Pie Chart */}
                {audienceCommenters.gender_age_distribution && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h5 className="text-lg font-bold mb-4 text-center text-gray-800">Age Distribution</h5>
                    <div className="h-96">
                      <ResponsivePie
                        data={prepareAgePieData()}
                        margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                        innerRadius={0.4}
                        padAngle={2}
                        cornerRadius={4}
                        activeOuterRadiusOffset={12}
                        colors={['#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']}
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
                            fontSize: 15,
                            fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
                          },
                          tooltip: {
                            container: {
                              background: '#1F2937',
                              color: '#F9FAFB',
                              fontSize: '15px',
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                              border: 'none'
                            }
                          }
                        }}
                        tooltip={({ datum }) => (
                          <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                            <div className="font-bold text-xl">{datum.label}</div>
                            <div className="text-blue-300 font-bold text-xl">{datum.value.toFixed(1)}%</div>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Gender breakdown by age - Vertical Bar Chart */}
              {audienceCommenters.gender_age_distribution && (
                <div className="border-t border-gray-200 pt-10 mt-6 bg-white rounded-lg p-6 shadow-sm">
                  <h5 className="font-bold text-lg text-gray-800 mb-6 text-center">Gender Breakdown by Age</h5>
                  <div className="h-96">
                    <ResponsiveBar
                      data={prepareGenderAgeBarData()}
                      keys={['Male', 'Female']}
                      indexBy="ageRange"
                      margin={{ top: 50, right: 130, bottom: 50, left: 80 }}
                      padding={0.3}
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
                      labelSkipWidth={12}
                      labelSkipHeight={12}
                      labelTextColor="#ffffff"
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
                        <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                          <div className="font-bold text-xl mb-2">{indexValue} years</div>
                          <div className="font-bold text-lg">{id}</div>
                          <div className="text-blue-300 font-bold text-xl">{value.toFixed(1)}%</div>
                        </div>
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Geographic Data - Countries, States, Cities */}
        <div className={`grid grid-cols-1 ${shouldShowStates() ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center group">
              <Flag className="w-5 h-5 mr-2" />
              Top Countries (Commenters)
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Countries where your active commenters are located
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters?.countries?.map((country: { code: string; value?: number }, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium">{getCountryName(country.code)}</span>
                  <span className="text-blue-600 font-semibold">{country.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>

          {shouldShowStates() && (
            <div>
              <h4 className="text-lg font-medium mb-4 flex items-center group">
                <Building2 className="w-5 h-5 mr-2" />
                Top States
                <div className="relative ml-2">
                  <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                    ?
                  </div>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                    <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                      States/provinces with significant commenter presence (≥10%)
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </h4>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {getFilteredStates().map((state: { name: string; value?: number }, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-sm">{state.name}</span>
                    <span className="text-blue-600 font-semibold text-sm">{state.value?.toFixed(1) || '0.0'}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center group">
              <MapPin className="w-5 h-5 mr-2" />
              Top Cities
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Cities with the highest concentration of your commenters
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h4>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters?.cities?.map((city: { name: string; value?: number }, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-sm">{city.name}</span>
                  <span className="text-blue-600 font-semibold text-sm">{city.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language & Ethnicity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {audienceCommenters.languages && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Languages className="w-5 h-5 mr-2" />
              Commenters Languages
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Primary languages spoken by your active commenters
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters.languages.map((lang, index) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700">{getLanguageName(lang.code)}</span>
                  <span className="font-medium">{lang.value?.toFixed(2) || '0.00'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {audienceCommenters.ethnicities && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              Commenters Ethnicity
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Ethnic background distribution of your commenters
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-3">
              {audienceCommenters.ethnicities.map(
                (ethnicity: { name: string; value?: number }, index: number) => (
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

      {/* Brand Affinity */}
      {audienceCommenters.brand_affinity && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Award className="w-5 h-5 mr-2" />
            Brand Affinity (Commenters)
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Brands and companies your commenters show interest in
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
            {audienceCommenters.brand_affinity.map(
              (brand: { name: string; value?: number }, index: number) => (
              <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border hover:shadow-md transition-all">
                <div className="text-sm font-medium text-gray-800 mb-1">{brand.name}</div>
                <div className="text-xs text-blue-600 font-semibold">{((brand.value || 0) * 100).toFixed(3)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audience Quality & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <UserCheck className="w-5 h-5 mr-2" />
            Commenters Quality
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  Assessment of commenter authenticity and engagement quality
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          
          {audienceCommenters.credibility_score !== undefined ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {((audienceCommenters.credibility_score || 0) * 100).toFixed(1)}%
                  </div>
                  <div className="text-gray-600 font-medium">Credibility Score</div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-1000"
                    style={{ width: `${(audienceCommenters.credibility_score || 0) * 100}%` }}
                  ></div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {audienceCommenters.credibility_score >= 0.8 ? 'Excellent' :
                     audienceCommenters.credibility_score >= 0.6 ? 'Good' :
                     audienceCommenters.credibility_score >= 0.4 ? 'Fair' : 'Needs Improvement'} 
                    commenter quality
                  </p>
                </div>
              </div>

              {/* Follower Types */}
              {audienceCommenters.follower_types && (
                <div>
                  <h4 className="font-medium mb-3">Follower Types</h4>
                  <div className="space-y-3">
                    {audienceCommenters.follower_types.map(
                      (
                        type: { name: string; value?: number },
                        index: number
                      ) => (
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

              {/* Significant Commenters Percentage */}
              {audienceCommenters.significant_commenters_percentage !== undefined && (
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Significant Commenters</span>
                    <span className="font-medium">{audienceCommenters.significant_commenters_percentage?.toFixed(1) || '0.0'}%</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="text-center">
                <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  Credibility score not available
                </p>
              </div>
            </div>
          )}

          {/* Additional Quality Metrics */}
          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Countries</span>
                <span className="font-bold text-gray-800">
                  {audienceCommenters.countries ? audienceCommenters.countries.length : 0}
                </span>
              </div>
            </div>
            
            {audienceCommenters.countries && audienceCommenters.countries.length > 0 && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Top Country</span>
                  <span className="font-bold text-gray-800">
                    {getCountryName(audienceCommenters.countries[0].code)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {audienceCommenters.interests && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 flex items-center group">
              <Target className="w-5 h-5 mr-2" />
              Commenters Interests
              <div className="relative ml-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                  ?
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    Topics and categories your commenters are most interested in
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                  </div>
                </div>
              </div>
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {audienceCommenters.interests.map(
                (interest: { name: string; value?: number }, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <span className="text-gray-700 text-sm">{interest.name}</span>
                  <span className="font-medium text-sm">{interest.value?.toFixed(1) || '0.0'}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Significant Commenters */}
      {audienceCommenters.significant_commenters && audienceCommenters.significant_commenters.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 flex items-center group">
            <Star className="w-5 h-5 mr-2" />
            Notable Commenters ({audienceCommenters.significant_commenters_percentage?.toFixed(1)}% of total)
            <div className="relative ml-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs cursor-help group-hover:bg-gray-500 transition-colors">
                ?
              </div>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  High-profile commenters with significant reach and influence
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              </div>
            </div>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-h-96 overflow-y-auto">
            {audienceCommenters.significant_commenters.map(
              (
                commenter: {
                  image_url: string;
                  platform_username: string;
                  is_verified?: boolean;
                  follower_count: number;
                },
                index: number
              ) => (
              <div key={index} className="text-center p-3 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                <img
                  src={commenter.image_url}
                  alt={commenter.platform_username}
                  className="w-12 h-12 rounded-full mx-auto mb-2 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/48x48?text=User';
                  }}
                />
                <div className="flex items-center justify-center mb-1">
                  <div className="font-medium text-xs truncate max-w-20">@{commenter.platform_username}</div>
                  {commenter.is_verified && <Verified className="w-3 h-3 text-blue-500 ml-1 flex-shrink-0" />}
                </div>
                <div className="text-xs text-gray-500">{formatNumber(commenter.follower_count)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Insights */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comment Engagement Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-700 font-medium">Engagement Type</div>
                <div className="text-lg font-bold text-blue-800">Comments</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-700 font-medium">Quality Level</div>
                <div className="text-lg font-bold text-green-800">
                  {audienceCommenters.credibility_score !== undefined 
                    ? (audienceCommenters.credibility_score >= 0.8 ? 'High' :
                       audienceCommenters.credibility_score >= 0.6 ? 'Medium' : 'Low')
                    : 'Unknown'
                  }
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-700 font-medium">Global Reach</div>
                <div className="text-lg font-bold text-purple-800">
                  {audienceCommenters.countries ? `${audienceCommenters.countries.length} Countries` : 'No Data'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tips for improving comment engagement */}
        <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
          <h4 className="font-semibold text-gray-800 mb-2">💡 Tips to Increase Comment Engagement</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Ask open-ended questions in your captions</li>
            <li>• Respond promptly to comments to encourage more interaction</li>
            <li>• Create content that sparks conversation and debate</li>
            <li>• Use call-to-action phrases like "What do you think?" or "Share your experience"</li>
            <li>• Share behind-the-scenes content that invites commentary</li>
            <li>• Post controversial or trending topics (while staying respectful)</li>
          </ul>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2" />
          Commenters Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {audienceCommenters?.countries?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Countries Represented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {audienceCommenters?.languages?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Languages Spoken</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600 mb-1">
              {audienceCommenters?.interests?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Interest Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-600 mb-1">
              {formatNumber(audienceCommenters?.significant_commenters?.length || 0)}
            </div>
            <div className="text-sm text-gray-600">Notable Commenters</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudienceCommentersSection;