// src/app/public/layout.tsx
// 'use client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Public Access - Influencer Management',
  description: 'Public access to influencer onboarding and management',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}