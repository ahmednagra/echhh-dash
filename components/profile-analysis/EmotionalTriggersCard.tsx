// src/components/profile-analysis/EmotionalTriggersCard.tsx
import React from 'react';
import { Sparkles } from 'lucide-react';

interface EmotionalTriggersCardProps {
  topPerforming: Record<string, number> | undefined;
  averagePerforming: Record<string, number> | undefined;
  leastPerforming: Record<string, number> | undefined;
}

interface TriggerSectionProps {
  title: string;
  colorClass: string;
  triggers: Record<string, number> | undefined;
  bgColorClass: string;
}

const TriggerSection: React.FC<TriggerSectionProps> = ({ title, colorClass, triggers, bgColorClass }) => {
  // Process trigger values and handle different formats
  const processedTriggers = React.useMemo(() => {
    if (!triggers) return [];
    
    // Helper function to safely convert values to numbers
    const processValue = (value: any): number => {
      if (typeof value === 'string') {
        const numValue = parseInt(value.replace('%', '')) || 0;
        return numValue;
      }
      const numValue = Number(value);
      return isNaN(numValue) ? 0 : numValue;
    };

    // Get the common triggers and their values
    const commonTriggers = ['humor', 'urgency', 'nostalgia'];
    
    return commonTriggers.map(trigger => {
      const key = Object.keys(triggers).find(k => 
        k.toLowerCase().includes(trigger.toLowerCase())
      );
      
      const value = key ? processValue(triggers[key]) : 0;
      
      return {
        name: trigger.charAt(0).toUpperCase() + trigger.slice(1),
        value: value
      };
    });
  }, [triggers]);

  if (!triggers || Object.keys(triggers).length === 0) {
    return (
      <div className="flex-1 bg-white p-6 rounded-lg border border-gray-200">
        <h4 className={`text-md font-bold ${colorClass} mb-4`}>{title}</h4>
        <p className="text-gray-500 text-sm">No emotional trigger data available</p>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white p-6 rounded-lg border border-gray-200">
      <h4 className={`text-md font-bold ${colorClass} mb-6`}>{title}</h4>
      <div className="space-y-4">
        {processedTriggers.map((trigger) => (
          <div key={trigger.name} className="flex items-center">
            <div className="w-16 text-sm text-gray-600 capitalize">{trigger.name}</div>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 h-4 rounded-full overflow-hidden">
                <div 
                  className={`${bgColorClass} h-full rounded-full transition-all duration-500 ease-in-out`} 
                  style={{ width: `${trigger.value}%` }}
                ></div>
              </div>
            </div>
            <div className="text-sm font-medium w-12 text-right">
              {trigger.value}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmotionalTriggersCard: React.FC<EmotionalTriggersCardProps> = ({
  topPerforming,
  averagePerforming,
  leastPerforming
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <Sparkles className="mr-2 w-5 h-5 text-yellow-600" />
        Emotional & Engagement Triggers
      </h3>
      
      <div className="flex gap-6">
        <TriggerSection
          title="Top Performing"
          colorClass="text-green-600"
          triggers={topPerforming}
          bgColorClass="bg-green-500"
        />
        <TriggerSection
          title="Average Performing"
          colorClass="text-blue-600"
          triggers={averagePerforming}
          bgColorClass="bg-blue-500"
        />
        <TriggerSection
          title="Least Performing"
          colorClass="text-orange-600"
          triggers={leastPerforming}
          bgColorClass="bg-red-500"
        />
      </div>
    </div>
  );
};

export default EmotionalTriggersCard;