// src/components/profile-analysis/DistributionComparisonCard.tsx
import React from 'react';

interface DistributionComparisonCardProps {
  ageData: {
    topPerforming: Record<string, number>;
    averagePerforming: Record<string, number>;
    leastPerforming: Record<string, number>;
  };
  ethnicityData: {
    topPerforming: Record<string, number>;
    averagePerforming: Record<string, number>;
    leastPerforming: Record<string, number>;
  };
}

interface BarChartProps {
  title: string;
  data: {
    topPerforming: Record<string, number>;
    averagePerforming: Record<string, number>;
    leastPerforming: Record<string, number>;
  };
  category: string; // 'adult' or 'South Asian'
}

const BarChart: React.FC<BarChartProps> = ({ title, data, category }) => {
  // Process the data to get the percentage for the specific category
  const processedData = React.useMemo(() => {
    const getValue = (dataSet: Record<string, number>) => {
      if (!dataSet) return 0;
      
      // Handle different possible key formats
      const key = Object.keys(dataSet).find(k => 
        k.toLowerCase().includes(category.toLowerCase()) ||
        (category === 'South Asian' && (k.toLowerCase().includes('south') || k.toLowerCase().includes('asian')))
      );
      
      if (!key) return 0;
      
      const value = dataSet[key];
      if (typeof value === 'string') {
        return parseInt(value.replace('%', '')) || 0;
      }
      return Number(value) || 0;
    };

    return {
      top: getValue(data.topPerforming),
      average: getValue(data.averagePerforming),
      least: getValue(data.leastPerforming)
    };
  }, [data, category]);

  const { top, average, least } = processedData;

  // Colors for each performance category
  const colors = {
    top: '#8b5cf6',     // Purple
    average: '#10b981',  // Green
    least: '#f59e0b'     // Orange
  };

  return (
    <div className="flex-1">
      <h5 className="text-sm font-medium text-gray-700 mb-4 text-center">{title}</h5>
      
      {/* Chart Container */}
      <div className="relative bg-gray-50 p-4 rounded-lg" style={{ height: '200px' }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        
        {/* Grid lines */}
        <div className="absolute left-8 right-4 top-2 bottom-8">
          {[0, 25, 50, 75, 100].map((value, index) => (
            <div
              key={value}
              className="absolute w-full border-t border-gray-300"
              style={{ bottom: `${(value / 100) * 100}%` }}
            />
          ))}
        </div>
        
        {/* Bars Container */}
        <div className="absolute left-8 right-4 bottom-8 flex items-end justify-center gap-2" style={{ height: '140px' }}>
          {/* Top Performing Bar */}
          <div className="flex flex-col items-center">
            <div
              className="w-12 rounded-t transition-all duration-500 ease-in-out"
              style={{
                height: `${(top / 100) * 140}px`,
                backgroundColor: colors.top,
                minHeight: top > 0 ? '2px' : '0px'
              }}
            />
          </div>
          
          {/* Average Performing Bar */}
          <div className="flex flex-col items-center">
            <div
              className="w-12 rounded-t transition-all duration-500 ease-in-out"
              style={{
                height: `${(average / 100) * 140}px`,
                backgroundColor: colors.average,
                minHeight: average > 0 ? '2px' : '0px'
              }}
            />
          </div>
          
          {/* Least Performing Bar */}
          <div className="flex flex-col items-center">
            <div
              className="w-12 rounded-t transition-all duration-500 ease-in-out"
              style={{
                height: `${(least / 100) * 140}px`,
                backgroundColor: colors.least,
                minHeight: least > 0 ? '2px' : '0px'
              }}
            />
          </div>
        </div>
        
        {/* X-axis label */}
        <div className="absolute bottom-0 left-8 right-4 text-center">
          <span className="text-xs text-gray-600 font-medium">{category}</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-3 flex justify-center gap-3 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: colors.top }}></div>
          <span className="text-purple-600">Top Performing</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: colors.average }}></div>
          <span className="text-green-600">Average Performing</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: colors.least }}></div>
          <span className="text-orange-600">Least Performing</span>
        </div>
      </div>
    </div>
  );
};

const DistributionComparisonCard: React.FC<DistributionComparisonCardProps> = ({
  ageData,
  ethnicityData
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex gap-8">
        <BarChart 
          title="Age Distribution" 
          data={ageData}
          category="adult"
        />
        <BarChart 
          title="Age Distribution" 
          data={ethnicityData}
          category="South Asian"
        />
      </div>
    </div>
  );
};

export default DistributionComparisonCard;