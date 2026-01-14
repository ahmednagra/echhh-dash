// src/components/dashboard/platform/components/WelcomeSection.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Clock, CheckSquare, Archive, Zap, Play, Square } from 'react-feather';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Updated tab type to include 'completed'
export type DashboardTab = 'today' | 'all' | 'completed';

interface WelcomeSectionProps {
  /** User object (for agent's own dashboard) */
  user?: any;
  /** Display name override (for manager viewing agent) */
  displayName?: string;
  /** Active tab state */
  activeTab: DashboardTab;
  /** Tab change handler */
  onTabChange: (tab: DashboardTab) => void;
  /** Custom subtitle text */
  subtitle?: string;
  /** Hide autopilot button (for manager view) */
  hideAutopilot?: boolean;
  /** Show back button or custom header (for manager view) */
  isManagerView?: boolean;
}

export default function WelcomeSection({ 
  user, 
  displayName,
  activeTab, 
  onTabChange,
  subtitle,
  hideAutopilot = false,
  isManagerView = false
}: WelcomeSectionProps) {
  const pathname = usePathname();
  const [greeting, setGreeting] = useState('');
  const [isAutopilotActive, setIsAutopilotActive] = useState(false);
  const [isAutopilotLoading, setIsAutopilotLoading] = useState(false);

  // Check if we're on agent detail page (hide component there if not manager view)
  const isAgentDetailPage = pathname?.match(/^\/outreach-agents\/[^/]+$/);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleAutopilotToggle = async () => {
    setIsAutopilotLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsAutopilotActive(!isAutopilotActive);
      console.log('🤖 Autopilot toggled:', !isAutopilotActive ? 'STARTED' : 'STOPPED');
    } catch (error) {
      console.error('Error toggling autopilot:', error);
    } finally {
      setIsAutopilotLoading(false);
    }
  };

  // If on agent detail page and not explicitly manager view, hide this component
  if (isAgentDetailPage && !isManagerView) {
    return null;
  }

  // Determine the name to display
  const nameToDisplay = displayName || user?.full_name || 'User';
  
  // Determine subtitle
  const subtitleText = subtitle || (isManagerView 
    ? 'View agent assignments and track outreach progress.'
    : 'Manage your assigned campaign lists and track influencer outreach progress.'
  );

  return (
    <div className="space-y-0">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-teal-600 to-blue-600 rounded-t-xl text-white shadow-lg p-8 pb-16">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">
              {isManagerView ? `${nameToDisplay}'s Assignments` : `${greeting}, ${nameToDisplay}`}
            </h1>
            <p className="text-teal-100">{subtitleText}</p>
          </div>
        </div>
      </div>

      {/* Connected Tabs - 3 columns */}
      <div className="bg-white rounded-b-xl shadow-md">
        <div className="grid grid-cols-3">
          {/* Today Tasks Tab */}
          <button
            onClick={() => onTabChange('today')}
            className={`flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 rounded-bl-xl ${
              activeTab === 'today'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200'
            }`}
          >
            <Clock className="w-5 h-5 mr-2" />
            Today Tasks
          </button>
          
          {/* Active Assignments Tab */}
          <button
            onClick={() => onTabChange('all')}
            className={`flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-r border-gray-200'
            }`}
          >
            <CheckSquare className="w-5 h-5 mr-2" />
            Active Assignments
          </button>
          
          {/* Completed Assignments Tab */}
          <button
            onClick={() => onTabChange('completed')}
            className={`flex items-center justify-center px-6 py-4 text-sm font-medium transition-all duration-200 rounded-br-xl ${
              activeTab === 'completed'
                ? 'bg-teal-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Archive className="w-5 h-5 mr-2" />
            Completed Assignments
          </button>
        </div>
      </div>
    </div>
  );
}