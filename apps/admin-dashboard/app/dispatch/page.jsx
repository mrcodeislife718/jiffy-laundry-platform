'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPendingDispatchOrders,
  getAvailableDrivers,
  getAvailableLaundromats,
  updateOrderDetails,
} from '@jiffylaundry/shared/orders';
import styles from './dispatch.module.css';

export default function DispatchPage() {
  const queryClient = useQueryClient();
  const [selectedOrders, setSelectedOrders] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch pending dispatch orders
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ['pending-dispatch-orders'],
    queryFn: getPendingDispatchOrders,
  });

  // Fetch drivers
  const { data: drivers = [], isLoading: driversLoading } = useQuery({
    queryKey: ['drivers'],
    queryFn: getAvailableDrivers,
  });

  // Fetch laundromats
  const { data: laundromats = [], isLoading: laundromatsLoading } = useQuery({
    queryKey: ['laundromats'],
    queryFn: getAvailableLaundromats,
  });

  // Dispatch mutation
  const dispatchMutation = useMutation({
    mutationFn: async (payload) => {
      const { orderId, driverId, laundromat_id } = payload;
      if (!driverId || !laundromat_id) {
        throw new Error('Driver and laundromat must be selected');
      }
      return updateOrderDetails({
        orderId,
        driverId,
        laundromat_id,
        status: 'accepted',
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-dispatch-orders'] });
      setSuccessMessage(`Order ${data.id.slice(0, 8)}... dispatched successfully`);
      setErrorMessage('');
      // Clear selected values for this order
      setSelectedOrders((prev) => {
        const newSelected = { ...prev };
        delete newSelected[data.id];
        return newSelected;
      });
      // Hide success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(`Error: ${error.message || 'Failed to dispatch order'}`);
      setSuccessMessage('');
    },
  });

  const handleDispatch = (orderId) => {
    const order = selectedOrders[orderId];
    if (!order || !order.driverId || !order.laundromat_id) {
      setErrorMessage('Please select both driver and laundromat');
      return;
    }
    dispatchMutation.mutate({
      orderId,
      driverId: order.driverId,
      laundromat_id: order.laundromat_id,
    });
  };

  const updateOrderSelection = (orderId, field, value) => {
    setSelectedOrders((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
    // Clear messages when user makes a selection
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getTotalItems = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  };

  if (ordersLoading || driversLoading || laundromatsLoading) {
    return <div className={styles.container}>Loading...</div>;
  }

  if (ordersError) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading orders: {ordersError.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manual Dispatch</h1>
        <p className={styles.subtitle}>
          {orders.length} order{orders.length !== 1 ? 's' : ''} waiting for dispatch
        </p>
      </div>

      {successMessage && (
        <div className={styles.successMessage}>{successMessage}</div>
      )}

      {errorMessage && <div className={styles.errorMessage}>{errorMessage}</div>}

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No orders pending dispatch</p>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderId}>
                  <span className={styles.label}>Order ID:</span>
                  <code className={styles.code}>{order.id.slice(0, 8)}...</code>
                </div>
                <div className={styles.orderMeta}>
                  <span className={styles.badge}>
                    {getTotalItems(order.order_items)} item
                    {getTotalItems(order.order_items) !== 1 ? 's' : ''}
                  </span>
                  <span className={styles.totalBadge}>${(order.total || 0).toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className={styles.orderSection}>
                <div className={styles.sectionLabel}>Customer</div>
                <div className={styles.grid}>
                  <div>
                    <span className={styles.fieldLabel}>Name:</span> {order.customer?.full_name}
                  </div>
                  <div>
                    <span className={styles.fieldLabel}>Phone:</span> {order.customer?.phone}
                  </div>
                </div>
              </div>

              {/* Driver Selection */}
              <div className={styles.orderSection}>
                <div className={styles.sectionLabel}>Select Driver</div>
                <select
                  value={selectedOrders[order.id]?.driverId || ''}
                  onChange={(e) =>
                    updateOrderSelection(order.id, 'driverId', e.target.value || null)
                  }
                  disabled={dispatchMutation.isPending}
                  className={styles.select}
                >
                  <option value="">-- Choose Driver --</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.full_name} ({driver.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Laundromat Selection */}
              <div className={styles.orderSection}>
                <div className={styles.sectionLabel}>Select Laundromat</div>
                <select
                  value={selectedOrders[order.id]?.laundromat_id || ''}
                  onChange={(e) =>
                    updateOrderSelection(order.id, 'laundromat_id', e.target.value || null)
                  }
                  disabled={dispatchMutation.isPending}
                  className={styles.select}
                >
                  <option value="">-- Choose Laundromat --</option>
                  {laundromats.map((laundromat) => (
                    <option key={laundromat.id} value={laundromat.id}>
                      {laundromat.name} - {laundromat.city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dispatch Button */}
              <div className={styles.orderFooter}>
                <button
                  onClick={() => handleDispatch(order.id)}
                  disabled={
                    dispatchMutation.isPending ||
                    !selectedOrders[order.id]?.driverId ||
                    !selectedOrders[order.id]?.laundromat_id
                  }
                  className={styles.dispatchButton}
                >
                  {dispatchMutation.isPending ? 'Dispatching...' : 'Dispatch Order'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
