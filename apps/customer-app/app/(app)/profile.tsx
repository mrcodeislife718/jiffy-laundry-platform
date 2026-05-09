'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const DANGER = '#ef4444';

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      setProfile(profileData);

      const { data: addressesData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', authUser.id)
        .order('is_default', { ascending: false });
      setAddresses(addressesData || []);
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          } catch (err) {
            Alert.alert('Error', 'Failed to logout');
          }
        },
      },
    ]);
  };

  const setDefaultAddress = async (addressId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      // Unset all defaults
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', authUser!.id);

      // Set new default
      await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      // Reload
      loadProfile();
    } catch (err) {
      Alert.alert('Error', 'Failed to update address');
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
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Profile Card */}
      {profile && (
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>👤</Text>
          </View>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.email}>{profile.email}</Text>
          <Text style={styles.phone}>{profile.phone || 'No phone'}</Text>
          <View style={styles.roleContainer}>
            <Text style={styles.role}>{profile.role?.toUpperCase()}</Text>
          </View>
        </View>
      )}

      {/* Personal Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{profile?.full_name}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{profile?.phone || '—'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {new Date(profile?.created_at).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Saved Addresses */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Saved Addresses</Text>
          <TouchableOpacity>
            <Text style={styles.addLink}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>No saved addresses</Text>
          </View>
        ) : (
          addresses.map(addr => (
            <View key={addr.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>
                  {addr.is_default ? '⭐ ' : ''}
                  {addr.street}
                </Text>
                {!addr.is_default && (
                  <TouchableOpacity onPress={() => setDefaultAddress(addr.id)}>
                    <Text style={styles.setDefault}>Set Default</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.addressDetail}>
                {addr.city}, {addr.state} {addr.zip}
              </Text>
            </View>
          ))
        )}
      </View>

      {/* Quick Links */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Help & Support</Text>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>💬 Contact Support</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>❓ FAQ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.link}>
          <Text style={styles.linkText}>📋 Terms & Privacy</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
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
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: ORANGE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 40,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    color: LIGHT_GRAY,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    color: LIGHT_GRAY,
    marginBottom: 12,
  },
  roleContainer: {
    backgroundColor: ORANGE,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  role: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  addLink: {
    color: ORANGE,
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: DARK_TEXT,
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: LIGHT_GRAY,
  },
  addressCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_TEXT,
    flex: 1,
  },
  setDefault: {
    color: ORANGE,
    fontSize: 11,
    fontWeight: '600',
  },
  addressDetail: {
    fontSize: 12,
    color: LIGHT_GRAY,
  },
  link: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: DANGER,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  logoutText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
