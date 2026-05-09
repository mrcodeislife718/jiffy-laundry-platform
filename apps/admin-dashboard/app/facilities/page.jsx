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

export default function FacilitiesPage() {
  const { colors } = useTheme();
  const [facilities, setFacilities] = useState([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    operating: 0,
    maintenance: 0,
    totalCapacity: 0,
    avgUtilization: 0,
  });
  const [loading, setLoading] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFacilitiesAndMetrics();
  }, []);

  const loadFacilitiesAndMetrics = async () => {
    setLoading(true);
    try {
      setFacilities(mockFacilities);
      calculateMetrics(mockFacilities);
    } catch (error) {
      console.error('Error loading facilities:', error);
      setFacilities(mockFacilities);
      calculateMetrics(mockFacilities);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (data) => {
    const operating = data.filter((f) => f.status === 'operating').length;
    const maintenance = data.filter((f) => f.status === 'maintenance').length;
    const totalCapacity = data.reduce((sum, f) => sum + f.maxCapacity, 0);
    const avgUtilization =
      data.reduce((sum, f) => sum + f.utilizationPercent, 0) / (data.length || 1);

    setMetrics({
      total: data.length,
      operating,
      maintenance,
      totalCapacity,
      avgUtilization: Math.round(avgUtilization),
    });
  };

  const openFacilityModal = (facility, type) => {
    setSelectedFacility(facility);
    setModalType(type);
  };

  const filteredFacilities = facilities.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { key: 'name', label: 'Facility Name', width: '20%' },
    { key: 'location', label: 'Location', width: '20%' },
    { key: 'status', label: 'Status', width: '12%' },
    { key: 'currentCapacity', label: 'Capacity', width: '15%' },
    { key: 'utilizationPercent', label: 'Utilization', width: '15%' },
    { key: 'staff', label: 'Staff', width: '10%' },
    { key: 'actions', label: 'Actions', width: '8%' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: colors.text }}>
          Facility Management
        </h1>
        <p style={{ color: colors.textSecondary, marginTop: '8px' }}>
          Monitor facility operations, capacity, and performance
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
          label="Total Facilities"
          value={metrics.total}
          changeType="neutral"
          color={colors.primary}
        />
        <MetricCard
          label="Operating"
          value={metrics.operating}
          changeType="positive"
          color="#4CAF50"
        />
        <MetricCard
          label="In Maintenance"
          value={metrics.maintenance}
          changeType="neutral"
          color="#FF9800"
        />
        <MetricCard
          label="Avg Utilization"
          value={`${metrics.avgUtilization}%`}
          changeType={metrics.avgUtilization > 80 ? 'negative' : 'positive'}
          color={colors.primary}
        />
      </div>

      {/* Search */}
      <AdminCard style={{ marginBottom: '24px' }}>
        <AdminInput
          label="Search Facilities"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name or location..."
        />
      </AdminCard>

      {/* Facilities Table */}
      <AdminCard title="Facilities">
        <AdminTable
          columns={columns}
          data={filteredFacilities.map((facility) => ({
            ...facility,
            currentCapacity: `${facility.currentCapacity}/${facility.maxCapacity}`,
            utilizationPercent: `${facility.utilizationPercent}%`,
            staff: facility.staffCount,
            status: (
              <StatusBadge
                status={facility.status}
                label={getStatusLabel(facility.status)}
              />
            ),
            actions: (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => openFacilityModal(facility, 'view')}
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
                <button
                  onClick={() => openFacilityModal(facility, 'services')}
                  title="Manage Services"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ⚙️
                </button>
                <button
                  onClick={() => openFacilityModal(facility, 'edit')}
                  title="Edit"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                  }}
                >
                  ✏️
                </button>
              </div>
            ),
          }))}
          loading={loading}
        />
      </AdminCard>

      {/* View Facility Modal */}
      <AdminModal
        isOpen={modalType === 'view' && selectedFacility}
        onClose={() => {
          setModalType(null);
          setSelectedFacility(null);
        }}
        title="Facility Details"
        description={selectedFacility?.name}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Location</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.location}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Status</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {getStatusLabel(selectedFacility?.status)}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Capacity</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.currentCapacity}/{selectedFacility?.maxCapacity} items
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Utilization</p>
            <p
              style={{
                fontWeight: 'bold',
                color:
                  selectedFacility?.utilizationPercent > 80
                    ? '#F44336'
                    : selectedFacility?.utilizationPercent > 50
                      ? '#FF9800'
                      : '#4CAF50',
              }}
            >
              {selectedFacility?.utilizationPercent}%
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Staff</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.staffCount} employees
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>Contact</p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.managerPhone}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div
            style={{
              padding: '12px',
              backgroundColor: colors.background,
              borderRadius: '8px',
            }}
          >
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Operating Hours
            </p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.operatingHours}
            </p>
          </div>
          <div
            style={{
              padding: '12px',
              backgroundColor: colors.background,
              borderRadius: '8px',
            }}
          >
            <p style={{ fontSize: '12px', color: colors.textSecondary }}>
              Machines
            </p>
            <p style={{ fontWeight: 'bold', color: colors.text }}>
              {selectedFacility?.machineCount} units
            </p>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '12px', color: colors.textSecondary, marginBottom: '8px' }}>
            Services Offered
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {selectedFacility?.services.map((service, idx) => (
              <span
                key={idx}
                style={{
                  padding: '4px 12px',
                  backgroundColor: colors.primary,
                  color: 'white',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500',
                }}
              >
                {service}
              </span>
            ))}
          </div>
        </div>
      </AdminModal>

      {/* Manage Services Modal */}
      <AdminModal
        isOpen={modalType === 'services' && selectedFacility}
        onClose={() => {
          setModalType(null);
          setSelectedFacility(null);
        }}
        title="Manage Services"
        description={selectedFacility?.name}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {['Regular Wash', 'Express Wash', 'Dry Cleaning', 'Ironing', 'Alterations'].map(
            (service) => (
              <div
                key={service}
                style={{
                  padding: '12px',
                  border: `2px solid ${
                    selectedFacility?.services.includes(service)
                      ? colors.primary
                      : colors.border
                  }`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: selectedFacility?.services.includes(service)
                    ? colors.background
                    : 'transparent',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontWeight: '500', color: colors.text }}>
                    {service}
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedFacility?.services.includes(service)}
                    readOnly
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </AdminModal>

      {/* Edit Facility Modal */}
      <AdminModal
        isOpen={modalType === 'edit' && selectedFacility}
        onClose={() => {
          setModalType(null);
          setSelectedFacility(null);
        }}
        title="Edit Facility"
        description={selectedFacility?.name}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AdminInput
            label="Facility Name"
            type="text"
            value={selectedFacility?.name || ''}
            placeholder="Enter facility name"
          />
          <AdminInput
            label="Location"
            type="text"
            value={selectedFacility?.location || ''}
            placeholder="Enter location"
          />
          <AdminInput
            label="Max Capacity"
            type="number"
            value={selectedFacility?.maxCapacity || ''}
            placeholder="Enter max capacity"
          />
          <AdminInput
            label="Operating Hours"
            type="text"
            value={selectedFacility?.operatingHours || ''}
            placeholder="e.g., 6AM - 10PM"
          />
          <AdminInput
            label="Manager Phone"
            type="tel"
            value={selectedFacility?.managerPhone || ''}
            placeholder="Enter phone number"
          />
        </div>
      </AdminModal>
    </div>
  );
}

