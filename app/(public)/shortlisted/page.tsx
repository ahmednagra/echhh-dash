// src/app/(public)/shortlisted/page.tsx
'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicShortlisted from '@/components/public/PublicShortlisted';
import { getPublicCampaignInfluencers } from '@/services/public-campaign-influencers';
import { PublicCampaignInfluencersResponse } from '@/types/public-campaign-influencers';

function ShortlistedContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<PublicCampaignInfluencersResponse | null>(
    null,
  );
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

        console.log('🔐 Fetching public shortlisted data with token...');

        // Fetch first page to get total pages count
        const firstPageResponse = await getPublicCampaignInfluencers({
          token,
          limit: 100,
          page: 1,
        });

        console.log('📄 First page loaded:', {
          influencers: firstPageResponse.influencers.length,
          totalItems: firstPageResponse.pagination.total_items,
          totalPages: firstPageResponse.pagination.total_pages,
        });

        // If there are more pages, fetch them all
        if (firstPageResponse.pagination.total_pages > 1) {
          console.log(
            `📚 Fetching remaining ${firstPageResponse.pagination.total_pages - 1} pages...`,
          );

          const remainingPagesPromises = [];
          for (
            let page = 2;
            page <= firstPageResponse.pagination.total_pages;
            page++
          ) {
            remainingPagesPromises.push(
              getPublicCampaignInfluencers({
                token,
                limit: 100,
                page,
              }),
            );
          }

          // Fetch all remaining pages in parallel
          const remainingPages = await Promise.all(remainingPagesPromises);

          // Combine all influencers
          const allInfluencers = [
            ...firstPageResponse.influencers,
            ...remainingPages.flatMap((response) => response.influencers),
          ];

          console.log(
            `✅ All pages loaded! Total influencers: ${allInfluencers.length}`,
          );

          // Update the response with all influencers
          const completeResponse: PublicCampaignInfluencersResponse = {
            ...firstPageResponse,
            influencers: allInfluencers,
            pagination: {
              ...firstPageResponse.pagination,
              page: 1,
              page_size: allInfluencers.length,
              total_items: allInfluencers.length,
            },
          };

          setData(completeResponse);
        } else {
          // Only one page, use as-is
          console.log(
            '✅ Single page loaded:',
            firstPageResponse.influencers.length,
          );
          setData(firstPageResponse);
        }
      } catch (err) {
        console.error('❌ Error fetching public shortlisted data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load shortlisted data',
        );
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
          <p className="mt-4 text-gray-600">
            Loading shortlisted influencers...
          </p>
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
              <svg
                className="w-12 h-12 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Access Error
            </h3>
            <p className="text-red-600 text-sm">
              {error || 'Unable to access shortlisted data'}
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Please check if your link is valid and hasn't expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PublicShortlisted data={data} />;
}

export default function PublicShortlistedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <ShortlistedContent />
    </Suspense>
  );
}
