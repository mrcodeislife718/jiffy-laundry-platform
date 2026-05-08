import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI, profileAPI } from '@jiffylaundry/shared';

export default function HomeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await authAPI.getSession();
        if (data.session?.user) {
          const { data: profile } = await profileAPI.getProfile(data.session.user.id);
          setUserName(profile?.full_name || 'Customer');
        }
      } catch (err) {
        router.replace('/(auth)/login');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.welcome}>Welcome, {userName}!</Text>

      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/create-order')}
        >
          <Text style={styles.actionTitle}>📝</Text>
          <Text style={styles.actionLabel}>New Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(app)/pricing')}
        >
          <Text style={styles.actionTitle}>💰</Text>
          <Text style={styles.actionLabel}>Services</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(app)/orders')}
        >
          <Text style={styles.actionTitle}>📦</Text>
          <Text style={styles.actionLabel}>My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(app)/profile')}
        >
          <Text style={styles.actionTitle}>👤</Text>
          <Text style={styles.actionLabel}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/addresses')}
        >
          <Text style={styles.actionTitle}>📍</Text>
          <Text style={styles.actionLabel}>Addresses</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={async () => {
          await authAPI.signOut();
          router.replace('/(auth)/login');
        }}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 50,
    marginHorizontal: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  actionCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '45%',
  },
  actionTitle: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
