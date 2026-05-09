'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';
import { useTheme } from '@/context/ThemeContext';

export default function DispatchPage() {
  const { colors, isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('*, profiles(full_name)')
        .in('status', ['picked_up', 'washing', 'ready_for_delivery'])
        .order('created_at', { ascending: true });

      const { data: availableDrivers } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'driver')
        .eq('is_online', true);

      setOrders(pendingOrders || []);
      setDrivers(availableDrivers || []);
    } catch (err) {
      console.error('Error loading dispatch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const assignDriver = async (orderId, driverId) => {
    try {
      await supabase
        .from('orders')
        .update({ driver_id: driverId, status: 'out_for_delivery' })
        .eq('id', orderId);
      loadData();
    } catch (err) {
      console.error('Error assigning driver:', err);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      picked_up: '#8b5cf6',
      washing: '#0ea5e9',
      ready_for_delivery: '#06b6d4',
    };
    return statusColors[status] || colors.light;
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.text, marginBottom: '0.5rem' }}>Dispatch Management</h1>
        <p style={{ color: colors.secondary }}>Assign drivers to orders and manage deliveries</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.warning}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Pending Dispatch</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{orders.length}</p>
        </div>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.success}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Online Drivers</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{drivers.length}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Orders List */}
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Orders Ready for Dispatch</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.length === 0 ? (
              <p style={{ color: colors.secondary, textAlign: 'center', padding: '2rem' }}>No orders pending dispatch</p>
            ) : (
              orders.map(order => (
                <div key={order.id} style={{ borderRadius: '0.5rem', padding: '1rem', border: `2px solid ${getStatusColor(order.status)}`, backgroundColor: colors.bgInput }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.primary }}>#{order.id.slice(0, 8)}</span>
                    <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '0.25rem', background: getStatusColor(order.status), color: 'white', fontWeight: '600' }}>
                      {order.status.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: colors.text, marginBottom: '0.5rem' }}>👤 {order.profiles?.full_name}</p>
                  <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '1rem' }}>Total: ${(order.total || 0).toFixed(2)}</p>
                  <select
                    onChange={(e) => assignDriver(order.id, e.target.value)}
                    defaultValue=""
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      background: colors.bgInput,
                      color: colors.text,
                    }}
                  >
                    <option value="">Select Driver...</option>
                    {drivers.map(driver => (
                      <option key={driver.id} value={driver.id}>
                        {driver.full_name} ({driver.phone_number})
                      </option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Online Drivers */}
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Available Drivers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {drivers.length === 0 ? (
              <p style={{ color: colors.secondary, textAlign: 'center', padding: '2rem' }}>No drivers online</p>
            ) : (
              drivers.map(driver => (
                <div key={driver.id} style={{ padding: '1rem', backgroundColor: colors.bg, borderRadius: '0.375rem', borderLeft: `4px solid ${colors.success}` }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.text, marginBottom: '0.25rem' }}>{driver.full_name}</p>
                  <p style={{ fontSize: '0.75rem', color: colors.secondary }}>📞 {driver.phone_number}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
