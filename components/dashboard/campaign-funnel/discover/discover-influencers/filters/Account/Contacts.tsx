// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Account/Contacts.tsx
import React, { useState, useEffect, useRef } from 'react';
import { IoMailOutline, IoInformationCircleOutline, IoClose, IoChevronDown } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter, SpecificContactDetail, ContactDetailType, ContactPreference } from '@/lib/creator-discovery-types';

interface ContactsProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
  // Add context update handler
  onUpdateContext?: (updates: {
    selectedContacts?: SpecificContactDetail[];
  }) => void;
}

// All available contact types based on the API specification
const CONTACT_TYPES: ContactDetailType[] = [
  'BBM', 'EMAIL', 'FACEBOOK', 'INSTAGRAM', 'ITUNES', 'KAKAO',
  'KIK', 'LINED', 'LINKTREE', 'PHONE', 'PINTEREST', 'SARAHAH',
  'SAYAT', 'SKYPE', 'SNAPCHAT', 'TELEGRAM', 'TIKTOK', 'TUMBLR',
  'TWITCHTV', 'TWITTER', 'VIBER', 'VK', 'WECHAT', 'WEIBO',
  'WHATSAPP', 'YOUTUBE'
];

// Popular contact types for quick selection (most commonly used)
const POPULAR_CONTACTS: ContactDetailType[] = [
  'EMAIL', 'INSTAGRAM', 'PHONE', 'WHATSAPP', 'TWITTER', 'YOUTUBE', 'TIKTOK'
];

const PREFERENCE_OPTIONS: { value: ContactPreference; label: string }[] = [
  { value: 'MUST_HAVE', label: 'Must Have' },
  { value: 'SHOULD_HAVE', label: 'Should Have' }
];

