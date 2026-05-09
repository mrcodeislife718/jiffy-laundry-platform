'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AlertBanner({
  severity = 'info', // info, warning, danger, success
  title,
  message,
  action = null,
  onDismiss,
  icon,
}) {
  const { colors } = useTheme();

  const severityConfig = {
    info: { bg: '#dbeafe', border: '#0284c7', icon: 'ℹ️', text: '#0c4a6e' },
    warning: { bg: '#fef3c7', border: '#f59e0b', icon: '⚠️', text: '#92400e' },
    danger: { bg: '#fee2e2', border: '#ef4444', icon: '🚨', text: '#7f1d1d' },
    success: { bg: '#dcfce7', border: '#10b981', icon: '✓', text: '#166534' },
  };

  const config = severityConfig[severity];

  return (
    <div
      style={{
        background: config.bg,
        border: `2px solid ${config.border}`,
        borderRadius: '0.5rem',
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-start',
        marginBottom: '1rem',
      }}
    >
      <div style={{ fontSize: '1.25rem', color: config.text }}>
        {icon || config.icon}
      </div>

      <div style={{ flex: 1 }}>
        {title && (
          <h4 style={{
            fontSize: '0.875rem',
            fontWeight: '600',
            color: config.text,
            margin: '0 0 0.25rem 0',
          }}>
            {title}
          </h4>
        )}
        {message && (
          <p style={{
            fontSize: '0.875rem',
            color: config.text,
            margin: 0,
            opacity: 0.9,
          }}>
            {message}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {action && (
          <button
            onClick={action.onClick}
            style={{
              background: 'transparent',
              border: 'none',
              color: config.border,
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${config.border}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {action.label}
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'transparent',
              border: 'none',
              color: config.text,
              cursor: 'pointer',
              fontSize: '1.25rem',
              padding: 0,
              opacity: 0.6,
              transition: 'opacity 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = 0.6;
            }}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
