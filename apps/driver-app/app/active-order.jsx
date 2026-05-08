import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { getCurrentUser } from '../../../packages/shared/auth';
import { getDriverActiveOrder, updateOrderDetails } from '../../../packages/shared/orders';
import { insertDriverLocation } from '../../../packages/shared/location';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  cardContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  label: {
    fontWeight: '600',
    color: '#666',
    marginRight: 4,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  controlsContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  controlsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  buttonGrid: {
    gap: 8,
  },
  statusButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#007aff',
  },
  statusButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusButtonDisabled: {
    backgroundColor: '#999',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
});

const STATUS_BUTTONS = [
  { status: 'heading_to_pickup', label: 'Heading to Pickup' },
  { status: 'arrived_at_pickup', label: 'Arrived at Pickup' },
  { status: 'picked_up', label: 'Picked Up' },
  { status: 'received', label: 'Received' },
  { status: 'out_for_delivery', label: 'Out for Delivery' },
  { status: 'delivered', label: 'Delivered' },
];

const getStatusColor = (status) => {
  const colors = {
    pending_dispatch: '#FF9500',
    accepted: '#007AFF',
    heading_to_pickup: '#007AFF',
    arrived_at_pickup: '#007AFF',
    picked_up: '#34C759',
    received: '#34C759',
    sorting: '#34C759',
    washing: '#34C759',
    drying: '#34C759',
    folding: '#34C759',
    quality_check: '#34C759',
    packed: '#34C759',
    ready_for_delivery: '#34C759',
    out_for_delivery: '#34C759',
    delivered: '#34C759',
    cancelled: '#FF3B30',
    refunded: '#FF3B30',
  };
  return colors[status] || '#999';
};

export default function ActiveOrderScreen() {
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [user, setUser] = useState(null);
  const [locationTracking, setLocationTracking] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          setError('Not authenticated');
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const activeOrder = await getDriverActiveOrder(currentUser.id);
        if (!activeOrder) {
          setError('No active orders');
          setLoading(false);
          return;
        }

        setOrder(activeOrder);
        setError('');
      } catch (err) {
        setError('Failed to load order: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, []);

  // Location tracking
  useEffect(() => {
    let locationSubscription = null;

    const startLocationTracking = async () => {
      try {
        // Request foreground location permission
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Location permission denied');
          setLocationTracking(false);
          return;
        }

        // Start watching location
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Update every 5 seconds
            distanceInterval: 10, // Or when moved 10 meters
          },
          async (location) => {
            try {
              if (order && user && order.status !== 'delivered' && order.status !== 'cancelled') {
                await insertDriverLocation({
                  driverId: user.id,
                  orderId: order.id,
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
                });
                setLocationError(''); // Clear error on success
              }
            } catch (err) {
              const errorMsg = 'Location update failed: ' + (err.message || 'Unknown error');
              setLocationError(errorMsg);
              Alert.alert('Location Tracking Error', errorMsg);
            }
          }
        );

        setLocationTracking(true);
      } catch (err) {
        console.log('Location tracking error:', err.message);
        setLocationTracking(false);
      }
    };

    if (order && user && order.status !== 'delivered' && order.status !== 'cancelled') {
      startLocationTracking();
    }

    // Cleanup on unmount or when order changes
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [order, user]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      const updated = await updateOrderDetails({
        orderId: order.id,
        status: newStatus,
      });
      setOrder(updated);
      Alert.alert('Success', `Order status updated to ${newStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      Alert.alert('Error', 'Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No active orders</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Order</Text>
          <Text style={styles.subtitle}>Order {order.id.slice(0, 8)}...</Text>
        </View>

        {/* Current Status */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Status</Text>
          <View style={styles.statusRow}>
            <Text style={styles.cardContent}>
              {order.status.replace(/_/g, ' ').toUpperCase()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status) },
              ]}
            >
              <Text style={styles.statusBadgeText}>Active</Text>
            </View>
          </View>
        </View>

        {/* Customer Info */}
        {order.customer && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Name:</Text> {order.customer.full_name}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Phone:</Text> {order.customer.phone}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Email:</Text> {order.customer.email}
            </Text>
          </View>
        )}

        {/* Pickup Address */}
        {order.addresses && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pickup Address</Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Street:</Text> {order.addresses.street}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>City:</Text> {order.addresses.city}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>State:</Text> {order.addresses.state}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Zip:</Text> {order.addresses.zip_code}
            </Text>
          </View>
        )}

        {/* Laundromat Info */}
        {order.laundromats && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Laundromat</Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Name:</Text> {order.laundromats.name}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>Address:</Text> {order.laundromats.address}
            </Text>
            <Text style={styles.cardContent}>
              <Text style={styles.label}>City:</Text> {order.laundromats.city}
            </Text>
          </View>
        )}

        {/* Order Items */}
        {order.order_items && order.order_items.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Items</Text>
            {order.order_items.map((item, index) => (
              <View key={item.id}>
                <Text style={styles.cardContent}>
                  {item.service_name} × {item.quantity} {item.unit}
                </Text>
                {index < order.order_items.length - 1 && (
                  <View style={styles.divider} />
                )}
              </View>
            ))}
          </View>
        )}

        {/* Status Update Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Update Status</Text>
          <View style={styles.buttonGrid}>
            {STATUS_BUTTONS.map((button) => (
              <TouchableOpacity
                key={button.status}
                style={[styles.statusButton, updating && styles.statusButtonDisabled]}
                onPress={() => handleStatusUpdate(button.status)}
                disabled={updating}
              >
                <Text style={styles.statusButtonText}>{button.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
