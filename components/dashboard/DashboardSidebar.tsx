// src/components/dashboard/DashboardSidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { UserType } from '@/types/auth';
import {
  Home,
  Users,
  Briefcase,
  BarChart2,
  Settings,
  DollarSign,
  Calendar,
  Search,
  Award,
  FileText,
  Bell,
  Compass,
  Inbox,
  Menu,
  X
} from 'react-feather';

// Define menu items per user type
const getMenuItems = (userType: UserType) => {
  const commonItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <Home className="w-5 h-5" /> },
  ];

  // Platform admin menu items
  const platformItems = [
    ...commonItems,
    { name: 'Users', href: '/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Companies', href: '/companies', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Campaigns', href: '/campaigns', icon: <Award className="w-5 h-5" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Reports', href: '/reports', icon: <FileText className="w-5 h-5" /> },
    { name: 'Platform Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Company menu items
  const companyItems = [
    ...commonItems,
    { name: 'Discover', href: '/discover', icon: <Compass className="w-5 h-5" /> },
    { name: 'Influencers', href: '/influencers', icon: <Users className="w-5 h-5" /> },
    { name: 'Campaigns', href: '/campaigns', icon: <Award className="w-5 h-5" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Influencer menu items
  const influencerItems = [
    ...commonItems,
    { name: 'Discover', href: '/discover', icon: <Compass className="w-5 h-5" /> },
    { name: 'Available Campaigns', href: '/available-campaigns', icon: <Award className="w-5 h-5" /> },
    { name: 'My Campaigns', href: '/my-campaigns', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <Inbox className="w-5 h-5" /> },
    { name: 'Payments', href: '/payments', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Analytics', href: '/analytics', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Settings', href: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  switch (userType) {
    case 'platform':
      return platformItems;
    case 'company':
      return companyItems;
    case 'influencer':
    default:
      return influencerItems;
  }
};

interface DashboardSidebarProps {
  userType: UserType;
}

export default function DashboardSidebar({ userType }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(getMenuItems(userType));

  // Update menu items when user type changes
  useEffect(() => {
    setMenuItems(getMenuItems(userType));
  }, [userType]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Get style for active links
  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile toggle button - visible on small screens */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-20 left-4 z-20 bg-white p-2 rounded-md shadow-md border border-gray-200"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar - different styling for mobile vs desktop */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } fixed lg:static inset-y-0 left-0 transform lg:translate-x-0 transition duration-200 ease-in-out z-10 w-64 bg-white border-r border-gray-200 pt-16 h-screen`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Sidebar header */}
          <div className="px-4 py-5 flex justify-center">
            <Image 
              src="/echooo-logo.svg" 
              alt="Echooo" 
              width={130} 
              height={40} 
              className="h-8 w-auto" 
            />
          </div>

          {/* User type indicator */}
          <div className={`mx-4 mb-4 px-3 py-2 rounded-md text-white text-center text-sm ${
            userType === 'platform' 
              ? 'bg-indigo-600' 
              : userType === 'company'
                ? 'bg-blue-600'
                : 'bg-purple-600'
          }`}>
            {userType === 'platform' ? 'Platform Admin' : userType === 'company' ? 'Company Account' : 'Influencer Account'}
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? userType === 'platform' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : userType === 'company'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => {
                  // Close sidebar on mobile when clicking a link
                  if (isOpen) setIsOpen(false);
                }}
              >
                <span className={`${
                  isActive(item.href)
                    ? userType === 'platform' 
                      ? 'text-indigo-500' 
                      : userType === 'company'
                        ? 'text-blue-500'
                        : 'text-purple-500'
                    : 'text-gray-500'
                }`}>
                  {item.icon}
                </span>
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom section with quick links */}
          <div className="px-2 py-4 space-y-1 border-t border-gray-200">
            <Link
              href="/notifications"
              className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="ml-3">Notifications</span>
            </Link>

            <Link
              href="/help"
              className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="ml-3">Help & Support</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Overlay to close sidebar on mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-0 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}