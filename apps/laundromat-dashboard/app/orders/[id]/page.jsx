'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrderById, updateOrderStatus } from '@jiffylaundry/shared/orders';
import styles from './order.module.css';

const STATUS_FLOW = [
  'received',
  'sorting',
  'washing',
  'drying',
  'folding',
  'quality_check',
  'packed',
  'ready_for_delivery',
];

const STATUS_COLORS = {
  received: '#FF9500',
  sorting: '#007AFF',
  washing: '#007AFF',
  drying: '#007AFF',
  folding: '#34C759',
  quality_check: '#34C759',
  packed: '#34C759',
  ready_for_delivery: '#34C759',
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id;

  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Fetch order
  const { data: order, isLoading, error: queryError } = useQuery({
    queryKey: ['laundromat-order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  // Update status mutation
  const updateMutation = useMutation({
    mutationFn: (newStatus) =>
      updateOrderStatus({
        orderId,
        status: newStatus,
      }),
    onSuccess: () => {
      setSuccessMessage('Order status updated successfully');
      setErrorMessage('');
      queryClient.invalidateQueries({ queryKey: ['laundromat-order', orderId] });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err) => {
      setErrorMessage(`Failed to update status: ${err.message}`);
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading order...</div>
      </div>
    );
  }

  if (queryError || !order) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          Error loading order: {queryError?.message || 'Order not found'}
        </div>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => router.back()} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>Order Details</h1>
      </div>

      {successMessage && (
        <div className={styles.successAlert}>{successMessage}</div>
      )}
      {errorMessage && (
        <div className={styles.errorAlert}>{errorMessage}</div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Information</h2>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.label}>Order ID</label>
            <code className={styles.value}>{order.id.slice(0, 8)}...</code>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.label}>Customer</label>
            <div className={styles.value}>
              {order.customer?.full_name || 'N/A'}
            </div>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.label}>Phone</label>
            <div className={styles.value}>
              {order.customer?.phone || 'N/A'}
            </div>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.label}>Current Status</label>
            <div
              style={{
                ...styles.value,
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '4px',
                backgroundColor: STATUS_COLORS[order.status] || '#999',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '12px',
              }}
            >
              {order.status?.replace(/_/g, ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Order Items</h2>
        {order.order_items && order.order_items.length > 0 ? (
          <div className={styles.itemsList}>
            {order.order_items.map((item, idx) => (
              <div key={idx} className={styles.itemCard}>
                <div className={styles.itemRow}>
                  <span className={styles.itemLabel}>Service:</span>
                  <span className={styles.itemValue}>
                    {item.service?.name || 'Unknown'}
                  </span>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.itemLabel}>Quantity:</span>
                  <span className={styles.itemValue}>{item.quantity || 1}</span>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.itemLabel}>Unit Price:</span>
                  <span className={styles.itemValue}>
                    ${parseFloat(item.unit_price || 0).toFixed(2)}
                  </span>
                </div>
                <div className={styles.itemRow}>
                  <span className={styles.itemLabel}>Subtotal:</span>
                  <span className={styles.itemValue}>
                    ${parseFloat(item.subtotal || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noItems}>No items in this order</div>
        )}
      </div>

      {order.notes && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Notes</h2>
          <div className={styles.notesBox}>{order.notes}</div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Update Status</h2>
        <div className={styles.buttonGrid}>
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              onClick={() => updateMutation.mutate(status)}
              disabled={updateMutation.isPending}
              style={{
                ...styles.statusButton,
                backgroundColor: STATUS_COLORS[status] || '#999',
                opacity: updateMutation.isPending ? 0.6 : 1,
                cursor: updateMutation.isPending ? 'not-allowed' : 'pointer',
              }}
            >
              {status.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Pricing Summary</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Subtotal:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.subtotal || 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Pickup Fee:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.pickup_fee || 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Service Fee:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.service_fee || 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Tax:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.tax || 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Tip:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.tip || 0).toFixed(2)}
            </span>
          </div>
          <div className={styles.summaryRowTotal}>
            <span className={styles.summaryLabel}>Total:</span>
            <span className={styles.summaryValue}>
              ${parseFloat(order.total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
