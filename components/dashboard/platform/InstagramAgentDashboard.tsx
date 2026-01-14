// src/components/dashboard/platform/InstagramAgentDashboard.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStatusList } from '@/services/statuses/statuses.service';
import { AssignmentInfluencer } from '@/types/assignment-influencers';
import { Status } from '@/types/statuses';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Import modals
import ContactsModal from './modals/ContactsModal';
import NotesModal from './modals/NotesModal';

// Import components
import WelcomeSection, { DashboardTab } from './components/WelcomeSection';
import TodayTasks from './components/TodayTasks';
import AssignmentsView from './components/AssignmentsView';

export default function InstagramAgentDashboard() {
  const { user, isAuthenticated } = useAuth();
  
  // Main dashboard state - supports 3 tabs
  const [activeTab, setActiveTab] = useState<DashboardTab>('today');
  
  // Statuses
  const [availableStatuses, setAvailableStatuses] = useState<Status[]>([]);
  const [statusesLoading, setStatusesLoading] = useState(false);
  const [statusesError, setStatusesError] = useState<string | null>(null);
  
  // Modal states
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<AssignmentInfluencer | null>(null);

  // Initialize statuses
  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableStatuses();
    }
  }, [isAuthenticated]);

  const fetchAvailableStatuses = async () => {
    try {
      setStatusesLoading(true);
      setStatusesError(null);
      const statuses = await getStatusList('campaign_influencer');
      setAvailableStatuses(statuses);
    } catch (error) {
      console.error('Error fetching statuses:', error);
      setStatusesError(error instanceof Error ? error.message : 'Failed to load statuses');
      setAvailableStatuses([]);
    } finally {
      setStatusesLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: DashboardTab) => {
    if (tab === activeTab) return;
    console.log('Tab change from', activeTab, 'to', tab);
    setActiveTab(tab);
  };

  // Enhanced influencer update handler
  const handleInfluencerUpdate = useCallback((updatedInfluencer: AssignmentInfluencer) => {
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
    console.log('View influencer:', influencer);
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayTasks 
            availableStatuses={availableStatuses}
            onEditCampaignStatus={handleEditCampaignStatus}
            onViewInfluencer={handleViewInfluencer}
            onAddContact={handleAddContact}
            onViewContacts={handleViewContacts}
            onInfluencerUpdate={handleInfluencerUpdate}
          />
        );
      
      case 'all':
        return (
          <AssignmentsView
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
    <div className="w-full space-y-6">
      {/* Welcome Section with Tabs */}
      <WelcomeSection
        user={user}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Tab Content */}
      {renderTabContent()}

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