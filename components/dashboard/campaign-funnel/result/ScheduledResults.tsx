// src/components/dashboard/campaign-funnel/result/ScheduledResults.tsx
'use client';

import { useState } from 'react';
import { detectPlatformFromUrl } from '@/constants/social-platforms';
import { ThumbnailPlatformIcon } from './VideoMetricsForm';

interface ScheduledContent {
  id: number;
  influencerName: string;
  username: string;
  profileImage: string;
  videoThumbnail: string;
  scheduledDate: Date;
  scheduledTime: string;
  platform: 'instagram' | 'youtube' | 'tiktok' | 'twitter';
}

interface ScheduledResultsProps {
  onTabChange?: (tab: 'scheduled' | 'published') => void;
}

const ScheduledResults: React.FC<ScheduledResultsProps> = ({ onTabChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Sample scheduled content data - Updated to current month/year for visibility
  const scheduledContent: ScheduledContent[] = [
    {
      id: 1,
      influencerName: "Paula Camira",
      username: "@paula",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1611605698323-b1e99cfd37ea?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 4),
      scheduledTime: "09:30am",
      platform: "instagram"
    },
    {
      id: 2,
      influencerName: "Deon Lane",
      username: "@deon",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 6),
      scheduledTime: "02:00pm",
      platform: "instagram"
    },
    {
      id: 3,
      influencerName: "Jim Cooper",
      username: "@jim",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 15),
      scheduledTime: "11:30am",
      platform: "instagram"
    },
    {
      id: 4,
      influencerName: "Armenta Black",
      username: "@armenta",
      profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1542652735873-fb2825bac6e4?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 21),
      scheduledTime: "03:00pm",
      platform: "instagram"
    },
    {
      id: 5,
      influencerName: "Robert Cooper",
      username: "@robert",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 22),
      scheduledTime: "01:30pm",
      platform: "instagram"
    },
    {
      id: 6,
      influencerName: "Sarah Johnson",
      username: "@sarah",
      profileImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      videoThumbnail: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=80&h=60&fit=crop",
      scheduledDate: new Date(selectedYear, selectedMonth, 22),
      scheduledTime: "05:30pm",
      platform: "instagram"
    }
  ];

  // Generate years for dropdown (current year ± 5 years)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // Month names
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Get content for specific date
  const getContentForDate = (date: number) => {
    const dateObj = new Date(selectedYear, selectedMonth, date);
    return scheduledContent.filter(content => 
      content.scheduledDate.toDateString() === dateObj.toDateString()
    );
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setCurrentDate(new Date(year, selectedMonth, 1));
  };

  // Handle month change
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);
    setCurrentDate(new Date(selectedYear, month, 1));
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  // Navigate to next month
  const goToNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setSelectedYear(today.getFullYear());
    setSelectedMonth(today.getMonth());
    setCurrentDate(today);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDay = getFirstDayOfMonth(selectedYear, selectedMonth);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 min-h-screen">
      {/* Calendar Controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          {/* Month/Year Dropdowns */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedMonth}
              onChange={(e) => handleMonthChange(parseInt(e.target.value))}
              className="px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 min-w-[140px]"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>
                  {month}
                </option>
              ))}
            </select>
            
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-6 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white text-gray-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 min-w-[100px]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={goToPreviousMonth}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              onClick={goToToday}
              className="px-6 py-3 text-sm font-medium text-pink-600 hover:bg-pink-50 rounded-full transition-colors duration-200 border border-pink-200 hover:border-pink-300"
            >
              Today
            </button>
            
            <button
              onClick={goToNextMonth}
              className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {dayNames.map((day) => (
            <div key={day} className="bg-gray-50 p-4 text-center">
              <span className="text-sm font-semibold text-gray-600">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={index} className="bg-white h-32"></div>;
            }

            const contentForDay = getContentForDate(day);
            const isToday = new Date().toDateString() === new Date(selectedYear, selectedMonth, day).toDateString();

            return (
              <div key={day} className="bg-white h-32 p-2 overflow-hidden hover:bg-gray-50 transition-colors duration-200">
                {/* Day Number */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${isToday ? 'text-pink-600' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {isToday && (
                    <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  )}
                </div>

                {/* Scheduled Content */}
                <div className="space-y-1">
                  {contentForDay.slice(0, 2).map((content) => (
                    <div key={content.id} className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-2 border border-pink-100 hover:shadow-sm transition-shadow duration-200">
                      <div className="flex items-center space-x-2">
                        {/* Video Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={content.videoThumbnail}
                            alt="Video thumbnail"
                            className="w-8 h-6 rounded object-cover"
                          />
                          {/* Platform indicator */}
                          <ThumbnailPlatformIcon
                            platform={detectPlatformFromUrl(content.videoUrl || '')}
                            size="sm"
                            className="absolute -top-1 -right-1"
                          />
                        </div>

                        {/* Content Info */}s
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1">
                            <img
                              src={content.profileImage}
                              alt={content.influencerName}
                              className="w-4 h-4 rounded-full border border-white shadow-sm"
                            />
                            <span className="text-xs font-medium text-gray-800 truncate">
                              {content.influencerName}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mt-0.5">
                            <span className="text-xs text-gray-500 truncate">{content.username}</span>
                          </div>
                          <div className="text-xs text-pink-600 font-medium mt-0.5">
                            {content.scheduledTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Show more indicator */}
                  {contentForDay.length > 2 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{contentForDay.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ScheduledResults;