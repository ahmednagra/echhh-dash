// src/components/profile-analysis/MetricsComparisonChart.tsx
import React from 'react';

interface MetricsComparisonChartProps {
  title: string;
  categories: {
    name: string;
    color: string;
    value: number | undefined;
    percentage?: boolean;
  }[];
}

export default function MetricsComparisonChart({
  title,
  categories,
}: MetricsComparisonChartProps) {
  // Process and validate data
  const validCategories = categories
    .map(cat => ({
      ...cat,
      value: cat.value !== undefined ? Number(cat.value) : undefined,
      displayValue: cat.value !== undefined 
        ? cat.percentage 
          ? `${Number(cat.value).toFixed(1)}%` 
          : Number(cat.value).toFixed(1)
        : 'N/A'
    }))
    .filter(cat => cat.value !== undefined && !isNaN(cat.value));

  // Calculate max value (minimum 10 to ensure visible differences)
  const maxValue = Math.max(
    10, // Minimum scale of 10% to ensure visible differences
    ...validCategories.map(cat => cat.value as number)
  );

  if (validCategories.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
        <h4 className="text-md font-medium mb-3">{title}</h4>
        <div className="h-48 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
      <h4 className="text-md font-medium mb-4">{title}</h4>
      <div className="h-48 flex items-end gap-4">
        {validCategories.map((category) => {
          const heightPercentage = (category.value! / maxValue) * 100;
          
          return (
            <div key={category.name} className="flex-1 flex flex-col items-center h-full">
              {/* Bar container */}
              <div className="flex-1 w-full flex flex-col justify-end">
                {/* Actual bar with minimum 5px height */}
                <div
                  className={`${category.color} w-full rounded-t-md transition-all duration-300`}
                  style={{
                    height: `${heightPercentage}%`,
                    minHeight: '5px' // Ensure visibility even for small values
                  }}
                >
                  {/* Value label inside bar if there's space */}
                  {heightPercentage > 25 && (
                    <span className="flex items-center justify-center h-full text-white text-xs font-medium">
                      {category.displayValue}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Category name and value (shown below if bar is too short) */}
              <div className="text-xs mt-2 text-center font-medium text-gray-700">
                {category.name}
              </div>
              {heightPercentage <= 25 && (
                <div className="text-xs text-gray-600 mt-1">
                  {category.displayValue}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}