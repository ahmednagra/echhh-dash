// src/app/(dashboard)/@platform/outreach-agents/[outreach-agent-id]/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Clock } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
// import { OutreachAgent } from '@/types/outreach-agents';
import { getStatusList } from '@/services/statuses/statuses.service';
// TODO: Uncomment when endpoint is ready
// import { getOutreachAgentById } from '@/services/outreach-agents/outreach-agents.client';
import WelcomeSection, { DashboardTab } from '@/components/dashboard/platform/components/WelcomeSection';
import AssignmentsView from '@/components/dashboard/platform/components/AssignmentsView';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ContactsModal from '@/components/dashboard/platform/modals/ContactsModal';
import NotesModal from '@/components/dashboard/platform/modals/NotesModal';

export default function OutreachAgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params['outreach-agent-id'] as string;

  // Tab state
  const [activeTab, setActiveTab] = useState<DashboardTab>('all'); // Default to 'all' for manager view

  // TODO: Uncomment when endpoint is ready
  // Agent info state
  // const [agent, setAgent] = useState<OutreachAgent | null>(null);
  // const [agentLoading, setAgentLoading] = useState(true);
  // const [agentError, setAgentError] = useState<string | null>(null);

  // Statuses state
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(true);
  const [statusesError, setStatusesError] = useState<string | null>(null);

  // Modal states
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<AssignmentInfluencer | null>(null);

  // Fetch statuses on mount
  useEffect(() => {
    // TODO: Uncomment when endpoint is ready
    // fetchAgentDetails();
    fetchAvailableStatuses();
  }, [agentId]);

  // TODO: Uncomment when endpoint is ready
  // const fetchAgentDetails = async () => {
  //   try {
  //     setAgentLoading(true);
  //     setAgentError(null);
  //     const agentData = await getOutreachAgentById(agentId);
  //     setAgent(agentData);
  //   } catch (error) {
  //     console.error('Error fetching agent details:', error);
  //     setAgentError(error instanceof Error ? error.message : 'Failed to load agent details');
  //   } finally {
  //     setAgentLoading(false);
  //   }
  // };

  const fetchAvailableStatuses = async () => {
    try {
      setStatusesLoading(true);
      setStatusesError(null);
      const statuses = await getStatusList('campaign_influencer');
      setAvailableStatuses(statuses);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setStatusesError(error instanceof Error ? error.message : 'Failed to load statuses');
    } finally {
      setStatusesLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/outreach-agents');
  };

  // Handle tab change
  const handleTabChange = (tab: DashboardTab) => {
    if (tab === activeTab) return;
    console.log('Tab change from', activeTab, 'to', tab);
    setActiveTab(tab);
  };

  // Influencer update handler
  const handleInfluencerUpdate = useCallback((updatedInfluencer: AssignmentInfluencer) => {
    console.log('Influencer updated:', updatedInfluencer.id);
    if (selectedInfluencer && selectedInfluencer.id === updatedInfluencer.id) {
      setSelectedInfluencer(updatedInfluencer);
    }
  }, [selectedInfluencer]);

  // Handlers for influencer actions
  const handleEditCampaignStatus = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsNotesModalOpen(true);
  };

  const handleViewInfluencer = (influencer: AssignmentInfluencer) => {
    console.log('View influencer:', influencer.id);
  };

  const handleAddContact = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsContactsModalOpen(true);
  };

  const handleViewContacts = (influencer: AssignmentInfluencer) => {
    setSelectedInfluencer(influencer);
    setIsContactsModalOpen(true);
  };

  const handleContactAdded = () => {
    console.log('Contact added successfully');
  };

  // Get agent display name
  // TODO: Update when endpoint is ready to use actual agent name
  const getAgentDisplayName = () => {
    // if (agent?.assigned_user?.full_name) {
    //   return agent.assigned_user.full_name;
    // }
    return 'Agent'; // Placeholder until endpoint is ready
  };

  // Loading state - only check statusesLoading now
  if (statusesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (statusesError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Failed to load data</p>
          <p className="text-gray-500 text-sm mt-2">{statusesError}</p>
          <button
            onClick={fetchAvailableStatuses}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render Today Tasks placeholder (not available for manager view)
  const renderTodayTasksPlaceholder = () => (
    <div className="bg-white rounded-xl shadow-md p-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Today Tasks Not Available</h3>
        <p className="text-gray-500 max-w-md">
          Today's tasks are only visible to the agent themselves. 
          You can view the agent's active and completed assignments using the other tabs.
        </p>
        <button
          onClick={() => setActiveTab('all')}
          className="mt-6 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          View Active Assignments
        </button>
      </div>
    </div>
  );

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return renderTodayTasksPlaceholder();
      
      case 'all':
        return (
          <AssignmentsView
            key="active-assignments"
            agentId={agentId}
            availableStatuses={availableStatuses}
            onEditCampaignStatus={handleEditCampaignStatus}
            onViewInfluencer={handleViewInfluencer}
            onAddContact={handleAddContact}
            onViewContacts={handleViewContacts}
            onInfluencerUpdate={handleInfluencerUpdate}
            completionStatus="incomplete"
            sectionTitle="Active Assignments"
          />
        );
      
      case 'completed':
        return (
          <AssignmentsView
            key="completed-assignments"
            agentId={agentId}
            availableStatuses={availableStatuses}
            onEditCampaignStatus={handleEditCampaignStatus}
            onViewInfluencer={handleViewInfluencer}
            onAddContact={handleAddContact}
            onViewContacts={handleViewContacts}
            onInfluencerUpdate={handleInfluencerUpdate}
            completionStatus="completed"
            sectionTitle="Completed Assignments"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back Button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 
                       hover:bg-gray-100 rounded-lg transition-all duration-200
                       border border-gray-200 hover:border-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Agents List</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-6 space-y-6">
        {/* Welcome Section with Tabs */}
        <WelcomeSection
          displayName={getAgentDisplayName()}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isManagerView={true}
          hideAutopilot={true}
          subtitle={`View ${getAgentDisplayName()}'s assignments and track their outreach progress.`}
        />

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Modals */}
      {selectedInfluencer && (
        <>
          <ContactsModal
            isOpen={isContactsModalOpen}
            onClose={() => {
              setIsContactsModalOpen(false);
              setSelectedInfluencer(null);
            }}
            member={selectedInfluencer}
            onContactAdded={handleContactAdded}
          />

          <NotesModal
            isOpen={isNotesModalOpen}
            onClose={() => {
              setIsNotesModalOpen(false);
              setSelectedInfluencer(null);
            }}
            member={selectedInfluencer}
            onMemberUpdate={handleInfluencerUpdate}
          />
        </>
      )}
    </div>
  );
}