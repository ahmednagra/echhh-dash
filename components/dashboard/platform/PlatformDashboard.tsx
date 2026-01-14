// src/components/dashboard/platform/PlatformDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BarChart2, Users, Briefcase, Activity, TrendingUp, AtSign } from 'react-feather';

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

export default function PlatformDashboard() {
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
      {/* Welcome Section - Platform Admin Specific */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-indigo-100">Welcome to your Platform Admin Dashboard. Manage your influencers, companies, and platform performance.</p>
      </div>

      {/* Platform Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Users" 
          value="1,254" 
          icon={<Users className="w-6 h-6" />} 
          color="border-indigo-600" 
        />
        <StatCard 
          title="Active Influencers" 
          value="876" 
          icon={<AtSign className="w-6 h-6" />} 
          color="border-purple-600" 
        />
        <StatCard 
          title="Companies" 
          value="378" 
          icon={<Briefcase className="w-6 h-6" />} 
          color="border-blue-600" 
        />
        <StatCard 
          title="Platform Revenue" 
          value="$42,850" 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="border-green-600" 
        />
      </div>

      {/* Platform Activity and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Recent Registrations */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Registrations</h2>
            <button className="text-sm text-indigo-600 hover:text-indigo-800">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { name: "Jane Cooper", type: "Influencer", time: "2 hours ago" },
              { name: "Tech Solutions Inc", type: "Company", time: "Yesterday" },
              { name: "Alex Rivera", type: "Influencer", time: "2 days ago" },
              { name: "Global Brands LLC", type: "Company", time: "3 days ago" }
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${item.type === 'Influencer' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                  {item.type === 'Influencer' ? <AtSign className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <div className="flex items-center">
                    <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'Influencer' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'} mr-2`}>
                      {item.type}
                    </span>
                    <span className="text-xs text-gray-500">{item.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Platform Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Platform Performance</h2>
            <div className="flex space-x-2">
              <button className="text-xs bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full">Weekly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Monthly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Yearly</button>
            </div>
          </div>
          <div className="h-60 w-full bg-gray-50 rounded-lg flex items-center justify-center">
            <BarChart2 className="h-10 w-10 text-gray-300" />
            <span className="ml-2 text-gray-400">Performance Chart</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">New Users</p>
              <p className="text-xl font-bold">+124</p>
              <p className="text-xs text-green-600">+12% from last week</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Active Campaigns</p>
              <p className="text-xl font-bold">87</p>
              <p className="text-xs text-green-600">+5% from last week</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Platform Engagement</p>
              <p className="text-xl font-bold">93%</p>
              <p className="text-xs text-green-600">+3% from last week</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Link href="/users/manage" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-2">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Manage Users</span>
          </Link>
          <Link href="/campaigns/review" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
              <Activity className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Review Campaigns</span>
          </Link>
          <Link href="/platforms/settings" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Platform Settings</span>
          </Link>
          <Link href="/reports" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Generate Reports</span>
          </Link>
        </div>
      </div>

      {/* System Notifications */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">System Notifications</h2>
        <div className="space-y-4">
          {[
            { title: "System maintenance scheduled", message: "Platform will be under maintenance on May 20, 2025, from 2:00 AM to 4:00 AM UTC.", severity: "info" },
            { title: "New version deployed", message: "Version 2.5.1 has been deployed with bug fixes and performance improvements.", severity: "success" },
            { title: "High server load detected", message: "Unusually high traffic detected on the main server. Monitoring situation.", severity: "warning" }
          ].map((item, i) => (
            <div key={i} className={`p-4 rounded-lg ${
              item.severity === 'info' ? 'bg-blue-50 border-l-4 border-blue-500' :
              item.severity === 'success' ? 'bg-green-50 border-l-4 border-green-500' :
              item.severity === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
              'bg-red-50 border-l-4 border-red-500'
            }`}>
              <h3 className={`font-bold ${
                item.severity === 'info' ? 'text-blue-700' :
                item.severity === 'success' ? 'text-green-700' :
                item.severity === 'warning' ? 'text-yellow-700' :
                'text-red-700'
              }`}>{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}