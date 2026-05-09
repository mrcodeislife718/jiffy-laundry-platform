'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navigation from '@/components/Navigation';
import '../styles/globals.css';

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f9fafb', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <QueryClientProvider client={queryClient}>
          <Navigation />
          <main style={{ minHeight: '100vh' }}>
            {children}
          </main>
          <footer style={{ background: '#111827', color: 'white', textAlign: 'center', padding: '1.5rem', marginTop: '3rem' }}>
            <p>&copy; 2026 Jiffy Laundry. All rights reserved.</p>
          </footer>
        </QueryClientProvider>
      </body>
    </html>
  );
}
