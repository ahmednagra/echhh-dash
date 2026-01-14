// src/app/(public)/ready-to-onboard/page.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicReadyToOnboard from '@/components/public/PublicReadyToOnboard';
import { getPublicCampaignInfluencers } from '@/services/public-campaign-influencers';
import { PublicCampaignInfluencersResponse } from '@/types/public-campaign-influencers';

function ReadyToOnboardContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [data, setData] = useState<PublicCampaignInfluencersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('No session token provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await getPublicCampaignInfluencers({
          token,
          limit: 50, // Load more data initially
          page: 1
        });

        setData(response);
      } catch (err) {
        console.error('Error fetching public campaign data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load campaign data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Access Error</h3>
            <p className="text-red-600 text-sm">
              {error || 'Unable to access campaign data'}
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Please check if your link is valid and hasn't expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PublicReadyToOnboard data={data} />;
}

export default function ReadyToOnboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <ReadyToOnboardContent />
    </Suspense>
  );
}