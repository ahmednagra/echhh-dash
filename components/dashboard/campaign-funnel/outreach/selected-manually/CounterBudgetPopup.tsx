// src/components/dashboard/campaign-funnel/outreach/selected-manually/CounterBudgetPopup.tsx
'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Search, X, ChevronDown } from 'react-feather';
import { PriceNegotiationClientService } from '@/services/price-negotiation';
import { 
  PriceNegotiation, 
  GetPriceNegotiationsParams,
  CreateCounterOfferRequest 
} from '@/types/price-negotiation';

interface CounterBudgetPopupProps {
  influencer: any | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (influencerId: string, amount: number | null, currency: string) => void;
  position: { x: number; y: number };
  currentBudget: { amount: number | null; currency: string } | null;
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

export default function CounterBudgetPopup({ 
  influencer, 
  isOpen, 
  onClose,
  onUpdate,
  position,
  currentBudget
}: CounterBudgetPopupProps) {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  
  // Currency dropdown states
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [currencySearch, setCurrencySearch] = useState('');
  
  // API-related states
  const [negotiations, setNegotiations] = useState<PriceNegotiation[]>([]);
  const [isLoadingNegotiations, setIsLoadingNegotiations] = useState(false);
  const [negotiationsError, setNegotiationsError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    if (isOpen && influencer) {
      setPrice('0');
      setCurrency('USD');
      setNotes('');
      setShowCounterForm(false);
      setNegotiationsError(null);
      setCurrencySearch('');
      setShowCurrencyDropdown(false);
      
      // Initialize with existing price_negotiations from influencer object, sorted by round_number DESC
      if (influencer.price_negotiations && influencer.price_negotiations.length > 0) {
        const sortedNegotiations = [...influencer.price_negotiations].sort((a, b) => b.round_number - a.round_number);
        setNegotiations(sortedNegotiations);
      } else {
        setNegotiations([]);
      }
      
      // Load latest negotiations from API
      loadNegotiations();
    }
  }, [isOpen, influencer, currentBudget]);

  /**
   * Filter currencies based on search
   */
  const filteredCurrencies = CURRENCY_OPTIONS.filter(curr => 
    curr.code.toLowerCase().includes(currencySearch.toLowerCase()) ||
    curr.name.toLowerCase().includes(currencySearch.toLowerCase())
  );

  /**
   * Get popular currencies first, then others
   */
  const sortedCurrencies = [
    ...filteredCurrencies.filter(c => c.popular),
    ...filteredCurrencies.filter(c => !c.popular)
  ];

  /**
   * Load price negotiations for the current influencer from API
   */
  const loadNegotiations = async () => {
    if (!influencer?.id) return;

    setIsLoadingNegotiations(true);
    setNegotiationsError(null);

    try {
      const params: GetPriceNegotiationsParams = {
        campaign_influencer_id: influencer.id,
        page: 1,
        size: 50
      };

      const response = await PriceNegotiationClientService.getPriceNegotiations(params);
      
      // Sort negotiations by round_number in descending order (Round 4, 3, 2, 1)
      const sortedNegotiations = response.negotiations.sort((a, b) => b.round_number - a.round_number);
      setNegotiations(sortedNegotiations);
      
      console.log('Loaded negotiations:', sortedNegotiations);
    } catch (error) {
      console.error('Failed to load negotiations:', error);
      setNegotiationsError(error instanceof Error ? error.message : 'Failed to load negotiations');
    } finally {
      setIsLoadingNegotiations(false);
    }
  };

