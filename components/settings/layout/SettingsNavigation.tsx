// src/components/settings/layout/SettingsNavigation.tsx
// Updated with Social Connections tab

'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import { 
  User, Settings, DollarSign, Send, Bell, Shield, CreditCard, 
  Home, BarChart, Users, Monitor, List, Server, HelpCircle,
  Database, Award, MessageSquare, Share2, Instagram, Facebook
} from 'react-feather';

interface SettingsTab {
  id: string;
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
  roles: DetailedRole[];
}

export default function SettingsNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { getPrimaryRole } = useAuth();
  
  const primaryRole = getPrimaryRole() as DetailedRole;

  // Define all possible settings tabs with role-based access
  const allTabs: SettingsTab[] = [
    // Universal tabs (all users)
    {
      id: 'profile',
      name: 'Profile',
      href: '/settings/profile',
      icon: <User className="w-5 h-5" />,
      description: 'Personal information and account details',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    {
      id: 'security',
      name: 'Security',
      href: '/settings/security',
      icon: <Shield className="w-5 h-5" />,
      description: 'Password, 2FA, and security settings',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    
    // NEW: Social Connections Tab - Platform Agents Only
    {
      id: 'social-connections',
      name: 'Social Accounts',
      href: '/settings/social-connections',
      icon: <Share2 className="w-5 h-5" />,
      description: 'Manage connected social media accounts for outreach',
      roles: ['platform_agent']
    },
    
    // Platform Admin specific tabs
    {
      id: 'system',
      name: 'System',
      href: '/settings/system',
      icon: <Server className="w-5 h-5" />,
      description: 'System configuration and maintenance',
      roles: ['platform_super_admin', 'platform_admin']
    },
    {
      id: 'users',
      name: 'User Management',
      href: '/settings/users',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage users, roles, and permissions',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager']
    },
    {
      id: 'database',
      name: 'Database',
      href: '/settings/database',
      icon: <Database className="w-5 h-5" />,
      description: 'Database management and backups',
      roles: ['platform_super_admin', 'platform_developer']
    },
    {
      id: 'analytics',
      name: 'Analytics',
      href: '/settings/analytics',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Platform analytics and reporting settings',
      roles: ['platform_super_admin', 'platform_admin', 'platform_data_analyst']
    },
    
    // Platform Agent specific tabs
    {
      id: 'outreach',
      name: 'Outreach',
      href: '/settings/outreach',
      icon: <Send className="w-5 h-5" />,
      description: 'Outreach automation and template settings',
      roles: ['platform_agent']
    },
    {
      id: 'assignments',
      name: 'Assignments',
      href: '/settings/assignments',
      icon: <List className="w-5 h-5" />,
      description: 'Campaign list assignments and preferences',
      roles: ['platform_agent']
    },
    
    // Company specific tabs
    {
      id: 'billing',
      name: 'Billing',
      href: '/settings/billing',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Billing information and payment methods',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_finance_manager']
    },
    {
      id: 'notifications',
      name: 'Notifications',
      href: '/settings/notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email and push notification preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager']
    },
    {
      id: 'campaign-defaults',
      name: 'Campaign Defaults',
      href: '/settings/campaign-defaults',
      icon: <Settings className="w-5 h-5" />,
      description: 'Default campaign settings and preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager']
    },
    {
      id: 'company-analytics',
      name: 'Analytics Settings',
      href: '/settings/company-analytics',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Analytics tracking and reporting preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_performance_analyst']
    },
    
    // Influencer specific tabs
    {
      id: 'content-studio',
      name: 'Content Studio',
      href: '/settings/content-studio',
      icon: <Award className="w-5 h-5" />,
      description: 'Content creation and management tools',
      roles: ['influencer']
    },
    {
      id: 'audience-insights',
      name: 'Audience Insights',
      href: '/settings/audience-insights',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Audience analytics and insights',
      roles: ['influencer']
    },
    {
      id: 'brand-partnerships',
      name: 'Brand Partnerships',
      href: '/settings/brand-partnerships',
      icon: <MessageSquare className="w-5 h-5" />,
      description: 'Partnership preferences and collaboration settings',
      roles: ['influencer', 'influencer_manager']
    },
    
    // Universal help tab
    {
      id: 'help',
      name: 'Help & Support',
      href: '/settings/help',
      icon: <HelpCircle className="w-5 h-5" />,
      description: 'Documentation, tutorials, and support',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    }
  ];

  // Filter tabs based on user's role
  const availableTabs = allTabs.filter(tab => tab.roles.includes(primaryRole));

  const isActive = (href: string) => pathname === href;

  const handleTabClick = (href: string) => {
    router.push(href);
  };

  // Group tabs by category for better organization
  const getTabGroups = () => {
    const groups: { [key: string]: SettingsTab[] } = {
      'Personal': [],
      'Platform Management': [],
      'Agent Tools': [],
      'Company Settings': [],
      'Influencer Tools': [],
      'Support': []
    };

    availableTabs.forEach(tab => {
      if (['profile', 'security'].includes(tab.id)) {
        groups['Personal'].push(tab);
      } else if (['system', 'users', 'database', 'analytics'].includes(tab.id)) {
        groups['Platform Management'].push(tab);
      } else if (['social-connections', 'outreach', 'assignments'].includes(tab.id)) {
        groups['Agent Tools'].push(tab);
      } else if (['billing', 'notifications', 'campaign-defaults', 'company-analytics'].includes(tab.id)) {
        groups['Company Settings'].push(tab);
      } else if (['content-studio', 'audience-insights', 'brand-partnerships'].includes(tab.id)) {
        groups['Influencer Tools'].push(tab);
      } else if (['help'].includes(tab.id)) {
        groups['Support'].push(tab);
      }
    });

    return groups;
  };

  const tabGroups = getTabGroups();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and system configuration
        </p>
      </div>

      <div className="p-6">
        {/* Organized tabs by groups */}
        <div className="space-y-6">
          {Object.entries(tabGroups).map(([groupName, tabs]) => {
            if (tabs.length === 0) return null;
            
            return (
              <div key={groupName}>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {groupName}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabClick(tab.href)}
                      className={`flex items-start p-4 rounded-lg text-left transition-all hover:shadow-md ${
                        isActive(tab.href)
                          ? 'bg-indigo-50 border-2 border-indigo-200 shadow-md'
                          : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`flex-shrink-0 mr-3 mt-1 ${
                        isActive(tab.href) ? 'text-indigo-600' : 'text-gray-400'
                      }`}>
                        {tab.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isActive(tab.href) ? 'text-indigo-900' : 'text-gray-900'
                        }`}>
                          {tab.name}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isActive(tab.href) ? 'text-indigo-700' : 'text-gray-500'
                        }`}>
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}