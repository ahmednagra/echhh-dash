// src/app/(dashboard)/@platform/billing/subscriptions/[id]/page.tsx

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Briefcase, 
  CreditCard, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  Copy
} from 'react-feather';
import { getSubscriptionById } from '@/services/billing/subscription/subscription.client';
import type { Subscription } from '@/types/billing/subscription';
import { SubscriptionStatusBadge, SubscriptionDetails } from '@/components/billing/subscription';

export default function SubscriptionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subscriptionId = params.id as string;

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSubscriptionById(subscriptionId);
        setSubscription(data);
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load subscription';
        setError(errorMessage);
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    if (subscriptionId) {
      fetchSubscription();
    }
  }, [subscriptionId]);

  const handleBack = () => {
    router.push('/billing/subscriptions');
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(subscriptionId);
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusName = (status: any): string => {
    if (!status) return 'unknown';
    if (typeof status === 'string') return status;
    return status.name || 'unknown';
  };

  // Loading State
  if (loading) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-6 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">Subscription Details</h2>
          </div>
          <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-red-600 mb-1">Error Loading Subscription</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Subscriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State
  if (!subscription) {
    return (
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">Subscription Details</h2>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">Subscription Not Found</h3>
            <p className="text-gray-500">The subscription you're looking for doesn't exist.</p>
            <button
              onClick={handleBack}
              className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Subscriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Success State - Render subscription details
  return (
    <div className="p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-700">Subscription Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Details Component */}
        <SubscriptionDetails subscription={subscription} />
      </div>
    </div>
  );
}