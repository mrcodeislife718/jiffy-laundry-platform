'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import Navigation from '@/components/Navigation';
import '../styles/globals.css';

const queryClient = new QueryClient();

function LayoutShell({ children }) {
  const { colors } = useTheme();
  return (
    <>
      <Navigation />
      <main style={{ minHeight: '100vh', background: colors.bg, color: colors.text }}>
        {children}
      </main>
      <footer style={{ background: colors.bgSecondary, color: colors.textSecondary, textAlign: 'center', padding: '1.5rem', marginTop: '3rem', borderTop: `1px solid ${colors.border}` }}>
        <p>&copy; 2026 Jiffy Laundry. All rights reserved.</p>
      </footer>
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LayoutShell>{children}</LayoutShell>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
