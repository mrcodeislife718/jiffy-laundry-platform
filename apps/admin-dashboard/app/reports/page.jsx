'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ReportsPage() {
  const { colors } = useTheme();
  const [timeRange, setTimeRange] = useState('week');

  // Sample data for charts
  const weeklyData = [
    { date: 'Mon', orders: 145, revenue: 2400, customers: 32 },
    { date: 'Tue', orders: 165, revenue: 2210, customers: 38 },
    { date: 'Wed', orders: 155, revenue: 2290, customers: 35 },
    { date: 'Thu', orders: 175, revenue: 2000, customers: 42 },
    { date: 'Fri', orders: 195, revenue: 2181, customers: 48 },
    { date: 'Sat', orders: 210, revenue: 2500, customers: 55 },
    { date: 'Sun', orders: 180, revenue: 2100, customers: 45 },
  ];

  const serviceBreakdown = [
    { name: 'Wash & Fold', value: 45, fill: colors.primary },
    { name: 'Wash & Iron', value: 30, fill: colors.success },
    { name: 'Dry Clean', value: 15, fill: colors.warning },
    { name: 'Premium Care', value: 10, fill: colors.danger },
  ];

  const metrics = [
    { label: 'Total Orders', value: '1,248', change: '+12%' },
    { label: 'Total Revenue', value: '$18,750', change: '+8%' },
    { label: 'Avg Order Value', value: '$59.50', change: '+3%' },
    { label: 'Conversion Rate', value: '76%', change: '+2%' },
  ];

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.text, marginBottom: '0.5rem' }}>Analytics & Reports</h1>
        <p style={{ color: colors.secondary }}>Business insights and performance metrics</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['day', 'week', 'month', 'year'].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              background: timeRange === range ? colors.primary : colors.bgSecondary,
              color: timeRange === range ? 'white' : colors.text,
              cursor: 'pointer',
              fontWeight: '500',
              textTransform: 'capitalize',
            }}
          >
            {range}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {metrics.map((metric, idx) => (
          <div key={idx} style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>{metric.label}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{metric.value}</p>
              <span style={{ color: colors.success, fontSize: '0.875rem', fontWeight: '600' }}>{metric.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Orders & Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
              <XAxis dataKey="date" stroke={colors.secondary} />
              <YAxis stroke={colors.secondary} />
              <Tooltip contentStyle={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }} />
              <Legend />
              <Line type="monotone" dataKey="orders" stroke={colors.primary} strokeWidth={2} />
              <Line type="monotone" dataKey="revenue" stroke={colors.success} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Service Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={serviceBreakdown} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name} ${value}%`} outerRadius={80} fill={colors.primary} dataKey="value">
                {serviceBreakdown.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Daily Performance</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
            <XAxis dataKey="date" stroke={colors.secondary} />
            <YAxis stroke={colors.secondary} />
            <Tooltip contentStyle={{ background: colors.bgSecondary, border: `1px solid ${colors.border}` }} />
            <Legend />
            <Bar dataKey="customers" fill={colors.primary} />
            <Bar dataKey="orders" fill={colors.success} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
