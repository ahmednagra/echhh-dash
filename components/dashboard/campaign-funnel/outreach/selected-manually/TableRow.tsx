// src/components/dashboard/campaign-funnel/outreach/selected-manually/TableRow.tsx
// UPDATED: Added security layer to only render admin-approved columns

import React from 'react';
import { formatNumber } from '@/utils/format';
import { Status } from '@/types/statuses';
import { MessageSquare } from 'lucide-react';
import ActionsDropdown from './ActionsDropdown';
import StatusCell from './StatusCell';

interface TableRowProps {
  influencer: any;
  index: number;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
  visibleColumns: Set<string>;
  counterBudget?: { amount: number | null; currency: string };
  onBudgetClick: (e: React.MouseEvent) => void;
  onCommentClick: (e: React.MouseEvent) => void;
  onViewsClick?: (e: React.MouseEvent) => void;
  averageViews?: number | null;
  onProfileClick?: (influencer: any) => void;
  clientReviewStatuses: Status[];
  onStatusChange: (influencerId: string, statusId: string) => Promise<void>;
  isUpdatingStatus: boolean;
  statusesLoading: boolean;
  localUpdate?: any;
  commentsCount?: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  INR: '₹',
  PKR: '₨',
  AED: 'د.إ',
  SAR: '﷼',
  KWD: 'د.ك',
  QAR: '﷼',
  BHD: '.د.ب',
  OMR: '﷼',
};

