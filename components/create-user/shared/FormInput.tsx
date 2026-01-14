// src/components/create-user/shared/FormInput.tsx
'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'react-feather';

interface FormInputProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  value: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helpText?: string;
}

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  disabled = false,
  icon,
  helpText
}: FormInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const inputType = type === 'password' && showPassword ? 'text' : type;
  
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border rounded-lg transition-all duration-200
            ${icon ? 'pl-10' : 'pl-4'}
            ${type === 'password' ? 'pr-10' : 'pr-4'}
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
            }
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            placeholder:text-gray-400
          `}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
      
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
  );
}