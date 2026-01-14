// src\app\(public)\profile-analytics-report.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import InfluencerProfileReport from '@/components/dashboard/profile-analytics/InfluencerProfileReport';
import { profileAnalyticsService } from '@/services/insights-iq/profile-analytics';
import { 
  getProfileAnalyticsByHandle,
  saveProfileAnalyticsWithSocialAccount,
  transformToSocialAccountData,
  
} from '@/services/profile-analytics';
import { 
  InsightIQProfileAnalyticsResponse,
} from '@/types/insightiq/profile-analytics';
import { SaveAnalyticsRequest } from '@/types/profile-analytics';

// Professional loading messages
const LOADING_MESSAGES = {
  RETRIEVING_DATA: 'Retrieving profile data...',
  PROCESSING_ANALYTICS: 'Processing analytics data...',
  FINALIZING_RESULTS: 'Finalizing results...',
  REFRESHING: 'Updating analytics data...',
  LOADING_ANALYTICS: 'Loading comprehensive analytics...',
};

interface LoadingState {
  isLoading: boolean;
  message: string;
  step: number;
  totalSteps: number;
}

function ProfileAnalyticsContent() {
  const searchParams = useSearchParams();
  const platformAccountId = searchParams.get('user');

  const [analyticsData, setAnalyticsData] = useState<InsightIQProfileAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<LoadingState>({
    isLoading: false,
    message: '',
    step: 0,
    totalSteps: 3
  });
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateLoadingState = (step: number, message: string) => {
    setLoading(prev => ({
      ...prev,
      step,
      message,
      isLoading: true
    }));
  };

  const loadAnalytics = async (forceRefresh = false) => {
    if (!platformAccountId) {
      setError('Missing required parameters');
      return;
    }

    try {
      setError(null);

      updateLoadingState(1, LOADING_MESSAGES.RETRIEVING_DATA);

      // Step 1: Check backend for existing analytics
      try {
        const backendResponse = await getProfileAnalyticsByHandle(platformAccountId);
        console.log('Backend response:', backendResponse);
        
        if ('analytics_data' in backendResponse && backendResponse.analytics_data.length > 0) {
          // Data exists in backend
          setAnalyticsData(backendResponse.analytics_data[0].analytics as InsightIQProfileAnalyticsResponse);
          setLoading(prev => ({ ...prev, isLoading: false }));
          return;
        }
      } catch (backendError: any) {
        console.log('Backend error:', backendError);
        
        // Check if it's a "Social account not found" error or similar backend error
        if (backendError?.message?.includes('Social account not found') || 
            backendError?.message?.includes('not found') ||
            backendError?.status === 404) {
          console.log('Social account not found');
          // Continue to fetch from 3rd party API
        } else {
          // For other unexpected errors, re-throw
          throw backendError;
        }
      }

    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics. Please try again later.');
      setLoading(prev => ({ ...prev, isLoading: false }));
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    loadAnalytics(true);
  };

  useEffect(() => {
    loadAnalytics();
  }, [platformAccountId]);

  // Loading component
  if (loading.isLoading || isRefreshing) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-6"></div>
            
            {/* Progress indicator */}
            <div className="w-full max-w-md mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {isRefreshing ? LOADING_MESSAGES.REFRESHING : loading.message}
                </span>
                <span className="text-sm text-gray-500">
                  {isRefreshing ? '' : `${loading.step}/${loading.totalSteps}`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: isRefreshing ? '100%' : `${(loading.step / loading.totalSteps) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            <p className="text-gray-600 text-center max-w-md">
              {isRefreshing 
                ? 'Fetching the latest performance data and insights...'
                : 'We\'re compiling comprehensive analytics and performance metrics. This process may take a few moments.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Analytics</h2>
            <p className="text-gray-600 text-center max-w-md mb-6">{error}</p>
            <button
              onClick={() => loadAnalytics()}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  if (!analyticsData) {
    return (
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Analytics Data</h2>
            <p className="text-gray-600 text-center max-w-md">No analytics data available for this profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <InfluencerProfileReport 
      analyticsData={analyticsData}
      platformAccountId={platformAccountId}
      platformId={undefined}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}

function ProfileAnalytics() {
  return (
    <Suspense fallback={
      <div className="p-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        </div>
      </div>
    }>
      <ProfileAnalyticsContent />
    </Suspense>
  );
}

// Protected Dashboard Page
export default function ProfileAnalyticsPage() {
  return (
      <ProfileAnalytics />
  );
}