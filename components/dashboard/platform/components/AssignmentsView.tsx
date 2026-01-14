// src/components/dashboard/platform/components/AssignmentsView.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentAssignment } from '@/types/assignments';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import { 
  getAgentAssignments, 
  getAgentAssignmentsById, 
  getAssignmentInfluencers,
  CompletionStatus  // Import from client service
} from '@/services/assignments/assignments.client';
import AssignmentCards from './AssignmentCards';
import AssignmentContentArea from './AssignmentContentArea';
import { ChevronDown, ChevronUp, BarChart } from 'react-feather';

interface AssignmentsViewProps {
  availableStatuses: Status[];
  onEditCampaignStatus: (influencer: AssignmentInfluencer) => void;
  onViewInfluencer: (influencer: AssignmentInfluencer) => void;
  onAddContact: (influencer: AssignmentInfluencer) => void;
  onViewContacts: (influencer: AssignmentInfluencer) => void;
  onInfluencerUpdate: (influencer: AssignmentInfluencer) => void;
  /** Agent ID for manager view (fetches specific agent's assignments) */
  agentId?: string;
  /** 
   * Filter assignments by completion status:
   * - 'incomplete': Assignments with active influencers (default for active work)
   * - 'completed': Assignments where all influencers are archived/completed
   * - undefined: All assignments
   */
  completionStatus?: CompletionStatus;
  /** Optional title override for the section header */
  sectionTitle?: string;
}

