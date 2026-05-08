import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getOrderById, subscribeToOrder } from '../../../packages/shared/orders';
import { getLatestDriverLocation, subscribeToDriverLocation } from '../../../packages/shared/location';

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);

  // Fetch order
  const { data: initialOrder, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
    }
  }, [initialOrder]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!orderId) return;

    const subscription = subscribeToOrder(orderId, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setOrder(payload.new);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [orderId]);

  // Load initial driver location
  useEffect(() => {
    if (!orderId) return;

    const loadLocation = async () => {
      try {
        const location = await getLatestDriverLocation(orderId);
        if (location) {
          setDriverLocation(location);
        }
      } catch (err) {
        console.error('Failed to load driver location:', err);
      }
    };

    loadLocation();
  }, [orderId]);

  // Subscribe to driver location updates
  useEffect(() => {
    if (!orderId) return;

    const subscription = subscribeToDriverLocation(orderId, (payload) => {
      if (payload.eventType === 'INSERT') {
        setDriverLocation(payload.new);
      }
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [orderId]);

  if (!orderId) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Missing order ID</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading order</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    const statusColors = {
      pending_payment: '#FF9500',
      pending_dispatch: '#FF9500',
      accepted: '#007AFF',
      heading_to_pickup: '#007AFF',
      arrived_at_pickup: '#007AFF',
      picked_up: '#007AFF',
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
    return statusColors[status] || '#999';
  };

  const statusList = [
    'pending_payment',
    'pending_dispatch',
    'accepted',
    'heading_to_pickup',
    'arrived_at_pickup',
    'picked_up',
    'received',
    'sorting',
    'washing',
    'drying',
    'folding',
    'quality_check',
    'packed',
    'ready_for_delivery',
    'out_for_delivery',
    'delivered',
  ];

  const currentStatusIndex = statusList.indexOf(order.status);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>

      {/* Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{String(orderId).slice(0, 8)}...</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={[styles.status, { color: getStatusColor(order.status) }]}>
            {order.status?.replace(/_/g, ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Payment Status:</Text>
          <Text style={styles.value}>{order.payment_status?.toUpperCase()}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Total:</Text>
          <Text style={styles.value}>${(order.total || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Driver Location Map */}
      {driverLocation ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Location</Text>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: driverLocation.latitude,
              longitude: driverLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          >
            <Marker
              coordinate={{
                latitude: driverLocation.latitude,
                longitude: driverLocation.longitude,
              }}
              title="Driver Location"
              description="Current driver position"
            />
          </MapView>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Driver Location</Text>
          <Text style={styles.noLocationText}>
            {order.driver_id ? 'Waiting for driver location...' : 'Driver not yet assigned'}
          </Text>
        </View>
      )}

      {/* Status Timeline */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Status Timeline</Text>

        {statusList.slice(0, currentStatusIndex + 1).map((status, index) => (
          <View key={status} style={styles.timelineItem}>
            <View style={[styles.timelineCircle, { backgroundColor: getStatusColor(status) }]}>
              <Text style={styles.timelineCheckmark}>✓</Text>
            </View>
            <Text style={styles.timelineText}>{status.replace(/_/g, ' ').toUpperCase()}</Text>
          </View>
        ))}

        {currentStatusIndex < statusList.length - 1 && (
          <>
            {statusList.slice(currentStatusIndex + 1, Math.min(currentStatusIndex + 4, statusList.length)).map((status) => (
              <View key={status} style={styles.timelineItem}>
                <View style={[styles.timelineCircle, { backgroundColor: '#ddd' }]} />
                <Text style={styles.timelineTextGray}>{status.replace(/_/g, ' ').toUpperCase()}</Text>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push('/(app)/orders')}
      >
        <Text style={styles.buttonText}>Back to Orders</Text>
      </TouchableOpacity>

      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 50,
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  map: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  noLocationText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 40,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  timelineCheckmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  timelineTextGray: {
    fontSize: 14,
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  spacer: {
    height: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    fontWeight: 'bold',
  },
});
