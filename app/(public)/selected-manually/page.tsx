// src/app/(public)/selected-manually/page.tsx
'use client';

import { Suspense } from 'react';
import PublicSelectedManually from '@/components/public/PublicSelectedManually';

// Loading component
function LoadingSelectedManually() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-80 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
          </div>
        </div>
        
        {/* Search bar skeleton */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="h-12 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Action buttons skeleton */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-3">
            <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="animate-pulse">
            {/* Table header */}
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex space-x-6">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            </div>
            
            {/* Table rows */}
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex space-x-6 items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded w-16"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="mt-6 flex justify-center">
          <div className="flex space-x-2">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicSelectedManuallyPage() {
  return (
    <Suspense fallback={<LoadingSelectedManually />}>
      <PublicSelectedManually />
    </Suspense>
  );
}