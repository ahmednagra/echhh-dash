// src/components/settings/shared/SecuritySettings.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SettingsCard from './SettingsCard';
import { Shield, Key, Smartphone, Clock, AlertTriangle, Check, Eye, EyeOff } from 'react-feather';
import { changePassword } from '@/services/users/users.service';
import { PasswordChangeRequest } from '@/types/users';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    loadSecuritySettings();
    loadActiveSessions();
  }, []);

  useEffect(() => {
    calculatePasswordStrength();
  }, [newPassword]);

  const loadSecuritySettings = async () => {
    try {
      const response = await fetch('/api/settings/security');
      if (response.ok) {
        const data = await response.json();
        setTwoFactorEnabled(data.two_factor_enabled || false);
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    }
  };

  const loadActiveSessions = async () => {
    try {
      const response = await fetch('/api/auth/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading active sessions:', error);
    }
  };

  const calculatePasswordStrength = () => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/[0-9]/.test(newPassword)) strength += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      return;
    }

    if (newPassword.length < 8) {
      setMessage('New password must be at least 8 characters long');
      setMessageType('error');
      return;
    }

    if (passwordStrength < 3) {
      setMessage('Please choose a stronger password');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    
    try {
      const passwordData: PasswordChangeRequest = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      };

      await changePassword(passwordData);

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setMessage('Password changed successfully!');
      setMessageType('success');
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage(error instanceof Error ? error.message : 'Failed to change password. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle2FA = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      try {
        const response = await fetch('/api/settings/2fa', {
          method: 'DELETE'
        });
        if (response.ok) {
          setTwoFactorEnabled(false);
        }
      } catch (error) {
        console.error('Error disabling 2FA:', error);
      }
    } else {
      // Enable 2FA - show QR code
      setShowQRCode(true);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/auth/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        loadActiveSessions();
      }
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return { text: 'Weak', color: 'text-red-500' };
      case 2:
        return { text: 'Fair', color: 'text-yellow-500' };
      case 3:
        return { text: 'Good', color: 'text-blue-500' };
      case 4:
      case 5:
        return { text: 'Strong', color: 'text-green-500' };
      default:
        return { text: '', color: '' };
    }
  };

  const strengthInfo = getPasswordStrengthText();

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <SettingsCard
        title="Change Password"
        description="Update your account password to keep your account secure"
        icon={<Key className="w-5 h-5" />}
      >
        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {newPassword && (
              <div className="mt-3">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength <= 1 ? 'bg-red-500' :
                        passwordStrength === 2 ? 'bg-yellow-500' :
                        passwordStrength === 3 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${strengthInfo.color}`}>
                    {strengthInfo.text}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li className={newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      One number
                    </li>
                    <li className={/[^A-Za-z0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-500'}>
                      One special character
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
            )}
          </div>

          {/* Message Display */}
          {message && (
            <div className={`p-4 rounded-md ${
              messageType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || !newPassword || !currentPassword || passwordStrength < 3}
              className="flex items-center justify-center px-8 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Updating Password...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5 mr-2" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </SettingsCard>

      {/* Two-Factor Authentication */}
      <SettingsCard
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
        icon={<Shield className="w-5 h-5" />}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Smartphone className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">
                Authenticator App
              </span>
              {twoFactorEnabled && (
                <Check className="w-4 h-4 text-green-500" />
              )}
            </div>
            <p className="text-sm text-gray-600">
              {twoFactorEnabled 
                ? 'Two-factor authentication is enabled for your account'
                : 'Use an authenticator app to generate verification codes'
              }
            </p>
          </div>
          <button
            onClick={handleToggle2FA}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              twoFactorEnabled
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </SettingsCard>

      {/* Active Sessions */}
      <SettingsCard
        title="Active Sessions"
        description="Manage your active login sessions across different devices"
        icon={<Clock className="w-5 h-5" />}
      >
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No active sessions found</p>
          ) : (
            sessions.map((session: any, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{session.device || 'Unknown Device'}</span>
                    {session.current && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Current Session
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {session.location || 'Unknown Location'} • 
                    Last active: {session.last_active || 'Just now'}
                  </p>
                </div>
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
                  >
                    Terminate
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </SettingsCard>

      {/* Security Recommendations */}
      <SettingsCard
        title="Security Recommendations"
        description="Tips to keep your account secure"
        icon={<AlertTriangle className="w-5 h-5" />}
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Use a strong password</h4>
              <p className="text-sm text-gray-600">
                Your password should be at least 8 characters and include uppercase, lowercase, numbers, and symbols.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Enable two-factor authentication</h4>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to prevent unauthorized access to your account.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Check className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900">Review active sessions regularly</h4>
              <p className="text-sm text-gray-600">
                Check for any suspicious activity and terminate sessions from unknown devices.
              </p>
            </div>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}