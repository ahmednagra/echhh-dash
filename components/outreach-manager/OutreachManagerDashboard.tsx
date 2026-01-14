// src/components/dashboard/outreach-manager/OutreachManagerDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Activity,
  CheckSquare,
  MessageSquare,
  UserCheck,
  Target,
  TrendingUp,
  Award,
  Clock,
  Zap,
  DollarSign, // ← ADD THIS
} from 'react-feather';
import Link from 'next/link';
import { getOutreachAgentManagerStats } from '@/services/outreach-agent-manager/outreach-agent-manager.client';
import { OutreachAgentManagerStats } from '@/types/outreach-agent-manager';

// Enhanced Stat Card with light professional gradients
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgGradient: string;
  iconBg: string;
  textColor: string;
  trend?: { value: string; isPositive: boolean };
  delay?: number;
}

function StatCard({
  title,
  value,
  icon,
  bgGradient,
  iconBg,
  textColor,
  trend,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={`group relative bg-gradient-to-br ${bgGradient} rounded-2xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative flex justify-between items-start">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <p className={`text-4xl font-bold ${textColor}`}>{value}</p>
          {trend && (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        <div
          className={`p-4 ${iconBg} rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// Circular Progress Ring with light colors
interface CircularProgressProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  bgColor: string;
  label: string;
  value: string;
}

function CircularProgress({
  percentage,
  size = 140,
  strokeWidth = 10,
  color,
  bgColor,
  label,
  value,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center group">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle with animation */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 mt-1">{value}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-700">{label}</p>
    </div>
  );
}

// Agent Type Card with light professional styling - COMPRESSED
interface AgentTypeCardProps {
  type: string;
  count: number;
  bgGradient: string;
  textColor: string;
  icon: string;
}

function AgentTypeCard({
  type,
  count,
  bgGradient,
  textColor,
  icon,
}: AgentTypeCardProps) {
  return (
    <div
      className={`relative bg-gradient-to-br ${bgGradient} rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-0.5 group`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl flex-shrink-0">{icon}</div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-semibold ${textColor} mb-0.5`}>{type}</p>
          <p className={`text-2xl font-bold ${textColor}`}>{count}</p>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button with light colors
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  bgGradient: string;
  textColor: string;
}

function QuickAction({
  icon,
  label,
  href,
  bgGradient,
  textColor,
}: QuickActionProps) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r ${bgGradient} border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group`}
      >
        <div
          className={`p-3 ${textColor} bg-white rounded-lg shadow-sm group-hover:scale-110 transition-transform`}
        >
          {icon}
        </div>
        <span className={`font-semibold ${textColor}`}>{label}</span>
      </div>
    </Link>
  );
}

// Main Dashboard Component
export default function OutreachManagerDashboard() {
  const [stats, setStats] = useState<OutreachAgentManagerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOutreachAgentManagerStats();
      setStats(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load statistics',
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-red-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  Error Loading Dashboard
                </p>
                <p className="text-gray-600 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchStats}
              className="mt-6 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <p className="text-gray-600 text-center">No statistics available</p>
        </div>
      </div>
    );
  }

  const agentTypeData = [
    {
      type: 'Instagram',
      count: stats.agents_by_type?.['Instagram Agent'] || 0,
      bgGradient: 'from-purple-50 to-pink-50',
      textColor: 'text-purple-700',
      icon: '📸',
    },
    {
      type: 'Email',
      count: stats.agents_by_type?.['Email Agent'] || 0,
      bgGradient: 'from-blue-50 to-cyan-50',
      textColor: 'text-blue-700',
      icon: '📧',
    },
    {
      type: 'WhatsApp',
      count: stats.agents_by_type?.['WhatsApp Agent'] || 0,
      bgGradient: 'from-green-50 to-emerald-50',
      textColor: 'text-green-700',
      icon: '💬',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Outreach Manager Dashboard
            </h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {new Date(stats.generated_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* NEW: Un-Approved Influencers Button */}
            <Link href="/outreach-manager/unapproved-influencers">
              <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Un-Approved Influencers
              </button>
            </Link>
            <Link href="/outreach-manager/campaigns">
              <button className="px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                <Award className="w-5 h-5" />
                View All Campaigns
              </button>
            </Link>
            <Link href="/outreach-agents">
              <button className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2">
                <Users className="w-5 h-5" />
                View All Agents
              </button>
            </Link>
          </div>
        </div>

        {/* Top Stats Cards - Color coded by meaning */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Agents"
            value={stats.total_agents}
            icon={<Users className="w-6 h-6 text-indigo-600" />}
            bgGradient="from-indigo-50 to-indigo-100"
            iconBg="bg-indigo-100"
            textColor="text-indigo-700"
            delay={0}
          />
          <StatCard
            title="Active Agents"
            value={stats.active_agents}
            icon={<Activity className="w-6 h-6 text-green-600" />}
            bgGradient="from-green-50 to-emerald-100"
            iconBg="bg-green-100"
            textColor="text-green-700"
            delay={100}
          />
          <StatCard
            title="Available Now"
            value={stats.available_agents}
            icon={<UserCheck className="w-6 h-6 text-blue-600" />}
            bgGradient="from-blue-50 to-cyan-100"
            iconBg="bg-blue-100"
            textColor="text-blue-700"
            delay={200}
          />
          <StatCard
            title="Total Assignments"
            value={stats.total_assignments}
            icon={<CheckSquare className="w-6 h-6 text-orange-600" />}
            bgGradient="from-orange-50 to-amber-100"
            iconBg="bg-orange-100"
            textColor="text-orange-700"
            delay={300}
          />
        </div>

        {/* Performance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Rates */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
              Performance Rates
            </h2>
            <div className="flex justify-around items-center py-6">
              <CircularProgress
                percentage={stats.overall_completion_rate}
                color="#6366f1"
                bgColor="#e0e7ff"
                label="Completion Rate"
                value={`${stats.total_completed} completed`}
              />
              <CircularProgress
                percentage={stats.overall_response_rate}
                color="#06b6d4"
                bgColor="#cffafe"
                label="Response Rate"
                value={`${stats.total_messages_sent} messages`}
              />
            </div>
          </div>

          {/* Agent Types Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Agent Types
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {agentTypeData.map((agent) => (
                <AgentTypeCard key={agent.type} {...agent} />
              ))}
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Influencers Managed"
            value={stats.total_influencers_managed}
            icon={<Target className="w-6 h-6 text-purple-600" />}
            bgGradient="from-purple-50 to-fuchsia-100"
            iconBg="bg-purple-100"
            textColor="text-purple-700"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.total_completed}
            icon={<CheckSquare className="w-6 h-6 text-teal-600" />}
            bgGradient="from-teal-50 to-cyan-100"
            iconBg="bg-teal-100"
            textColor="text-teal-700"
          />
          <StatCard
            title="Messages Sent"
            value={stats.total_messages_sent}
            icon={<MessageSquare className="w-6 h-6 text-sky-600" />}
            bgGradient="from-sky-50 to-blue-100"
            iconBg="bg-sky-100"
            textColor="text-sky-700"
          />
          <StatCard
            title="Messages Today"
            value={stats.messages_sent_today}
            icon={<Zap className="w-6 h-6 text-amber-600" />}
            bgGradient="from-amber-50 to-yellow-100"
            iconBg="bg-amber-100"
            textColor="text-amber-700"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={<Users className="w-5 h-5" />}
              label="Manage Agents"
              href="/outreach-agents"
              bgGradient="from-indigo-50 to-indigo-100"
              textColor="text-indigo-700"
            />
            <QuickAction
              icon={<CheckSquare className="w-5 h-5" />}
              label="View Assignments"
              href="/assignments"
              bgGradient="from-blue-50 to-blue-100"
              textColor="text-blue-700"
            />
            <QuickAction
              icon={<TrendingUp className="w-5 h-5" />}
              label="Performance Reports"
              href="/reports"
              bgGradient="from-green-50 to-green-100"
              textColor="text-green-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
