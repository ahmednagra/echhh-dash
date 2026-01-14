'use client'

// src/components/public/order-track/OrderTracker.tsx
// Updated design - reduced left/right margins

import React, { useState } from 'react'
import SearchSection from './SearchSection'
import ResultsTable from './ResultsTable'
import LoadingSection from './LoadingSection'
import { Order } from './types'
import { searchOrdersByDiscountCode } from '@/lib/orderApi'

export default function OrderTracker() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState<string | null>(null)
  const itemsPerPage = 10

  const handleSearch = async (discountCode: string) => {
    if (!discountCode.trim()) {
      setError('Please enter a discount code')
      return
    }

    setActiveSearch(discountCode)
    setSearchQuery(discountCode)
    setCurrentPage(1)
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use real API instead of dummyOrders
      const filteredOrders = await searchOrdersByDiscountCode(discountCode)

      setOrders(filteredOrders)

      if (filteredOrders.length === 0) {
        setError(`No orders found with discount code "${discountCode}". Please check the code and try again.`)
      }
    } catch (err) {
      setError('An error occurred while searching. Please try again.')
      console.error('Search error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClearSearch = () => {
    setActiveSearch('')
    setSearchQuery('')
    setCurrentPage(1)
    setOrders([])
    setError(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Smooth scroll to top of results
    const resultsElement = document.getElementById('search-results')
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const hasSearched = !!activeSearch
  const totalPages = Math.ceil(orders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = orders.slice(startIndex, endIndex)

  const pagination = {
    currentPage,
    totalPages,
    totalRecords: orders.length,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      <main className="flex-1 py-8">
        {/* Reduced margins: px-2 on mobile, px-4 on larger screens */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:text-3xl">
              Track Your Orders
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl sm:text-base">
              Enter your discount code to view orders
            </p>
          </div>

          {/* Search Section - LEFT ALIGNED */}
          <div className="mb-8">
            <SearchSection
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>

          {/* Error Section */}
          {error && (
            <div className="mb-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div id="search-results">
            {hasSearched && !isLoading && orders.length > 0 && (
              <ResultsTable
                orders={currentOrders}
                pagination={pagination}
                activeSearch={activeSearch}
                onPageChange={handlePageChange}
              />
            )}

            {/* No Results */}
            {hasSearched && !isLoading && orders.length === 0 && !error && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm max-w-4xl mx-auto">
                <div className="p-8 text-center">
                  <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                  <p className="text-gray-600 mb-4">
                    No orders were found with the discount code "{activeSearch}".
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Please check the spelling and try again, or contact customer support if you need assistance.
                  </p>
                  <button
                    onClick={handleClearSearch}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Try Another Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading Section */}
          {hasSearched && isLoading && <LoadingSection />}
        </div>
      </main>
      
    </div>
  )
}