// =============================================================================
// src/config/navigation/settings.ts
// =============================================================================
// Settings navigation configuration by role
// =============================================================================

import { DetailedRole } from '@/types/auth';
import { SettingsNavigationItem } from './types';

/**
 * Settings items available to ALL users
 */
const COMMON_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'profile',
    name: 'Profile',
    href: '/settings/profile',
    icon: 'User',
    description: 'Personal information and account details',
    category: 'personal'
  },
  {
    id: 'security',
    name: 'Security',
    href: '/settings/security',
    icon: 'Shield',
    description: 'Password, 2FA, and security settings',
    category: 'personal'
  }
];

/**
 * Settings items for SUPPORT (all users)
 */
const SUPPORT_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'help',
    name: 'Help & Support',
    href: '/settings/help',
    icon: 'HelpCircle',
    description: 'Documentation, tutorials, and support',
    category: 'support'
  }
];

/**
 * Platform Admin specific settings
 */
const PLATFORM_ADMIN_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'system',
    name: 'System',
    href: '/settings/system',
    icon: 'Server',
    description: 'System configuration and maintenance',
    category: 'platform'
  },
  {
    id: 'users',
    name: 'User Management',
    href: '/settings/users',
    icon: 'Users',
    description: 'Manage users, roles, and permissions',
    category: 'platform'
  },
  {
    id: 'database',
    name: 'Database',
    href: '/settings/database',
    icon: 'Database',
    description: 'Database management and backups',
    category: 'platform'
  },
  {
    id: 'api',
    name: 'API Management',
    href: '/settings/api',
    icon: 'Code',
    description: 'API keys, webhooks, and integrations',
    category: 'platform'
  },
  {
    id: 'analytics-settings',
    name: 'Analytics',
    href: '/settings/analytics',
    icon: 'BarChart2',
    description: 'Platform analytics and reporting settings',
    category: 'platform'
  }
];

/**
 * Platform Agent specific settings
 */
const PLATFORM_AGENT_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'social-connections',
    name: 'Social Connections',
    href: '/settings/social-connections',
    icon: 'Share2',
    description: 'Manage connected social media accounts for outreach',
    category: 'tools'
  },
  {
    id: 'outreach-settings',
    name: 'Outreach',
    href: '/settings/outreach',
    icon: 'Send',
    description: 'Outreach automation and template settings',
    category: 'tools'
  },
  {
    id: 'assignments-settings',
    name: 'Assignments',
    href: '/settings/assignments',
    icon: 'List',
    description: 'Assignment preferences and workload settings',
    category: 'tools'
  },
  {
    id: 'payout',
    name: 'Payouts',
    href: '/settings/payout',
    icon: 'DollarSign',
    description: 'Payment information and payout preferences',
    category: 'tools'
  }
];

/**
 * Platform Outreach Manager specific settings
 */
const PLATFORM_OUTREACH_MANAGER_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'team-management',
    name: 'Team Management',
    href: '/settings/team',
    icon: 'Users',
    description: 'Manage your outreach team',
    category: 'tools'
  },
  {
    id: 'approval-workflows',
    name: 'Approval Workflows',
    href: '/settings/approvals',
    icon: 'CheckSquare',
    description: 'Configure approval workflows',
    category: 'tools'
  },
  {
    id: 'templates',
    name: 'Templates',
    href: '/settings/templates',
    icon: 'FileText',
    description: 'Manage message templates',
    category: 'tools'
  }
];

/**
 * B2C Company specific settings
 */
const B2C_COMPANY_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'company',
    name: 'Company',
    href: '/settings/company',
    icon: 'Building',
    description: 'Company profile and business information',
    category: 'company'
  },
  {
    id: 'billing',
    name: 'Billing',
    href: '/settings/billing',
    icon: 'CreditCard',
    description: 'Billing information and payment methods',
    category: 'company'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    href: '/settings/notifications',
    icon: 'Bell',
    description: 'Email and push notification preferences',
    category: 'company'
  },
  {
    id: 'campaign-defaults',
    name: 'Campaign Defaults',
    href: '/settings/campaign-defaults',
    icon: 'Settings',
    description: 'Default campaign settings and preferences',
    category: 'company'
  },
  {
    id: 'team-members',
    name: 'Team Members',
    href: '/settings/team-members',
    icon: 'Users',
    description: 'Manage team members and roles',
    category: 'company'
  }
];

/**
 * Influencer specific settings
 */
