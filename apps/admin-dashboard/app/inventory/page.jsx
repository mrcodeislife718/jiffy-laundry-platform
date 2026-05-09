'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';
import { useTheme } from '@/context/ThemeContext';

export default function InventoryPage() {
  const { colors } = useTheme();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data } = await supabase
        .from('laundromat_inventory')
        .select('*')
        .order('item_name');
      setInventory(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: colors.text, marginBottom: '0.5rem' }}>Inventory Management</h1>
        <p style={{ color: colors.secondary }}>Track and manage all supplies and equipment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.primary}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Total Items</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{inventory.length}</p>
        </div>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.warning}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Low Stock Items</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{inventory.filter(i => i.quantity < 10).length}</p>
        </div>
        <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${colors.danger}` }}>
          <p style={{ fontSize: '0.875rem', color: colors.secondary, marginBottom: '0.5rem' }}>Out of Stock</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: colors.text }}>{inventory.filter(i => i.quantity === 0).length}</p>
        </div>
      </div>

      <div style={{ background: colors.bgSecondary, borderRadius: '0.5rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: colors.text, marginBottom: '1rem' }}>Inventory Items</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Item Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Quantity</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: colors.text, fontWeight: '600' }}>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: colors.secondary }}>
                  No inventory items found
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <td style={{ padding: '1rem', color: colors.text }}>{item.item_name}</td>
                  <td style={{ padding: '1rem', color: colors.text, fontWeight: '600' }}>{item.quantity}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      background: item.quantity === 0 ? colors.danger : item.quantity < 10 ? colors.warning : colors.success,
                      color: 'white'
                    }}>
                      {item.quantity === 0 ? 'Out of Stock' : item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: colors.secondary, fontSize: '0.875rem' }}>
                    {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
