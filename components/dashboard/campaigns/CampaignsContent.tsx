// src/components/dashboard/campaigns/CampaignsContent.tsx
'use client';

import { ReactNode } from 'react';

interface CampaignsContentProps {
  children: ReactNode;
  className?: string;
}

export default function CampaignsContent({ 
  children, 
  className = "" 
}: CampaignsContentProps) {
  return (
    <div className={`px-6 py-8 ${className}`}>
      {children}
    </div>
  );
}