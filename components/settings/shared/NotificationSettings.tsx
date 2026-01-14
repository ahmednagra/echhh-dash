// ============================================
// 1. src/components/settings/shared/NotificationSettings.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DetailedRole } from '@/types/auth';
import SettingsCard from './SettingsCard';
import { Bell, Mail, Smartphone, Globe } from 'react-feather';

interface NotificationPreferences {
  email_notifications: {
    campaign_updates: boolean;
    system_alerts: boolean;
    weekly_reports: boolean;
    security_alerts: boolean;
    billing_updates: boolean;
    outreach_notifications: boolean;
    assignment_updates: boolean;
    performance_alerts: boolean;
  };
  push_notifications: {
    real_time_alerts: boolean;
    daily_digest: boolean;
    urgent_only: boolean;
  };
  sms_notifications: {
    critical_alerts: boolean;
    security_codes: boolean;
  };
}

export default function NotificationSettings() {
  const { user, getPrimaryRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: {
      campaign_updates: true,
      system_alerts: true,
      weekly_reports: false,
      security_alerts: true,
      billing_updates: false,
      outreach_notifications: false,
      assignment_updates: false,
      performance_alerts: false,
    },
    push_notifications: {
      real_time_alerts: false,
      daily_digest: true,
      urgent_only: true,
    },
    sms_notifications: {
      critical_alerts: false,
      security_codes: true,
    },
  });

  const role = getPrimaryRole() as DetailedRole;

  // Load user preferences on mount
  useEffect(() => {
    loadNotificationPreferences();
  }, []);

  const loadNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/settings/notifications');
      if (response.ok) {
        const data = await response.json();
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleEmailToggle = (key: keyof NotificationPreferences['email_notifications']) => {
    setPreferences(prev => ({
      ...prev,
      email_notifications: {
        ...prev.email_notifications,
        [key]: !prev.email_notifications[key]
      }
    }));
  };

  const handlePushToggle = (key: keyof NotificationPreferences['push_notifications']) => {
    setPreferences(prev => ({
      ...prev,
      push_notifications: {
        ...prev.push_notifications,
        [key]: !prev.push_notifications[key]
      }
    }));
  };

  const handleSmsToggle = (key: keyof NotificationPreferences['sms_notifications']) => {
    setPreferences(prev => ({
      ...prev,
      sms_notifications: {
        ...prev.sms_notifications,
        [key]: !prev.sms_notifications[key]
      }
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) throw new Error('Failed to save preferences');
      
      // Show success message
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get role-specific email notifications
  const getEmailNotifications = () => {
    const baseNotifications = [
      { key: 'security_alerts', label: 'Security Alerts', description: 'Login attempts, password changes, and security updates' },
      { key: 'system_alerts', label: 'System Alerts', description: 'Platform maintenance and system notifications' },
    ];

    if (role?.startsWith('b2c_')) {
      return [
        ...baseNotifications,
        { key: 'campaign_updates', label: 'Campaign Updates', description: 'Campaign status changes and milestones' },
        { key: 'weekly_reports', label: 'Weekly Reports', description: 'Weekly performance and analytics reports' },
        { key: 'billing_updates', label: 'Billing Updates', description: 'Invoice notifications and payment confirmations' },
      ];
    }

    if (role === 'platform_agent') {
      return [
        ...baseNotifications,
        { key: 'outreach_notifications', label: 'Outreach Notifications', description: 'New assignments and outreach responses' },
        { key: 'assignment_updates', label: 'Assignment Updates', description: 'Changes to your influencer assignments' },
      ];
    }

    if (role?.startsWith('platform_')) {
      return [
        ...baseNotifications,
        { key: 'system_alerts', label: 'System Monitoring', description: 'Platform health and performance alerts' },
        { key: 'performance_alerts', label: 'Performance Alerts', description: 'System performance and capacity warnings' },
      ];
    }

    if (role === 'influencer') {
      return [
        ...baseNotifications,
        { key: 'campaign_updates', label: 'Campaign Invitations', description: 'New campaign opportunities and updates' },
        { key: 'weekly_reports', label: 'Performance Reports', description: 'Your content performance and earnings reports' },
      ];
    }

    return baseNotifications;
  };

  const emailNotifications = getEmailNotifications();

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <SettingsCard
        title="Email Notifications"
        description="Choose what updates you want to receive via email"
        icon={<Mail className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {emailNotifications.map(({ key, label, description }) => (
            <div key={key} className="flex items-start justify-between py-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900">{label}</h4>
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              </div>
              <div className="ml-6 flex-shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={preferences.email_notifications[key as keyof NotificationPreferences['email_notifications']]}
                    onChange={() => handleEmailToggle(key as keyof NotificationPreferences['email_notifications'])}
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    preferences.email_notifications[key as keyof NotificationPreferences['email_notifications']] 
                      ? 'bg-primary-600' 
                      : 'bg-gray-200'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      preferences.email_notifications[key as keyof NotificationPreferences['email_notifications']] 
                        ? 'translate-x-5' 
                        : 'translate-x-0.5'
                    } mt-0.5`} />
                  </div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Push Notifications */}
      <SettingsCard
        title="Push Notifications"
        description="Manage browser and mobile push notifications"
        icon={<Smartphone className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between py-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Real-time Alerts</h4>
              <p className="text-sm text-gray-500 mt-1">Immediate notifications for urgent updates</p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.push_notifications.real_time_alerts}
                  onChange={() => handlePushToggle('real_time_alerts')}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.push_notifications.real_time_alerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.push_notifications.real_time_alerts ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-start justify-between py-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Daily Digest</h4>
              <p className="text-sm text-gray-500 mt-1">Summary of daily activities and updates</p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.push_notifications.daily_digest}
                  onChange={() => handlePushToggle('daily_digest')}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.push_notifications.daily_digest ? 'bg-primary-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.push_notifications.daily_digest ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* SMS Notifications */}
      <SettingsCard
        title="SMS Notifications"
        description="Critical alerts sent to your mobile phone"
        icon={<Smartphone className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-start justify-between py-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Critical Alerts</h4>
              <p className="text-sm text-gray-500 mt-1">Emergency notifications and system outages</p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.sms_notifications.critical_alerts}
                  onChange={() => handleSmsToggle('critical_alerts')}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.sms_notifications.critical_alerts ? 'bg-primary-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.sms_notifications.critical_alerts ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-start justify-between py-3">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">Security Codes</h4>
              <p className="text-sm text-gray-500 mt-1">Two-factor authentication codes</p>
            </div>
            <div className="ml-6 flex-shrink-0">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={preferences.sms_notifications.security_codes}
                  onChange={() => handleSmsToggle('security_codes')}
                />
                <div className={`w-11 h-6 rounded-full transition-colors ${
                  preferences.sms_notifications.security_codes ? 'bg-primary-600' : 'bg-gray-200'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    preferences.sms_notifications.security_codes ? 'translate-x-5' : 'translate-x-0.5'
                  } mt-0.5`} />
                </div>
              </label>
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}