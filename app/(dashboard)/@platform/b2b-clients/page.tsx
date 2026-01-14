'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getUsers } from '@/services/users';
import { UserSearchParams } from '@/types/users';
import { Search, Users, ChevronLeft, ChevronRight, UserCheck, UserX, Mail, Phone, Calendar, UserPlus } from 'react-feather';
import { useRouter } from 'next/navigation';

// Local User interface for this page to avoid type conflicts
interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_type?: string;
  status?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  profile_picture?: string;
}

export default function B2BClients() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UserSearchParams = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchTerm || undefined,
        user_type: 'b2b', // Hardcoded to only fetch B2B users
      };

      const response: any = await getUsers(params);
      
      // Handle different possible response structures
      const usersData = response.data || response.users || [];
      const total = response.total || response.count || 0;
      
      setUsers(usersData);
      setTotalUsers(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch B2B clients');
      console.error('Error fetching B2B clients:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setShowPageSizeDropdown(false);
  };

  const handleAddNewUser = () => {
    // TODO: Implement add new B2B client functionality
    router.push('/create-user?type=b2b');
    // You can open a modal, navigate to a form page, etc.
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getVisiblePages = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage <= 4) {
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push('...');
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        if (totalPages > 6) {
          pages.push('...');
        }
        for (let i = totalPages - 4; i <= totalPages; i++) {
          if (i > 1) {
            pages.push(i);
          }
        }
      } else {
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const startItem = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalUsers);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="min-w-[1200px]">
        {/* Header with Title and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">B2B Clients Management</h2>
          <button
            onClick={handleAddNewUser}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Client</span>
          </button>
        </div>

        {/* Search Bar - Clean and compact with rounded-full style, half width */}
        <div className="mb-4">
          <div className="w-full sm:w-1/2 relative">
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="ml-4 space-y-2">
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                      </td>
                    </tr>
                  ))}
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">No B2B Clients Found</p>
                      <p className="text-gray-400 text-sm">Try adjusting your search criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    {/* User Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                            {user.first_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : 'No Name'}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phone_number && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{user.phone_number}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    {/* Joined Date Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.created_at && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      )}
                    </td>

                    {/* Verification Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          Unverified
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {totalPages > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Left side - Results info and page size selector */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-medium">{startItem}</span> to{' '}
                  <span className="font-medium">{endItem}</span> of{' '}
                  <span className="font-medium">{totalUsers}</span> results
                </span>
                
                {/* Page Size Selector */}
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

              {/* Right side - Page navigation */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:shadow-none transition-all duration-200"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Page Numbers */}
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
                              ? 'bg-pink-600 text-white font-medium shadow-lg shadow-pink-500/20'
                              : 'text-gray-700 hover:bg-gray-100 hover:shadow-md'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next Button */}
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
    </div>
  );
}