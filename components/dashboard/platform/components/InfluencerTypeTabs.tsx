// src/components/dashboard/platform/components/InfluencerTypeTabs.tsx
'use client';

import { Activity, CheckCircle, Archive } from 'react-feather';

type InfluencerType = 'active' | 'archived' | 'completed';

interface InfluencerTypeTabsProps {
  currentType: InfluencerType;
  onTypeChange: (type: InfluencerType) => void;
}

export default function InfluencerTypeTabs({
  currentType,
  onTypeChange
}: InfluencerTypeTabsProps) {
  
  const tabs = [
    {
      type: 'active' as InfluencerType,
      label: 'Active',
      icon: Activity
    },
    {
      type: 'completed' as InfluencerType,
      label: 'Completed',
      icon: CheckCircle
    },
    {
      type: 'archived' as InfluencerType,
      label: 'Archived',
      icon: Archive
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md">
      <div className="grid grid-cols-3">
        {tabs.map((tab, index) => {
          const IconComponent = tab.icon;
          const isActive = currentType === tab.type;
          const isFirst = index === 0;
          const isLast = index === tabs.length - 1;
          
          return (
            <button
              key={tab.type}
              onClick={() => onTypeChange(tab.type)}
              className={`flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isFirst ? 'rounded-l-xl' : ''
              } ${
                isLast ? 'rounded-r-xl' : ''
              } ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              } ${
                !isLast && !isActive ? 'border-r border-gray-200' : ''
              }`}
            >
              <IconComponent className={`w-4 h-4 mr-2 ${
                isActive ? 'text-white' : 'text-gray-500'
              }`} />
              <span className="font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
} 