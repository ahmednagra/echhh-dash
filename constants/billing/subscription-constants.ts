// src/constants/billing/subscription-constants.ts

/**
 * Subscription Constants
 * Constants for subscription management (statuses, sort options, pagination defaults)
 */

import type { SubscriptionStatus } from '@/types/billing/subscription';

// ============================================================================
// PAGINATION DEFAULTS
// ============================================================================

export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_PAGE = 1;
export const DEFAULT_SORT_BY = 'created_at';
export const DEFAULT_SORT_ORDER = 'desc';

// ============================================================================
// STATUS OPTIONS
// ============================================================================

/**
 * Subscription status options for filters
 */
export const SUBSCRIPTION_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'trialing', label: 'Trialing' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'incomplete_expired', label: 'Incomplete Expired' },
  { value: 'paused', label: 'Paused' },
];

/**
 * Status labels mapping
 */
export const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past Due',
  canceled: 'Canceled',
  unpaid: 'Unpaid',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete Expired',
  paused: 'Paused',
};

/**
 * Get status label
 */
export function getStatusLabel(status: SubscriptionStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Status badge color configurations
 */
export interface StatusBadgeColors {
  color: string;
  bgColor: string;
  borderColor: string;
}

/**
 * Get status badge colors for Tailwind CSS
 */
export function getStatusBadgeColors(status: SubscriptionStatus): StatusBadgeColors {
  const colorMap: Record<SubscriptionStatus, StatusBadgeColors> = {
    active: {
      color: 'text-green-800',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    trialing: {
      color: 'text-blue-800',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
    },
    past_due: {
      color: 'text-orange-800',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
    },
    canceled: {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
    unpaid: {
      color: 'text-red-800',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
    incomplete: {
      color: 'text-yellow-800',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
    },
    incomplete_expired: {
      color: 'text-gray-800',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
    },
    paused: {
      color: 'text-purple-800',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
    },
  };

  return colorMap[status] || {
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  };
}

// ============================================================================
// SORT OPTIONS
// ============================================================================

/**
 * Sort options for subscription list
 */
export const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'current_period_start', label: 'Period Start' },
  { value: 'current_period_end', label: 'Period End' },
  { value: 'status', label: 'Status' },
  { value: 'plan_name', label: 'Plan Name' },
  { value: 'company_name', label: 'Company Name' },
];

/**
 * Sort direction options
 */
export const SORT_DIRECTION_OPTIONS = [
  { value: 'asc', label: 'Ascending (A-Z, Old-New)' },
  { value: 'desc', label: 'Descending (Z-A, New-Old)' },
];

// ============================================================================
// PAGE SIZE OPTIONS
// ============================================================================

/**
 * Page size options for pagination
 */
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];