import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendChange: string;
  trendColor: string;
  chartData: number[];
}

const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendChange, trendColor, chartData }) => {
  return (
    <div className="stat-card">
      <h3>{title}</h3>
      <p>{value} <span style={{ color: trendColor }}>{trend} {trendChange}</span></p>
      {/* Placeholder for chart */}
      <div className="chart">
        {/* Chart rendering logic should go here */}
      </div>
    </div>
  );
};

export default StatCard;