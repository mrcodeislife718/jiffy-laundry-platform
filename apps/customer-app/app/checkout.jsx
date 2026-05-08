import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { getOrderById } from '../../../packages/shared/orders';

export default function CheckoutScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  // Fetch order by ID
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

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
        <Text style={styles.errorDetail}>{error?.message || 'Order not found'}</Text>
      </View>
    );
  }

  const handleContinuePayment = () => {
    router.push(`/payment?orderId=${orderId}`);
  };

  const renderLineItem = ({ item }) => (
    <View key={item.id} style={styles.lineItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.service_name}</Text>
        <Text style={styles.itemQuantity}>
          {item.quantity} {item.unit}
        </Text>
      </View>
      <Text style={styles.itemTotal}>${(item.line_total || 0).toFixed(2)}</Text>
    </View>
  );

  const orderItems = order.order_items || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Order Review</Text>

      {/* Order ID */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Information</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{orderId.slice(0, 8)}...</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.value}>{order.status || 'pending_payment'}</Text>
        </View>
      </View>

      {/* Pickup Address */}
      {order.addresses && order.addresses.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup Address</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressStreet}>{order.addresses[0].street}</Text>
            <Text style={styles.addressCity}>
              {order.addresses[0].city}, {order.addresses[0].state} {order.addresses[0].zip}
            </Text>
          </View>
        </View>
      )}

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Services</Text>
        {orderItems.length > 0 ? (
          orderItems.map(renderLineItem)
        ) : (
          <Text style={styles.emptyText}>No items</Text>
        )}
      </View>

      {/* Pricing Breakdown */}
      <View style={styles.summarySection}>
        <View style={styles.summaryRow}>
          <Text style={styles.label}>Subtotal:</Text>
          <Text style={styles.value}>${(order.subtotal || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Pickup Fee:</Text>
          <Text style={styles.value}>${(order.pickup_fee || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Service Fee:</Text>
          <Text style={styles.value}>${(order.service_fee || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.label}>Tax:</Text>
          <Text style={styles.value}>${(order.tax || 0).toFixed(2)}</Text>
        </View>

        {order.tip > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Tip:</Text>
            <Text style={styles.value}>${(order.tip || 0).toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>${(order.total || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Continue Payment Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinuePayment}>
        <Text style={styles.buttonText}>Continue to Payment</Text>
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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
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
  addressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  addressStreet: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 12,
    color: '#999',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  summarySection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    fontWeight: 'bold',
  },
  errorDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
});
