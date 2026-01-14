// src/components/social-accounts/Modals.tsx - Updated Contact Options + Better Positioning
'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Search, Mail, MessageCircle, Send } from 'react-feather';
import { updateSocialAccountPricing } from '@/services/social-accounts/social-accounts.service';
import { createInfluencerContact } from '@/services/influencer-contacts/influencer-contacts.service';
import type { SocialAccount } from '@/types/social-accounts';
import { ContactType } from '@/types/influencer-contacts';
import { Currency, ContactData } from './types';

// Currency options (unchanged)
const CURRENCY_OPTIONS: Currency[] = [
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

// UPDATED: Contact types - Removed Phone and Other options
const contactTypes: { 
  value: ContactType; 
  label: string; 
  placeholder: string;
  icon: React.ReactNode;
}[] = [
  { 
    value: 'whatsapp', 
    label: 'WhatsApp', 
    placeholder: 'Enter WhatsApp number',
    icon: <MessageCircle className="w-4 h-4" />
  },
  { 
    value: 'email', 
    label: 'Email', 
    placeholder: 'Enter email address',
    icon: <Mail className="w-4 h-4" />
  },
  { 
    value: 'telegram', 
    label: 'Telegram', 
    placeholder: 'Enter Telegram username',
    icon: <Send className="w-4 h-4" />
  }
];

// UPDATED: Better popup positioning function with responsive calculations
const calculateResponsivePosition = (
  element: HTMLElement, 
  popupWidth: number, 
  popupHeight: number
) => {
  const rect = element.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;

  // Calculate initial position (below the element)
  let x = rect.left + scrollX;
  let y = rect.bottom + scrollY + 8; // 8px gap

  // Adjust horizontal position if popup would go off-screen
  if (x + popupWidth > viewportWidth + scrollX) {
    // Position to the left of the trigger element
    x = rect.right + scrollX - popupWidth;
  }
  
  // Ensure minimum margin from left edge
  if (x < scrollX + 16) {
    x = scrollX + 16;
  }

  // Adjust vertical position if popup would go off-screen
  if (y + popupHeight > viewportHeight + scrollY) {
    // Position above the element instead
    y = rect.top + scrollY - popupHeight - 8;
  }
  
  // Ensure minimum margin from top
  if (y < scrollY + 16) {
    y = scrollY + 16;
  }

  return { x, y };
};

// UPDATED: PricePopup Component with better positioning
export const PricePopup: React.FC<{
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedAccount: SocialAccount) => void;
  position: { x: number; y: number };
}> = ({ account, isOpen, onClose, onUpdate, position }) => {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && account) {
      setPrice(account.collaboration_price?.toString() || '');
      setCurrency(account.currency || 'USD');
      setCurrencySearch('');
      setShowCurrencyDropdown(false);
      setError(null);
      
      // Calculate responsive position
      const popupWidth = 350;
      const popupHeight = 400;
      setAdjustedPosition(position);
      
      console.log('DEBUG: PricePopup opened for account:', {
        accountId: account.id,
        currentPrice: account.collaboration_price,
        currentCurrency: account.currency
      });
    }
  }, [isOpen, account, position]);

  const selectedCurrency = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];
  
  const filteredCurrencies = CURRENCY_OPTIONS.filter(curr =>
    curr.name.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.code.toLowerCase().includes(currencySearch.toLowerCase())
  );

  const popularCurrencies = filteredCurrencies.filter(c => c.popular);
  const otherCurrencies = filteredCurrencies.filter(c => !c.popular);

  const handleSubmit = async () => {
    if (!account) return;

    setIsSubmitting(true);
    setError(null);
    
    try {
      const newPrice = parseFloat(price) || null;
      
      console.log('DEBUG: Starting price update:', {
        accountId: account.id,
        accountHandle: account.account_handle,
        currentPrice: account.collaboration_price,
        currentCurrency: account.currency,
        newPrice: newPrice,
        newCurrency: currency,
        priceInput: price
      });
      
      const updatedAccount = await updateSocialAccountPricing(account.id, newPrice, currency);
      
      console.log('DEBUG: Pricing update response:', {
        success: true,
        updatedAccount: {
          id: updatedAccount.id,
          collaboration_price: updatedAccount.collaboration_price,
          currency: updatedAccount.currency
        }
      });
      
      if (onUpdate) {
        onUpdate(updatedAccount);
      }
      
      console.log('DEBUG: Price update completed successfully');
      onClose();
      
    } catch (error) {
      console.error('DEBUG: Price update error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to update budget: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div 
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        style={{ 
          left: `${adjustedPosition.x}px`, 
          top: `${adjustedPosition.y}px`,
          width: '350px',
          maxHeight: '400px',
          maxWidth: 'calc(100vw - 32px)' // Responsive width
        }}
      >
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-teal-600" />
            <span className="font-medium text-sm">
              Set Budget for {account.account_handle}
            </span>
          </div>
        </div>
        
        <div className="p-3 space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
              {error}
            </div>
          )}
          
          <div className="flex space-x-2">
            <div className="relative">
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="flex items-center space-x-1 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm min-w-[80px]"
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
                        className="w-full pl-7 pr-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {popularCurrencies.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">Popular</div>
                      {popularCurrencies.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span>{curr.name}</span>
                          <span className="text-gray-500">{curr.symbol} {curr.code}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {otherCurrencies.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-50">Others</div>
                      {otherCurrencies.map((curr) => (
                        <button
                          key={curr.code}
                          onClick={() => {
                            setCurrency(curr.code);
                            setShowCurrencyDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between"
                        >
                          <span>{curr.name}</span>
                          <span className="text-gray-500">{curr.symbol} {curr.code}</span>
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
              placeholder="Enter budget amount"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 text-sm"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-teal-600 hover:text-teal-700 font-medium text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span>Saving...</span>
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// UPDATED: ContactPopup Component with removed options and better positioning
export const ContactPopup: React.FC<{
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onContactAdded?: (accountId: string) => void;
  position: { x: number; y: number };
}> = ({ account, isOpen, onClose, onContactAdded, position }) => {
  const [contactType, setContactType] = useState<ContactType>('whatsapp');
  const [contactValue, setContactValue] = useState('');
  const [contactName, setContactName] = useState('');
  const [isPrimary, setIsPrimary] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    if (isOpen && account) {
      setContactType('whatsapp');
      setContactValue('');
      setContactName('');
      setIsPrimary(true);
      setError(null);
      
      // Calculate responsive position
      setAdjustedPosition(position);
      
      console.log('DEBUG: ContactPopup opened for account:', {
        accountId: account.id,
        accountHandle: account.account_handle
      });
    }
  }, [isOpen, account, position]);

  const selectedType = contactTypes.find(type => type.value === contactType) || contactTypes[0];

  const handleSubmit = async () => {
    if (!account || !account.id) {
      console.error('DEBUG: No valid account provided for contact creation');
      setError('Account information is missing');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
    try {
      if (!contactValue.trim()) {
        setError('Contact value is required');
        return;
      }

      console.log('DEBUG: Creating contact for account ID:', account.id);

      const contactData = {
        social_account_id: account.id,
        contact_type: contactType,
        contact_value: contactValue.trim(),
        name: contactName.trim() || `${contactType.charAt(0).toUpperCase() + contactType.slice(1)} Contact`,
        is_primary: isPrimary,
        platform_specific: false
      };

      console.log('DEBUG: Contact data to be sent:', contactData);

      const response = await createInfluencerContact(contactData);
      
      console.log('DEBUG: Contact creation response:', response);
      
      if (response.success && response.data) {
        console.log('Contact stored successfully in database');
        
        if (onContactAdded) {
          onContactAdded(account.id);
        }
        
        onClose();
      } else {
        const errorMsg = response.error || 'Failed to store contact in database';
        console.error('DEBUG: Contact creation failed:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('DEBUG: Contact creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(`Failed to store contact: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !account) return null;

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose}></div>
      <div 
        className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50"
        style={{ 
          left: `${adjustedPosition.x}px`, 
          top: `${adjustedPosition.y}px`,
          width: '320px',
          maxWidth: 'calc(100vw - 32px)' // Responsive width
        }}
      >
        <div className="p-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-teal-600" />
            <span className="font-medium text-sm">
              Add Contact for {account.account_handle}
            </span>
          </div>
        </div>
        
        <div className="p-3 space-y-3">
          {error && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
              {error}
            </div>
          )}
          
          <div className="flex space-x-1">
            {contactTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setContactType(type.value)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs border transition-colors ${
                  contactType === type.value 
                    ? 'bg-teal-50 border-teal-200 text-teal-700' 
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                title={type.label}
              >
                {type.icon}
                <span className="hidden sm:inline">{type.label}</span>
              </button>
            ))}
          </div>
          
          <div>
            <input
              type="text"
              value={contactValue}
              onChange={(e) => setContactValue(e.target.value)}
              placeholder={selectedType.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
              autoFocus
            />
          </div>
          
          <div>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Contact name (optional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrimary"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="h-4 w-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <label htmlFor="isPrimary" className="ml-2 text-sm text-gray-700">
              Primary contact
            </label>
          </div>
          
          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-teal-600 hover:text-teal-700 font-medium text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !contactValue.trim()}
              className="px-3 py-1 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                  <span>Adding...</span>
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ViewContactsModal Component (unchanged functionality)
export const ViewContactsModal: React.FC<{
  account: SocialAccount | null;
  isOpen: boolean;
  onClose: () => void;
  contacts: ContactData[];
  onContactUpdate?: (account: SocialAccount, contactId: string, contactData: any) => void;
  onContactDelete?: (account: SocialAccount, contactId: string) => void;
}> = ({ account, isOpen, onClose, contacts, onContactUpdate, onContactDelete }) => {
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleEdit = (contactId: string, currentValue: string) => {
    setEditingContact(contactId);
    setEditValue(currentValue);
  };

  const handleSaveEdit = (contactId: string, contactType: string) => {
    if (!account || !editValue.trim()) return;
    
    const contactData = {
      type: contactType,
      value: editValue.trim(),
      isPrimary: true
    };
    
    onContactUpdate?.(account, contactId, contactData);
    setEditingContact(null);
    setEditValue('');
  };

  const handleDelete = (contactId: string) => {
    if (!account) return;
    onContactDelete?.(account, contactId);
  };

  const getContactIcon = (type: string) => {
    const contactType = contactTypes.find(ct => ct.value === type);
    return contactType?.icon || <Mail className="w-4 h-4" />;
  };

  if (!isOpen || !account) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose}></div>
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 z-50 w-96 max-w-[calc(100vw-32px)] max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span className="font-medium text-lg">
                Contacts for {account.account_handle}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 max-h-96 overflow-y-auto">
          {contacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No contacts added yet</p>
              <p className="text-sm">Use the "Add" button in the contacts column to add contact information</p>
            </div>
          ) : (
            <div className="space-y-3">
              {contacts.map((contact, index) => {
                const contactId = contact.id || `contact-${index}`;
                const isEditing = editingContact === contactId;
                
                return (
                  <div key={contactId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-teal-600">
                        {getContactIcon(contact.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 capitalize">
                          {contact.type}
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="text-sm text-gray-600 border border-gray-300 rounded px-2 py-1 mt-1"
                            autoFocus
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveEdit(contactId, contact.type);
                              }
                              if (e.key === 'Escape') {
                                setEditingContact(null);
                              }
                            }}
                          />
                        ) : (
                          <div className="text-sm text-gray-600">{contact.value}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(contactId, contact.type)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Save"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setEditingContact(null)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            title="Cancel"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(contactId, contact.value)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(contactId)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};