// src/components/ui/table/ResizeHandle.tsx

'use client';

import React from 'react';

export interface ResizeHandleProps {
  /** Handler for mousedown event to start resizing */
  onMouseDown: (e: React.MouseEvent) => void;
  /** Whether the column is currently being resized */
  isResizing?: boolean;
  /** Position of the handle (default: 'right') */
  position?: 'left' | 'right';
  /** Custom class name */
  className?: string;
  /** Tooltip text */
  title?: string;
  /** Color theme */
  theme?: 'purple' | 'blue' | 'gray';
}

/**
 * Reusable resize handle component for table columns
 * 
 * @example
 * ```tsx
 * <th className="relative">
 *   Column Header
 *   <ResizeHandle 
 *     onMouseDown={handleResizeStart}
 *     isResizing={isResizing}
 *     title="Drag to resize"
 *   />
 * </th>
 * ```
 */
const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onMouseDown,
  isResizing = false,
  position = 'right',
  className = '',
  title = 'Drag to resize',
  theme = 'purple',
}) => {
  // Theme colors
  const themeColors = {
    purple: {
      hover: 'hover:bg-purple-300',
      active: 'bg-purple-400',
      line: 'bg-gray-300 group-hover/resize:bg-purple-500',
      lineActive: 'bg-purple-500',
    },
    blue: {
      hover: 'hover:bg-blue-300',
      active: 'bg-blue-400',
      line: 'bg-gray-300 group-hover/resize:bg-blue-500',
      lineActive: 'bg-blue-500',
    },
    gray: {
      hover: 'hover:bg-gray-300',
      active: 'bg-gray-400',
      line: 'bg-gray-300 group-hover/resize:bg-gray-500',
      lineActive: 'bg-gray-500',
    },
  };

  const colors = themeColors[theme];
  const positionClass = position === 'right' ? 'right-0' : 'left-0';

  return (
    <div
      className={`absolute ${positionClass} top-0 bottom-0 w-2 cursor-col-resize ${
        isResizing ? colors.active : colors.hover
      } transition-colors z-20 group/resize ${className}`}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onMouseDown(e);
      }}
      onClick={(e) => e.stopPropagation()}
      title={title}
      role="separator"
      aria-orientation="vertical"
      aria-label={title}
    >
      {/* Visual indicator line */}
      <div
        className={`absolute ${
          position === 'right' ? 'right-0.5' : 'left-0.5'
        } top-1/2 -translate-y-1/2 w-0.5 h-4 rounded transition-colors ${
          isResizing ? colors.lineActive : colors.line
        }`}
      />
    </div>
  );
};

export default ResizeHandle;