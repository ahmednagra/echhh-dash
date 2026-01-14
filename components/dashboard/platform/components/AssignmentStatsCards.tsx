// src/components/dashboard/platform/components/AssignmentStatsCards.tsx
'use client';

import { useState } from 'react';
import { AgentAssignment } from '@/types/assignments';
import { 
  Users, 
  Eye, 
  MessageSquare, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle,
  BarChart,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Archive
} from 'react-feather';

interface AssignmentStatsCardsProps {
  assignment: AgentAssignment;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  showToggle?: boolean;
}

export default function AssignmentStatsCards({ 
  assignment, 
  isCollapsed = true, 
  onToggleCollapse,
  showToggle = true 
}: AssignmentStatsCardsProps) {
  // Internal state for collapse if not controlled externally
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  
  // Determine which collapse state to use
  const collapsed = onToggleCollapse ? isCollapsed : internalCollapsed;
  const toggleCollapse = onToggleCollapse || (() => setInternalCollapsed(!internalCollapsed));
  
  // Calculate completion rate: completed / (assigned - archived) * 100
  // This way we calculate completion based on active work, not including archived ones
  const activeInfluencers = assignment.assigned_influencers_count - (assignment.archived_influencers_count || 0);
  const completionRate = activeInfluencers > 0 
    ? Math.round((assignment.completed_influencers_count / activeInfluencers) * 100)
    : 0;

  const pendingRate = assignment.assigned_influencers_count > 0 
    ? Math.round((assignment.pending_influencers_count / assignment.assigned_influencers_count) * 100)
    : 0;

  const archivedRate = assignment.assigned_influencers_count > 0 
    ? Math.round(((assignment.archived_influencers_count || 0) / assignment.assigned_influencers_count) * 100)
    : 0;

  const cards = [
    {
      title: 'Total Assigned',
      value: assignment.assigned_influencers_count.toString(),
      icon: <Users className="w-8 h-8 text-blue-500" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      subtitle: 'Influencers assigned to you'
    },
    {
      title: 'Completed',
      value: assignment.completed_influencers_count.toString(),
      icon: <CheckCircle className="w-8 h-8 text-green-500" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-500',
      subtitle: `${completionRate}% of active work`
    },
    {
      title: 'Pending',
      value: assignment.pending_influencers_count.toString(),
      icon: <Clock className="w-8 h-8 text-orange-500" />,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-500',
      subtitle: `${pendingRate}% remaining work`
    },
    {
      title: 'Archived',
      value: (assignment.archived_influencers_count || 0).toString(),
      icon: <Archive className="w-8 h-8 text-gray-500" />,
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-500',
      subtitle: `${archivedRate}% archived`
    },
    {
      title: 'Completion Rate',
      value: `${completionRate}%`,
      icon: <TrendingUp className="w-8 h-8 text-purple-500" />,
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-500',
      subtitle: 'Based on active work'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
      {/* Header with Toggle Button */}
      {showToggle && (
        <div className="px-6 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Assignment Statistics</h3>
            </div>
            <button
              onClick={toggleCollapse}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              {collapsed ? 'Show' : 'Hide'}
              {collapsed ? (
                <ChevronDown className="w-4 h-4 ml-1" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Content */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        collapsed ? 'max-h-0' : 'max-h-[400px]'
      }`}>
        <div className="p-6">
          {/* Single row grid for all 5 cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((card, index) => (
              <div 
                key={index} 
                className={`${card.bgColor} rounded-lg shadow-md p-4 border-l-4 ${card.borderColor} transform transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{card.value}</p>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Collapsed Summary (shown when collapsed) */}
      {collapsed && showToggle && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              <strong>{assignment.assigned_influencers_count}</strong> assigned • 
              <strong className="text-green-600 ml-1">{assignment.completed_influencers_count}</strong> completed • 
              <strong className="text-orange-600 ml-1">{assignment.pending_influencers_count}</strong> pending •
              <strong className="text-gray-600 ml-1">{assignment.archived_influencers_count || 0}</strong> archived
            </span>
            <span className="text-purple-600 font-medium">{completionRate}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
}