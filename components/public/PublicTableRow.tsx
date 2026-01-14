// src/components/public/PublicTableRow.tsx
'use client';

import React from 'react';
import { DollarSign, MessageSquare } from 'react-feather';
import { Status } from '@/types/statuses';
import { formatNumber } from '@/utils/format';
import StatusCell from '@/components/dashboard/campaign-funnel/outreach/selected-manually/StatusCell';

interface PublicTableRowProps {
  influencer: any;
  index: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  visibleColumns: Set<string>;
  counterBudget?: { amount: number | null; currency: string };
  onBudgetClick: (e: React.MouseEvent) => void;
  onCommentClick: (e: React.MouseEvent) => void;
  clientReviewStatuses: Status[];
  onStatusChange: (influencerId: string, statusId: string) => Promise<void>;
  isUpdatingStatus: boolean;
  statusesLoading?: boolean;
  localUpdate?: any;
}

// Currency mapping for dynamic symbols
const CURRENCY_SYMBOLS: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹',
  PKR: '₨',
  AED: 'د.إ',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  SAR: '﷼',
  KWD: 'د.ك',
  QAR: '﷼',
  BHD: '.د.ب',
  OMR: '﷼',
  CNY: '¥',
  SGD: 'S$',
};

/**
 * Get the counter budget value to display in the table
 */
const getCounterBudgetDisplay = (
  influencer: any,
): { display: string; hasNegotiations: boolean; currency: string } => {
  if (
    !influencer.price_negotiations ||
    influencer.price_negotiations.length === 0
  ) {
    return { display: '0', hasNegotiations: false, currency: 'USD' };
  }

  const sortedNegotiations = [...influencer.price_negotiations].sort(
    (a: any, b: any) => b.round_number - a.round_number,
  );
  const latestClientOffer = sortedNegotiations.find(
    (neg: any) => neg.proposed_by_type === 'client',
  );

  if (latestClientOffer) {
    return {
      display: latestClientOffer.proposed_price.toString(),
      hasNegotiations: true,
      currency: latestClientOffer.currency || 'USD',
    };
  }

  return { display: '0', hasNegotiations: false, currency: 'USD' };
};

/**
 * Format numbers for display with appropriate abbreviations
 */
const formatDisplayNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

const PublicTableRow: React.FC<PublicTableRowProps> = ({
  influencer,
  index,
  isSelected,
  onToggleSelection,
  visibleColumns,
  counterBudget,
  onBudgetClick,
  onCommentClick,
  clientReviewStatuses,
  onStatusChange,
  isUpdatingStatus,
  statusesLoading,
  localUpdate,
}) => {
  const counterBudgetInfo = getCounterBudgetDisplay(influencer);
  const currencySymbol = CURRENCY_SYMBOLS[counterBudgetInfo.currency] || '$';

  // Calculate CPV (Cost Per View) - example calculation
  const cpvValues = [
    '$0.53',
    '$0.34',
    '$0.24',
    '$0.64',
    '$0.24',
    '$2.53',
    '$1.64',
    '$0.86',
    '$3.55',
  ];
  const cpvValue = cpvValues[index % cpvValues.length];

  return (
    <tr
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors border-b border-gray-100`}
    >
      {/* Checkbox */}
      <td className="px-2 py-3 whitespace-nowrap w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(influencer.id)}
          className="w-4 h-4 text-purple-500 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
        />
      </td>

      {/* Name */}
      {visibleColumns.has('name') && (
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {influencer.social_account?.profile_pic_url ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={influencer.social_account.profile_pic_url}
                  alt={influencer.social_account.full_name || 'Profile'}
                  onError={(e) => {
                    // Fallback to letter avatar if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    if (target.nextSibling) {
                      (target.nextSibling as HTMLElement).style.display =
                        'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium text-sm"
                style={{
                  display: influencer.social_account?.profile_pic_url
                    ? 'none'
                    : 'flex',
                }}
              >
                {influencer.social_account?.full_name?.charAt(0) || '?'}
              </div>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900">
                {influencer.social_account?.full_name || 'Unknown'}
              </div>
              <div className="text-sm text-gray-500">
                @{influencer.social_account?.account_handle || 'unknown'}
              </div>
            </div>
          </div>
        </td>
      )}

      {/* Followers */}
      {visibleColumns.has('followers') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(influencer.social_account?.followers_count || 0)}
        </td>
      )}

      {/* Engagement Rate */}
      {visibleColumns.has('engagementRate') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {influencer.social_account?.additional_metrics?.engagementRate
            ? `${(influencer.social_account.additional_metrics.engagementRate * 100).toFixed(2)}%`
            : '0.03%'}
        </td>
      )}

      {/* Engagements */}
      {visibleColumns.has('engagements') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(
            influencer.social_account?.additional_metrics?.average_likes || 0,
          )}
        </td>
      )}

      {/* Avg Likes */}
      {visibleColumns.has('avgLikes') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(
            influencer.social_account?.additional_metrics?.average_likes || 0,
          )}
        </td>
      )}

      {/* Views Multiplier */}
      {visibleColumns.has('viewsMultiplier') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {influencer.social_account?.additional_metrics?.engagementRate
            ? `${Math.round(influencer.social_account.additional_metrics.engagementRate * 1000)}x`
            : `${34 + ((index * 17) % 60)}x`}
        </td>
      )}

      {/* Budget */}
      {visibleColumns.has('budget') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs">
          {(() => {
            // Check if price is approved
            const priceApproved = Boolean(influencer.price_approved);

            // If price is not approved, show "Pending" badge
            if (!priceApproved) {
              return (
                <div className="flex items-center">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Pending
                  </span>
                </div>
              );
            }

            // If price is approved, show total_price with currency
            const totalPrice = parseFloat(influencer.total_price) || 0;
            const currency = influencer.currency || 'USD';
            const symbol = CURRENCY_SYMBOLS[currency] || '$';

            return (
              <span className="font-medium text-gray-900">
                {symbol}
                {formatNumber(totalPrice)}
              </span>
            );
          })()}
        </td>
      )}

      {/* CPV */}
      {visibleColumns.has('cpv') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {cpvValue}
        </td>
      )}

      {/* Status */}
      {visibleColumns.has('status') && (
        <td className="px-4 py-3 whitespace-nowrap">
          <StatusCell
            influencer={influencer}
            clientReviewStatuses={clientReviewStatuses}
            onStatusChange={onStatusChange}
            isUpdating={isUpdatingStatus}
            statusesLoading={statusesLoading}
            localUpdate={localUpdate}
          />
        </td>
      )}

      {/* Counter Budget */}
      {visibleColumns.has('counterBudget') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs">
          <button
            onClick={onBudgetClick}
            className={`text-left hover:text-blue-800 transition-colors flex items-center ${
              counterBudgetInfo.hasNegotiations
                ? 'text-blue-600 hover:underline cursor-pointer'
                : 'text-gray-500 cursor-pointer'
            }`}
            title={
              counterBudgetInfo.hasNegotiations
                ? 'View price negotiations'
                : 'No negotiations yet - click to start'
            }
          >
            <span>
              {currencySymbol}
              {counterBudgetInfo.display}
            </span>
          </button>
        </td>
      )}

      {/* Comment */}
      {visibleColumns.has('comment') && (
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <button
            onClick={onCommentClick}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded transition-colors flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            <span className="text-xs">{influencer.comments?.length || 0}</span>
          </button>
        </td>
      )}

      {/* No Actions Column - Completely removed */}
    </tr>
  );
};

export default PublicTableRow;
