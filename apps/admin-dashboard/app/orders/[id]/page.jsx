'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderById,
  getAvailableDrivers,
  getAvailableLaundromats,
  updateOrderDetails,
} from '@jiffylaundry/shared/orders';
import { supabase } from '@jiffylaundry/shared/supabase';
import styles from './detail.module.css';

const STATUS_OPTIONS = [
  'pending_payment',
  'pending_dispatch',
  'accepted',
  'heading_to_pickup',
  'arrived_at_pickup',
  'picked_up',
  'received',
  'sorting',
  'washing',
  'drying',
  'folding',
  'quality_check',
  'packed',
  'ready_for_delivery',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const queryClient = useQueryClient();

  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [selectedLaundromat, setSelectedLaundromat] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // Fetch order
  const { data: order, isLoading: orderLoading, error: orderError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
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

  // Initialize selected values
  React.useEffect(() => {
    if (order) {
      setSelectedDriverId(order.driver_id || null);
      setSelectedLaundromat(order.laundromat_id || null);
      setSelectedStatus(order.status);
    }
  }, [order]);

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: (updates) => updateOrderDetails({ orderId, ...updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      alert('Order updated successfully');
    },
    onError: (error) => {
      alert('Error updating order: ' + (error.message || 'Unknown error'));
    },
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ amount, reason }) => {
      // Get current user (admin)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Insert refund record
      const { data: refundData, error: refundError } = await supabase
        .from('refunds')
        .insert([
          {
            order_id: orderId,
            amount: parseFloat(amount),
            reason,
            approved_by: user?.id,
          },
        ])
        .select();

      if (refundError) throw refundError;

      // Update order status to refunded
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
        })
        .eq('id', orderId);

      if (updateError) throw updateError;

      // TODO: Integrate Stripe refund API here
      // Call Stripe API to create a refund using the refund ID
      // const stripeRefund = await fetch('/api/refund', { ... })
      // Update refunds table with stripe_refund_id

      return refundData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      setRefundAmount('');
      setRefundReason('');
      alert('Order refunded successfully');
    },
    onError: (error) => {
      alert('Error processing refund: ' + (error.message || 'Unknown error'));
    },
  });

  const handleAssignDriver = async () => {
    if (!selectedDriverId) {
      alert('Please select a driver');
      return;
    }
    updateOrderMutation.mutate({ driverId: selectedDriverId });
  };

  const handleAssignLaundromat = async () => {
    if (!selectedLaundromat) {
      alert('Please select a laundromat');
      return;
    }
    updateOrderMutation.mutate({ laundromat_id: selectedLaundromat });
  };

  const handleRefund = async () => {
    if (!refundAmount || !refundReason) {
      alert('Please enter both amount and reason');
      return;
    }
    refundMutation.mutate({
      amount: refundAmount,
      reason: refundReason,
    });
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }
    updateOrderMutation.mutate({ status: selectedStatus });
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

  if (orderLoading) {
    return <div className={styles.container}>Loading order...</div>;
  }

  if (orderError || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading order: {orderError?.message}</div>
        <button onClick={() => router.back()} className={styles.backButton}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order Details</h1>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
      </div>

      {/* Order Basic Info */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Order Information</h2>
        <div className={styles.grid}>
          <div className={styles.gridItem}>
            <label className={styles.label}>Order ID</label>
            <code className={styles.code}>{orderId.slice(0, 8)}...</code>
          </div>
          <div className={styles.gridItem}>
            <label className={styles.label}>Status</label>
            <span
              style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '4px',
                backgroundColor: getStatusColor(order.status),
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              {order.status?.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>
          <div className={styles.gridItem}>
            <label className={styles.label}>Payment Status</label>
            <span className={styles.badge}>{order.payment_status?.toUpperCase()}</span>
          </div>
          <div className={styles.gridItem}>
            <label className={styles.label}>Total</label>
            <strong style={{ fontSize: '18px' }}>
              ${(order.total || 0).toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      {order.customer && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Customer Information</h2>
          <div className={styles.grid}>
            <div className={styles.gridItem}>
              <label className={styles.label}>Name</label>
              <p>{order.customer.full_name}</p>
            </div>
            <div className={styles.gridItem}>
              <label className={styles.label}>Phone</label>
              <p>{order.customer.phone}</p>
            </div>
            <div className={styles.gridItem}>
              <label className={styles.label}>Email</label>
              <p>{order.customer.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Order Items */}
      {order.order_items && order.order_items.length > 0 && (
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Items</h2>
          <table className={styles.table}>
            <thead>
              <tr className={styles.tableHeader}>
                <th className={styles.th}>Service</th>
                <th className={styles.th}>Quantity</th>
                <th className={styles.th}>Unit Price</th>
                <th className={styles.th}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.order_items.map((item) => (
                <tr key={item.id} className={styles.tableRow}>
                  <td className={styles.td}>{item.service_name}</td>
                  <td className={styles.td}>
                    {item.quantity} {item.unit}
                  </td>
                  <td className={styles.td}>${(item.unit_price || 0).toFixed(2)}</td>
                  <td className={styles.td}>
                    <strong>${(item.line_total || 0).toFixed(2)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pricing Summary */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Pricing Summary</h2>
        <div className={styles.summary}>
          <div className={styles.summaryRow}>
            <span>Subtotal:</span>
            <span>${(order.subtotal || 0).toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Pickup Fee:</span>
            <span>${(order.pickup_fee || 0).toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Service Fee:</span>
            <span>${(order.service_fee || 0).toFixed(2)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span>Tax:</span>
            <span>${(order.tax || 0).toFixed(2)}</span>
          </div>
          {order.tip > 0 && (
            <div className={styles.summaryRow}>
              <span>Tip:</span>
              <span>${(order.tip || 0).toFixed(2)}</span>
            </div>
          )}
          <div className={styles.summaryRowTotal}>
            <span>Total:</span>
            <span>${(order.total || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Admin Controls */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Admin Actions</h2>

        {/* Status Update */}
        <div className={styles.controlSection}>
          <label className={styles.label}>Update Status</label>
          <select
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value)}
            disabled={updateOrderMutation.isPending}
            className={styles.select}
          >
            <option value="">-- Select Status --</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
          <button
            onClick={handleStatusChange}
            disabled={updateOrderMutation.isPending || !selectedStatus}
            className={styles.button}
          >
            {updateOrderMutation.isPending ? 'Updating...' : 'Update Status'}
          </button>
        </div>

        {/* Driver Assignment */}
        <div className={styles.controlSection}>
          <label className={styles.label}>Assign Driver</label>
          <select
            value={selectedDriverId || ''}
            onChange={(e) => setSelectedDriverId(e.target.value || null)}
            disabled={driversLoading || updateOrderMutation.isPending}
            className={styles.select}
          >
            <option value="">-- No Driver --</option>
            {drivers.map((driver) => (
              <option key={driver.id} value={driver.id}>
                {driver.full_name} ({driver.phone})
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignDriver}
            disabled={updateOrderMutation.isPending}
            className={styles.button}
          >
            {updateOrderMutation.isPending ? 'Assigning...' : 'Assign Driver'}
          </button>
        </div>

        {/* Laundromat Assignment */}
        <div className={styles.controlSection}>
          <label className={styles.label}>Assign Laundromat</label>
          <select
            value={selectedLaundromat || ''}
            onChange={(e) => setSelectedLaundromat(e.target.value || null)}
            disabled={laundromatsLoading || updateOrderMutation.isPending}
            className={styles.select}
          >
            <option value="">-- No Laundromat --</option>
            {laundromats.map((laundromat) => (
              <option key={laundromat.id} value={laundromat.id}>
                {laundromat.name} - {laundromat.city}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignLaundromat}
            disabled={updateOrderMutation.isPending}
            className={styles.button}
          >
            {updateOrderMutation.isPending ? 'Assigning...' : 'Assign Laundromat'}
          </button>
        </div>

        {/* Refund Form */}
        {order.status !== 'refunded' && (
          <div className={styles.controlSection}>
            <h3 style={{ marginBottom: '12px', color: '#333' }}>Process Refund</h3>

            <div style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Refund Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={order.total || '0.00'}
                disabled={refundMutation.isPending}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Reason for Refund</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g., SLA breached, customer request, etc."
                disabled={refundMutation.isPending}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'Arial, sans-serif',
                  minHeight: '80px',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={handleRefund}
              disabled={
                refundMutation.isPending ||
                !refundAmount ||
                !refundReason
              }
              style={{
                ...styles.button,
                backgroundColor: refundMutation.isPending ? '#999' : '#FF3B30',
                color: '#fff',
              }}
            >
              {refundMutation.isPending
                ? 'Processing Refund...'
                : 'Process Refund'}
            </button>
          </div>
        )}

        {order.status === 'refunded' && (
          <div
            style={{
              ...styles.controlSection,
              backgroundColor: '#fff3cd',
              border: '1px solid #ffc107',
              borderRadius: '4px',
              padding: '12px',
            }}
          >
            <p style={{ color: '#856404', margin: 0, fontWeight: '600' }}>
              ✓ This order has been refunded
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