const Contacts: React.FC<ContactsProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  onUpdateContext
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<SpecificContactDetail[]>(
    filters.specific_contact_details || []
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const [showAllContacts, setShowAllContacts] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const incoming = filters.specific_contact_details || [];
    const areDifferent =
      incoming.length !== selectedContacts.length ||
      incoming.some(contact => 
        !selectedContacts.find(selected => 
          selected.type === contact.type && selected.preference === contact.preference
        )
      );

    if (areDifferent) {
      setSelectedContacts(incoming);
    }
  }, [filters.specific_contact_details]);

  // Update context when contacts change
  useEffect(() => {
    if (onUpdateContext) {
      onUpdateContext({
        selectedContacts: selectedContacts
      });
    }
  }, [selectedContacts, onUpdateContext]);

  // Handle clicks outside dropdown and tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter contacts based on search query
  const filteredContacts = CONTACT_TYPES.filter(contact =>
    contact.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedContacts.some(selected => selected.type === contact)
  );

  // Get available contacts (not yet selected)
  const availableContacts = CONTACT_TYPES.filter(contact =>
    !selectedContacts.some(selected => selected.type === contact)
  );

  // Get available popular contacts
  const availablePopularContacts = POPULAR_CONTACTS.filter(contact =>
    !selectedContacts.some(selected => selected.type === contact)
  );

  // Format contact type for display
  const formatContactType = (type: ContactDetailType): string => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  const handleContactSelect = (contactType: ContactDetailType) => {
    if (selectedContacts.some(contact => contact.type === contactType)) {
      return; // Already selected
    }

    const newContact: SpecificContactDetail = {
      type: contactType,
      preference: 'SHOULD_HAVE' // Default preference
    };

    const updated = [...selectedContacts, newContact];
    setSelectedContacts(updated);
    onFilterChange({ specific_contact_details: updated.length > 0 ? updated : undefined });
    setSearchQuery(''); // Clear search after selection
  };

  const handlePreferenceChange = (contactType: ContactDetailType, newPreference: ContactPreference) => {
    const updated = selectedContacts.map(contact =>
      contact.type === contactType 
        ? { ...contact, preference: newPreference }
        : contact
    );
    setSelectedContacts(updated);
    onFilterChange({ specific_contact_details: updated });
  };

  const handleRemoveContact = (contactType: ContactDetailType) => {
    const updated = selectedContacts.filter(contact => contact.type !== contactType);
    setSelectedContacts(updated);
    onFilterChange({ specific_contact_details: updated.length > 0 ? updated : undefined });
  };

  // Preference dropdown component
  const PreferenceDropdown: React.FC<{
    value: ContactPreference;
    onChange: (value: ContactPreference) => void;
    contactType: ContactDetailType;
  }> = ({ value, onChange, contactType }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = PREFERENCE_OPTIONS.find(opt => opt.value === value);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 transition-colors min-w-[90px]"
        >
          <span className="truncate">{selectedOption?.label}</span>
          <IoChevronDown size={10} className={`transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg min-w-[120px]">
            {PREFERENCE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs text-left hover:bg-purple-50 transition-colors ${
                  value === option.value ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <FilterComponent
      hasActiveFilters={selectedContacts.length > 0}
      icon={<IoMailOutline size={18} />}
      title="Contacts"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=''
      selectedCount={selectedContacts.length}
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        
        {/* Header with Tooltip */}
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-gray-600">Influencer</h4>
          
          {/* Info Icon with Tooltip */}
          <div className="relative" ref={tooltipRef}>
            <button
              type="button"
              className="text-gray-400 hover:text-purple-500 transition-colors"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <IoInformationCircleOutline size={14} />
            </button>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute left-0 top-6 z-[200] w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
                <div className="relative">
                  {/* Tooltip arrow */}
                  <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>
                  
                  {/* Tooltip content */}
                  <div className="leading-relaxed">
                    Filter creators by availability of selected contact.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Popular Contacts - Quick Select (Only show if there are available popular contacts) */}
        {availablePopularContacts.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
            <h5 className="text-xs font-medium text-purple-700 mb-2 flex items-center gap-1">
              <IoMailOutline size={12} />
              Popular Contacts:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {availablePopularContacts.map(type => (
                <button
                  key={type}
                  onClick={() => handleContactSelect(type)}
                  className="px-2.5 py-1.5 text-xs bg-white border border-purple-300 rounded-md hover:bg-purple-100 hover:border-purple-400 transition-colors font-medium text-purple-700"
                >
                  {formatContactType(type)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search for more contact types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-colors"
          />

          {/* Smart Search Dropdown */}
          {searchQuery.length > 0 && (
            <div className="absolute z-50 w-full bg-white shadow-lg rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto max-h-40 mt-1">
              {filteredContacts.length > 0 ? (
                <>
                  <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-b sticky top-0">
                    {filteredContacts.length} contact type(s) found
                  </div>
                  {filteredContacts.slice(0, 10).map((contact) => (
                    <div
                      key={contact}
                      className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm flex items-center transition-colors"
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="font-medium text-gray-900">
                        {formatContactType(contact)}
                      </div>
                    </div>
                  ))}
                  {filteredContacts.length > 10 && (
                    <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50 border-t">
                      +{filteredContacts.length - 10} more results
                    </div>
                  )}
                </>
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No contact types found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expandable Browse All Section */}
        {availableContacts.length > 0 && (
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={() => setShowAllContacts(!showAllContacts)}
              className="flex items-center justify-between w-full text-xs text-gray-600 hover:text-purple-600 transition-colors p-2 hover:bg-gray-50 rounded"
            >
              <span className="flex items-center gap-2">
                <IoMailOutline size={12} />
                Browse all {availableContacts.length} available contact types
              </span>
              <IoChevronDown 
                size={12} 
                className={`transition-transform ${showAllContacts ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {showAllContacts && (
              <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50">
                <div className="grid grid-cols-2 gap-1">
                  {availableContacts.map(type => {
                    const isPopular = POPULAR_CONTACTS.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleContactSelect(type)}
                        className={`p-2 text-xs text-left rounded transition-all border ${
                          isPopular 
                            ? 'bg-purple-100 border-purple-200 hover:bg-purple-200 text-purple-800 font-medium' 
                            : 'bg-white border-gray-200 hover:bg-purple-50 hover:border-purple-200 text-gray-700'
                        }`}
                      >
                        <div className="truncate flex items-center gap-1">
                          {isPopular && <span className="text-purple-500">★</span>}
                          {formatContactType(type)}
                        </div>
                      </button>
                    );
                  })}
                </div>
                
                {/* Legend */}
                <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="text-purple-500">★</span>
                    Popular contacts
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Selected Contacts */}
        {selectedContacts.length > 0 && (
          <div className="space-y-2 border-t border-gray-200 pt-3">
            <h4 className="text-xs font-medium text-gray-600 flex items-center gap-1">
              <IoMailOutline size={12} />
              Selected Contacts ({selectedContacts.length}):
            </h4>
            <div className="space-y-2">
              {selectedContacts.map((contact) => (
                <div 
                  key={contact.type}
                  className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100"
                >
                  <span className="text-sm text-purple-800 font-medium flex-1 flex items-center gap-1">
                    {POPULAR_CONTACTS.includes(contact.type) && (
                      <span className="text-purple-500 text-xs">★</span>
                    )}
                    {formatContactType(contact.type)}
                  </span>
                  <div className="flex items-center gap-2 ml-2">
                    <PreferenceDropdown
                      value={contact.preference}
                      onChange={(newPreference) => handlePreferenceChange(contact.type, newPreference)}
                      contactType={contact.type}
                    />
                    <button
                      onClick={() => handleRemoveContact(contact.type)}
                      className="text-purple-600 hover:text-purple-800 transition-colors p-0.5"
                      title="Remove contact"
                    >
                      <IoClose size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Helper Text */}
        {selectedContacts.length !== 0 && (
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-2">
          <div className="flex items-start gap-2">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Must Have:</strong> Creators must have this contact type</span>
          </div>
          <div className="flex items-start gap-2 mt-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
            <span><strong>Should Have:</strong> Preference for creators with this contact type</span>
          </div>
        </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Contacts;