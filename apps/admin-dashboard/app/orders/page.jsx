'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getAllOrders } from '@jiffylaundry/shared/orders';
import styles from './orders.module.css';

export default function OrdersPage() {
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['allOrders'],
    queryFn: getAllOrders,
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: '#FF9500',
      pending_dispatch: '#FF9500',
      accepted: '#007AFF',
      heading_to_pickup: '#007AFF',
      arrived_at_pickup: '#007AFF',
      picked_up: '#007AFF',
      received: '#34C759',
      sorting: '#34C759',
      washing: '#34C759',
      drying: '#34C759',
      folding: '#34C759',
      quality_check: '#34C759',
      packed: '#34C759',
      ready_for_delivery: '#34C759',
      out_for_delivery: '#34C759',
      delivered: '#34C759',
      cancelled: '#FF3B30',
      refunded: '#FF3B30',
    };
    return colors[status] || '#999';
  };

  const getPaymentStatusBgColor = (status) => {
    const colors = {
      paid: '#E8F5E9',
      unpaid: '#FFF3E0',
      refunded: '#FFEBEE',
    };
    return colors[status] || '#F5F5F5';
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Orders</h1>
        <div className={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Orders</h1>
        <div className={styles.error}>Error loading orders: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Orders</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>No orders found</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.headerRow}>
                <th className={styles.th}>Order ID</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Phone</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Payment</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Created</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={styles.row}>
                  <td className={styles.td}>
                    <code className={styles.code}>{order.id.slice(0, 8)}...</code>
                  </td>
                  <td className={styles.td}>
                    {order.customer?.full_name || 'N/A'}
                  </td>
                  <td className={styles.td}>
                    {order.customer?.phone || 'N/A'}
                  </td>
                  <td className={styles.td}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(order.status),
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getPaymentStatusBgColor(
                          order.payment_status
                        ),
                        fontSize: '12px',
                        fontWeight: 'bold',
                      }}
                    >
                      {order.payment_status?.toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <strong>${(order.total || 0).toFixed(2)}</strong>
                  </td>
                  <td className={styles.td}>
                    {formatDate(order.created_at)}
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
  );
}
