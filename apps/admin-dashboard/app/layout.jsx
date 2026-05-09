'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import RealtimeProvider from '../src/providers/RealtimeProvider';
import Navigation from '@/components/Navigation';
import '../styles/globals.css';

const queryClient = new QueryClient();

function LayoutContent({ children }) {
  const { colors } = useTheme();
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: colors.bg }}>
      <Navigation />
      <main style={{ flex: 1, minHeight: '100vh', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RealtimeProvider>
              <LayoutContent>{children}</LayoutContent>
            </RealtimeProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
