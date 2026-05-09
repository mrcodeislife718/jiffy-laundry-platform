'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  multiline = false,
  rows = 4,
  options = [], // For select fields
  icon,
}) {
  const { colors, isDark } = useTheme();

  const commonStyle = {
    fontSize: '0.9375rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    border: `1px solid ${error ? colors.danger : colors.border}`,
    background: disabled ? colors.bgTertiary : colors.bgSecondary,
    color: colors.text,
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: colors.text,
          marginBottom: '0.5rem',
        }}>
          {label}
          {required && <span style={{ color: colors.danger }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <div style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: colors.textSecondary,
            fontSize: '1rem',
            pointerEvents: 'none',
          }}>
            {icon}
          </div>
        )}

        {type === 'select' ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            style={{
              ...commonStyle,
              appearance: 'none',
              paddingRight: '2.5rem',
              paddingLeft: icon ? '2.5rem' : '1rem',
              background: `${disabled ? colors.bgTertiary : colors.bgSecondary} url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"%3e%3cpolyline points="6 9 12 15 18 9"%3e%3c/polyline%3e%3c/svg%3e') no-repeat right 0.75rem center`,
              backgroundSize: '1.5rem',
              paddingRight: '2.5rem',
            }}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : multiline ? (
          <textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            style={{
              ...commonStyle,
              paddingLeft: icon ? '2.5rem' : '1rem',
              resize: 'vertical',
            }}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              ...commonStyle,
              paddingLeft: icon ? '2.5rem' : '1rem',
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = colors.primary;
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? colors.danger : colors.border;
            }}
          />
        )}
      </div>

      {error && (
        <p style={{
          fontSize: '0.75rem',
          color: colors.danger,
          margin: '0.375rem 0 0 0',
        }}>
          {error}
        </p>
      )}

      {helper && !error && (
        <p style={{
          fontSize: '0.75rem',
          color: colors.textSecondary,
          margin: '0.375rem 0 0 0',
        }}>
          {helper}
        </p>
      )}
    </div>
  );
}