const TableRow: React.FC<TableRowProps> = ({
  influencer,
  index,
  isSelected,
  onToggleSelection,
  visibleColumns,
  counterBudget,
  onBudgetClick,
  onCommentClick,
  onViewsClick,
  averageViews,
  onProfileClick,
  clientReviewStatuses,
  onStatusChange,
  isUpdatingStatus,
  statusesLoading,
  localUpdate,
  commentsCount = 0,
}) => {
  // Helper function to format display numbers
  const formatDisplayNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Get actual budget from price negotiations if collaboration_price is null
  const getBudgetInfo = () => {
    // First check if collaboration_price exists
    if (influencer.collaboration_price && influencer.collaboration_price > 0) {
      return {
        amount: influencer.collaboration_price,
        currency: influencer.currency || 'USD',
      };
    }

    // If no collaboration_price, get from latest price negotiation
    if (
      influencer.price_negotiations &&
      influencer.price_negotiations.length > 0
    ) {
      // Get the latest negotiation from influencer (highest round number)
      const influencerNegotiations = influencer.price_negotiations.filter(
        (neg: any) => neg.proposed_by_type === 'influencer',
      );

      if (influencerNegotiations.length > 0) {
        const latestInfluencerNegotiation = influencerNegotiations.reduce(
          (latest: any, current: any) => {
            return current.round_number > latest.round_number
              ? current
              : latest;
          },
        );

        return {
          amount: parseFloat(latestInfluencerNegotiation.proposed_price) || 0,
          currency: latestInfluencerNegotiation.currency || 'USD',
        };
      }

      // If no influencer negotiations, get any latest negotiation
      const latestNegotiation = influencer.price_negotiations.reduce(
        (latest: any, current: any) => {
          return current.round_number > latest.round_number ? current : latest;
        },
      );

      return {
        amount: parseFloat(latestNegotiation.proposed_price) || 0,
        currency: latestNegotiation.currency || 'USD',
      };
    }

    // Fallback to 0 USD if no price information available
    return {
      amount: 0,
      currency: 'USD',
    };
  };

  // Format price with proper currency
  const formatPriceWithCurrency = (
    amount: number,
    currency: string,
  ): string => {
    if (amount <= 0) return '0 USD';

    const formattedPrice = formatNumber(amount);
    return `${formattedPrice} ${currency}`;
  };

  // Counter budget display logic
  const getCounterBudgetDisplay = () => {
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
      const amount = parseFloat(latestClientOffer.proposed_price) || 0;
      return {
        display: formatNumber(amount),
        hasNegotiations: true,
        currency: latestClientOffer.currency || 'USD',
      };
    }

    return { display: '0', hasNegotiations: false, currency: 'USD' };
  };

  const counterBudgetInfo = getCounterBudgetDisplay();
  const budgetInfo = getBudgetInfo();

  return (
    <tr
      className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-purple-50' : ''}`}
    >
      {/* Checkbox - Always visible */}
      <td className="px-2 py-3 whitespace-nowrap">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelection(influencer.id)}
          className="w-4 h-4 text-purple-500 bg-white border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
        />
      </td>

      {/* SECURITY: Only render cells for visible (admin-approved) columns */}

      {/* Name Column */}
      {visibleColumns.has('name') && (
        <td className="px-4 py-3 whitespace-nowrap">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={
                  influencer.social_account?.profile_pic_url ||
                  '/default-avatar.png'
                }
                alt={influencer.social_account?.full_name || 'Influencer'}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-avatar.png';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              {onProfileClick ? (
                <button
                  onClick={() => onProfileClick(influencer)}
                  className="text-left w-full group"
                >
                  <div className="text-sm font-medium text-blue-600 group-hover:text-blue-800 group-hover:underline transition-colors truncate">
                    {influencer.social_account?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors truncate">
                    @{influencer.social_account?.account_handle || 'unknown'}
                  </div>
                </button>
              ) : (
                <>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {influencer.social_account?.full_name || 'Unknown'}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    @{influencer.social_account?.account_handle || 'unknown'}
                  </div>
                </>
              )}
            </div>
          </div>
        </td>
      )}

      {/* Followers Column */}
      {visibleColumns.has('followers') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(influencer.social_account?.followers_count || 0)}
        </td>
      )}

      {/* Engagement Rate Column */}
      {visibleColumns.has('engagementRate') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {(() => {
            const engagementRate =
              influencer.social_account?.additional_metrics?.engagementRate;

            if (typeof engagementRate === 'number') {
              // Check if value is less than 1 (decimal format like 0.0337)
              if (engagementRate < 1) {
                // For values like 0.033765 -> multiply by 100 = 3.38%
                return `${(engagementRate * 100).toFixed(2)}%`;
              } else {
                // For values like 1.8638 -> show as-is = 1.86%
                const roundedRate = Math.round(engagementRate * 100) / 100;
                return `${roundedRate}%`;
              }
            }

            return 'N/A';
          })()}
        </td>
      )}

      {/* Engagements Column */}
      {visibleColumns.has('engagements') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(
            influencer.social_account?.additional_metrics?.average_likes || 0,
          )}
        </td>
      )}

      {/* Avg Likes Column */}
      {visibleColumns.has('avgLikes') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {formatDisplayNumber(
            influencer.social_account?.additional_metrics?.average_likes || 0,
          )}
        </td>
      )}

      {/* Avg Views Column */}
      {visibleColumns.has('avgViews') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs">
          {onViewsClick ? (
            <div className="group flex items-center">
              <button
                onClick={onViewsClick}
                className={`text-left hover:text-blue-800 transition-colors ${
                  averageViews ||
                  influencer.social_account?.additional_metrics?.average_views
                    ? 'text-blue-600 hover:underline cursor-pointer'
                    : 'text-gray-500 cursor-pointer'
                }`}
                title="Click to update average views"
              >
                <span>
                  {averageViews !== null && averageViews !== undefined
                    ? formatDisplayNumber(averageViews)
                    : influencer.social_account?.additional_metrics
                          ?.average_views
                      ? formatDisplayNumber(
                          influencer.social_account.additional_metrics
                            .average_views,
                        )
                      : 'Set Views'}
                </span>
              </button>
              <div
                className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 cursor-pointer shadow-sm hover:shadow-md"
                onClick={onViewsClick}
                title="Edit average views"
              >
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <span className="text-gray-700">
              {averageViews !== null && averageViews !== undefined
                ? formatDisplayNumber(averageViews)
                : influencer.social_account?.additional_metrics?.average_views
                  ? formatDisplayNumber(
                      influencer.social_account.additional_metrics
                        .average_views,
                    )
                  : 'N/A'}
            </span>
          )}
        </td>
      )}

      {/* Views Multiplier Column */}
      {visibleColumns.has('viewsMultiplier') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {(() => {
            const avgViews =
              averageViews ||
              influencer.social_account?.additional_metrics?.average_views ||
              0;
            const followers = influencer.social_account?.followers_count || 0;

            if (avgViews <= 0 || followers <= 0) {
              return '0.00';
            }

            const viewsMulti = avgViews / followers;
            return viewsMulti.toFixed(2);
          })()}
        </td>
      )}

      {/* Budget Column */}
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
                {totalPrice.toLocaleString()}
              </span>
            );
          })()}
        </td>
      )}

      {/* CPV Column */}
      {visibleColumns.has('cpv') && (
        <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-700">
          {(() => {
            // Apply CPV formula: Budget ÷ Avg Views
            // Use total_price if price_approved, otherwise use collaboration_price
            const priceApproved = Boolean(influencer.price_approved);
            const budget = priceApproved
              ? parseFloat(influencer.total_price) || 0
              : budgetInfo.amount || 0;

            const avgViews =
              averageViews ||
              influencer.social_account?.additional_metrics?.average_views ||
              0;

            // Return 0 if no budget or views to avoid division by zero
            if (budget <= 0 || avgViews <= 0) {
              return '0.00';
            }

            const cpv = budget / avgViews;
            return cpv.toFixed(4);
          })()}
        </td>
      )}

      {/* Status Column */}
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

      {/* Comment Column */}
      {visibleColumns.has('comment') && (
        <td className="px-4 py-3 whitespace-nowrap text-center">
          <button
            onClick={onCommentClick}
            className="relative inline-flex items-center text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded transition-colors group"
            title="View/Add comments"
          >
            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {/* Show count as badge on the MessageSquare icon */}
            {commentsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[12px] h-3 flex items-center justify-center px-0.5 font-medium leading-none">
                {commentsCount > 99 ? '99+' : commentsCount}
              </span>
            )}
          </button>
        </td>
      )}

      {/* Actions Column - Always show for functionality */}
      <td className="px-4 py-3 whitespace-nowrap text-center">
        <ActionsDropdown
          influencerId={influencer.id}
          onView={() => console.log('View', influencer.id)}
          onEdit={() => console.log('Edit', influencer.id)}
          onCounterBudget={onBudgetClick}
        />
      </td>
    </tr>
  );
};

export default TableRow;