export default function AssignmentsView({
  availableStatuses,
  onEditCampaignStatus,
  onViewInfluencer,
  onAddContact,
  onViewContacts,
  onInfluencerUpdate,
  agentId,
  completionStatus = 'incomplete', // Default to showing incomplete/active assignments
  sectionTitle = 'Assignment Selection'
}: AssignmentsViewProps) {
  const [allAssignments, setAllAssignments] = useState<AgentAssignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  
  const [selectedAssignment, setSelectedAssignment] = useState<AgentAssignment | null>(null);
  const [assignmentInfluencers, setAssignmentInfluencers] = useState<AssignmentInfluencer[]>([]);
  const [influencersLoading, setInfluencersLoading] = useState(false);
  const [influencersError, setInfluencersError] = useState<string | null>(null);
  const [currentInfluencerType, setCurrentInfluencerType] = useState<'active' | 'archived' | 'completed'>('active');
  const [influencersPagination, setInfluencersPagination] = useState({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 1,
    has_next: false,
    has_previous: false
  });

  // Collapsible states
  const [isAssignmentsCollapsed, setIsAssignmentsCollapsed] = useState(true);
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(true);

  // Use ref to track if this is the initial mount
  const isInitialMount = useRef(true);

  // Handle influencer update
  const handleInfluencerUpdate = useCallback((updatedInfluencer: AssignmentInfluencer) => {
    console.log('🔄 AssignmentsView: Handling influencer update for ID:', updatedInfluencer.id);
    
    // Update the local assignmentInfluencers array
    setAssignmentInfluencers(prevInfluencers => {
      const updatedInfluencers = prevInfluencers.map(influencer => {
        if (influencer.id === updatedInfluencer.id) {
          console.log('✅ Found matching influencer, updating:', {
            id: influencer.id,
            name: influencer.campaign_influencer?.social_account?.full_name,
            oldAttempts: influencer.attempts_made,
            newAttempts: updatedInfluencer.attempts_made,
            oldStatus: influencer.status?.name,
            newStatus: updatedInfluencer.status?.name
          });
          
          // Return completely new object reference to ensure React re-renders
          return {
            ...updatedInfluencer,
            status: { ...updatedInfluencer.status },
            campaign_influencer: {
              ...updatedInfluencer.campaign_influencer,
              social_account: { ...updatedInfluencer.campaign_influencer.social_account }
            }
          };
        }
        return influencer;
      });
      
      return updatedInfluencers;
    });
    
    // Also call the parent's onInfluencerUpdate callback if it exists
    if (onInfluencerUpdate) {
      onInfluencerUpdate(updatedInfluencer);
    }
  }, [onInfluencerUpdate]);

  // Calculate summary statistics
  const getTotalStats = () => {
    const totalAssignments = allAssignments.length;
    const totalInfluencers = allAssignments.reduce((sum, assignment) => sum + assignment.assigned_influencers_count, 0);
    const totalCompleted = allAssignments.reduce((sum, assignment) => sum + assignment.completed_influencers_count, 0);
    const totalPending = allAssignments.reduce((sum, assignment) => sum + assignment.pending_influencers_count, 0);
    const activeAssignments = allAssignments.filter(assignment => assignment.status?.name?.toLowerCase() === 'active').length;
    
    return {
      totalAssignments,
      totalInfluencers,
      totalCompleted,
      totalPending,
      activeAssignments
    };
  };

  // Fetch assignment influencers
  const fetchAssignmentInfluencers = async (
    assignmentId: string, 
    page: number, 
    pageSize: number, 
    type?: 'active' | 'archived' | 'completed'
  ) => {
    try {
      setInfluencersLoading(true);
      setInfluencersError(null);
      
      const response = await getAssignmentInfluencers(assignmentId, page, pageSize, type);
      setAssignmentInfluencers(response.influencers || []);
      setInfluencersPagination(response.pagination);
    } catch (error) {
      console.error('💥 Error fetching assignment influencers:', error);
      setInfluencersError(error instanceof Error ? error.message : 'Failed to load assignment influencers');
    } finally {
      setInfluencersLoading(false);
    }
  };

  // Fetch all assignments with completion status filter
  const fetchAllAssignments = useCallback(async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      
      // Clear previous state
      setAllAssignments([]);
      setSelectedAssignment(null);
      setAssignmentInfluencers([]);
      
      console.log('📊 AssignmentsView: Fetching assignments...', { 
        agentId: agentId || 'logged-in user',
        completionStatus,
        sectionTitle
      });
      
      // Determine which API to call based on whether we have an agentId
      let response;
      if (agentId) {
        console.log(`📞 AssignmentsView: Calling getAgentAssignmentsById with agentId=${agentId}, completionStatus=${completionStatus}`);
        response = await getAgentAssignmentsById(agentId, completionStatus);
      } else {
        console.log(`📞 AssignmentsView: Calling getAgentAssignments with completionStatus=${completionStatus}`);
        response = await getAgentAssignments(completionStatus);
      }
      
      console.log('📦 AssignmentsView: Assignments response:', {
        count: response.assignments?.length || 0,
        assignments: response.assignments?.map(a => ({ id: a.id, name: a.campaign?.name }))
      });
      
      setAllAssignments(response.assignments || []);
      
      // Auto-select first assignment if available
      if (response.assignments && response.assignments.length > 0) {
        const firstAssignment = response.assignments[0];
        setSelectedAssignment(firstAssignment);
        
        // For completed assignments, default to showing 'completed' influencers
        const defaultInfluencerType = completionStatus === 'completed' ? 'completed' : 'active';
        setCurrentInfluencerType(defaultInfluencerType);
        
        console.log(`📋 AssignmentsView: Auto-selecting first assignment and fetching ${defaultInfluencerType} influencers`);
        await fetchAssignmentInfluencers(firstAssignment.id, 1, 10, defaultInfluencerType);
      }
    } catch (error) {
      console.error('💥 AssignmentsView: Error fetching assignments:', error);
      setAssignmentsError(error instanceof Error ? error.message : 'Failed to load assignments');
      setAllAssignments([]);
    } finally {
      setAssignmentsLoading(false);
    }
  }, [agentId, completionStatus, sectionTitle]);

  // Load assignments on component mount or when dependencies change
  useEffect(() => {
    console.log('🔄 AssignmentsView useEffect triggered:', {
      agentId,
      completionStatus,
      isInitialMount: isInitialMount.current
    });
    
    fetchAllAssignments();
    
    // After first render, mark as no longer initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [fetchAllAssignments]);

  // Handlers
  const handleAssignmentSelect = async (assignment: AgentAssignment) => {
    if (selectedAssignment?.id === assignment.id) return;
    
    setSelectedAssignment(assignment);
    
    // For completed assignments, default to showing 'completed' influencers
    const defaultInfluencerType = completionStatus === 'completed' ? 'completed' : 'active';
    setCurrentInfluencerType(defaultInfluencerType);
    setInfluencersPagination(prev => ({ ...prev, page: 1 }));
    await fetchAssignmentInfluencers(assignment.id, 1, influencersPagination.page_size, defaultInfluencerType);
  };

  const handlePageChange = (page: number) => {
    if (selectedAssignment && page !== influencersPagination.page) {
      fetchAssignmentInfluencers(selectedAssignment.id, page, influencersPagination.page_size, currentInfluencerType);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (selectedAssignment && size !== influencersPagination.page_size) {
      fetchAssignmentInfluencers(selectedAssignment.id, 1, size, currentInfluencerType);
    }
  };

  const handleInfluencerTypeChange = (type: 'active' | 'archived' | 'completed') => {
    if (type === currentInfluencerType) return;
    
    setCurrentInfluencerType(type);
    if (selectedAssignment) {
      fetchAssignmentInfluencers(selectedAssignment.id, 1, influencersPagination.page_size, type);
    }
  };

  const stats = getTotalStats();

  return (
    <div className="space-y-3">
      {/* Assignment Cards Section - Collapsible with enhanced styling */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with Toggle Button */}
        <div className="px-6 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{sectionTitle}</h3>
            </div>
            <button
              onClick={() => setIsAssignmentsCollapsed(!isAssignmentsCollapsed)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              {isAssignmentsCollapsed ? 'Show' : 'Hide'}
              {isAssignmentsCollapsed ? (
                <ChevronDown className="w-4 h-4 ml-1" />
              ) : (
                <ChevronUp className="w-4 h-4 ml-1" />
              )}
            </button>
          </div>
        </div>
        
        {/* Collapsible Content */}
        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isAssignmentsCollapsed ? 'max-h-0' : 'max-h-[600px]'
        }`}>
          <div className="p-6">
            <AssignmentCards
              assignments={allAssignments}
              selectedAssignment={selectedAssignment}
              onAssignmentSelect={handleAssignmentSelect}
              loading={assignmentsLoading}
              error={assignmentsError}
              activeTab="all"
            />
          </div>
        </div>

        {/* Collapsed Summary (shown when collapsed) */}
        {isAssignmentsCollapsed && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <BarChart className="w-4 h-4 text-blue-500 mr-1" />
                  <span><strong className="text-gray-900">{stats.totalAssignments}</strong> total assignments</span>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-blue-600 font-medium">{stats.activeAssignments} active</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Content Area - With collapsible stats */}
      {selectedAssignment && (
        <AssignmentContentArea
          assignment={selectedAssignment}
          influencers={assignmentInfluencers}
          influencersLoading={influencersLoading}
          influencersError={influencersError}
          pagination={influencersPagination}
          currentInfluencerType={currentInfluencerType}
          availableStatuses={availableStatuses}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onInfluencerTypeChange={handleInfluencerTypeChange}
          onEditCampaignStatus={onEditCampaignStatus}
          onViewInfluencer={onViewInfluencer}
          onAddContact={onAddContact}
          onViewContacts={onViewContacts}
          onInfluencerUpdate={handleInfluencerUpdate}
          isStatsCollapsed={isStatsCollapsed}
          onToggleStats={() => setIsStatsCollapsed(!isStatsCollapsed)}
        />
      )}
    </div>
  );
}