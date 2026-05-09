'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminCard({
  title,
  subtitle,
  children,
  onClick,
  highlighted = false,
  status = null,
  action = null,
  className = '',
  style = {},
}) {
  const { colors, isDark } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bgSecondary,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
        border: highlighted ? `2px solid ${colors.primary}` : `1px solid ${colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = isDark
            ? '0 4px 12px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.15)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = isDark
            ? '0 1px 3px rgba(0,0,0,0.3)'
            : '0 1px 3px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          {title && (
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: colors.text,
              margin: 0,
              marginBottom: subtitle ? '0.25rem' : 0,
            }}>
              {title}
            </h3>
          )}
          {subtitle && (
            <p style={{
              fontSize: '0.875rem',
              color: colors.textSecondary,
              margin: 0,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {status && (
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              backgroundColor: status.bg,
              color: status.color,
            }}>
              {status.label}
            </span>
          )}
          {action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                action.onClick?.();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '1.25rem',
                padding: '0.25rem',
              }}
            >
              {action.icon}
            </button>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
