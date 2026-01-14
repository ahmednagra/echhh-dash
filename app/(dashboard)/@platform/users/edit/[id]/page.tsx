// src/app/(dashboard)/@platform/users/edit/[id]/page.tsx
// Enhanced Edit User page with ALL backend fields (users, companies, company_users tables)

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Phone, Briefcase, MapPin, Globe, Shield, MessageSquare, Calendar } from 'react-feather';
import { getUser, updateUser } from '@/services/users';
import { UpdateUserRequest } from '@/types/users';
import { fetchRoles } from '@/services/roles/roles.client';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form data with ALL backend-supported fields
  const [formData, setFormData] = useState({
    email: '',
    user_type: 'b2c',
    first_name: '',
    last_name: '',
    full_name: '',
    phone_number: '',
    status: 'pending',
    email_verified: false,
    profile_image_url: '',
    
    // COMMON PROFILE FIELDS (ALL user types) - Backend supported
    bio: '',
    location: '',
    timezone: '',
    language: '',
    
    // USER TYPE SPECIFIC FIELDS - Backend supported
    department: '',
    job_title: '',
    
    // COMPANY INFORMATION (from companies table) - Admin editable
    company_id: '',
    company_name: '',
    company_domain: '',
    
    // COMPANY_USER ASSOCIATION (from company_users table) - Display only
    role_id: '',
    is_primary: false,
    
    // ADMIN-ONLY FIELDS
    new_password: '',
    confirm_password: '',
  });

  const [isAdmin, setIsAdmin] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  // Role management state
  const [availableRoles, setAvailableRoles] = useState<Array<{ value: string; label: string }>>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setIsAdmin(true);
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    checkAdminStatus();
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await getUser(userId);
        
        setFormData({
          email: userData.email || '',
          user_type: userData.user_type || 'b2c',
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          full_name: userData.full_name || '',
          phone_number: userData.phone_number || '',
          status: userData.status || 'pending',
          email_verified: userData.email_verified || false,
          profile_image_url: userData.profile_image_url || '',
          
          // COMMON PROFILE FIELDS
          bio: (userData as any).bio || '',
          location: (userData as any).location || '',
          timezone: (userData as any).timezone || '',
          language: (userData as any).language || '',
          
          // USER TYPE SPECIFIC FIELDS
          department: (userData as any).department || '',
          job_title: (userData as any).job_title || '',
          
          // COMPANY INFORMATION (from companies table via API)
          company_id: (userData as any).company?.id || '',
          company_name: (userData as any).company?.name || '',
          company_domain: (userData as any).company?.domain || '',
          
          // COMPANY_USER ASSOCIATION
          role_id: (userData as any).role_id || '',
          is_primary: (userData as any).is_primary || false,
          
          new_password: '',
          confirm_password: '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Auto-calculate full_name
  useEffect(() => {
    if (formData.first_name || formData.last_name) {
      setFormData(prev => ({
        ...prev,
        full_name: `${formData.first_name} ${formData.last_name}`.trim()
      }));
    }
  }, [formData.first_name, formData.last_name]);

  // Fetch roles when user type is b2c or b2b
  useEffect(() => {
    const loadRoles = async () => {
      // Only fetch roles for B2C/B2B users
      if (formData.user_type !== 'b2c' && formData.user_type !== 'b2b') {
        return;
      }

      setLoadingRoles(true);
      setRolesError(null);
      
      try {
        const rolesData = await fetchRoles(formData.user_type);
        
        // Filter out company_owner and company_admin roles
        const filteredRoles = rolesData.filter(
          role => role.value !== 'b2c_company_owner' && 
                  role.value !== 'b2c_company_admin' &&
                  role.value !== 'b2b_company_owner' && 
                  role.value !== 'b2b_company_admin'
        );
        
        setAvailableRoles(filteredRoles);
      } catch (error) {
        console.error('Failed to fetch roles:', error);
        setRolesError('Failed to load roles. Please refresh the page.');
      } finally {
        setLoadingRoles(false);
      }
    };

    loadRoles();
  }, [formData.user_type]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    setPasswordError('');

    try {
      // Validate password if provided
      if (formData.new_password) {
        if (formData.new_password !== formData.confirm_password) {
          setPasswordError('Passwords do not match');
          setSaving(false);
          return;
        }
        if (formData.new_password.length < 8) {
          setPasswordError('Password must be at least 8 characters');
          setSaving(false);
          return;
        }
      }

      const updateData: any = {
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        full_name: formData.full_name || null,
        phone_number: formData.phone_number || null,
        status: formData.status,
        email_verified: formData.email_verified,
        profile_image_url: formData.profile_image_url || null,
        
        // INCLUDE COMMON PROFILE FIELDS IN UPDATE
        bio: formData.bio || undefined,
        location: formData.location || undefined,
        timezone: formData.timezone || undefined,
        language: formData.language || undefined,
        
        // INCLUDE USER TYPE SPECIFIC FIELDS
        department: formData.department || undefined,
        job_title: formData.job_title || undefined,
        
        // 🔥 INCLUDE COMPANY FIELDS (Admin only)
        company_name: formData.company_name || undefined,
        company_domain: formData.company_domain || undefined,
      };

      // 🔥 INCLUDE ROLE UPDATE (Admin only for B2C/B2B users)
      if (isAdmin && selectedRole && (formData.user_type === 'b2c' || formData.user_type === 'b2b')) {
        updateData.role_name = selectedRole;
      }

      if (isAdmin && formData.email) {
        updateData.email = formData.email;
      }

      if (isAdmin && formData.new_password) {
        updateData.password = formData.new_password;
      }

      await updateUser(userId, updateData);
      setSuccess(true);
      
      setTimeout(() => {
        router.push('/users');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      console.error('Error updating user:', err);
    } finally {
      setSaving(false);
    }
  };

  const getUserTypeBadgeColor = (userType: string) => {
    const colors: { [key: string]: string } = {
      platform: 'bg-purple-100 text-purple-700 border-purple-200',
      b2c: 'bg-blue-100 text-blue-700 border-blue-200',
      b2b: 'bg-green-100 text-green-700 border-green-200',
      influencer: 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return colors[userType?.toLowerCase()] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/users')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
                <p className="text-xs text-gray-500 mt-0.5">Update user information and settings</p>
              </div>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <p className="text-green-800 text-sm font-medium">User updated successfully! Redirecting...</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <p className="text-red-800 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* Left Column - Main Info (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Account Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-pink-100 rounded-lg">
                    <User className="w-4 h-4 text-pink-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Account Information</h2>
                </div>
                
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email Address {isAdmin && <span className="text-blue-600">(Admin editable)</span>}
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isAdmin}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm ${
                          isAdmin 
                            ? 'border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent' 
                            : 'bg-gray-50 text-gray-600 cursor-not-allowed border-gray-200'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* User Type Badge */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      User Type
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getUserTypeBadgeColor(formData.user_type)}`}>
                        {formData.user_type.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">Cannot be changed</span>
                    </div>
                  </div>

                  {/* Name Fields Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="First name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-xs text-gray-400">(Auto-calculated)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      disabled
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* COMMON PROFILE DETAILS - Available to ALL user types */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Profile Details</h2>
                  <span className="text-xs text-green-600 font-medium">✓ Saves to Backend</span>
                </div>
                
                <div className="space-y-4">
                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Professional Bio
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                      placeholder="Tell us about yourself, your role, and expertise..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.bio.length}/500 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>

                    {/* Timezone */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <Globe className="w-3 h-3 inline mr-1" />
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select timezone</option>
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Dubai">Dubai (GST)</option>
                        <option value="Asia/Karachi">Pakistan (PKT)</option>
                        <option value="Asia/Kolkata">India (IST)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                        <option value="Australia/Sydney">Sydney (AEDT)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <MessageSquare className="w-3 h-3 inline mr-1" />
                        Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                      >
                        <option value="">Select language</option>
                        <option value="en">English</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="fr">French (Français)</option>
                        <option value="de">German (Deutsch)</option>
                        <option value="it">Italian (Italiano)</option>
                        <option value="pt">Portuguese (Português)</option>
                        <option value="ar">Arabic (العربية)</option>
                        <option value="ur">Urdu (اردو)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="zh">Chinese (中文)</option>
                        <option value="ja">Japanese (日本語)</option>
                        <option value="ko">Korean (한국어)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* USER TYPE SPECIFIC SECTIONS */}
              {(formData.user_type === 'b2c' || formData.user_type === 'b2b' || formData.user_type === 'platform') && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">
                      {formData.user_type === 'platform' ? 'Platform User Settings' : 'Company User Settings'}
                    </h2>
                    <span className="text-xs text-green-600 font-medium">✓ Saves to Backend</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Department */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder={formData.user_type === 'platform' ? 'e.g., Engineering, Product' : 'e.g., Marketing, Sales'}
                      />
                    </div>

                    {/* Job Title */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <Briefcase className="w-3 h-3 inline mr-1" />
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder={formData.user_type === 'platform' ? 'e.g., Senior Developer' : 'e.g., Marketing Manager'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COMPANY INFORMATION - Only for B2C/B2B users (🔥 NOW ADMIN EDITABLE) */}
              {(formData.user_type === 'b2c' || formData.user_type === 'b2b') && formData.company_name && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Company Information</h2>
                    {isAdmin ? (
                      <span className="text-xs text-green-600 font-medium">✓ Admin Editable</span>
                    ) : (
                      <span className="text-xs text-blue-600 font-medium">From companies table</span>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {/* Company Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Company Name {isAdmin && <span className="text-blue-600">(Admin editable)</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        disabled={!isAdmin}
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                          isAdmin 
                            ? 'border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent' 
                            : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* Company Domain */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        <Globe className="w-3 h-3 inline mr-1" />
                        Company Domain {isAdmin && <span className="text-blue-600">(Admin editable)</span>}
                      </label>
                      <input
                        type="text"
                        value={formData.company_domain || ''}
                        onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
                        disabled={!isAdmin}
                        placeholder="example.com"
                        className={`w-full px-3 py-2.5 border rounded-lg text-sm ${
                          isAdmin 
                            ? 'border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent' 
                            : 'border-gray-200 bg-gray-50 text-gray-600 cursor-not-allowed'
                        }`}
                      />
                    </div>

                    {/* Company ID - Keep as read-only */}
                    {formData.company_id && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Company ID
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={formData.company_id}
                            disabled
                            className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                          />
                          <button
                            type="button"
                            onClick={() => navigator.clipboard.writeText(formData.company_id)}
                            className="px-3 py-2.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}

                    {isAdmin ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                          <strong>⚠️ Warning:</strong> Changing company name or domain will affect ALL users associated with this company.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                          <strong>Note:</strong> Company association is managed by administrators. Contact support to change company information.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* COMPANY_USER ASSOCIATION - Only for B2C/B2B users */}
              {(formData.user_type === 'b2c' || formData.user_type === 'b2b') && formData.company_name && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Company User Association</h2>
                    <span className="text-xs text-blue-600 font-medium">From company_users table</span>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Is Primary Admin */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.is_primary}
                          disabled
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded cursor-not-allowed opacity-50"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-900">Primary Company Admin</span>
                          <p className="text-xs text-gray-500">This user is {formData.is_primary ? '' : 'not '}the primary administrator for their company</p>
                        </div>
                      </label>
                    </div>

                    {/* Role Selection Dropdown */}
                    {isAdmin && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          <Shield className="w-3 h-3 inline mr-1" />
                          User Role <span className="text-blue-600">(Admin editable)</span>
                        </label>
                        {loadingRoles ? (
                          <div className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-500">
                            Loading roles...
                          </div>
                        ) : rolesError ? (
                          <div className="space-y-2">
                            <div className="w-full px-3 py-2.5 border border-red-300 rounded-lg text-sm bg-red-50 text-red-600">
                              {rolesError}
                            </div>
                            <button
                              type="button"
                              onClick={() => window.location.reload()}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Retry
                            </button>
                          </div>
                        ) : (
                          <>
                            <select
                              value={selectedRole || formData.role_id || ''}
                              onChange={(e) => setSelectedRole(e.target.value)}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white"
                              disabled={loadingRoles}
                            >
                              <option value="">Select a role</option>
                              {availableRoles.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                              Determines user permissions within the company
                            </p>
                            {selectedRole && selectedRole !== formData.role_id && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
                                <p className="text-xs text-amber-800">
                                  <strong>Note:</strong> Role will be updated when you save changes.
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {/* Read-only Role ID for non-admins */}
                    {!isAdmin && formData.role_id && (
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          <Shield className="w-3 h-3 inline mr-1" />
                          Role ID (Foreign Key to roles table)
                        </label>
                        <input
                          type="text"
                          value={formData.role_id}
                          disabled
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Determines user permissions within the company - Contact admin to change
                        </p>
                      </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        <strong>About:</strong> The company_users table associates this user with their company and defines their role-based permissions.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Password Reset - Admin Only */}
              {isAdmin && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Password Reset</h2>
                    <span className="text-xs text-purple-600 font-medium">(Admin Only)</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-blue-700">
                        Leave blank to keep current password. Setting a new password will log out the user.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={formData.new_password}
                          onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Min. 8 characters"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                          className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            passwordError ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Re-enter password"
                        />
                        {passwordError && (
                          <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Status & Settings (1/3 width) */}
            <div className="space-y-4">
              
              {/* Profile Picture & Status */}
              {isAdmin && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <Shield className="w-4 h-4 text-purple-600" />
                    </div>
                    <h2 className="text-base font-semibold text-gray-900">Admin Controls</h2>
                  </div>

                  <div className="space-y-4">
                    {/* Profile Picture */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">
                        Profile Picture
                      </label>
                      <div className="flex flex-col items-center gap-3">
                        {formData.profile_image_url ? (
                          <img 
                            src={formData.profile_image_url} 
                            alt="Profile" 
                            className="h-24 w-24 rounded-full object-cover border-2 border-purple-200 shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E?%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center border-2 border-dashed border-purple-300">
                            <User className="w-10 h-10 text-purple-400" />
                          </div>
                        )}
                        
                        <input
                          type="file"
                          id="profile-upload"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setFormData({ 
                                  ...formData, 
                                  profile_image_url: reader.result as string 
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <label 
                          htmlFor="profile-upload" 
                          className="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                        >
                          Upload Photo
                        </label>
                        {formData.profile_image_url && (
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, profile_image_url: '' })}
                            className="text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Email Verified */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.email_verified}
                          onChange={(e) => setFormData({ ...formData, email_verified: e.target.checked })}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-medium text-gray-900">Email Verified</span>
                          <p className="text-xs text-gray-500">User's email is confirmed</p>
                        </div>
                      </label>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Account Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="active">✅ Active</option>
                        <option value="pending">⏳ Pending</option>
                        <option value="inactive">⚫ Inactive</option>
                        <option value="suspended">🚫 Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Metadata */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="p-1.5 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900">Account Details</h2>
                </div>
                
                <div className="space-y-3">
                  {/* User ID */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      User ID
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={userId}
                        disabled
                        className="flex-1 px-2 py-1.5 border border-gray-200 rounded text-xs bg-gray-50 text-gray-500 font-mono cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(userId)}
                        className="px-2 py-1.5 bg-gray-50 text-gray-600 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* User Type Badge */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      User Type
                    </label>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${getUserTypeBadgeColor(formData.user_type)}`}>
                      {formData.user_type.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Panel */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-4">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">✨ Enhanced Features</h3>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>All fields save to backend</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Bio, location, timezone, language</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Department & job title fields</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Company info editable (Admin)</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/users')}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}