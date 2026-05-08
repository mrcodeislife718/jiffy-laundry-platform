import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { authAPI } from '@jiffylaundry/shared';
import { getServices, createOrderWithItems } from '../../../packages/shared/orders';
import { getUserAddresses } from '../../../packages/shared/addresses';

export default function CreateOrderScreen() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [tip, setTip] = useState('0');
  const [showSummary, setShowSummary] = useState(false);

  // Fee formula constants
  const PICKUP_FEE = 2.0;
  const SERVICE_FEE_PERCENT = 0.08;
  const TAX_PERCENT = 0.08875;

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await authAPI.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
        } else {
          router.replace('/(auth)/login');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user');
        router.replace('/(auth)/login');
      }
    };
    loadUser();
  }, []);

  // Fetch services
  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  // Fetch user's addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => getUserAddresses(userId),
    enabled: !!userId,
  });

  // Set default address
  useEffect(() => {
    if (addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setDefaultAddress(defaultAddr);
    }
  }, [addresses]);

  // Calculate totals
  const calculateTotals = () => {
    let subtotal = 0;
    const items = [];

    Object.entries(quantities).forEach(([serviceId, quantity]) => {
      if (quantity > 0) {
        const service = services.find((s) => s.id === serviceId);
        if (service) {
          const lineTotal = service.price * quantity;
          subtotal += lineTotal;
          items.push({
            service_id: serviceId,
            service_name: service.name,
            quantity: parseInt(quantity),
            unit: service.unit,
            unit_price: service.price,
            line_total: lineTotal,
          });
        }
      }
    });

    const pickupFee = PICKUP_FEE;
    const serviceFee = subtotal * SERVICE_FEE_PERCENT;
    const tax = subtotal * TAX_PERCENT;
    const tipAmount = parseFloat(tip) || 0;
    const total = subtotal + pickupFee + serviceFee + tax + tipAmount;

    return {
      subtotal,
      pickupFee,
      serviceFee,
      tax,
      tip: tipAmount,
      total,
      items,
    };
  };

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      if (!defaultAddress) {
        throw new Error('Please add an address first');
      }

      if (selectedItems.length === 0) {
        throw new Error('Please select at least one service');
      }

      const totals = calculateTotals();

      const orderPayload = {
        customer_id: userId,
        pickup_address_id: defaultAddress.id,
        status: 'pending_payment',
        payment_status: 'unpaid',
        subtotal: totals.subtotal,
        pickup_fee: totals.pickupFee,
        service_fee: totals.serviceFee,
        tax: totals.tax,
        tip: totals.tip,
        total: totals.total,
      };

      const result = await createOrderWithItems({
        orderPayload,
        items: totals.items,
      });

      return result;
    },
    onSuccess: (order) => {
      router.push(`/checkout?orderId=${order.id}`);
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to create order');
    },
  });

  const handleSelectService = (serviceId) => {
    if (selectedItems.includes(serviceId)) {
      setSelectedItems(selectedItems.filter((id) => id !== serviceId));
      setQuantities({ ...quantities, [serviceId]: 0 });
    } else {
      setSelectedItems([...selectedItems, serviceId]);
      setQuantities({ ...quantities, [serviceId]: 1 });
    }
  };

  const handleQuantityChange = (serviceId, quantity) => {
    const q = parseInt(quantity) || 0;
    if (q === 0) {
      setSelectedItems(selectedItems.filter((id) => id !== serviceId));
    } else {
      if (!selectedItems.includes(serviceId)) {
        setSelectedItems([...selectedItems, serviceId]);
      }
    }
    setQuantities({ ...quantities, [serviceId]: q });
  };

  const handleCreateOrder = async () => {
    createOrderMutation.mutate();
  };

  if (servicesLoading || addressesLoading || !userId || !defaultAddress) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (servicesError) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading services</Text>
      </View>
    );
  }

  const totals = calculateTotals();
  const hasItems = selectedItems.length > 0;

  const renderService = ({ item }) => {
    const isSelected = selectedItems.includes(item.id);
    const quantity = quantities[item.id] || 0;

    return (
      <View style={[styles.serviceItem, isSelected && styles.selectedService]}>
        <TouchableOpacity
          style={styles.serviceSelect}
          onPress={() => handleSelectService(item.id)}
        >
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{item.name}</Text>
            <Text style={styles.servicePrice}>
              ${item.price.toFixed(2)} per {item.unit}
            </Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.quantityControl}>
            <TextInput
              style={styles.quantityInput}
              placeholder="Qty"
              value={String(quantity)}
              onChangeText={(text) => handleQuantityChange(item.id, text)}
              keyboardType="decimal-pad"
            />
            <Text style={styles.quantityLabel}>{item.unit}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Order</Text>

      <View style={styles.addressSection}>
        <Text style={styles.sectionTitle}>Pickup Address</Text>
        <View style={styles.addressCard}>
          <Text style={styles.addressStreet}>{defaultAddress.street}</Text>
          <Text style={styles.addressCity}>
            {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/addresses')}>
          <Text style={styles.changeLink}>Change Address</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Select Services</Text>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ marginBottom: 20 }}
      />

      {hasItems && (
        <>
          <View style={styles.summarySection}>
            <Text style={styles.sectionTitle}>Order Summary</Text>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Subtotal:</Text>
              <Text style={styles.value}>${totals.subtotal.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Pickup Fee:</Text>
              <Text style={styles.value}>${totals.pickupFee.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Service Fee (8%):</Text>
              <Text style={styles.value}>${totals.serviceFee.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.label}>Tax (8.875%):</Text>
              <Text style={styles.value}>${totals.tax.toFixed(2)}</Text>
            </View>

            <View style={styles.tipRow}>
              <Text style={styles.label}>Tip:</Text>
              <TextInput
                style={styles.tipInput}
                placeholder="$0.00"
                value={tip}
                onChangeText={setTip}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>${totals.total.toFixed(2)}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, createOrderMutation.isPending && styles.buttonDisabled]}
            onPress={handleCreateOrder}
            disabled={createOrderMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createOrderMutation.isPending ? 'Creating Order...' : 'Continue to Checkout'}
            </Text>
          </TouchableOpacity>
        </>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 20,
  },
  addressSection: {
    marginBottom: 20,
  },
  addressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  addressStreet: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
  },
  changeLink: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
  },
  serviceItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  selectedService: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  serviceSelect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  quantityInput: {
    width: 60,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  quantityLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
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
    marginBottom: 10,
  },
  tipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  tipInput: {
    width: 80,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  totalRow: {
    borderTopWidth: 2,
    borderTopColor: '#ddd',
    paddingTopMargin: 10,
    marginTop: 10,
    paddingTop: 10,
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
    marginBottom: 30,
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    fontWeight: 'bold',
  },
});
