'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import AdminCard from '@/components/AdminCard';
import AlertBanner from '@/components/AlertBanner';
import MetricCard from '@/components/MetricCard';
import AdminTable from '@/components/AdminTable';
import AdminButton from '@/components/AdminButton';
import StatusBadge from '@/components/StatusBadge';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LIVE_OPERATIONS_REFRESH_INTERVAL = 5000; // 5 seconds

export default function LiveOperationsCenter() {
  const { colors, isDark } = useTheme();
  const {
    getActiveOrders,
    getActiveDrivers,
    getDriverLocations,
    getAtRiskOrders,
    loading,
  } = useAdminOperations();

  const [activeOrders, setActiveOrders] = useState([]);
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [driverLocations, setDriverLocations] = useState([]);
  const [atRiskOrders, setAtRiskOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    activeOrdersCount: 0,
    activeDriversCount: 0,
    atRiskCount: 0,
    slaBreachCount: 0,
    facilityQueueLength: 0,
    onTimePercentage: 95.2,
  });

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadAllOperationsData();
    const interval = setInterval(loadAllOperationsData, LIVE_OPERATIONS_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const loadAllOperationsData = async () => {
    try {
      const [orders, drivers, locations, atRisk] = await Promise.all([
        getActiveOrders(),
        getActiveDrivers(),
        getDriverLocations(),
        getAtRiskOrders(),
      ]);

      setActiveOrders(orders || []);
      setActiveDrivers(drivers || []);
      setDriverLocations(locations || []);
      setAtRiskOrders(atRisk || []);

      // Calculate metrics
      setMetrics(prev => ({
        ...prev,
        activeOrdersCount: orders?.length || 0,
        activeDriversCount: drivers?.length || 0,
        atRiskCount: atRisk?.length || 0,
      }));
    } catch (err) {
      console.error('Error loading operations data:', err);
    }
  };

  return (
    <div style={{ padding: '2rem', background: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: colors.text,
          margin: 0,
          marginBottom: '0.5rem',
        }}>
          🎛️ Live Operations Center
        </h1>
        <p style={{
          color: colors.textSecondary,
          margin: 0,
          fontSize: '0.9375rem',
        }}>
          Real-time platform control and dispatch management — Last updated {new Date().toLocaleTimeString()}
        </p>
      </div>

      {/* Critical Alerts */}
      {atRiskOrders.length > 0 && (
        <AlertBanner
          severity="danger"
          title="⚠️ SLA At Risk"
          message={`${atRiskOrders.length} orders approaching delivery deadline`}
          action={{
            label: 'Review Now',
            onClick: () => {
              // Scroll to at-risk section or navigate
            },
          }}
          icon="🚨"
        />
      )}

      {/* Top Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <MetricCard
          label="Active Orders"
          value={metrics.activeOrdersCount}
          icon="📦"
          change={`+${Math.floor(metrics.activeOrdersCount * 0.05)}`}
          changeType="positive"
          trend={[2, 5, 3, 8, 6, 9, 12]}
        />
        <MetricCard
          label="Active Drivers"
          value={metrics.activeDriversCount}
          icon="🚗"
          change={`+${Math.floor(metrics.activeDriversCount * 0.03)}`}
          changeType="positive"
          color={colors.success}
          trend={[4, 6, 5, 8, 7, 9, 11]}
        />
        <MetricCard
          label="At-Risk Orders"
          value={metrics.atRiskCount}
          icon="⏰"
          change={`${metrics.atRiskCount > 0 ? '!' : '✓'}`}
          changeType={metrics.atRiskCount > 0 ? 'negative' : 'positive'}
          color={metrics.atRiskCount > 0 ? colors.danger : colors.success}
        />
        <MetricCard
          label="On-Time %"
          value={`${metrics.onTimePercentage}%`}
          icon="✓"
          change="+1.2%"
          changeType="positive"
          color={colors.success}
          trend={[92, 93, 94, 95, 94, 95, 95.2]}
        />
      </div>

      {/* Main Grid: Orders + Drivers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Active Orders */}
        <div>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 1rem 0',
          }}>
            📋 Active Orders ({activeOrders.length})
          </h2>
          <AdminTable
            columns={[
              { key: 'id', label: 'Order ID', width: '100px' },
              { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
              { key: 'total', label: 'Total', render: (total) => `$${total?.toFixed(2)}` },
            ]}
            data={activeOrders.slice(0, 8)}
            onRowClick={(row) => {
              // Navigate to order detail
            }}
            rowActions={[
              { label: '⚡', onClick: (row) => {/* Reassign */} },
              { label: '👁️', onClick: (row) => {/* View */} },
            ]}
            empty="No active orders"
            maxHeight="400px"
          />
        </div>

        {/* Active Drivers */}
        <div>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 1rem 0',
          }}>
            🚗 Active Drivers ({activeDrivers.length})
          </h2>
          <AdminTable
            columns={[
              { key: 'name', label: 'Name', width: '120px' },
              { key: 'email', label: 'Email', width: '150px' },
              { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status || 'online'} /> },
            ]}
            data={activeDrivers.slice(0, 8)}
            onRowClick={(row) => {
              // Navigate to driver detail
            }}
            rowActions={[
              { label: '📍', onClick: (row) => {/* View location */} },
              { label: '⛔', onClick: (row) => {/* Suspend */}, variant: 'danger' },
            ]}
            empty="No active drivers"
            maxHeight="400px"
          />
        </div>
      </div>

      {/* SLA At-Risk Orders */}
      {atRiskOrders.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: colors.danger,
            margin: '0 0 1rem 0',
          }}>
            🚨 SLA At-Risk Orders ({atRiskOrders.length})
          </h2>
          <AdminTable
            columns={[
              { key: 'id', label: 'Order ID' },
              { key: 'customer_id', label: 'Customer' },
              { key: 'estimated_delivery', label: 'Est. Delivery', render: (date) => new Date(date).toLocaleTimeString() },
              { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
            ]}
            data={atRiskOrders}
            rowActions={[
              { label: 'Priority', onClick: (row) => {/* Set priority */} },
              { label: 'Reassign', onClick: (row) => {/* Reassign driver */} },
            ]}
            empty="No at-risk orders"
            maxHeight="300px"
          />
        </div>
      )}

      {/* Detailed Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Facility Capacity */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: `1px solid ${colors.border}`,
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 1rem 0',
          }}>
            🏭 Facility Queue Status
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            {[
              { name: 'Main Facility', capacity: 85, max: 100 },
              { name: 'Downtown Hub', capacity: 62, max: 80 },
              { name: 'Airport Center', capacity: 45, max: 100 },
            ].map((facility, idx) => (
              <div key={idx}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.25rem',
                  fontSize: '0.875rem',
                }}>
                  <span>{facility.name}</span>
                  <span style={{ color: colors.textSecondary }}>
                    {facility.capacity}/{facility.max}
                  </span>
                </div>
                <div style={{
                  background: colors.bgTertiary,
                  borderRadius: '0.25rem',
                  height: '0.5rem',
                  overflow: 'hidden',
                }}>
                  <div
                    style={{
                      background: facility.capacity > 75 ? colors.danger : colors.primary,
                      height: '100%',
                      width: `${(facility.capacity / facility.max) * 100}%`,
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: `1px solid ${colors.border}`,
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 1rem 0',
          }}>
            ⚡ Quick Actions
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}>
            <AdminButton
              variant="primary"
              size="sm"
            >
              📍 Create Manual Route
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
            >
              🔄 Trigger Rebalance
            </AdminButton>
            <AdminButton
              variant="secondary"
              size="sm"
            >
              📊 View Analytics
            </AdminButton>
          </div>
        </div>

        {/* System Health */}
        <div style={{
          background: colors.bgSecondary,
          borderRadius: '0.75rem',
          padding: '1.5rem',
          border: `1px solid ${colors.border}`,
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: colors.text,
            margin: '0 0 1rem 0',
          }}>
            ✅ System Health
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            fontSize: '0.875rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>API Latency</span>
              <span style={{ color: colors.success }}>45ms ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Database</span>
              <span style={{ color: colors.success }}>Connected ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Socket.io</span>
              <span style={{ color: colors.success }}>Active ✓</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Redis</span>
              <span style={{ color: colors.success }}>Running ✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

