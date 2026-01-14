// src/utils/badge-helpers.ts
// Badge styling and configuration utilities

/**
 * Get agent type badge configuration (colors and icons)
 */
export const getAgentTypeBadge = (type: string) => {
  const badges: Record<string, { color: string; icon: string }> = {
    instagram: { 
      color: 'bg-purple-100 text-purple-700 border border-purple-200', 
      icon: '📸' 
    },
    email: { 
      color: 'bg-blue-100 text-blue-700 border border-blue-200', 
      icon: '📧' 
    },
    whatsapp: { 
      color: 'bg-green-100 text-green-700 border border-green-200', 
      icon: '💬' 
    }
  };
  return badges[type] || { 
    color: 'bg-gray-100 text-gray-700 border border-gray-200', 
    icon: '👤' 
  };
};

/**
 * Get status badge configuration (colors)
 */
export const getStatusBadge = (status: string): string => {
  const statuses: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border border-green-200',
    inactive: 'bg-gray-100 text-gray-700 border border-gray-200',
    pending: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
    suspended: 'bg-red-100 text-red-700 border border-red-200'
  };
  return statuses[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
};

/**
 * Get availability badge configuration (colors)
 */
export const getAvailabilityBadge = (isAvailable: boolean): string => {
  return isAvailable
    ? 'bg-green-100 text-green-700 border border-green-200'
    : 'bg-red-100 text-red-700 border border-red-200';
};