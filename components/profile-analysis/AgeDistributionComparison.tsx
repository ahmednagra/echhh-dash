import React, { useMemo } from 'react';
import { Bar, BarChart, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AgeDistributionProps {
  topPerforming: Record<string, number>;
  averagePerforming: Record<string, number>;
  leastPerforming: Record<string, number>;
}

const AgeDistributionComparison: React.FC<AgeDistributionProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  // Transform data for the chart - two possible views
  const { chartData, stackedData } = useMemo(() => {
    // Get all unique age categories across all three datasets
    const allCategories = new Set([
      ...Object.keys(topPerforming || {}),
      ...Object.keys(averagePerforming || {}),
      ...Object.keys(leastPerforming || {})
    ]);
    
    // Standard grouped bar format
    const groupedData = Array.from(allCategories).map(category => ({
      name: category,
      Top: topPerforming?.[category] || 0,
      Average: averagePerforming?.[category] || 0,
      Least: leastPerforming?.[category] || 0
    }));
    
    // Alternative: Performance category as primary dimension
    const stackedFormat = [
      {
        name: 'Top Performing',
        ...Object.fromEntries(
          Array.from(allCategories).map(cat => [cat, topPerforming?.[cat] || 0])
        )
      },
      {
        name: 'Average Performing',
        ...Object.fromEntries(
          Array.from(allCategories).map(cat => [cat, averagePerforming?.[cat] || 0])
        )
      },
      {
        name: 'Least Performing',
        ...Object.fromEntries(
          Array.from(allCategories).map(cat => [cat, leastPerforming?.[cat] || 0])
        )
      }
    ];
    
    return { chartData: groupedData, stackedData: stackedFormat };
  }, [topPerforming, averagePerforming, leastPerforming]);

  // Determine if we have more than just one age category
  const hasMultipleAgeGroups = chartData.length > 1;
  
  // Dynamically generate bar components for stacked view
  const ageGroups = useMemo(() => {
    if (!stackedData[0]) return [];
    return Object.keys(stackedData[0]).filter(key => key !== 'name');
  }, [stackedData]);

  // Color mapping for age groups - using Record to allow any string key
  const ageColors: Record<string, string> = {
    'adult': '#8b5cf6',
    'teen': '#10b981',
    'child': '#f59e0b',
    'senior': '#3b82f6',
    'young adult': '#ec4899',
    // Add more mappings as needed
  };

  // Default colors for any unmapped categories
  const defaultColors = ['#8b5cf6', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#a855f7'];

  // Format the age group name for display
  const formatAgeName = (name: string): string => {
    return name.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  // Choose appropriate view based on data complexity
  return (
    <div className="w-full">
      <h4 className="text-md font-medium mb-4">Age Distribution</h4>
      
      {hasMultipleAgeGroups ? (
        // When we have multiple age groups, show stacked bars
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={stackedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              {ageGroups.map((age, index) => (
                <Bar 
                  key={age}
                  dataKey={age} 
                  name={formatAgeName(age)} 
                  fill={ageColors[age.toLowerCase()] || defaultColors[index % defaultColors.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        // When we just have one age group (e.g., all adult), show grouped bars
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              barGap={5}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar dataKey="Top" name="Top Performing" fill="#8b5cf6" />
              <Bar dataKey="Average" name="Average Performing" fill="#10b981" />
              <Bar dataKey="Least" name="Least Performing" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default AgeDistributionComparison;