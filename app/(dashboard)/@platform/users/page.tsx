//  src/app/(dashboard)/@platform/users/page.tsx

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUsers } from '@/services/users';
import { UserSearchParams } from '@/types/users';
import { Search, Users, Filter, ChevronLeft, ChevronRight, UserCheck, UserX, Clock, Mail, Phone, Calendar, UserPlus, Edit, Trash2 } from 'react-feather';

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
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  profile_picture?: string;
  roles?: Array<{ name: string; description?: string }>;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [userTypeFilter, setUserTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showPageSizeDropdown, setShowPageSizeDropdown] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [openVerificationDropdown, setOpenVerificationDropdown] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UserSearchParams = {
        skip: (currentPage - 1) * pageSize,
        limit: pageSize,
        search: searchTerm || undefined,
        user_type: userTypeFilter || undefined,
        status: statusFilter || undefined,
      };

      const response: any = await getUsers(params);
      
      // Handle different possible response structures
      const usersData = response.data || response.users || [];
      const total = response.total || response.count || 0;
      
      console.log('Users API Response:', response); // Debug log
      console.log('Sample user data:', usersData[0]); // Debug log to see actual data structure
      
      setUsers(usersData);
      setTotalUsers(total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, userTypeFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleUserTypeFilter = (userType: string) => {
    setUserTypeFilter(userType);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
    setShowPageSizeDropdown(false);
  };

  const handleAddNewUser = () => {
    router.push('create-user');
  };

  const handleEditUser = (userId: string) => {
    // Navigate to full-screen edit page
    router.push(`/users/edit/${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    // TODO: Implement delete user functionality
    console.log('Delete user clicked:', userId);
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive' | 'pending' | 'suspended') => {
    try {
      console.log('Changing status for user:', userId, 'to:', newStatus);
      setOpenStatusDropdown(null);
      
      // Optimistically update the UI immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, status: newStatus }
            : user
        )
      );
      
      // Import dynamically to avoid issues
      const { updateUserStatus } = await import('@/services/users');
      
      // Call the API to update user status in the background
      await updateUserStatus(userId, newStatus);
      
      console.log('✅ Successfully updated user status');
    } catch (error) {
      console.error('❌ Failed to update user status:', error);
      
      // Revert the optimistic update on error
      await fetchUsers();
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user status';
      alert(errorMessage);
    }
  };

  const handleVerificationToggle = async (userId: string) => {
    try {
      console.log('Toggling email verification for user:', userId);
      setOpenVerificationDropdown(null);
      
      // Optimistically update the UI immediately
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, email_verified: !user.email_verified }
            : user
        )
      );
      
      // Import dynamically to avoid issues
      const { verifyUserEmail } = await import('@/services/users');
      
      // Call the API to verify user email in the background
      await verifyUserEmail(userId);
      
      console.log('✅ Successfully toggled email verification');
    } catch (error) {
      console.error('❌ Failed to toggle email verification:', error);
      
      // Revert the optimistic update on error
      await fetchUsers();
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update email verification';
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getUserTypeBadgeColor = (userType: string) => {
    const colors: { [key: string]: string } = {
      platform: 'bg-purple-100 text-purple-800',
      b2c: 'bg-blue-100 text-blue-800',
      b2b: 'bg-blue-100 text-blue-800',
      influencer: 'bg-pink-100 text-pink-800',
    };
    return colors[userType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Helper function to get user status from the status field
  const getUserStatus = (user: User): 'active' | 'inactive' | 'pending' | 'suspended' => {
    if (user.status) {
      const status = user.status.toLowerCase();
      if (status === 'active') return 'active';
      if (status === 'inactive') return 'inactive';
      if (status === 'pending') return 'pending';
      if (status === 'suspended') return 'suspended';
    }
    // Fallback to is_active boolean if status field doesn't exist
    if (typeof user.is_active === 'boolean') {
      return user.is_active ? 'active' : 'inactive';
    }
    return 'pending'; // Default to pending
  };

  // Helper function to determine if user is verified
  const isUserVerified = (user: User): boolean => {
    return user.email_verified === true;
  };

  // Helper function to get status badge styling
  const getStatusBadge = (status: 'active' | 'inactive' | 'pending' | 'suspended') => {
    const badges = {
      active: {
        icon: <UserCheck className="w-3 h-3" />,
        text: 'Active',
        className: 'bg-green-100 text-green-800'
      },
      inactive: {
        icon: <UserX className="w-3 h-3" />,
        text: 'Inactive',
        className: 'bg-gray-100 text-gray-800'
      },
      pending: {
        icon: <Clock className="w-3 h-3" />,
        text: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      },
      suspended: {
        icon: <UserX className="w-3 h-3" />,
        text: 'Suspended',
        className: 'bg-red-100 text-red-800'
      }
    };
    return badges[status];
  };

  // Helper function to get user's primary role from roles array
  const getUserPrimaryRole = (user: User): string | null => {
    if (!user.roles || user.roles.length === 0) return null;
    // The first role in the array is typically the primary role
    return user.roles[0]?.name || null;
  };

  // Helper function to check if user is platform super admin
  const isSuperAdmin = (user: User): boolean => {
    const primaryRole = getUserPrimaryRole(user);
    return primaryRole === 'platform_super_admin';
  };

  // All available statuses
  const allStatuses: Array<'active' | 'inactive' | 'pending' | 'suspended'> = ['active', 'pending', 'inactive', 'suspended'];

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
    <div className="p-4">
      <div className="max-w-full">
        {/* Header with Title and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Users Management</h2>
          <button
            onClick={handleAddNewUser}
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-200"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>

        {/* Search Bar and Filters - Clean and compact */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search Bar - Half width */}
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

          {/* Filters - Stays at the right corner */}
          <div className="flex gap-2">
            <select
              value={userTypeFilter}
              onChange={(e) => handleUserTypeFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-blue-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 min-w-[140px] focus:outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">All User Types</option>
              <option value="platform">Platform</option>
              <option value="b2c">B2C</option>
              <option value="b2b">B2B</option>
              <option value="influencer">Influencer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-sm bg-gray-50 border border-green-200 rounded-md font-medium text-gray-700 hover:bg-gray-100 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-200 min-w-[120px] focus:outline-none cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {/* Table with proper overflow */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200" style={{ overflowX: 'auto', overflowY: 'visible' }}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  User
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Verification
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
                      <p className="text-gray-500">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-red-600">
                      <p className="font-semibold">Error loading users</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-12 h-12 text-gray-400" />
                      <p className="text-gray-500 font-medium">No users found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const userStatus = getUserStatus(user);
                  const statusBadge = getStatusBadge(userStatus);
                  const isVerified = isUserVerified(user);
                  const primaryRole = getUserPrimaryRole(user);
                  const isProtected = isSuperAdmin(user);
                  
                  // Debug log to verify role checking
                  console.log('User:', user.email, 'Primary Role:', primaryRole, 'Is Protected:', isProtected);
                  
                  return (
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

                      {/* User Type Column */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.user_type && (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getUserTypeBadgeColor(user.user_type)}`}>
                            {user.user_type.charAt(0).toUpperCase() + user.user_type.slice(1)}
                          </span>
                        )}
                      </td>

                      {/* Status Column - Read-only for super admins, clickable for others */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isProtected ? (
                          // Read-only status badge for super admins
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
                            {statusBadge.icon}
                            {statusBadge.text}
                          </span>
                        ) : (
                          // Clickable dropdown for other users
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenStatusDropdown(openStatusDropdown === user.id ? null : user.id);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${statusBadge.className}`}
                            >
                              {statusBadge.icon}
                              {statusBadge.text}
                              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Status Dropdown */}
                            {openStatusDropdown === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenStatusDropdown(null)}
                                />
                                <div 
                                  className="absolute left-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                                  style={{
                                    bottom: users.indexOf(user) >= users.length - 2 ? '100%' : 'auto',
                                    top: users.indexOf(user) >= users.length - 2 ? 'auto' : '100%',
                                    marginBottom: users.indexOf(user) >= users.length - 2 ? '0.5rem' : '0',
                                    marginTop: users.indexOf(user) >= users.length - 2 ? '0' : '0.5rem'
                                  }}
                                >
                                  {allStatuses.map((status) => {
                                    const badge = getStatusBadge(status);
                                    const isCurrentStatus = status === userStatus;
                                    return (
                                      <button
                                        key={status}
                                        onClick={() => handleStatusChange(user.id, status)}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                                          isCurrentStatus ? 'bg-gray-50 font-medium' : ''
                                        }`}
                                      >
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${badge.className}`}>
                                          {badge.icon}
                                          {badge.text}
                                        </span>
                                        {isCurrentStatus && (
                                          <svg className="w-4 h-4 ml-auto text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                          </svg>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        )}
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

                      {/* Verification Column - UPDATED TO BE CLICKABLE */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isProtected ? (
                          // Read-only verification badge for super admins
                          isVerified ? (
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
                          )
                        ) : (
                          // Clickable verification toggle for other users
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenVerificationDropdown(openVerificationDropdown === user.id ? null : user.id);
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity ${
                                isVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isVerified ? (
                                <>
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </>
                              ) : (
                                'Unverified'
                              )}
                              <svg className="w-3 h-3 ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Verification Dropdown */}
                            {openVerificationDropdown === user.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenVerificationDropdown(null)}
                                />
                                <div 
                                  className="absolute left-0 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                                  style={{
                                    bottom: users.indexOf(user) >= users.length - 2 ? '100%' : 'auto',
                                    top: users.indexOf(user) >= users.length - 2 ? 'auto' : '100%',
                                    marginBottom: users.indexOf(user) >= users.length - 2 ? '0.5rem' : '0',
                                    marginTop: users.indexOf(user) >= users.length - 2 ? '0' : '0.5rem'
                                  }}
                                >
                                  <button
                                    onClick={() => handleVerificationToggle(user.id)}
                                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                                  >
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                                      isVerified ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {isVerified ? (
                                        'Mark Unverified'
                                      ) : (
                                        <>
                                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                          </svg>
                                          Mark Verified
                                        </>
                                      )}
                                    </span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Actions Column - Hidden for super admins */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isProtected ? (
                          // Empty cell with "I am Papa" text for super admins
                          <div className="flex items-center justify-center">
                            <span className="text-xs text-gray-400 italic font-bold">I am Papa</span>
                          </div>
                        ) : (
                          // Show action buttons for other users
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEditUser(user.id)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Edit user"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete user"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {totalPages > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg">
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