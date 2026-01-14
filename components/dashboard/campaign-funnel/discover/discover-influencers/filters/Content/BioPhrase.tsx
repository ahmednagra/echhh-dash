import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Info } from 'lucide-react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface BioPhraseProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
          // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

const BioPhrase: React.FC<BioPhraseProps> = ({ 
  filters, 
  onFilterChange, 
  isOpen, 
  onToggle,
  onCloseFilter,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestedPhrases, setSuggestedPhrases] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filter value
  useEffect(() => {
    if (filters.bio_phrase !== undefined) {
      setInputValue(filters.bio_phrase || '');
    }
  }, [filters.bio_phrase]);

  // Popular bio phrases - common phrases used in influencer bios
  const popularPhrases = [
    "content creator",
    "lifestyle blogger", 
    "fitness enthusiast",
    "foodie",
    "traveler",
    "entrepreneur",
    "photographer",
    "artist",
    "influencer",
    "blogger",
    "creative",
    "designer",
    "model",
    "coach",
    "consultant",
    "speaker",
    "writer",
    "musician",
    "gamer",
    "tech lover",
    "fashion lover",
    "beauty guru",
    "mom blogger",
    "dog lover",
    "cat mom",
    "plant parent",
    "bookworm",
    "coffee addict",
    "wanderlust",
    "dreamer",
    "achiever"
  ];

  // Update suggested phrases based on input
  useEffect(() => {
    if (inputValue.trim() && inputValue.length > 1) {
      const filtered = popularPhrases.filter(phrase =>
        phrase.toLowerCase().includes(inputValue.toLowerCase())
      );
      setSuggestedPhrases(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestedPhrases([]);
      setShowSuggestions(false);
    }
  }, [inputValue]);

  // Close suggestions and tooltip when main dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setShowSuggestions(false);
      setShowTooltip(false);
    }
  }, [isOpen]);

  // Handle ESC key to close suggestions
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSuggestions(false);
        inputRef.current?.blur();
      }
    };

    if (showSuggestions) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Don't update filter while typing, only when Enter is pressed or phrase is selected
  };

  // Handle Enter key press to add phrase
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmedValue = inputValue.trim();
      if (trimmedValue) {
        // Add the phrase directly to filters
        onFilterChange({ bio_phrase: trimmedValue });
        setShowSuggestions(false);
        // Keep the input value to show what was added
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handlePhraseSelect = (phrase: string) => {
    setInputValue(phrase);
    setShowSuggestions(false);
    onFilterChange({ bio_phrase: phrase });
    inputRef.current?.blur();
  };

  const handleClearPhrase = () => {
    setInputValue('');
    setShowSuggestions(false);
    onFilterChange({ bio_phrase: undefined });
  };

  const handleInputFocus = () => {
    if (inputValue.trim() && inputValue.length > 1) {
      setShowSuggestions(true);
    }
  };

  return (
    <FilterComponent 
      icon={<MessageSquare size={16} />} 
      title="Bio Phrase"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=""
      hasActiveFilters={!!filters.bio_phrase}
      colorTheme={colorTheme} // ADD THIS LINE - Pass the color theme'
    >
      <div className="space-y-3">
        {/* Header with tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <h3 className="text-sm font-semibold text-gray-800">Bio Phrase Search</h3>
            
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
                      Filter creators by the phrase they use in their bio.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              placeholder="Enter bio phrase..."
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300 pr-8"
            />
            
            {/* Clear button */}
            {inputValue && (
              <button
                onClick={handleClearPhrase}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                ×
              </button>
            )}
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestedPhrases.length > 0 && (
            <div 
              ref={suggestionsRef}
              className="absolute z-20 w-full mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg"
            >
              {/* Add current input as first option if it's not empty and not in suggestions */}
              {inputValue.trim() && !suggestedPhrases.some(phrase => phrase.toLowerCase() === inputValue.trim().toLowerCase()) && (
                <div
                  className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm border-b border-gray-100 bg-green-25"
                  onClick={() => handlePhraseSelect(inputValue.trim())}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-xs">✓ Add:</span>
                    <span className="text-gray-800 font-medium">"{inputValue.trim()}"</span>
                  </div>
                </div>
              )}
              
              {suggestedPhrases.slice(0, 10).map((phrase, index) => (
                <div
                  key={`${phrase}-${index}`}
                  className="px-3 py-2 hover:bg-purple-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                  onClick={() => handlePhraseSelect(phrase)}
                >
                  <span className="text-gray-800">{phrase}</span>
                </div>
              ))}
              
              {suggestedPhrases.length > 10 && (
                <div className="px-3 py-2 text-xs text-gray-500 italic">
                  And {suggestedPhrases.length - 10} more...
                </div>
              )}
            </div>
          )}

          {/* Show "Add custom phrase" option when no suggestions but has input */}
          {showSuggestions && suggestedPhrases.length === 0 && inputValue.trim() && (
            <div 
              ref={suggestionsRef}
              className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
            >
              <div
                className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm bg-green-25"
                onClick={() => handlePhraseSelect(inputValue.trim())}
              >
                <div className="flex items-center gap-2">
                  <span className="text-green-600 text-xs">✓ Add custom:</span>
                  <span className="text-gray-800 font-medium">"{inputValue.trim()}"</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Current selection display */}
        {filters.bio_phrase && (
          <div className="mt-3 p-2 bg-purple-50 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">
                <strong>Selected:</strong> "{filters.bio_phrase}"
              </span>
              <button
                onClick={handleClearPhrase}
                className="text-purple-600 hover:text-purple-800 text-xs"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default BioPhrase;