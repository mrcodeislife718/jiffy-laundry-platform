'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function MetricCard({
  label,
  value,
  change,
  changeType = 'positive', // positive, negative, neutral
  icon,
  color = null,
  trend = null, // Array of numbers for sparkline
  onClick,
}) {
  const { colors, isDark } = useTheme();

  const changeColors = {
    positive: colors.success,
    negative: colors.danger,
    neutral: colors.textSecondary,
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: colors.bgSecondary,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = isDark
            ? '0 4px 12px rgba(0,0,0,0.3)'
            : '0 4px 12px rgba(0,0,0,0.1)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.boxShadow = 'none';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{
          fontSize: '0.875rem',
          color: colors.textSecondary,
          margin: 0,
          fontWeight: '500',
        }}>
          {label}
        </p>
        {icon && (
          <div
            style={{
              fontSize: '1.5rem',
              color: color || colors.primary,
              opacity: 0.8,
            }}
          >
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <p style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: colors.text,
        margin: '0 0 0.75rem 0',
      }}>
        {value}
      </p>

      {/* Change */}
      {change && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              color: changeColors[changeType],
              fontSize: '0.875rem',
              fontWeight: '600',
            }}
          >
            {changeType === 'positive' && '↑'}
            {changeType === 'negative' && '↓'}
            {changeType === 'neutral' && '→'}
            {' '}
            {change}
          </span>
          <span style={{
            color: colors.textSecondary,
            fontSize: '0.75rem',
          }}>
            from last period
          </span>
        </div>
      )}

      {/* Sparkline */}
      {trend && (
        <div style={{ marginTop: '0.75rem', height: '40px' }}>
          <svg
            width="100%"
            height="40"
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            style={{ overflow: 'visible' }}
          >
            <polyline
              points={trend
                .map((val, idx) => `${(idx / (trend.length - 1)) * 100},${40 - (val / Math.max(...trend)) * 40}`)
                .join(' ')}
              fill="none"
              stroke={color || colors.primary}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}
    </div>
  );
}
