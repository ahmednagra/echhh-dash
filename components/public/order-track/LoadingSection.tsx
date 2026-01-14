// src/components/public/order-track/LoadingSection.tsx
import React from 'react'

export default function LoadingSection() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 pt-0">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mt-6">
            <div className="inline-flex items-center text-sm text-gray-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching for orders...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}