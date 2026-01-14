// src/components/dashboard/platform/components/AssignmentCards.tsx
'use client';

import { useState } from 'react';
import { AgentAssignment } from '@/types/assignments';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import InlineSpinner from '@/components/ui/InlineSpinner';
import {
  Calendar,
  Users,
  BarChart,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Archive,
} from 'react-feather';

export type DashboardTab = 'today' | 'all';

interface AssignmentCardsProps {
  assignments: AgentAssignment[];
  selectedAssignment: AgentAssignment | null;
  onAssignmentSelect: (assignment: AgentAssignment) => void;
  loading: boolean;
  error: string | null;
  activeTab: DashboardTab;
}

const AssignmentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          label: 'Pending',
          icon: Clock,
        };
      case 'active':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          label: 'Active',
          icon: CheckCircle,
        };
      case 'completed':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-800',
          label: 'Completed',
          icon: CheckCircle,
        };
      case 'paused':
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: 'Paused',
          icon: AlertCircle,
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          label: status,
          icon: AlertCircle,
        };
    }
  };

  const config = getStatusConfig(status);
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <IconComponent className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

const AssignmentCard = ({
  assignment,
  isSelected,
  onClick,
}: {
  assignment: AgentAssignment;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate completion rate based on active work (excluding archived)
  const activeInfluencers =
    assignment.assigned_influencers_count -
    (assignment.archived_influencers_count || 0);
  const completionRate =
    activeInfluencers > 0
      ? Math.round(
          (assignment.completed_influencers_count / activeInfluencers) * 100,
        )
      : 0;

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 cursor-pointer hover:shadow-md p-4 ${
        isSelected
          ? 'border-teal-500 ring-1 ring-teal-200'
          : 'border-gray-200 hover:border-teal-300'
      }`}
    >
      {/* Compact Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {assignment.campaign.brand_name}
          </h4>
          <AssignmentStatusBadge status={assignment.status.name} />
        </div>
      </div>

      {/* Compact Stats - Now includes 4 columns */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {assignment.assigned_influencers_count}
          </div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {assignment.completed_influencers_count}
          </div>
          <div className="text-xs text-gray-500">Done</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-600">
            {assignment.pending_influencers_count}
          </div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-600">
            {assignment.archived_influencers_count || 0}
          </div>
          <div className="text-xs text-gray-500">Archived</div>
        </div>
      </div>

      {/* Compact Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-teal-600 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{completionRate}% complete</span>
          <span>{formatDate(assignment.assigned_at)}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative group min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-gray-900 mb-1 truncate">
            {assignment.campaign.name}
          </h4>

          {/* Custom Tooltip - positioned above the text */}
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap pointer-events-none">
            {assignment.campaign.name}
            {/* Tooltip arrow */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AssignmentCards({
  assignments,
  selectedAssignment,
  onAssignmentSelect,
  loading,
  error,
  activeTab,
}: AssignmentCardsProps) {
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate cards per row based on screen size (we'll show max 2 rows)
  const getCardsPerRow = () => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      if (width >= 1536) return 6; // 2xl
      if (width >= 1280) return 5; // xl
      if (width >= 1024) return 4; // lg
      if (width >= 768) return 3; // md
      if (width >= 640) return 2; // sm
      return 1; // mobile
    }
    return 4; // default
  };

  const cardsPerRow = getCardsPerRow();
  const cardsPerPage = cardsPerRow * 2; // 2 rows

  // Filter assignments based on search
  const filteredAssignments = assignments.filter((assignment) => {
    if (!searchText) return true;
    const searchLower = searchText.toLowerCase();
    return (
      assignment.campaign.name.toLowerCase().includes(searchLower) ||
      assignment.campaign.brand_name.toLowerCase().includes(searchLower)
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const loadMore = () => {
    setCurrentPage(currentPage + 1);
  };

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchText(value);
    setCurrentPage(0);
  };

  return (
    <div className="bg-transparent">
      {/* Header with Search and Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search assignments..."
            value={searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Pagination Info and Controls */}
        {filteredAssignments.length > cardsPerPage && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {startIndex + 1}-{Math.min(endIndex, filteredAssignments.length)}{' '}
              of {filteredAssignments.length}
            </span>

            <div className="flex items-center space-x-1">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 0}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={goToNextPage}
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800 font-medium">Failed to load assignments</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <InlineSpinner size="md" />
          <span className="ml-3 text-gray-500">
            Loading your assignments...
          </span>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchText
              ? 'No assignments found'
              : activeTab === 'today'
                ? 'No tasks for today'
                : 'No assignments found'}
          </h3>
          <p className="text-gray-500">
            {searchText
              ? 'Try adjusting your search terms.'
              : activeTab === 'today'
                ? 'You have no pending tasks scheduled for today. Great job!'
                : "You haven't been assigned any campaign lists yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Assignment Cards Grid - Max 2 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 mb-6">
            {currentAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                isSelected={selectedAssignment?.id === assignment.id}
                onClick={() => onAssignmentSelect(assignment)}
              />
            ))}
          </div>

          {/* Load More Button (Alternative to arrows) */}
          {filteredAssignments.length > cardsPerPage &&
            currentPage < totalPages - 1 && (
              <div className="text-center">
                <button
                  onClick={loadMore}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <MoreHorizontal className="w-4 h-4 mr-2" />
                  Load More ({filteredAssignments.length - endIndex} remaining)
                </button>
              </div>
            )}
        </>
      )}
    </div>
  );
}
