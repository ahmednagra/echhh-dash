// hooks/useClickOutside.ts
import { useEffect, useRef } from 'react';

/**
 * Professional hook for handling click outside events
 * Used by major companies like Airbnb, Stripe, etc.
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      
      // If element doesn't exist or click is inside element, do nothing
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      
      // Click is outside element, call handler
      handler();
    };

    // Use capture phase to handle events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [handler, enabled]);

  return ref;
}

// Alternative: Multiple elements version (for complex dropdowns)
export function useClickOutsideMultiple<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled: boolean = true
) {
  const refs = useRef<T[]>([]);

  const addRef = (element: T | null) => {
    if (element && !refs.current.includes(element)) {
      refs.current.push(element);
    }
  };

  const removeRef = (element: T | null) => {
    if (element) {
      refs.current = refs.current.filter(ref => ref !== element);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      
      // Check if click is inside any of the referenced elements
      const isInside = refs.current.some(element => 
        element && element.contains(target)
      );

      if (!isInside) {
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [handler, enabled]);

  return { addRef, removeRef };
}

export function useFilterClickOutside<T extends HTMLElement = HTMLElement>(
  openFilterId: string | null,
  targetFilterId: string,
  onClose: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    // Only listen when this specific filter is open
    const isThisFilterOpen = openFilterId === targetFilterId;
    if (!isThisFilterOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const element = ref.current;
      
      // If element doesn't exist or click is inside element, do nothing
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      
      // Click is outside element, close this filter
      onClose();
    };

    // Use capture phase
    document.addEventListener('mousedown', handleClickOutside, true);
    document.addEventListener('touchstart', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('touchstart', handleClickOutside, true);
    };
  }, [openFilterId, targetFilterId, onClose]);

  return ref;
}