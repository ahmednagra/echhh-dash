// src/components/profile-analysis/MetricDisplay.tsx
import React from 'react';

interface MetricDisplayProps {
  label: string;
  value: any;
  variant?: 'default' | 'success' | 'info' | 'warning';
}

export default function MetricDisplay({ 
  label, 
  value, 
  variant = 'default' 
}: MetricDisplayProps) {
  // Helper function to determine if value is an array
  const isArray = Array.isArray(value);
  
  // Handle different value types
  const renderValue = () => {
    if (value === undefined || value === null) return 'N/A';
    
    if (isArray) {
      return value.map((item: string, index: number) => (
        <span 
          key={index} 
          className={`inline-block px-2 py-1 mr-2 mb-1 text-xs rounded ${getVariantClasses(variant, true)}`}
        >
          {item}
        </span>
      ));
    }
    
    if (typeof value === 'object') {
      return Object.entries(value).map(([key, val]) => (
        <div key={key} className="flex items-center text-sm mb-1">
          <span className="capitalize mr-2">{key.replace(/_/g, ' ')}:</span>
          <span className="font-medium">{val as string}</span>
        </div>
      ));
    }
    
    return value;
  };
  
  // Get appropriate classes based on variant
  const getVariantClasses = (variant: string, isTag: boolean = false) => {
    switch (variant) {
      case 'success':
        return isTag ? 'bg-green-100 text-green-800' : 'text-green-600';
      case 'info':
        return isTag ? 'bg-blue-100 text-blue-800' : 'text-blue-600';
      case 'warning':
        return isTag ? 'bg-orange-100 text-orange-800' : 'text-orange-600';
      default:
        return isTag ? 'bg-gray-100 text-gray-800' : 'text-gray-600';
    }
  };

  return (
    <div className="mb-2">
      <span className="font-medium text-gray-700">{label}: </span>
      <div className={`${isArray ? 'flex flex-wrap mt-1' : 'inline'}`}>
        {renderValue()}
      </div>
    </div>
  );
}