  /**
   * Accept the latest pending negotiation
   */
  const acceptOffer = async () => {
    const latestNegotiation = negotiations.find(n => n.status.name === 'pending');
    if (!latestNegotiation) {
      const sortedByDate = [...negotiations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latest = sortedByDate[0];
      
      if (!latest) {
        alert('No negotiations found to accept');
        return;
      }
      
      alert(`No pending offer found. Latest offer: ${latest.proposed_price} ${latest.currency} (${latest.status.name})`);
      return;
    }

    setIsAccepting(true);
    try {
      await PriceNegotiationClientService.acceptNegotiation(latestNegotiation.id);
      alert(`Accepting offer for ${latestNegotiation.proposed_price} ${latestNegotiation.currency}`);
      
      await loadNegotiations();
      onUpdate(influencer.id, latestNegotiation.proposed_price, latestNegotiation.currency);
    } catch (error) {
      console.error('Failed to accept offer:', error);
      alert('Failed to accept offer. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  /**
   * Reject the latest pending negotiation
   */
  const rejectOffer = async () => {
    const latestNegotiation = negotiations.find(n => n.status.name === 'pending');
    if (!latestNegotiation) {
      const sortedByDate = [...negotiations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latest = sortedByDate[0];
      
      if (!latest) {
        alert('No negotiations found to reject');
        return;
      }
      
      alert(`No pending offer found. Latest offer: ${latest.proposed_price} ${latest.currency} (${latest.status.name})`);
      return;
    }

    setIsRejecting(true);
    try {
      await PriceNegotiationClientService.rejectNegotiation(latestNegotiation.id);
      alert('Offer rejected');
      await loadNegotiations();
    } catch (error) {
      console.error('Failed to reject offer:', error);
      alert('Failed to reject offer. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  /**
   * Submit a counter offer
   */
  const submitCounter = async () => {
    if (!price || !currency || !influencer) {
      alert('Please enter a valid price and currency');
      return;
    }

    const latestNegotiation = negotiations.find(n => n.status.name === 'pending');
    if (!latestNegotiation) {
      if (negotiations.length === 0) {
        alert('No negotiations found. Cannot submit counter offer.');
        return;
      }
      
      const sortedByDate = [...negotiations].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const latest = sortedByDate[0];
      
      alert(`No pending negotiation found. Latest negotiation status: ${latest.status.name}. Counter offer may not be processed correctly.`);
    }

    setIsSubmitting(true);
    try {
      const targetNegotiation = latestNegotiation || negotiations[0];
      const counterOfferData: CreateCounterOfferRequest = {
        counter_price: parseFloat(price),
        currency: currency,
        notes: notes || undefined
      };

      await PriceNegotiationClientService.createCounterOffer(targetNegotiation.id, counterOfferData);
      
      setShowCounterForm(false);
      setPrice('0');
      setNotes('');
      await loadNegotiations();
      onUpdate(influencer.id, parseFloat(price), currency);
    } catch (error) {
      console.error('Failed to submit counter offer:', error);
      alert('Failed to submit counter offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Format negotiation data for display
   */
  const formatNegotiationForDisplay = (negotiation: PriceNegotiation, index: number) => {
    const isClient = negotiation.proposed_by_type === 'client';
    const timeAgo = getTimeAgo(negotiation.created_at);
    
    let title = '';
    if (negotiation.round_number === 1) {
      title = isClient ? 'Client Initial Offer' : 'Influencer Offer';
    } else {
      title = isClient ? 'Client Counter' : 'Influencer Counter';
    }
    
    return {
      id: negotiation.id,
      type: negotiation.proposed_by_type,
      title: title,
      round: `R${negotiation.round_number}`,
      time: timeAgo,
      price: `${negotiation.proposed_price} ${negotiation.currency}`,
      status: negotiation.status.name,
      notes: negotiation.notes,
      avatar: isClient ? 'C' : 'I',
      priceClass: `price-${negotiation.status.name}`,
      proposedBy: negotiation.proposed_by_user?.full_name || 'Unknown',
      respondedBy: negotiation.responded_by_user?.full_name || null
    };
  };

  /**
   * Helper function to get time ago string
   */
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    return `${diffInDays} days ago`;
  };

  /**
   * Get display data - all negotiations including initial collaboration price
   */
  const getDisplayData = () => {
    const displayItems: any[] = [];
    
    const hasRound1 = negotiations.some(n => n.round_number === 1);
    if (!hasRound1 && influencer?.collaboration_price) {
      displayItems.push({
        id: 'initial-collaboration-price',
        type: 'influencer',
        title: 'Influencer Initial Price',
        round: 'R0',
        time: 'Initial offer',
        price: `${influencer.collaboration_price} USD`,
        status: 'initial',
        notes: 'Initial collaboration price set by influencer',
        avatar: 'I',
        proposedBy: influencer.social_account?.full_name || 'Influencer',
        respondedBy: null
      });
    }
    
    if (negotiations.length > 0) {
      const sortedNegotiations = [...negotiations].sort((a, b) => b.round_number - a.round_number);
      const formattedNegotiations = sortedNegotiations.map(formatNegotiationForDisplay);
      displayItems.push(...formattedNegotiations);
    }
    
    return displayItems;
  };

  if (!isOpen || !influencer) return null;

  const displayNegotiations = getDisplayData();

  return (
    <>
      {/* Fixed overlay */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ background: 'rgba(0, 0, 0, 0.5)' }}
      />
      
      {/* Popup positioned exactly where clicked */}
      <div 
        className="absolute z-50 bg-white rounded-lg shadow-2xl overflow-hidden"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-100%)',
          width: '370px',
          maxHeight: '85vh',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Header with Influencer Info */}
        <div className="flex items-center justify-between" style={{ 
          padding: '12px 16px 8px',
          borderBottom: '1px solid #eee'
        }}>
          <div className="flex items-center space-x-2">
            <img
              src={
                influencer.social_account?.profile_pic_url || 
                influencer.social_account?.additional_metrics?.profileImage ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.social_account?.full_name || 'Unknown')}&background=6366f1&color=fff&size=24`
              }
              alt={influencer.social_account?.full_name || 'Unknown'}
              className="w-6 h-6 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(influencer.social_account?.full_name || 'Unknown')}&background=6366f1&color=fff&size=24`;
              }}
            />
            <div>
              <h3 style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                margin: '0',
                lineHeight: '1.2'
              }}>
                {influencer.social_account?.full_name || 'Unknown'}
              </h3>
              <p style={{
                fontSize: '12px',
                color: '#666',
                margin: '0',
                lineHeight: '1.2'
              }}>
                Price Negotiation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              color: '#666',
              cursor: 'pointer',
              padding: '0',
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#f5f5f5'}
            onMouseLeave={(e) => (e.target as HTMLElement).style.background = 'none'}
          >
            ×
          </button>
        </div>

        {/* Error message */}
        {negotiationsError && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            padding: '8px',
            margin: '0 16px 12px',
            fontSize: '10px',
            color: '#dc2626'
          }}>
            {negotiationsError}
          </div>
        )}

