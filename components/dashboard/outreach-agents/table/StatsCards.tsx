// src/components/dashboard/outreach-agents/table/StatsCards.tsx
'use client';

import React from 'react';
import { 
  Users, 
  UserCheck,
  UserPlus,
  CheckSquare,
  Archive,
  TrendingUp,
  Target,
  Activity
} from 'react-feather';
import { OutreachAgent } from '@/types/outreach-agents';
import { formatNumber } from '@/utils/formatters';

interface StatsCardsProps {
  agents: OutreachAgent[];
  loading: boolean;
}

// Compact Stat Card - Slim & Smart
interface StatCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
  textColor: string;
}

function StatCard({ title, value, subtitle, icon, bgGradient, iconBg, textColor }: StatCardProps) {
  return (
    <div className={`group relative bg-gradient-to-br ${bgGradient} rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5`}>
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${textColor} mb-0.5`}>{formatNumber(value)}</p>
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        </div>
        <div className={`p-2.5 ${iconBg} rounded-lg group-hover:scale-105 transition-transform duration-300 shadow-sm ml-3 flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

const StatsCards: React.FC<StatsCardsProps> = ({ agents, loading }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Row 1 - Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-7 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg ml-3"></div>
              </div>
            </div>
          ))}
        </div>
        {/* Row 2 - Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-7 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="w-10 h-10 bg-gray-200 rounded-lg ml-3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate stats from agents data
  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.outreach_agent_status?.name === 'active').length;
  const availableAgents = agents.filter(a => a.is_available_for_assignment).length;
  const totalAssignments = agents.reduce((sum, a) => sum + (a.total_assignments || 0), 0);
  const totalAssignedInfluencers = agents.reduce((sum, a) => sum + (a.total_assigned_influencers || 0), 0);
  const totalActiveInfluencers = agents.reduce((sum, a) => sum + (a.total_active_influencers || 0), 0);
  const totalCompletedInfluencers = agents.reduce((sum, a) => sum + (a.total_completed_influencers || 0), 0);
  const totalArchivedInfluencers = agents.reduce((sum, a) => sum + (a.total_archived_influencers || 0), 0);
  const averageProgress = agents.length > 0 
    ? agents.reduce((sum, a) => sum + (a.progress || 0), 0) / agents.length 
    : 0;

  return (
    <div className="space-y-4">
      {/* Row 1: Agent Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Agents */}
        <StatCard
          title="Total Agents"
          value={totalAgents}
          subtitle="All outreach agents"
          icon={<Users className="w-5 h-5 text-indigo-600" />}
          bgGradient="from-indigo-50 to-indigo-100"
          iconBg="bg-indigo-100"
          textColor="text-indigo-700"
        />

        {/* Active Agents */}
        <StatCard
          title="Active Agents"
          value={activeAgents}
          subtitle="Currently working"
          icon={<Activity className="w-5 h-5 text-green-600" />}
          bgGradient="from-green-50 to-emerald-100"
          iconBg="bg-green-100"
          textColor="text-green-700"
        />

        {/* Available Agents */}
        <StatCard
          title="Available Agents"
          value={availableAgents}
          subtitle="Ready for assignment"
          icon={<UserPlus className="w-5 h-5 text-blue-600" />}
          bgGradient="from-blue-50 to-cyan-100"
          iconBg="bg-blue-100"
          textColor="text-blue-700"
        />

        {/* Total Assignments */}
        <StatCard
          title="Total Assignments"
          value={totalAssignments}
          subtitle="Overall assignments"
          icon={<CheckSquare className="w-5 h-5 text-orange-600" />}
          bgGradient="from-orange-50 to-amber-100"
          iconBg="bg-orange-100"
          textColor="text-orange-700"
        />
      </div>

      {/* Row 2: Influencer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Assigned Influencers */}
        <StatCard
          title="Assigned Influencers"
          value={totalAssignedInfluencers}
          subtitle="Total assigned"
          icon={<Target className="w-5 h-5 text-purple-600" />}
          bgGradient="from-purple-50 to-fuchsia-100"
          iconBg="bg-purple-100"
          textColor="text-purple-700"
        />

        {/* Active Influencers */}
        <StatCard
          title="Active Influencers"
          value={totalActiveInfluencers}
          subtitle="Currently active"
          icon={<UserCheck className="w-5 h-5 text-teal-600" />}
          bgGradient="from-teal-50 to-cyan-100"
          iconBg="bg-teal-100"
          textColor="text-teal-700"
        />

        {/* Completed Influencers */}
        <StatCard
          title="Completed"
          value={totalCompletedInfluencers}
          subtitle="Successfully completed"
          icon={<CheckSquare className="w-5 h-5 text-green-600" />}
          bgGradient="from-green-50 to-emerald-100"
          iconBg="bg-green-100"
          textColor="text-green-700"
        />

        {/* Average Progress */}
        <StatCard
          title="Average Progress"
          value={Math.round(averageProgress * 10) / 10}
          subtitle="Overall completion"
          icon={<TrendingUp className="w-5 h-5 text-indigo-600" />}
          bgGradient="from-indigo-50 to-blue-100"
          iconBg="bg-indigo-100"
          textColor="text-indigo-700"
        />
      </div>
    </div>
  );
};

export default StatsCards;