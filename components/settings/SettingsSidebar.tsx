// src/components/settings/SettingsSidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  User, 
  Bell, 
  Shield, 
  Cpu, 
  MessageSquare,
  Settings,
  Key,
  Monitor,
  Users,
  Briefcase,
  ChevronDown,
  Send,
  Activity,
  TrendingUp,
  DollarSign,
  Server,
  Database,
  Zap
} from 'react-feather';
import { DetailedRole } from '@/types/auth';
import { BarChart3 } from 'lucide-react';

interface SettingsSection {
  title: string;
  items: SettingsItem[];
}

interface SettingsItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  requiredPermissions?: { resource: string; action: string }[];
  allowedRoles?: DetailedRole[];
}

export default function SettingsSidebar() {
  const pathname = usePathname();
  const { getPrimaryRole } = useAuth();
  const { canAccessResource } = usePermissions();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Account']);
  
  const primaryRole = getPrimaryRole() as DetailedRole;

  const getSettingsSections = (): SettingsSection[] => {
    const sections: SettingsSection[] = [
      {
        title: 'Account',
        items: [
          {
            name: 'Profile',
            href: '/settings/profile',
            icon: <User className="w-5 h-5" />,
            description: 'Manage your personal information and preferences'
          },
          {
            name: 'Security',
            href: '/settings/security',
            icon: <Shield className="w-5 h-5" />,
            description: 'Password, 2FA, and security settings'
          },
          {
            name: 'Notifications',
            href: '/settings/notifications',
            icon: <Bell className="w-5 h-5" />,
            description: 'Configure email and push notifications',
            requiredPermissions: [{ resource: 'notification', action: 'read' }]
          }
        ]
      }
    ];

    // Platform Agent specific settings
    if (primaryRole === 'platform_agent') {
      sections.push({
        title: 'Agent Tools',
        items: [
          {
            name: 'Outreach Management',
            href: '/settings/outreach',
            icon: <Send className="w-5 h-5" />,
            description: 'Manage your outreach campaigns and responses',
            requiredPermissions: [{ resource: 'influencer_outreach', action: 'read' }]
          },
          {
            name: 'Automation Rules',
            href: '/settings/automation',
            icon: <Cpu className="w-5 h-5" />,
            description: 'Configure automation sessions and rules',
            requiredPermissions: [{ resource: 'automation_session', action: 'read' }]
          },
          {
            name: 'Message Templates',
            href: '/settings/templates',
            icon: <MessageSquare className="w-5 h-5" />,
            description: 'Create and manage outreach message templates',
            requiredPermissions: [{ resource: 'message_template', action: 'read' }]
          },
          {
            name: 'Assignment Preferences',
            href: '/settings/assignments',
            icon: <Users className="w-5 h-5" />,
            description: 'Configure your assignment preferences and limits',
            requiredPermissions: [{ resource: 'agent_assignment', action: 'read' }]
          },
          {
            name: 'Performance Dashboard',
            href: '/settings/performance',
            icon: <TrendingUp className="w-5 h-5" />,
            description: 'View your outreach performance metrics and history',
            requiredPermissions: [{ resource: 'assignment_history', action: 'stats' }]
          },
          {
            name: 'Contact Management',
            href: '/settings/contacts',
            icon: <User className="w-5 h-5" />,
            description: 'Manage influencer contacts and communication history',
            requiredPermissions: [{ resource: 'influencer_contact', action: 'read' }]
          },
          {
            name: 'Social Connections',
            href: '/settings/social-connections',
            icon: <Send className="w-5 h-5" />,
            description: 'Connect and manage social media accounts for outreach',
            requiredPermissions: []
          },
          {
            name: 'Outreach Analytics',
            href: '/settings/outreach-analytics',
            icon: <BarChart3 className="w-5 h-5" />,
            description: 'View outreach performance and engagement metrics',
            requiredPermissions: []
          },
          {
            name: 'Automation Settings',
            href: '/settings/automation',
            icon: <Settings className="w-5 h-5" />,
            description: 'Configure automation rules and preferences',
            requiredPermissions: []
          }
        ]
      });
    }

    // Platform Operations Manager specific settings
    if (primaryRole === 'platform_operations_manager') {
      sections.push({
        title: 'Operations Management',
        items: [
          {
            name: 'Agent Management',
            href: '/settings/agents',
            icon: <Cpu className="w-5 h-5" />,
            description: 'Manage outreach agents and their configurations',
            requiredPermissions: [{ resource: 'outreach_agent', action: 'read' }]
          },
          {
            name: 'Agent Assignments',
            href: '/settings/agent-assignments',
            icon: <Activity className="w-5 h-5" />,
            description: 'Oversee and manage agent assignments',
            requiredPermissions: [{ resource: 'agent_assignment', action: 'manage' }]
          },
          {
            name: 'Automation Sessions',
            href: '/settings/automation-sessions',
            icon: <Zap className="w-5 h-5" />,
            description: 'Monitor and control automation sessions',
            requiredPermissions: [{ resource: 'automation_session', action: 'manage' }]
          },
          {
            name: 'Performance Analytics',
            href: '/settings/operations-analytics',
            icon: <TrendingUp className="w-5 h-5" />,
            description: 'View operations and agent performance analytics',
            requiredPermissions: [{ resource: 'report', action: 'agent_performance' }]
          }
        ]
      });
    }

    // Platform Admin specific settings
    if (['platform_super_admin', 'platform_admin'].includes(primaryRole)) {
      sections.push(
        {
          title: 'Platform Management',
          items: [
            {
              name: 'User Management',
              href: '/settings/users',
              icon: <Users className="w-5 h-5" />,
              description: 'Manage platform users, roles, and permissions',
              requiredPermissions: [{ resource: 'user', action: 'read' }]
            },
            {
              name: 'Company Management',
              href: '/settings/companies',
              icon: <Briefcase className="w-5 h-5" />,
              description: 'Manage company accounts and settings',
              requiredPermissions: [{ resource: 'company', action: 'read' }]
            },
            {
              name: 'Role & Permission Management',
              href: '/settings/roles',
              icon: <Shield className="w-5 h-5" />,
              description: 'Configure roles and permissions',
              requiredPermissions: [{ resource: 'role', action: 'read' }]
            },
            {
              name: 'System Configuration',
              href: '/settings/system',
              icon: <Settings className="w-5 h-5" />,
              description: 'Configure platform-wide system settings',
              requiredPermissions: [{ resource: 'system_setting', action: 'read' }]
            }
          ]
        },
        {
          title: 'Technical Administration',
          items: [
            {
              name: 'API Management',
              href: '/settings/api',
              icon: <Key className="w-5 h-5" />,
              description: 'Manage API keys, rate limits, and access',
              requiredPermissions: [{ resource: 'api', action: 'admin' }]
            },
            {
              name: 'Webhook Configuration',
              href: '/settings/webhooks',
              icon: <Zap className="w-5 h-5" />,
              description: 'Configure webhook endpoints and events',
              requiredPermissions: [{ resource: 'webhook', action: 'read' }]
            },
            {
              name: 'System Monitoring',
              href: '/settings/monitoring',
              icon: <Monitor className="w-5 h-5" />,
              description: 'Monitor system health and performance',
              requiredPermissions: [{ resource: 'system', action: 'monitor' }]
            },
            {
              name: 'Data Management',
              href: '/settings/data',
              icon: <Database className="w-5 h-5" />,
              description: 'Backup, restore, and audit platform data',
              requiredPermissions: [{ resource: 'data', action: 'backup' }]
            }
          ]
        }
      );
    }

    // Financial Manager specific settings
    if (primaryRole === 'platform_financial_manager') {
      sections.push({
        title: 'Financial Management',
        items: [
          {
            name: 'Order Management',
            href: '/settings/orders',
            icon: <DollarSign className="w-5 h-5" />,
            description: 'Manage orders, payments, and refunds',
            requiredPermissions: [{ resource: 'order', action: 'read' }]
          },
          {
            name: 'Financial Reports',
            href: '/settings/financial-reports',
            icon: <TrendingUp className="w-5 h-5" />,
            description: 'View and generate financial reports',
            requiredPermissions: [{ resource: 'report', action: 'financial' }]
          }
        ]
      });
    }

    return sections;
  };

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  const isItemAccessible = (item: SettingsItem): boolean => {
    if (item.requiredPermissions) {
      return item.requiredPermissions.every(permission =>
        canAccessResource(permission.resource, permission.action)
      );
    }
    return true;
  };

  const isActive = (href: string) => pathname === href;

  const getRoleDisplayInfo = () => {
    const roleMap: Record<DetailedRole, { label: string; color: string }> = {
      // Platform roles
      platform_super_admin: { label: 'Super Admin', color: 'bg-red-600' },
      platform_admin: { label: 'Platform Admin', color: 'bg-red-500' },
      platform_manager: { label: 'Platform Manager', color: 'bg-indigo-600' },
      platform_developer: { label: 'Developer', color: 'bg-green-600' },
      platform_customer_support: { label: 'Customer Support', color: 'bg-blue-600' },
      platform_account_manager: { label: 'Account Manager', color: 'bg-purple-600' },
      platform_financial_manager: { label: 'Financial Manager', color: 'bg-yellow-600' },
      platform_content_moderator: { label: 'Content Moderator', color: 'bg-orange-600' },
      platform_data_analyst: { label: 'Data Analyst', color: 'bg-teal-600' },
      platform_operations_manager: { label: 'Operations Manager', color: 'bg-gray-600' },
      platform_agent: { label: 'Platform Agent', color: 'bg-indigo-500' },
      
      // Company roles
      b2c_company_owner: { label: 'Company Owner', color: 'bg-blue-600' },
      b2c_company_admin: { label: 'Company Admin', color: 'bg-blue-500' },
      b2c_marketing_director: { label: 'Marketing Director', color: 'bg-blue-400' },
      b2c_campaign_manager: { label: 'Campaign Manager', color: 'bg-blue-400' },
      b2c_campaign_executive: { label: 'Campaign Executive', color: 'bg-blue-300' },
      b2c_social_media_manager: { label: 'Social Media Manager', color: 'bg-blue-300' },
      b2c_content_creator: { label: 'Content Creator', color: 'bg-blue-300' },
      b2c_brand_manager: { label: 'Brand Manager', color: 'bg-blue-300' },
      b2c_performance_analyst: { label: 'Performance Analyst', color: 'bg-blue-300' },
      b2c_finance_manager: { label: 'Finance Manager', color: 'bg-blue-300' },
      b2c_account_coordinator: { label: 'Account Coordinator', color: 'bg-blue-300' },
      b2c_viewer: { label: 'Viewer', color: 'bg-blue-200' },
      
      // Influencer roles
      influencer: { label: 'Influencer', color: 'bg-purple-600' },
      influencer_manager: { label: 'Influencer Manager', color: 'bg-purple-500' },
    };
    
    return roleMap[primaryRole] || { label: 'Unknown', color: 'bg-gray-400' };
  };

  const roleInfo = getRoleDisplayInfo();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
        <div className="flex items-center mt-2">
          <div className={`w-3 h-3 rounded-full ${roleInfo.color} mr-2`}></div>
          <p className="text-sm text-gray-500">{roleInfo.label}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-auto p-4">
        {getSettingsSections().map((section) => (
          <div key={section.title} className="mb-6">
            <button
              onClick={() => toggleSection(section.title)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {section.title}
              </h3>
              <ChevronDown 
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSections.includes(section.title) ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedSections.includes(section.title) && (
              <div className="space-y-1">
                {section.items
                  .filter(isItemAccessible)
                  .map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-start p-3 rounded-lg transition-colors ${
                        isActive(item.href)
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`mt-0.5 ${
                        isActive(item.href) ? 'text-indigo-500' : 'text-gray-400'
                      }`}>
                        {item.icon}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                      </div>
                    </Link>
                  ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}