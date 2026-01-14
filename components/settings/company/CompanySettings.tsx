// ============================================
// 3. src/components/settings/company/CompanySettings.tsx
// ============================================
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import SettingsCard from '../shared/SettingsCard';
import { Home, Users, Globe, Upload, Save, MapPin } from 'react-feather';

interface CompanyData {
  name: string;
  industry: string;
  website: string;
  description: string;
  company_size: string;
  address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  social_media: {
    linkedin: string;
    twitter: string;
    facebook: string;
    instagram: string;
  };
  logo_url: string;
}

export default function CompanySettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    name: '',
    industry: '',
    website: '',
    description: '',
    company_size: '',
    address: {
      street: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
    },
    social_media: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
    },
    logo_url: '',
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      const response = await fetch('/api/settings/company');
      if (response.ok) {
        const data = await response.json();
        setCompanyData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading company data:', error);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (field: keyof CompanyData['address'], value: string) => {
    setCompanyData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSocialChange = (field: keyof CompanyData['social_media'], value: string) => {
    setCompanyData(prev => ({
      ...prev,
      social_media: {
        ...prev.social_media,
        [field]: value
      }
    }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await fetch('/api/settings/company/logo', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyData(prev => ({ ...prev, logo_url: data.logo_url }));
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyData)
      });

      if (!response.ok) throw new Error('Failed to save company settings');
      
      // Show success message
    } catch (error) {
      console.error('Error saving company settings:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <SettingsCard
          title="Company Information"
          description="Basic information about your company"
          icon={<Home className="w-5 h-5" />}
        >
          <div className="space-y-6">
            {/* Company Logo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Logo
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {companyData.logo_url ? (
                    <img 
                      src={companyData.logo_url} 
                      alt="Company logo" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Home className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div>
                  <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Logo
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleLogoUpload}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={companyData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry
                </label>
                <select
                  value={companyData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Industry</option>
                  <option value="technology">Technology</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="finance">Finance</option>
                  <option value="retail">Retail</option>
                  <option value="education">Education</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  value={companyData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  value={companyData.company_size}
                  onChange={(e) => handleInputChange('company_size', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Description
              </label>
              <textarea
                value={companyData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Tell us about your company..."
              />
            </div>
          </div>
        </SettingsCard>

        {/* Company Address */}
        <SettingsCard
          title="Company Address"
          description="Your company's physical address"
          icon={<MapPin className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <input
                type="text"
                value={companyData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={companyData.address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province
              </label>
              <input
                type="text"
                value={companyData.address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Postal Code
              </label>
              <input
                type="text"
                value={companyData.address.postal_code}
                onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={companyData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="PK">Pakistan</option>
                {/* Add more countries as needed */}
              </select>
            </div>
          </div>
        </SettingsCard>

        {/* Social Media */}
        <SettingsCard
          title="Social Media"
          description="Your company's social media profiles"
          icon={<Globe className="w-5 h-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={companyData.social_media.linkedin}
                onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twitter
              </label>
              <input
                type="url"
                value={companyData.social_media.twitter}
                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://twitter.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={companyData.social_media.facebook}
                onChange={(e) => handleSocialChange('facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://facebook.com/yourcompany"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram
              </label>
              <input
                type="url"
                value={companyData.social_media.instagram}
                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="https://instagram.com/yourcompany"
              />
            </div>
          </div>
        </SettingsCard>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}