// src/components/profile-analysis/ScreenTimeDistributionCard.tsx
import React from 'react';

interface ScreenTimeDistributionCardProps {
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
    if (!data) return { protagonist: 0, supporting: 0 };
    
    // Handle different possible key formats and both percentage strings and numbers
    const processValue = (value: any): number => {
      if (typeof value === 'string') {
        return parseInt(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };
    
    // Look for protagonist/supporting keys (case insensitive)
    const protagonistKey = Object.keys(data).find(k => 
      k.toLowerCase().includes('protagonist') || k.toLowerCase().includes('main')
    );
    const supportingKey = Object.keys(data).find(k => 
      k.toLowerCase().includes('supporting') || k.toLowerCase().includes('secondary')
    );
    
    const protagonist = protagonistKey ? processValue(data[protagonistKey]) : 0;
    const supporting = supportingKey ? processValue(data[supportingKey]) : 0;
    
    // Ensure percentages add up to 100
    const total = protagonist + supporting;
    if (total === 0) return { protagonist: 0, supporting: 0 };
    
    return {
      protagonist: Math.round((protagonist / total) * 100),
      supporting: Math.round((supporting / total) * 100)
    };
  }, [data]);

  const { protagonist, supporting } = processedData;
  
  // Calculate stroke dash array for the progress circles
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const protagonistOffset = circumference - (protagonist / 100) * circumference;
  const supportingOffset = circumference - (supporting / 100) * circumference;

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
          
          {/* Protagonist progress (blue) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#0ea5e9"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={protagonistOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
          
          {/* Supporting progress (orange) - starts where protagonist ends */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#f97316"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={supportingOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: `rotate(${(protagonist / 100) * 360}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
        </svg>
        
        {/* Center text showing dominant percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {protagonist >= supporting ? `${protagonist}%` : `${supporting}%`}
            </div>
            <div className="text-xs text-gray-500">
              {protagonist >= supporting ? 'Protagonist' : 'Supporting'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend with percentages */}
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 bg-sky-500 rounded-full mr-2"></div>
          <span className="text-sky-600">protagonist: {protagonist}%</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
          <span className="text-orange-600">supporting: {supporting}%</span>
        </div>
      </div>
    </div>
  );
};

const ScreenTimeDistributionCard: React.FC<ScreenTimeDistributionCardProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-md font-medium mb-6">Screen Time Distribution</h4>
      
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

export default ScreenTimeDistributionCard;