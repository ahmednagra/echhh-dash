// src/components/dashboard/outreach-agents/table/TableRow.tsx
'use client';

import React, { useState } from 'react';
import { OutreachAgent } from '@/types/outreach-agents';
import { formatRelativeTime } from '@/utils/formatters';
import { getAgentTypeBadge, getStatusBadge, getAvailabilityBadge } from '@/utils/badge-helpers';
import { getUserInitials } from '@/utils/string-helpers';
import ActionDropdown from './ActionDropdown';
import { useRouter } from 'next/navigation';

interface TableRowProps {
  agent: OutreachAgent;
}

const TableRow: React.FC<TableRowProps> = ({ agent }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Get badge configurations
  const typeBadge = getAgentTypeBadge(agent.outreach_agent_types?.name || '');
  const statusBadge = getStatusBadge(agent.outreach_agent_status?.name || '');
  const availabilityBadge = getAvailabilityBadge(agent.is_available_for_assignment);
  const router = useRouter();

  const handleViewProfile = (e: React.MouseEvent) => {
    console.log(`🔍 Navigating to agent profile: (ID: ${agent.id})`);
    const url = `/outreach-agents/${agent.id}`;
    window.open(url, '_blank');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors border-b border-gray-100">
      {/* AGENT Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div 
          className="flex items-center cursor-pointer group relative" 
          onClick={handleViewProfile}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onMouseMove={handleMouseMove}
        >
          {/* Light Slim Tooltip - Follows Cursor */}
          {showTooltip && (
            <div 
              className="fixed z-[9999] pointer-events-none animate-in fade-in duration-150"
              style={{
                left: `${mousePosition.x + 12}px`,
                top: `${mousePosition.y + 12}px`,
              }}
            >
              <div className="relative">
                {/* Subtle glow */}
                <div className="absolute inset-0 bg-indigo-200 rounded-full blur-sm opacity-30"></div>
                
                {/* Main tooltip - extra slim */}
                <div className="relative bg-gradient-to-r from-indigo-50 to-purple-50 
                              border border-indigo-200/60 
                              px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
                  <span className="text-xs font-medium text-indigo-700 whitespace-nowrap">
                    Click to view profile
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Profile Image/Avatar with Enhanced Animation */}
          <div className="flex-shrink-0 h-10 w-10 relative transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
            {agent.assigned_user.profile_image_url ? (
              <img
                className="h-10 w-10 rounded-full object-cover transition-all duration-300 
                         shadow-md group-hover:shadow-xl
                         ring-2 ring-transparent group-hover:ring-indigo-400 group-hover:ring-offset-2
                         brightness-100 group-hover:brightness-110"
                src={agent.assigned_user.profile_image_url}
                alt={agent.assigned_user.full_name}
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 
                            flex items-center justify-center 
                            transition-all duration-300 
                            shadow-md group-hover:shadow-xl
                            ring-2 ring-transparent group-hover:ring-indigo-400 group-hover:ring-offset-2
                            group-hover:from-indigo-200 group-hover:to-indigo-100">
                <span className="text-indigo-600 font-semibold text-sm group-hover:scale-110 transition-transform duration-300">
                  {getUserInitials(agent.assigned_user.full_name)}
                </span>
              </div>
            )}
            
            {/* Animated Ring Pulse Effect */}
            <div className="absolute inset-0 rounded-full bg-indigo-300 opacity-0 group-hover:opacity-15 
                          group-hover:animate-ping transition-opacity duration-300"></div>
          </div>

          {/* Name with Enhanced Animation */}
          <div className="ml-4 transform transition-all duration-300 group-hover:translate-x-1">
            <div className="text-sm font-medium text-gray-900 
                          group-hover:text-indigo-600 
                          transition-all duration-300
                          relative inline-block">
              {agent.assigned_user.full_name}
              
              {/* Animated Underline */}
              <span className="absolute left-0 -bottom-0.5 w-0 h-0.5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 
                             group-hover:w-full transition-all duration-300 ease-out"></span>
            </div>
          </div>
        </div>
      </td>

      {/* TYPE Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${typeBadge.color}`}>
          <span className="capitalize">{agent.outreach_agent_types?.name || 'Unknown'}</span>
        </span>
      </td>

      {/* STATUS Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge}`}>
          {agent.outreach_agent_status?.name || 'Unknown'}
        </span>
      </td>

      {/* CAMPAIGNS (total assignments) Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{agent.total_assignments}</span>
      </td> 

      {/* ✨ NEW COLUMN: ASSIGNMENTS-INFLUENCERS - ADD THIS HERE! */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-semibold text-indigo-900">{agent.total_assigned_influencers || 0}</span>
      </td>

      {/* PENDING (Active) Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{agent.total_active_influencers}</span>
      </td>

      {/* COMPLETED Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{agent.total_completed_influencers}</span>
      </td>

      {/* ARCHIVED Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{agent.total_archived_influencers}</span>
      </td>

      {/* PROGRESS Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-[80px]">
            <div className="text-xs font-medium text-gray-900 mb-1">
              {agent.progress?.toFixed(1) || '0.0'}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-teal-600 h-1.5 rounded-full transition-all" 
                style={{ width: `${Math.min(agent.progress || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </td>

      {/* MESSAGES TODAY Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
        <span className="font-medium">{agent.messages_sent_today}</span>
      </td>

      {/* LAST ACTIVITY Column */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {formatRelativeTime(agent.last_activity_at)}
      </td>

      {/* AVAILABLE Column */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${availabilityBadge}`}>
          {agent.is_available_for_assignment ? '✓ Available' : '✗ Busy'}
        </span>
      </td>

      {/* ACTIONS Column */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <ActionDropdown 
          agentId={agent.id} 
          agentName={agent.assigned_user.full_name}
        />
      </td>
    </tr>
  );
};

export default TableRow;