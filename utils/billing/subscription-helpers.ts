// src/utils/billing/subscription-helpers.ts

/**
 * Subscription Helper Functions
 * Utility functions for formatting and manipulating subscription data
 * ✅ UPDATED: Now handles new nested object structures (status, company, plan, creator)
 */

import type { SubscriptionStatus, SubscriptionCreator, SubscriptionPlan } from '@/types/billing/subscription';

// ============================================================================
// NESTED OBJECT HELPERS (✅ UPDATED for new structure)
// ============================================================================

/**
 * Get user display name from creator field
 * ✅ UPDATED: Now expects creator object, with backwards compatibility
 */
export function getUserDisplayName(creator: SubscriptionCreator | string | { id: string; email: string; full_name: string }): string {
  // New structure: creator is an object with full_name
  if (typeof creator === 'object' && creator !== null && 'full_name' in creator) {
    return creator.full_name || 'Unknown User';
  }
  
  // Fallback for old structure or unknown format
  return 'Unknown User';
}

/**
 * Get user email from creator field
 * ✅ UPDATED: Now expects creator object, with backwards compatibility
 */
export function getUserEmail(creator: SubscriptionCreator | string | { id: string; email: string; full_name: string }): string {
  // New structure: creator is an object with email
  if (typeof creator === 'object' && creator !== null && 'email' in creator) {
    return creator.email;
  }
  
  // Fallback: if it's a string, truncate it as ID
  if (typeof creator === 'string') {
    return truncateId(creator, 12);
  }
  
  return 'Unknown';
}

/**
 * Get plan name
 * ✅ UPDATED: Handles null plans correctly
 */
export function getPlanName(plan: SubscriptionPlan | null | undefined, fallbackId?: string): string {
  if (plan?.name) {
    return plan.name;
  }
  
  // Handle custom plans or plans without names
  if (fallbackId) {
    return `Plan ${truncateId(fallbackId, 8)}`;
  }
  
  return 'Custom Plan';
}

/**
 * Get plan code
 * ✅ UPDATED: Handles null plans correctly
 */
export function getPlanCode(plan: SubscriptionPlan | null | undefined): string | null {
  return plan?.code || null;
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    return 'Invalid Date';
  }
}

/**
 * Format subscription period (start - end)
 */
export function formatSubscriptionPeriod(start: string, end: string): string {
  return `${formatDate(start)} - ${formatDate(end)}`;
}

// ============================================================================
// TIME CALCULATIONS
// ============================================================================

/**
 * Calculate days remaining until a date
 */
export function getDaysRemaining(dateString: string | null): number | null {
  if (!dateString) return null;
  
  try {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    return null;
  }
}

/**
 * Check if trial is currently active
 */
export function isTrialActive(trialStart: string | null, trialEnd: string | null): boolean {
  if (!trialStart || !trialEnd) return false;
  
  try {
    const now = new Date();
    const start = new Date(trialStart);
    const end = new Date(trialEnd);
    return now >= start && now <= end;
  } catch (error) {
    return false;
  }
}

/**
 * Check if subscription is expired
 */
export function isSubscriptionExpired(periodEnd: string): boolean {
  try {
    const end = new Date(periodEnd);
    const now = new Date();
    return now > end;
  } catch (error) {
    return false;
  }
}

// ============================================================================
// STATUS HELPERS
// ============================================================================

/**
 * Get status badge variant
 */
export function getStatusVariant(status: SubscriptionStatus): 'success' | 'warning' | 'error' | 'info' | 'default' {
  const variantMap: Record<SubscriptionStatus, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
    active: 'success',
    trialing: 'info',
    past_due: 'warning',
    canceled: 'error',
    unpaid: 'error',
    incomplete: 'warning',
    incomplete_expired: 'default',
    paused: 'default',
  };
  
  return variantMap[status] || 'default';
}

/**
 * Check if status is considered "healthy"
 */
export function isHealthyStatus(status: SubscriptionStatus): boolean {
  return ['active', 'trialing'].includes(status);
}

/**
 * Check if status is considered "problematic"
 */
export function isProblematicStatus(status: SubscriptionStatus): boolean {
  return ['past_due', 'unpaid', 'incomplete', 'canceled'].includes(status);
}

// ============================================================================
// DISPLAY HELPERS
// ============================================================================

/**
 * Truncate subscription ID for display
 */
export function truncateId(id: string, length: number = 8): string {
  if (id.length <= length) return id;
  return `${id.substring(0, length)}...`;
}

/**
 * Format item count with pluralization
 */
export function formatItemCount(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/**
 * Get auto-renewal text
 */
export function getAutoRenewalText(cancelAtPeriodEnd: boolean): string {
  return cancelAtPeriodEnd ? 'Will not renew' : 'Auto-renews';
}

// ============================================================================
// SEARCH & FILTER HELPERS
// ============================================================================

/**
 * Build search query string
 */
export function buildSearchQuery(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '' && value !== 'all') {
      params.append(key, String(value));
    }
  });
  
  return params.toString();
}

/**
 * Parse URL search params to filters object
 */
export function parseSearchParams(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {};
  
  searchParams.forEach((value, key) => {
    // Handle boolean values
    if (value === 'true') filters[key] = true;
    else if (value === 'false') filters[key] = false;
    // Handle numeric values
    else if (!isNaN(Number(value)) && value !== '') filters[key] = Number(value);
    // Handle string values
    else filters[key] = value;
  });
  
  return filters;
}