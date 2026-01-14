// =============================================================================
// src/components/influencer/social-connections/ui/StatusBadge.tsx
// =============================================================================
// Reusable status badge component for connection status display
// =============================================================================

'use client';

import React from 'react';
import { ConnectionStatus } from '@/types/influencer-social-connections';
import { getStatusLabel, getStatusBadgeStyle } from '@/utils/social-connections.utils';

interface StatusBadgeProps {
  status: ConnectionStatus;
  showDot?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

const DOT_SIZES = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
  lg: 'w-2.5 h-2.5',
};

export default function StatusBadge({
  status,
  showDot = true,
  size = 'md',
  className = '',
}: StatusBadgeProps) {
  const style = getStatusBadgeStyle(status);
  const label = getStatusLabel(status);

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${style.bg} ${style.text}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    >
      {showDot && (
        <span
          className={`
            ${DOT_SIZES[size]} 
            rounded-full 
            ${style.dot}
            ${status === 'pending' ? 'animate-pulse' : ''}
          `}
        />
      )}
      {label}
    </span>
  );
}

// =============================================================================
// VARIANT: Connection Count Badge
// =============================================================================

interface ConnectionCountBadgeProps {
  count: number;
  variant?: 'default' | 'success' | 'warning';
  className?: string;
}

export function ConnectionCountBadge({
  count,
  variant = 'default',
  className = '',
}: ConnectionCountBadgeProps) {
  const variantStyles = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <span className={`w-2 h-2 rounded-full ${
        variant === 'success' ? 'bg-green-500' :
        variant === 'warning' ? 'bg-yellow-500' :
        'bg-gray-500'
      }`} />
      {count} Connected
    </span>
  );
}

// =============================================================================
// VARIANT: Coming Soon Badge
// =============================================================================

interface ComingSoonBadgeProps {
  className?: string;
}

export function ComingSoonBadge({ className = '' }: ComingSoonBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-md
        bg-gray-900 text-white text-xs font-semibold uppercase tracking-wide
        ${className}
      `}
    >
      Coming Soon
    </span>
  );
}

// =============================================================================
// VARIANT: Verified Badge
// =============================================================================

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function VerifiedBadge({ size = 'md', className = '' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center rounded-full
        bg-blue-500 text-white
        ${sizeClasses[size]}
        ${className}
      `}
      title="Verified Account"
    >
      <svg
        className="w-3 h-3"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
      </svg>
    </span>
  );
}

// =============================================================================
// VARIANT: Account Type Badge
// =============================================================================

interface AccountTypeBadgeProps {
  type: 'personal' | 'business' | 'creator';
  className?: string;
}

export function AccountTypeBadge({ type, className = '' }: AccountTypeBadgeProps) {
  const typeStyles = {
    personal: 'bg-gray-100 text-gray-700',
    business: 'bg-blue-100 text-blue-700',
    creator: 'bg-purple-100 text-purple-700',
  };

  const typeLabels = {
    personal: 'Personal',
    business: 'Business',
    creator: 'Creator',
  };

  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize
        ${typeStyles[type]}
        ${className}
      `}
    >
      {typeLabels[type]}
    </span>
  );
}