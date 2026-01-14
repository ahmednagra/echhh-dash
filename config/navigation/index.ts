// =============================================================================
// src/config/navigation/index.ts
// =============================================================================
// Navigation configuration exports
// =============================================================================

// Types
export {
  type NavigationItem,
  type NavigationSection,
  type NavigationConfig,
  type SettingsNavigationItem,
  type RoleNavigationConfig,
  type SidebarState,
  type NavigationColorScheme,
  isNavigationSection,
  isNavigationItem,
  getNavigationColors,
} from './types';

// Settings configuration
export {
  getSettingsForRole,
  groupSettingsByCategory,
  SETTINGS_CATEGORY_LABELS,
} from './settings';