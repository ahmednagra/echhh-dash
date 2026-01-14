// src/components/create-user/shared/FormFileUpload.tsx
'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, User } from 'react-feather';

interface FormFileUploadProps {
  label: string;
  name: string;
  onChange: (name: string, file: File | null) => void;
  error?: string;
  helpText?: string;
  accept?: string;
  maxSize?: number; // in MB
  disabled?: boolean;
}

export default function FormFileUpload({
  label,
  name,
  onChange,
  error,
  helpText = 'PNG, JPG or WEBP (max. 5MB)',
  accept = 'image/*',
  maxSize = 5,
  disabled = false
}: FormFileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setFileName(file.name);
    onChange(name, file);
  };

  const handleRemove = () => {
    setPreview(null);
    setFileName(null);
    onChange(name, null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="flex items-start gap-4">
        {/* Preview/Upload Area */}
        <div className="flex-shrink-0">
          {preview ? (
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div
              onClick={!disabled ? handleClick : undefined}
              className={`
                w-24 h-24 rounded-full border-2 border-dashed border-gray-300 
                flex items-center justify-center bg-gray-50
                ${disabled 
                  ? 'cursor-not-allowed opacity-50' 
                  : 'cursor-pointer hover:border-purple-500 hover:bg-purple-50'
                }
                transition-all duration-200
              `}
            >
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Info */}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={handleClick}
            disabled={disabled}
            className={`
              inline-flex items-center gap-2 px-4 py-2 border border-gray-300 
              rounded-lg text-sm font-medium transition-all duration-200
              ${disabled
                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-purple-500'
              }
            `}
          >
            <Upload className="w-4 h-4" />
            {fileName ? 'Change Photo' : 'Upload Photo'}
          </button>

          {fileName && (
            <p className="text-xs text-gray-600 truncate max-w-xs">
              {fileName}
            </p>
          )}

          {helpText && !error && (
            <p className="text-xs text-gray-500">{helpText}</p>
          )}

          {error && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-red-600 rounded-full"></span>
              {error}
            </p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}