'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AdminCard from '@/components/AdminCard';
import AdminInput from '@/components/AdminInput';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import StatusBadge from '@/components/StatusBadge';
import MetricCard from '@/components/MetricCard';
import AlertBanner from '@/components/AlertBanner';
import AdminButton from '@/components/AdminButton';

export default function SLAPage() {
  const { colors, isDark } = useTheme();
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    atRiskOrders: 0,
    breachedSLAs: 0,
    refundsIssued: 0,
    successRate: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');

  // Load SLA orders and metrics
  useEffect(() => {
    loadSLAOrdersAndMetrics();
  }, []);

  const loadSLAOrdersAndMetrics = async () => {
    setLoading(true);
    // Mock data - in production, fetch from Supabase with SLA logic
    const mockOrders = [
      {
        id: 'ORD-245',
        customer: 'Sarah Johnson',
        pickupTime: '2024-01-15T10:30:00Z',
        estimatedDelivery: '2024-01-16T10:30:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: 0.75,
        status: 'at-risk',
        totalAmount: 45.99,
      },
      {
        id: 'ORD-240',
        customer: 'Mike Chen',
        pickupTime: '2024-01-14T14:00:00Z',
        estimatedDelivery: '2024-01-15T14:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: -19.75,
        status: 'breached',
        totalAmount: 32.50,
      },
      {
        id: 'ORD-244',
        customer: 'Emma Davis',
        pickupTime: '2024-01-15T08:00:00Z',
        estimatedDelivery: '2024-01-16T08:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: -1.75,
        status: 'breached',
        totalAmount: 67.50,
      },
      {
        id: 'ORD-243',
        customer: 'James Wilson',
        pickupTime: '2024-01-15T12:00:00Z',
        estimatedDelivery: '2024-01-16T12:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: 2.25,
        status: 'at-risk',
        totalAmount: 54.25,
      },
      {
        id: 'ORD-242',
        customer: 'Lisa Anderson',
        pickupTime: '2024-01-15T07:30:00Z',
        estimatedDelivery: '2024-01-16T07:30:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: -2.25,
        status: 'breached',
        totalAmount: 28.75,
      },
      {
        id: 'ORD-241',
        customer: 'Robert Brown',
        pickupTime: '2024-01-14T16:00:00Z',
        estimatedDelivery: '2024-01-15T16:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: -17.75,
        status: 'breached',
        totalAmount: 50.00,
      },
      {
        id: 'ORD-239',
        customer: 'Jennifer Martinez',
        pickupTime: '2024-01-15T11:00:00Z',
        estimatedDelivery: '2024-01-16T11:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: 1.25,
        status: 'at-risk',
        totalAmount: 38.50,
      },
      {
        id: 'ORD-238',
        customer: 'David Taylor',
        pickupTime: '2024-01-15T09:00:00Z',
        estimatedDelivery: '2024-01-16T09:00:00Z',
        currentTime: '2024-01-16T09:45:00Z',
        hoursRemaining: -0.75,
        status: 'breached',
        totalAmount: 42.00,
      },
    ];

    setOrders(mockOrders);
    setMetrics({
      atRiskOrders: mockOrders.filter((o) => o.status === 'at-risk').length,
      breachedSLAs: mockOrders.filter((o) => o.status === 'breached').length,
      refundsIssued: 153.25,
      successRate: 87.5,
    });
    setLoading(false);
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShowViewModal(true);
  };

  const openRefundModal = (order) => {
    setSelectedOrder(order);
    setRefundAmount(order.totalAmount.toString());
    setShowRefundModal(true);
  };

  const handleIssueRefund = () => {
    if (selectedOrder) {
      // In production, call API to issue refund and update audit logs
      const updatedOrders = orders.map((order) =>
        order.id === selectedOrder.id ? { ...order, status: 'refunded' } : order
      );
      setOrders(updatedOrders);
      setMetrics((prev) => ({
        ...prev,
        breachedSLAs: prev.breachedSLAs - 1,
        refundsIssued: prev.refundsIssued + parseFloat(refundAmount),
      }));
      setShowRefundModal(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'at-risk': 'At Risk',
      breached: 'Breached',
      refunded: 'Refunded',
    };
    return labels[status] || status;
  };

  const columns = [
    { key: 'id', label: 'Order ID', width: '12%' },
    { key: 'customer', label: 'Customer', width: '18%' },
    {
      key: 'pickupTime',
      label: 'Picked Up',
      width: '15%',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    {
      key: 'estimatedDelivery',
      label: 'Est. Delivery',
      width: '15%',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    {
      key: 'hoursRemaining',
      label: 'Hours Left',
      width: '12%',
      render: (value) => (
        <span className={value > 2 ? 'text-green-600 font-semibold' : value > 0 ? 'text-yellow-600 font-semibold' : 'text-red-600 font-semibold'}>
          {value > 0 ? '+' : ''}{value.toFixed(2)}h
        </span>
      ),
    },
    {
      key: 'status',
      label: 'SLA Status',
      width: '12%',
      render: (value) => {
        let status = 'pending';
        if (value === 'breached') status = 'cancelled';
        else if (value === 'at-risk') status = 'processing';
        return <StatusBadge status={status} />;
      },
    },
  ];

  const rowActions = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (row) => openOrderModal(row),
    },
    {
      label: 'Refund',
      icon: '💳',
      onClick: (row) => openRefundModal(row),
      visible: (row) => row.status === 'breached',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          ⏰ SLA Enforcement Dashboard
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          24-hour SLA tracking and automatic refund management
        </p>
      </div>

      {/* Metrics Row */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="At-Risk Orders"
            value={metrics.atRiskOrders.toString()}
            change={0}
            icon="⚠️"
            color="#F59E0B"
          />
          <MetricCard
            label="Breached SLAs"
            value={metrics.breachedSLAs.toString()}
            change={-15}
            icon="🔴"
            color="#EF4444"
          />
          <MetricCard
            label="Refunds Issued"
            value={`$${metrics.refundsIssued.toFixed(2)}`}
            change={0}
            icon="💰"
            color="#FF5A00"
          />
          <MetricCard
            label="Success Rate"
            value={`${metrics.successRate.toFixed(1)}%`}
            change={3.2}
            icon="✓"
            color="#061B3A"
          />
        </div>

        {/* Alert Banners */}
        <div className="space-y-3 mb-6">
          <AlertBanner
            severity="danger"
            message={`${metrics.breachedSLAs} orders have breached SLA. Automatic refunds will be processed for these customers.`}
          />
          <AlertBanner
            severity="warning"
            message={`${metrics.atRiskOrders} orders are at risk of missing the 24-hour deadline.`}
          />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AdminInput
            label="Search Orders"
            placeholder="Search by order ID or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              <option value="all">All Statuses</option>
              <option value="at-risk">At Risk</option>
              <option value="breached">Breached</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="px-6 pb-6">
        <AdminCard title="Orders" subtitle={`${filteredOrders.length} orders`}>
          <AdminTable
            columns={columns}
            data={filteredOrders}
            rowActions={rowActions}
            loading={loading}
            emptyMessage="No orders found"
          />
        </AdminCard>
      </div>

      {/* View Order Modal */}
      <AdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Order Details"
        size="lg"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowViewModal(false),
            variant: 'secondary',
          },
        ]}
      >
        {selectedOrder && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Order ID</p>
                <p className="font-semibold text-[#FF5A00]">{selectedOrder.id}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Customer</p>
                <p className="font-semibold">{selectedOrder.customer}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Order Amount</p>
                <p className="font-semibold">${selectedOrder.totalAmount.toFixed(2)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>SLA Status</p>
                <p className={`font-semibold ${selectedOrder.status === 'breached' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {getStatusLabel(selectedOrder.status)}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2`}>Timeline</p>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Picked up:</span>
                  <span className="font-medium">
                    {new Date(selectedOrder.pickupTime).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Est. Delivery:</span>
                  <span className="font-medium">
                    {new Date(selectedOrder.estimatedDelivery).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? 'text-slate-400' : 'text-gray-600'}>Hours Remaining:</span>
                  <span className={`font-semibold ${selectedOrder.hoursRemaining > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedOrder.hoursRemaining > 0 ? '+' : ''}{selectedOrder.hoursRemaining.toFixed(2)}h
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Issue Refund Modal */}
      <AdminModal
        isOpen={showRefundModal}
        onClose={() => setShowRefundModal(false)}
        title="Issue SLA Refund"
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowRefundModal(false),
            variant: 'secondary',
          },
          {
            label: 'Issue Refund',
            onClick: handleIssueRefund,
            variant: 'danger',
          },
        ]}
      >
        {selectedOrder && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Order ID</p>
              <p className="font-semibold text-[#FF5A00]">{selectedOrder.id}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Customer</p>
              <p className="font-semibold">{selectedOrder.customer}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Refund Amount</p>
              <p className="text-2xl font-bold text-green-600">${parseFloat(refundAmount).toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900/30 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-900'}`}>
                This refund will be automatically processed due to SLA breach (order missed 24-hour delivery deadline). The customer will receive the full refund to their wallet.
              </p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Refund Reason
              </label>
              <textarea
                value="SLA breach: Order not delivered within 24 hours"
                disabled
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-gray-100 border-gray-300 text-gray-700'
                } focus:outline-none`}
                rows="2"
              />
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
