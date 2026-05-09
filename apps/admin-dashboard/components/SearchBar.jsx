'use client';

import { useState } from 'react';

export default function SearchBar({ placeholder = 'Search...', onSearch, value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        border: `2px solid ${isFocused ? '#3b82f6' : '#e5e7eb'}`,
        background: isFocused ? '#f0f4ff' : 'white',
        transition: 'all 0.2s',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isFocused ? '#3b82f6' : '#9ca3af'} strokeWidth="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          outline: 'none',
          background: 'transparent',
          border: 'none',
          fontSize: '1rem',
        }}
      />
      {value && (
        <button
          onClick={() => onChange?.('')}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
