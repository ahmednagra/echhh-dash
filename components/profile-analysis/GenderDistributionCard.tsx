// src/components/profile-analysis/GenderDistributionCard.tsx
import React from 'react';

interface GenderDistributionCardProps {
  topPerforming: Record<string, number> | undefined;
  averagePerforming: Record<string, number> | undefined;
  leastPerforming: Record<string, number> | undefined;
}

interface CircularProgressProps {
  title: string;
  data: Record<string, number> | undefined;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ title, data }) => {
  // Parse the data and handle different formats
  const processedData = React.useMemo(() => {
    if (!data) return { male: 0, female: 0 };
    
    // Handle both percentage strings and numbers
    const processValue = (value: any): number => {
      if (typeof value === 'string') {
        return parseInt(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };
    
    const male = processValue(data.male || data.Male);
    const female = processValue(data.female || data.Female);
    
    // Ensure percentages add up to 100
    const total = male + female;
    if (total === 0) return { male: 0, female: 0 };
    
    return {
      male: Math.round((male / total) * 100),
      female: Math.round((female / total) * 100)
    };
  }, [data]);

  const { male, female } = processedData;
  
  // Calculate stroke dash array for the progress circles
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const maleOffset = circumference - (male / 100) * circumference;
  const femaleOffset = circumference - (female / 100) * circumference;

  return (
    <div className="flex-1 text-center">
      <h5 className="text-sm font-medium text-gray-700 mb-4">{title}</h5>
      
      {/* Circular Progress */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f3f4f6"
            strokeWidth="8"
            fill="transparent"
          />
          
          {/* Male progress (blue) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#3b82f6"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={maleOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
          
          {/* Female progress (pink) - starts where male ends */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#ec4899"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={femaleOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: `rotate(${(male / 100) * 360}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
        </svg>
        
        {/* Center text showing dominant percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {male >= female ? `${male}%` : `${female}%`}
            </div>
            <div className="text-xs text-gray-500">
              {male >= female ? 'Male' : 'Female'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-blue-600">male: {male}%</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-pink-500 rounded-full mr-2"></div>
          <span className="text-pink-600">female: {female}%</span>
        </div>
      </div>
    </div>
  );
};

const GenderDistributionCard: React.FC<GenderDistributionCardProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-md font-medium mb-6">Gender Distribution</h4>
      
      <div className="flex gap-8">
        <CircularProgress 
          title="Top Performing" 
          data={topPerforming} 
        />
        <CircularProgress 
          title="Average Performing" 
          data={averagePerforming} 
        />
        <CircularProgress 
          title="Least Performing" 
          data={leastPerforming} 
        />
      </div>
    </div>
  );
};

export default GenderDistributionCard;