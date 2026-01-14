// src/components/ui/DateTime.tsx - Hydration-safe date/time component
'use client';

import { useEffect, useState } from 'react';

interface DateTimeProps {
  date: string | Date;
  format?: 'short' | 'long' | 'relative' | 'time';
  className?: string;
  fallback?: string;
}

/**
 * Hydration-safe DateTime component that prevents mismatches
 * between server and client rendering
 */
export default function DateTime({ 
  date, 
  format = 'short', 
  className = '',
  fallback = 'Loading...'
}: DateTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [formattedDate, setFormattedDate] = useState(fallback);

  useEffect(() => {
    setMounted(true);
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      switch (format) {
        case 'short':
          setFormattedDate(dateObj.toLocaleDateString());
          break;
        case 'long':
          setFormattedDate(dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }));
          break;
        case 'time':
          setFormattedDate(dateObj.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          }));
          break;
        case 'relative':
          setFormattedDate(getRelativeTime(dateObj));
          break;
        default:
          setFormattedDate(dateObj.toLocaleDateString());
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      setFormattedDate('Invalid date');
    }
  }, [date, format]);

  // During SSR and initial render, show fallback
  if (!mounted) {
    return <span className={className}>{fallback}</span>;
  }

  return <span className={className}>{formattedDate}</span>;
}

// Helper function for relative time
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
}