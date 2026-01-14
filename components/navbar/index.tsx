// src/components/navbar/index.tsx - Updated with Sidebar Toggle
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { User, Settings, LogOut, Bell, Menu, X } from 'react-feather';
import CampaignsDropdown from './CampaignsDropdown';
import { UserAvatar } from '@/components/ui/SafeImage';
import { DetailedRole } from '@/types/auth';
import { usePermissions } from '@/hooks/usePermissions';

interface NavbarProps {
  // No props needed - using context now
}

export default function Navbar(props?: NavbarProps) {
  const { isAuthenticated, user, logout, getPrimaryRole, getUserType, isLoading } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useSidebar();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCampaignsOpen, setIsCampaignsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const campaignsRef = useRef<HTMLDivElement>(null);

  const primaryRole = getPrimaryRole();
  const userType = getUserType();

  // Check if it's an auth page to hide navbar
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/reset-password');

  // Check if we're on the landing page
  const isLandingPage = pathname === '/';

  // Check if we're on dashboard pages (where sidebar should be shown)
  const isDashboardPage = isAuthenticated && (
    pathname?.startsWith('/dashboard') || 
    pathname?.startsWith('/users') ||
    pathname?.startsWith('/b2c-clients') ||
    pathname?.startsWith('/b2b-clients') ||
    pathname?.startsWith('/companies') ||
    pathname?.startsWith('/agents') ||
    pathname?.startsWith('/campaigns') ||
    pathname?.startsWith('/analytics') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/discover') ||
    pathname?.startsWith('/influencers') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/payments') ||
    pathname?.startsWith('/assigned-lists') ||
    pathname?.startsWith('/outreach') ||
    pathname?.startsWith('/contacts') ||
    pathname?.startsWith('/performance') ||
    pathname?.startsWith('/operations') ||
    pathname?.startsWith('/automation') ||
    pathname?.startsWith('/teams') ||
    pathname?.startsWith('/reports') ||
    pathname?.startsWith('/system') ||
    pathname?.startsWith('/notifications') ||
    pathname?.startsWith('/messages') ||
    pathname?.startsWith('/billing')
  );

  // ADDED: Helper function to get user initials
  const getUserInitials = (user: any) => {
    if (!user) return '';
    
    const firstName = user.first_name || user.full_name?.split(' ')[0] || '';
    const lastName = user.last_name || user.full_name?.split(' ')[1] || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  // ADDED: Helper function to get user profile image URL
  const getUserProfileImage = (user: any) => {
    // Check various possible fields for profile image
    return user?.profile_image_url || 
           user?.avatar_url || 
           user?.picture || 
           user?.profile_picture_url ||
           null;
  };

  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (campaignsRef.current && !campaignsRef.current.contains(event.target as Node)) {
        setIsCampaignsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation handlers
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileMenuOpen(!isProfileMenuOpen);
  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);
  const toggleCampaigns = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCampaignsOpen(!isCampaignsOpen);
  };
  const closeCampaigns = () => setIsCampaignsOpen(false);

  // ADDED: Sidebar toggle handler
  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Navigation items for different user types
  const landingNavItems = [
    { name: 'Features', href: '/#features' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About', href: '/#about' },
    { name: 'Contact', href: '/#contact' },
  ];

  const getDashboardNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/dashboard' },
    ];

    // Add role-specific navigation items based on your updated backend roles
    switch (primaryRole as DetailedRole) {
      case 'platform_super_admin':
      case 'platform_admin':
        return [
          ...baseItems,
          { name: 'Users', href: '/users' },
          { name: 'Companies', href: '/companies' },
          { name: 'Agents', href: '/agents' },
          { name: 'Campaigns', href: '/campaigns' },
          { name: 'Analytics', href: '/analytics' },
          { name: 'System', href: '/system' },
        ];
      
      case 'platform_agent':
        return [
          ...baseItems,
          { name: 'Assigned Lists', href: '/assigned-lists' },
          { name: 'Outreach', href: '/outreach' },
          { name: 'Contacts', href: '/contacts' },
          { name: 'Performance', href: '/performance' },
          { name: 'Messaging', href: '/messaging' },
        ];
      
      case 'platform_operations_manager':
        return [
          ...baseItems,
          { name: 'Operations', href: '/operations' },
          { name: 'Agents', href: '/agents' },
          { name: 'Automation', href: '/automation' },
          { name: 'Performance', href: '/performance' },
        ];
      
      case 'b2c_company_owner':
      case 'b2c_company_admin':
      case 'b2c_marketing_director':
        return [
          ...baseItems,
          { name: 'Discover', href: '/discover' },
          { name: 'Campaigns', href: '/campaigns' },
          { name: 'Influencers', href: '/influencers' },
          { name: 'Analytics', href: '/analytics' },
        ];
      
      case 'b2c_campaign_manager':
      case 'b2c_campaign_executive':
        return [
          ...baseItems,
          { name: 'Campaigns', href: '/campaigns' },
          { name: 'Influencers', href: '/influencers' },
          { name: 'Analytics', href: '/analytics' },
        ];
      
      case 'influencer':
      case 'influencer_manager':
        return [
          ...baseItems,
          { name: 'Campaigns', href: '/campaigns' },
          { name: 'Profile', href: '/profile' },
          { name: 'Analytics', href: '/analytics' },
          { name: 'Payments', href: '/payments' },
        ];
      
      default:
        return baseItems;
    }
  };

  const getSettingsLink = () => {
    const { canAccessSettings } = usePermissions();
    
    // Only show settings link if user has permission to update their profile
    if (!canAccessSettings()) {
      return null;
    }
    
    return (
      <Link
        href="/settings"
        onClick={() => setIsProfileMenuOpen(false)}
        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <Settings className="mr-3 h-5 w-5 text-gray-400" />
        Settings
      </Link>
    );
  };

  const getRoleColor = (role: DetailedRole) => {
    if (role?.startsWith('platform_')) return 'text-indigo-600';
    if (role?.startsWith('company_')) return 'text-blue-600';
    if (role?.startsWith('influencer')) return 'text-purple-600';
    return 'text-gray-600';
  };

  const getRoleSpecificNotifications = () => {
    const baseNotifications = [
      { title: 'Welcome to Echooo!', time: '1 day ago', read: true, type: 'welcome' },
      { title: 'System maintenance scheduled', time: '2 days ago', read: true, type: 'system' },
    ];

    switch (primaryRole) {
      case 'platform_admin':
        return [
          { title: 'New company registration pending', time: '30 minutes ago', read: false, type: 'admin' },
          { title: 'System performance alert', time: '1 hour ago', read: false, type: 'system' },
          ...baseNotifications
        ];
      
      case 'platform_agent':
        return [
          { title: 'New assignment received', time: '30 minutes ago', read: false, type: 'assignment' },
          { title: 'Outreach automation completed', time: '2 hours ago', read: false, type: 'automation' },
          { title: 'Weekly performance report ready', time: '1 day ago', read: true, type: 'performance' },
          ...baseNotifications
        ];
      
      case 'b2c_campaign_manager':
        return [
          { title: 'New list assignment received', time: '2 hours ago', read: false, type: 'assignment' },
          { title: 'Influencer responded to outreach', time: '4 hours ago', read: false, type: 'response' },
          ...baseNotifications
        ];
      
      case 'b2c_company_admin':
        return [
          { title: 'Campaign performance update', time: '1 hour ago', read: false, type: 'campaign' },
          { title: 'New influencer applications', time: '3 hours ago', read: false, type: 'application' },
          ...baseNotifications
        ];
      
      default:
        return baseNotifications;
    }
  };

  // If it's an auth page, return null (no navbar)
  if (isAuthPage) {
    return null;
  }

  // **KEY FIX**: Don't render navbar content while authentication is loading
  // This prevents the flash of unauthenticated content
  if (isLoading) {
    return (
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/echooo-logo.svg" 
                  alt="Echooo" 
                  width={120} 
                  height={30} 
                  className="h-8 w-auto" 
                />
              </Link>
            </div>
            {/* Show a minimal loading state */}
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // **KEY FIX**: Now determine navigation items based on final auth state
  const navItems = isAuthenticated ? getDashboardNavItems() : landingNavItems;

  return (
    <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled || isAuthenticated 
        ? 'bg-white shadow-md'
        : isLandingPage 
          ? 'bg-transparent' 
          : 'bg-white shadow-md'
    }`}>
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-4">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            {/* ADDED: Sidebar toggle button - only show on dashboard pages when authenticated */}
            {isDashboardPage && (
              <button
                onClick={handleToggleSidebar}
                className="p-2 mr-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                title={isSidebarCollapsed ? "Open Navigation" : "Close Navigation"}
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image 
                  src="/echooo-logo.svg" 
                  alt="Echooo" 
                  width={120} 
                  height={30} 
                  className="h-8 w-auto" 
                />
              </Link>
            </div>
          </div>

          {/* Right navigation */}
          <div className="flex items-center">
            {isAuthenticated ? (
              // Authenticated nav options
              <div className="hidden md:flex md:items-center md:space-x-4">
                {/* Campaigns Dropdown Component - only for company users */}
                {userType === 'b2c' && (
                  <div ref={campaignsRef}>
                    <CampaignsDropdown 
                      isOpen={isCampaignsOpen}
                      toggleDropdown={toggleCampaigns}
                      closeDropdown={closeCampaigns}
                    />
                  </div>
                )}

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={toggleNotifications}
                    className="p-1 border-2 border-transparent text-gray-500 rounded-full hover:text-purple-600 focus:outline-none focus:text-purple-600 relative"
                  >
                    <span className="sr-only">View notifications</span>
                    <Bell className="h-6 w-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>

                  {/* Notifications dropdown */}
                  {isNotificationsOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {getRoleSpecificNotifications().map((notification, i) => (
                          <a
                            key={i}
                            href="#"
                            className={`block px-4 py-3 hover:bg-gray-50 ${notification.read ? '' : 'bg-purple-50'}`}
                          >
                            <p className={`text-sm font-medium ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500">{notification.time}</p>
                          </a>
                        ))}
                      </div>
                      <div className="px-4 py-2 border-t border-gray-100">
                        <Link
                          href="/notifications"
                          className="text-sm text-purple-600 hover:text-purple-800"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative" ref={profileRef}>
                  {/* UPDATED: Use UserAvatar component with proper error handling */}
                  <div onClick={toggleProfile} style={{ cursor: 'pointer' }}>
                    <UserAvatar
                      src={getUserProfileImage(user)}
                      alt={user?.full_name || user?.email || 'User avatar'}
                      size={32}
                      fallbackInitials={getUserInitials(user)}
                      className="ring-2 ring-transparent hover:ring-purple-500 transition-all duration-200"
                    />
                  </div>

                  {/* Profile dropdown menu */}
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center">
                          <UserAvatar
                            src={getUserProfileImage(user)}
                            alt={user?.full_name || user?.email || 'User avatar'}
                            size={48}  // Slightly larger for dropdown
                            fallbackInitials={getUserInitials(user)}
                            className="mr-3 flex-shrink-0"  // Added flex-shrink-0 to prevent squishing
                          />
                          <div className="flex-1 min-w-0">  {/* Added min-w-0 to prevent overflow */}
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user?.full_name || user?.email}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                          </div>
                        </div>
                        {primaryRole && (
                          <p className={`text-xs font-medium mt-2 ${getRoleColor(primaryRole)}`}>
                            {primaryRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </p>
                        )}
                      </div>
                      <div className="py-1">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <User className="mr-3 h-5 w-5 text-gray-400" />
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Settings className="mr-3 h-5 w-5 text-gray-400" />
                          Settings
                        </Link>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // Unauthenticated nav options - show login/signup buttons
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isScrolled || !isLandingPage 
                      ? 'text-gray-800 hover:text-purple-600' 
                      : 'text-white hover:text-purple-200'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition duration-150 ease-in-out"
                >
                  Sign up
                </Link>
              </div>
            )}
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={toggleMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isScrolled || !isLandingPage || isAuthenticated 
                    ? 'text-gray-400 hover:text-gray-500 hover:bg-gray-100' 
                    : 'text-white hover:text-gray-200 hover:bg-purple-700'
                } focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500`}
              >
                <span className="sr-only">{isMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - simplified for space */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href
                    ? 'bg-purple-50 border-purple-500 text-purple-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile authenticated user section */}
          {isAuthenticated && user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <UserAvatar
                  src={getUserProfileImage(user)}
                  alt={user?.full_name || user?.email || 'User avatar'}
                  size={40}
                  fallbackInitials={getUserInitials(user)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="text-base font-medium text-gray-800">
                    {user?.full_name || user?.email}
                  </div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Your Profile
                </Link>
                {getSettingsLink()}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}