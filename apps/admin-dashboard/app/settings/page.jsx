'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function SettingsPage() {
  const { colors, isDark } = useTheme();
  const [settings, setSettings] = useState({
    businessName: 'Jiffy Laundry',
    email: 'admin@jiffylaundry.com',
    phone: '(555) 123-4567',
    address: '123 Main St, City, State 12345',
    operatingHours: '6:00 AM - 10:00 PM',
    defaultPickupFee: 2.0,
    currency: 'USD',
    notifications: {
      emailAlerts: true,
      smsAlerts: true,
      orderUpdates: true,
    },
  });

  const [saved, setSaved] = useState(false);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (key) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: DARK_TEXT, marginBottom: '0.5rem' }}>Settings</h1>
        <p style={{ color: LIGHT_GRAY }}>Manage business information and preferences</p>
      </div>

      {saved && (
        <div style={{
          background: '#d1fae5',
          border: `2px solid ${SUCCESS}`,
          borderRadius: '0.5rem',
          padding: '1rem',
          marginBottom: '1.5rem',
          color: '#047857',
          fontWeight: '500',
        }}>
          ✓ Settings saved successfully
        </div>
      )}

      {/* Business Information */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: DARK_TEXT, marginBottom: '1.5rem' }}>Business Information</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Business Name', field: 'businessName' },
            { label: 'Email', field: 'email' },
            { label: 'Phone', field: 'phone' },
            { label: 'Address', field: 'address' },
            { label: 'Operating Hours', field: 'operatingHours' },
            { label: 'Default Pickup Fee ($)', field: 'defaultPickupFee' },
          ].map(({ label, field }) => (
            <div key={field}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: DARK_TEXT, display: 'block', marginBottom: '0.5rem' }}>
                {label}
              </label>
              <input
                type={field === 'defaultPickupFee' ? 'number' : 'text'}
                value={settings[field]}
                onChange={(e) => handleInputChange(field, field === 'defaultPickupFee' ? parseFloat(e.target.value) : e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.375rem',
                  border: `1px solid #d1d5db`,
                  fontSize: '0.875rem',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notification Settings */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '2rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: DARK_TEXT, marginBottom: '1.5rem' }}>Notifications</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { key: 'emailAlerts', label: 'Email Alerts' },
            { key: 'smsAlerts', label: 'SMS Alerts' },
            { key: 'orderUpdates', label: 'Order Updates' },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: BG, borderRadius: '0.375rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications[key]}
                onChange={() => handleNotificationChange(key)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <label style={{ fontSize: '0.875rem', fontWeight: '500', color: DARK_TEXT, cursor: 'pointer', margin: 0 }}>
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ background: 'white', borderRadius: '0.5rem', padding: '2rem', border: `2px solid #fecaca` }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#dc2626', marginBottom: '1rem' }}>Danger Zone</h2>
        <p style={{ fontSize: '0.875rem', color: LIGHT_GRAY, marginBottom: '1rem' }}>Irreversible actions. Proceed with caution.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <button style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: '#fecaca',
            color: '#dc2626',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s',
          }} onMouseEnter={(e) => e.currentTarget.style.background = '#fca5a5'} onMouseLeave={(e) => e.currentTarget.style.background = '#fecaca'}>
            Export Data
          </button>
          <button style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: '#fee2e2',
            color: '#dc2626',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s',
          }} onMouseEnter={(e) => e.currentTarget.style.background = '#fecaca'} onMouseLeave={(e) => e.currentTarget.style.background = '#fee2e2'}>
            Clear Cache
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleSave}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: '0.375rem',
            border: 'none',
            background: ORANGE,
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.875rem',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#cc5829'}
          onMouseLeave={(e) => e.currentTarget.style.background = ORANGE}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}
