// src/hooks/useColumnResize.ts

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseColumnResizeOptions {
  /** Default width in pixels (default: 96) */
  defaultWidth?: number;
  /** Minimum width in pixels (default: 96) */
  minWidth?: number;
  /** Maximum width in pixels (default: 400) */
  maxWidth?: number;
  /** Callback when width changes */
  onWidthChange?: (width: number) => void;
}

export interface UseColumnResizeReturn {
  /** Current column width in pixels */
  width: number;
  /** Whether the column is currently being resized */
  isResizing: boolean;
  /** Handler for mousedown event on resize handle */
  handleResizeStart: (e: React.MouseEvent) => void;
  /** Flag to check if resize just completed (use to prevent sort) */
  justResized: boolean;
  /** Manually set the width */
  setWidth: React.Dispatch<React.SetStateAction<number>>;
  /** Reset width to default */
  resetWidth: () => void;
  /** Style object to apply to th/td elements */
  getColumnStyle: () => React.CSSProperties;
}

/**
 * Custom hook for creating resizable table columns
 *
 * @example
 * ```tsx
 * const tagsColumnResize = useColumnResize({
 *   defaultWidth: 96,
 *   minWidth: 96,
 *   maxWidth: 300,
 * });
 *
 * // In table header
 * <th style={tagsColumnResize.getColumnStyle()}>
 *   Tags
 *   <ResizeHandle onMouseDown={tagsColumnResize.handleResizeStart} />
 * </th>
 *
 * // Prevent sort after resize
 * onClick={() => {
 *   if (tagsColumnResize.justResized) return;
 *   handleSort(column.key);
 * }}
 * ```
 */
export function useColumnResize(
  options: UseColumnResizeOptions = {},
): UseColumnResizeReturn {
  const {
    defaultWidth = 96,
    minWidth = 96,
    maxWidth = 400,
    onWidthChange,
  } = options;

  // State
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [justResized, setJustResized] = useState(false);

  // Refs for tracking resize
  const resizeStartX = useRef(0);
  const resizeStartWidth = useRef(0);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = width;
    },
    [width],
  );

  // Handle resize move and end
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(
        minWidth,
        Math.min(maxWidth, resizeStartWidth.current + diff),
      );

      setWidth(newWidth);
      onWidthChange?.(newWidth);
    };

    const handleMouseUp = () => {
      if (!isResizing) return;

      setIsResizing(false);

      // Set flag to prevent sort from triggering
      setJustResized(true);

      // Reset flag after a short delay
      setTimeout(() => {
        setJustResized(false);
      }, 100);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, minWidth, maxWidth, onWidthChange]);

  // Reset width to default
  const resetWidth = useCallback(() => {
    setWidth(defaultWidth);
    onWidthChange?.(defaultWidth);
  }, [defaultWidth, onWidthChange]);

  // Get style object for column
  const getColumnStyle = useCallback((): React.CSSProperties => {
    return {
      width: `${width}px`,
      minWidth: `${width}px`,
    };
  }, [width]);

  return {
    width,
    isResizing,
    handleResizeStart,
    justResized,
    setWidth,
    resetWidth,
    getColumnStyle,
  };
}

/**
 * Calculate max width based on content
 * Useful for Tags column where max width depends on max tags count
 *
 * @example
 * ```tsx
 * const maxTagsCount = Math.max(...members.map(m => m.tags?.length || 0), 3);
 * const maxWidth = calculateMaxWidthFromTags(maxTagsCount);
 * ```
 */
export function calculateMaxWidthFromTags(
  maxTagsCount: number,
  tagColumnWidth: number = 90, // Updated: Width per tag column
  tagsPerRow: number = 2, // Updated: 2 tags per row
  iconSpace: number = 20,
): number {
  const columns = Math.ceil(maxTagsCount / tagsPerRow);
  return columns * tagColumnWidth + iconSpace;
}

export default useColumnResize;
