// src/components/profile-analysis/ContentMetricsComparisonCard.tsx
import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ContentMetricsComparisonCardProps {
  performanceData: {
    name: string;
    color: string;
    metrics: {
      audio_clarity?: number;
      voiceover_percentage?: number;
    };
  }[];
}

interface BarChartProps {
  title: string;
  data: {
    top: number;
    average: number;
    least: number;
  };
}

const BarChart: React.FC<BarChartProps> = ({ title, data }) => {
  const { top, average, least } = data;

  // Colors for each performance category (matching your design)
  const colors = {
    top: '#10b981',     // Green
    average: '#3b82f6',  // Blue
    least: '#f59e0b'     // Orange
  };

  // Calculate heights based on percentage (max height 120px for 100%)
  const maxHeight = 120;
  const calculateHeight = (percentage: number) => {
    if (percentage === 0) return 0; // No bar for 0%
    return Math.max((percentage / 100) * maxHeight, 15); // Minimum 15px for visibility if > 0
  };

  return (
    <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h5 className="text-md font-bold text-gray-700 mb-6 text-center">{title}</h5>
      
      {/* Variable Height Bars Container */}
      <div className="flex items-end justify-between px-2" style={{ height: `${maxHeight + 40}px` }}>
        {/* Top Performing Bar */}
        <div className="flex flex-col items-center" style={{ width: '90px' }}>
          {top > 0 && (
            <div
              className="w-full rounded flex items-center justify-center text-white font-medium text-sm transition-all duration-500 ease-in-out"
              style={{
                height: `${calculateHeight(top)}px`,
                backgroundColor: colors.top
              }}
            >
              {`${top}.0%`}
            </div>
          )}
          <div className="text-xs text-gray-600 mt-2 text-center">Top Performing</div>
        </div>

        {/* Average Performing Bar */}
        <div className="flex flex-col items-center" style={{ width: '90px' }}>
          {average > 0 && (
            <div
              className="w-full rounded flex items-center justify-center text-white font-medium text-sm transition-all duration-500 ease-in-out"
              style={{
                height: `${calculateHeight(average)}px`,
                backgroundColor: colors.average
              }}
            >
              {`${average}.0%`}
            </div>
          )}
          <div className="text-xs text-gray-600 mt-2 text-center">Average Performing</div>
        </div>

        {/* Least Performing Bar */}
        <div className="flex flex-col items-center" style={{ width: '90px' }}>
          {least > 0 && (
            <div
              className="w-full rounded flex items-center justify-center text-white font-medium text-sm transition-all duration-500 ease-in-out"
              style={{
                height: `${calculateHeight(least)}px`,
                backgroundColor: colors.least
              }}
            >
              {`${least}.0%`}
            </div>
          )}
          <div className="text-xs text-gray-600 mt-2 text-center">Least Performing</div>
        </div>
      </div>
    </div>
  );
};

const ContentMetricsComparisonCard: React.FC<ContentMetricsComparisonCardProps> = ({
  performanceData
}) => {
  // Process the data to extract audio clarity and voiceover percentages
  const processedData = React.useMemo(() => {
    const audioClarity = {
      top: performanceData.find(item => item.name === 'Top Performing')?.metrics?.audio_clarity || 0,
      average: performanceData.find(item => item.name === 'Average Performing')?.metrics?.audio_clarity || 0,
      least: performanceData.find(item => item.name === 'Least Performing')?.metrics?.audio_clarity || 0
    };

    const voiceoverPercentage = {
      top: performanceData.find(item => item.name === 'Top Performing')?.metrics?.voiceover_percentage || 0,
      average: performanceData.find(item => item.name === 'Average Performing')?.metrics?.voiceover_percentage || 0,
      least: performanceData.find(item => item.name === 'Least Performing')?.metrics?.voiceover_percentage || 0
    };

    return { audioClarity, voiceoverPercentage };
  }, [performanceData]);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <BarChart3 className="mr-2 w-5 h-5 text-purple-600" />
        Content Metrics Comparison
      </h3>
      
      <div className="flex gap-8">
        <BarChart 
          title="Audio Clarity Percentage" 
          data={processedData.audioClarity}
        />
        <BarChart 
          title="Voiceover Percentage" 
          data={processedData.voiceoverPercentage}
        />
      </div>
    </div>
  );
};

export default ContentMetricsComparisonCard;