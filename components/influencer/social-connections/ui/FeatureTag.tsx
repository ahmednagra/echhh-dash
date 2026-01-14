// =============================================================================
// src/components/influencer/social-connections/ui/FeatureTag.tsx
// =============================================================================
// Reusable feature tag component for displaying platform capabilities
// =============================================================================

'use client';

import React, { ReactNode } from 'react';
import {
  MessageCircle,
  MessageSquare,
  Calendar,
  BarChart2,
  Circle,
  Video,
  Edit3,
  Users,
  Eye,
  Zap,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

type FeatureIconType =
  | 'MessageCircle'
  | 'MessageSquare'
  | 'Calendar'
  | 'BarChart2'
  | 'Circle'
  | 'Video'
  | 'Edit3'
  | 'Users'
  | 'Eye'
  | 'Zap';

interface FeatureTagProps {
  name: string;
  icon?: FeatureIconType | ReactNode;
  isActive?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

// =============================================================================
// ICON MAPPING
// =============================================================================

const ICON_MAP: Record<FeatureIconType, React.ComponentType<{ className?: string }>> = {
  MessageCircle,
  MessageSquare,
  Calendar,
  BarChart2,
  Circle,
  Video,
  Edit3,
  Users,
  Eye,
  Zap,
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function FeatureTag({
  name,
  icon,
  isActive = true,
  size = 'md',
  className = '',
}: FeatureTagProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-[10px] gap-1',
    md: 'px-2.5 py-1.5 text-xs gap-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  };

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === 'string' && icon in ICON_MAP) {
      const IconComponent = ICON_MAP[icon as FeatureIconType];
      return <IconComponent className={iconSizes[size]} />;
    }

    return icon;
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-md font-medium
        ${sizeClasses[size]}
        ${isActive
          ? 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
          : 'bg-gray-100 border border-gray-100 text-gray-400'
        }
        transition-colors duration-150
        ${className}
      `}
    >
      {renderIcon()}
      {name}
    </span>
  );
}

// =============================================================================
// FEATURE TAGS GROUP
// =============================================================================

interface FeatureTagsGroupProps {
  features: Array<{
    id: string;
    name: string;
    icon?: FeatureIconType;
    isEnabled?: boolean;
  }>;
  maxVisible?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function FeatureTagsGroup({
  features,
  maxVisible = 4,
  size = 'md',
  className = '',
}: FeatureTagsGroupProps) {
  const visibleFeatures = features.slice(0, maxVisible);
  const remainingCount = features.length - maxVisible;

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visibleFeatures.map((feature) => (
        <FeatureTag
          key={feature.id}
          name={feature.name}
          icon={feature.icon}
          isActive={feature.isEnabled !== false}
          size={size}
        />
      ))}
      {remainingCount > 0 && (
        <span
          className={`
            inline-flex items-center rounded-md font-medium
            bg-gray-100 border border-gray-100 text-gray-500
            ${size === 'sm' ? 'px-2 py-1 text-[10px]' : 'px-2.5 py-1.5 text-xs'}
          `}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  );
}

// =============================================================================
// FEATURE PERMISSION INDICATOR
// =============================================================================

interface FeaturePermissionProps {
  name: string;
  isGranted: boolean;
  className?: string;
}

export function FeaturePermission({
  name,
  isGranted,
  className = '',
}: FeaturePermissionProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`
          flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center
          ${isGranted ? 'bg-green-100' : 'bg-gray-100'}
        `}
      >
        {isGranted ? (
          <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </span>
      <span className={`text-sm ${isGranted ? 'text-gray-700' : 'text-gray-400'}`}>
        {name}
      </span>
    </div>
  );
}

// =============================================================================
// SCOPES SUMMARY
// =============================================================================

interface ScopesSummaryProps {
  scopes: string[];
  className?: string;
}

const SCOPE_LABELS: Record<string, string> = {
  'instagram_business_basic': 'Read profile information',
  'instagram_business_manage_messages': 'Access and manage messages',
  'instagram_business_manage_comments': 'Read and reply to comments',
  'instagram_business_content_publish': 'Publish content and stories',
  'instagram_business_manage_insights': 'View insights and analytics',
};

export function ScopesSummary({ scopes, className = '' }: ScopesSummaryProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {scopes.map((scope) => (
        <FeaturePermission
          key={scope}
          name={SCOPE_LABELS[scope] || scope}
          isGranted={true}
        />
      ))}
    </div>
  );
}