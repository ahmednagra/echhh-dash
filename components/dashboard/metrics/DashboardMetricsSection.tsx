// src/components/dashboard/metrics/DashboardMetricsSection.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';

// Define the metric item types
interface MetricItem {
  value: string | number;
  label: string;
  change: string;
  isPositive: boolean;
}

// Define the props for the component
interface DashboardMetricsSectionProps {
  userType?: 'b2c' | 'influencer' | 'platform';
}

// Tabs available in the metrics section
type MetricTab = 'stats' | 'performance' | 'both';

const DashboardMetricsSection: React.FC<DashboardMetricsSectionProps> = ({ 
  userType = 'b2c' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false); // Changed from true to false
  const [activeTab, setActiveTab] = useState<MetricTab>('stats');

  // Sample stats metrics - this would come from an API in production
  const statsMetrics: MetricItem[] = [
    { value: '3.5K', label: 'Discovered Influencers', change: '25.5%', isPositive: true },
    { value: '683', label: 'Shortlisted', change: '25.5%', isPositive: true },
    { value: '782', label: 'Message Sent', change: '25.5%', isPositive: true },
    { value: '194', label: 'In Conversation', change: '25.5%', isPositive: true },
    { value: '176', label: 'Ready to Onboard', change: '25.5%', isPositive: false },
    { value: '206', label: 'Onboard', change: '25.5%', isPositive: true },
    { value: '396', label: 'Brief Shared', change: '25.5%', isPositive: true },
    { value: '133', label: 'Idea Status', change: '25.5%', isPositive: true },
    { value: '255', label: 'Content Status', change: '25.5%', isPositive: false },
    { value: '543', label: 'Unpublished', change: '25.5%', isPositive: true },
    { value: '69', label: 'Published', change: '25.5%', isPositive: true },
    { value: '125', label: 'Payments', change: '25.5%', isPositive: true },
  ];

  // Performance metrics - empty for now as requested
  const performanceMetrics: MetricItem[] = [];
  
  // Both metrics - empty for now as requested
  const bothMetrics: MetricItem[] = [];

  // Get current metrics based on active tab
  const getCurrentMetrics = () => {
    switch (activeTab) {
      case 'performance':
        return performanceMetrics;
      case 'both':
        return bothMetrics;
      case 'stats':
      default:
        return statsMetrics;
    }
  };

  // Toggle the expanded state
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-xl shadow-md mb-1 overflow-hidden">
      {/* Header with tabs and toggle */}
      <div 
        className="flex justify-between items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
        onClick={toggleExpanded}
      >        <h2 className="text-lg font-bold text-gray-800">Stats & Performance</h2>
        
        <div className="flex items-center space-x-2">
          {/* Tabs */}
          <div className="flex space-x-1 mr-3">
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'stats' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('stats');
              }}
            >
              Stats
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'performance' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('performance');
              }}
            >
              Performance
            </button>
            <button 
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeTab === 'both' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('both');
              }}
            >
              Both
            </button>
          </div>
          
          {/* Toggle collapse button */}
          <button 
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="px-4 py-4">

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {getCurrentMetrics().length > 0 ? (
              getCurrentMetrics().map((metric, index) => (
                <div 
                  key={index} 
                  className="bg-gray-50 p-4 rounded-lg transition-all hover:shadow-md"
                >
                  <div className="flex items-baseline justify-between mb-1">
                    <h3 className="text-2xl font-bold text-gray-800">{metric.value}</h3>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full flex items-center ${
                      metric.isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'
                    }`}>
                      {metric.isPositive ? '↑' : '↓'} {metric.change}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center items-center py-10 text-gray-500">
                No data available for this view.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardMetricsSection;