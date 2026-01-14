// src/components/dashboard/platform/EmailAgentDashboard.tsx
// Complete Email-specific agent dashboard
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function EmailAgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize email agent specific data
      console.log('📧 Email Agent Dashboard initialized for user:', user?.full_name);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header with Email branding */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-lg mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-xl">📧</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Email Outreach Dashboard</h1>
            <p className="text-white/80">Manage your email marketing campaigns and outreach</p>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.full_name?.split(' ')[0] || 'Agent'}! 📧
        </h2>
        <p className="text-gray-600 mb-4">
          Here's your email outreach command center. Manage your email campaigns, track responses, and optimize your outreach strategy.
        </p>
      </div>

      {/* Email Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Email Campaigns Overview */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Email Campaigns</h3>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">📬</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Active Campaigns</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending Campaigns</span>
              <span className="font-medium">5</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Completed Today</span>
              <span className="font-medium text-green-600">8</span>
            </div>
          </div>
        </div>

        {/* Email Performance */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance</h3>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">📈</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Open Rate</span>
              <span className="font-medium text-green-600">24.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Click Rate</span>
              <span className="font-medium text-blue-600">3.8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Response Rate</span>
              <span className="font-medium text-purple-600">1.2%</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">🔔</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Campaign "Summer Launch" completed</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">New response received</p>
                <p className="text-xs text-gray-500">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Campaign "Product Update" scheduled</p>
                <p className="text-xs text-gray-500">6 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Management Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">✍️</span>
              <span className="text-sm font-medium">Compose Email</span>
            </button>
            <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">📊</span>
              <span className="text-sm font-medium">View Analytics</span>
            </button>
            <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">📋</span>
              <span className="text-sm font-medium">Templates</span>
            </button>
            <button className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <span className="text-lg">📇</span>
              <span className="text-sm font-medium">Contact Lists</span>
            </button>
          </div>
        </div>

        {/* Email Service Status */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Email Service</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Connected</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SMTP Configuration</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Active</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Domain Verification</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Send Limit</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-600">2,847 / 5,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🚧</span>
        </div>
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Advanced Email Features Coming Soon</h3>
        <p className="text-blue-700 mb-4">
          We're building an comprehensive email outreach platform. Advanced features including 
          automated sequences, A/B testing, advanced segmentation, and detailed deliverability analytics will be available soon!
        </p>
        <div className="flex justify-center gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
            Request Early Access
          </button>
          <button className="border border-blue-300 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-lg transition-colors">
            View Feature Roadmap
          </button>
        </div>
      </div>
    </div>
  );
}