function getStatusLabel(status) {
  const statusMap = {
    operating: 'Operating',
    maintenance: 'Maintenance',
    closed: 'Closed',
  };
  return statusMap[status] || status;
}

// Mock data
const mockFacilities = [
  {
    id: 'facility-001',
    name: 'Downtown Laundromat',
    location: '123 Main St, NYC',
    status: 'operating',
    currentCapacity: 145,
    maxCapacity: 200,
    utilizationPercent: 72,
    staffCount: 5,
    managerPhone: '555-1001',
    operatingHours: '6:00 AM - 11:00 PM',
    machineCount: 24,
    services: ['Regular Wash', 'Express Wash', 'Dry Cleaning', 'Ironing'],
  },
  {
    id: 'facility-002',
    name: 'Midtown Express',
    location: '456 Park Ave, NYC',
    status: 'operating',
    currentCapacity: 89,
    maxCapacity: 150,
    utilizationPercent: 59,
    staffCount: 3,
    managerPhone: '555-1002',
    operatingHours: '7:00 AM - 10:00 PM',
    machineCount: 18,
    services: ['Regular Wash', 'Express Wash'],
  },
  {
    id: 'facility-003',
    name: 'Airport Cleaners',
    location: '789 Airport Rd, NYC',
    status: 'operating',
    currentCapacity: 178,
    maxCapacity: 200,
    utilizationPercent: 89,
    staffCount: 6,
    managerPhone: '555-1003',
    operatingHours: '24 Hours',
    machineCount: 30,
    services: ['Regular Wash', 'Express Wash', 'Dry Cleaning', 'Ironing', 'Alterations'],
  },
  {
    id: 'facility-004',
    name: 'Uptown Plaza',
    location: '321 5th Ave, NYC',
    status: 'maintenance',
    currentCapacity: 0,
    maxCapacity: 180,
    utilizationPercent: 0,
    staffCount: 4,
    managerPhone: '555-1004',
    operatingHours: 'Closed',
    machineCount: 27,
    services: ['Regular Wash', 'Express Wash', 'Dry Cleaning'],
  },
  {
    id: 'facility-005',
    name: 'Brooklyn Hub',
    location: '555 Bedford Ave, Brooklyn',
    status: 'operating',
    currentCapacity: 112,
    maxCapacity: 150,
    utilizationPercent: 75,
    staffCount: 4,
    managerPhone: '555-1005',
    operatingHours: '6:30 AM - 9:30 PM',
    machineCount: 22,
    services: ['Regular Wash', 'Express Wash', 'Dry Cleaning'],
  },
];
