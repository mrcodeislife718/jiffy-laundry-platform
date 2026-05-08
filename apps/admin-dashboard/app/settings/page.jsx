'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@jiffylaundry/shared/supabase';
import styles from './settings.module.css';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingPrice, setEditingPrice] = useState('');

  // Fetch all services (including inactive)
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['all-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: async ({ name, price }) => {
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            name,
            price: parseFloat(price),
            active: true,
          },
        ])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      setNewServiceName('');
      setNewServicePrice('');
      alert('Service created successfully');
    },
    onError: (error) => {
      alert('Error creating service: ' + (error.message || 'Unknown error'));
    },
  });

  // Update price mutation
  const updatePriceMutation = useMutation({
    mutationFn: async ({ serviceId, price }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ price: parseFloat(price) })
        .eq('id', serviceId)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      setEditingId(null);
      setEditingPrice('');
      alert('Price updated successfully');
    },
    onError: (error) => {
      alert('Error updating price: ' + (error.message || 'Unknown error'));
    },
  });

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ serviceId, currentActive }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ active: !currentActive })
        .eq('id', serviceId)
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-services'] });
      alert('Service status updated');
    },
    onError: (error) => {
      alert('Error updating service status: ' + (error.message || 'Unknown error'));
    },
  });

  const handleCreateService = () => {
    if (!newServiceName || !newServicePrice) {
      alert('Please enter both service name and price');
      return;
    }
    createServiceMutation.mutate({
      name: newServiceName,
      price: newServicePrice,
    });
  };

  const handleUpdatePrice = (serviceId) => {
    if (!editingPrice) {
      alert('Please enter a price');
      return;
    }
    updatePriceMutation.mutate({
      serviceId,
      price: editingPrice,
    });
  };

  const handleToggleActive = (serviceId, currentActive) => {
    toggleActiveMutation.mutate({
      serviceId,
      currentActive,
    });
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading services: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Services & Pricing Settings</h1>
      </div>

      {/* Create New Service */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Add New Service</h2>
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Service Name</label>
            <input
              type="text"
              value={newServiceName}
              onChange={(e) => setNewServiceName(e.target.value)}
              placeholder="e.g., Wash & Fold"
              disabled={createServiceMutation.isPending}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newServicePrice}
              onChange={(e) => setNewServicePrice(e.target.value)}
              placeholder="0.00"
              disabled={createServiceMutation.isPending}
              className={styles.input}
            />
          </div>

          <button
            onClick={handleCreateService}
            disabled={createServiceMutation.isPending || !newServiceName || !newServicePrice}
            className={styles.button}
          >
            {createServiceMutation.isPending ? 'Creating...' : 'Create Service'}
          </button>
        </div>
      </div>

      {/* Services List */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Manage Services</h2>
        {services.length === 0 ? (
          <div className={styles.emptyState}>No services found</div>
        ) : (
          <div className={styles.servicesGrid}>
            {services.map((service) => (
              <div key={service.id} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <span
                    style={{
                      backgroundColor: service.active ? '#34C759' : '#999',
                      color: '#fff',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                  >
                    {service.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className={styles.serviceContent}>
                  {editingId === service.id ? (
                    <div className={styles.editingForm}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>New Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={editingPrice}
                          onChange={(e) => setEditingPrice(e.target.value)}
                          disabled={updatePriceMutation.isPending}
                          className={styles.input}
                          autoFocus
                        />
                      </div>

                      <div className={styles.buttonGroup}>
                        <button
                          onClick={() => handleUpdatePrice(service.id)}
                          disabled={updatePriceMutation.isPending || !editingPrice}
                          style={{
                            backgroundColor: '#34C759',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          {updatePriceMutation.isPending ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingPrice('');
                          }}
                          disabled={updatePriceMutation.isPending}
                          style={{
                            backgroundColor: '#999',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className={styles.priceDisplay}>
                        <span className={styles.priceLabel}>Price:</span>
                        <span className={styles.priceValue}>${parseFloat(service.price || 0).toFixed(2)}</span>
                      </div>

                      <div className={styles.buttonGroup}>
                        <button
                          onClick={() => {
                            setEditingId(service.id);
                            setEditingPrice(service.price);
                          }}
                          disabled={
                            createServiceMutation.isPending ||
                            updatePriceMutation.isPending ||
                            toggleActiveMutation.isPending
                          }
                          style={{
                            backgroundColor: '#007AFF',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          Edit Price
                        </button>

                        <button
                          onClick={() => handleToggleActive(service.id, service.active)}
                          disabled={
                            createServiceMutation.isPending ||
                            updatePriceMutation.isPending ||
                            toggleActiveMutation.isPending
                          }
                          style={{
                            backgroundColor: service.active ? '#FF9500' : '#34C759',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          {toggleActiveMutation.isPending
                            ? 'Updating...'
                            : service.active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
