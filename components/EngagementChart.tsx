import React from 'react';

interface EngagementChartProps {
  data: number[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data }) => {
  return (
    <div className="engagement-chart">
      <h3>Engagements spread for last posts</h3>
      {/* Placeholder for engagement chart */}
      <div className="chart">
        {/* Chart rendering logic should go here */}
      </div>
    </div>
  );
};

export default EngagementChart;