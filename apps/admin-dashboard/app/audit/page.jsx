'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AdminCard from '@/components/AdminCard';
import AdminInput from '@/components/AdminInput';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import MetricCard from '@/components/MetricCard';
import AlertBanner from '@/components/AlertBanner';

export default function AuditPage() {
  const { colors, isDark } = useTheme();
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalActions: 0,
    lastWeek: 0,
    adminUsers: 0,
    criticalActions: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Load audit logs and metrics
  useEffect(() => {
    loadAuditLogsAndMetrics();
  }, []);

  const loadAuditLogsAndMetrics = async () => {
    setLoading(true);
    // Mock data - in production, fetch from Supabase audit_logs table
    const mockLogs = [
      {
        id: 'ALG-001',
        user: 'admin@jiffylaundry.com',
        action: 'ORDER_REFUND',
        description: 'Issued $45.99 refund for order ORD-245 due to SLA breach',
        timestamp: '2024-01-16T09:45:00Z',
        severity: 'high',
        metadata: { orderId: 'ORD-245', amount: 45.99, reason: 'SLA breach' },
      },
      {
        id: 'ALG-002',
        user: 'manager@jiffylaundry.com',
        action: 'DRIVER_SUSPENDED',
        description: 'Suspended driver DRV-087 for low ratings (2.1 stars)',
        timestamp: '2024-01-16T09:20:00Z',
        severity: 'high',
        metadata: { driverId: 'DRV-087', reason: 'Low ratings', rating: 2.1 },
      },
      {
        id: 'ALG-003',
        user: 'admin@jiffylaundry.com',
        action: 'PROMO_CODE_CREATED',
        description: 'Created promo code SAVE20 for 20% discount (expires 2024-02-16)',
        timestamp: '2024-01-16T08:30:00Z',
        severity: 'medium',
        metadata: { code: 'SAVE20', discount: 20, expiresAt: '2024-02-16' },
      },
      {
        id: 'ALG-004',
        user: 'manager@jiffylaundry.com',
        action: 'FACILITY_STATUS_CHANGED',
        description: 'Changed facility FAC-012 status from active to maintenance',
        timestamp: '2024-01-16T07:15:00Z',
        severity: 'medium',
        metadata: { facilityId: 'FAC-012', fromStatus: 'active', toStatus: 'maintenance' },
      },
      {
        id: 'ALG-005',
        user: 'admin@jiffylaundry.com',
        action: 'USER_ROLE_CHANGED',
        description: 'Updated user john@example.com role from customer to driver',
        timestamp: '2024-01-16T06:00:00Z',
        severity: 'high',
        metadata: { userId: 'USER-456', email: 'john@example.com', fromRole: 'customer', toRole: 'driver' },
      },
      {
        id: 'ALG-006',
        user: 'support@jiffylaundry.com',
        action: 'CUSTOMER_WALLET_ADJUSTED',
        description: 'Adjusted wallet balance for CUST-102 by +$50.00 (manual credit)',
        timestamp: '2024-01-16T05:30:00Z',
        severity: 'medium',
        metadata: { customerId: 'CUST-102', adjustment: 50.0, reason: 'manual credit' },
      },
      {
        id: 'ALG-007',
        user: 'admin@jiffylaundry.com',
        action: 'ADMIN_LOGIN',
        description: 'Admin user admin@jiffylaundry.com logged in from IP 192.168.1.100',
        timestamp: '2024-01-16T05:00:00Z',
        severity: 'low',
        metadata: { email: 'admin@jiffylaundry.com', ip: '192.168.1.100', device: 'Chrome on macOS' },
      },
      {
        id: 'ALG-008',
        user: 'manager@jiffylaundry.com',
        action: 'ORDER_STATUS_OVERRIDE',
        description: 'Overrode order ORD-240 status from in-progress to delivered',
        timestamp: '2024-01-16T04:45:00Z',
        severity: 'high',
        metadata: { orderId: 'ORD-240', fromStatus: 'in-progress', toStatus: 'delivered' },
      },
    ];

    setLogs(mockLogs);
    setMetrics({
      totalActions: 342,
      lastWeek: 47,
      adminUsers: 5,
      criticalActions: mockLogs.filter((l) => l.severity === 'high').length,
    });
    setLoading(false);
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesUser = filterUser === 'all' || log.user === filterUser;
    return matchesSearch && matchesAction && matchesUser;
  });

  const openLogModal = (log) => {
    setSelectedLog(log);
    setShowViewModal(true);
  };

  const getSeverityColor = (severity) => {
    if (severity === 'high') return 'text-red-600 font-bold';
    if (severity === 'medium') return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  const getSeverityBadgeColor = (severity) => {
    if (severity === 'high') return isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700';
    if (severity === 'medium') return isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-50 text-yellow-700';
    return isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700';
  };

  const getActionLabel = (action) => {
    const labels = {
      ORDER_REFUND: 'Order Refund',
      DRIVER_SUSPENDED: 'Driver Suspended',
      PROMO_CODE_CREATED: 'Promo Code Created',
      FACILITY_STATUS_CHANGED: 'Facility Status Changed',
      USER_ROLE_CHANGED: 'User Role Changed',
      CUSTOMER_WALLET_ADJUSTED: 'Wallet Adjusted',
      ADMIN_LOGIN: 'Admin Login',
      ORDER_STATUS_OVERRIDE: 'Order Override',
    };
    return labels[action] || action;
  };

  // Get unique actions and users for filters
  const uniqueActions = ['all', ...new Set(logs.map((l) => l.action))];
  const uniqueUsers = ['all', ...new Set(logs.map((l) => l.user))];

  const columns = [
    { key: 'id', label: 'Log ID', width: '10%' },
    { key: 'timestamp', label: 'Date & Time', width: '15%',
      render: (value) => new Date(value).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
    { key: 'user', label: 'Admin User', width: '18%' },
    { key: 'action', label: 'Action', width: '18%',
      render: (value) => getActionLabel(value),
    },
    { key: 'description', label: 'Description', width: '27%' },
    {
      key: 'severity',
      label: 'Severity',
      width: '12%',
      render: (value) => <span className={getSeverityColor(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>,
    },
  ];

  const rowActions = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (row) => openLogModal(row),
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          📋 Audit Logs
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          Complete audit trail of all admin actions and system changes
        </p>
      </div>

      {/* Metrics Row */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Total Actions"
            value={metrics.totalActions.toString()}
            change={0}
            icon="📊"
            color="#061B3A"
          />
          <MetricCard
            label="Last 7 Days"
            value={metrics.lastWeek.toString()}
            change={8.3}
            icon="📈"
            color="#FF5A00"
          />
          <MetricCard
            label="Admin Users"
            value={metrics.adminUsers.toString()}
            change={0}
            icon="👨‍💼"
            color="#3B82F6"
          />
          <MetricCard
            label="Critical Actions"
            value={metrics.criticalActions.toString()}
            change={-12.5}
            icon="🔴"
            color="#EF4444"
          />
        </div>

        {/* Alert Banner */}
        {metrics.criticalActions > 2 && (
          <AlertBanner
            severity="danger"
            message={`${metrics.criticalActions} critical actions detected. Review these logs for security compliance.`}
          />
        )}
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <AdminInput
            label="Search Logs"
            placeholder="Search by ID, user, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Action Type
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action === 'all' ? 'All Actions' : getActionLabel(action)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Admin User
            </label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              {uniqueUsers.map((user) => (
                <option key={user} value={user}>
                  {user === 'all' ? 'All Users' : user}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="px-6 pb-6">
        <AdminCard title="Audit Logs" subtitle={`${filteredLogs.length} log entries`}>
          <AdminTable
            columns={columns}
            data={filteredLogs}
            rowActions={rowActions}
            loading={loading}
            emptyMessage="No audit logs found"
          />
        </AdminCard>
      </div>

      {/* View Log Modal */}
      <AdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Audit Log Details"
        size="lg"
        actions={[
          {
            label: 'Close',
            onClick: () => setShowViewModal(false),
            variant: 'secondary',
          },
        ]}
      >
        {selectedLog && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Log ID</p>
                <p className="font-semibold text-[#FF5A00]">{selectedLog.id}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Admin User</p>
                <p className="font-semibold">{selectedLog.user}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Action</p>
                <p className="font-semibold">{getActionLabel(selectedLog.action)}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Severity</p>
                <p className={getSeverityColor(selectedLog.severity)}>
                  {selectedLog.severity.charAt(0).toUpperCase() + selectedLog.severity.slice(1)}
                </p>
              </div>
            </div>

            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Timestamp</p>
              <p className="font-semibold">
                {new Date(selectedLog.timestamp).toLocaleString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>

            <div>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Description</p>
              <p className="font-medium">{selectedLog.description}</p>
            </div>

            <div className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm font-medium mb-3 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>Metadata</p>
              <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                <pre className="overflow-x-auto whitespace-pre-wrap break-words">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
              <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                This is an immutable audit record. All admin actions are recorded for compliance and security purposes.
              </p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
