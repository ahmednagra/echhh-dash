// =====================================
// src/components/dashboard/platform/components/MembersTable/ContactTimeline.tsx
// =====================================

'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'react-feather';
import { AssignmentInfluencer } from '@/types/assignment-influencers';

interface ContactTimelineProps {
  member: AssignmentInfluencer;
}

const NextContactTimer = ({ nextContactAt }: { nextContactAt: string | null }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!nextContactAt) {
      setTimeLeft('N/A');
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(nextContactAt).getTime();
      const difference = target - now;

      if (difference > 0) {
        setIsOverdue(false);
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setIsUrgent(difference < 3600000); // 1 hour in milliseconds

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setIsOverdue(true);
        setIsUrgent(false);
        const overdueDays = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
        const overdueHours = Math.floor((Math.abs(difference) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const overdueMinutes = Math.floor((Math.abs(difference) % (1000 * 60 * 60)) / (1000 * 60));
        
        if (overdueDays > 0) {
          setTimeLeft(`${overdueDays}d ${overdueHours}h overdue`);
        } else if (overdueHours > 0) {
          setTimeLeft(`${overdueHours}h ${overdueMinutes}m overdue`);
        } else {
          setTimeLeft('Overdue');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [nextContactAt]);

  if (!nextContactAt) {
    return <span className="text-gray-400">N/A</span>;
  }

  return (
    <span className={`font-mono text-xs ${
      isOverdue 
        ? 'text-red-600 font-semibold animate-pulse' 
        : isUrgent 
          ? 'text-orange-600 font-semibold animate-pulse bg-orange-50 px-1 py-0.5 rounded' 
          : 'text-blue-600'
    }`}>
      {timeLeft}
    </span>
  );
};

export default function ContactTimeline({ 
  member 
}: ContactTimelineProps) {
  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const difference = now - date;
    
    const minutes = Math.floor(difference / (1000 * 60));
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}min ago`;
    if (hours < 24) return `${hours}h ${minutes % 60}m ago`;
    return `${days}d ${hours % 24}h ago`;
  };

  const formatNextContactTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    
    const now = new Date().getTime();
    const date = new Date(dateString).getTime();
    const difference = date - now;
    
    if (Math.abs(difference) > 24 * 60 * 60 * 1000) {
      const days = Math.floor(Math.abs(difference) / (1000 * 60 * 60 * 24));
      return difference > 0 ? `in ${days}d` : `${days}d ago`;
    }
    
    return null;
  };

  const formatFullDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleString();
  };

  const nextContactFormatted = formatNextContactTime(member.next_contact_at);
  
// ✅ FIXED: Add optional chaining to handle null status
const shouldShowTimer = member.campaign_influencer.status?.name === 'discovered' || member.campaign_influencer.status?.name === 'contacted';

  return (
    <div className="w-28 space-y-1">
      <div className="flex items-center text-xs group relative">
        <Calendar className="w-3 h-3 text-gray-500 mr-1 flex-shrink-0" />
        <span className="text-gray-600 truncate">{formatRelativeTime(member.last_contacted_at)}</span>
        
        {/* Tooltip for Last contacted at */}
        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50">
          <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
            Last contacted at: {formatFullDateTime(member.last_contacted_at)}
            <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      </div>
      
      {shouldShowTimer ? (
        <div className="flex items-center text-xs group relative">
          <Clock className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
          <span className="text-gray-600">
            {nextContactFormatted ? (
              <span className="text-blue-600 truncate">{nextContactFormatted}</span>
            ) : (
              <NextContactTimer 
                key={`${member.id}-${member.next_contact_at}`}
                nextContactAt={member.next_contact_at} 
              />
            )}
          </span>
          
          {/* Tooltip for Next contact at */}
          <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-50">
            <div className="bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Next contact at: {formatFullDateTime(member.next_contact_at)}
              <div className="absolute top-full left-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center text-xs">
          <Clock className="w-3 h-3 text-blue-500 mr-1 flex-shrink-0" />
          <span className="text-gray-400">-</span>
        </div>
      )}
    </div>
  );
}