// src/components/dashboard/campaign-funnel/discover/shortlisted-influencers/columns/TagsPopup.tsx

'use client';

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Search,
  Plus,
  Tag,
  Check,
  Loader2,
  Square,
  CheckSquare,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Tag as TagType, InfluencerTag } from '@/types/tags';
import {
  getAllTags,
  addTagToInfluencerById,
  addTagToInfluencerByName,
  updateTag,
  deleteTag,
} from '@/services/tags/tags.client';
import { toast } from 'react-hot-toast';

interface TagsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  campaignInfluencerId: string;
  influencerName: string;
  existingTags: InfluencerTag[];
  onTagsUpdated: (tags: InfluencerTag[]) => void;
}

// Color palette for tags
const TAG_COLORS = [
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-yellow-100 text-yellow-700',
  'bg-orange-100 text-orange-700',
];

const getTagColor = (tagId: string): string => {
  const hash = tagId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return TAG_COLORS[hash % TAG_COLORS.length];
};

const TagsPopup: React.FC<TagsPopupProps> = ({
  isOpen,
  onClose,
  position,
  campaignInfluencerId,
  influencerName,
  existingTags,
  onTagsUpdated,
}) => {
  const [searchText, setSearchText] = useState('');
  const [allTags, setAllTags] = useState<TagType[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set());
  const [existingTagIds, setExistingTagIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  // 🆕 NEW: Edit/Delete states
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editingTagValue, setEditingTagValue] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLDivElement | null)[]>([]);

  // Mount check for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Initialize existing tag IDs
  useEffect(() => {
    if (isOpen) {
      const existingIds = new Set(existingTags.map((t) => t.id));
      setExistingTagIds(existingIds);
      setSelectedTagIds(new Set());
      setSearchText('');
      setFocusedIndex(-1);
      // Reset edit state
      setEditingTagId(null);
      setEditingTagValue('');

      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, existingTags]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingTagId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingTagId]);

  // Fetch all tags when popup opens
  useEffect(() => {
    if (isOpen) {
      fetchAllTags();
    }
  }, [isOpen]);

  const fetchAllTags = async () => {
    try {
      setIsLoadingTags(true);
      const response = await getAllTags(1, 100);
      setAllTags(response.tags || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setIsLoadingTags(false);
    }
  };

  // Filter and SORT tags alphabetically (A-Z)
  const filteredTags = useMemo(() => {
    let tags = [...allTags];

    // Filter by search
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase().trim();
      tags = tags.filter((tag) => tag.tag.toLowerCase().includes(searchLower));
    }

    // Sort alphabetically A-Z
    tags.sort((a, b) => a.tag.toLowerCase().localeCompare(b.tag.toLowerCase()));

    return tags;
  }, [allTags, searchText]);

  // Check if search text matches any existing tag exactly
  const exactMatchExists = useMemo(() => {
    if (!searchText.trim()) return true;
    const searchLower = searchText.toLowerCase().trim();
    return allTags.some((tag) => tag.tag.toLowerCase() === searchLower);
  }, [allTags, searchText]);

  // Reset itemRefs when filteredTags changes
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredTags.length);
  }, [filteredTags.length]);

  // Toggle tag selection
  const handleToggleTag = useCallback(
    (tagId: string) => {
      if (existingTagIds.has(tagId)) return;

      setSelectedTagIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(tagId)) {
          newSet.delete(tagId);
        } else {
          newSet.add(tagId);
        }
        return newSet;
      });
    },
    [existingTagIds],
  );

  // Select all filtered tags
  const handleSelectAll = () => {
    const availableTags = filteredTags.filter(
      (tag) => !existingTagIds.has(tag.id),
    );
    const allSelected = availableTags.every((tag) =>
      selectedTagIds.has(tag.id),
    );

    if (allSelected) {
      setSelectedTagIds(new Set());
    } else {
      setSelectedTagIds(new Set(availableTags.map((tag) => tag.id)));
    }
  };

  // Save selected tags
  const handleSave = async () => {
    if (selectedTagIds.size === 0) {
      onClose();
      return;
    }

    try {
      setIsSaving(true);
      let latestTags: InfluencerTag[] = existingTags;

      for (const tagId of selectedTagIds) {
        try {
          const response = await addTagToInfluencerById(
            campaignInfluencerId,
            tagId,
          );
          latestTags = response.tags;
        } catch (error) {
          console.error(`Error adding tag ${tagId}:`, error);
        }
      }

      onTagsUpdated(latestTags);
      toast.success(
        `Added ${selectedTagIds.size} tag${selectedTagIds.size > 1 ? 's' : ''}`,
      );
      onClose();
    } catch (error) {
      console.error('Error saving tags:', error);
      toast.error('Failed to save tags');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle creating new tag
  const handleCreateNewTag = async () => {
    const tagName = searchText.trim();
    if (!tagName) return;

    try {
      setIsSaving(true);
      const response = await addTagToInfluencerByName(
        campaignInfluencerId,
        tagName,
      );

      if (response.tag_created && response.added_tag) {
        setAllTags((prev) => [
          ...prev,
          {
            id: response.added_tag.id,
            tag: response.added_tag.tag,
            entity_type: 'company',
            entity_id: '',
            created_by: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }

      onTagsUpdated(response.tags);
      setSearchText('');
      setExistingTagIds(new Set(response.tags.map((t) => t.id)));

      toast.success(
        response.tag_created
          ? `Created and added tag "${tagName}"`
          : `Added tag "${tagName}"`,
      );
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
    } finally {
      setIsSaving(false);
    }
  };

  // =============================================================================
  // 🆕 NEW: Edit Tag Handlers
  // =============================================================================

  const handleStartEdit = (tag: TagType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTagId(tag.id);
    setEditingTagValue(tag.tag);
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditingTagValue('');
  };

  const handleSaveEdit = async () => {
    if (!editingTagId || !editingTagValue.trim()) {
      toast.error('Tag name cannot be empty');
      return;
    }

    // Check if name changed
    const originalTag = allTags.find((t) => t.id === editingTagId);
    if (originalTag && originalTag.tag === editingTagValue.trim()) {
      handleCancelEdit();
      return;
    }

    try {
      setIsUpdating(true);
      const response = await updateTag(editingTagId, editingTagValue.trim());

      // Update in allTags
      setAllTags((prev) =>
        prev.map((t) =>
          t.id === editingTagId ? { ...t, tag: response.tag } : t,
        ),
      );

      // If this tag is assigned to current influencer, update existingTags
      if (existingTagIds.has(editingTagId)) {
        const updatedExistingTags = existingTags.map((t) =>
          t.id === editingTagId ? { ...t, tag: response.tag } : t,
        );
        onTagsUpdated(updatedExistingTags);
      }

      toast.success('Tag updated successfully');
      handleCancelEdit();
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Failed to update tag');
    } finally {
      setIsUpdating(false);
    }
  };

  // =============================================================================
  // 🆕 NEW: Delete Tag Handler
  // =============================================================================

  const handleDeleteTag = async (tag: TagType, e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Are you sure you want to delete the tag "${tag.tag}"?\n\nThis will remove it from ALL influencers across the platform.`,
    );

    if (!confirmed) return;

    try {
      setDeletingTagId(tag.id);
      await deleteTag(tag.id);

      // Remove from allTags
      setAllTags((prev) => prev.filter((t) => t.id !== tag.id));

      // If this tag was assigned to current influencer, update existingTags
      if (existingTagIds.has(tag.id)) {
        const updatedExistingTags = existingTags.filter((t) => t.id !== tag.id);
        onTagsUpdated(updatedExistingTags);
        setExistingTagIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tag.id);
          return newSet;
        });
      }

      // Remove from selected if it was selected
      setSelectedTagIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tag.id);
        return newSet;
      });

      toast.success(`Tag "${tag.tag}" deleted successfully`);
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    } finally {
      setDeletingTagId(null);
    }
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // If editing, handle edit-specific keys
      if (editingTagId) {
        if (e.key === 'Escape') {
          e.preventDefault();
          handleCancelEdit();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSaveEdit();
        }
        return;
      }

      const availableItems =
        filteredTags.length + (searchText.trim() && !exactMatchExists ? 1 : 0);

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev < availableItems - 1 ? prev + 1 : 0;
            // Scroll item into view
            setTimeout(() => {
              itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
            }, 0);
            return next;
          });
          break;

        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => {
            const next = prev > 0 ? prev - 1 : availableItems - 1;
            setTimeout(() => {
              itemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
            }, 0);
            return next;
          });
          break;

        case 'Enter':
          e.preventDefault();
          if (focusedIndex === -1 && searchText.trim() && !exactMatchExists) {
            // Create new tag
            handleCreateNewTag();
          } else if (focusedIndex >= 0) {
            // Check if it's the "Create" option
            const createOptionExists = searchText.trim() && !exactMatchExists;

            if (createOptionExists && focusedIndex === 0) {
              handleCreateNewTag();
            } else {
              const tagIndex = createOptionExists
                ? focusedIndex - 1
                : focusedIndex;
              const tag = filteredTags[tagIndex];
              if (tag && !existingTagIds.has(tag.id)) {
                handleToggleTag(tag.id);
              }
            }
          }
          break;

        case 'Escape':
          e.preventDefault();
          onClose();
          break;

        case ' ':
          // Space to toggle when focused on a tag
          if (focusedIndex >= 0) {
            e.preventDefault();
            const createOptionExists = searchText.trim() && !exactMatchExists;

            if (createOptionExists && focusedIndex === 0) {
              handleCreateNewTag();
            } else {
              const tagIndex = createOptionExists
                ? focusedIndex - 1
                : focusedIndex;
              const tag = filteredTags[tagIndex];
              if (tag && !existingTagIds.has(tag.id)) {
                handleToggleTag(tag.id);
              }
            }
          }
          break;
      }
    },
    [
      filteredTags,
      focusedIndex,
      searchText,
      exactMatchExists,
      existingTagIds,
      handleToggleTag,
      handleCreateNewTag,
      onClose,
      editingTagId,
    ],
  );

  // Reset focus when search changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [searchText]);

  // Count of available tags
  const availableTagsCount = filteredTags.filter(
    (tag) => !existingTagIds.has(tag.id),
  ).length;
  const allAvailableSelected =
    availableTagsCount > 0 &&
    filteredTags
      .filter((tag) => !existingTagIds.has(tag.id))
      .every((tag) => selectedTagIds.has(tag.id));

  if (!isOpen || !mounted) return null;

  const safePosition = {
    x: Math.max(10, Math.min(position.x, window.innerWidth - 330)),
    y: Math.max(10, Math.min(position.y, window.innerHeight - 450)),
  };

  const createOptionExists = searchText.trim() && !exactMatchExists;

  const popupContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20"
        style={{ zIndex: 99998 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 w-80 overflow-hidden"
        style={{
          zIndex: 99999,
          left: `${safePosition.x}px`,
          top: `${safePosition.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-white" />
              <div>
                <h3 className="text-sm font-semibold text-white">Add Tags</h3>
                <p className="text-xs text-white/80 truncate max-w-[180px]">
                  For {influencerName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              type="button"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search or create tag..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            Use ↑↓ to navigate, Enter/Space to select
          </p>
        </div>

        {/* Select All Option */}
        {availableTagsCount > 0 && (
          <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-purple-600 transition-colors"
              type="button"
            >
              {allAvailableSelected ? (
                <CheckSquare className="w-4 h-4 text-purple-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              <span>
                {allAvailableSelected
                  ? 'Deselect all'
                  : `Select all (${availableTagsCount})`}
              </span>
            </button>
          </div>
        )}

        {/* Tags List */}
        <div ref={listRef} className="max-h-60 overflow-y-auto">
          {isLoadingTags ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Loading...</span>
            </div>
          ) : (
            <>
              {/* Create New Tag Option */}
              {createOptionExists && (
                <button
                  ref={(el) => {
                    itemRefs.current[0] = el;
                  }}
                  onClick={handleCreateNewTag}
                  disabled={isSaving}
                  className={`w-full px-4 py-2.5 flex items-center space-x-2 transition-colors border-b border-gray-100 text-left ${
                    focusedIndex === 0 ? 'bg-green-100' : 'hover:bg-green-50'
                  }`}
                  type="button"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 text-green-500 animate-spin" />
                  ) : (
                    <div className="p-1 bg-green-100 rounded">
                      <Plus className="w-3 h-3 text-green-600" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-green-700">
                    Create "{searchText.trim()}"
                  </span>
                </button>
              )}

              {/* Tags List */}
              {filteredTags.length === 0 && !searchText.trim() ? (
                <div className="px-4 py-8 text-center">
                  <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No tags available</p>
                  <p className="text-gray-400 text-xs">Type to create one</p>
                </div>
              ) : (
                <div className="py-1">
                  {filteredTags.map((tag, index) => {
                    const isAlreadyAssigned = existingTagIds.has(tag.id);
                    const isSelected = selectedTagIds.has(tag.id);
                    const itemIndex = createOptionExists ? index + 1 : index;
                    const isFocused = focusedIndex === itemIndex;
                    const isEditing = editingTagId === tag.id;
                    const isDeleting = deletingTagId === tag.id;

                    return (
                      <div
                        key={tag.id}
                        ref={(el) => {
                          itemRefs.current[itemIndex] = el;
                        }}
                        className={`w-full px-4 py-2 flex items-center justify-between transition-colors ${
                          isAlreadyAssigned
                            ? 'bg-gray-50'
                            : isFocused
                              ? 'bg-purple-100'
                              : isSelected
                                ? 'bg-purple-50'
                                : 'hover:bg-gray-50'
                        }`}
                      >
                        {isEditing ? (
                          // Edit Mode
                          <div className="flex items-center space-x-2 flex-1">
                            <input
                              ref={editInputRef}
                              type="text"
                              value={editingTagValue}
                              onChange={(e) =>
                                setEditingTagValue(e.target.value)
                              }
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleSaveEdit();
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  handleCancelEdit();
                                }
                              }}
                              disabled={isUpdating}
                            />
                            <button
                              onClick={handleSaveEdit}
                              disabled={isUpdating}
                              className="p-1 text-green-600 hover:bg-green-100 rounded disabled:opacity-50"
                              title="Save"
                              type="button"
                            >
                              {isUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={isUpdating}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-50"
                              title="Cancel"
                              type="button"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // Normal Mode
                          <>
                            <button
                              onClick={() =>
                                !isAlreadyAssigned && handleToggleTag(tag.id)
                              }
                              disabled={isAlreadyAssigned || isDeleting}
                              className={`flex items-center space-x-3 flex-1 text-left ${
                                isAlreadyAssigned || isDeleting
                                  ? 'cursor-not-allowed opacity-60'
                                  : ''
                              }`}
                              type="button"
                            >
                              {/* Checkbox */}
                              {isAlreadyAssigned ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : isSelected ? (
                                <CheckSquare className="w-4 h-4 text-purple-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}

                              {/* Tag Badge */}
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  isAlreadyAssigned
                                    ? 'bg-green-100 text-green-700'
                                    : isSelected
                                      ? 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                                      : getTagColor(tag.id)
                                }`}
                              >
                                {tag.tag}
                              </span>

                              {isAlreadyAssigned && (
                                <span className="text-xs text-green-600">
                                  Added
                                </span>
                              )}
                            </button>

                            {/* Edit & Delete Icons */}
                            <div className="flex items-center space-x-1 ml-2">
                              <button
                                onClick={(e) => handleStartEdit(tag, e)}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                title="Edit tag"
                                type="button"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteTag(tag, e)}
                                disabled={isDeleting}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Delete tag"
                                type="button"
                              >
                                {isDeleting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {selectedTagIds.size > 0
              ? `${selectedTagIds.size} selected`
              : `${existingTagIds.size} assigned`}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={selectedTagIds.size === 0 || isSaving}
              className={`px-3 py-1.5 text-xs font-medium text-white rounded transition-colors flex items-center space-x-1 ${
                selectedTagIds.size === 0 || isSaving
                  ? 'bg-purple-300 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
              type="button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  Add{' '}
                  {selectedTagIds.size > 0 ? `(${selectedTagIds.size})` : ''}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(popupContent, document.body);
};

export default TagsPopup;
