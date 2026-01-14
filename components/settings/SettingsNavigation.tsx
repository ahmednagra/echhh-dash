// src/components/settings/SettingsNavigation.tsx - NEW COMPONENT
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import { 
  User, 
  Settings, 
  DollarSign, 
  Send, 
  Bell, 
  Shield, 
  CreditCard, 
  Home, 
  BarChart, 
  Users, 
  Monitor,
  List,
  Server,
  HelpCircle,
  Database
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

  // Define all possible settings tabs
  const allTabs: SettingsTab[] = [
    {
      id: 'profile',
      name: 'Profile',
      href: '/settings/profile',
      icon: <User className="w-5 h-5" />,
      description: 'Personal information and account details',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer', 'platform_customer_support', 'platform_account_manager', 'platform_financial_manager', 'platform_content_moderator', 'platform_data_analyst', 'platform_operations_manager', 'platform_agent', 'b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager', 'b2c_campaign_executive', 'b2c_social_media_manager', 'b2c_content_creator', 'b2c_brand_manager', 'b2c_performance_analyst', 'b2c_finance_manager', 'b2c_account_coordinator', 'b2c_viewer', 'influencer', 'influencer_manager']
    },
    
    // Platform Agent specific tabs
    {
      id: 'outreach',
      name: 'Outreach',
      href: '/settings/outreach',
      icon: <Send className="w-5 h-5" />,
      description: 'Outreach management and automation settings',
      roles: ['platform_agent']
    },
    {
      id: 'assignments',
      name: 'Assignments',
      href: '/settings/assignments',
      icon: <List className="w-5 h-5" />,
      description: 'Assignment preferences and workload settings',
      roles: ['platform_agent']
    },
    {
      id: 'payout',
      name: 'Payouts',
      href: '/settings/payout',
      icon: <DollarSign className="w-5 h-5" />,
      description: 'Payment information and payout preferences',
      roles: ['platform_agent']
    },
    {
      id: 'social-connections',
      name: 'Social Connections',
      href: '/settings/social-connections',
      icon: <Send className="w-5 h-5" />,
      description: 'Manage connected social media accounts for outreach',
      roles: ['platform_agent']
    },
    
    // Platform Admin tabs
    {
      id: 'users',
      name: 'User Management',
      href: '/settings/users',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage platform users and permissions',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager']
    },
    {
      id: 'agents',
      name: 'Agent Management',
      href: '/settings/agents',
      icon: <Settings className="w-5 h-5" />,
      description: 'Manage outreach agents and assignments',
      roles: ['platform_super_admin', 'platform_admin', 'platform_operations_manager']
    },
    {
      id: 'monitoring',
      name: 'System Monitoring',
      href: '/settings/monitoring',
      icon: <Monitor className="w-5 h-5" />,
      description: 'System health and performance monitoring',
      roles: ['platform_super_admin', 'platform_admin', 'platform_manager', 'platform_developer']
    },
    {
      id: 'api',
      name: 'API Management',
      href: '/settings/api',
      icon: <Database className="w-5 h-5" />,
      description: 'API keys, webhooks, and integrations',
      roles: ['platform_super_admin', 'platform_admin', 'platform_developer']
    },
    {
      id: 'orders',
      name: 'Order Management',
      href: '/settings/orders',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Financial transactions and order processing',
      roles: ['platform_super_admin', 'platform_admin', 'platform_financial_manager']
    },
    
    // Company specific tabs
    {
      id: 'company',
      name: 'Company Settings',
      href: '/settings/company',
      icon: <Home className="w-5 h-5" />,
      description: 'Company profile and business information',
      roles: ['b2c_company_owner', 'b2c_company_admin']
    },
    {
      id: 'campaigns',
      name: 'Campaign Settings',
      href: '/settings/campaigns',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Default campaign settings and preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_campaign_manager']
    },
    {
      id: 'billing',
      name: 'Billing & Plans',
      href: '/settings/billing',
      icon: <CreditCard className="w-5 h-5" />,
      description: 'Subscription plans and billing information',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_finance_manager']
    },
    {
      id: 'analytics',
      name: 'Analytics Settings',
      href: '/settings/analytics',
      icon: <BarChart className="w-5 h-5" />,
      description: 'Analytics tracking and reporting preferences',
      roles: ['b2c_company_owner', 'b2c_company_admin', 'b2c_marketing_director', 'b2c_performance_analyst']
    },
    
    // Common tabs
    {
      id: 'notifications',
      name: 'Notifications',
      href: '/settings/notifications',
      icon: <Bell className="w-5 h-5" />,
      description: 'Email and push notification preferences',
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
      'Agent Tools': [], // New category for platform agent tools
      'Platform Management': [],
      'Company Management': [],
      'System & Security': []
    };

    availableTabs.forEach(tab => {
      switch (tab.id) {
        case 'profile':
          groups['Personal'].push(tab);
          break;
        case 'outreach':
        case 'assignments':
        case 'payout':
        case 'social-connections':
          groups['Agent Tools'].push(tab); // Group agent-specific features
          break;
        case 'users':
        case 'agents':
        case 'monitoring':
        case 'api':
        case 'orders':
          groups['Platform Management'].push(tab);
          break;
        case 'company':
        case 'campaigns':
        case 'billing':
        case 'analytics':
          groups['Company Management'].push(tab);
          break;
        case 'notifications':
        case 'security':
        case 'help':
          groups['System & Security'].push(tab);
          break;
      }
    });

    // Filter out empty groups
    return Object.entries(groups).filter(([_, tabs]) => tabs.length > 0);
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

      {/* Scrollable horizontal tabs for mobile, grouped sections for desktop */}
      <div className="p-6">
        {/* Mobile: Horizontal scroll */}
        <div className="lg:hidden">
          <div className="flex space-x-1 overflow-x-auto pb-2">
            {availableTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.href)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive(tab.href)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="ml-2">{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop: Grouped grid */}
        <div className="hidden lg:block">
          {tabGroups.map(([groupName, tabs]) => (
            <div key={groupName} className="mb-8 last:mb-0">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
                {groupName}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.href)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      isActive(tab.href)
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className={`${
                        isActive(tab.href) ? 'text-indigo-600' : 'text-gray-500'
                      }`}>
                        {tab.icon}
                      </span>
                      <h4 className={`ml-3 font-medium ${
                        isActive(tab.href) ? 'text-indigo-900' : 'text-gray-900'
                      }`}>
                        {tab.name}
                      </h4>
                    </div>
                    <p className={`text-sm ${
                      isActive(tab.href) ? 'text-indigo-700' : 'text-gray-600'
                    }`}>
                      {tab.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}