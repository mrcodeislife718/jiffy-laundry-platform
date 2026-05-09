'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function StatusBadge({ status, label = null }) {
  const { colors } = useTheme();

  const statusConfig = {
    pending_payment: { bg: '#fef3c7', color: '#92400e', label: 'Pending Payment' },
    pending_dispatch: { bg: '#dbeafe', color: '#1e40af', label: 'Pending Dispatch' },
    accepted: { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
    heading_to_pickup: { bg: '#fce7f3', color: '#9d174d', label: 'Heading to Pickup' },
    arrived_at_pickup: { bg: '#e9d5ff', color: '#581c87', label: 'Arrived at Pickup' },
    picked_up: { bg: '#ccfbf1', color: '#134e4a', label: 'Picked Up' },
    in_transit: { bg: '#fed7aa', color: '#92400e', label: 'In Transit' },
    arrived_at_facility: { bg: '#c7d2fe', color: '#1e1b4b', label: 'Arrived at Facility' },
    sorting: { bg: '#f3e8ff', color: '#5b21b6', label: 'Sorting' },
    washing: { bg: '#bfdbfe', color: '#1e3a8a', label: 'Washing' },
    drying: { bg: '#fed7aa', color: '#7c2d12', label: 'Drying' },
    folding: { bg: '#c7d2fe', color: '#312e81', label: 'Folding' },
    quality_check: { bg: '#dbeafe', color: '#0c4a6e', label: 'Quality Check' },
    packed: { bg: '#d1fae5', color: '#065f46', label: 'Packed' },
    ready_for_delivery: { bg: '#86efac', color: '#15803d', label: 'Ready' },
    out_for_delivery: { bg: '#fbbf24', color: '#78350f', label: 'Out for Delivery' },
    delivered: { bg: '#10b981', color: '#ffffff', label: 'Delivered' },
    cancelled: { bg: '#ef4444', color: '#ffffff', label: 'Cancelled' },
    refunded: { bg: '#8b5cf6', color: '#ffffff', label: 'Refunded' },
    breached: { bg: '#dc2626', color: '#ffffff', label: 'SLA Breached' },
    at_risk: { bg: '#f97316', color: '#ffffff', label: 'At Risk' },
    online: { bg: '#10b981', color: '#ffffff', label: 'Online' },
    offline: { bg: '#6b7280', color: '#ffffff', label: 'Offline' },
    suspended: { bg: '#6b7280', color: '#ffffff', label: 'Suspended' },
    active: { bg: '#10b981', color: '#ffffff', label: 'Active' },
    inactive: { bg: '#9ca3af', color: '#ffffff', label: 'Inactive' },
    open: { bg: '#dbeafe', color: '#0c4a6e', label: 'Open' },
    resolved: { bg: '#d1fae5', color: '#065f46', label: 'Resolved' },
    escalated: { bg: '#fecaca', color: '#7f1d1d', label: 'Escalated' },
  };

  const config = statusConfig[status] || { bg: colors.bgTertiary, color: colors.text, label: label || status };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '50%',
          backgroundColor: config.color,
          opacity: 0.8,
        }}
      />
      {label || config.label}
    </span>
  );
}
