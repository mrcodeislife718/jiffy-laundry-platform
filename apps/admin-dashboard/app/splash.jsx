'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminSplash() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check and loading
    const timer = setTimeout(() => {
      setIsLoading(false);
      // Redirect to home after splash
      router.replace('/');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      {/* Logo with fade-in animation */}
      <div
        style={{
          opacity: isLoading ? 1 : 0.8,
          transform: isLoading ? 'scale(1)' : 'scale(0.95)',
          transition: 'all 0.3s ease-in-out',
          marginBottom: '2rem',
        }}
      >
        <Image
          src="/logo.png"
          alt="Jiffy Laundry Admin"
          width={150}
          height={90}
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '0.5rem',
          textAlign: 'center',
        }}
      >
        Jiffy Admin
      </h1>

      <p
        style={{
          fontSize: '1rem',
          color: '#6b7280',
          marginBottom: '3rem',
          textAlign: 'center',
        }}
      >
        Launching your dashboard...
      </p>

      {/* Loading dots */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        {[0, 1, 2].map((dot) => (
          <div
            key={dot}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: dot === 0 ? '#ff6b35' : '#d1d5db',
              animation: `pulse 1.5s ease-in-out ${dot * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Loading bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '3rem',
          width: '70%',
          height: '3px',
          backgroundColor: '#e5e7eb',
          borderRadius: '2px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            backgroundColor: '#ff6b35',
            animation: 'loading 2.5s ease-in-out forwards',
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
