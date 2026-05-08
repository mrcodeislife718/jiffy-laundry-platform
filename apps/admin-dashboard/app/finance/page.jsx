'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@jiffylaundry/shared/supabase';
import styles from './finance.module.css';

export default function FinancePage() {
  // Fetch all orders
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics
  const calculateMetrics = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysOrders = orders.filter((order) => {
      const createdAt = new Date(order.created_at);
      return createdAt >= today && createdAt < tomorrow;
    });

    const paidOrders = orders.filter((order) => order.payment_status === 'paid');
    const todaysPaidOrders = todaysOrders.filter(
      (order) => order.payment_status === 'paid'
    );
    const refundedOrders = orders.filter(
      (order) => order.payment_status === 'refunded'
    );

    const todayRevenue = todaysPaidOrders.reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );
    const totalRevenue = paidOrders.reduce(
      (sum, order) => sum + parseFloat(order.total || 0),
      0
    );
    const averageOrderValue =
      paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

    return {
      todayRevenue,
      todaysOrderCount: todaysOrders.length,
      averageOrderValue,
      paidOrdersCount: paidOrders.length,
      refundedOrdersCount: refundedOrders.length,
      latestOrders: orders.slice(0, 10),
      totalRevenue,
      totalOrders: orders.length,
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Finance Dashboard</h1>
      </div>

      {/* Top Metrics */}
      <div className={styles.metricsGrid}>
        {/* Today Revenue */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Today Revenue</div>
          <div className={styles.metricValue}>
            ${parseFloat(metrics.todayRevenue).toFixed(2)}
          </div>
          <div className={styles.metricSubtext}>
            {metrics.todaysOrderCount} order
            {metrics.todaysOrderCount !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Orders Today */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Orders Today</div>
          <div className={styles.metricValue}>{metrics.todaysOrderCount}</div>
          <div className={styles.metricSubtext}>
            ${parseFloat(metrics.todayRevenue).toFixed(2)} in revenue
          </div>
        </div>

        {/* Average Order Value */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Average Order Value</div>
          <div className={styles.metricValue}>
            ${parseFloat(metrics.averageOrderValue).toFixed(2)}
          </div>
          <div className={styles.metricSubtext}>
            Based on {metrics.paidOrdersCount} paid orders
          </div>
        </div>

        {/* Paid Orders */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Paid Orders</div>
          <div className={styles.metricValue}>{metrics.paidOrdersCount}</div>
          <div className={styles.metricSubtext}>
            ${parseFloat(metrics.totalRevenue).toFixed(2)} total
          </div>
        </div>

        {/* Refunded Orders */}
        <div className={styles.metricCard}>
          <div className={styles.metricCard_refund}>
            <div className={styles.metricLabel}>Refunded Orders</div>
            <div className={styles.metricValue}>{metrics.refundedOrdersCount}</div>
            <div className={styles.metricSubtext}>
              {metrics.refundedOrdersCount > 0
                ? `${((metrics.refundedOrdersCount / metrics.totalOrders) * 100).toFixed(
                    1
                  )}% of all orders`
                : 'No refunds'}
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}>Total Orders</div>
          <div className={styles.metricValue}>{metrics.totalOrders}</div>
          <div className={styles.metricSubtext}>
            Avg: ${parseFloat(metrics.averageOrderValue).toFixed(2)}/order
          </div>
        </div>
      </div>

      {/* Latest Orders Table */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Latest Orders</h2>
        {metrics.latestOrders.length === 0 ? (
          <div className={styles.noData}>No orders yet</div>
        ) : (
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr className={styles.tableHeader}>
                  <th className={styles.th}>Order ID</th>
                  <th className={styles.th}>Amount</th>
                  <th className={styles.th}>Payment Status</th>
                  <th className={styles.th}>Order Status</th>
                  <th className={styles.th}>Created</th>
                  <th className={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.latestOrders.map((order) => (
                  <tr key={order.id} className={styles.tableRow}>
                    <td className={styles.td}>
                      <code className={styles.code}>{order.id.slice(0, 8)}...</code>
                    </td>
                    <td className={styles.td}>
                      <strong>${parseFloat(order.total || 0).toFixed(2)}</strong>
                    </td>
                    <td className={styles.td}>
                      <span
                        style={{
                          backgroundColor:
                            order.payment_status === 'paid'
                              ? '#34C759'
                              : order.payment_status === 'refunded'
                              ? '#FF3B30'
                              : '#FF9500',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {order.payment_status?.toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <span
                        style={{
                          backgroundColor:
                            order.status === 'delivered'
                              ? '#34C759'
                              : order.status === 'cancelled'
                              ? '#FF3B30'
                              : '#007AFF',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                        }}
                      >
                        {order.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className={styles.td}>
                      {new Date(order.created_at).toLocaleDateString()}{' '}
                      {new Date(order.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className={styles.td}>
                      <Link href={`/orders/${order.id}`} className={styles.link}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Summary</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Total Revenue (All Time)</div>
            <div className={styles.summaryValue}>
              ${parseFloat(metrics.totalRevenue).toFixed(2)}
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Success Rate</div>
            <div className={styles.summaryValue}>
              {metrics.totalOrders > 0
                ? (
                    ((metrics.paidOrdersCount + (metrics.totalOrders - metrics.paidOrdersCount - metrics.refundedOrdersCount)) /
                      metrics.totalOrders) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
          <div className={styles.summaryItem}>
            <div className={styles.summaryLabel}>Pending Payment Orders</div>
            <div className={styles.summaryValue}>
              {orders.filter((o) => o.payment_status === 'unpaid').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
