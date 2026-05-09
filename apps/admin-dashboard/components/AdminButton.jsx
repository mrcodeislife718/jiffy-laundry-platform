'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminButton({
  children,
  onClick,
  variant = 'primary', // primary, danger, success, secondary, ghost
  size = 'md', // sm, md, lg
  disabled = false,
  loading = false,
  icon = null,
  className = '',
  style = {},
}) {
  const { colors, isDark } = useTheme();

  const variants = {
    primary: {
      bg: colors.primary,
      text: '#ffffff',
      hover: isDark ? '#ff8c4d' : '#ff5520',
    },
    danger: {
      bg: colors.danger,
      text: '#ffffff',
      hover: '#dc2626',
    },
    success: {
      bg: colors.success,
      text: '#ffffff',
      hover: '#059669',
    },
    secondary: {
      bg: colors.bgTertiary,
      text: colors.text,
      hover: colors.border,
    },
    ghost: {
      bg: 'transparent',
      text: colors.primary,
      hover: colors.bgTertiary,
    },
  };

  const sizes = {
    sm: { padding: '0.5rem 0.75rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1rem', fontSize: '0.9375rem' },
    lg: { padding: '1rem 1.5rem', fontSize: '1rem' },
  };

  const v = variants[variant] || variants.primary;
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      style={{
        background: disabled ? colors.border : v.bg,
        color: v.text,
        border: 'none',
        borderRadius: '0.375rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        fontWeight: '500',
        ...s,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = v.hover;
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = isDark
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = v.bg;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }
      }}
    >
      {loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      )}
      {icon && !loading && icon}
      {children}
    </button>
  );
}
