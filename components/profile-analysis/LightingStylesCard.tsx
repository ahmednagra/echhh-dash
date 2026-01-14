// src/components/profile-analysis/LightingStylesCard.tsx
import React from 'react';

interface LightingStylesCardProps {
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
    if (!data) return { natural: 0, artificial: 0 };
    
    // Handle different possible key formats and both percentage strings and numbers
    const processValue = (value: any): number => {
      if (typeof value === 'string') {
        return parseInt(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };
    
    // Look for natural/artificial keys (case insensitive)
    const naturalKey = Object.keys(data).find(k => 
      k.toLowerCase().includes('natural') || k.toLowerCase().includes('daylight') || k.toLowerCase().includes('sunlight')
    );
    const artificialKey = Object.keys(data).find(k => 
      k.toLowerCase().includes('artificial') || k.toLowerCase().includes('studio') || k.toLowerCase().includes('indoor')
    );
    
    const natural = naturalKey ? processValue(data[naturalKey]) : 0;
    const artificial = artificialKey ? processValue(data[artificialKey]) : 0;
    
    // Ensure percentages add up to 100
    const total = natural + artificial;
    if (total === 0) return { natural: 0, artificial: 0 };
    
    return {
      natural: Math.round((natural / total) * 100),
      artificial: Math.round((artificial / total) * 100)
    };
  }, [data]);

  const { natural, artificial } = processedData;
  
  // Calculate stroke dash array for the progress circles
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const naturalOffset = circumference - (natural / 100) * circumference;
  const artificialOffset = circumference - (artificial / 100) * circumference;

  return (
    <div className="flex-1 text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
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
          
          {/* Natural progress (yellow) */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#facc15"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={naturalOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
          
          {/* Artificial progress (gray) - starts where natural ends */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="#6b7280"
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={artificialOffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: `rotate(${(natural / 100) * 360}deg)`,
              transformOrigin: '50px 50px'
            }}
          />
        </svg>
        
        {/* Center text showing dominant percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-800">
              {natural >= artificial ? `${natural}%` : `${artificial}%`}
            </div>
            <div className="text-xs text-gray-500">
              {natural >= artificial ? 'Natural' : 'Artificial'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Legend with percentages */}
      <div className="space-y-1 text-sm">
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
          <span className="text-yellow-600">natural: {natural}%</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
          <span className="text-gray-600">artificial: {artificial}%</span>
        </div>
      </div>
    </div>
  );
};

const LightingStylesCard: React.FC<LightingStylesCardProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-md font-medium mb-6">Lighting Styles</h4>
      
      <div className="flex gap-6">
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

export default LightingStylesCard;