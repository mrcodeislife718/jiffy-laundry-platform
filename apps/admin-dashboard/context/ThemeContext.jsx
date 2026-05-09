'use client';

import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const theme = {
    isDark,
    colors: isDark ? {
      bg: '#0f172a',
      bgSecondary: '#1e293b',
      bgTertiary: '#334155',
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
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      primary: '#ff6b35',
      success: '#10b981',
      warning: '#f59e0b',
      danger: '#ef4444',
    },
  };

  return (
    <ThemeContext.Provider value={{ ...theme, setIsDark, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
