// src/app/(dashboard)/@platform/billing/features/page.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight,
  CheckCircle, XCircle, AlertCircle} from 'react-feather';
import { getFeatures, deleteFeature } from '@/services/billing/feature';
import FeatureForm from '@/components/billing/features/FeatureForm';
import { Feature, CATEGORY_OPTIONS, UNIT_TYPE_OPTIONS } from '@/types/billing/features';

// Filter options
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function FeaturesPage() {
  const router = useRouter();

  // State Management
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalFeatures, setTotalFeatures] = useState(0);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  // Fetch Features Function
  const fetchFeatures = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object
      const filters: any = {
        page: currentPage,
        page_size: pageSize,
        is_deleted: false,
        sort_by: 'display_order',
        sort_order: 'asc',
      };

      // Add optional filters
      if (searchTerm) filters.search = searchTerm;
      if (categoryFilter !== 'all') filters.category = categoryFilter;
      if (unitTypeFilter !== 'all') filters.unit_type = unitTypeFilter;
      if (statusFilter === 'active') {
        filters.is_active = true;
      } else if (statusFilter === 'inactive') {
        filters.is_active = false;
      }

      // Call client service
      const response = await getFeatures(filters);
      
      setFeatures(response.items || []);
      setTotalFeatures(response.total || 0);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch features';
      setError(errorMessage);
      console.error('Error fetching features:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, categoryFilter, unitTypeFilter, statusFilter]);

  // Effects
  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleUnitTypeFilter = (value: string) => {
    setUnitTypeFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setShowPageSizeDropdown(false);
  };

  const handleAddNewFeature = () => {
    setEditingFeatureId(null);
    setShowForm(true);
  };

  const handleEditFeature = (featureId: string) => {
    setEditingFeatureId(featureId);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingFeatureId(null);
    fetchFeatures();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingFeatureId(null);
  };

  const handleDeleteFeature = async (featureId: string, featureName: string) => {
    if (!confirm(`Are you sure you want to delete the feature "${featureName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteFeature(featureId);
      await fetchFeatures();
    } catch (err: any) {
      console.error('Failed to delete feature:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete feature';
      alert(errorMessage);
    }
  };

  // Helper Functions
  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      core: 'bg-blue-100 text-blue-800 border-blue-200',
      analytics: 'bg-purple-100 text-purple-800 border-purple-200',
      communication: 'bg-green-100 text-green-800 border-green-200',
      team: 'bg-orange-100 text-orange-800 border-orange-200',
      advanced: 'bg-pink-100 text-pink-800 border-pink-200',
      support: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUnitTypeBadge = (unitType: string) => {
    const labels: Record<string, string> = {
      count: 'Count',
      per_month: 'Per Month',
      boolean: 'Boolean',
      days: 'Days',
    };
    return labels[unitType] || unitType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Pagination Calculations
  const totalPages = Math.ceil(totalFeatures / pageSize);
  const startItem = totalFeatures === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalFeatures);

  // Get visible page numbers
  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-4">
      <div className="max-w-full">
        {/* Header with Title and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Features Management</h2>
          <button
            onClick={handleAddNewFeature}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Feature</span>
          </button>
        </div>

        {/* Search Bar and Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Bar */}
          <div className="w-full sm:w-1/2 relative">
            <input
              type="text"
              placeholder="Search by name, code, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-blue-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={unitTypeFilter}
              onChange={(e) => handleUnitTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-purple-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
            >
              {UNIT_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-green-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-colors"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Feature
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Unit Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Display Order
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Created
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                      <p className="text-gray-500">Loading features...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <p className="font-semibold">Error loading features</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : features.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-semibold">No features found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                features.map((feature) => (
                  <tr key={feature.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* <div className="text-sm font-medium text-gray-900">
                          {feature.name}
                        </div>
                        {feature.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {feature.description}
                          </div>
                        )}
                      </div>
                    </td> */}
                     {/* First Letter Box */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                          {feature.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      </div>
                      {/* Feature Name & Description */}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {feature.name || 'No Name'}
                        </div>
                        {feature.description && (
                          <div className="text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {feature.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                        {feature.code}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryBadgeColor(feature.category)}`}>
                        {feature.category.charAt(0).toUpperCase() + feature.category.slice(1)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                        {getUnitTypeBadge(feature.unit_type)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {feature.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium border border-green-200">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium border border-gray-200">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-medium">
                        {feature.display_order}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs text-gray-500">
                        {formatDate(feature.created_at)}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditFeature(feature.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit feature"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFeature(feature.id, feature.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete feature"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalFeatures}</span> results
                </span>
                
                <div className="relative">
                  <button
                    onClick={() => setShowPageSizeDropdown(!showPageSizeDropdown)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <span className="text-gray-700">{pageSize} per page</span>
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform ${showPageSizeDropdown ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showPageSizeDropdown && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowPageSizeDropdown(false)}
                      />
                      <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {[10, 25, 50, 100].map((size) => (
                          <button
                            key={size}
                            onClick={() => handlePageSizeChange(size)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-pink-50 hover:text-pink-600 transition-colors ${
                              pageSize === size ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700'
                            }`}
                          >
                            {size} per page
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {getVisiblePages().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-3 py-2 text-sm text-gray-400">...</span>
                      ) : (
                        <button
                          onClick={() => setCurrentPage(page as number)}
                          className={`min-w-[40px] px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            page === currentPage
                              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium shadow-md'
                              : 'text-gray-700 hover:bg-gray-100 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Form Modal */}
      {showForm && (
        <FeatureForm
          featureId={editingFeatureId}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}