'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AdminCard from '@/components/AdminCard';
import AdminInput from '@/components/AdminInput';
import MetricCard from '@/components/MetricCard';

export default function AnalyticsPage() {
  const { colors, isDark } = useTheme();
  const [dateRange, setDateRange] = useState('month');
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    orderVolume: 0,
    customerCount: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  // Load analytics data
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    // Mock data - in production, fetch from Supabase analytics views
    setMetrics({
      totalRevenue: 12450.75,
      orderVolume: 287,
      customerCount: 156,
      avgOrderValue: 43.38,
    });
    setLoading(false);
  };

  // Mock chart data
  const revenueData = [
    { day: 'Mon', revenue: 1450, orders: 32 },
    { day: 'Tue', revenue: 1890, orders: 42 },
    { day: 'Wed', revenue: 1620, orders: 38 },
    { day: 'Thu', revenue: 2100, orders: 48 },
    { day: 'Fri', revenue: 2450, orders: 54 },
    { day: 'Sat', revenue: 2150, orders: 51 },
    { day: 'Sun', revenue: 790, orders: 22 },
  ];

  const topServices = [
    { service: 'Standard Wash', revenue: 3200, percentage: 25.7 },
    { service: 'Express Service', revenue: 2850, percentage: 22.9 },
    { service: 'Premium Fold', revenue: 2200, percentage: 17.6 },
    { service: 'Dry Cleaning', revenue: 1980, percentage: 15.9 },
    { service: 'Special Care', revenue: 1420, percentage: 11.4 },
    { service: 'Other', revenue: 800, percentage: 6.5 },
  ];

  const topFacilities = [
    { facility: 'Downtown Center', orders: 45, revenue: 2240 },
    { facility: 'Mall Location', orders: 38, revenue: 1890 },
    { facility: 'Airport Hub', orders: 32, revenue: 1680 },
    { facility: 'Campus Center', orders: 28, revenue: 1420 },
    { facility: 'West End', orders: 22, revenue: 1220 },
  ];

  const customerMetrics = [
    { metric: 'New Customers', value: 34, change: 15.2 },
    { metric: 'Returning Customers', value: 122, change: 8.5 },
    { metric: 'Avg Rating', value: '4.6/5', change: 2.1 },
    { metric: 'Churn Rate', value: '2.3%', change: -1.5 },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📊 Analytics Dashboard
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          Business insights, operational KPIs, and performance analytics
        </p>
      </div>

      {/* Date Range and Period Selector */}
      <div className="px-6 py-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Period: {dateRange === 'week' ? 'This Week' : dateRange === 'month' ? 'This Month' : 'This Year'}
            </h3>
            <div className="flex gap-2">
              {[
                { key: 'week', label: 'Week' },
                { key: 'month', label: 'Month' },
                { key: 'year', label: 'Year' },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setDateRange(option.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    dateRange === option.key
                      ? 'bg-[#FF5A00] text-white'
                      : isDark
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total Revenue"
            value={`$${metrics.totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
            change={12.5}
            icon="💵"
            color="#FF5A00"
          />
          <MetricCard
            label="Order Volume"
            value={metrics.orderVolume.toLocaleString()}
            change={8.3}
            icon="📦"
            color="#061B3A"
          />
          <MetricCard
            label="Unique Customers"
            value={metrics.customerCount.toLocaleString()}
            change={5.7}
            icon="👥"
            color="#3B82F6"
          />
          <MetricCard
            label="Avg Order Value"
            value={`$${metrics.avgOrderValue.toFixed(2)}`}
            change={3.2}
            icon="💳"
            color="#8B5CF6"
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="px-6 pb-6">
        {/* Revenue Trend */}
        <AdminCard title="Revenue & Order Trend" subtitle="Daily revenue and order volume">
          <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <div className="flex gap-6 items-end justify-center h-64">
              {revenueData.map((day, idx) => {
                const maxRevenue = Math.max(...revenueData.map((d) => d.revenue));
                const revenueHeight = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className="flex items-end gap-1 h-48">
                      <div
                        className="w-3 bg-[#FF5A00] rounded-t opacity-70"
                        style={{ height: `${(revenueHeight * 0.7)}%` }}
                        title={`$${day.revenue}`}
                      />
                      <div
                        className="w-3 bg-[#061B3A] rounded-t"
                        style={{ height: `${revenueHeight}%` }}
                        title={`${day.orders} orders`}
                      />
                    </div>
                    <p className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{day.day}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#FF5A00] opacity-70" />
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-[#061B3A]" />
                <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Orders</span>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Analytics Grid */}
      <div className="px-6 pb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Services */}
        <AdminCard title="Top Services" subtitle="Revenue by service type">
          <div className="space-y-4 p-6">
            {topServices.map((service, idx) => (
              <div key={idx}>
                <div className="flex justify-between mb-1 text-sm">
                  <span className={isDark ? 'text-slate-300' : 'text-gray-700'}>{service.service}</span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    ${service.revenue.toLocaleString()}
                  </span>
                </div>
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                  <div
                    className="h-full bg-[#FF5A00]"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  {service.percentage}% of total
                </p>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Top Facilities */}
        <AdminCard title="Top Facilities" subtitle="Orders and revenue by facility">
          <div className={`p-6`}>
            <div className="space-y-3">
              {topFacilities.map((facility, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                        {facility.facility}
                      </p>
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        {facility.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-[#FF5A00]`}>${facility.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-full bg-[#061B3A]"
                      style={{ width: `${(facility.orders / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AdminCard>

        {/* Customer Metrics */}
        <AdminCard title="Customer Metrics" subtitle="Customer behavior and engagement">
          <div className="space-y-3 p-6">
            {customerMetrics.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg flex justify-between items-center ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}
              >
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{item.metric}</p>
                  <p className={`font-semibold text-lg ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                    {item.value}
                  </p>
                </div>
                <div
                  className={`text-right font-semibold ${
                    item.change > 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.change > 0 ? '↑' : '↓'} {Math.abs(item.change)}%
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        {/* Key Insights */}
        <AdminCard title="Key Insights" subtitle="Performance highlights and recommendations">
          <div className="space-y-3 p-6">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-900'}`}>
                ✓ Strong week-over-week growth in order volume (+15%)
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                ℹ️ Downtown Center is top performer with 16% of total revenue
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-900'}`}>
                ⚠️ Churn rate trending down - focus on retention programs
              </p>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                💡 Standard Wash service accounts for 26% of revenue - optimize pricing
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Footer Note */}
      <div className="px-6 pb-6">
        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Last updated: {new Date().toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })} • Data refreshes every hour
          </p>
        </div>
      </div>
    </div>
  );
}
