// src/app/(public)/layout.tsx
'use client';
import React from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <>
      {/* Public pages content - no additional HTML structure needed */}
      {children}
    </>
  );
}