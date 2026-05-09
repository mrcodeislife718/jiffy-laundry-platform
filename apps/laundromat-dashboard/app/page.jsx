'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const GREEN = '#10b981';
const GRAY = '#9ca3af';

export default function LaundrormatDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    today: 0,
    inProgress: 0,
    completed: 0,
    total: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch orders for today
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', today)
        .lte('created_at', today + 'T23:59:59Z');

      // Fetch all orders for stats
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*');

      const inProgress = todayOrders?.filter(o => o.status === 'washing' || o.status === 'out_for_delivery').length || 0;
      const completed = todayOrders?.filter(o => o.status === 'delivered').length || 0;

      setOrders(todayOrders || []);
      setMetrics({
        today: todayOrders?.length || 0,
        inProgress,
        completed,
        total: allOrders?.length || 0,
      });
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Laundromat Dashboard</h1>
        <p style={{ fontSize: '1rem', color: '#6b7280' }}>Manage your laundromat location operations</p>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Today's Orders</p>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' }}>{metrics.today}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>In Progress</p>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: ORANGE }}>{metrics.inProgress}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Completed by Today</p>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: GREEN }}>{metrics.completed}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Total Orders</p>
          <p style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827' }}>{metrics.total}</p>
        </div>
      </div>

      {/* Order Status Distribution Card */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Order Status Distribution</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          {/* Donut Chart using CSS */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              {/* Complete - 20% (0-72 degrees) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={GREEN}
                strokeWidth="30"
                strokeDasharray="101 505"
              />
              {/* In Progress - 60% (72-288 degrees) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={ORANGE}
                strokeWidth="30"
                strokeDasharray="303 505"
                strokeDashoffset="-101"
              />
              {/* Pending - 20% (288-360 degrees) */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={GRAY}
                strokeWidth="30"
                strokeDasharray="101 505"
                strokeDashoffset="-404"
              />
            </svg>
          </div>
          
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: GREEN }} />
              <span style={{ color: '#6b7280' }}>Complete <strong style={{ color: '#111827' }}>20%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: ORANGE }} />
              <span style={{ color: '#6b7280' }}>In Progress <strong style={{ color: '#111827' }}>60%</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: GRAY }} />
              <span style={{ color: '#6b7280' }}>Pending <strong style={{ color: '#111827' }}>20%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Today's Orders</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Order ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Customer</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Type</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Started</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#6b7280', fontWeight: '600', fontSize: '0.875rem' }}>Ready By</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                  No orders found for today
                </td>
              </tr>
            ) : (
              orders.slice(0, 5).map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '1rem', color: '#111827', fontWeight: '600' }}>{order.id.slice(0, 8)}</td>
                  <td style={{ padding: '1rem', color: '#111827' }}>Customer {order.customer_id?.slice(0, 4)}</td>
                  <td style={{ padding: '1rem', color: '#111827' }}>Wash & Fold</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: order.status === 'delivered' ? GREEN : ORANGE,
                      color: 'white'
                    }}>
                      {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleTimeString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
                    {order.created_at ? new Date(new Date(order.created_at).getTime() + 4 * 60 * 60 * 1000).toLocaleTimeString() : 'N/A'}
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
