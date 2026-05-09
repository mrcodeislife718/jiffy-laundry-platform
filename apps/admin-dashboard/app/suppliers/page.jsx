'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';
import { useTheme } from '@/context/ThemeContext';

export default function SuppliersPage() {
  const { colors } = useTheme();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      // For now, return sample data - can be replaced with Supabase query when table exists
      const sampleSuppliers = [
        { id: 1, name: 'Fabric Care Inc.', contact: 'john@fabriccare.com', phone: '+1-555-0101', totalOrders: 24, status: 'Active' },
        { id: 2, name: 'ChemPro Supplies', contact: 'sales@chempro.com', phone: '+1-555-0102', totalOrders: 18, status: 'Active' },
        { id: 3, name: 'Equipment Plus', contact: 'info@equipplus.com', phone: '+1-555-0103', totalOrders: 12, status: 'Inactive' },
      ];
      setSuppliers(sampleSuppliers);
    } catch (err) {
      console.error('Error loading suppliers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.text, marginBottom: '0.5rem' }}>Supplier Management</h1>
        <p style={{ color: colors.secondary }}>Manage relationships with suppliers and track orders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.primary}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Total Suppliers</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{suppliers.length}</p>
        </div>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.success}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Active Suppliers</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{suppliers.filter(s => s.status === 'Active').length}</p>
        </div>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.warning}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Total Orders</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{suppliers.reduce((sum, s) => sum + s.totalOrders, 0)}</p>
        </div>
      </div>

      <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Suppliers</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Supplier Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Contact</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Phone</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Total Orders</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map(supplier => (
              <tr key={supplier.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                <td style={{ padding: '1rem', color: colors.text, fontWeight: '600' }}>{supplier.name}</td>
                <td style={{ padding: '1rem', color: colors.secondary }}>{supplier.contact}</td>
                <td style={{ padding: '1rem', color: colors.text }}>{supplier.phone}</td>
                <td style={{ padding: '1rem', color: colors.text }}>{supplier.totalOrders}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    background: supplier.status === 'Active' ? colors.success : colors.warning,
                    color: 'white'
                  }}>
                    {supplier.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
