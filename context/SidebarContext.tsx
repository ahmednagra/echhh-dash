// src/context/SidebarContext.tsx - SIDEBAR STATE MANAGEMENT
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <SidebarContext.Provider 
      value={{
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}