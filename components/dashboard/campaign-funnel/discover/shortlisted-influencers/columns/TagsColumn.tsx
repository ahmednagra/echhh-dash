// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/TagsColumn.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Pencil } from 'lucide-react';
import { CampaignListMember } from '@/services/campaign/campaign-list.service';
import { InfluencerTag } from '@/types/tags';
import TagsPopup from './TagsPopup';

interface TagsColumnProps {
  member: CampaignListMember;
  onUpdate?: (updatedMember: CampaignListMember) => void;
  readOnly?: boolean;
  columnWidth?: number; // Dynamic column width for resize feature
}

// Soft pastel colors for tags (light & professional)
const TAG_COLORS = [
  'text-purple-600 bg-purple-50 border-purple-100',
  'text-pink-600 bg-pink-50 border-pink-100',
  'text-blue-600 bg-blue-50 border-blue-100',
  'text-emerald-600 bg-emerald-50 border-emerald-100',
  'text-amber-600 bg-amber-50 border-amber-100',
  'text-cyan-600 bg-cyan-50 border-cyan-100',
  'text-rose-600 bg-rose-50 border-rose-100',
  'text-indigo-600 bg-indigo-50 border-indigo-100',
];

// Get consistent color for a tag based on its id
const getTagColorIndex = (tagId: string): number => {
  const hash = tagId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return hash % TAG_COLORS.length;
};

// Constants for width calculation
const TAG_COLUMN_WIDTH = 90; // Width per tag column (50px max-width + padding/gap)
const TAGS_PER_ROW = 2;
const MIN_VISIBLE_TAGS = 2;
const ICON_SPACE = 20; // Space for edit icon

const TagsColumn: React.FC<TagsColumnProps> = ({
  member,
  onUpdate,
  readOnly = false,
  columnWidth = 96, // Default width (w-24 = 96px)
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Get tags from member and SORT ALPHABETICALLY (A-Z)
  const tags: InfluencerTag[] = useMemo(() => {
    const rawTags: InfluencerTag[] = (member as any).tags || [];
    // Sort alphabetically A-Z by tag name
    return [...rawTags].sort((a, b) =>
      a.tag.toLowerCase().localeCompare(b.tag.toLowerCase()),
    );
  }, [(member as any).tags]);

  const hasTags = tags.length > 0;

  // Calculate how many tags to display based on column width
  const visibleTagsCount = useMemo(() => {
    // Available width for tags (subtract icon space)
    const availableWidth = columnWidth - ICON_SPACE;

    // How many "columns" of tags can fit
    const tagColumns = Math.max(
      1,
      Math.floor(availableWidth / TAG_COLUMN_WIDTH),
    );

    // Each column shows TAGS_PER_ROW tags vertically
    const maxVisible = tagColumns * TAGS_PER_ROW;

    // Return at least MIN_VISIBLE_TAGS, at most all tags
    return Math.min(Math.max(MIN_VISIBLE_TAGS, maxVisible), tags.length);
  }, [columnWidth, tags.length]);

  // Get tags to display
  const displayTags = useMemo(() => {
    return tags.slice(0, visibleTagsCount);
  }, [tags, visibleTagsCount]);

  // Group display tags into columns of 3 (vertical layout)
  const tagColumns = useMemo(() => {
    const columns: InfluencerTag[][] = [];
    const numColumns = Math.ceil(displayTags.length / TAGS_PER_ROW);

    for (let col = 0; col < numColumns; col++) {
      const columnTags: InfluencerTag[] = [];
      for (let row = 0; row < TAGS_PER_ROW; row++) {
        const index = col * TAGS_PER_ROW + row;
        if (index < displayTags.length) {
          columnTags.push(displayTags[index]);
        }
      }
      columns.push(columnTags);
    }
    return columns;
  }, [displayTags]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Calculate popup position
  const calculatePopupPosition = useCallback(
    (triggerElement: HTMLElement, popupWidth: number, popupHeight: number) => {
      const rect = triggerElement.getBoundingClientRect();
      const padding = 10;

      let x = rect.left;
      let y = rect.bottom + padding;

      if (x + popupWidth > window.innerWidth - padding) {
        x = rect.right - popupWidth;
      }

      if (y + popupHeight > window.innerHeight - padding) {
        y = rect.top - popupHeight - padding;
      }

      if (x < padding) x = padding;
      if (y < padding) y = rect.bottom + padding;

      return { x, y };
    },
    [],
  );

  // Handle tags update from popup
  const handleTagsUpdated = (updatedTags: InfluencerTag[]) => {
    if (onUpdate) {
      const updatedMember: CampaignListMember = {
        ...member,
        tags: updatedTags,
      } as CampaignListMember;
      onUpdate(updatedMember);
    }
  };

  // Handle click on edit icon
  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const position = calculatePopupPosition(
      e.currentTarget as HTMLElement,
      320,
      450,
    );
    setPopupPosition(position);
    setIsPopupOpen(true);
  };

  // If no tags and readOnly, show placeholder
  if (!hasTags && readOnly) {
    return <span className="text-xs text-gray-400">-</span>;
  }

  // If no tags and not readOnly, just show edit button
  if (!hasTags && !readOnly) {
    return (
      <>
        <div className="flex items-center">
          <button
            onClick={handleEditClick}
            className="flex items-center justify-center w-4 h-4 bg-purple-50 rounded text-purple-400 hover:bg-purple-100 hover:text-purple-600 transition-colors"
            title="Add tags"
            type="button"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
        </div>

        {mounted && (
          <TagsPopup
            isOpen={isPopupOpen}
            onClose={() => setIsPopupOpen(false)}
            position={popupPosition}
            campaignInfluencerId={member.id || ''}
            influencerName={member.social_account?.full_name || 'Unknown'}
            existingTags={tags}
            onTagsUpdated={handleTagsUpdated}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-start gap-1">
        {/* Tags Container - Columns of 3 tags each */}
        <div className="flex gap-1.5 flex-1 min-w-0">
          {tagColumns.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-0.5">
              {column.map((tag) => {
                const colorIndex = getTagColorIndex(tag.id);
                return (
                  <span
                    key={tag.id}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium truncate max-w-[85px] border leading-tight ${TAG_COLORS[colorIndex]}`}
                    title={tag.tag}
                  >
                    {tag.tag}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        {/* Right side container for "+N more" and edit icon */}
        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
          {/* Show count of hidden tags if any */}
          {tags.length > visibleTagsCount && (
            <span
              className="text-[8px] text-gray-400 whitespace-nowrap"
              title={`${tags.length - visibleTagsCount} more tags - Drag column edge to expand`}
            >
              +{tags.length - visibleTagsCount}
            </span>
          )}

          {/* Edit Icon - Only show if NOT readOnly */}
          {!readOnly && (
            <button
              onClick={handleEditClick}
              className="flex items-center justify-center w-4 h-4 bg-purple-50 rounded text-purple-400 hover:bg-purple-100 hover:text-purple-600 transition-colors"
              title="Edit tags"
              type="button"
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      </div>

      {/* Tags Popup - Only render if NOT readOnly */}
      {!readOnly && mounted && (
        <TagsPopup
          isOpen={isPopupOpen}
          onClose={() => setIsPopupOpen(false)}
          position={popupPosition}
          campaignInfluencerId={member.id || ''}
          influencerName={member.social_account?.full_name || 'Unknown'}
          existingTags={tags}
          onTagsUpdated={handleTagsUpdated}
        />
      )}
    </>
  );
};

export default TagsColumn;
