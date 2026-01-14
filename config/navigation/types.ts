// =============================================================================
// src/config/navigation/types.ts
// =============================================================================
// Navigation type definitions - Industry standard approach
// Used by: Linear, Stripe, Notion, Discord
// =============================================================================

import { DetailedRole } from '@/types/auth';

/**
 * Single navigation item (leaf node)
 */
export interface NavigationItem {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Route path */
  href: string;
  /** Icon name (must exist in iconMap) */
  icon: string;
  /** Optional description for tooltips */
  description?: string;
  /** Required permissions to view this item */
  requiredPermissions?: {
    resource: string;
    action: string;
  }[];
  /** Roles that can see this item (if not specified, all roles can see) */
  roles?: DetailedRole[];
  /** Badge content (e.g., notification count) */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  /** Whether this item is disabled */
  disabled?: boolean;
  /** External link (opens in new tab) */
  external?: boolean;
}

/**
 * Navigation section (collapsible group of items)
 */
export interface NavigationSection {
  /** Unique identifier */
  id: string;
  /** Section title */
  title: string;
  /** Icon name */
  icon: string;
  /** Accent color for the section */
  color: string;
  /** Child navigation items */
  items: NavigationItem[];
  /** Whether section is expanded by default */
  defaultExpanded?: boolean;
  /** Roles that can see this section */
  roles?: DetailedRole[];
}

/**
 * Union type for navigation config - can be flat item or section
 */
export type NavigationConfig = NavigationItem | NavigationSection;

/**
 * Type guard to check if config is a section
 */
export function isNavigationSection(config: NavigationConfig): config is NavigationSection {
  return 'items' in config && Array.isArray(config.items);
}

/**
 * Type guard to check if config is a flat item
 */
export function isNavigationItem(config: NavigationConfig): config is NavigationItem {
  return 'href' in config && !('items' in config);
}

/**
 * Settings navigation item (extends NavigationItem with settings-specific fields)
 */
export interface SettingsNavigationItem extends NavigationItem {
  /** Category for grouping in settings */
  category?: 'personal' | 'tools' | 'platform' | 'company' | 'support';
}

/**
 * Complete navigation configuration for a role
 */
export interface RoleNavigationConfig {
  /** Role identifier */
  role: DetailedRole;
  /** Main navigation sections/items */
  navigation: NavigationConfig[];
  /** Settings navigation items */
  settings: SettingsNavigationItem[];
  /** Quick actions (optional - for command palette) */
  quickActions?: NavigationItem[];
}

/**
 * Sidebar state interface
 */
export interface SidebarState {
  /** Which sections are expanded */
  expandedSections: Record<string, boolean>;
  /** Whether sidebar is collapsed (mobile/mini mode) */
  isCollapsed: boolean;
  /** Active item path */
  activePath: string | null;
}

/**
 * Color scheme for different user types
 */
export interface NavigationColorScheme {
  activeBg: string;
  activeText: string;
  activeIcon: string;
  hoverBg: string;
  sectionColor: string;
}

/**
 * Get color scheme based on user type
 */
export function getNavigationColors(userType: string): NavigationColorScheme {
  switch (userType) {
    case 'platform':
      return {
        activeBg: 'bg-indigo-50',
        activeText: 'text-indigo-700',
        activeIcon: 'text-indigo-600',
        hoverBg: 'hover:bg-gray-50',
        sectionColor: 'text-indigo-600'
      };
    case 'b2c':
      return {
        activeBg: 'bg-blue-50',
        activeText: 'text-blue-700',
        activeIcon: 'text-blue-600',
        hoverBg: 'hover:bg-gray-50',
        sectionColor: 'text-blue-600'
      };
    case 'influencer':
      return {
        activeBg: 'bg-purple-50',
        activeText: 'text-purple-700',
        activeIcon: 'text-purple-600',
        hoverBg: 'hover:bg-gray-50',
        sectionColor: 'text-purple-600'
      };
    default:
      return {
        activeBg: 'bg-gray-100',
        activeText: 'text-gray-900',
        activeIcon: 'text-gray-700',
        hoverBg: 'hover:bg-gray-50',
        sectionColor: 'text-gray-600'
      };
  }
}