'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#ef4444';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(full_name, phone_number)')
        .gte('created_at', today)
        .order('created_at', { ascending: false });

      setOrders(data || []);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: WARNING,
      pending_dispatch: '#6366f1',
      picked_up: '#8b5cf6',
      washing: '#0ea5e9',
      ready_for_delivery: '#06b6d4',
      out_for_delivery: ORANGE,
      delivered: SUCCESS,
      cancelled: DANGER,
    };
    return colors[status] || LIGHT_GRAY;
  };

  const getStatusLabel = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: DARK_TEXT, marginBottom: '0.5rem' }}>Today's Orders</h1>
        <p style={{ color: LIGHT_GRAY }}>Manage and track all orders for today</p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${SUCCESS}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Total Orders</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>{orders.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${ORANGE}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>In Progress</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>
            {orders.filter(o => !['delivered', 'cancelled', 'pending_payment'].includes(o.status)).length}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${SUCCESS}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Completed</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>
            {orders.filter(o => o.status === 'delivered').length}
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        {['all', 'pending_payment', 'pending_dispatch', 'washing', 'out_for_delivery', 'delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: filter === f ? ORANGE : '#e5e7eb',
              color: filter === f ? 'white' : DARK_TEXT,
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s',
            }}
          >
            {f === 'all' ? 'All Orders' : getStatusLabel(f)}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: 'white', borderRadius: '0.5rem', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: BG, borderBottom: `2px solid #e5e7eb` }}>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Order ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Items</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Total</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: LIGHT_GRAY }}>No orders found</td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id} style={{ borderBottom: `1px solid #e5e7eb`, transition: 'all 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = BG} onMouseLeave={(e) => e.currentTarget.style.background = 'white'}>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: ORANGE }}>{order.id.slice(0, 8)}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: DARK_TEXT }}>{order.profiles?.full_name || 'Unknown'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: LIGHT_GRAY }}>{order.item_count || 'N/A'}</td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT }}>${(order.total || 0).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      background: getStatusColor(order.status),
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                    }}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: LIGHT_GRAY }}>
                    {new Date(order.created_at).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
