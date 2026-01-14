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
  visibleColumns?: string[]; // Add this new prop
}

const ExportButton: React.FC<SimpleExportButtonProps> = ({
  members,
  campaignName,
  selectedMembers,
  className = '',
  visibleColumns, // Add this new prop
}) => {
  const [isExporting, setIsExporting] = useState(false);

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

  return (
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
