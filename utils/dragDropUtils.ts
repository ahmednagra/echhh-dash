// src/utils/dragDropUtils.ts

/**
 * Utility functions for drag and drop functionality
 */

export interface DragDropConfig {
  onDragStart?: (itemId: string) => void;
  onDragEnd?: (itemId: string) => void;
  onDrop?: (itemId: string) => Promise<void>;
  enableVisualFeedback?: boolean;
}

/**
 * Create drag handlers for draggable items
 */
export const createDragHandlers = (
  itemId: string,
  config: DragDropConfig
) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback
    if (config.enableVisualFeedback && e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
      e.currentTarget.style.transform = 'scale(0.95)';
    }
    
    config.onDragStart?.(itemId);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Remove visual feedback
    if (config.enableVisualFeedback && e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = 'scale(1)';
    }
    
    config.onDragEnd?.(itemId);
  };

  return {
    draggable: true,
    onDragStart: handleDragStart,
    onDragEnd: handleDragEnd,
  };
};

/**
 * Create drop handlers for drop zones
 */
export const createDropHandlers = (
  config: DragDropConfig,
  onDragOver?: () => void,
  onDragLeave?: () => void
) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    onDragOver?.();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only trigger if actually leaving the component
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      onDragLeave?.();
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData('text/plain');
    
    if (itemId && config.onDrop) {
      await config.onDrop(itemId);
    }
    
    onDragLeave?.(); // Reset visual state
  };

  return {
    onDragOver: handleDragOver,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop,
  };
};

/**
 * Generate CSS classes for drag states
 */
export const getDragStateClasses = (
  isDragging: boolean,
  isDragOver: boolean,
  baseClasses: string = '',
  dragClasses: string = 'opacity-50 scale-95',
  dropClasses: string = 'border-green-400 bg-green-50 shadow-lg scale-105'
) => {
  return `${baseClasses} ${
    isDragging ? dragClasses : ''
  } ${
    isDragOver ? dropClasses : ''
  } transition-all duration-200`.trim();
};

/**
 * Create a toast notification for drag and drop actions
 */
export const createDragDropToast = (
  type: 'success' | 'error' | 'info',
  message: string,
  duration: number = 3000
) => {
  // This would integrate with your existing toast/notification system
  // For now, using console.log as placeholder
  const prefix = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  console.log(`${prefix} Drag & Drop: ${message}`);
  
  // You can replace this with your actual toast implementation
  return {
    type,
    message,
    duration,
    timestamp: Date.now(),
  };
};