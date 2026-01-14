// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ExportButton.tsx
'use client';

import { useState } from 'react';
import { Upload } from 'react-feather';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { exportInfluencers } from '@/utils/exportUtils';

interface SimpleExportButtonProps {
  members: CampaignListMember[];
  campaignName?: string;
  selectedMembers?: CampaignListMember[];
  className?: string;
  visibleColumns?: string[];
  iconOnly?: boolean; // NEW: Icon-only mode with tooltip
}

const ExportButton: React.FC<SimpleExportButtonProps> = ({
  members,
  campaignName,
  selectedMembers,
  className = '',
  visibleColumns,
  iconOnly = false, // NEW
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // NEW: For icon-only tooltip

  // Determine which members to export
  const membersToExport =
    selectedMembers && selectedMembers.length > 0 ? selectedMembers : members;
  const exportText =
    selectedMembers && selectedMembers.length > 0
      ? `Export (${selectedMembers.length})`
      : 'Export';

  // Handle export action
  const handleExport = async () => {
    if (membersToExport.length === 0) {
      alert('No influencers to export');
      return;
    }

    setIsExporting(true);

    try {
      // Pass visible columns to the export function
      await exportInfluencers(membersToExport, campaignName, visibleColumns);

      // Success - no popup alert, just console log
      console.log('✅ Excel file exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert(
        `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  // Tooltip text
  const tooltipText = selectedMembers && selectedMembers.length > 0
    ? `Export ${selectedMembers.length} selected`
    : 'Export All';

  return iconOnly ? (
    // Icon-only mode with tooltip
    <div className="relative">
      <button
        onClick={handleExport}
        disabled={membersToExport.length === 0 || isExporting}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`p-2.5 rounded-xl border transition-all duration-200 ${
          membersToExport.length === 0 || isExporting
            ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
            : 'bg-white text-gray-600 border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10'
        } ${className}`}
        title={tooltipText}
      >
        {isExporting ? (
          <div className="w-4 h-4 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
      </button>
      {/* Tooltip */}
      {showTooltip && !isExporting && (
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none">
          <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
            {tooltipText}
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </div>
  ) : (
    // Full button mode (original)
    <button
      onClick={handleExport}
      disabled={membersToExport.length === 0 || isExporting}
      className={`flex items-center px-4 py-2 bg-gray-50 border border-green-200 rounded-md text-sm font-medium hover:bg-gray-60 text-gray-700 hover:bg-gray-50 hover:border-green-500 hover:shadow-md hover:shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2" />
          Exporting...
        </>
      ) : (
        <>
          <Upload className="w-4 h-4 mr-2 text-gray-500" />
          {exportText}
        </>
      )}
    </button>
  );
};

export default ExportButton;
