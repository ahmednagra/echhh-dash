// src/app/campaign-analytics-report/layout.tsx
// CRITICAL: This layout ensures NO authentication providers wrap the shared reports
// 'use client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Campaign Analytics Report',
  description: 'Shared campaign analytics report',
  robots: 'noindex, nofollow', // Prevent search engine indexing
};

interface CampaignAnalyticsLayoutProps {
  children: React.ReactNode;
}

export default function CampaignAnalyticsLayout({
  children,
}: CampaignAnalyticsLayoutProps) {
  // CRITICAL: No SessionProvider or other authentication providers here
  // This ensures the shared reports are completely public
  
  return (
    <>
      {children}
    </>
  );
}