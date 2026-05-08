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
import { useQuery, useMutation } from '@tanstack/react-query';
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
import { getOrderById, updateOrderPayment } from '../../../packages/shared/orders';

export default function PaymentScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const [paymentSheetReady, setPaymentSheetReady] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Get Supabase URL and Stripe key from environment
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const stripePublishableKey =
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  // Fetch order
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!orderId,
  });

  // Update order after payment
  const updateOrderMutation = useMutation({
    mutationFn: () =>
      updateOrderPayment({
        orderId,
        paymentStatus: 'paid',
        status: 'pending_dispatch',
      }),
    onSuccess: () => {
      Alert.alert('Success', 'Payment completed!');
      router.replace(`/tracking?orderId=${orderId}`);
    },
    onError: (err) => {
      Alert.alert('Error', 'Failed to update order: ' + (err.message || 'Unknown error'));
    },
  });

  // Initialize PaymentSheet
  useEffect(() => {
    if (!order || !supabaseUrl || !stripePublishableKey) {
      return;
    }

    const initializePaymentSheet = async () => {
      try {
        // Call Supabase Edge Function to create payment intent
        const response = await fetch(
          `${supabaseUrl}/functions/v1/create-payment-intent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              amount: order.total,
              orderId,
            }),
          }
        );

        const paymentIntentData = await response.json();

        if (!response.ok) {
          throw new Error(paymentIntentData.error || 'Failed to create payment intent');
        }

        const { clientSecret } = paymentIntentData;

        // Initialize PaymentSheet
        const { error } = await initPaymentSheet({
          publishableKey: stripePublishableKey,
          merchantDisplayName: 'JiffyLaundry',
          paymentIntentClientSecret: clientSecret,
          allowsDelayedPaymentMethods: true,
        });

        if (error) {
          throw error;
        }

        setPaymentSheetReady(true);
      } catch (err) {
        Alert.alert('Error', err.message || 'Failed to initialize payment');
      }
    };

    initializePaymentSheet();
  }, [order, supabaseUrl, stripePublishableKey, orderId]);

  const handlePayment = async () => {
    if (!paymentSheetReady) {
      Alert.alert('Error', 'Payment is not ready');
      return;
    }

    setProcessing(true);

    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        Alert.alert('Payment Failed', error.message || 'Payment was cancelled');
        setProcessing(false);
        return;
      }

      // Payment successful - update order
      updateOrderMutation.mutate();
    } catch (err) {
      Alert.alert('Error', err.message || 'Payment failed');
      setProcessing(false);
    }
  };

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

  const isProcessing = processing || updateOrderMutation.isPending;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Complete Payment</Text>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Details</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Order ID:</Text>
          <Text style={styles.value}>{String(orderId).slice(0, 8)}...</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.amount}>${(order.total || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Status:</Text>
          <Text style={styles.status}>Awaiting Payment</Text>
        </View>
      </View>

      {/* Payment Breakdown */}
      <View style={styles.breakdownSection}>
        <Text style={styles.breakdownTitle}>Breakdown</Text>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Subtotal:</Text>
          <Text style={styles.breakdownValue}>${(order.subtotal || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Pickup Fee:</Text>
          <Text style={styles.breakdownValue}>${(order.pickup_fee || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Service Fee:</Text>
          <Text style={styles.breakdownValue}>${(order.service_fee || 0).toFixed(2)}</Text>
        </View>

        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tax:</Text>
          <Text style={styles.breakdownValue}>${(order.tax || 0).toFixed(2)}</Text>
        </View>

        {order.tip > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tip:</Text>
            <Text style={styles.breakdownValue}>${(order.tip || 0).toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.breakdownRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${(order.total || 0).toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Button */}
      {paymentSheetReady ? (
        <>
          <TouchableOpacity
            style={[styles.button, isProcessing && styles.buttonDisabled]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>
              {isProcessing ? 'Processing Payment...' : 'Pay Now'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={isProcessing}
          >
            <Text style={styles.backLink}>Back to Checkout</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Preparing payment...</Text>
        </View>
      )}

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
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF9500',
  },
  breakdownSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 10,
  },
  loadingContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  spacer: {
    height: 20,
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
