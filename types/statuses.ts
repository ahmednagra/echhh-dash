// src/types/statuses.ts

export interface Status {
  id: string;
  model?: string;
  name: string;
  description?: string;
  applies_to_field?: string | null; // e.g. 'status_id', 'client_review_status_id', 'shortlisted_status_id'
  display_name?: string; // Human-readable name for UI display
  display_order?: number; // Order for sorting statuses in UI
  is_active?: boolean; // Whether the status is active/enabled
  color_code?: string | null; // Hex color code e.g. '#6c757d'
  icon?: string | null; // Icon name e.g. 'search', 'check-circle', 'x-circle'
  status_metadata?: Record<string, unknown> | null; // Additional metadata for the status
  color?: string | null; // Legacy: kept for backward compatibility
  created_at?: string;
  updated_at?: string;
}

export interface StatusesResponse {
  statuses: Status[];
}

// Type for the allowed statuses in agent dashboard
export type AllowedStatusName =
  | 'discovered'
  | 'unreachable'
  | 'contacted'
  | 'responded'
  | 'in_conversation'
  | 'contact_on_number'
  | 'completed'
  | 'declined'
  | 'inactive';

// Helper function to filter allowed statuses
export function filterAllowedStatuses(statuses: Status[]): Status[] {
  const allowedStatuses: AllowedStatusName[] = [
    // 'discovered',
    'unreachable',
    'contacted',
    'responded',
    'in_conversation',
    'contact_on_number',
    'completed',
    'declined',
    'inactive',
  ];

  return statuses.filter((status) =>
    allowedStatuses.includes(status.name as AllowedStatusName),
  );
}

// Helper function to sort statuses by display_order
export function sortStatusesByDisplayOrder(statuses: Status[]): Status[] {
  return [...statuses].sort((a, b) => {
    const orderA = a.display_order ?? 999;
    const orderB = b.display_order ?? 999;
    return orderA - orderB;
  });
}

// Helper function to get only active statuses
export function filterActiveStatuses(statuses: Status[]): Status[] {
  return statuses.filter((status) => status.is_active !== false);
}

// Helper function to get status display configuration
export function getStatusDisplayConfig(statusName: string) {
  switch (statusName.toLowerCase()) {
    case 'discovered':
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Discovered' };
    case 'unreachable':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        label: 'Unreachable',
      };
    case 'contacted':
      return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' };
    case 'responded':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Responded',
      };
    case 'in_conversation':
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        label: 'In Conversation',
      };
    case 'contact_on_number':
      return {
        bg: 'bg-teal-100',
        text: 'text-teal-800',
        label: 'Contact on Number',
      };
    case 'completed':
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        label: 'Info Received',
      };
    case 'declined':
      return { bg: 'bg-red-100', text: 'text-red-800', label: 'Declined' };
    case 'inactive':
      return { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Inactive' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', label: statusName };
  }
}

// Helper function to get status color from color_code
export function getStatusColorFromCode(colorCode: string | null | undefined): {
  bg: string;
  text: string;
  border: string;
} {
  if (!colorCode) {
    return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }

  // Map hex colors to Tailwind classes
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    '#6c757d': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
    '#dc3545': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
    '#007bff': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    '#17a2b8': { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-200' },
    '#ffc107': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200' },
    '#6f42c1': { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
    '#28a745': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  };

  return colorMap[colorCode.toLowerCase()] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
}

// Icon mapping for status icons
export const STATUS_ICON_MAP: Record<string, string> = {
  'search': 'Search',
  'phone-off': 'PhoneOff',
  'send': 'Send',
  'message-circle': 'MessageCircle',
  'message-square': 'MessageSquare',
  'phone': 'Phone',
  'check-circle': 'CheckCircle',
  'x-circle': 'XCircle',
  'pause': 'Pause',
};