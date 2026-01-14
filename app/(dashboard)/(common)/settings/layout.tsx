// =============================================================================
// src/app/(dashboard)/(common)/settings/layout.tsx
// =============================================================================
// Updated Settings Layout - Clean, no top navigation cards
// Navigation is now handled by the Sidebar component
// =============================================================================

'use client';

import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {children}
    </div>
  );
}