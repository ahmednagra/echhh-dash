// src/components/dashboard/influencer/InfluencerDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Users, DollarSign, TrendingUp, Award, BarChart2, Calendar, Heart } from 'react-feather';

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

export default function InfluencerDashboard() {
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
      {/* Welcome Section - Influencer Specific */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl text-white p-8 mb-8 shadow-lg">
        <h1 className="text-3xl font-bold mb-2">{greeting}, {user?.full_name}</h1>
        <p className="text-purple-100">Welcome to your Influencer Dashboard. Track your campaigns, performance metrics, and growth.</p>
      </div>

      {/* Influencer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Active Campaigns" 
          value="6" 
          icon={<Award className="w-6 h-6" />} 
          color="border-purple-600" 
        />
        <StatCard 
          title="Total Earnings" 
          value="$12,450" 
          icon={<DollarSign className="w-6 h-6" />} 
          color="border-green-600" 
        />
        <StatCard 
          title="Audience Growth" 
          value="+8.5%" 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="border-blue-600" 
        />
        <StatCard 
          title="Engagement Rate" 
          value="5.2%" 
          icon={<Heart className="w-6 h-6" />} 
          color="border-pink-600" 
        />
      </div>

      {/* Performance Metrics and Campaign Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Performance Metrics</h2>
            <div className="flex space-x-2">
              <button className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full">Weekly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Monthly</button>
              <button className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full">Yearly</button>
            </div>
          </div>
          <div className="h-60 w-full bg-gray-50 rounded-lg flex items-center justify-center">
            <BarChart2 className="h-10 w-10 text-gray-300" />
            <span className="ml-2 text-gray-400">Performance Metrics Chart</span>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Avg. Engagement</p>
              <p className="text-xl font-bold">5.2%</p>
              <p className="text-xs text-green-600">+0.8% from last month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Audience Growth</p>
              <p className="text-xl font-bold">+2,450</p>
              <p className="text-xs text-green-600">+15% from last month</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Content Reach</p>
              <p className="text-xl font-bold">245K</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
          </div>
        </div>

        {/* Current Campaigns */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Active Campaigns</h2>
            <button className="text-sm text-purple-600 hover:text-purple-800">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { company: "FashionBrand", campaign: "Summer Collection", dueDate: "May 25, 2025" },
              { company: "TechGadgets", campaign: "Product Review", dueDate: "May 30, 2025" },
              { company: "TravelExplore", campaign: "Destination Showcase", dueDate: "June 10, 2025" },
              { company: "BeautyGlow", campaign: "New Product Launch", dueDate: "June 15, 2025" }
            ].map((item, i) => (
              <div key={i} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800">{item.company}</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    Active
                  </span>
                </div>
                <p className="text-sm text-gray-500">{item.campaign}</p>
                <div className="flex items-center text-xs text-gray-500 mt-2">
                  <Calendar className="w-3 h-3 mr-1" />
                  Due: {item.dueDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          <Link href="/campaigns/available" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-2">
              <Award className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Available Campaigns</span>
          </Link>
          <Link href="/content/create" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-gray-800 font-medium">Create Content</span>
          </Link>
          <Link href="/analytics/audience" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Audience Insights</span>
          </Link>
          <Link href="/payments/history" className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
              <DollarSign className="w-6 h-6" />
            </div>
            <span className="text-gray-800 font-medium">Payment History</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Activity</h2>
            <button className="text-sm text-purple-600 hover:text-purple-800">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { action: "Campaign completed", details: "FashionBrand Spring Collection", time: "2 days ago" },
              { action: "Payment received", details: "$1,450 from TechGadgets", time: "3 days ago" },
              { action: "New campaign offer", details: "HomeDecor Summer Collection", time: "1 week ago" },
              { action: "Content approved", details: "TravelExplore Beach Series", time: "1 week ago" }
            ].map((item, i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 mr-1"></div>
                <div>
                  <p className="font-medium text-gray-800">{item.action}</p>
                  <p className="text-sm text-gray-500">{item.details}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content Ideas & Tips */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Content Ideas & Tips</h2>
            <button className="text-sm text-purple-600 hover:text-purple-800">More Ideas</button>
          </div>
          <div className="space-y-4">
            {[
              { title: "Summer Fashion Trends 2025", description: "Showcase the latest summer trends that align with your style.", category: "Fashion" },
              { title: "Day in the Life", description: "Share your daily routine with your audience to increase engagement.", category: "Lifestyle" },
              { title: "Product Review Series", description: "Create consistent review content to build trust with your audience.", category: "Reviews" }
            ].map((item, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-800">{item.title}</h3>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                    {item.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Upcoming Deadlines</h2>
          <button className="text-sm text-purple-600 hover:text-purple-800">View Calendar</button>
        </div>
        <div className="space-y-4">
          {[
            { task: "Submit content draft", campaign: "TechGadgets Review", deadline: "May 20, 2025", urgency: "High" },
            { task: "Final content submission", campaign: "FashionBrand Summer", deadline: "May 25, 2025", urgency: "Medium" },
            { task: "Content planning", campaign: "BeautyGlow Launch", deadline: "June 1, 2025", urgency: "Low" }
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">{item.task}</p>
                  <p className="text-sm text-gray-500">{item.campaign} • {item.deadline}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs rounded-full ${
                item.urgency === 'High' 
                  ? 'bg-red-100 text-red-800' 
                  : item.urgency === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-green-100 text-green-800'
              }`}>
                {item.urgency}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}