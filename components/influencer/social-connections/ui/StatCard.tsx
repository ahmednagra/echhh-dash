// =============================================================================
// src/components/influencer/social-connections/ui/StatCard.tsx
// =============================================================================
// Reusable statistics card component for dashboard metrics
// =============================================================================

'use client';

import React, { ReactNode } from 'react';
import { SocialPlatformType } from '@/types/influencer-social-connections';

// =============================================================================
// MAIN STAT CARD
// =============================================================================

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'instagram' | 'tiktok' | 'youtube' | 'twitter' | 'total';
  isLoading?: boolean;
  className?: string;
}

const VARIANT_STYLES = {
  default: {
    border: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-600',
  },
  instagram: {
    border: 'border-t-4 border-t-pink-500 border-gray-200',
    iconBg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
    iconColor: 'text-white',
  },
  tiktok: {
    border: 'border-t-4 border-t-black border-gray-200',
    iconBg: 'bg-black',
    iconColor: 'text-white',
  },
  youtube: {
    border: 'border-t-4 border-t-red-600 border-gray-200',
    iconBg: 'bg-red-600',
    iconColor: 'text-white',
  },
  twitter: {
    border: 'border-t-4 border-t-black border-gray-200',
    iconBg: 'bg-black',
    iconColor: 'text-white',
  },
  total: {
    border: 'border-t-4 border-t-purple-500 border-gray-200',
    iconBg: 'bg-gradient-to-br from-pink-500 to-purple-600',
    iconColor: 'text-white',
  },
};

export default function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  isLoading = false,
  className = '',
}: StatCardProps) {
  const styles = VARIANT_STYLES[variant];

  return (
    <div
      className={`
        bg-white rounded-2xl p-6 border shadow-sm
        hover:shadow-md transition-all duration-200
        ${styles.border}
        ${className}
      `}
    >
      {/* Icon */}
      {icon && (
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center mb-4
            ${styles.iconBg} ${styles.iconColor}
          `}
        >
          {icon}
        </div>
      )}

      {/* Label */}
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>

      {/* Value */}
      {isLoading ? (
        <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">
            {value}
          </span>
          
          {/* Trend Indicator */}
          {trend && (
            <span
              className={`
                inline-flex items-center text-sm font-medium
                ${trend.isPositive ? 'text-green-600' : 'text-red-600'}
              `}
            >
              {trend.isPositive ? (
                <svg className="w-4 h-4 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              {Math.abs(trend.value)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MINI STAT CARD
// =============================================================================

interface MiniStatCardProps {
  label: string;
  value: string | number;
  className?: string;
}

export function MiniStatCard({ label, value, className = '' }: MiniStatCardProps) {
  return (
    <div
      className={`
        text-center p-3 bg-white rounded-lg border border-gray-100
        ${className}
      `}
    >
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
    </div>
  );
}

// =============================================================================
// STATS GRID
// =============================================================================

interface StatsGridProps {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ children, columns = 4, className = '' }: StatsGridProps) {
  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={`
        grid gap-4 md:gap-5
        ${columnClasses[columns]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-gray-200 mb-4" />
      <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-16 bg-gray-200 rounded" />
    </div>
  );
}