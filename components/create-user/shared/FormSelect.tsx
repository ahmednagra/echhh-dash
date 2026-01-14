// src/components/create-user/shared/FormSelect.tsx
'use client';

import React from 'react';
import { ChevronDown } from 'react-feather';

interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: FormSelectOption[];
  error?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helpText?: string;
}

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  placeholder = 'Select an option',
  required = false,
  disabled = false,
  icon,
  helpText
}: FormSelectProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          required={required}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 border rounded-lg transition-all duration-200
            ${icon ? 'pl-10' : 'pl-4'}
            pr-10
            appearance-none
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-purple-500'
            }
            ${disabled 
              ? 'bg-gray-50 text-gray-500 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400 cursor-pointer'
            }
            ${!value ? 'text-gray-400' : 'text-gray-900'}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
          `}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-gray-900">
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
          <ChevronDown className="w-5 h-5" />
        </div>
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