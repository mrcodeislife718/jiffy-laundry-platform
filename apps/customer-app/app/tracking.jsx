'use client';

import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const INFO = '#3b82f6';

export default function TrackingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [driver, setDriver] = useState(null);
  const [items, setItems] = useState([]);
  const [address, setAddress] = useState(null);

  const statusSteps = [
    { status: 'pending_payment', label: 'Payment', icon: '💳' },
    { status: 'confirmed', label: 'Confirmed', icon: '✓' },
    { status: 'picked_up', label: 'Picked Up', icon: '📦' },
    { status: 'in_progress', label: 'Washing', icon: '🧺' },
    { status: 'ready_for_delivery', label: 'Ready', icon: '✨' },
    { status: 'delivered', label: 'Delivered', icon: '🏠' },
  ];

  useEffect(() => {
    if (orderId) {
      loadOrderData();
      const subscription = supabase
        .channel(`order:${orderId}`)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'orders', filter: `id=eq.${orderId}` },
          (payload) => setOrder(payload.new)
        )
        .subscribe();
      return () => subscription.unsubscribe();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      setOrder(orderData);

      if (orderData) {
        const { data: addressData } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderData.pickup_address_id)
          .single();
        setAddress(addressData);

        if (orderData.driver_id) {
          const { data: driverData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', orderData.driver_id)
            .single();
          setDriver(driverData);
        }

        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', orderId);
        setItems(itemsData || []);
      }
    } catch (err) {
      console.error('Error loading order:', err);
    } finally {
      setLoading(false);
    }
  };

  const isStatusComplete = (status) => {
    const currentIndex = statusSteps.findIndex(s => s.status === order?.status);
    const stepIndex = statusSteps.findIndex(s => s.status === status);
    return stepIndex < currentIndex || (stepIndex === currentIndex);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.id.slice(0, 8)}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.timeline}>
        {statusSteps.map((step, index) => {
          const isComplete = isStatusComplete(step.status);
          const isCurrent = order.status === step.status;
          
          return (
            <View key={step.status}>
              <View style={styles.timelineItem}>
                <View style={[
                  styles.timelineCircle,
                  isCurrent && { backgroundColor: ORANGE },
                  isComplete && !isCurrent && { backgroundColor: SUCCESS },
                  !isComplete && !isCurrent && { backgroundColor: '#e5e7eb' }
                ]}>
                  <Text style={styles.timelineIcon}>{step.icon}</Text>
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineLabel,
                    isCurrent && { color: ORANGE, fontWeight: 'bold' },
                    isComplete && !isCurrent && { color: SUCCESS }
                  ]}>
                    {step.label}
                  </Text>
                </View>
              </View>
              {index < statusSteps.length - 1 && (
                <View style={[
                  styles.timelineConnector,
                  isComplete && { backgroundColor: SUCCESS }
                ]} />
              )}
            </View>
          );
        })}
      </View>

      {driver && order.status !== 'pending_payment' && order.status !== 'confirmed' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver</Text>
          <View style={styles.driverCard}>
            <Text style={styles.driverAvatar}>👤</Text>
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{driver.full_name}</Text>
              <Text style={styles.driverPhone}>{driver.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressIcon}>📍</Text>
          <View style={styles.addressInfo}>
            <Text style={styles.addressStreet}>{address?.street}</Text>
            <Text style={styles.addressCity}>
              {address?.city}, {address?.state} {address?.zip}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {items.map(item => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.service_name}</Text>
            <Text style={styles.itemQty}>{item.quantity} {item.unit}</Text>
            <Text style={styles.itemPrice}>${item.line_total?.toFixed(2) || '0.00'}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${order.subtotal?.toFixed(2) || '0.00'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Pickup Fee</Text>
          <Text style={styles.summaryValue}>${order.pickup_fee?.toFixed(2) || '0.00'}</Text>
        </View>
        {order.tax && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax</Text>
            <Text style={styles.summaryValue}>${order.tax.toFixed(2)}</Text>
          </View>
        )}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total?.toFixed(2) || '0.00'}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.supportButton}>
        <Text style={styles.supportButtonText}>💬 Contact Support</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 12,
  },
  backBtn: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  errorText: {
    fontSize: 16,
    color: DARK_TEXT,
    marginBottom: 16,
  },
  link: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '600',
  },
  timeline: {
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  timelineIcon: {
    fontSize: 24,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 12,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK_TEXT,
  },
  timelineConnector: {
    width: 2,
    height: 20,
    marginLeft: 23,
    backgroundColor: '#e5e7eb',
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 12,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    fontSize: 40,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  driverPhone: {
    fontSize: 12,
    color: LIGHT_GRAY,
    marginTop: 4,
  },
  callBtn: {
    backgroundColor: ORANGE,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callBtnText: {
    fontSize: 18,
  },
  addressCard: {
    flexDirection: 'row',
    gap: 12,
  },
  addressIcon: {
    fontSize: 24,
  },
  addressInfo: {
    flex: 1,
  },
  addressStreet: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  addressCity: {
    fontSize: 12,
    color: LIGHT_GRAY,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  itemName: {
    fontSize: 13,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  itemQty: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  summaryValue: {
    fontSize: 13,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: ORANGE,
  },
  supportButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  supportButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
