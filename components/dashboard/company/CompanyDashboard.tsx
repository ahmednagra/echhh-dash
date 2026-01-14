// src/components/dashboard/company/CompanyDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Users, Briefcase, TrendingUp, Award, PieChart, Calendar } from 'react-feather';
import DashboardMetricsSection from '@/components/dashboard/metrics/DashboardMetricsSection';
import CampaignFunnelSection from '@/components/dashboard/campaign-funnel/CampaignFunnelSection';

// Dashboard statistics component
const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold mt-2">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color.replace('border-', 'bg-').replace('-600', '-100')} ${color.replace('border-', 'text-')}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function CompanyDashboard() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="w-full">
      {/* Stats & Performance Metrics Section */}
      <DashboardMetricsSection userType="b2c" />

      {/* Campaign Funnel Section */}
      <CampaignFunnelSection userType="b2c" />

    </div>
  );
}