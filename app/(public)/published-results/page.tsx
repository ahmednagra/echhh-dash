// src/app/(public)/published-results/page.tsx

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PublicPublishedResults from '@/components/public/PublicPublishedResults';
import { getPublicContentPosts } from '@/services/public-content-posts';
import { PublicContentPostsResponse } from '@/types/public-content-posts';

function PublishedResultsContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [data, setData] = useState<PublicContentPostsResponse | null>(null);
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

        console.log('🔐 Fetching public published results with token...');

        // Fetch all pages if necessary
        const firstPageResponse = await getPublicContentPosts({
          token,
          limit: 100,
          page: 1,
        });

        console.log('📄 First page loaded:', {
          posts: firstPageResponse.content_posts.length,
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
              getPublicContentPosts({
                token,
                limit: 100,
                page,
              }),
            );
          }

          const remainingPages = await Promise.all(remainingPagesPromises);

          const allContentPosts = [
            ...firstPageResponse.content_posts,
            ...remainingPages.flatMap((response) => response.content_posts),
          ];

          console.log(
            `✅ All pages loaded! Total posts: ${allContentPosts.length}`,
          );

          const completeResponse: PublicContentPostsResponse = {
            ...firstPageResponse,
            content_posts: allContentPosts,
            pagination: {
              ...firstPageResponse.pagination,
              page: 1,
              page_size: allContentPosts.length,
              total_items: allContentPosts.length,
            },
          };

          setData(completeResponse);
        } else {
          console.log(
            '✅ Single page loaded:',
            firstPageResponse.content_posts.length,
          );
          setData(firstPageResponse);
        }
      } catch (err) {
        console.error('❌ Error fetching published results:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load published results'
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
          <p className="mt-4 text-gray-600">Loading published results...</p>
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
              {error || 'Unable to access published results'}
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Please check if your link is valid and hasn't expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <PublicPublishedResults data={data} token={token!} />;
}

export default function PublishedResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <PublishedResultsContent />
    </Suspense>
  );
}