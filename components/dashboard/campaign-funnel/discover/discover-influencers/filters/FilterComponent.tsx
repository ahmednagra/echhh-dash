// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/FilterComponent.tsx
import React from 'react';
import { IoChevronDownOutline } from 'react-icons/io5';
import { useClickOutside } from '@/hooks/useClickOutside';

interface FilterComponentProps {
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  isOpen?: boolean;
  onToggle: () => void;
  onClose?: () => void;
  className: string;
  hasActiveFilters?: boolean;
  isLoading?: boolean;
  selectedCount?: number;
  // Add color theme prop with default
  colorTheme?: 'blue' | 'emerald' | 'orange' | 'purple';
}

const FilterComponent: React.FC<FilterComponentProps> = ({
  icon,
  title,
  children,
  isOpen = false,
  onToggle,
  onClose,
  className,
  hasActiveFilters = false,
  isLoading = false,
  selectedCount = 0,
  colorTheme = 'purple' // Default to purple for backward compatibility
}) => {
  // Click outside handling
  const filterRef = useClickOutside<HTMLDivElement>(
    () => {
      if (onClose) {
        onClose();
      }
    },
    isOpen
  );

  // Get theme-specific colors
  const getThemeColors = (theme: string) => {
    const colorMap = {
      blue: {
        border: 'border-blue-300',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        icon: 'text-blue-600',
        iconInactive: 'text-blue-400',
        hoverBorder: 'hover:border-blue-300',
        focusRing: 'focus:ring-blue-300',
        badge: 'bg-blue-500',
        spinner: 'border-blue-600',
        chevron: 'text-blue-600',
        chevronInactive: 'text-blue-400',
        dot: 'bg-blue-500'
      },
      emerald: {
        border: 'border-emerald-300',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        icon: 'text-emerald-600',
        iconInactive: 'text-emerald-400',
        hoverBorder: 'hover:border-emerald-300',
        focusRing: 'focus:ring-emerald-300',
        badge: 'bg-emerald-500',
        spinner: 'border-emerald-600',
        chevron: 'text-emerald-600',
        chevronInactive: 'text-emerald-400',
        dot: 'bg-emerald-500'
      },
      orange: {
        border: 'border-orange-300',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        icon: 'text-orange-600',
        iconInactive: 'text-orange-400',
        hoverBorder: 'hover:border-orange-300',
        focusRing: 'focus:ring-orange-300',
        badge: 'bg-orange-500',
        spinner: 'border-orange-600',
        chevron: 'text-orange-600',
        chevronInactive: 'text-orange-400',
        dot: 'bg-orange-500'
      },
      purple: {
        border: 'border-purple-300',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        icon: 'text-purple-600',
        iconInactive: 'text-purple-400',
        hoverBorder: 'hover:border-purple-300',
        focusRing: 'focus:ring-purple-300',
        badge: 'bg-purple-500',
        spinner: 'border-purple-600',
        chevron: 'text-purple-600',
        chevronInactive: 'text-purple-400',
        dot: 'bg-purple-500'
      }
    };

    return colorMap[theme as keyof typeof colorMap] || colorMap.purple;
  };

  const colors = getThemeColors(colorTheme);
  const isActive = hasActiveFilters;

  return (
    <div className="relative" ref={filterRef}>
      <button
        onClick={onToggle}
        disabled={isLoading}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-full focus:outline-none focus:ring-2 ${colors.focusRing} transition-all duration-200 ${
          isActive
            ? `${colors.border} ${colors.bg} ${colors.text}`
            : `border-gray-300 text-gray-600 ${colors.hoverBorder}`
        } ${isLoading ? 'cursor-wait opacity-70' : 'cursor-pointer'}`}
      >
        <div className="flex items-center">
          <span className={`mr-2 transition-colors duration-200 ${
            isActive ? colors.icon : 'text-gray-400'
          }`}>
            {icon}
          </span>
          <div className="flex flex-col items-start">
            <span className={`text-sm font-medium ${
              isActive ? colors.text : 'text-gray-600'
            }`}>
              {title}
            </span>
            
            {/* Loading Indicator Only */}
            {isLoading && (
              <div className="flex items-center gap-1 mt-0.5">
                <div className={`animate-spin rounded-full h-2.5 w-2.5 border ${colors.spinner} border-t-transparent`}></div>
                <span className={`text-xs ${colors.text}`}>Loading...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selected Count Badge */}
          {isActive && selectedCount > 0 && !isLoading && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 ${colors.badge} text-white text-xs font-medium rounded-full`}>
              {selectedCount}
            </span>
          )}
          
          {/* Active Indicator Dot (when no count or count is 0) */}
          {isActive && selectedCount === 0 && !isLoading && (
            <div className={`w-2 h-2 ${colors.dot} rounded-full animate-pulse`}></div>
          )}
          
          {/* Loading Spinner (if loading) */}
          {isLoading && (
            <div className={`animate-spin rounded-full h-3 w-3 border ${colors.spinner} border-t-transparent`}></div>
          )}
          
          {/* Chevron */}
          <IoChevronDownOutline 
            className={`transition-all duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            } ${isActive ? colors.chevron : 'text-gray-400'}`} 
          />
        </div>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default FilterComponent;