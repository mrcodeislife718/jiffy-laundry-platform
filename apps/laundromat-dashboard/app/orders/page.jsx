'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getCurrentProfile } from '@jiffylaundry/shared/auth';
import { getLaundomatOrders } from '@jiffylaundry/shared/orders';
import styles from './orders.module.css';

export default function OrdersPage() {
  const [currentUser, setCurrentUser] = React.useState(null);
  const [laundrommat_id, setLaundromat_id] = React.useState(null);

  // Get current user profile
  React.useEffect(() => {
    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          const profile = await getCurrentProfile();
          if (profile && profile.laundromat_id) {
            setLaundromat_id(profile.laundromat_id);
          }
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    loadProfile();
  }, []);

  // Fetch orders
  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ['laundromat-orders', laundrommat_id],
    queryFn: () => getLaundomatOrders(laundrommat_id),
    enabled: !!laundrommat_id,
  });

  const getStatusColor = (status) => {
    const colors = {
      received: '#FF9500',
      sorting: '#007AFF',
      washing: '#007AFF',
      drying: '#007AFF',
      folding: '#34C759',
      quality_check: '#34C759',
      packed: '#34C759',
      ready_for_delivery: '#34C759',
    };
    return colors[status] || '#999';
  };

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Not authenticated</div>
      </div>
    );
  }

  if (!laundrommat_id) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>No laundromat assigned to your account</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading orders: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order Queue</h1>
        <p className={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} in queue
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No orders in queue</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.th}>Order ID</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Created</th>
                <th className={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className={styles.tableRow}>
                  <td className={styles.td}>
                    <code className={styles.code}>{order.id.slice(0, 8)}...</code>
                  </td>
                  <td className={styles.td}>{order.customer?.full_name || 'N/A'}</td>
                  <td className={styles.td}>
                    {order.order_items?.length || 0} item
                    {order.order_items?.length !== 1 ? 's' : ''}
                  </td>
                  <td className={styles.td}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        backgroundColor: getStatusColor(order.status),
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: '12px',
                      }}
                    >
                      {order.status?.replace(/_/g, ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className={styles.td}>
                    {new Date(order.created_at).toLocaleDateString()}
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
