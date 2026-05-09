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

export default function FinancePage() {
  const { colors, isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    refundsIssued: 0,
    platformFees: 0,
    activeWallets: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  // Load transactions and metrics
  useEffect(() => {
    loadTransactionsAndMetrics();
  }, []);

  const loadTransactionsAndMetrics = async () => {
    setLoading(true);
    // Mock data - in production, fetch from Supabase
    const mockTransactions = [
      {
        id: 'TXN-001',
        description: 'Order Payment - Order #ORD-245',
        type: 'payment',
        amount: 45.99,
        status: 'completed',
        date: '2024-01-15T14:30:00Z',
        notes: 'Customer paid via credit card',
      },
      {
        id: 'TXN-002',
        description: 'Refund Issued - Order #ORD-240',
        type: 'refund',
        amount: -32.50,
        status: 'completed',
        date: '2024-01-14T10:15:00Z',
        notes: 'SLA refund: order not delivered within 24 hrs',
      },
      {
        id: 'TXN-003',
        description: 'Wallet Top-up - Customer #CUST-102',
        type: 'topup',
        amount: 100.00,
        status: 'completed',
        date: '2024-01-13T16:45:00Z',
        notes: 'Customer added $100 to wallet',
      },
      {
        id: 'TXN-004',
        description: 'Driver Payout - Driver #DRV-087',
        type: 'payout',
        amount: -245.75,
        status: 'pending',
        date: '2024-01-12T09:20:00Z',
        notes: 'Weekly earnings payout (15 completed orders)',
      },
      {
        id: 'TXN-005',
        description: 'Platform Fees - January',
        type: 'payment',
        amount: 1250.00,
        status: 'completed',
        date: '2024-01-11T00:00:00Z',
        notes: 'Monthly platform revenue (2.5% platform fee)',
      },
      {
        id: 'TXN-006',
        description: 'Order Payment - Order #ORD-244',
        type: 'payment',
        amount: 67.50,
        status: 'completed',
        date: '2024-01-10T12:00:00Z',
        notes: 'Customer paid via digital wallet',
      },
      {
        id: 'TXN-007',
        description: 'Refund Issued - Order #ORD-238',
        type: 'refund',
        amount: -50.00,
        status: 'completed',
        date: '2024-01-09T15:30:00Z',
        notes: 'Customer requested cancellation',
      },
      {
        id: 'TXN-008',
        description: 'Driver Payout - Driver #DRV-092',
        type: 'payout',
        amount: -189.30,
        status: 'pending',
        date: '2024-01-08T08:00:00Z',
        notes: 'Weekly earnings payout (12 completed orders)',
      },
    ];

    setTransactions(mockTransactions);
    setMetrics({
      totalRevenue: 3711.24,
      pendingPayments: 435.05,
      refundsIssued: -82.50,
      platformFees: 1250.00,
      activeWallets: 847,
    });
    setLoading(false);
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || txn.type === filterType;
    return matchesSearch && matchesType;
  });

  const openTransactionModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowViewModal(true);
  };

  const openPayoutModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowPayoutModal(true);
  };

  const handleProcessPayout = () => {
    if (selectedTransaction) {
      // Update transaction status to processing
      const updatedTransactions = transactions.map((txn) =>
        txn.id === selectedTransaction.id ? { ...txn, status: 'processing' } : txn
      );
      setTransactions(updatedTransactions);
      setShowPayoutModal(false);
      // In production, call API to process payout
    }
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      payment: 'Payment',
      refund: 'Refund',
      topup: 'Top-up',
      payout: 'Payout',
    };
    return labels[type] || type;
  };

  const columns = [
    { key: 'id', label: 'Transaction ID', width: '15%' },
    { key: 'description', label: 'Description', width: '30%' },
    {
      key: 'type',
      label: 'Type',
      width: '12%',
      render: (value) => <span className="capitalize">{getTransactionTypeLabel(value)}</span>,
    },
    {
      key: 'amount',
      label: 'Amount',
      width: '12%',
      render: (value) => (
        <span className={value >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
          {value >= 0 ? '+' : ''}${Math.abs(value).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (value) => (
        <StatusBadge
          status={value === 'completed' ? 'delivered' : value === 'processing' ? 'processing' : 'pending'}
        />
      ),
    },
    {
      key: 'date',
      label: 'Date',
      width: '15%',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    },
  ];

  const rowActions = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (row) => openTransactionModal(row),
    },
    {
      label: 'Process',
      icon: '✓',
      onClick: (row) => openPayoutModal(row),
      visible: (row) => row.type === 'payout' && row.status === 'pending',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          💰 Financial Control Center
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          Manage revenue, refunds, payouts, and financial transactions
        </p>
      </div>

      {/* Metrics Row */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <MetricCard
            label="Total Revenue"
            value={`$${metrics.totalRevenue.toFixed(2)}`}
            change={12.5}
            icon="💵"
            color="#FF5A00"
          />
          <MetricCard
            label="Pending Payments"
            value={`$${metrics.pendingPayments.toFixed(2)}`}
            change={-3.2}
            icon="⏳"
            color="#F59E0B"
          />
          <MetricCard
            label="Refunds Issued"
            value={`${Math.abs(metrics.refundsIssued).toFixed(2)}`}
            change={0}
            icon="🔄"
            color="#EF4444"
          />
          <MetricCard
            label="Platform Fees"
            value={`$${metrics.platformFees.toFixed(2)}`}
            change={8.1}
            icon="📊"
            color="#061B3A"
          />
          <MetricCard
            label="Active Wallets"
            value={metrics.activeWallets.toLocaleString()}
            change={5.3}
            icon="👛"
            color="#8B5CF6"
          />
        </div>

        {/* Alert Banner */}
        <AlertBanner
          severity="warning"
          message="3 pending driver payouts totaling $435.05. Process within 24 hours to maintain service levels."
        />
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AdminInput
            label="Search Transactions"
            placeholder="Search by description or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              <option value="all">All Types</option>
              <option value="payment">Payment</option>
              <option value="refund">Refund</option>
              <option value="topup">Top-up</option>
              <option value="payout">Payout</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="px-6 pb-6">
        <AdminCard title="Transactions" subtitle={`${filteredTransactions.length} transactions`}>
          <AdminTable
            columns={columns}
            data={filteredTransactions}
            rowActions={rowActions}
            loading={loading}
            emptyMessage="No transactions found"
          />
        </AdminCard>
      </div>

      {/* View Transaction Modal */}
      <AdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Transaction Details"
        size="lg"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowViewModal(false),
            variant: 'secondary',
          },
        ]}
      >
        {selectedTransaction && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Transaction ID</p>
                <p className="font-semibold text-[#FF5A00]">{selectedTransaction.id}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Type</p>
                <p className="font-semibold capitalize">{getTransactionTypeLabel(selectedTransaction.type)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Amount</p>
                <p className={`font-semibold ${selectedTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedTransaction.amount >= 0 ? '+' : ''}${Math.abs(selectedTransaction.amount).toFixed(2)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Status</p>
                <div className="mt-1">
                  <StatusBadge
                    status={
                      selectedTransaction.status === 'completed'
                        ? 'delivered'
                        : selectedTransaction.status === 'processing'
                          ? 'processing'
                          : 'pending'
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Description</p>
              <p className="font-medium">{selectedTransaction.description}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Date</p>
              <p className="font-medium">
                {new Date(selectedTransaction.date).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Notes</p>
              <p className="font-medium">{selectedTransaction.notes}</p>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Process Payout Modal */}
      <AdminModal
        isOpen={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
        title="Process Driver Payout"
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowPayoutModal(false),
            variant: 'secondary',
          },
          {
            label: 'Process Payout',
            onClick: handleProcessPayout,
            variant: 'primary',
          },
        ]}
      >
        {selectedTransaction && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Driver ID</p>
              <p className="font-semibold text-[#FF5A00]">DRV-{selectedTransaction.id.slice(-3)}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Payout Amount</p>
              <p className="text-2xl font-bold text-green-600">${Math.abs(selectedTransaction.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Details</p>
              <p className="font-medium">{selectedTransaction.notes}</p>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-blue-900'}`}>
                This payout will be processed and deposited to the driver's registered bank account within 1-2 business days.
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
