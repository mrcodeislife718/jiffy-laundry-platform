'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@jiffylaundry/shared/supabase';
import styles from './sla.module.css';

export default function SLAMonitorPage() {
  const queryClient = useQueryClient();
  const [expandedOrderId, setExpandedOrderId] = React.useState(null);
  const [refundReasons, setRefundReasons] = React.useState({});

  // Fetch non-delivered orders with SLA info
  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['sla-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`*,
          customer:customer_id(id, full_name, email, phone),
          refunds:order_id(id, amount, reason, approved_by, stripe_refund_id)`)
        .neq('status', 'delivered')
        .neq('status', 'cancelled')
        .order('sla_deadline', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Mark refund eligible mutation
  const markRefundMutation = useMutation({
    mutationFn: async ({ orderId, amount, reason }) => {
      // Check if refund already exists
      const { data: existing } = await supabase
        .from('refunds')
        .select('id')
        .eq('order_id', orderId)
        .single();

      if (existing) {
        // Update existing refund
        const { data, error } = await supabase
          .from('refunds')
          .update({ reason })
          .eq('order_id', orderId)
          .select();
        if (error) throw error;
        return data?.[0];
      } else {
        // Create new refund record
        const { data, error } = await supabase
          .from('refunds')
          .insert([
            {
              order_id: orderId,
              amount,
              reason,
            },
          ])
          .select();
        if (error) throw error;
        return data?.[0];
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla-orders'] });
      setRefundReasons({});
      alert('Order marked for refund successfully');
    },
    onError: (error) => {
      alert('Error marking refund: ' + (error.message || 'Unknown error'));
    },
  });

  // Calculate SLA status
  const calculateSLAStatus = (slaDeadline) => {
    if (!slaDeadline) return { status: 'unknown', label: 'No SLA', color: '#999' };

    const now = new Date();
    const deadline = new Date(slaDeadline);
    const diffMs = deadline - now;
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffMs < 0) {
      return {
        status: 'breached',
        label: 'BREACHED',
        color: '#FF3B30',
        hoursLeft: diffHours,
      };
    } else if (diffHours <= 4) {
      return {
        status: 'at_risk',
        label: 'AT RISK',
        color: '#FF9500',
        hoursLeft: diffHours,
      };
    } else {
      return {
        status: 'safe',
        label: 'SAFE',
        color: '#34C759',
        hoursLeft: diffHours,
      };
    }
  };

  // Count SLAs by status
  const safCount = orders.filter(
    (o) => calculateSLAStatus(o.sla_deadline).status === 'safe'
  ).length;
  const atRiskCount = orders.filter(
    (o) => calculateSLAStatus(o.sla_deadline).status === 'at_risk'
  ).length;
  const breachedCount = orders.filter(
    (o) => calculateSLAStatus(o.sla_deadline).status === 'breached'
  ).length;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading SLA data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading SLA data: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>SLA Monitor</h1>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Active Orders</div>
          <div className={styles.statValue}>{orders.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Safe</div>
          <div style={{ color: '#34C759', fontSize: '24px', fontWeight: 'bold' }}>{safCount}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>At Risk</div>
          <div style={{ color: '#FF9500', fontSize: '24px', fontWeight: 'bold' }}>
            {atRiskCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Breached</div>
          <div style={{ color: '#FF3B30', fontSize: '24px', fontWeight: 'bold' }}>
            {breachedCount}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <p>All orders delivered or cancelled</p>
        </div>
      ) : (
        <div className={styles.ordersContainer}>
          {orders.map((order) => {
            const slaStatus = calculateSLAStatus(order.sla_deadline);
            const refund = order.refunds?.[0];
            const hoursLeft = slaStatus.hoursLeft;

            return (
              <div key={order.id} className={styles.orderCard}>
                <div
                  className={styles.orderHeader}
                  onClick={() =>
                    setExpandedOrderId(
                      expandedOrderId === order.id ? null : order.id
                    )
                  }
                >
                  <div className={styles.orderHeaderLeft}>
                    <div className={styles.orderInfo}>
                      <span className={styles.orderId}>
                        Order: {order.id.slice(0, 8)}...
                      </span>
                      <span className={styles.customerInfo}>
                        Customer: {order.customer?.full_name || 'N/A'}
                      </span>
                    </div>
                  </div>
                  <div className={styles.orderHeaderRight}>
                    <span
                      style={{
                        ...styles.slaBadge,
                        backgroundColor: slaStatus.color,
                      }}
                    >
                      {slaStatus.label}
                    </span>
                    <span className={styles.expandIcon}>
                      {expandedOrderId === order.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className={styles.orderDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Order ID:</span>
                      <span>{order.id}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Customer:</span>
                      <span>
                        {order.customer?.full_name} ({order.customer?.email})
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Current Status:</span>
                      <span>{order.status?.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Amount:</span>
                      <span>${parseFloat(order.total || 0).toFixed(2)}</span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>SLA Deadline:</span>
                      <span>
                        {order.sla_deadline
                          ? new Date(order.sla_deadline).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Time Remaining:</span>
                      <span
                        style={{
                          color:
                            hoursLeft < 0
                              ? '#FF3B30'
                              : hoursLeft <= 4
                              ? '#FF9500'
                              : '#34C759',
                          fontWeight: '600',
                        }}
                      >
                        {hoursLeft < 0
                          ? `${Math.abs(hoursLeft).toFixed(1)} hours OVERDUE`
                          : `${hoursLeft.toFixed(1)} hours remaining`}
                      </span>
                    </div>

                    {refund ? (
                      <div className={styles.refundInfo}>
                        <div className={styles.refundBadge}>✓ Marked for Refund</div>
                        <div className={styles.refundReason}>
                          Reason: {refund.reason}
                        </div>
                        <div className={styles.refundAmount}>
                          Amount: ${parseFloat(refund.amount || 0).toFixed(2)}
                        </div>
                        {refund.stripe_refund_id && (
                          <div className={styles.refundStatus}>
                            Stripe Refund ID: {refund.stripe_refund_id}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className={styles.refundForm}>
                        <div className={styles.refundFormGroup}>
                          <label className={styles.label}>Refund Reason:</label>
                          <textarea
                            className={styles.reasonInput}
                            placeholder="SLA breached - late delivery..."
                            value={refundReasons[order.id] || ''}
                            onChange={(e) =>
                              setRefundReasons({
                                ...refundReasons,
                                [order.id]: e.target.value,
                              })
                            }
                          />
                        </div>
                        <button
                          className={styles.markRefundButton}
                          onClick={() =>
                            markRefundMutation.mutate({
                              orderId: order.id,
                              amount: order.total,
                              reason:
                                refundReasons[order.id] ||
                                'SLA compliance refund',
                            })
                          }
                          disabled={markRefundMutation.isPending}
                        >
                          {markRefundMutation.isPending
                            ? 'Marking...'
                            : 'Mark for Refund'}
                        </button>
                      </div>
                    )}

                    <div className={styles.orderActions}>
                      <Link href={`/orders/${order.id}`} className={styles.link}>
                        View Order Details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
