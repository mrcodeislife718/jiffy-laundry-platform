'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('jl-theme') : null;
    if (stored === 'dark') setIsDark(true);
  }, []);

  // Persist
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('jl-theme', isDark ? 'dark' : 'light');
    }
  }, [isDark]);

  const colors = isDark ? {
    bg: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    bgInput: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#cbd5e1',
    border: '#475569',
    primary: '#ff6b35',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  } : {
    bg: '#f9fafb',
    bgSecondary: '#ffffff',
    bgTertiary: '#f3f4f6',
    bgInput: '#f3f4f6',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    primary: '#ff6b35',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
  };

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
