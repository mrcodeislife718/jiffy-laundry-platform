'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAdminOperations } from '@/hooks/useAdminOperations';
import AdminTable from '@/components/AdminTable';
import AdminButton from '@/components/AdminButton';
import AdminModal from '@/components/AdminModal';
import AdminInput from '@/components/AdminInput';
import StatusBadge from '@/components/StatusBadge';
import AlertBanner from '@/components/AlertBanner';
import MetricCard from '@/components/MetricCard';
import { supabase } from '@jiffylaundry/shared';

const ORDER_STATUSES = [
  'pending_payment',
  'pending_dispatch',
  'accepted',
  'heading_to_pickup',
  'arrived_at_pickup',
  'picked_up',
  'in_transit',
  'arrived_at_facility',
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

export default function OrderControl() {
  const { colors, isDark } = useTheme();
  const {
    getActiveOrders,
    updateOrderStatus,
    reassignDriver,
    issueRefund,
    logAuditAction,
  } = useAdminOperations();

  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'view', 'reassign', 'refund', 'override'
  const [formData, setFormData] = useState({});
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    activeOrders: 0,
    deliveredToday: 0,
    cancelledToday: 0,
  });

  useEffect(() => {
    loadOrdersAndDrivers();
  }, []);

  const loadOrdersAndDrivers = async () => {
    setLoading(true);
    try {
      const [ordersData, driversData] = await Promise.all([
        getActiveOrders(),
        supabase
          .from('profiles')
          .select('id, name, email')
          .eq('role', 'driver')
          .eq('status', 'active'),
      ]);

      setOrders(ordersData || []);
      setDrivers(driversData.data || []);

      // Calculate metrics
      setMetrics({
        totalOrders: ordersData?.length || 0,
        activeOrders: ordersData?.filter(o => !['delivered', 'cancelled', 'refunded'].includes(o.status)).length || 0,
        deliveredToday: 0,
        cancelledToday: 0,
      });
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !formData.newStatus) return;
    const success = await updateOrderStatus(selectedOrder.id, formData.newStatus, formData.reason);
    if (success) {
      await loadOrdersAndDrivers();
      setModalOpen(false);
    }
  };

  const handleReassign = async () => {
    if (!selectedOrder || !formData.newDriver) return;
    const success = await reassignDriver(selectedOrder.id, formData.newDriver, formData.reason);
    if (success) {
      await loadOrdersAndDrivers();
      setModalOpen(false);
    }
  };

  const handleRefund = async () => {
    if (!selectedOrder || !formData.refundAmount) return;
    const success = await issueRefund(selectedOrder.id, formData.refundAmount, formData.reason);
    if (success) {
      await loadOrdersAndDrivers();
      setModalOpen(false);
    }
  };

  const openOrderModal = (order, type) => {
    setSelectedOrder(order);
    setActionType(type);
    setFormData({});
    setModalOpen(true);
  };

  return (
    <div style={{ padding: '2rem', background: colors.bg, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: colors.text,
          margin: 0,
          marginBottom: '0.5rem',
        }}>
          📦 Order Control Dashboard
        </h1>
        <p style={{
          color: colors.textSecondary,
          margin: 0,
          fontSize: '0.9375rem',
        }}>
          Full order lifecycle management, reassignment, refunds, and status overrides
        </p>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <MetricCard
          label="Total Orders"
          value={metrics.totalOrders}
          icon="📦"
          change="+12"
          changeType="positive"
        />
        <MetricCard
          label="Active Orders"
          value={metrics.activeOrders}
          icon="⚡"
          change="+8"
          changeType="positive"
          color={colors.primary}
        />
        <MetricCard
          label="Delivered Today"
          value={metrics.deliveredToday}
          icon="✓"
          change="+5"
          changeType="positive"
          color={colors.success}
        />
        <MetricCard
          label="Cancelled Today"
          value={metrics.cancelledToday}
          icon="✕"
          change="0"
          changeType="neutral"
          color={colors.danger}
        />
      </div>

      {/* Orders Table */}
      <div style={{
        background: colors.bgSecondary,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
      }}>
        <h2 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: colors.text,
          margin: '0 0 1rem 0',
        }}>
          All Orders
        </h2>

        <AdminTable
          columns={[
            { key: 'id', label: 'Order ID', width: '100px' },
            { key: 'customer_id', label: 'Customer', width: '120px' },
            { key: 'status', label: 'Status', render: (status) => <StatusBadge status={status} /> },
            { key: 'total', label: 'Total', render: (total) => `$${total?.toFixed(2)}` },
            {
              key: 'created_at',
              label: 'Created',
              render: (date) => new Date(date).toLocaleDateString(),
            },
          ]}
          data={orders}
          onRowClick={(order) => openOrderModal(order, 'view')}
          rowActions={[
            {
              label: '👁️',
              onClick: (order) => openOrderModal(order, 'view'),
            },
            {
              label: '⚡',
              onClick: (order) => openOrderModal(order, 'reassign'),
            },
            {
              label: '💰',
              onClick: (order) => openOrderModal(order, 'refund'),
            },
            {
              label: '🔄',
              onClick: (order) => openOrderModal(order, 'override'),
            },
          ]}
          loading={loading}
          empty="No orders found"
        />
      </div>

      {/* View Order Modal */}
      <AdminModal
        isOpen={modalOpen && actionType === 'view'}
        onClose={() => setModalOpen(false)}
        title={`Order: ${selectedOrder?.id}`}
        size="lg"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Customer ID
            </p>
            <p style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>
              {selectedOrder?.customer_id}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Current Status
            </p>
            <p style={{ margin: 0 }}>
              <StatusBadge status={selectedOrder?.status} />
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Driver ID
            </p>
            <p style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>
              {selectedOrder?.driver_id || 'Not assigned'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Total Amount
            </p>
            <p style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>
              ${selectedOrder?.total?.toFixed(2)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Created
            </p>
            <p style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>
              {new Date(selectedOrder?.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: '0 0 0.25rem 0' }}>
              Estimated Delivery
            </p>
            <p style={{ fontSize: '1rem', color: colors.text, margin: 0 }}>
              {selectedOrder?.estimated_delivery
                ? new Date(selectedOrder.estimated_delivery).toLocaleString()
                : 'Not set'}
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Reassign Driver Modal */}
      <AdminModal
        isOpen={modalOpen && actionType === 'reassign'}
        onClose={() => setModalOpen(false)}
        title="Reassign Driver"
        description={`Reassign Order ${selectedOrder?.id} to a different driver`}
        actions={[
          {
            label: 'Reassign',
            onClick: handleReassign,
          },
        ]}
      >
        <AdminInput
          label="Select New Driver"
          type="select"
          value={formData.newDriver || ''}
          onChange={(val) => setFormData({ ...formData, newDriver: val })}
          options={drivers.map(d => ({ value: d.id, label: `${d.name} (${d.email})` }))}
          required
        />
        <AdminInput
          label="Reason for Reassignment"
          type="text"
          value={formData.reason || ''}
          onChange={(val) => setFormData({ ...formData, reason: val })}
          placeholder="e.g., Previous driver unavailable"
        />
      </AdminModal>

      {/* Refund Modal */}
      <AdminModal
        isOpen={modalOpen && actionType === 'refund'}
        onClose={() => setModalOpen(false)}
        title="Issue Refund"
        description={`Issue refund for Order ${selectedOrder?.id}`}
        actions={[
          {
            label: 'Issue Refund',
            variant: 'danger',
            onClick: handleRefund,
          },
        ]}
      >
        <AlertBanner
          severity="warning"
          title="This will refund the customer"
          message="The customer will receive a credit to their wallet."
          icon="⚠️"
        />
        <AdminInput
          label="Refund Amount"
          type="number"
          value={formData.refundAmount || ''}
          onChange={(val) => setFormData({ ...formData, refundAmount: val })}
          placeholder={`Max: $${selectedOrder?.total?.toFixed(2)}`}
          required
        />
        <AdminInput
          label="Reason"
          type="text"
          value={formData.reason || ''}
          onChange={(val) => setFormData({ ...formData, reason: val })}
          placeholder="e.g., Quality issue, service failure"
          required
        />
      </AdminModal>

      {/* Status Override Modal */}
      <AdminModal
        isOpen={modalOpen && actionType === 'override'}
        onClose={() => setModalOpen(false)}
        title="Override Order Status"
        description={`Force status change for Order ${selectedOrder?.id}`}
        actions={[
          {
            label: 'Override Status',
            variant: 'danger',
            onClick: handleStatusChange,
          },
        ]}
      >
        <AlertBanner
          severity="danger"
          title="Force status changes are recorded"
          message="This action will be logged in audit trail for compliance review."
          icon="🚨"
        />
        <AdminInput
          label="New Status"
          type="select"
          value={formData.newStatus || ''}
          onChange={(val) => setFormData({ ...formData, newStatus: val })}
          options={ORDER_STATUSES.map(s => ({ value: s, label: s.replace(/_/g, ' ') }))}
          required
        />
        <AdminInput
          label="Reason for Override"
          type="text"
          value={formData.reason || ''}
          onChange={(val) => setFormData({ ...formData, reason: val })}
          placeholder="e.g., Customer request, system correction"
          required
        />
      </AdminModal>
    </div>
  );
}

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'warning',
      pending_dispatch: 'warning',
      accepted: 'primary',
      heading_to_pickup: 'primary',
      arrived_at_pickup: 'primary',
      picked_up: 'primary',
      received: 'success',
      sorting: 'success',
      washing: 'success',
      drying: 'success',
      folding: 'success',
      quality_check: 'success',
      packed: 'success',
      ready_for_delivery: 'success',
      out_for_delivery: 'success',
      delivered: 'success',
      cancelled: 'danger',
      refunded: 'danger',
    };
    return colors[status] || 'default';
  };

  const getPaymentStatusColor = (status) => {
    return status === 'paid' ? 'success' : status === 'refunded' ? 'danger' : 'warning';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#8b5cf6', '#ec4899'];

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>📦 Orders Dashboard</h1>
        <p style={{ color: '#6b7280' }}>Real-time order tracking with AI-powered insights</p>
      </div>

      {/* AI Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {insights.map((insight, idx) => (
          <Card key={idx}>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{insight.title}</div>
              <div style={{ fontSize: '1.875rem', fontWeight: 'bold', color: insight.trend === 'positive' ? '#16a34a' : insight.trend === 'warning' ? '#dc2626' : '#2563eb', marginBottom: '0.75rem' }}>
                {insight.value}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#4b5563', lineHeight: '1.4' }}>{insight.message}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Status Distribution */}
        <Card>
          <CardHeader title="Order Status Distribution" subtitle="Current order states" />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusDistribution} cx="50%" cy="50%" labelLine={false} label={(entry) => `${entry.name}: ${entry.value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader title="Payment Distribution" subtitle="Paid vs Unpaid orders" />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={paymentStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Trend */}
        <Card>
          <CardHeader title="Weekly Order Trend" subtitle="Orders and revenue by day" />
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#2563eb" name="Orders" strokeWidth={2} />
                <Line type="monotone" dataKey="revenue" stroke="#16a34a" name="Revenue ($)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      {recommendations.length > 0 && (
        <Card style={{ marginBottom: '2rem' }}>
          <CardHeader title="🤖 AI-Powered Recommendations" subtitle="Actionable insights to optimize operations" />
          <CardContent>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  padding: '1rem',
                  borderLeft: `4px solid ${rec.priority === 'high' ? '#dc2626' : rec.priority === 'medium' ? '#eab308' : '#6b7280'}`,
                  background: '#f9fafb',
                  borderRadius: '0.375rem',
                }}>
                  <div style={{ fontWeight: '600', color: '#111827', marginBottom: '0.25rem' }}>{rec.action}</div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{rec.description}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <SearchBar
            placeholder="Search by order ID or customer..."
            value={searchTerm}
            onChange={setSearchTerm}
          />
        </div>
        <Button variant="primary">+ New Order</Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader title={`Orders (${filteredOrders.length})`} subtitle="All customer orders" />
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: '#6b7280' }}>No orders found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Order ID</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Customer</th>
                    <th style={{ textAlign: 'center', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Items</th>
                    <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Total</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Payment</th>
                    <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontWeight: '600', color: '#374151' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f3f4f6', transition: 'background 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#2563eb' }}>
                        <Link href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: '#2563eb' }}>
                          {order.id}
                        </Link>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', color: '#111827' }}>{order.customer}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>{order.items}</td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600' }}>${order.total.toFixed(2)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <Badge variant={getPaymentStatusColor(order.paymentStatus)}>
                          {order.paymentStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#6b7280' }}>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
