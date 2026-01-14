// src/utils/format.ts

/**
 * Format a number to display in K/M format for large numbers
 * @param num - The number to format
 * @returns Formatted string (e.g., "1.2K", "3.5M", "150")
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Format a string that might contain number with commas/text to display in K/M format
 * @param value - The value to format (could be "1,234" or "1.2K" etc.)
 * @returns Formatted string
 */
export const formatNumberFromString = (value: string | number): string => {
  if (typeof value === 'number') {
    return formatNumber(value);
  }
  
  // Extract numbers from string (remove commas, K, M suffixes)
  const cleanValue = value.replace(/[^\d.]/g, '');
  const num = parseFloat(cleanValue);
  
  if (isNaN(num)) {
    return 'N/A';
  }
  
  // If original string contained K or M, we need to convert back to actual number
  if (value.toLowerCase().includes('k')) {
    return formatNumber(num * 1000);
  }
  if (value.toLowerCase().includes('m')) {
    return formatNumber(num * 1000000);
  }
  
  return formatNumber(num);
};