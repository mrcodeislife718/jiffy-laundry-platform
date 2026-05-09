'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import AdminCard from '@/components/AdminCard';
import AdminButton from '@/components/AdminButton';
import AdminModal from '@/components/AdminModal';
import AdminTable from '@/components/AdminTable';
import StatusBadge from '@/components/StatusBadge';
import MetricCard from '@/components/MetricCard';
import AdminInput from '@/components/AdminInput';
import AlertBanner from '@/components/AlertBanner';

export default function DriversPage() {
  const { colors } = useTheme();
  const [drivers, setDrivers] = useState([]);
  const [metrics, setMetrics] = useState({
    active: 0,
    pending: 0,
    suspended: 0,
    totalEarnings: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [actionReason, setActionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDriversAndMetrics();
  }, []);

  const loadDriversAndMetrics = async () => {
    setLoading(true);
    try {
      setDrivers(mockDrivers);
      calculateMetrics(mockDrivers);
    } catch (error) {
      console.error('Error loading drivers:', error);
      setDrivers(mockDrivers);
      calculateMetrics(mockDrivers);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data) => {
    const active = data.filter((d) => d.status === 'active').length;
    const pending = data.filter((d) => d.status === 'pending_approval').length;
    const suspended = data.filter((d) => d.status === 'suspended').length;
    const totalEarnings = data.reduce((sum, d) => sum + (d.totalEarnings || 0), 0);
    const avgRating =
      data.reduce((sum, d) => sum + (d.rating || 0), 0) / (data.length || 1);

    setMetrics({ active, pending, suspended, totalEarnings, avgRating });
  };

  const handleApproveDriver = async () => {
    try {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === selectedDriver.id ? { ...d, status: 'active' } : d
        )
      );
      setModalType(null);
      setActionReason('');
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error approving driver:', error);
    }
  };

  const handleSuspendDriver = async () => {
    try {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === selectedDriver.id ? { ...d, status: 'suspended' } : d
        )
      );
      setModalType(null);
      setActionReason('');
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error suspending driver:', error);
    }
  };

  const handleReactivateDriver = async () => {
    try {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === selectedDriver.id ? { ...d, status: 'active' } : d
        )
      );
      setModalType(null);
      setActionReason('');
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error reactivating driver:', error);
    }
  };

  const openDriverModal = (driver, type) => {
    setSelectedDriver(driver);
    setModalType(type);
    setActionReason('');
  };

  const filteredDrivers = drivers.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.phone.includes(searchQuery) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Driver Name', width: '20%' },
    { key: 'phone', label: 'Phone', width: '15%' },
    { key: 'rating', label: 'Rating', width: '12%' },
    { key: 'status', label: 'Status', width: '15%' },
    { key: 'completedTrips', label: 'Trips', width: '10%' },
    { key: 'totalEarnings', label: 'Earnings', width: '15%' },
    { key: 'actions', label: 'Actions', width: '13%' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text }}>
          Driver Management
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '8px' }}>
          Manage drivers, approvals, suspensions, and performance tracking
        </p>
      </div>

      {/* Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <MetricCard
          label="Active Drivers"
          value={metrics.active}
          changeType="neutral"
          color={colors.primary}
        />
        <MetricCard
          label="Pending Approval"
          value={metrics.pending}
          changeType="neutral"
          color="#FF9800"
        />
        <MetricCard
          label="Suspended"
          value={metrics.suspended}
          changeType="negative"
          color="#F44336"
        />
        <MetricCard
          label="Total Earnings"
          value={`$${(metrics.totalEarnings / 1000).toFixed(1)}k`}
          changeType="positive"
          color="#4CAF50"
        />
      </div>

      {/* Search */}
      <AdminCard style={{ marginBottom: '24px' }}>
        <AdminInput
          label="Search Drivers"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, phone, or email..."
        />
      </AdminCard>

      {/* Drivers Table */}
      <AdminCard title="Drivers">
        <AdminTable
          columns={columns}
          data={filteredDrivers.map((driver) => ({
            ...driver,
            rating: `${driver.rating.toFixed(1)} ⭐ (${driver.reviews})`,
            totalEarnings: `$${driver.totalEarnings.toLocaleString()}`,
            status: (
              <StatusBadge
                status={driver.status}
                label={getStatusLabel(driver.status)}
              />
            ),
            actions: (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openDriverModal(driver, 'view')}
                  title="View Details"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  👁️
                </button>
                {driver.status === 'pending_approval' && (
                  <button
                    onClick={() => openDriverModal(driver, 'approve')}
                    title="Approve"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    ✓
                  </button>
                )}
                {driver.status === 'active' && (
                  <button
                    onClick={() => openDriverModal(driver, 'suspend')}
                    title="Suspend"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    🚫
                  </button>
                )}
                {driver.status === 'suspended' && (
                  <button
                    onClick={() => openDriverModal(driver, 'reactivate')}
                    title="Reactivate"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '18px',
                    }}
                  >
                    ↻
                  </button>
                )}
                <button
                  onClick={() => openDriverModal(driver, 'incidents')}
                  title="View Incidents"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ⚠️
                </button>
              </div>
            ),
          }))}
          loading={loading}
        />
      </AdminCard>

      {/* View Driver Modal */}
      <AdminModal
        isOpen={modalType === 'view' && selectedDriver}
        onClose={() => {
          setModalType(null);
          setSelectedDriver(null);
        }}
        title="Driver Profile"
        description={selectedDriver?.name}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Name</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedDriver?.name}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Phone</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedDriver?.phone}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Email</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedDriver?.email}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Status</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {getStatusLabel(selectedDriver?.status)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Completed Trips
            </p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedDriver?.completedTrips}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Rating</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedDriver?.rating.toFixed(1)} ⭐
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Total Earnings
            </p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              ${selectedDriver?.totalEarnings.toLocaleString()}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Joined Date
            </p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {new Date(selectedDriver?.joinedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: colors.background,
              borderRadius: '8px',
            }}
          >
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Background Check
            </p>
            <p
              style={{
                fontWeight: 'bold',
                color:
                  selectedDriver?.backgroundCheckStatus === 'passed'
                    ? '#4CAF50'
                    : '#FF9800',
              }}
            >
              {selectedDriver?.backgroundCheckStatus === 'passed'
                ? '✓ Passed'
                : '⏳ Pending'}
            </p>
          </div>
        </div>
      </AdminModal>

      {/* Approve Driver Modal */}
      <AdminModal
        isOpen={modalType === 'approve' && selectedDriver}
        onClose={() => {
          setModalType(null);
          setSelectedDriver(null);
        }}
        title="Approve Driver"
        description={`Approve ${selectedDriver?.name} for platform access?`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setModalType(null);
              setSelectedDriver(null);
            },
          },
          {
            label: 'Approve',
            onClick: handleApproveDriver,
            variant: 'success',
          },
        ]}
      >
        <AdminInput
          label="Approval Notes (Optional)"
          type="text"
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder="Add notes for driver..."
        />
      </AdminModal>

      {/* Suspend Driver Modal */}
      <AdminModal
        isOpen={modalType === 'suspend' && selectedDriver}
        onClose={() => {
          setModalType(null);
          setSelectedDriver(null);
        }}
        title="Suspend Driver"
        description={`Suspend ${selectedDriver?.name} from platform?`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setModalType(null);
              setSelectedDriver(null);
            },
          },
          {
            label: 'Suspend',
            onClick: handleSuspendDriver,
            variant: 'danger',
          },
        ]}
      >
        <AlertBanner
          severity="danger"
          title="Warning"
          message="This driver will be unable to accept new orders. Provide a reason."
        />
        <AdminInput
          label="Suspension Reason"
          type="text"
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder="e.g., Low ratings, Safety violation, Customer complaint"
          required
        />
      </AdminModal>

      {/* Reactivate Driver Modal */}
      <AdminModal
        isOpen={modalType === 'reactivate' && selectedDriver}
        onClose={() => {
          setModalType(null);
          setSelectedDriver(null);
        }}
        title="Reactivate Driver"
        description={`Reactivate ${selectedDriver?.name} on the platform?`}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setModalType(null);
              setSelectedDriver(null);
            },
          },
          {
            label: 'Reactivate',
            onClick: handleReactivateDriver,
            variant: 'success',
          },
        ]}
      >
        <AdminInput
          label="Reactivation Reason (Optional)"
          type="text"
          value={actionReason}
          onChange={(e) => setActionReason(e.target.value)}
          placeholder="e.g., Issue resolved, Passed retraining"
        />
      </AdminModal>

      {/* Incidents Modal */}
      <AdminModal
        isOpen={modalType === 'incidents' && selectedDriver}
        onClose={() => {
          setModalType(null);
          setSelectedDriver(null);
        }}
        title="Driver Incidents"
        description={`${selectedDriver?.name} - Last 90 days`}
      >
        {selectedDriver?.incidents && selectedDriver.incidents.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedDriver.incidents.map((incident, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  backgroundColor: colors.background,
                  borderRadius: '8px',
                  borderLeft: `4px solid ${
                    incident.severity === 'critical'
                      ? '#F44336'
                      : incident.severity === 'warning'
                        ? '#FF9800'
                        : '#FFC107'
                  }`,
                }}
              >
                <p style={{ fontWeight: 'bold', color: colors.text }}>
                  {incident.type}
                </p>
                <p style={{ fontSize: '12px', color: colors.textSecondary }}>
                  {new Date(incident.date).toLocaleDateString()} -{' '}
                  {incident.description}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: colors.textSecondary }}>No incidents recorded</p>
        )}
      </AdminModal>
    </div>
  );
}