const INFLUENCER_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'connected-accounts',
    name: 'Connected Accounts',
    href: '/settings/connected-accounts',
    icon: 'Link2',
    description: 'Connect and manage your social media accounts',
    category: 'tools'
  },
  {
    id: 'content-studio',
    name: 'Content Studio',
    href: '/settings/content-studio',
    icon: 'Award',
    description: 'Content creation and management tools',
    category: 'tools'
  },
  {
    id: 'audience-insights',
    name: 'Audience Insights',
    href: '/settings/audience-insights',
    icon: 'BarChart2',
    description: 'Audience analytics and insights',
    category: 'tools'
  },
  {
    id: 'brand-partnerships',
    name: 'Brand Partnerships',
    href: '/settings/brand-partnerships',
    icon: 'MessageSquare',
    description: 'Partnership preferences and collaboration settings',
    category: 'tools'
  },
  {
    id: 'payout-influencer',
    name: 'Payouts',
    href: '/settings/payouts',
    icon: 'DollarSign',
    description: 'Payment information and earnings',
    category: 'tools'
  }
];

/**
 * Influencer Manager specific settings
 */
const INFLUENCER_MANAGER_SETTINGS: SettingsNavigationItem[] = [
  {
    id: 'managed-accounts',
    name: 'Managed Accounts',
    href: '/settings/managed-accounts',
    icon: 'Users',
    description: 'Manage influencer accounts',
    category: 'tools'
  },
  {
    id: 'connected-accounts',
    name: 'Connected Accounts',
    href: '/settings/connected-accounts',
    icon: 'Link2',
    description: 'Connect and manage social media accounts',
    category: 'tools'
  },
  {
    id: 'brand-partnerships',
    name: 'Brand Partnerships',
    href: '/settings/brand-partnerships',
    icon: 'MessageSquare',
    description: 'Partnership preferences and collaboration settings',
    category: 'tools'
  }
];

/**
 * Get settings navigation items for a specific role
 */
export function getSettingsForRole(role: DetailedRole): SettingsNavigationItem[] {
  const settings: SettingsNavigationItem[] = [...COMMON_SETTINGS];

  switch (role) {
    case 'platform_super_admin':
    case 'platform_admin':
      settings.push(...PLATFORM_ADMIN_SETTINGS);
      break;

    case 'platform_manager':
      settings.push(
        PLATFORM_ADMIN_SETTINGS.find(s => s.id === 'users')!,
        PLATFORM_ADMIN_SETTINGS.find(s => s.id === 'analytics-settings')!
      );
      break;

    case 'platform_agent':
      settings.push(...PLATFORM_AGENT_SETTINGS);
      break;

    case 'platform_outreach_manager':
      settings.push(...PLATFORM_OUTREACH_MANAGER_SETTINGS);
      break;

    case 'platform_operations_manager':
      settings.push(
        PLATFORM_OUTREACH_MANAGER_SETTINGS.find(s => s.id === 'team-management')!,
        {
          id: 'operations-settings',
          name: 'Operations',
          href: '/settings/operations',
          icon: 'Activity',
          description: 'Operations and workflow settings',
          category: 'tools'
        }
      );
      break;

    case 'b2c_company_owner':
    case 'b2c_company_admin':
      settings.push(...B2C_COMPANY_SETTINGS);
      break;

    case 'b2c_marketing_director':
    case 'b2c_campaign_manager':
      settings.push(
        B2C_COMPANY_SETTINGS.find(s => s.id === 'notifications')!,
        B2C_COMPANY_SETTINGS.find(s => s.id === 'campaign-defaults')!
      );
      break;

    case 'b2c_campaign_executive':
    case 'b2c_social_media_manager':
    case 'b2c_content_creator':
    case 'b2c_brand_manager':
    case 'b2c_performance_analyst':
      settings.push(
        B2C_COMPANY_SETTINGS.find(s => s.id === 'notifications')!
      );
      break;

    case 'b2c_finance_manager':
      settings.push(
        B2C_COMPANY_SETTINGS.find(s => s.id === 'billing')!
      );
      break;

    case 'influencer':
      settings.push(...INFLUENCER_SETTINGS);
      break;

    case 'influencer_manager':
      settings.push(...INFLUENCER_MANAGER_SETTINGS);
      break;

    default:
      // Just common settings
      break;
  }

  // Add support settings at the end
  settings.push(...SUPPORT_SETTINGS);

  // Filter out any undefined items (in case find() didn't match)
  return settings.filter(Boolean);
}

/**
 * Group settings by category for display
 */
export function groupSettingsByCategory(
  settings: SettingsNavigationItem[]
): Record<string, SettingsNavigationItem[]> {
  const groups: Record<string, SettingsNavigationItem[]> = {
    personal: [],
    tools: [],
    platform: [],
    company: [],
    support: []
  };

  settings.forEach(item => {
    const category = item.category || 'tools';
    if (groups[category]) {
      groups[category].push(item);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) {
      delete groups[key];
    }
  });

  return groups;
}

/**
 * Category display names
 */
export const SETTINGS_CATEGORY_LABELS: Record<string, string> = {
  personal: 'Personal',
  tools: 'Tools',
  platform: 'Platform',
  company: 'Company',
  support: 'Support'
};