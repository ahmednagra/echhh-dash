// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/ActionToolbar.tsx
'use client';

import React, { useState } from 'react';
import { 
  Download, Upload, UserPlus, Share2, FileText,
  Loader2
} from 'lucide-react';

interface ActionToolbarProps {
  // Import
  onImport: () => void;
  isImportDisabled?: boolean;
  // Export
  onExport: () => void;
  isExporting?: boolean;
  // Add
  onAdd: () => void;
  // Share
  onShare: () => void;
  isSharing?: boolean;
  shareSuccess?: boolean;
  // Templates
  onTemplates: () => void;
  isSavingTemplate?: boolean;
  showTemplateButton?: boolean;
}

interface TooltipButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  variant?: 'default' | 'success';
}

const TooltipButton: React.FC<TooltipButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
  isLoading = false,
  isSuccess = false,
  variant = 'default',
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const getButtonStyles = () => {
    if (isSuccess) {
      return 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100';
    }
    if (disabled || isLoading) {
      return 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed opacity-50';
    }
    return 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-purple-600 hover:border-purple-300 hover:shadow-md hover:shadow-purple-500/10';
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled || isLoading}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          p-2.5 rounded-xl border transition-all duration-200
          ${getButtonStyles()}
        `}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSuccess ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <Icon className="w-4 h-4" />
        )}
      </button>

      {/* Tooltip */}
      {showTooltip && !isLoading && (
        <div className="absolute -bottom-9 left-1/2 -translate-x-1/2 z-50">
          <div className="px-2.5 py-1 text-xs font-medium bg-gray-900 text-white rounded-lg whitespace-nowrap shadow-lg">
            {isSuccess ? 'Copied!' : label}
          </div>
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onImport,
  isImportDisabled = false,
  onExport,
  isExporting = false,
  onAdd,
  onShare,
  isSharing = false,
  shareSuccess = false,
  onTemplates,
  isSavingTemplate = false,
  showTemplateButton = true,
}) => {
  return (
    <div className="flex items-center gap-1 p-1.5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200 shadow-sm">
      <TooltipButton
        icon={Download}
        label="Import CSV"
        onClick={onImport}
        disabled={isImportDisabled}
      />
      <TooltipButton
        icon={Upload}
        label="Export"
        onClick={onExport}
        isLoading={isExporting}
      />
      <TooltipButton
        icon={UserPlus}
        label="Add Influencer"
        onClick={onAdd}
      />
      <TooltipButton
        icon={Share2}
        label="Share URL"
        onClick={onShare}
        isLoading={isSharing}
        isSuccess={shareSuccess}
      />
      {showTemplateButton && (
        <TooltipButton
          icon={FileText}
          label="Templates"
          onClick={onTemplates}
          isLoading={isSavingTemplate}
        />
      )}
    </div>
  );
};

export default ActionToolbar;