        {/* Loading state */}
        {isLoadingNegotiations && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#666'
          }}>
            Loading negotiations...
          </div>
        )}

        {/* Negotiation timeline */}
        {!isLoadingNegotiations && (
          <div style={{ maxHeight: '280px', overflowY: 'auto', padding: '0' }}>
            <div style={{ padding: '8px 16px' }}>
              {displayNegotiations.length === 0 ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  No negotiations found
                </div>
              ) : (
                displayNegotiations.map((round, index) => (
                  <div 
                    key={round.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      marginBottom: index === displayNegotiations.length - 1 ? '0' : '16px',
                      position: 'relative'
                    }}
                  >
                    {/* Timeline line */}
                    {index !== displayNegotiations.length - 1 && (
                      <div style={{
                        content: '',
                        position: 'absolute',
                        left: '15px',
                        top: '30px',
                        bottom: '-16px',
                        width: '1px',
                        background: '#e5e5e5'
                      }} />
                    )}
                    
                    {/* Avatar */}
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '12px',
                      marginRight: '12px',
                      color: 'white',
                      position: 'relative',
                      zIndex: 1,
                      background: round.type === 'client' 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    }}>
                      {round.avatar}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{
                              fontWeight: '600',
                              color: '#1a1a1a',
                              fontSize: '13px'
                            }}>
                              {round.title}
                            </span>
                            <span style={{
                              background: '#f0f0f0',
                              color: '#666',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: '500'
                            }}>
                              {round.round}
                            </span>
                          </div>
                          
                          {/* Price */}
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '700',
                            color: round.status === 'pending' ? '#2563eb' : 
                                   round.status === 'accepted' ? '#059669' :
                                   round.status === 'rejected' ? '#dc2626' : 
                                   round.status === 'countered' ? '#d97706' : 
                                   round.status === 'initial' ? '#6b7280' : '#059669',
                            textDecoration: round.status === 'rejected' ? 'line-through' : 'none',
                            marginBottom: '2px'
                          }}>
                            {round.price}
                          </div>

                          {/* Notes */}
                          {round.notes && round.notes !== 'Initial collaboration price set by influencer' && (
                            <div style={{
                              fontSize: '11px',
                              color: '#666',
                              lineHeight: '1.4',
                              fontStyle: 'italic'
                            }}>
                              {round.notes}
                            </div>
                          )}
                        </div>

                        {/* Status badge on the right */}
                        <div style={{ marginLeft: '8px', textAlign: 'right' }}>
                          <div style={{
                            fontSize: '9px',
                            color: '#888',
                            marginBottom: '4px'
                          }}>
                            {round.time}
                          </div>
                          
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontSize: '9px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            background: round.status === 'pending' ? '#dbeafe' :
                                      round.status === 'accepted' ? '#d1fae5' :
                                      round.status === 'rejected' ? '#fee2e2' :
                                      round.status === 'countered' ? '#fef3c7' : 
                                      round.status === 'initial' ? '#f3f4f6' : '#f3f4f6',
                            color: round.status === 'pending' ? '#1d4ed8' :
                                   round.status === 'accepted' ? '#047857' :
                                   round.status === 'rejected' ? '#b91c1c' :
                                   round.status === 'countered' ? '#92400e' :
                                   round.status === 'initial' ? '#374151' : '#374151'
                          }}>
                            {round.status === 'initial' ? 'INITIAL' : round.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Action section */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #eee',
          background: '#fafafa'
        }}>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
            <button
              onClick={acceptOffer}
              disabled={isAccepting}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1,
                background: isAccepting ? '#9ca3af' : '#059669',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isAccepting) {
                  (e.target as HTMLElement).style.background = '#047857';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAccepting) (e.target as HTMLElement).style.background = '#059669';
              }}
            >
              {isAccepting ? 'Accepting...' : (() => {
                const pendingNegotiation = negotiations.find(n => n.status.name === 'pending');
                return pendingNegotiation ? `Accept ${pendingNegotiation.proposed_price}` : 'Accept';
              })()}
            </button>
            <button
              onClick={rejectOffer}
              disabled={isRejecting}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1,
                background: isRejecting ? '#9ca3af' : '#dc2626',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isRejecting) {
                  (e.target as HTMLElement).style.background = '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRejecting) (e.target as HTMLElement).style.background = '#dc2626';
              }}
            >
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </button>
            <button
              onClick={() => setShowCounterForm(!showCounterForm)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: 'none',
                fontSize: '10px',
                fontWeight: '500',
                cursor: 'pointer',
                flex: 1,
                background: '#2563eb',
                color: 'white',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = '#1d4ed8'}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = '#2563eb'}
            >
              Counter Offer
            </button>
          </div>

          {/* Counter form */}
          {showCounterForm && (
            <div style={{
              marginTop: '8px',
              padding: '10px',
              background: 'white',
              borderRadius: '6px',
              border: '1px solid #e5e5e5'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '3px'
                }}>
                  Counter Offer Amount
                </label>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {/* Smart Currency Dropdown */}
                  <div style={{ position: 'relative', width: '90px' }}>
                    <button
                      onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '10px',
                        background: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{currency}</span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                    
                    {showCurrencyDropdown && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 100,
                        background: 'white',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                      }}>
                        {/* Search input */}
                        <div style={{ padding: '4px' }}>
                          <div style={{ position: 'relative' }}>
                            <Search className="w-3 h-3 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search..."
                              value={currencySearch}
                              onChange={(e) => setCurrencySearch(e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 4px 4px 20px',
                                border: '1px solid #d1d5db',
                                borderRadius: '3px',
                                fontSize: '10px'
                              }}
                            />
                          </div>
                        </div>
                        
                        {/* Popular currencies header */}
                        {currencySearch === '' && (
                          <div style={{
                            padding: '4px 8px',
                            fontSize: '9px',
                            fontWeight: '600',
                            color: '#6b7280',
                            borderBottom: '1px solid #f3f4f6'
                          }}>
                            Popular
                          </div>
                        )}
                        
                        {/* Currency options */}
                        {sortedCurrencies.map((curr, index) => {
                          const isPopularSection = index === 0 || (sortedCurrencies[index - 1]?.popular && !curr.popular);
                          return (
                            <div key={curr.code}>
                              {isPopularSection && currencySearch === '' && curr.popular === false && (
                                <div style={{
                                  padding: '4px 8px',
                                  fontSize: '9px',
                                  fontWeight: '600',
                                  color: '#6b7280',
                                  borderTop: '1px solid #f3f4f6',
                                  borderBottom: '1px solid #f3f4f6'
                                }}>
                                  Others
                                </div>
                              )}
                              <button
                                onClick={() => {
                                  setCurrency(curr.code);
                                  setShowCurrencyDropdown(false);
                                  setCurrencySearch('');
                                }}
                                style={{
                                  width: '100%',
                                  padding: '4px 8px',
                                  border: 'none',
                                  background: currency === curr.code ? '#f3f4f6' : 'transparent',
                                  textAlign: 'left',
                                  fontSize: '10px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}
                                onMouseEnter={(e) => {
                                  if (currency !== curr.code) {
                                    (e.target as HTMLElement).style.background = '#f9fafb';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (currency !== curr.code) {
                                    (e.target as HTMLElement).style.background = 'transparent';
                                  }
                                }}
                              >
                                <span style={{ fontWeight: '500' }}>{curr.symbol}</span>
                                <span>{curr.code}</span>
                                {/* <span style={{ color: '#6b7280', fontSize: '9px' }}>{curr.name}</span> */}
                              </button>
                            </div>
                          );
                        })}
                        
                        {sortedCurrencies.length === 0 && (
                          <div style={{
                            padding: '8px',
                            fontSize: '10px',
                            color: '#6b7280',
                            textAlign: 'center'
                          }}>
                            No currencies found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    style={{
                      flex: 1,
                      padding: '4px 6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = 'none';
                      e.target.style.borderColor = '#2563eb';
                      e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#d1d5db';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
              
              <div style={{ marginBottom: '8px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '9px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '3px'
                }}>
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Add a note to explain your counter offer..."
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '10px',
                    boxSizing: 'border-box',
                    resize: 'none'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#2563eb';
                    e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={submitCounter}
                  disabled={isSubmitting}
                  style={{
                    background: isSubmitting ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '10px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Counter'}
                </button>
                <button
                  onClick={() => setShowCounterForm(false)}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    padding: '6px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '10px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    flex: 1
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from { 
            transform: translateX(-100%) translateY(10px); 
            opacity: 0; 
          }
          to { 
            transform: translateX(-100%) translateY(0); 
            opacity: 1; 
          }
        }
      `}</style>
    </>
  );
}