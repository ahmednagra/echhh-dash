// src/components/dashboard/profile-analytics/sections/AudienceTabsSection.tsx
'use client';

import { useState } from 'react';
import { Users, Heart, MessageCircle } from 'lucide-react';
import { Profile } from '@/types/insightiq/profile-analytics';
import AudienceSection from './AudienceSection';
import AudienceLikersSection from './AudienceLikersSection';
// import AudienceCommentersSection from './AudienceCommentersSection';

interface ProfileData {
  audience: Profile['audience'];
  audience_likers?: Profile['audience_likers'];
  audience_commenters?: Profile['audience_commenters'];
}

interface AudienceTabsSectionProps {
  profile: ProfileData;
  formatNumber: (num: number) => string;
}

const AudienceTabsSection: React.FC<AudienceTabsSectionProps> = ({
  profile,
  formatNumber
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'Followers',
      icon: Users,
      tooltip: 'Displays data for the overall audience.'
    },
    {
      id: 'likers',
      label: 'Engaged',
      icon: Heart,
      tooltip: 'Displays data for likers.'
    },
    // {
    //   id: 'commenters',
    //   label: 'Commenters',
    //   icon: MessageCircle
    // }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Audience Analytics</h2>
        
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <div key={tab.id} className="relative group">
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-500 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                  
                  {/* Tooltip */}
                  <div className={`absolute top-full mt-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out whitespace-nowrap z-50 pointer-events-none ${
                    tab.id === 'overview' ? 'left-0' : 'right-0'
                  }`}>
                    {tab.tooltip}
                    <div className={`absolute bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900 ${
                      tab.id === 'overview' ? 'left-4' : 'right-4'
                    }`}></div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <AudienceSection profile={profile} formatNumber={formatNumber} />
        )}
        {activeTab === 'likers' && (
          <AudienceLikersSection profile={profile} formatNumber={formatNumber} />
        )}
        {/* {activeTab === 'commenters' && (
          <AudienceCommentersSection profile={profile} formatNumber={formatNumber} />
        )} */}
      </div>
    </div>
  );
};

export default AudienceTabsSection;