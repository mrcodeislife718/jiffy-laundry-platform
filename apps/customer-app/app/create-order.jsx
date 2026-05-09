'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';

export default function SchedulePickupScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [weight, setWeight] = useState('10');
  const [services, setServices] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const timeSlots = [
    '8 AM - 10 AM',
    '10 AM - 12 PM',
    '12 PM - 2 PM',
    '2 PM - 4 PM',
    '4 PM - 6 PM',
    '6 PM - 8 PM',
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/(auth)/login');
        return;
      }
      setUser(authUser);

      // Get user addresses
      const { data: userAddresses } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id);
      setAddresses(userAddresses || []);
      if (userAddresses && userAddresses.length > 0) {
        setSelectedAddress(userAddresses[0]);
      }

      // Get services
      const { data: servicesList } = await supabase
        .from('services')
        .select('*')
        .eq('active', true);
      setServices(servicesList || []);

      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePrice = () => {
    const w = parseFloat(weight) || 0;
    const total = selectedServices.reduce((sum, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return sum + (service?.price || 0) * w;
    }, 0) + 2.0;
    setEstimatedPrice(total);
  };

  useEffect(() => {
    calculatePrice();
  }, [weight, selectedServices]);

  const toggleService = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = async () => {
    if (!selectedAddress || !selectedDate || !selectedTime || selectedServices.length === 0) {
      Alert.alert('Missing Info', 'Please fill in all fields');
      return;
    }

    try {
      // Create order
      const { data: order, error } = await supabase
        .from('orders')
        .insert([{
          customer_id: user.id,
          pickup_address_id: selectedAddress.id,
          status: 'pending_payment',
          payment_status: 'unpaid',
          subtotal: estimatedPrice - 2.0,
          pickup_fee: 2.0,
          total: estimatedPrice,
          sla_deadline: new Date(selectedDate + ' ' + selectedTime).toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      // Create order items
      for (const serviceId of selectedServices) {
        const service = services.find(s => s.id === serviceId);
        await supabase.from('order_items').insert([{
          order_id: order.id,
          service_id: serviceId,
          service_name: service?.name,
          quantity: parseFloat(weight),
          unit: service?.unit,
          unit_price: service?.price,
          line_total: service?.price * parseFloat(weight),
        }]);
      }

      router.push(`/checkout?orderId=${order.id}`);
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule Pickup</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Pickup Address */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pickup Address</Text>
        {selectedAddress && (
          <View style={styles.addressCard}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={styles.addressInfo}>
              <Text style={styles.addressStreet}>{selectedAddress.street}</Text>
              <Text style={styles.addressCity}>
                {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.change}>Change</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Pickup Date */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pickup Date</Text>
        <View style={styles.dateGrid}>
          {Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i + 1);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dateNum = d.getDate();
            return (
              <TouchableOpacity
                key={dateStr}
                style={[
                  styles.dateButton,
                  selectedDate === dateStr && styles.dateButtonSelected,
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text style={[
                  styles.dateDayName,
                  selectedDate === dateStr && styles.dateTextSelected,
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.dateNum,
                  selectedDate === dateStr && styles.dateTextSelected,
                ]}>
                  {dateNum}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pickup Time */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Pickup Time</Text>
        <View style={styles.timeGrid}>
          {timeSlots.map(slot => (
            <TouchableOpacity
              key={slot}
              style={[
                styles.timeButton,
                selectedTime === slot && styles.timeButtonSelected,
              ]}
              onPress={() => setSelectedTime(slot)}
            >
              <Text style={[
                styles.timeText,
                selectedTime === slot && styles.timeTextSelected,
              ]}>
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Laundry Type */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Laundry Type</Text>
        <View style={styles.serviceGrid}>
          {services.map(service => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceButton,
                selectedServices.includes(service.id) && styles.serviceButtonSelected,
              ]}
              onPress={() => toggleService(service.id)}
            >
              <Text style={[
                styles.serviceName,
                selectedServices.includes(service.id) && styles.serviceNameSelected,
              ]}>
                {service.name}
              </Text>
              <Text style={[
                styles.servicePrice,
                selectedServices.includes(service.id) && styles.servicePriceSelected,
              ]}>
                ${service.price}/{service.unit}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Weight Input */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Est. Weight (lbs)</Text>
        <View style={styles.weightContainer}>
          <Text style={styles.label}>Est. Weight</Text>
          <View style={styles.inputWrapper}>
            <TouchableOpacity onPress={() => setWeight(String(Math.max(1, parseFloat(weight) - 1)))}>
              <Text style={styles.button}>−</Text>
            </TouchableOpacity>
            <Text style={styles.weightValue}>{weight} lbs</Text>
            <TouchableOpacity onPress={() => setWeight(String(parseFloat(weight) + 1))}>
              <Text style={styles.button}>+</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.label}>Est. Price</Text>
          <Text style={styles.priceValue}>${estimatedPrice.toFixed(2)}</Text>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={styles.continueButton}
        onPress={handleContinue}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
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
  change: {
    color: ORANGE,
    fontSize: 12,
    fontWeight: '600',
  },
  dateGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  dateButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dateButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  dateDayName: {
    fontSize: 11,
    color: LIGHT_GRAY,
    fontWeight: '500',
  },
  dateNum: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginTop: 2,
  },
  dateTextSelected: {
    color: 'white',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  timeButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  timeText: {
    fontSize: 13,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  timeTextSelected: {
    color: 'white',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  serviceButtonSelected: {
    backgroundColor: ORANGE,
    borderColor: ORANGE,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  serviceNameSelected: {
    color: 'white',
  },
  servicePrice: {
    fontSize: 11,
    color: LIGHT_GRAY,
    marginTop: 4,
  },
  servicePriceSelected: {
    color: 'white',
    opacity: 0.9,
  },
  weightContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  button: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_TEXT,
    paddingHorizontal: 8,
  },
  weightValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
    minWidth: 40,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: DARK_TEXT,
  },
  continueButton: {
    backgroundColor: ORANGE,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
