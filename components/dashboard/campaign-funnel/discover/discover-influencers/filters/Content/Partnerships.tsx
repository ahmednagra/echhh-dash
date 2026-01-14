// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Content/Partnerships.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IoBusinessOutline, IoClose, IoInformationCircleOutline } from 'react-icons/io5';
import FilterComponent from '../FilterComponent';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';

interface PartnershipsProps {
  filters: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCloseFilter: () => void;
            // ADD THIS LINE - Color theme prop
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
  // Add context update handler
  onUpdateContext?: (updates: {
    selectedBrands?: string[];
  }) => void;
}

interface ProcessedBrand {
  id: string;
  name: string;
  searchable: string;
}

interface ApiResponse {
  success: boolean;
  data: ProcessedBrand[];
  total: number;
  query: string | null;
  cached: boolean;
}

const Partnerships: React.FC<PartnershipsProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onToggle,
  onCloseFilter,
  onUpdateContext,
  colorTheme = 'purple' // ADD THIS LINE - Default value
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    filters.brand_sponsors || []
  );
  const [brands, setBrands] = useState<ProcessedBrand[]>([]);
  const [availableBrands, setAvailableBrands] = useState<ProcessedBrand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Initialize with existing filters
  useEffect(() => {
    if (filters.brand_sponsors) {
      const areArraysDifferent =
        filters.brand_sponsors.length !== selectedBrands.length ||
        filters.brand_sponsors.some(brand => !selectedBrands.includes(brand));

      if (areArraysDifferent) {
        setSelectedBrands(filters.brand_sponsors);
      }
    }
  }, [filters.brand_sponsors]);

  // Update context when brands change
  useEffect(() => {
    if (onUpdateContext) {
      onUpdateContext({
        selectedBrands: selectedBrands
      });
    }
  }, [selectedBrands, onUpdateContext]);

  // Fetch all brands once when component opens
  const fetchAllBrands = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = '/api/v0/discover/brands';

      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error('Failed to fetch brands');
      }

      console.log(`✅ Fetched all ${data.data.length} brands (cached: ${data.cached})`);

      const fetchedBrands = data.data || [];
      setAvailableBrands(fetchedBrands);
      setBrands(fetchedBrands);

    } catch (error) {
      console.error('❌ Error fetching all brands:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch brands';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all brands when component opens
  useEffect(() => {
    if (isOpen && availableBrands.length === 0) {
      fetchAllBrands();
    }
  }, [isOpen, availableBrands.length, fetchAllBrands]);

  // Local filtering for brands (no API calls)
  useEffect(() => {
    if (availableBrands.length === 0) return;

    if (searchQuery.length === 0) {
      setBrands(availableBrands);
    } else {
      const filtered = availableBrands.filter(brand =>
        brand.searchable.toLowerCase().includes(searchQuery.toLowerCase()) ||
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setBrands(filtered);
    }
  }, [searchQuery, availableBrands]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const toggleBrand = (brandName: string) => {
    const isSelected = selectedBrands.includes(brandName);
    
    let updatedBrands: string[];
    
    if (isSelected) {
      updatedBrands = selectedBrands.filter(brand => brand !== brandName);
    } else {
      updatedBrands = [...selectedBrands, brandName];
    }
    
    setSelectedBrands(updatedBrands);
    onFilterChange({ brand_sponsors: updatedBrands.length > 0 ? updatedBrands : undefined });
  };

  const removeBrand = (brandToRemove: string) => {
    const newBrands = selectedBrands.filter(brand => brand !== brandToRemove);
    setSelectedBrands(newBrands);
    onFilterChange({ brand_sponsors: newBrands.length > 0 ? newBrands : undefined });
  };

  // Clear search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setBrands([]);
      setError(null);
      setShowTooltip(false);
    }
  }, [isOpen]);

  return (
    <FilterComponent
      hasActiveFilters={selectedBrands.length > 0 || searchQuery.length > 0}
      icon={<IoBusinessOutline size={18} />}
      title="Partnerships"
      isOpen={isOpen}
      onClose={onCloseFilter}
      onToggle={onToggle}
      className=""
      selectedCount={selectedBrands.length}
      colorTheme={colorTheme}
    >
      <div className="space-y-3 relative" ref={dropdownRef}>
        
        {/* Header with Tooltip */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-600">Brand Partnerships</h4>
            
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
                      Filter creators who have been sponsored by certain brands. Only for Instagram creators.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search brand or company..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-300"
          />
          {isLoading && availableBrands.length === 0 && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-xs text-red-600 px-2 py-1 bg-red-50 rounded border border-red-200">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="max-h-48 overflow-y-auto">
          {searchQuery.length >= 1 && !error && (
            <div className="space-y-1">
              {isLoading && availableBrands.length === 0 ? (
                <div className="text-xs text-gray-500 px-2 py-1 text-center">
                  Loading brands...
                </div>
              ) : brands.length > 0 ? (
                brands
                  .filter(brand => !selectedBrands.includes(brand.name))
                  .slice(0, 10)
                  .map((brand) => (
                    <label 
                      key={brand.id} 
                      className="flex items-center p-2 hover:bg-purple-50 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.name)}
                        onChange={() => toggleBrand(brand.name)}
                        className="form-checkbox h-4 w-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                      />
                      <div className="ml-2 text-sm text-gray-700 flex-1">
                        <div className="font-medium text-gray-900 truncate">
                          {brand.name}
                        </div>
                      </div>
                    </label>
                  ))
              ) : (
                <div className="text-xs text-gray-500 px-2 py-1 text-center">
                  No brands found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Selected Brands */}
        {selectedBrands.length > 0 && (
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-xs font-medium text-gray-600 mb-2">
              Selected Brands ({selectedBrands.length}):
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <span 
                  key={brand} 
                  className="inline-flex items-center text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full"
                >
                  <span className="max-w-32 truncate" title={brand}>
                    {brand}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBrand(brand);
                    }}
                    className="ml-2 text-purple-600 hover:text-purple-800 flex-shrink-0"
                    title="Remove brand"
                  >
                    <IoClose size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Loading State - Only show during initial load */}
        {isLoading && availableBrands.length === 0 && (
          <div className="text-center py-6">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 animate-pulse">
              <IoBusinessOutline className="w-4 h-4 text-gray-600" />
            </div>
            <div className="text-sm text-gray-600">Loading all brands...</div>
          </div>
        )}

        {/* Error State */}
        {error && availableBrands.length === 0 && (
          <div className="text-center py-6">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <IoClose className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-sm text-red-600 font-medium">Failed to load brands</div>
            <button
              onClick={() => fetchAllBrands()}
              className="text-xs text-red-500 hover:text-red-700 mt-1"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </FilterComponent>
  );
};

export default Partnerships;