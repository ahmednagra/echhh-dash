// src/components/dashboard/campaign-funnel/result/VideoMetricsForm.tsx

'use client';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { SiInstagram, SiTiktok, SiYoutube, SiFacebook, SiLinkedin } from 'react-icons/si';
import {ContentPlatform, getContentPlatformDisplay} from '@/constants/social-platforms';
import {
  VideoMetricsFormData,
  VideoMetricsFormProps,
  FieldVisibility,
  FORM_FIELD_CONFIGS,
  DEFAULT_FORM_DATA,
  calculateEngagementRate,
  validateVideoMetricsForm,
} from './types';


// ============================================================================
// THUMBNAIL PLATFORM ICON COMPONENT (For video thumbnail overlays)
// ============================================================================
interface PlatformIconProps {
  platform: ContentPlatform;
  size?: number;
  className?: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, size = 16, className = '' }) => {
  const iconProps = { size, className };
  
  switch (platform) {
    case 'instagram':
      return <SiInstagram {...iconProps} />;
    case 'tiktok':
      return <SiTiktok {...iconProps} />;
    case 'youtube':
      return <SiYoutube {...iconProps} />;
    case 'facebook':
      return <SiFacebook {...iconProps} />;
    case 'linkedin':
      return <SiLinkedin {...iconProps} />;
    default:
      return null;
  }
};

const PLATFORM_STYLES: Record<ContentPlatform, { gradient: string; label: string }> = {
  instagram: { gradient: 'bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400', label: 'IG' },
  tiktok: { gradient: 'bg-black', label: 'TT' },
  youtube: { gradient: 'bg-red-600', label: 'YT' },
  facebook: { gradient: 'bg-blue-600', label: 'FB' },
  linkedin: { gradient: 'bg-blue-700', label: 'LI' },
};

interface ThumbnailPlatformIconProps {
  platform: ContentPlatform | null;
  size?: 'sm' | 'md';
  className?: string;
}

export const ThumbnailPlatformIcon: React.FC<ThumbnailPlatformIconProps> = React.memo(({
  platform,
  size = 'sm',
  className = '',
}) => {
  if (!platform) return null;

  const style = PLATFORM_STYLES[platform];
  if (!style) return null;

  const sizeClasses = size === 'sm'
    ? 'px-1.5 py-0.5 gap-1'
    : 'px-2 py-1 gap-1.5';

  const iconSize = size === 'sm' ? 8 : 10;
  const textSize = size === 'sm' ? 'text-[8px]' : 'text-[10px]';

  return (
    <div
      className={`${style.gradient} ${sizeClasses} rounded-full flex items-center shadow-md ${className}`}
    >
      <PlatformIcon platform={platform} size={iconSize} className="text-white" />
      <span className={`${textSize} font-bold text-white`}>{style.label}</span>
    </div>
  );
});

ThumbnailPlatformIcon.displayName = 'ThumbnailPlatformIcon';

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

interface FormFieldProps {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'textarea';
  value: string | number;
  onChange: (value: string | number) => void;
  visibility: FieldVisibility;
  error?: string;
  placeholder?: string;
  helpText?: string;
  min?: number;
  step?: string;
  options?: Array<{ value: string; label: string }>;
  rows?: number;
  platform?: ContentPlatform | null;
  showPlatformIcon?: boolean;
  isRequired?: boolean;  // Show asterisk for required fields
}

