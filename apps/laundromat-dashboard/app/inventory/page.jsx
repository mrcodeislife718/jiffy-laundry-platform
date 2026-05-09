'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const DANGER = '#ef4444';

export default function InventoryPage() {
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
        .order('created_at', { ascending: false });

      setInventory(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (current, max) => {
    const percentage = (current / max) * 100;
    if (percentage > 50) return { label: 'In Stock', color: SUCCESS };
    if (percentage > 20) return { label: 'Low Stock', color: WARNING };
    return { label: 'Critical', color: DANGER };
  };

  const handleUpdateStock = async (itemId, newStock) => {
    try {
      await supabase
        .from('laundromat_inventory')
        .update({ current_stock: newStock })
        .eq('id', itemId);
      loadInventory();
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: DARK_TEXT, marginBottom: '0.5rem' }}>Inventory Management</h1>
        <p style={{ color: LIGHT_GRAY }}>Track and manage laundromat supplies and equipment</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${SUCCESS}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Total Items</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>{inventory.length}</p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${WARNING}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Low Stock</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>
            {inventory.filter(i => (i.current_stock / i.max_stock) * 100 <= 50).length}
          </p>
        </div>
        <div style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', borderLeft: `4px solid ${DANGER}` }}>
          <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '0.5rem' }}>Critical Stock</p>
          <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: DARK_TEXT }}>
            {inventory.filter(i => (i.current_stock / i.max_stock) * 100 <= 20).length}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {inventory.map(item => {
          const status = getStockStatus(item.current_stock, item.max_stock);
          const percentage = (item.current_stock / item.max_stock) * 100;
          
          return (
            <div key={item.id} style={{ background: 'white', borderRadius: '0.5rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '600', color: DARK_TEXT }}>{item.item_name}</h3>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '0.25rem',
                    background: status.color,
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                  }}>
                    {status.label}
                  </span>
                </div>
                <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY }}>Unit: {item.unit || 'pc'}</p>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  <span style={{ color: DARK_TEXT, fontWeight: '600' }}>{item.current_stock} / {item.max_stock}</span>
                  <span style={{ color: LIGHT_GRAY }}>{percentage.toFixed(0)}%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: status.color,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleUpdateStock(item.id, Math.min(item.current_stock + 10, item.max_stock))}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: ORANGE,
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  + Add Stock
                </button>
                <button
                  onClick={() => handleUpdateStock(item.id, Math.max(item.current_stock - 5, 0))}
                  style={{
                    flex: 1,
                    padding: '0.5rem',
                    background: '#e5e7eb',
                    color: DARK_TEXT,
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  - Use
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {inventory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: LIGHT_GRAY }}>
          <p style={{ fontSize: '1rem' }}>No inventory items found</p>
        </div>
      )}
    </div>
  );
}
