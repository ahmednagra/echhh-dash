// src/utils/formatters.ts
// Centralized formatting utilities

/**
 * Format a number with commas (e.g., 1000 -> "1,000")
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

/**
 * Format a number to display in K/M format for large numbers
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M", "150")
 */
export const formatCompactNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Format date to relative time (e.g., "2h ago", "3d ago")
 */
export const formatRelativeTime = (dateString: string | null): string => {
  if (!dateString) return 'Never';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString();
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format date with time
 */
export const formatDateTime = (date: string): string => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value.toString()).toFixed(decimals)}%`;
};

/**
 * Truncate text
 */
export const truncateText = (text: string, maxLength = 50): string => {
  if (!text) return '-';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};