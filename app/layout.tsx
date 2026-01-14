// src/app/layout.tsx
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { SidebarProvider } from '@/context/SidebarContext';
import { LocationCacheProvider } from '@/context/LocationCacheContext';
import { CampaignProvider } from '@/context/CampaignContext';
import { QueryProvider } from '@/providers/QueryProvider';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/navbar';
import ClientOnly from '@/components/ClientOnly';
import type { Metadata } from 'next';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Echooo - Influencer Platform',
  description: 'Manage influencer campaigns with Echooo',
  icons: {
    icon: [
      { url: '/favicons/echooo-favicon.png' },
      { url: '/favicons/echooo-favicon.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicons/echooo-favicon.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
  },
};

export const dynamic = 'force-dynamic';
export const revalidate = false;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body 
        className={inter.className}
        suppressHydrationWarning={true}
      >
        <ClientOnly>
          {/* ✅ QueryProvider added here - provides React Query context */}
          <QueryProvider>
            <AuthProvider>
              <CampaignProvider>
                <LocationCacheProvider>
                  <SidebarProvider>
                    {/* Single navbar for the entire app */}
                    <Navbar />
                    
                    {/* Main content */}
                    <main className="w-full">
                      {children}
                    </main>
                    
                    {/* Toast notifications */}
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                      }}
                    />
                  </SidebarProvider>
                </LocationCacheProvider>
              </CampaignProvider>
            </AuthProvider>
          </QueryProvider>
        </ClientOnly>
      </body>
    </html>
  );
}