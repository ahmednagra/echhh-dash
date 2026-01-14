// src/components/dashboard/campaign-funnel/outreach/selected-manually/AvgViewsPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface AvgViewsPopupProps {
  influencer: any | null;
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onUpdate: (influencerId: string, views: number | null) => void;
  currentViews?: number | null;
}

const AvgViewsPopup: React.FC<AvgViewsPopupProps> = ({
  influencer,
  isOpen,
  onClose,
  position,
  onUpdate,
  currentViews
}) => {
  const [views, setViews] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize views when popup opens
  useEffect(() => {
    if (isOpen && influencer) {
      const currentViewsValue = currentViews || influencer.social_account?.additional_metrics?.average_views || 0;
      setViews(currentViewsValue?.toString() || '');
      setError(null);
    }
  }, [isOpen, influencer, currentViews]);

  // Handle clicks outside popup to close it
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const popup = document.getElementById(`views-popup-${influencer?.id}`);
      if (popup && !popup.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, influencer?.id, onClose]);

  const handleSubmit = async () => {
    if (!influencer) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const viewsNumber = views === '' ? null : parseInt(views, 10);
      
      if (views !== '' && (isNaN(viewsNumber!) || viewsNumber! < 0)) {
        setError('Please enter a valid number (0 or greater)');
        return;
      }

      await onUpdate(influencer.id, viewsNumber);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update views');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers only
    if (value === '' || /^\d+$/.test(value)) {
      setViews(value);
      setError(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (!isOpen || !influencer) return null;

  return (
    <>
      <div
        id={`views-popup-${influencer.id}`}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translateX(-100%)',
          zIndex: 1000,
          animation: 'slideUp 0.2s ease-out',
        }}
      >
        <div
          style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            padding: '16px',
            width: '320px',
            backdropFilter: 'blur(8px)',
            maxHeight: '90vh',
            overflow: 'auto'
          }}
        >
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '12px',
            paddingBottom: '8px',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <div>
                <h3 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  margin: '0',
                  color: '#1f2937'
                }}>
                  Update Average Views
                </h3>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#6b7280', 
                  margin: '0' 
                }}>
                  {influencer.social_account?.full_name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#6b7280';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Current Views Display */}
          {(currentViews !== null && currentViews !== undefined) && (
            <div style={{
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              padding: '8px 12px',
              borderRadius: '8px',
              marginBottom: '12px',
              border: '1px solid #b3e5fc'
            }}>
              <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '500', marginBottom: '2px' }}>
                Current Average Views
              </div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#0c4a6e' }}>
                {formatNumber(currentViews)} views
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '8px 12px',
              marginBottom: '12px'
            }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Input Field */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '6px'
            }}>
              Average Views *
            </label>
            <input
              type="text"
              value={views}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter average views (e.g., 50000)"
              autoFocus
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${error ? '#fca5a5' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.2s ease',
                background: error ? '#fef2f2' : 'white',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }
              }}
            />
            <div style={{ 
              fontSize: '10px', 
              color: '#6b7280', 
              marginTop: '4px' 
            }}>
              Leave empty to clear current value
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                background: isSubmitting ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                flex: 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isSubmitting && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ animation: 'spin 1s linear infinite' }}
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              )}
              {isSubmitting ? 'Updating...' : 'Update Views'}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                background: '#6b7280',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '12px',
                fontWeight: '500',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#4b5563';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = '#6b7280';
                }
              }}
            >
              Cancel
            </button>
          </div>
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
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
};

export default AvgViewsPopup;