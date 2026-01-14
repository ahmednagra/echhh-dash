// ============================================
// 4. src/components/settings/company/BillingSettings.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SettingsCard from '../shared/SettingsCard';
import { CreditCard, Download, Calendar, DollarSign, AlertCircle } from 'react-feather';

interface BillingData {
  current_plan: {
    name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    features: string[];
    next_billing_date: string;
  };
  payment_method: {
    type: 'card' | 'bank';
    last_four: string;
    expiry_month?: number;
    expiry_year?: number;
    brand?: string;
  };
  billing_history: Array<{
    id: string;
    date: string;
    amount: number;
    status: 'paid' | 'pending' | 'failed';
    invoice_url: string;
    description: string;
  }>;
  usage: {
    campaigns: { used: number; limit: number };
    influencers: { used: number; limit: number };
    team_members: { used: number; limit: number };
  };
}

export default function BillingSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState<BillingData>({
    current_plan: {
      name: 'Professional',
      price: 99,
      billing_cycle: 'monthly',
      features: ['Unlimited campaigns', '50 team members', 'Advanced analytics'],
      next_billing_date: '2024-02-15'
    },
    payment_method: {
      type: 'card',
      last_four: '4242',
      expiry_month: 12,
      expiry_year: 2025,
      brand: 'Visa'
    },
    billing_history: [],
    usage: {
      campaigns: { used: 12, limit: -1 },
      influencers: { used: 250, limit: 500 },
      team_members: { used: 8, limit: 50 }
    }
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const response = await fetch('/api/settings/billing');
      if (response.ok) {
        const data = await response.json();
        setBillingData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const handleChangePlan = () => {
    // Open plan selection modal or redirect to billing portal
    console.log('Change plan clicked');
  };

  const handleUpdatePaymentMethod = () => {
    // Open payment method update modal or redirect to billing portal
    console.log('Update payment method clicked');
  };

  const handleDownloadInvoice = (invoiceUrl: string) => {
    window.open(invoiceUrl, '_blank');
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <SettingsCard
        title="Current Plan"
        description="Your subscription plan and usage details"
        icon={<CreditCard className="w-5 h-5" />}
      >
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {billingData.current_plan.name} Plan
              </h3>
              <p className="text-2xl font-bold text-primary-600 mt-1">
                ${billingData.current_plan.price}
                <span className="text-sm font-normal text-gray-500">
                  /{billingData.current_plan.billing_cycle}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Next billing date: {formatDate(billingData.current_plan.next_billing_date)}
              </p>
            </div>
            <button
              onClick={handleChangePlan}
              className="px-4 py-2 bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
            >
              Change Plan
            </button>
          </div>

          {/* Plan Features */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Plan Features</h4>
            <ul className="space-y-1">
              {billingData.current_plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600 flex items-center">
                  <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Usage Meters */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">Current Usage</h4>
            <div className="space-y-4">
              {Object.entries(billingData.usage).map(([key, usage]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 capitalize">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-gray-900">
                      {usage.used} {usage.limit === -1 ? '' : `/ ${usage.limit}`}
                      {usage.limit === -1 && (
                        <span className="text-green-600 ml-1">(Unlimited)</span>
                      )}
                    </span>
                  </div>
                  {usage.limit !== -1 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          getUsagePercentage(usage.used, usage.limit) > 80
                            ? 'bg-red-500'
                            : getUsagePercentage(usage.used, usage.limit) > 60
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${getUsagePercentage(usage.used, usage.limit)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Payment Method */}
      <SettingsCard
        title="Payment Method"
        description="Manage your payment information"
        icon={<CreditCard className="w-5 h-5" />}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
              {billingData.payment_method.brand?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                **** **** **** {billingData.payment_method.last_four}
              </p>
              {billingData.payment_method.expiry_month && billingData.payment_method.expiry_year && (
                <p className="text-sm text-gray-600">
                  Expires {billingData.payment_method.expiry_month.toString().padStart(2, '0')}/
                  {billingData.payment_method.expiry_year}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleUpdatePaymentMethod}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Update
          </button>
        </div>
      </SettingsCard>

      {/* Billing History */}
      <SettingsCard
        title="Billing History"
        description="View and download your invoices"
        icon={<Calendar className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {billingData.billing_history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No billing history available.</p>
          ) : (
            billingData.billing_history.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">
                      ${invoice.amount}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : invoice.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {invoice.description} • {formatDate(invoice.date)}
                  </p>
                </div>
                <button
                  onClick={() => handleDownloadInvoice(invoice.invoice_url)}
                  className="inline-flex items-center px-3 py-1 text-sm text-primary-600 hover:text-primary-800"
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </button>
              </div>
            ))
          )}
        </div>
      </SettingsCard>
    </div>
  );
}