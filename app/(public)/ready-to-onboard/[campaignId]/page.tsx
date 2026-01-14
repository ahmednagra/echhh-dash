// src/app/(public)/ready-to-onboard/[campaignId]/page.tsx
import { Suspense } from 'react';
import PublicReadyToOnboard from '@/components/public/PublicReadyToOnboard';

// Loading component
function LoadingTable() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="text-center">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative max-w-lg mx-auto">
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="animate-pulse">
            <div className="bg-gray-50 px-6 py-3">
              <div className="flex space-x-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-24"></div>
                ))}
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex space-x-6">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded w-16"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PublicReadyToOnboardPageProps {
  params: {
    campaignId: string;
  };
}

export default function PublicReadyToOnboardPage({ params }: PublicReadyToOnboardPageProps) {
  return (
    <Suspense fallback={<LoadingTable />}>
      <PublicReadyToOnboard campaignId={params.campaignId} />
    </Suspense>
  );
}