// src/components/dashboard/platform/components/TodayTasks.tsx
'use client';

import { Clock, Calendar, CheckSquare } from 'react-feather';
import { useState, useEffect } from 'react';
import { getTodayAssignedInfluencers } from '@/services/assignments';
import { getAgentAssignments } from '@/services/assignments/assignments.client';
import { AssignmentInfluencersResponse, AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import { AgentAssignment, MessageTemplate } from '@/types/assignments';
import MembersTable from './MembersTable';
import TableSkeleton from '@/components/ui/TableSkeleton';

interface TodayTasksProps {
  availableStatuses: Status[];
  onEditCampaignStatus: (influencer: AssignmentInfluencer) => void;
  onViewInfluencer: (influencer: AssignmentInfluencer) => void;
  onAddContact: (influencer: AssignmentInfluencer) => void;
  onViewContacts: (influencer: AssignmentInfluencer) => void;
  onInfluencerUpdate: (influencer: AssignmentInfluencer) => void;
}

export default function TodayTasks({
  availableStatuses,
  onEditCampaignStatus,
  onViewInfluencer,
  onAddContact,
  onViewContacts,
  onInfluencerUpdate
}: TodayTasksProps) {
  const [data, setData] = useState<AssignmentInfluencersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allAssignments, setAllAssignments] = useState<AgentAssignment[]>([]);
  const [assignmentMap, setAssignmentMap] = useState<Record<string, AgentAssignment>>({});
  
  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Load tasks when pagination changes
  useEffect(() => {
    if (currentPage >= 1 ) { // Don't reload on initial mount
      loadTodayTasks();
    }
  }, [currentPage, pageSize]);

  const loadTodayTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both today's influencers AND all assignments (to get message templates)
      const [todayResponse, assignmentsResponse] = await Promise.all([
        getTodayAssignedInfluencers(currentPage, pageSize), // Pass pagination parameters
        getAgentAssignments()
      ]);
      
      setData(todayResponse);
      setAllAssignments(assignmentsResponse.assignments || []);
      
      // Create a map of assignment_id -> AgentAssignment for quick lookup
      const assignmentLookup: Record<string, AgentAssignment> = {};
      assignmentsResponse.assignments?.forEach(assignment => {
        assignmentLookup[assignment.id] = assignment;
      });
      setAssignmentMap(assignmentLookup);
      
      console.log('Today Tasks Data:', todayResponse);
      console.log('All Assignments Data:', assignmentsResponse);
      console.log('Assignment Map:', assignmentLookup);
      
    } catch (err) {
      console.error('Error loading today tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load today tasks');
    } finally {
      setLoading(false);
    }
  };

  // Get the correct assignment for a given influencer (with message templates)
  const getAssignmentForInfluencer = (influencer: AssignmentInfluencer): AgentAssignment | null => {
    const assignmentId = influencer.agent_assignment_id;
    const assignment = assignmentMap[assignmentId];
    
    if (assignment) {
      console.log('Found real assignment with message templates:', {
        assignmentId,
        messageTemplatesCount: assignment.campaign.message_templates.length,
        templates: assignment.campaign.message_templates
      });
      return assignment;
    }
    
    console.log('No assignment found for influencer:', influencer.id, 'assignmentId:', assignmentId);
    return null;
  };

  // Create a representative assignment object for the table
  // Use the first influencer's assignment (which has real message templates)
  const getTableAssignment = (): AgentAssignment | null => {
    if (!data?.influencers?.length) return null;
    
    const firstInfluencer = data.influencers[0];
    const realAssignment = getAssignmentForInfluencer(firstInfluencer);
    
    if (realAssignment) {
      // Use the real assignment data (including message templates)
      return realAssignment;
    }
    
    // Fallback if no real assignment found
    return createFallbackAssignment();
  };

  // Create proper fallback assignment with complete structure
  const createFallbackAssignment = (): AgentAssignment => {
    return {
      id: 'fallback-today-tasks',
      outreach_agent_id: 'fallback-agent',
      campaign_list_id: 'fallback-list',
      status_id: 'active',
      assigned_influencers_count: data?.influencers?.length || 0,
      completed_influencers_count: 0,
      pending_influencers_count: data?.influencers?.length || 0,
      archived_influencers_count: 0,
      assigned_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      status: {
        id: 'active',
        name: 'Active'
      },
      campaign: {
        id: 'fallback-campaign',
        name: 'Today Tasks Campaign',
        brand_name: 'Today Tasks',
        description: 'Fallback assignment',
        status_id: 'active',
        start_date: new Date().toISOString(),
        end_date: null,
        message_templates: []
      },
      campaign_list: {
        id: 'fallback-list',
        campaign_id: 'fallback-campaign',
        name: 'Fallback List',
        description: 'Fallback list',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
  };

  // Current type for table (always active for today tasks)
  const currentType: 'active' | 'archived' | 'completed' = 'active';

  // Use actual pagination from API response
  const tablePagination = {
    page: data?.pagination?.page || currentPage,
    page_size: data?.pagination?.page_size || pageSize,
    total_items: data?.pagination?.total_items || 0,
    total_pages: data?.pagination?.total_pages || 1,
    has_next: data?.pagination?.has_next || false,
    has_previous: data?.pagination?.has_previous || false
  };

  // Handle page changes - now actually updates the state and triggers API call
  const handlePageChange = (page: number) => {
    console.log('Page change requested for today tasks:', page);
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    console.log('Page size change requested for today tasks:', size);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleTypeChange = (type: 'active' | 'archived' | 'completed') => {
    console.log('Type change requested for today tasks:', type);
    // Today tasks doesn't support type changes, but keep for compatibility
  };

  const tableAssignment = getTableAssignment();

  // Debug log for assignment and message templates
  if (tableAssignment) {
    console.log('Final Table Assignment:', {
      assignmentId: tableAssignment.id,
      campaignName: tableAssignment.campaign.name,
      messageTemplatesCount: tableAssignment.campaign.message_templates.length,
      messageTemplates: tableAssignment.campaign.message_templates,
      approachUsed: tableAssignment.id.includes('fallback') ? 'Fallback Assignment' : 'Real Assignment with Templates'
    });
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Today's Assignments</h3>
            <p className="text-sm text-gray-600">Loading your tasks...</p>
          </div>
          
          {/* Professional skeleton instead of spinner */}
          <TableSkeleton 
            columns={7}        // 7 main columns
            rows={5}           // 5 skeleton rows
            showCheckbox={false}
            showActionColumn={true}
            className="rounded-none"
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Tasks</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadTodayTasks}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.influencers.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tasks for Today</h3>
          <p className="text-gray-600 mb-4">
            You have no pending tasks scheduled for today. Great job!
          </p>
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Check back tomorrow</span>
            </div>
            <div className="flex items-center">
              <CheckSquare className="w-4 h-4 mr-2" />
              <span>All caught up</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render table only if we have a valid assignment
  if (!tableAssignment) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Assignment Data</h3>
          <p className="text-gray-600">Could not extract assignment information from API response.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Advanced Table Section - Same approach as All Assignments */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Today's Assignments</h3>
          <p className="text-sm text-gray-600">
            {tablePagination.total_items} influencer{tablePagination.total_items !== 1 ? 's' : ''} assigned for today
          </p>
        </div>
        
        {/* Using the same MembersTable component as All Assignments */}
        <MembersTable
          members={data.influencers}
          loading={false}
          error={null}
          pagination={tablePagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onEditCampaignStatus={onEditCampaignStatus}
          onViewMember={onViewInfluencer}
          onAddContact={onAddContact}
          onViewContacts={onViewContacts}
          availableStatuses={availableStatuses}
          onTypeChange={handleTypeChange}
          currentType={currentType}
          assignment={tableAssignment}
          onMemberUpdate={onInfluencerUpdate}
          showCampaignColumn={true}
          assignmentMap={assignmentMap}
        />
      </div>
    </div>
  );
}