// src/components/public/order-track/SearchSection.tsx
// Fixed version without examples dropdown and consistent input width

import React, { useState } from 'react'
import { SearchSectionProps } from './types'

export default function SearchSection({ onSearch, onClear, isLoading, searchQuery }: SearchSectionProps) {
  const [inputValue, setInputValue] = useState(searchQuery)
  const [validationError, setValidationError] = useState<string | null>(null)

  const validateDiscountCode = (code: string): string | null => {
    if (!code.trim()) {
      return 'Please enter a discount code'
    }
    
    if (code.length < 2) {
      return 'Discount code must be at least 2 characters'
    }
    
    if (code.length > 50) {
      return 'Discount code is too long'
    }
    
    // Check for valid characters (letters, numbers, hyphens, underscores)
    if (!/^[A-Za-z0-9_-]+$/.test(code)) {
      return 'Discount code can only contain letters, numbers, hyphens, and underscores'
    }
    
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedValue = inputValue.trim()
    
    const error = validateDiscountCode(trimmedValue)
    if (error) {
      setValidationError(error)
      return
    }
    
    setValidationError(null)
    onSearch(trimmedValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    setValidationError(null)
  }

  const handleClear = () => {
    setInputValue('')
    setValidationError(null)
    onClear()
  }

  return (
    <div className="relative w-full max-w-4xl">
      {/* Main Search Form - Fixed layout */}
      <div className="flex items-center space-x-3">
        
        {/* Input Field Container - Fixed width */}
        <div className="relative flex-1 min-w-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter discount code (e.g., SAVE20, WELCOME10)..."
            className={`block w-full pl-12 pr-10 py-3 border rounded-lg text-sm bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              validationError 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors"
              disabled={isLoading}
              title="Clear input"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search Button - Fixed width */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={!inputValue.trim() || isLoading || !!validationError}
          className="flex-shrink-0 inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap min-w-[120px]"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Searching...
            </>
          ) : (
            <>
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </>
          )}
        </button>

        {/* Clear Button - Fixed width container */}
        <div className="flex-shrink-0 w-[90px]">
          {(inputValue || searchQuery) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Validation Error - Position below the search bar */}
      {validationError && (
        <div className="absolute top-full mt-2 left-0 right-0 z-40">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center text-sm text-red-600">
              <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{validationError}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}