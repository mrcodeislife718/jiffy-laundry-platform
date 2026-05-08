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
  Switch,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '@jiffylaundry/shared';
import {
  getUserAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../../../packages/shared/addresses';

export default function AddressesScreen() {
  const [userId, setUserId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    is_default: false,
  });
  const queryClient = useQueryClient();

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await authAPI.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to load user');
      }
    };
    loadUser();
  }, []);

  // Fetch addresses
  const { data: addresses = [], isLoading, error } = useQuery({
    queryKey: ['addresses', userId],
    queryFn: () => getUserAddresses(userId),
    enabled: !!userId,
  });

  // Create address mutation
  const createMutation = useMutation({
    mutationFn: (payload) => createAddress(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      setFormData({ street: '', city: '', state: '', zip: '', is_default: false });
      setShowForm(false);
      Alert.alert('Success', 'Address added');
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to create address');
    },
  });

  // Update address mutation (for setting default)
  const updateMutation = useMutation({
    mutationFn: (payload) => updateAddress(payload.id, { is_default: payload.is_default }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to update address');
    },
  });

  // Delete address mutation
  const deleteMutation = useMutation({
    mutationFn: (addressId) => deleteAddress(addressId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses', userId] });
      Alert.alert('Success', 'Address deleted');
    },
    onError: (err) => {
      Alert.alert('Error', err.message || 'Failed to delete address');
    },
  });

  const handleAddAddress = async () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zip) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    createMutation.mutate({
      user_id: userId,
      ...formData,
    });
  };

  const handleSetDefault = (address) => {
    updateMutation.mutate({
      id: address.id,
      is_default: !address.is_default,
    });
  };

  const handleDeleteAddress = (addressId) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(addressId),
      },
    ]);
  };

  const renderAddressCard = ({ item }) => (
    <View style={[styles.addressCard, item.is_default && styles.defaultAddress]}>
      <View style={styles.addressContent}>
        <Text style={styles.addressStreet}>{item.street}</Text>
        <Text style={styles.addressCity}>
          {item.city}, {item.state} {item.zip}
        </Text>
        {item.is_default && <Text style={styles.defaultBadge}>Default Address</Text>}
      </View>

      <View style={styles.addressActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleSetDefault(item)}
          disabled={updateMutation.isPending}
        >
          <Text style={styles.actionText}>
            {item.is_default ? '★' : '☆'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteAddress(item.id)}
          disabled={deleteMutation.isPending}
        >
          <Text style={styles.actionText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading || !userId) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading addresses</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Addresses</Text>

      {addresses.length > 0 ? (
        <FlatList
          data={addresses}
          renderItem={renderAddressCard}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ marginBottom: 20 }}
        />
      ) : (
        <Text style={styles.emptyText}>No addresses saved yet</Text>
      )}

      {showForm ? (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Add New Address</Text>

          <TextInput
            style={styles.input}
            placeholder="Street Address"
            value={formData.street}
            onChangeText={(text) => setFormData({ ...formData, street: text })}
            editable={!createMutation.isPending}
          />

          <TextInput
            style={styles.input}
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
            editable={!createMutation.isPending}
          />

          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.flex]}
              placeholder="State"
              value={formData.state}
              onChangeText={(text) => setFormData({ ...formData, state: text })}
              editable={!createMutation.isPending}
            />
            <TextInput
              style={[styles.input, styles.flex]}
              placeholder="ZIP"
              value={formData.zip}
              onChangeText={(text) => setFormData({ ...formData, zip: text })}
              editable={!createMutation.isPending}
            />
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Set as default address</Text>
            <Switch
              value={formData.is_default}
              onValueChange={(val) => setFormData({ ...formData, is_default: val })}
              disabled={createMutation.isPending}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, createMutation.isPending && styles.buttonDisabled]}
            onPress={handleAddAddress}
            disabled={createMutation.isPending}
          >
            <Text style={styles.buttonText}>
              {createMutation.isPending ? 'Saving...' : 'Save Address'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setShowForm(false)}
            disabled={createMutation.isPending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, styles.addButton]}
          onPress={() => setShowForm(true)}
        >
          <Text style={styles.buttonText}>+ Add Address</Text>
        </TouchableOpacity>
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
  addressCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#ddd',
  },
  defaultAddress: {
    borderLeftColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  addressContent: {
    flex: 1,
  },
  addressStreet: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  defaultBadge: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8e8e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionText: {
    fontSize: 18,
  },
  formContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  addButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    fontWeight: 'bold',
  },
});
