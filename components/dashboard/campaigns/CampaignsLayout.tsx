// src/components/dashboard/campaigns/CampaignsLayout.tsx
'use client';

import { ReactNode } from 'react';

interface CampaignsLayoutProps {
  children: ReactNode;
  className?: string;
}

export default function CampaignsLayout({ 
  children, 
  className = "" 
}: CampaignsLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 rounded-2xl mt-0 mb-4 overflow-hidden shadow-lg ${className}`}>
      {children}
    </div>
  );
}