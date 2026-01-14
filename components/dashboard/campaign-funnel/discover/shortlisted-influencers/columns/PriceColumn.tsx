// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/PriceColumn.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import PricePopup from '../PricePopup';

interface PriceColumnProps {
  member: CampaignListMember;
  onUpdate?: (updatedMember: CampaignListMember) => void;
}

const PriceColumn: React.FC<PriceColumnProps> = ({ member, onUpdate }) => {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [pricePosition, setPricePosition] = useState({ x: 0, y: 0 });
  
  // Local state for optimistic updates (immediate UI changes)
  const [localPrice, setLocalPrice] = useState<string | number | null>(null);
  const [localCurrency, setLocalCurrency] = useState<string>('USD');

  // Initialize local state when member changes
  useEffect(() => {
    setLocalPrice(member.collaboration_price ?? null);
    setLocalCurrency(member.currency ?? 'USD');
  }, [member.collaboration_price, member.currency]);

  // Helper function to safely access additional metrics
  const getAdditionalMetric = (key: string, defaultValue: any = null) => {
    const additionalMetrics = member?.social_account?.additional_metrics;
    if (!additionalMetrics || typeof additionalMetrics !== 'object') {
      return defaultValue;
    }
    const metricsObj = additionalMetrics as Record<string, any>;
    return metricsObj[key] ?? defaultValue;
  };

  // Calculate popup position
  const calculatePopupPosition = (triggerElement: HTMLElement, modalWidth: number, modalHeight: number) => {
    const rect = triggerElement.getBoundingClientRect();
    const padding = 10;
    
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    
    let x = rect.left + scrollX;
    let y = rect.bottom + padding + scrollY;
    
    if (x + modalWidth > window.innerWidth + scrollX - padding) {
      x = rect.right + scrollX - modalWidth;
    }
    
    if (y + modalHeight > window.innerHeight + scrollY - padding) {
      y = rect.top + scrollY - modalHeight - padding;
    }
    
    if (x < scrollX + padding) {
      x = scrollX + padding;
    }
    
    if (y < scrollY + padding) {
      y = rect.bottom + padding + scrollY;
    }
    
    return { x, y };
  };

  // Handle price popup
  const handlePriceClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    
    const position = calculatePopupPosition(event.currentTarget as HTMLElement, 350, 250);
    
    setPricePosition(position);
    setPriceModalOpen(true);
  };

  // Handle member updates with optimistic UI updates
  const handleMemberUpdate = (updatedMember: CampaignListMember) => {
    console.log('PriceColumn: Member updated:', updatedMember);
    
    // Immediately update local state for instant UI feedback (optimistic update)
    // Use nullish coalescing to handle undefined values
    setLocalPrice(updatedMember.collaboration_price ?? null);
    setLocalCurrency(updatedMember.currency ?? 'USD');
    
    // Call parent update for backend synchronization
    if (onUpdate) {
      onUpdate(updatedMember);
    }
  };

  // Get price and currency data (use local state for immediate updates)
  const currentPrice = localPrice !== null ? localPrice : 
                      member.collaboration_price || 
                      getAdditionalMetric('collaboration_price') || 
                      getAdditionalMetric('price');
                      
  const currentCurrency = localCurrency || member.currency || 'USD';
  
  const currencySymbols: { [key: string]: string } = {
    'USD': '$', 
    'EUR': '€', 
    'GBP': '£', 
    'INR': '₹', 
    'PKR': '₨', 
    'AED': 'د.إ',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'SAR': '﷼',
    'KWD': 'د.ك',
    'QAR': '﷼',
    'BHD': '.د.ب',
    'OMR': '﷼',
    'CNY': '¥',
    'SGD': 'S$'
  };
  
  const symbol = currencySymbols[currentCurrency] || '$';

  // Format price for display
  const formatPrice = (price: string | number | null): string => {
    if (price === null || price === undefined) return '0';
    
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    // Handle NaN case
    if (isNaN(numPrice)) return '0';
    
    // Format with commas for large numbers
    return numPrice.toLocaleString();
  };

  return (
    <>
      <div className="relative group w-28">
        <button
          type="button"
          onClick={handlePriceClick}
          className="w-full flex items-center text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 px-1 py-1 rounded transition-colors cursor-pointer"
          title="Click to edit price"
        >
          <span className="mr-1 text-gray-600 font-medium">{symbol}</span>
          <span className="text-left text-gray-900">{formatPrice(currentPrice)}</span>
          
          {/* Edit Icon - appears on hover, positioned right next to price number */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-0.5 flex-shrink-0">
            <svg 
              className="w-4 h-4 text-purple-500 hover:text-purple-600 transition-colors" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Price Modal */}
      {priceModalOpen && (
        <PricePopup
          member={{
            ...member,
            // Override with current local values to ensure popup shows latest price
            collaboration_price: typeof localPrice === 'string' ? parseFloat(localPrice) : localPrice,
            currency: localCurrency
          }}
          isOpen={priceModalOpen}
          onClose={() => setPriceModalOpen(false)}
          onUpdate={handleMemberUpdate}
          position={pricePosition}
        />
      )}
    </>
  );
};

export default PriceColumn;