const FormField: React.FC<FormFieldProps> = React.memo(({
  id,
  label,
  type,
  value,
  onChange,
  visibility,
  error,
  placeholder,
  helpText,
  min,
  step,
  options,
  rows = 3,
  platform,
  showPlatformIcon = false,
  isRequired = false,
}) => {
  // Don't render hidden fields
  if (visibility === 'hidden') return null;

  const isReadonly = visibility === 'readonly';

  const baseInputClass = `w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2`;
  const stateClass = isReadonly
    ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200'
    : error
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-green-500 focus:border-green-500';

  const inputClass = `${baseInputClass} ${stateClass}`;

  const renderInput = () => {
    if (type === 'textarea') {
      return (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isReadonly}
          disabled={isReadonly}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        />
      );
    }

    if (type === 'select' && options) {
      return (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isReadonly}
          className={inputClass}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <div className="relative">
        {showPlatformIcon && platform && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <PlatformIcon platform={platform} size={18} />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
          readOnly={isReadonly}
          disabled={isReadonly}
          placeholder={placeholder}
          min={min}
          step={step}
          className={`${inputClass} ${showPlatformIcon && platform ? 'pl-10' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        />
      </div>
    );
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {isRequired && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderInput()}
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p id={`${id}-help`} className="mt-1 text-xs text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
});

FormField.displayName = 'FormField';

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================

const VideoMetricsForm: React.FC<VideoMetricsFormProps> = ({
  mode,
  platform,
  initialData,
  onSubmit,
  onCancel,
  onBack,
  isLoading,
  externalErrors = {},
  fetchError,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [formData, setFormData] = useState<VideoMetricsFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  // Get field configuration based on mode
  const fieldConfig = useMemo(() => FORM_FIELD_CONFIGS[mode], [mode]);

  // Auto-calculate engagement rate
  const calculatedEngagementRate = useMemo(() => {
    return calculateEngagementRate(
      formData.likes,
      formData.comments,
      formData.shares,
      formData.followers
    );
  }, [formData.likes, formData.comments, formData.shares, formData.followers]);

  // Get submit button label based on mode
  const submitLabel = useMemo(() => {
    switch (mode) {
      case 'edit':
        return 'Update Video';
      case 'preview':
        return 'Save Video';
      case 'manual_add':
      default:
        return 'Save Video';
    }
  }, [mode]);

  // Get platform display info
  const platformDisplay = useMemo(() => {
    return platform ? getContentPlatformDisplay(platform) : null;
  }, [platform]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Update engagement rate when metrics change
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      engagementRate: calculatedEngagementRate,
    }));
  }, [calculatedEngagementRate]);

  // Sync with initialData changes
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...initialData,
    }));
  }, [initialData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleInputChange = useCallback((field: keyof VideoMetricsFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateVideoMetricsForm(formData, mode);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear errors and submit
    setErrors({});
    await onSubmit(formData);
  }, [formData, mode, onSubmit]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Combine internal and external errors
  const allErrors = useMemo(() => ({
    ...errors,
    ...externalErrors,
  }), [errors, externalErrors]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fetch Error Alert */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-400 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">
                Unable to fetch data automatically
              </h4>
              <p className="text-sm text-red-700 mt-1">
                {fetchError === 'Maximum requests limit reached for today. Send an email at hello@ensembledata.com'
                  ? 'API limit reached. Please enter the video metrics manually.'
                  : `${fetchError}. Please enter the video metrics manually.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Platform Indicator */}
      {platform && platformDisplay && (
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
          <PlatformIcon platform={platform} size={24} />
          <span className="text-sm font-medium text-gray-700">
            {platformDisplay.name}
          </span>
          {!platformDisplay.supportsApiFetch && (
            <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
              Manual Entry
            </span>
          )}
        </div>
      )}

      {/* Profile URL with Platform Icon - REQUIRED */}
      <FormField
        id="profileUrl"
        label="Video/Post URL"
        type="text"
        value={formData.profileUrl}
        onChange={(v) => handleInputChange('profileUrl', v)}
        visibility={fieldConfig.profileUrl}
        error={allErrors.profileUrl}
        placeholder="https://..."
        platform={platform}
        showPlatformIcon={true}
        isRequired={true}
        helpText="Enter the full URL of the Facebook or LinkedIn post"
      />

      {/* Influencer Info Row */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          id="influencerUsername"
          label="Username"
          type="text"
          value={formData.influencerUsername}
          onChange={(v) => handleInputChange('influencerUsername', v)}
          visibility={fieldConfig.influencerUsername}
          error={allErrors.influencerUsername}
          placeholder="@username"
          isRequired={true}
          helpText="Auto-filled from influencer selection"
        />

        <FormField
          id="fullName"
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(v) => handleInputChange('fullName', v)}
          visibility={fieldConfig.fullName}
          error={allErrors.fullName}
          placeholder="Full name"
          isRequired={false}
        />
      </div>

      {/* Title */}
      <FormField
        id="title"
        label="Title"
        type="text"
        value={formData.title}
        onChange={(v) => handleInputChange('title', v)}
        visibility={fieldConfig.title}
        error={allErrors.title}
        placeholder="Video/Post title"
      />

      {/* Description (only for manual_add mode) */}
      <FormField
        id="description"
        label="Description"
        type="textarea"
        value={formData.description}
        onChange={(v) => handleInputChange('description', v)}
        visibility={fieldConfig.description}
        error={allErrors.description}
        placeholder="Video/Post description"
        rows={3}
      />

      {/* Metrics Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Engagement Metrics
        </h4>

        {/* Likes and Comments Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField
            id="likes"
            label="Likes"
            type="number"
            value={formData.likes}
            onChange={(v) => handleInputChange('likes', v)}
            visibility={fieldConfig.likes}
            error={allErrors.likes}
            min={0}
          />

          <FormField
            id="comments"
            label="Comments"
            type="number"
            value={formData.comments}
            onChange={(v) => handleInputChange('comments', v)}
            visibility={fieldConfig.comments}
            error={allErrors.comments}
            min={0}
          />
        </div>

        {/* Shares and Views Row */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField
            id="shares"
            label="Shares"
            type="number"
            value={formData.shares}
            onChange={(v) => handleInputChange('shares', v)}
            visibility={fieldConfig.shares}
            error={allErrors.shares}
            min={0}
          />

          <FormField
            id="views"
            label="Views"
            type="number"
            value={formData.views}
            onChange={(v) => handleInputChange('views', v)}
            visibility={fieldConfig.views}
            error={allErrors.views}
            min={0}
          />
        </div>

        {/* Followers and Engagement Rate Row - FIXED: Now in same row per UI requirement */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            id="followers"
            label="Followers"
            type="number"
            value={formData.followers}
            onChange={(v) => handleInputChange('followers', v)}
            visibility={fieldConfig.followers}
            error={allErrors.followers}
            min={0}
          />

          <FormField
            id="engagementRate"
            label="Engagement Rate"
            type="text"
            value={formData.engagementRate}
            onChange={() => {}}
            visibility={fieldConfig.engagementRate}
            helpText="Auto-calculated based on likes, comments, and shares"
          />
        </div>
      </div>

      {/* Additional Fields for Manual Add Mode */}
      {mode === 'manual_add' && (
        <>
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">
              Additional Information
            </h4>

            <FormField
              id="postDate"
              label="Post Date"
              type="date"
              value={formData.postDate}
              onChange={(v) => handleInputChange('postDate', v)}
              visibility={fieldConfig.postDate}
              error={allErrors.postDate}
            />

            <div className="grid grid-cols-3 gap-4 mt-4">
              <FormField
                id="thumbnailUrl"
                label="Thumbnail URL"
                type="text"
                value={formData.thumbnailUrl}
                onChange={(v) => handleInputChange('thumbnailUrl', v)}
                visibility={fieldConfig.thumbnailUrl}
                error={allErrors.thumbnailUrl}
                placeholder="https://..."
              />

              <div>
                <label htmlFor="isVideo" className="block text-sm font-medium text-gray-700 mb-2">
                  Content Type
                </label>
                {fieldConfig.isVideo !== 'hidden' && (
                  <select
                    id="isVideo"
                    value={formData.isVideo ? 'true' : 'false'}
                    onChange={(e) => handleInputChange('isVideo', e.target.value === 'true')}
                    disabled={fieldConfig.isVideo === 'readonly'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  >
                    <option value="false">Image/Post</option>
                    <option value="true">Video</option>
                  </select>
                )}
              </div>

              <FormField
                id="duration"
                label="Duration (sec)"
                type="number"
                value={formData.duration}
                onChange={(v) => handleInputChange('duration', v)}
                visibility={fieldConfig.duration}
                error={allErrors.duration}
                min={0}
              />
            </div>
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-6 mt-6 border-t border-gray-200">
        {/* Back Button (for manual_add and preview modes) */}
        {onBack && (mode === 'manual_add' || mode === 'preview') && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium disabled:opacity-50 flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        )}

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium disabled:opacity-50"
        >
          Cancel
        </button>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {mode === 'edit' ? 'Updating...' : 'Saving...'}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default React.memo(VideoMetricsForm);
