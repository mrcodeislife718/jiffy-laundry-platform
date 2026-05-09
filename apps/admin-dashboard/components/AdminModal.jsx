'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import AdminButton from './AdminButton';

export default function AdminModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  actions = [],
  size = 'md', // sm, md, lg
}) {
  const { colors, isDark } = useTheme();

  if (!isOpen) return null;

  const sizes = {
    sm: '400px',
    md: '600px',
    lg: '800px',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.bgSecondary,
          borderRadius: '0.75rem',
          boxShadow: isDark
            ? '0 20px 25px -5px rgba(0,0,0,0.5)'
            : '0 20px 25px -5px rgba(0,0,0,0.1)',
          width: '90vw',
          maxWidth: sizes[size] || sizes.md,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            borderBottom: `1px solid ${colors.border}`,
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ flex: 1 }}>
            {title && (
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: colors.text,
                margin: '0 0 0.25rem 0',
              }}>
                {title}
              </h2>
            )}
            {description && (
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                margin: 0,
              }}>
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: 0,
              marginLeft: '1rem',
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>

        {/* Footer with actions */}
        {actions.length > 0 && (
          <div
            style={{
              borderTop: `1px solid ${colors.border}`,
              padding: '1.5rem',
              display: 'flex',
              gap: '0.75rem',
              justifyContent: 'flex-end',
            }}
          >
            <AdminButton
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </AdminButton>
            {actions.map((action, idx) => (
              <AdminButton
                key={idx}
                variant={action.variant || 'primary'}
                onClick={() => {
                  action.onClick?.();
                  if (action.closeModal !== false) {
                    onClose();
                  }
                }}
                loading={action.loading}
                disabled={action.disabled}
              >
                {action.label}
              </AdminButton>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
