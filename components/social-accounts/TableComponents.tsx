// src/components/social-accounts/TableComponents.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { MoreVertical, Eye, Users, Trash2, DollarSign, ExternalLink } from 'react-feather';
import { SocialAccount } from '@/services/social-accounts/social-accounts.service';
import { ColumnDefinition } from '@/components/ui/table/ColumnVisibility';
import { formatNumber } from '@/utils/format';
import { Currency } from './types';

// Currency options for display
const CURRENCY_OPTIONS: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', popular: true },
  { code: 'EUR', symbol: '€', name: 'Euro', popular: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', popular: true },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', popular: true },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', popular: true },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', popular: true },
];

// Position calculation utility
export const calculatePopupPosition = (
  element: HTMLElement,
  popupWidth: number,
  popupHeight: number
): { x: number; y: number } => {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Find the table container to ensure popup stays within bounds
  const tableContainer = element.closest('.overflow-x-auto') || document.body;
  const containerRect = tableContainer.getBoundingClientRect();
  
  // Start with default positioning
  let x = rect.left;
  let y = rect.bottom + 5;
  
  // Ensure popup stays within container horizontally
  const maxX = Math.min(viewportWidth, containerRect.right) - popupWidth - 20;
  const minX = Math.max(0, containerRect.left + 20);
  
  if (x > maxX) {
    x = maxX;
  }
  if (x < minX) {
    x = minX;
  }
  
  // Adjust vertical position if popup would go off-screen
  if (y + popupHeight > viewportHeight - 20) {
    y = rect.top - popupHeight - 5;
  }
  
  // Ensure popup doesn't go above viewport
  if (y < 20) {
    y = rect.bottom + 5;
  }
  
  return { x, y };
};

// Helper functions
export const truncateName = (name: string, maxLength: number = 15): string => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

export const getAdditionalMetric = (account: SocialAccount, key: string, defaultValue: any = null) => {
  const additionalMetrics = account?.additional_metrics;
  if (!additionalMetrics || typeof additionalMetrics !== 'object') {
    return defaultValue;
  }
  
  const metricsObj = additionalMetrics as Record<string, any>;
  return metricsObj[key] ?? defaultValue;
};

export const getProfilePicture = (account: SocialAccount): string => {
  if (account.profile_pic_url_hd) return account.profile_pic_url_hd;
  if (account.profile_pic_url) return account.profile_pic_url;
  if (getAdditionalMetric(account, 'profileImage')) return getAdditionalMetric(account, 'profileImage');
  return `https://i.pravatar.cc/150?u=${account.id}`;
};

export const getEngagementRate = (account: SocialAccount): number | null => {
  const rate = getAdditionalMetric(account, 'engagementRate') || getAdditionalMetric(account, 'engagement_rate');
  if (typeof rate === 'number') return rate * 100;
  return null;
};

export const handleNameClick = (account: SocialAccount) => {
  const accountUrl = account.account_url || getAdditionalMetric(account, 'url');
  if (accountUrl) {
    window.open(accountUrl, '_blank', 'noopener,noreferrer');
  }
};

// Budget Display Component
export const BudgetDisplay = ({ 
  account, 
  onClick 
}: { 
  account: SocialAccount; 
  onClick: (e: React.MouseEvent) => void 
}) => {
  const currentCurrency = (account as any).currency || 'USD';
  const price = (account as any).collaboration_price || 0;
  
  // Get correct currency symbol
  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.code === currentCurrency);
  const symbol = selectedCurrency?.symbol || '$';
  
  return (
    <button
      onClick={onClick}
      className="w-28 flex items-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-1 py-1 rounded transition-colors"
      title="Click to edit budget"
    >
      <span className="mr-0.5">{symbol}</span>
      <span>{price}</span>
    </button>
  );
};

// Contact Display Component  
export const ContactDisplay = ({ 
  account, 
  onClick 
}: { 
  account: SocialAccount; 
  onClick: (e: React.MouseEvent) => void 
}) => {
  return (
    <button
      onClick={onClick}
      className="text-teal-600 hover:text-teal-700 text-sm flex items-center hover:bg-teal-50 px-1 py-1 rounded transition-colors"
      title="Click to add contact"
    >
      <Users className="w-4 h-4 mr-1" />
      Add
    </button>
  );
};

