// src/components/dashboard/campaign-funnel/discover/discover-influencers/filters/Account/index.tsx
import React, { useState, useRef, useEffect } from 'react';
import { IoChevronDown, IoInformationCircleOutline } from 'react-icons/io5';
import LastPost from './LastPost';
import AccountType from './AccountType';
import Contacts from './Contacts';
import { InfluencerSearchFilter } from '@/lib/creator-discovery-types';
import { isFilterAvailable } from '@/utils/filter-utils';
import { Platform } from '@/types/platform';

type AccountFiltersProps = {
  searchParams: InfluencerSearchFilter;
  onFilterChange: (updates: Partial<InfluencerSearchFilter>) => void;
  filterButtonStyle: string;
  openFilterId: string | null;
  toggleFilterDropdown: (filterId: string) => void;
  isFilterOpen: (filterId: string) => boolean;
  onCloseFilter: () => void;
  selectedPlatform?: Platform | null; // ADD
};

// Toggle Switch Component
const ToggleSwitch: React.FC<{
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  tooltip?: string;
  disabled?: boolean;
}> = ({ id, label, checked, onChange, tooltip, disabled = false }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2">
      {/* Toggle Switch */}
      <div className="flex items-center">
        <label
          htmlFor={id}
          className="inline-flex relative items-center cursor-pointer"
        >
          <input
            type="checkbox"
            id={id}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
              disabled
                ? 'bg-gray-200 cursor-not-allowed'
                : checked
                  ? 'bg-purple-600'
                  : 'bg-gray-200'
            } peer-focus:ring-4 peer-focus:ring-purple-300`}
          >
            <div
              className={`absolute top-[2px] left-[2px] bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200 ease-in-out ${
                checked ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </div>
        </label>
      </div>

      {/* Label */}
      <label
        htmlFor={id}
        className={`text-sm cursor-pointer select-none ${
          disabled ? 'text-gray-400' : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        {label}
      </label>

      {/* Tooltip */}
      {tooltip && (
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

          {showTooltip && (
            <div className="absolute left-0 top-6 z-[200] w-64 bg-gray-800 text-white text-xs rounded-lg p-3 shadow-lg">
              <div className="relative">
                {/* Tooltip arrow */}
                <div className="absolute -top-1 left-3 w-2 h-2 bg-gray-800 transform rotate-45"></div>

                {/* Tooltip content */}
                <div className="leading-relaxed">{tooltip}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AccountFilters: React.FC<AccountFiltersProps> = ({
  searchParams,
  onFilterChange,
  filterButtonStyle,
  openFilterId,
  toggleFilterDropdown,
  isFilterOpen,
  onCloseFilter,
  selectedPlatform, // ✅ ADD THIS PARAMETER
}) => {
  const handleToggleChange = (
    filterKey: keyof InfluencerSearchFilter,
    value: boolean,
  ) => {
    // Create update object with only the specific filter being changed
    const updates: Partial<InfluencerSearchFilter> = {};

    // Set the specific filter value (or undefined if false to remove it)
    if (value) {
      (updates as any)[filterKey] = true;
    } else {
      (updates as any)[filterKey] = undefined; // Remove the filter when turned off
    }

    onFilterChange(updates);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-3 mb-6">
        <LastPost
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('lastPost')}
          onToggle={() => toggleFilterDropdown('lastPost')}
          onCloseFilter={onCloseFilter}
        />

        <AccountType
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('accountType')}
          onToggle={() => toggleFilterDropdown('accountType')}
          onCloseFilter={onCloseFilter}
        />

        <Contacts
          filters={searchParams}
          onFilterChange={onFilterChange}
          isOpen={isFilterOpen('contacts')}
          onToggle={() => toggleFilterDropdown('contacts')}
          onCloseFilter={onCloseFilter}
        />
      </div>
      {/* Grid Layout for Toggle Switches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Verification Status */}
        <ToggleSwitch
          id="isVerified"
          label="Only Verified Accounts"
          checked={Boolean(searchParams.is_verified)}
          onChange={(checked) => handleToggleChange('is_verified', checked)}
          tooltip="Filter profiles by platform verification status. Shows only accounts with verified badges."
        />

        {/* Contact Details */}
        <ToggleSwitch
          id="hasContactDetails"
          label="Has Contact Details"
          checked={Boolean(searchParams.has_contact_details)}
          onChange={(checked) =>
            handleToggleChange('has_contact_details', checked)
          }
          tooltip="Filter profiles by availability of contact details. Shows creators with accessible contact information."
        />

        {/* Sponsored Posts (Instagram only) */}
        {isFilterAvailable(
          selectedPlatform?.name,
          'account',
          'has_sponsored_posts',
        ) && (
          <ToggleSwitch
            id="hasSponsoredPosts"
            label="Has Sponsored Posts"
            checked={Boolean(searchParams.has_sponsored_posts)}
            onChange={(checked) =>
              handleToggleChange('has_sponsored_posts', checked)
            }
            tooltip="Filter profiles which have sponsored posts. Only available for Instagram creators."
          />
        )}

        {/* Official Artist (YouTube only) */}
        {isFilterAvailable(
          selectedPlatform?.name,
          'account',
          'is_official_artist',
        ) && (
          <ToggleSwitch
            id="isOfficialArtist"
            label="Official Artist"
            checked={Boolean(searchParams.is_official_artist)}
            onChange={(checked) =>
              handleToggleChange('is_official_artist', checked)
            }
            tooltip="Filter YouTube profiles which are official artists. Shows music creators with official artist status."
          />
        )}

        {/* Audience Info */}
        <ToggleSwitch
          id="hasAudienceInfo"
          label="Has Audience Info"
          checked={Boolean(searchParams.has_audience_info)}
          onChange={(checked) =>
            handleToggleChange('has_audience_info', checked)
          }
          tooltip="Fetches only profiles with audience information. Shows creators with demographic and engagement data."
        />

        {/* Exclude Private Profiles */}
        <ToggleSwitch
          id="excludePrivateProfiles"
          label="Exclude Private Accounts"
          checked={Boolean(searchParams.exclude_private_profiles)}
          onChange={(checked) =>
            handleToggleChange('exclude_private_profiles', checked)
          }
          tooltip="Filter to exclude private profiles. Shows only public accounts that are accessible to everyone."
        />
      </div>
    </>
  );
};

export default AccountFilters;
