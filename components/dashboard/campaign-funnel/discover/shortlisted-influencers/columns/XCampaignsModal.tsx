// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/XCampaignsModal.tsx

'use client';

import React, { useEffect, useRef, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, CheckCircle } from 'lucide-react';
import { PastCampaign } from '@/types/campaign-influencers';

interface XCampaignsModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerName: string;
  pastCampaigns: PastCampaign[];
  anchorRect: DOMRect | null;
}

// Currency symbols mapping
const CURRENCY_SYMBOLS: Record<string, string> = {
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

const XCampaignsModal: React.FC<XCampaignsModalProps> = ({
  isOpen,
  onClose,
  influencerName,
  pastCampaigns,
  anchorRect,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Calculate position immediately from anchorRect (no useEffect delay)
  const modalPosition = useMemo(() => {
    if (!anchorRect) return { top: 0, left: 0 };

    const modalWidth = 480; // Increased width for new column
    const modalHeight = 350;
    const padding = 16;
    const gap = 8;

    let left = anchorRect.left;
    let top = anchorRect.bottom + gap;

    // Check if modal goes beyond right edge
    if (left + modalWidth > window.innerWidth - padding) {
      left = anchorRect.right - modalWidth;
    }

    // Check if modal goes beyond left edge
    if (left < padding) {
      left = padding;
    }

    // Check if modal goes beyond bottom edge - show above if needed
    if (top + modalHeight > window.innerHeight - padding) {
      top = anchorRect.top - modalHeight - gap;
    }

    // If still above viewport, just position at top
    if (top < padding) {
      top = padding;
    }

    return { top, left };
  }, [anchorRect]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Format price with currency symbol
  const formatPrice = (campaign: PastCampaign): string | null => {
    if (!campaign.currency || !campaign.total_price) {
      return null;
    }

    const symbol = CURRENCY_SYMBOLS[campaign.currency] || campaign.currency;
    const price = parseFloat(campaign.total_price);

    if (isNaN(price)) {
      return null;
    }

    return `${symbol}${Math.round(price).toLocaleString()}`;
  };

  // Format approved at date
  const formatApprovedAt = (dateString: string | null | undefined): string | null => {
    if (!dateString) {
      return null;
    }

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return null;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  // Track if component is mounted (for Portal)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Don't render until we have anchorRect and component is mounted
  if (!isOpen || !anchorRect || !isMounted) return null;

  // Modal content
  const modalContent = (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'fixed',
          left: `${modalPosition.left}px`,
          top: `${modalPosition.top}px`,
          zIndex: 9999,
          width: '480px',
          maxWidth: 'calc(100vw - 32px)',
        }}
        className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Past Campaigns
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[350px]">
                {influencerName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[300px] overflow-auto">
          {pastCampaigns.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No past campaigns</p>
            </div>
          ) : (
            <div className="min-w-[450px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Campaign Name
                    </th>
                    <th className="px-3 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Price
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">
                      Approved At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pastCampaigns.map((campaign, index) => {
                    const formattedPrice = formatPrice(campaign);
                    const formattedDate = formatApprovedAt(campaign.price_approved_at);

                    return (
                      <tr
                        key={index}
                        className="hover:bg-purple-50/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-800 font-medium line-clamp-1">
                            {campaign.campaign_name}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right">
                          {formattedPrice ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                              {formattedPrice}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formattedDate ? (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-600 whitespace-nowrap">
                              <CheckCircle className="w-3 h-3 text-green-500" />
                              {formattedDate}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        {pastCampaigns.length > 0 && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Total: {pastCampaigns.length} campaign
              {pastCampaigns.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </>
  );

  // Use Portal to render modal at document.body level
  return createPortal(modalContent, document.body);
};

export default XCampaignsModal;