// ActionsDropdown Component
export const ActionsDropdown: React.FC<{
  account: SocialAccount;
  onViewProfile: (account: SocialAccount) => void;
  onViewContacts: (account: SocialAccount) => void;
  onDeleteAccount: (accountId: string, influencerId: string, username: string) => void;
  deleteLoading: Record<string, boolean>;
}> = ({ account, onViewProfile, onViewContacts, onDeleteAccount, deleteLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'down' | 'up'>('down');
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const button = buttonRef.current;
      const rect = button.getBoundingClientRect();
      const dropdownHeight = 160;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        setDropdownPosition('up');
      } else {
        setDropdownPosition('down');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const actions = [
    {
      label: 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => {
        onViewProfile(account);
        setIsOpen(false);
      },
      disabled: false
    },
    {
      label: 'View Contacts',
      icon: <Users className="w-4 h-4" />,
      onClick: () => {
        onViewContacts(account);
        setIsOpen(false);
      },
      disabled: false
    },
    {
      label: 'Delete Account',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        onDeleteAccount(account.id, account.influencer_id || account.id, account.account_handle);
        setIsOpen(false);
      },
      disabled: deleteLoading[account.id]
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div 
          className={`absolute ${dropdownPosition === 'up' ?
            'bottom-full mb-1' : 'top-full mt-1'} right-0 w-44 bg-white rounded-md shadow-lg border border-gray-200 z-20`}
        >
          <div className="py-1">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors flex items-center ${
                  action.disabled ? 'opacity-50 cursor-not-allowed' : 'text-gray-700'
                }`}
              >
                <span className="mr-3 text-gray-400">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Column definitions - Fixed to match expected signature
export const getSocialAccountColumnDefinitions = (callbacks?: {
  onBudgetClick?: (account: SocialAccount, e: React.MouseEvent) => void;
  onContactClick?: (account: SocialAccount, e: React.MouseEvent) => void;
}): ColumnDefinition<SocialAccount>[] => [
  {
    key: 'name',
    label: 'Name',
    width: 'w-32',
    defaultVisible: true,
    getValue: (account) => account.full_name || account.account_handle || '',
    render: (value: any, account: SocialAccount) => (
      <div className="flex items-center min-w-0">
        <div className="flex-shrink-0 relative">
          <img
            className="rounded-full object-cover h-8 w-8 border-2 border-gray-200"
            src={getProfilePicture(account)}
            alt={account.full_name || account.account_handle}
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://i.pravatar.cc/150?u=${account.id}`;
            }}
          />
          {account.is_verified && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          {account.platform?.logo_url && (
            <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-200 shadow-lg flex items-center justify-center ring-1 ring-gray-100">
              <img
                className="w-4 h-4 object-contain"
                src={account.platform.logo_url}
                alt={account.platform.name}
                onError={(e) => {
                  const container = (e.target as HTMLImageElement).parentElement;
                  if (container) {
                    container.innerHTML = '<div class="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>';
                  }
                }}
              />
            </div>
          )}
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <div className="text-sm font-medium text-gray-900 flex items-center min-w-0">
            <span 
              className="truncate cursor-pointer hover:text-purple-600 transition-colors"
              title={account.full_name}
              onClick={() => handleNameClick(account)}
            >
              {truncateName(account.full_name || '', 15)}
            </span>
            {account.is_business && (
              <span className="ml-2 text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                Business
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center min-w-0">
            <span className="truncate mr-2">@{account.account_handle}</span>
            {account.platform?.name && (
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full flex-shrink-0">
                {account.platform.name}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  },

  {
    key: 'followers',
    label: 'Followers',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => account.followers_count ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'engagement_rate',
    label: 'Eng Rate',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => getEngagementRate(account),
    render: (value: any) => {
      if (typeof value !== 'number') return 'N/A';
      const colorClass = value >= 3 ? 'text-green-600' : value >= 1 ? 'text-yellow-600' : 'text-red-600';
      return (
        <span className={`font-medium ${colorClass}`}>
          {value.toFixed(2)}%
        </span>
      );
    }
  },

  // Budget Column - Fixed to use standard signature
  {
    key: 'budget',
    label: 'Budget',
    width: 'w-24',
    defaultVisible: true,
    getValue: (account) => (account as any).collaboration_price ?? null,
    render: (value: any, account: SocialAccount) => {
      const handleClick = (e: React.MouseEvent) => {
        if (callbacks?.onBudgetClick) {
          callbacks.onBudgetClick(account, e);
        }
      };
      return <BudgetDisplay account={account} onClick={handleClick} />;
    }
  },

  // Contact Column - Fixed to use standard signature
  {
    key: 'contact',
    label: 'Contacts',
    width: 'w-24',
    defaultVisible: true,
    getValue: (account) => (account as any).phone ?? null,
    render: (value: any, account: SocialAccount) => {
      const handleClick = (e: React.MouseEvent) => {
        if (callbacks?.onContactClick) {
          callbacks.onContactClick(account, e);
        }
      };
      return <ContactDisplay account={account} onClick={handleClick} />;
    }
  },

  {
    key: 'average_likes',
    label: 'Avg Likes',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'average_likes') ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'reel_views',
    label: 'Reel Views',
    width: 'w-24',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'reel_views') ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'location',
    label: 'Location',
    width: 'w-24',
    defaultVisible: true,
    getValue: (account) => {
      const city = getAdditionalMetric(account, 'city');
      const country = getAdditionalMetric(account, 'country');
      const location = getAdditionalMetric(account, 'location');
      
      if (location) return location;
      if (city && country) return `${city}, ${country}`;
      if (city) return city;
      if (country) return country;
      return 'N/A';
    },
    render: (value: any) => (
      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-800 rounded-full">
        {value}
      </span>
    )
  },

  {
    key: 'gender',
    label: 'Gender',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'gender') ?? null,
    render: (value: any) => {
      if (!value) return 'N/A';
      const displayValue = String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
      const colorClass = value?.toLowerCase() === 'female' ? 'bg-pink-100 text-pink-800' : 
                        value?.toLowerCase() === 'male' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800';
      return (
        <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
          {displayValue}
        </span>
      );
    }
  },

  {
    key: 'language',
    label: 'Language',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'language') ?? null,
    render: (value: any) => (
      <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full">
        {value ? String(value).toUpperCase() : 'N/A'}
      </span>
    )
  },

  {
    key: 'age_group',
    label: 'Age Group',
    width: 'w-20',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'age_group') ?? null,
    render: (value: any) => (
      <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
        {value || 'N/A'}
      </span>
    )
  },

  {
    key: 'account_type',
    label: 'Account Type',
    width: 'w-24',
    defaultVisible: true,
    getValue: (account) => getAdditionalMetric(account, 'platform_account_type') ?? null,
    render: (value: any) => {
      if (!value) return 'N/A';
      const displayValue = String(value).replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      const colorClass = value === 'BUSINESS' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
      return (
        <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
          {displayValue}
        </span>
      );
    }
  },

  // Additional columns (hidden by default)
  {
    key: 'following',
    label: 'Following',
    width: 'w-20',
    defaultVisible: false,
    getValue: (account) => account.following_count ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'media_count',
    label: 'Posts',
    width: 'w-20',
    defaultVisible: false,
    getValue: (account) => account.media_count ?? getAdditionalMetric(account, 'content_count') ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'biography',
    label: 'Bio',
    width: 'w-48',
    defaultVisible: false,
    getValue: (account) => account.biography ?? getAdditionalMetric(account, 'introduction') ?? null,
    render: (value: any) => {
      if (!value) return 'N/A';
      const truncated = String(value).length > 50 ? String(value).substring(0, 50) + '...' : String(value);
      return <span title={String(value)} className="text-sm text-gray-600">{truncated}</span>;
    }
  },

  {
    key: 'average_views',
    label: 'Avg Views',
    width: 'w-24',
    defaultVisible: false,
    getValue: (account) => getAdditionalMetric(account, 'average_views') ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'subscribers',
    label: 'Subscribers',
    width: 'w-24',
    defaultVisible: false,
    getValue: (account) => account.subscribers_count ?? getAdditionalMetric(account, 'subscriber_count') ?? null,
    render: (value: any) => typeof value === 'number' ? formatNumber(value) : 'N/A'
  },

  {
    key: 'has_clips',
    label: 'Has Clips',
    width: 'w-20',
    defaultVisible: false,
    getValue: (account) => account.has_clips ? 'Yes' : 'No',
    render: (value: any) => (
      <span className={`text-xs px-2 py-1 rounded-full ${
        value === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  },

  {
    key: 'has_highlights',
    label: 'Highlights',
    width: 'w-20',
    defaultVisible: false,
    getValue: (account) => account.has_highlight_reels ? 'Yes' : 'No',
    render: (value: any) => (
      <span className={`text-xs px-2 py-1 rounded-full ${
        value === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  },

  {
    key: 'created_at',
    label: 'Added',
    width: 'w-28',
    defaultVisible: false,
    getValue: (account) => account.created_at ?? null,
    render: (value: any) => {
      if (!value) return 'N/A';
      const date = new Date(value);
      return date.toLocaleDateString();
    }
  },

  {
    key: 'verified',
    label: 'Verified',
    width: 'w-20',
    defaultVisible: false,
    getValue: (account) => account.is_verified ? 'Yes' : 'No',
    render: (value: any) => (
      <span className={`text-xs px-2 py-1 rounded-full ${
        value === 'Yes' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )
  }
];