function getStatusLabel(status) {
  const statusMap = {
    active: 'Active',
    pending_approval: 'Pending Approval',
    suspended: 'Suspended',
    inactive: 'Inactive',
  };
  return statusMap[status] || status;
}

// Mock data
const mockDrivers = [
  {
    id: 'driver-001',
    name: 'John Smith',
    phone: '555-0101',
    email: 'john@example.com',
    status: 'active',
    rating: 4.8,
    reviews: 142,
    completedTrips: 350,
    totalEarnings: 8500,
    joinedDate: '2024-01-15',
    backgroundCheckStatus: 'passed',
    incidents: [
      {
        type: 'Late Delivery',
        date: '2024-12-15',
        severity: 'minor',
        description: 'Order delivered 15 minutes late',
      },
    ],
  },
  {
    id: 'driver-002',
    name: 'Sarah Johnson',
    phone: '555-0102',
    email: 'sarah@example.com',
    status: 'pending_approval',
    rating: 0,
    reviews: 0,
    completedTrips: 0,
    totalEarnings: 0,
    joinedDate: '2024-12-20',
    backgroundCheckStatus: 'passed',
    incidents: [],
  },
  {
    id: 'driver-003',
    name: 'Mike Davis',
    phone: '555-0103',
    email: 'mike@example.com',
    status: 'active',
    rating: 4.5,
    reviews: 98,
    completedTrips: 210,
    totalEarnings: 5200,
    joinedDate: '2024-02-10',
    backgroundCheckStatus: 'passed',
    incidents: [
      {
        type: 'Customer Complaint',
        date: '2024-12-10',
        severity: 'warning',
        description: 'Rude behavior reported',
      },
      {
        type: 'Late Delivery',
        date: '2024-12-05',
        severity: 'minor',
        description: 'Delivered 25 minutes late',
      },
    ],
  },
  {
    id: 'driver-004',
    name: 'Lisa Chen',
    phone: '555-0104',
    email: 'lisa@example.com',
    status: 'suspended',
    rating: 2.1,
    reviews: 45,
    completedTrips: 89,
    totalEarnings: 2100,
    joinedDate: '2024-03-20',
    backgroundCheckStatus: 'passed',
    incidents: [
      {
        type: 'Multiple Violations',
        date: '2024-12-01',
        severity: 'critical',
        description: 'Repeated safety violations',
      },
    ],
  },
  {
    id: 'driver-005',
    name: 'James Wilson',
    phone: '555-0105',
    email: 'james@example.com',
    status: 'active',
    rating: 4.9,
    reviews: 167,
    completedTrips: 420,
    totalEarnings: 10200,
    joinedDate: '2024-01-05',
    backgroundCheckStatus: 'passed',
    incidents: [],
  },
];
