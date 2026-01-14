// src/components/profile-analysis/DemographicDistribution.tsx
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface DemographicDistributionProps {
  title: string;
  data: Record<string, number> | undefined;
  colors: string[];
}

export default function DemographicDistribution({
  title,
  data,
  colors
}: DemographicDistributionProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h4 className="text-md font-medium mb-3">{title}</h4>
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]
  }));

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, value }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 25; // Adjusted for better positioning
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = Math.round((value / total) * 100);

    return (
      <text
        x={x}
        y={y}
        fill={name === 'male' ? '#3b82f6' : '#ec4899'}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${name}: ${percentage}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h4 className="text-md font-bold mb-3">{title}</h4>
      <div className="flex justify-center items-center mb-4">
        <ResponsiveContainer width="90%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius={60} // Adjusted for thicker outer ring
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              labelLine={false}
              label={renderCustomLabel}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Custom Legend */}
      <div className="flex justify-center space-x-4 mt-2">
        {chartData.map(item => (
          <div key={item.name} className="flex items-center space-x-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-xs text-gray-600">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
