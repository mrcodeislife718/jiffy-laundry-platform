'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LaundrormatSplash() {
  const router = useRouter();
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Redirect after loading completes
          setTimeout(() => {
            router.replace('/');
          }, 300);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white',
      }}
    >
      {/* Logo */}
      <div
        style={{
          marginBottom: '2.5rem',
          animation: 'fadeInScale 0.8s ease-out',
        }}
      >
        <Image
          src="/logo.png"
          alt="Jiffy Laundry"
          width={150}
          height={90}
          priority
          style={{ objectFit: 'contain', filter: 'brightness(1.1)' }}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '2.25rem',
          fontWeight: 'bold',
          marginBottom: '0.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Laundromat Hub
      </h1>

      <p
        style={{
          fontSize: '1rem',
          color: '#cbd5e1',
          marginBottom: '3rem',
          textAlign: 'center',
        }}
      >
        Initializing your location dashboard...
      </p>

      {/* Animated loading bar */}
      <div
        style={{
          width: '60%',
          maxWidth: '300px',
          height: '4px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '1.5rem',
          border: '1px solid rgba(255, 107, 53, 0.3)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(loadingProgress, 100)}%`,
            background: 'linear-gradient(90deg, #ff6b35 0%, #ff8c42 100%)',
            transition: 'width 0.3s ease-out',
            borderRadius: '2px',
            boxShadow: '0 0 10px rgba(255, 107, 53, 0.5)',
          }}
        />
      </div>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#94a3b8',
          textAlign: 'center',
        }}
      >
        {Math.min(Math.round(loadingProgress), 100)}%
      </p>

      {/* Animated dots */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#ff6b35',
              animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
