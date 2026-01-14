// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/PricePopup.tsx

'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Search } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { updateCampaignInfluencerPrice } from '@/services/campaign-influencers/campaign-influencers.client';
import { CampaignInfluencerResponse } from '@/types/campaign-influencers';

interface PricePopupProps {
  member: CampaignListMember | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedMember: CampaignListMember) => void;
  position: { x: number; y: number };
}

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', name: 'US Dollar', popular: true },
  { code: 'EUR', symbol: '€', name: 'Euro', popular: true },
  { code: 'GBP', symbol: '£', name: 'British Pound', popular: true },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', popular: true },
  { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', popular: true },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', popular: true },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', popular: false },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', popular: false },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', popular: false },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', popular: false },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', popular: false },
  { code: 'QAR', symbol: '﷼', name: 'Qatari Riyal', popular: false },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', popular: false },
  { code: 'OMR', symbol: '﷼', name: 'Omani Rial', popular: false },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', popular: false },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', popular: false },
];

export default function PricePopup({ 
  member, 
  isOpen, 
  onClose,
  onUpdate,
  position
}: PricePopupProps) {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  useEffect(() => {
    if (isOpen && member) {
      // Get existing price and currency from the root level of CampaignListMember
      setPrice(member.collaboration_price?.toString() || '');
      setCurrency(member.currency || 'USD');
      setCurrencySearch('');
      setShowCurrencyDropdown(false);
    }
  }, [isOpen, member]);

  const handleSubmit = async () => {
    if (!member) return;

    setIsSubmitting(true);
    try {
      if (!member.id) {
        throw new Error('Campaign influencer ID is required');
      }
      // FIXED: Use the proper service call to update campaign influencer price
      const updatedInfluencer: CampaignInfluencerResponse = await updateCampaignInfluencerPrice(
        member.id, // Use member.id which is the campaign_influencer_id
        price ? parseFloat(price) : null,
        currency
      );
      
      if (onUpdate) {
        // Create the updated member object using the response data
        const updatedMember: CampaignListMember = {
          ...member,
          // FIXED: Update price and currency at the root level (not additional_metrics)
          collaboration_price: updatedInfluencer.collaboration_price || null,
          currency: updatedInfluencer.currency || 'USD',
          
          // Update status information from response
          status_id: updatedInfluencer.status_id || member.status_id,
          status: updatedInfluencer.status ? {
            id: updatedInfluencer.status.id,
            name: updatedInfluencer.status.name
          } : member.status,
          
          // Update social account info if provided
          social_account: updatedInfluencer.social_account && member.social_account ? {
            ...member.social_account,
            ...updatedInfluencer.social_account,
            // Ensure required fields are present
            profile_pic_url: updatedInfluencer.social_account.profile_pic_url || member.social_account.profile_pic_url,
            followers_count: updatedInfluencer.social_account.followers_count || member.social_account.followers_count,
            is_verified: updatedInfluencer.social_account.is_verified ?? member.social_account.is_verified,
            platform_account_id: updatedInfluencer.social_account.platform_account_id || member.social_account.platform_account_id,
            is_private: updatedInfluencer.social_account.is_private ?? member.social_account.is_private
          } : member.social_account,
          
          // Update timestamps
          updated_at: updatedInfluencer.updated_at || new Date().toISOString()
        };
        
        onUpdate(updatedMember);
      }
      
      onClose();
    } catch (error) {
      console.error(`Failed to update price: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('Failed to update price. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCurrencies = CURRENCY_OPTIONS.filter(curr => 
    curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const popularCurrencies = filteredCurrencies.filter(curr => curr.popular);
  const otherCurrencies = filteredCurrencies.filter(curr => !curr.popular);

  if (!isOpen || !member) return null;

  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  return (
    <>
      {/* Fixed overlay */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Popup positioned absolutely */}
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200"
        style={{
          left: position.x,
          top: position.y,
          width: '350px'
        }}
      >
        <div className="flex items-center space-x-2 p-3 border-b border-gray-200">
          <img
            src={member.social_account?.profile_pic_url || '/default-avatar.png'}
            alt={member.social_account?.full_name || ''}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-medium text-gray-900 text-sm">
            {member.social_account?.full_name}
          </span>
          
          {/* Show current status */}
          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {member.status?.name || 'Unknown'}
          </span>
        </div>
        
        <div className="p-3 space-y-3">
          {/* Show contact attempts info */}
          <div className="text-xs text-gray-500">
            Contact attempts: {member.contact_attempts || 0}
          </div>
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm"
              >
                <span>{selectedCurrency.symbol}</span>
                <span>{selectedCurrency.code}</span>
              </button>
              
              {showCurrencyDropdown && (
                <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-60 max-h-60 overflow-y-auto">
                  <div className="p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        type="text"
                        value={currencySearch}
                        onChange={(e) => setCurrencySearch(e.target.value)}
                        placeholder="Search currencies..."
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  
                  {popularCurrencies.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">Popular</div>
                      {popularCurrencies.map(curr => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium">{curr.code}</span>
                            <span className="text-gray-500 ml-1">{curr.name}</span>
                          </div>
                          <span>{curr.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {otherCurrencies.length > 0 && (
                    <div>
                      {popularCurrencies.length > 0 && <div className="border-t"></div>}
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">Other</div>
                      {otherCurrencies.map(curr => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full px-2 py-1.5 text-left hover:bg-gray-50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-medium">{curr.code}</span>
                            <span className="text-gray-500 ml-1">{curr.name}</span>
                          </div>
                          <span>{curr.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span>Updating...</span>
                </>
              ) : (
                'Update'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}