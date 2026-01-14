// src/components/dashboard/platform/components/AssignmentSelector.tsx
'use client';

import { AgentAssignment } from '@/types/assignments';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { RefreshCw, Calendar, Users, BarChart, Clock } from 'react-feather';

interface AssignmentSelectorProps {
  assignments: AgentAssignment[];
  selectedAssignment: AgentAssignment | null;
  onAssignmentSelect: (assignment: AgentAssignment) => void;
  loading: boolean;
  error: string | null;
}

const AssignmentStatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' };
      case 'active':
        return { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' };
      case 'completed':
        return { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' };
      case 'paused':
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Paused' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    }
  };

  const config = getStatusConfig(status);
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

export default function AssignmentSelector({
  assignments,
  selectedAssignment,
  onAssignmentSelect,
  loading,
  error
}: AssignmentSelectorProps) {
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Your Agent Assignments</h2>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="flex items-center">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-500">Loading assignments...</span>
            </div>
          )}
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800 font-medium">Failed to load assignments</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-3 text-gray-500">Loading your assignments...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No assignments found</p>
          <p className="text-gray-400 text-sm">You don't have any campaign assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              onClick={() => onAssignmentSelect(assignment)}
              className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedAssignment?.id === assignment.id
                  ? 'border-teal-500 bg-teal-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {assignment.campaign.name}
                    </h3>
                    <AssignmentStatusBadge status={assignment.status.name} />
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700">Brand:</span>
                      <span className="ml-1">{assignment.campaign.brand_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>Assigned {formatDate(assignment.assigned_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-gray-600">
                        <span className="font-medium text-gray-900">{assignment.assigned_influencers_count}</span> assigned
                      </span>
                    </div>
                    <div className="flex items-center">
                      <BarChart className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-gray-600">
                        <span className="font-medium text-gray-900">{assignment.completed_influencers_count}</span> completed
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-gray-600">
                        <span className="font-medium text-gray-900">{assignment.pending_influencers_count}</span> pending
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-lg font-bold text-gray-900">
                    {Math.round((assignment.completed_influencers_count / assignment.assigned_influencers_count) * 100) || 0}%
                  </div>
                  <div className="text-sm text-gray-500">Complete</div>
                </div>
              </div>

              <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-blue-500 transition-all duration-300"
                  style={{
                    width: `${(assignment.completed_influencers_count / assignment.assigned_influencers_count) * 100 || 0}%`
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}