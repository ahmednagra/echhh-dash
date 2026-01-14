// src/components/ui/SkeletonLoader.tsx
'use client';

interface SkeletonLoaderProps {
  rows?: number;
  className?: string;
}

export default function SkeletonLoader({ rows = 5, className = '' }: SkeletonLoaderProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 py-3 px-6 border-b border-gray-100 last:border-b-0">
          {/* Avatar skeleton */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-4">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          
          {/* Status skeleton */}
          <div className="flex-shrink-0">
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
          
          {/* Contact info skeleton */}
          <div className="flex-shrink-0 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-20"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          
          {/* Timeline skeleton */}
          <div className="flex-shrink-0 space-y-1">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex-shrink-0">
            <div className="h-4 w-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}