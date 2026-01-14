import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface EthnicityDistributionProps {
  topPerforming: Record<string, number>;
  averagePerforming: Record<string, number>;
  leastPerforming: Record<string, number>;
}

const EthnicityDistributionComparison: React.FC<EthnicityDistributionProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  // Transform data for the chart
  const chartData = useMemo(() => {
    // Get all unique ethnicity categories across all datasets
    const allEthnicities = new Set([
      ...Object.keys(topPerforming || {}),
      ...Object.keys(averagePerforming || {}),
      ...Object.keys(leastPerforming || {})
    ]);
    
    // Create data array for chart
    return Array.from(allEthnicities).map(ethnicity => ({
      name: ethnicity,
      Top: topPerforming?.[ethnicity] || 0,
      Average: averagePerforming?.[ethnicity] || 0,
      Least: leastPerforming?.[ethnicity] || 0
    }));
  }, [topPerforming, averagePerforming, leastPerforming]);

  // Colors for performance categories
  const performanceColors = {
    Top: '#6366f1',
    Average: '#ef4444',
    Least: '#84cc16'
  };

  // Format the ethnicity name for display
  const formatEthnicityName = (name: string): string => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Determine if we should use a horizontal layout for better visualization
  // Horizontal bars work better when we have many ethnicity categories
  const useHorizontalLayout = chartData.length > 3;

  return (
    <div className="w-full">
      <h4 className="text-md font-medium mb-4">Ethnicity Distribution</h4>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <ResponsiveContainer width="100%" height={useHorizontalLayout ? Math.max(350, chartData.length * 60) : 350}>
          <BarChart
            data={chartData}
            layout={useHorizontalLayout ? "vertical" : "horizontal"}
            margin={{ top: 20, right: 30, left: useHorizontalLayout ? 100 : 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            {useHorizontalLayout ? (
              <YAxis dataKey="name" type="category" width={90} tickFormatter={formatEthnicityName} />
            ) : (
              <XAxis dataKey="name" type="category" tickFormatter={formatEthnicityName} />
            )}
            {useHorizontalLayout ? (
              <XAxis type="number" tickFormatter={(value) => `${value}%`} />
            ) : (
              <YAxis tickFormatter={(value) => `${value}%`} />
            )}
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Bar dataKey="Top" name="Top Performing" fill={performanceColors.Top} />
            <Bar dataKey="Average" name="Average Performing" fill={performanceColors.Average} />
            <Bar dataKey="Least" name="Least Performing" fill={performanceColors.Least} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EthnicityDistributionComparison;