// src/components/profile-analysis/EmotionalTriggerChart.tsx
import React from 'react';

interface EmotionalTriggerChartProps {
  title: string;
  colorClass: string;
  triggers: Record<string, number> | undefined;
}

export default function EmotionalTriggerChart({
  title,
  colorClass,
  triggers
}: EmotionalTriggerChartProps) {
  // Normalize trigger values to sum to 100%
  const normalizedTriggers = React.useMemo(() => {
    if (!triggers) return null;
    
    const total = Object.values(triggers).reduce((sum, val) => sum + Number(val), 0);
    if (total <= 0) return null;

    return Object.fromEntries(
      Object.entries(triggers).map(([emotion, value]) => [
        emotion,
        Math.round((Number(value) / total) * 100)
      ])
    );
  }, [triggers]);

  // Map text color classes to background color classes
  const bgColorClass = React.useMemo(() => {
    switch(colorClass) {
      case 'text-green-600': return 'bg-green-600';
      case 'text-blue-600': return 'bg-blue-600';
      case 'text-orange-600': return 'bg-orange-600';
      default: return 'bg-blue-600'; // fallback
    }
  }, [colorClass]);

  if (!normalizedTriggers || Object.keys(normalizedTriggers).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 h-full">
        <h4 className={`text-md font-medium ${colorClass} mb-3`}>{title}</h4>
        <p className="text-gray-500 text-sm">No emotional trigger data available</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200 h-full">
      <h4 className={`text-md font-medium ${colorClass} mb-3`}>{title}</h4>
      <div className="space-y-3">
        {Object.entries(normalizedTriggers).map(([emotion, percentage]) => (
          <div key={emotion} className="flex items-center">
            <div className="w-24 text-sm text-gray-600 capitalize">{emotion}</div>
            <div className="flex-1 mx-2">
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`${bgColorClass} h-full rounded-full`} 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium w-10 text-right">
              {percentage}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}