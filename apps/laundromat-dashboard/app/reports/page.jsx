'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    completionRate: 0,
    weeklyData: [],
    statusData: [],
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      // Get orders from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (orders && orders.length > 0) {
        const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
        const avgOrderValue = totalRevenue / orders.length;
        const deliveredCount = orders.filter(o => o.status === 'delivered').length;
        const completionRate = (deliveredCount / orders.length) * 100;

        // Generate weekly data
        const weeklyData = generateWeeklyData(orders);
        const statusData = generateStatusData(orders);

        setStats({
          totalOrders: orders.length,
          totalRevenue,
          avgOrderValue,
          completionRate,
          weeklyData,
          statusData,
        });
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateWeeklyData = (orders) => {
    const weeklyMap = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!weeklyMap[date]) weeklyMap[date] = { date, revenue: 0, count: 0 };
      weeklyMap[date].revenue += order.total || 0;
      weeklyMap[date].count += 1;
    });
    return Object.values(weeklyMap).slice(0, 7);
  };

  const generateStatusData = (orders) => {
    const statusMap = {};
    orders.forEach(order => {
      const status = order.status.replace(/_/g, ' ').toUpperCase();
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    return Object.entries(statusMap).map(([name, value]) => ({ name, value }));
  };

  const COLORS = [ORANGE, SUCCESS, WARNING, '#3b82f6', '#8b5cf6', '#06b6d4'];

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: DARK_TEXT, marginBottom: '0.5rem' }}>Reports & Analytics</h1>
        <p style={{ color: LIGHT_GRAY }}>Last 30 days performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${ORANGE}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Total Orders</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>{stats.totalOrders}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${SUCCESS}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Total Revenue</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>${stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${WARNING}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Avg Order Value</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>${stats.avgOrderValue.toFixed(2)}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Completion Rate</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>{stats.completionRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Revenue Trend */}
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: DARK_TEXT, marginBottom: '1rem' }}>Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke={ORANGE} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: '600', color: DARK_TEXT, marginBottom: '1rem' }}>Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value})`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {stats.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Day */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: DARK_TEXT, marginBottom: '1rem' }}>Orders per Day</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.weeklyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill={ORANGE} name="Order Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
