'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AdminTable({
  columns, // Array of { key, label, render?, width?, align? }
  data = [],
  onRowClick,
  rowActions = [], // Array of { label, onClick(row), icon?, variant? }
  loading = false,
  empty = 'No data found',
  maxHeight = '600px',
}) {
  const { colors, isDark } = useTheme();

  return (
    <div
      style={{
        background: colors.bgSecondary,
        borderRadius: '0.75rem',
        border: `1px solid ${colors.border}`,
        overflow: 'hidden',
      }}
    >
      {loading ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: colors.textSecondary,
          }}
        >
          Loading...
        </div>
      ) : data.length === 0 ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: colors.textSecondary,
          }}
        >
          {empty}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', maxHeight }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem',
            }}
          >
            {/* Header */}
            <thead>
              <tr
                style={{
                  borderBottom: `2px solid ${colors.border}`,
                  backgroundColor: colors.bgTertiary,
                }}
              >
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: col.align || 'left',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      width: col.width,
                    }}
                  >
                    {col.label}
                  </th>
                ))}
                {rowActions.length > 0 && (
                  <th
                    style={{
                      padding: '0.75rem 1rem',
                      textAlign: 'center',
                      fontWeight: '600',
                      color: colors.textSecondary,
                      width: '100px',
                    }}
                  >
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: `1px solid ${colors.border}`,
                    backgroundColor: onRowClick ? 'transparent' : undefined,
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = colors.bgTertiary;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (onRowClick) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {columns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      style={{
                        padding: '0.75rem 1rem',
                        color: colors.text,
                        textAlign: col.align || 'left',
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}

                  {rowActions.length > 0 && (
                    <td
                      style={{
                        padding: '0.75rem 1rem',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {rowActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              action.onClick(row);
                            }}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: action.variant === 'danger' ? colors.danger : colors.primary,
                              cursor: 'pointer',
                              fontSize: '0.875rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '0.25rem',
                              transition: 'background-color 0.2s ease',
                            }}
                            title={action.label}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = colors.bgTertiary;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {action.icon || action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
