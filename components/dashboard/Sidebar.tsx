// =============================================================================
// src/components/dashboard/Sidebar.tsx
// =============================================================================
// Updated Sidebar with collapsible Settings section
// Industry standard: Linear, Discord, Notion pattern
// =============================================================================

'use client';

import { useState, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { usePermissions } from '@/hooks/usePermissions';
import { DetailedRole } from '@/types/auth';
import {
  Home,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  DollarSign,
  Award,
  FileText,
  Bell,
  Compass,
  List,
  MessageSquare,
  Shield,
  Send,
  Activity,
  TrendingUp,
  Server,
  CreditCard,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Globe,
  Lock,
  Database,
  Zap,
  Target,
  Bot,
  Tag,
  User,
  HelpCircle,
  Share2,
  Link2,
  Building,
  Code,
  CheckSquare,
} from 'lucide-react';

// Import settings configuration
import { getSettingsForRole, groupSettingsByCategory, SETTINGS_CATEGORY_LABELS } from '@/config/navigation/settings';
import { NavigationConfig, NavigationSection, NavigationItem, isNavigationSection, getNavigationColors } from '@/config/navigation/types';

// =============================================================================
// ICON MAP
// =============================================================================

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  DollarSign,
  Award,
  FileText,
  Bell,
  Compass,
  List,
  MessageSquare,
  Shield,
  Send,
  Activity,
  TrendingUp,
  Server,
  CreditCard,
  UserCheck,
  Globe,
  Lock,
  Database,
  Zap,
  Target,
  Bot,
  Tag,
  User,
  HelpCircle,
  Share2,
  Link2,
  Building,
  Code,
  CheckSquare,
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function Sidebar() {
  const pathname = usePathname();
  const { getPrimaryRole, getUserType } = useAuth();
  const { isSidebarCollapsed } = useSidebar();
  const { canAccessResource } = usePermissions();

  const primaryRole = getPrimaryRole() as DetailedRole;
  const userType = getUserType();

  // State for collapsible sections - ALL CLOSED BY DEFAULT
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    users: false,
    operations: false,
    campaigns: false,
    financial: false,
    analytics: false,
    system: false,
    work: false,
    performance: false,
    discovery: false,
    insights: false,
    mywork: false,
    earnings: false,
    management: false,
    outreach: false,
    settings: false, // Settings section - closed by default
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Auto-expand settings if on a settings page
  const isOnSettingsPage = pathname?.startsWith('/settings');
  
  // Get settings items for current role
  const settingsItems = useMemo(() => {
    if (!primaryRole) return [];
    return getSettingsForRole(primaryRole);
  }, [primaryRole]);

  // Group settings by category
  const groupedSettings = useMemo(() => {
    return groupSettingsByCategory(settingsItems);
  }, [settingsItems]);

  // ==========================================================================
  // NAVIGATION CONFIG BY ROLE
  // ==========================================================================

  const getNavigationSections = (): NavigationConfig[] => {
    switch (primaryRole) {
      case 'platform_super_admin':
      case 'platform_admin':
        return [
          {
            id: 'users',
            title: 'Users & Clients',
            icon: 'Users',
            color: 'bg-blue-500',
            items: [
              { id: 'users-list', name: 'Users', href: '/users', icon: 'Users', requiredPermissions: [{ resource: 'user', action: 'read' }] },
              { id: 'b2c-clients', name: 'B2C Clients', href: '/b2c-clients', icon: 'UserCheck' },
              { id: 'b2b-clients', name: 'B2B Clients', href: '/b2b-clients', icon: 'Globe' },
              { id: 'influencers', name: 'Influencers', href: '/influencers', icon: 'Target' }
            ]
          },
          {
            id: 'operations',
            title: 'Operations',
            icon: 'Send',
            color: 'bg-purple-500',
            items: [
              { id: 'outreach-agents', name: 'Outreach Agents', href: '/outreach-agents', icon: 'Bot', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
              { id: 'outreach-manager', name: 'Outreach Manager', href: '/outreach-manager', icon: 'Activity' },
              { id: 'agent-performance', name: 'Agent Performance', href: '/agent-performance', icon: 'TrendingUp' },
              { id: 'templates', name: 'Message Templates', href: '/templates', icon: 'MessageSquare' }
            ]
          },
          {
            id: 'campaigns',
            title: 'Campaigns',
            icon: 'Award',
            color: 'bg-indigo-500',
            items: [
              { id: 'campaigns-list', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'campaign-lists', name: 'Campaign Lists', href: '/campaign-lists', icon: 'FileText' },
              { id: 'outreach-tracking', name: 'Outreach Tracking', href: '/outreach-tracking', icon: 'Zap' }
            ]
          },
          {
            id: 'financial',
            title: 'Financial',
            icon: 'DollarSign',
            color: 'bg-green-500',
            items: [
              { id: 'features', name: 'Features', href: '/billing/features', icon: 'Tag' },
              { id: 'plans', name: 'Plans & Pricing', href: '/billing/plans', icon: 'CreditCard' }, 
              { id: 'subscriptions', name: 'Subscriptions', href: '/billing/subscriptions', icon: 'CreditCard' },
              { id: 'transactions', name: 'Transactions', href: '/transactions', icon: 'DollarSign' },
              { id: 'revenue', name: 'Revenue Analytics', href: '/revenue-analytics', icon: 'TrendingUp' }
            ]
          },
          {
            id: 'analytics',
            title: 'Analytics & Insights',
            icon: 'BarChart2',
            color: 'bg-orange-500',
            items: [
              { id: 'analytics-dashboard', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
              { id: 'reports', name: 'Performance Reports', href: '/reports', icon: 'FileText' },
              { id: 'system-health', name: 'System Health', href: '/system-health', icon: 'Activity' }
            ]
          },
          {
            id: 'system',
            title: 'System Administration',
            icon: 'Server',
            color: 'bg-red-500',
            items: [
              { id: 'system-admin', name: 'System Administration', href: '/system', icon: 'Server', requiredPermissions: [{ resource: 'system', action: 'monitor' }] },
              { id: 'database-mgmt', name: 'Database Management', href: '/database', icon: 'Database' },
              { id: 'api-mgmt', name: 'API Management', href: '/api-management', icon: 'Shield' },
              { id: 'audit-logs', name: 'Audit Logs', href: '/audit-logs', icon: 'Lock' }
            ]
          }
        ];
      
      case 'platform_agent':
        return [
          { id: 'assigned-lists', name: 'Assigned Lists', href: '/assigned-lists', icon: 'List', requiredPermissions: [{ resource: 'assigned_influencer', action: 'read' }] },
          { id: 'messages', name: 'Messages', href: '/messages', icon: 'MessageSquare', requiredPermissions: [{ resource: 'agent_social_connection', action: 'read' }] },
          { id: 'outreach', name: 'Outreach', href: '/outreach', icon: 'Send', requiredPermissions: [{ resource: 'influencer_outreach', action: 'read' }] },
          { id: 'contacts', name: 'Contacts', href: '/contacts', icon: 'Users', requiredPermissions: [{ resource: 'influencer_contact', action: 'read' }] },
          { id: 'performance', name: 'Performance', href: '/performance', icon: 'TrendingUp', requiredPermissions: [{ resource: 'assignment_history', action: 'stats' }] },
          { id: 'automation', name: 'Automation', href: '/automation', icon: 'Bot', requiredPermissions: [{ resource: 'automation_session', action: 'read' }] }
        ];
      
      case 'platform_operations_manager':
        return [
          {
            id: 'operations',
            title: 'Operations',
            icon: 'Activity',
            color: 'bg-purple-500',
            items: [
              { id: 'operations-dashboard', name: 'Operations', href: '/operations', icon: 'Activity', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
              { id: 'outreach-agents', name: 'Outreach Agents', href: '/outreach-agents', icon: 'Bot', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
              { id: 'automation', name: 'Automation', href: '/automation', icon: 'Zap', requiredPermissions: [{ resource: 'automation_session', action: 'read' }] },
              { id: 'performance', name: 'Performance', href: '/performance', icon: 'TrendingUp', requiredPermissions: [{ resource: 'report', action: 'agent_performance' }] }
            ]
          }
        ];
      
      case 'platform_outreach_manager':
        return [
          {
            id: 'outreach',
            title: 'Outreach Management',
            icon: 'Send',
            color: 'bg-purple-500',
            items: [
              { id: 'outreach-agents', name: 'Outreach Agents', href: '/outreach-agents', icon: 'Users', requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }] },
              { id: 'assignments', name: 'Assignments', href: '/assignments', icon: 'List', requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }] },
              { id: 'automation', name: 'Automation', href: '/automation', icon: 'Zap', requiredPermissions: [{ resource: 'automation_session', action: 'read' }] },
              { id: 'templates', name: 'Templates', href: '/templates', icon: 'FileText', requiredPermissions: [{ resource: 'message_template', action: 'read' }] }
            ]
          },
          {
            id: 'analytics',
            title: 'Analytics & Insights',
            icon: 'BarChart2',
            color: 'bg-orange-500',
            items: [
              { id: 'performance', name: 'Performance', href: '/performance', icon: 'TrendingUp', requiredPermissions: [{ resource: 'report', action: 'agent_performance' }] },
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] }
            ]
          }
        ];

      case 'platform_manager':
        return [
          {
            id: 'management',
            title: 'Management',
            icon: 'Users',
            color: 'bg-blue-500',
            items: [
              { id: 'teams', name: 'Teams', href: '/teams', icon: 'Users', requiredPermissions: [{ resource: 'user', action: 'read' }] },
              { id: 'campaigns', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] },
              { id: 'reports', name: 'Reports', href: '/reports', icon: 'FileText', requiredPermissions: [{ resource: 'report', action: 'campaign_performance' }] }
            ]
          }
        ];
      
      case 'b2c_company_owner':
      case 'b2c_company_admin':
      case 'b2c_marketing_director':
        return [
          {
            id: 'discovery',
            title: 'Discovery',
            icon: 'Compass',
            color: 'bg-blue-500',
            items: [
              { id: 'discover', name: 'Discover', href: '/discover', icon: 'Compass', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
              { id: 'campaigns', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'influencers', name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] }
            ]
          },
          {
            id: 'insights',
            title: 'Insights',
            icon: 'BarChart2',
            color: 'bg-purple-500',
            items: [
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] }
            ]
          }
        ];
      
      case 'b2c_campaign_manager':
      case 'b2c_campaign_executive':
        return [
          {
            id: 'campaigns',
            title: 'Campaigns',
            icon: 'Award',
            color: 'bg-indigo-500',
            items: [
              { id: 'campaigns', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'influencers', name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] }
            ]
          }
        ];
      
      case 'influencer':
        return [
          {
            id: 'mywork',
            title: 'My Work',
            icon: 'Award',
            color: 'bg-purple-500',
            items: [
              { id: 'campaigns', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'profile', name: 'Profile', href: '/profile', icon: 'Users', requiredPermissions: [{ resource: 'social_account', action: 'read' }] }
            ]
          },
          {
            id: 'earnings',
            title: 'Earnings',
            icon: 'DollarSign',
            color: 'bg-green-500',
            items: [
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'profile_analytics', action: 'read' }] },
              { id: 'payments', name: 'Payments', href: '/payments', icon: 'DollarSign', requiredPermissions: [{ resource: 'order', action: 'read' }] }
            ]
          }
        ];
      
      case 'influencer_manager':
        return [
          {
            id: 'management',
            title: 'Management',
            icon: 'Users',
            color: 'bg-blue-500',
            items: [
              { id: 'influencers', name: 'Influencers', href: '/influencers', icon: 'Users', requiredPermissions: [{ resource: 'influencer', action: 'read' }] },
              { id: 'campaigns', name: 'Campaigns', href: '/campaigns', icon: 'Award', requiredPermissions: [{ resource: 'campaign', action: 'read' }] },
              { id: 'analytics', name: 'Analytics', href: '/analytics', icon: 'BarChart2', requiredPermissions: [{ resource: 'analytics', action: 'dashboard' }] }
            ]
          }
        ];
      
      default:
        return [];
    }
  };

  // ==========================================================================
  // PERMISSION FILTERING
  // ==========================================================================

  const filterNavigation = (items: NavigationConfig[]): NavigationConfig[] => {
    return items.filter(item => {
      if (isNavigationSection(item)) {
        const filteredItems = item.items.filter(subItem => {
          if (subItem.requiredPermissions) {
            return subItem.requiredPermissions.every(permission =>
              canAccessResource(permission.resource, permission.action)
            );
          }
          return true;
        });
        return filteredItems.length > 0;
      } else {
        if (item.requiredPermissions) {
          return item.requiredPermissions.every(permission =>
            canAccessResource(permission.resource, permission.action)
          );
        }
        return true;
      }
    }).map(item => {
      if (isNavigationSection(item)) {
        return {
          ...item,
          items: item.items.filter(subItem => {
            if (subItem.requiredPermissions) {
              return subItem.requiredPermissions.every(permission =>
                canAccessResource(permission.resource, permission.action)
              );
            }
            return true;
          })
        };
      }
      return item;
    });
  };

  const navigationItems = filterNavigation(getNavigationSections());

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const colors = getNavigationColors(userType || 'platform');

  // ==========================================================================
  // RENDER
  // ==========================================================================

  if (!primaryRole || !userType || isSidebarCollapsed) {
    return null;
  }

  return (
    <aside className="fixed top-16 left-0 w-72 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 flex flex-col">
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard - Always visible at top */}
        <Link
          href="/dashboard"
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/dashboard')
              ? `${colors.activeBg} ${colors.activeText}`
              : `text-gray-700 ${colors.hoverBg}`
          }`}
        >
          <Home className={`w-4 h-4 ${isActive('/dashboard') ? colors.activeIcon : 'text-gray-500'}`} />
          <span className="ml-3">Dashboard</span>
        </Link>

        {/* Divider */}
        <div className="py-2">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Main Navigation Sections */}
        {navigationItems.map((item) => {
          if (!isNavigationSection(item)) {
            // Flat navigation item
            const ItemIcon = iconMap[item.icon] || Home;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? `${colors.activeBg} ${colors.activeText}`
                    : `text-gray-700 ${colors.hoverBg}`
                }`}
              >
                <ItemIcon className={`w-4 h-4 ${isActive(item.href) ? colors.activeIcon : 'text-gray-500'}`} />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          }
          
          // Collapsible section
          const section = item as NavigationSection;
          const SectionIcon = iconMap[section.icon] || Home;
          
          return (
            <div key={section.id} className="space-y-0.5 mt-2">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <SectionIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{section.title}</span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="ml-6 space-y-0.5 pl-2">
                  {section.items.map((subItem) => {
                    const SubItemIcon = iconMap[subItem.icon] || Home;
                    
                    return (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isActive(subItem.href)
                            ? `${colors.activeBg} ${colors.activeText} font-medium`
                            : `text-gray-600 ${colors.hoverBg}`
                        }`}
                      >
                        <SubItemIcon className={`w-4 h-4 ${
                          isActive(subItem.href)
                            ? colors.activeIcon
                            : 'text-gray-400 group-hover:text-gray-600'
                        }`} />
                        <span>{subItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Divider before Settings */}
        <div className="py-2">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* ================================================================== */}
        {/* SETTINGS SECTION - COLLAPSIBLE WITH SUB-ITEMS */}
        {/* ================================================================== */}
        <div className="space-y-0.5">
          <button
            onClick={() => toggleSection('settings')}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-colors ${
              isOnSettingsPage
                ? `${colors.activeBg} ${colors.activeText} font-medium`
                : `text-gray-700 ${colors.hoverBg}`
            }`}
          >
            <div className="flex items-center gap-3">
              <Settings className={`w-4 h-4 ${isOnSettingsPage ? colors.activeIcon : 'text-gray-500'}`} />
              <span className="text-sm font-medium">Settings</span>
            </div>
            {expandedSections.settings || isOnSettingsPage ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {/* Settings Sub-Items */}
          {(expandedSections.settings || isOnSettingsPage) && (
            <div className="ml-6 space-y-0.5 pl-2">
              {/* Render settings grouped by category */}
              {Object.entries(groupedSettings).map(([category, items]) => (
                <div key={category} className="mt-2 first:mt-0">
                  {/* Category label (only if more than one category) */}
                  {Object.keys(groupedSettings).length > 1 && (
                    <p className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      {SETTINGS_CATEGORY_LABELS[category] || category}
                    </p>
                  )}
                  
                  {items.map((settingsItem) => {
                    const SettingsIcon = iconMap[settingsItem.icon] || Settings;
                    const isSettingsActive = isActive(settingsItem.href);
                    
                    return (
                      <Link
                        key={settingsItem.id}
                        href={settingsItem.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          isSettingsActive
                            ? `${colors.activeBg} ${colors.activeText} font-medium`
                            : `text-gray-600 ${colors.hoverBg}`
                        }`}
                      >
                        <SettingsIcon className={`w-4 h-4 ${
                          isSettingsActive ? colors.activeIcon : 'text-gray-400'
                        }`} />
                        <span>{settingsItem.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom section - Notifications */}
      <div className="border-t border-gray-200 p-3">
        <Link
          href="/notifications"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-gray-500" />
            <span>Notifications</span>
          </div>
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-semibold rounded-full">3</span>
        </Link>
      </div>
    </aside>
  );
}