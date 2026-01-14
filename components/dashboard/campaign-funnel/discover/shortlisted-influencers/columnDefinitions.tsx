// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columnDefinitions.ts

import React from 'react';
import { ColumnDefinition } from '@/components/ui/table/ColumnVisibility';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { formatNumber } from '@/utils/format';

// Truncate name function
const truncateName = (name: string, maxLength: number = 15): string => {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  return name.substring(0, maxLength) + '...';
};

// Handle clicking on name to open account URL
const handleNameClick = (member: CampaignListMember) => {
  const accountUrl =
    member.social_account?.account_url ||
    member.social_account?.additional_metrics?.url;
  if (accountUrl) {
    window.open(accountUrl, '_blank', 'noopener,noreferrer');
  }
};

export const getColumnDefinitions =
  (): ColumnDefinition<CampaignListMember>[] => [
    {
      key: 'name',
      label: 'Name',
      width: 'w-32',
      defaultVisible: true,
      getValue: (member) => member.social_account?.full_name || '',
      render: (value, member) => (
        <div className="flex items-center min-w-0">
          <div className="flex-shrink-0 relative">
            {/* User profile image */}
            <img
              className="rounded-full object-cover h-8 w-8 border-2 border-gray-200"
              src={
                member.social_account?.profile_pic_url ||
                `https://i.pravatar.cc/150?u=${member.social_account?.id}`
              }
              alt={member.social_account?.full_name}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  `https://i.pravatar.cc/150?u=${member.social_account?.id}`;
              }}
            />
            {/* Platform logo badge - positioned well outside the circle */}
            {(member.social_account as any)?.platform?.logo_url && (
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-200 shadow-lg flex items-center justify-center ring-1 ring-gray-100">
                <img
                  className="w-4 h-4 object-contain"
                  src={(member.social_account as any).platform.logo_url}
                  alt={(member.social_account as any).platform.name}
                  onError={(e) => {
                    // If platform logo fails to load, show a small platform indicator
                    const container = (e.target as HTMLImageElement)
                      .parentElement;
                    if (container) {
                      container.innerHTML =
                        '<div class="w-3 h-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full"></div>';
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
                title={member.social_account?.full_name || ''}
                onClick={() => handleNameClick(member)}
              >
                {truncateName(member.social_account?.full_name || '', 20)}
              </span>
              {member.social_account?.is_verified && (
                <span
                  className="ml-1 flex-shrink-0 text-blue-500"
                  title="Verified"
                >
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1.177-7.86l-2.765-2.767L7 12.431l3.823 3.823 7.177-7.177-1.06-1.06-7.117 7.122z" />
                  </svg>
                </span>
              )}
            </div>
            <div
              className="text-xs text-gray-500 truncate cursor-pointer hover:text-purple-500 transition-colors"
              title={`@${member.social_account?.account_handle || ''}`}
              onClick={() => handleNameClick(member)}
            >
              @{truncateName(member.social_account?.account_handle || '', 20)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'followers',
      label: 'Followers',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) => member.social_account?.followers_count || 0,
      render: (value) => formatNumber(value) || 'N/A',
    },
    {
      key: 'engagement_rate',
      label: 'Eng Rate',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) =>
        member.social_account?.additional_metrics?.engagementRate ?? null,
      render: (value) => {
        if (typeof value === 'number') {
          return `${(value * 100).toFixed(2)}%`;
        }
        return 'N/A';
      },
    },
    {
      key: 'avg_likes',
      label: 'Avg Likes',
      width: 'w-20',
      defaultVisible: true,
      getValue: (member) =>
        member.social_account?.additional_metrics?.average_likes ?? null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'gender',
      label: 'Gender',
      width: 'w-16',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.gender || '',
      render: (value) =>
        value
          ? String(value).charAt(0).toUpperCase() + String(value).slice(1)
          : 'N/A',
    },
    {
      key: 'language',
      label: 'Language',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.language || '',
      render: (value) => value || 'N/A',
    },
    {
      key: 'age_group',
      label: 'Age Group',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.age_group || '',
      render: (value) => value || 'N/A',
    },
    {
      key: 'average_views',
      label: 'Avg Views',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.average_views || null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'content_count',
      label: 'Content Count',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.content_count || null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'subscriber_count',
      label: 'Subscribers',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.subscriber_count || null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'media_count',
      label: 'Media Count',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => member.social_account?.media_count || null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'following_count',
      label: 'Following',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) => member.social_account?.following_count || null,
      render: (value) =>
        typeof value === 'number' ? formatNumber(value) : 'N/A',
    },
    {
      key: 'platform_account_type',
      label: 'Account Type',
      width: 'w-24',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.platform_account_type || '',
      render: (value) =>
        value
          ? String(value)
              .replace('_', ' ')
              .replace(/\b\w/g, (l) => l.toUpperCase())
          : 'N/A',
    },
    {
      key: 'livestream_metrics',
      label: 'Livestream',
      width: 'w-20',
      defaultVisible: false,
      getValue: (member) =>
        member.social_account?.additional_metrics?.livestream_metrics,
      render: (value) => {
        if (value && typeof value === 'object') {
          return 'Available';
        }
        return 'N/A';
      },
    },
  ];
