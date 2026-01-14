// src/components/profile-analysis/PerformanceCategory.tsx
import React from 'react';

interface PerformanceCategoryProps {
  title: string;
  variant: 'success' | 'info' | 'warning';
  data: {
    shortcodes?: string[];
    qualitative?: {
      themes?: string[];
      emotional_tones?: string[];
      storytelling_styles?: string[];
      [key: string]: any;
    };
    quantitative?: {
      [key: string]: any;
    };
  };
  icon: React.ReactNode;
}

export default function PerformanceCategory({
  title,
  variant,
  data,
  icon
}: PerformanceCategoryProps) {
  // Map variant to colors
  const colorConfig = {
    success: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      title: 'text-green-700',
      icon: 'text-green-600',
      tag: 'bg-green-100 text-green-700'
    },
    info: {
      border: 'border-blue-200', 
      bg: 'bg-blue-50',
      title: 'text-blue-700',
      icon: 'text-blue-600',
      tag: 'bg-blue-100 text-blue-700'
    },
    warning: {
      border: 'border-orange-200',
      bg: 'bg-orange-50', 
      title: 'text-orange-700',
      icon: 'text-orange-600',
      tag: 'bg-orange-100 text-orange-700'
    }
  };

  const colors = colorConfig[variant];
  
  // Component for rendering tag lists
  const TagList = ({ label, items }: { label: string; items: string[] }) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{label}:</h4>
        <div className="flex flex-wrap gap-1">
          {items.map((item, index) => (
            <span 
              key={index}
              className={`px-2 py-1 text-xs font-medium rounded ${colors.tag}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`${colors.bg} ${colors.border} border rounded-lg p-4 h-full`}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <span className={`mr-2 ${colors.icon}`}>
          {icon}
        </span>
        <h3 className={`font-medium ${colors.title}`}>{title}</h3>
      </div>
      
      {/* Video Links */}
      {data?.shortcodes && data.shortcodes.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {data.shortcodes.map((code: string, index: number) => (
              <a 
                key={code}
                href={`https://www.instagram.com/p/${code}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-block px-2 py-1 text-xs font-medium rounded hover:opacity-80 transition-opacity ${colors.tag}`}
              >
                #{index + 1}
              </a>
            ))}
          </div>
        </div>
      )}
      
      {/* Content Sections */}
      <div className="space-y-3">
        <TagList 
          label="Key Themes" 
          items={data?.qualitative?.themes || []} 
        />
        
        <TagList 
          label="Emotional Tone" 
          items={data?.qualitative?.emotional_tones || []} 
        />
        
        <TagList 
          label="Storytelling Style" 
          items={data?.qualitative?.storytelling_styles || []} 
        />

      </div>
    </div>
  );
}