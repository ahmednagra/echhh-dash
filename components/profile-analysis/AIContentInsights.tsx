// src/components/profile-analysis/AIContentInsights.tsx
'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  Award,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  Lightbulb,
  Users,
  ClipboardList,
  ClipboardCheck,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { InstagramUserDetails } from '@/types/instagram';
import PerformanceCategory from './PerformanceCategory';
import MetricsComparisonChart from './MetricsComparisonChart';
import EmotionalTriggerChart from './EmotionalTriggerChart';
import DemographicDistribution from './DemographicDistribution';
import AgeDistributionComparison from './AgeDistributionComparison';
import GenderDistributionCard from './GenderDistributionCard';
import DistributionComparisonCard from './DistributionComparisonCard';
import ScreenTimeDistributionCard from './ScreenTimeDistributionCard';
import LightingStylesCard from './LightingStylesCard';
import ContentMetricsComparisonCard from './ContentMetricsComparisonCard';
import EmotionalTriggersCard from './EmotionalTriggersCard';

interface AIContentInsightsProps {
  openaiAnalysis: any;
  profile: InstagramUserDetails;
}

export default function AIContentInsights({
  openaiAnalysis,
}: AIContentInsightsProps) {
  // Parse the OpenAI analysis data
  const analysisData = useMemo(() => {
    if (!openaiAnalysis?.analysis) return null;

    try {
      const jsonMatch = openaiAnalysis.analysis.match(
        /```json\n([\s\S]*?)\n```/,
      );
      if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
      }
      return null;
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      return null;
    }
  }, [openaiAnalysis]);

  if (!analysisData) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-700">
          No AI analysis data available. Run the analysis to see insights.
        </p>
      </div>
    );
  }

  // Prepare data for graphs
  const performanceComparisonData = [
    {
      name: 'Top Performing',
      color: 'bg-green-500',
      metrics: analysisData.top_performing_summary?.quantitative || {},
    },
    {
      name: 'Average Performing',
      color: 'bg-blue-500',
      metrics: analysisData.average_performing_summary?.quantitative || {},
    },
    {
      name: 'Least Performing',
      color: 'bg-orange-500',
      metrics: analysisData.least_performing_summary?.quantitative || {},
    },
  ];

  // console.log('FFFFFF', analysisData)
  const demoData = {
    top: { child: 20, teen: 30, adult: 50 },
    average: { child: 15, senior: 10, adult: 75 },
    least: { teen: 40, adult: 60 },
  };
  return (
    <div className="space-y-8">
      {/* Performance Categories */}
      <div className="p-6 mb-8">
  <h3 className="text-lg font-semibold mb-6 flex items-center">
    <Award className="mr-2 w-5 h-5 text-indigo-600" />
    Performance Analysis Categories
  </h3>
  <div className="flex flex-col md:flex-row justify-between items-stretch space-y-4 md:space-y-0 md:space-x-6">
    {/* Top Performing */}
    <div className="flex-1 flex flex-col">
      <div className="flex items-center mb-4">
        <ThumbsUp className="w-6 h-6 mr-3 text-green-600" />
        <span className="text-base font-semibold text-green-700">
          Top Performing
        </span>
      </div>
      <PerformanceCategory
        title=""
        variant="success"
        data={analysisData?.top_performing_summary}
        icon={null}
      />
    </div>
    
    {/* Average Performing */}
    <div className="flex-1 flex flex-col">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
        <span className="text-base font-semibold text-blue-700">
          Average Performing
        </span>
      </div>
      <PerformanceCategory
        title=""
        variant="info"
        data={analysisData?.average_performing_summary}
        icon={null}
      />
    </div>
    
    {/* Least Performing */}
    <div className="flex-1 flex flex-col">
      <div className="flex items-center mb-4">
        <AlertCircle className="w-6 h-6 mr-3 text-orange-600" />
        <span className="text-base font-semibold text-orange-700">
          Least Performing
        </span>
      </div>
      <PerformanceCategory
        title=""
        variant="warning"
        data={analysisData?.least_performing_summary}
        icon={null}
      />
    </div>
  </div>
</div>

      {/* Demographics & Distribution Analysis */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Users className="mr-2 w-5 h-5 text-violet-600" />
          Demographics & Distribution Analysis
        </h3>

        {/* Gender Distribution */}
        {/* // Then replace your existing gender distribution section with this: */}
        <div className="mb-8">
          <GenderDistributionCard
            topPerforming={
              analysisData?.top_performing_summary?.quantitative
                ?.character_gender_distribution
            }
            averagePerforming={
              analysisData?.average_performing_summary?.quantitative
                ?.character_gender_distribution
            }
            leastPerforming={
              analysisData?.least_performing_summary?.quantitative
                ?.character_gender_distribution
            }
          />
        </div>

        {/* Age Distribution */}
        {/* // Then replace your existing age/ethnicity distribution section with this: */}
        <div className="mb-8">
          <DistributionComparisonCard
            ageData={{
              topPerforming:
                analysisData?.top_performing_summary?.quantitative
                  ?.character_age_distribution || {},
              averagePerforming:
                analysisData?.average_performing_summary?.quantitative
                  ?.character_age_distribution || {},
              leastPerforming:
                analysisData?.least_performing_summary?.quantitative
                  ?.character_age_distribution || {},
            }}
            ethnicityData={{
              topPerforming:
                analysisData?.top_performing_summary?.quantitative
                  ?.character_ethnicity_distribution || {},
              averagePerforming:
                analysisData?.average_performing_summary?.quantitative
                  ?.character_ethnicity_distribution || {},
              leastPerforming:
                analysisData?.least_performing_summary?.quantitative
                  ?.character_ethnicity_distribution || {},
            }}
          />
        </div>

        {/* Screen Time Distribution */}
        {/* // Then replace your existing screen time distribution section with this: */}
        <div className="mb-8">
          <ScreenTimeDistributionCard
            topPerforming={
              analysisData?.top_performing_summary?.quantitative
                ?.screen_time_percentages
            }
            averagePerforming={
              analysisData?.average_performing_summary?.quantitative
                ?.screen_time_percentages
            }
            leastPerforming={
              analysisData?.least_performing_summary?.quantitative
                ?.screen_time_percentages
            }
          />
        </div>

        {/* Lighting Styles */}
        {/* // Then replace your existing lighting styles section with this: */}
        <div className="mb-8">
          <LightingStylesCard
            topPerforming={
              analysisData?.top_performing_summary?.quantitative
                ?.lighting_styles
            }
            averagePerforming={
              analysisData?.average_performing_summary?.quantitative
                ?.lighting_styles
            }
            leastPerforming={
              analysisData?.least_performing_summary?.quantitative
                ?.lighting_styles
            }
          />
        </div>
      </div>

      {/* Content Metrics Comparison------------------------------------------------------------ */}
      <ContentMetricsComparisonCard
        performanceData={performanceComparisonData}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-green-500 uppercase tracking-wider">
                Top Performing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                Average Performing
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Least Performing
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Scene Count (Avg)
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.scene_counts?.average || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.scene_counts?.average || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.scene_counts?.average || 'N/A'}
              </td>
            </tr>

            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Scene Duration Range
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.scene_durations?.min || 'N/A'}{' '}
                -{' '}
                {analysisData?.top_performing_summary?.quantitative
                  ?.scene_durations?.max || 'N/A'}
                s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.scene_durations?.min || 'N/A'}{' '}
                -{' '}
                {analysisData?.average_performing_summary?.quantitative
                  ?.scene_durations?.max || 'N/A'}
                s
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.scene_durations?.min || 'N/A'}{' '}
                -{' '}
                {analysisData?.least_performing_summary?.quantitative
                  ?.scene_durations?.max || 'N/A'}
                s
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Audio Clarity
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.audio_clarity || 'N/A'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.audio_clarity || 'N/A'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.audio_clarity || 'N/A'}
                %
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Voiceover Percentage
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.voiceover_percentage || 'N/A'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.voiceover_percentage || 'N/A'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.voiceover_percentage || 'N/A'}
                %
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Special Effects Usage
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.special_effects_usage || '0'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.special_effects_usage || '0'}
                %
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.special_effects_usage || '0'}
                %
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Color Palette
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.color_palettes
                  ? Object.entries(
                      analysisData.top_performing_summary.quantitative
                        .color_palettes,
                    )
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ')
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.color_palettes
                  ? Object.entries(
                      analysisData.average_performing_summary.quantitative
                        .color_palettes,
                    )
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ')
                  : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.color_palettes
                  ? Object.entries(
                      analysisData.least_performing_summary.quantitative
                        .color_palettes,
                    )
                      .map(([key, value]) => `${key}: ${value}%`)
                      .join(', ')
                  : 'N/A'}
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                CTA Frequency
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.top_performing_summary?.quantitative
                  ?.cta_frequency?.average ?? 'N/A'}
                {analysisData?.top_performing_summary?.quantitative
                  ?.cta_frequency?.timestamps &&
                  ` (${analysisData.top_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.average_performing_summary?.quantitative
                  ?.cta_frequency?.average ?? 'N/A'}
                {analysisData?.average_performing_summary?.quantitative
                  ?.cta_frequency?.timestamps &&
                  ` (${analysisData.average_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {analysisData?.least_performing_summary?.quantitative
                  ?.cta_frequency?.average ?? 'N/A'}
                {analysisData?.least_performing_summary?.quantitative
                  ?.cta_frequency?.timestamps &&
                  ` (${analysisData.least_performing_summary.quantitative.cta_frequency.timestamps.join(', ')})`}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* </div> */}

      {/* Emotional & Engagement Triggers */}
      {/* // Then replace your existing emotional triggers section with this: */}
      <EmotionalTriggersCard
        topPerforming={
          analysisData?.top_performing_summary?.quantitative?.emotional_triggers
        }
        averagePerforming={
          analysisData?.average_performing_summary?.quantitative
            ?.emotional_triggers
        }
        leastPerforming={
          analysisData?.least_performing_summary?.quantitative
            ?.emotional_triggers
        }
      />

      {/* Timing & Pacing Analysis */}

      {/* Content Recommendations */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="bg-purple-100 p-2 rounded-lg mr-4">
              <Lightbulb className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-800">
                Content Improvement Recommendations
              </h3>
              <p className="text-purple-600">
                Expert suggestions to enhance your content performance
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-purple-50">
            <div className="mb-5 flex items-start">
              <div className="bg-purple-50 p-3 rounded-lg mr-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                  Key Strategy
                </h4>
                <p className="text-purple-700 font-medium">
                  {analysisData?.overall_recommendations?.strategy ||
                    'Focus on quality content improvements'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <ClipboardCheck className="w-5 h-5 text-purple-500 mr-2" />
                Actionable Recommendations
              </h4>

              {analysisData?.overall_recommendations?.specific_suggestions?.map(
                (recommendation: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start p-4 hover:bg-purple-50 rounded-lg transition-all duration-200"
                  >
                    <div className="bg-purple-100 p-2 rounded-full flex-shrink-0 mr-4">
                      <span className="text-sm font-bold text-purple-700 w-5 h-5 flex items-center justify-center">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {recommendation}
                      </p>
                      <div className="mt-2 flex space-x-3">
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          Priority {index + 1}
                        </span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Estimated impact: High
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-purple-300 ml-2" />
                  </div>
                ),
              )}
            </div>

            {(!analysisData?.overall_recommendations?.specific_suggestions ||
              analysisData.overall_recommendations.specific_suggestions
                .length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <ClipboardList className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                <p>No specific recommendations available yet</p>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center mx-auto">
              <Rocket className="w-5 h-5 mr-2" />
              How to Implement These Changes?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
