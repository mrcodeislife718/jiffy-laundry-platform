import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getServices } from '../../../packages/shared/orders';

export default function PricingScreen() {
  const { data: services = [], isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: getServices,
  });

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Error loading services</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  const renderService = ({ item }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.servicePrice}>${item.price.toFixed(2)}</Text>
      </View>
      <View style={styles.serviceFooter}>
        <Text style={styles.serviceUnit}>Per {item.unit}</Text>
        <View style={[styles.badge, item.active ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.active ? 'Available' : 'Unavailable'}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Services & Pricing</Text>

      {services.length > 0 ? (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingBottom: 30 }}
        />
      ) : (
        <Text style={styles.emptyText}>No services available</Text>
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
  serviceCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceUnit: {
    fontSize: 14,
    color: '#666',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: '#e8f5e9',
  },
  badgeInactive: {
    backgroundColor: '#ffebee',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
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
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});
