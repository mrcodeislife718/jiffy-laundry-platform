'use client';

import React, { useEffect, useState } from 'react';
import { initializeRealtimeConnection, closeRealtimeConnection } from '@jiffylaundry/realtime';
import { getCurrentProfile } from '@jiffylaundry/shared';

function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // Get current user
        const profile = await getCurrentProfile();
        if (!profile) return;

        // Initialize realtime connection
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
        const socket = initializeRealtimeConnection(
          profile.id,
          profile.role,
          API_URL
        );

        socket.on('connect', () => {
          console.log('✅ Connected to realtime backend');
          setConnected(true);
          setError(null);
        });

        socket.on('disconnect', () => {
          console.log('❌ Disconnected from realtime backend');
          setConnected(false);
        });

        socket.on('error', (err) => {
          console.error('🔴 Realtime error:', err);
          setError(err.message);
        });
      } catch (err) {
        console.error('Failed to initialize realtime connection:', err);
        setError(err.message);
      }
    };

    initializeConnection();

    return () => {
      closeRealtimeConnection();
    };
  }, []);

  return <>{children}</>;
}

export default RealtimeProvider;
