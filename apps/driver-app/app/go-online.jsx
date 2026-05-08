import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentProfile, updateDriverStatus, signOut } from '../../../packages/shared/auth';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  profileCard: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusOnline: {
    backgroundColor: '#34c759',
  },
  statusOffline: {
    backgroundColor: '#999',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  controlsContainer: {
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  statusButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusButtonActive: {
    backgroundColor: '#007aff',
    borderColor: '#007aff',
  },
  statusButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  signOutButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  signOutButtonText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 16,
  },
});

export default function GoOnlineScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentProfile = await getCurrentProfile();

        if (!currentProfile) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        if (currentProfile.role !== 'driver') {
          setError('Access Denied: Only drivers can access this app');
          setLoading(false);
          return;
        }

        setProfile(currentProfile);
        setError('');
      } catch (err) {
        setError('Failed to load profile: ' + (err.message || 'Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleGoOnline = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateDriverStatus('online');
      setProfile(updated);
      Alert.alert('Success', 'You are now online');
    } catch (err) {
      Alert.alert('Error', 'Failed to go online: ' + (err.message || 'Unknown error'));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleGoOffline = async () => {
    setStatusLoading(true);
    try {
      const updated = await updateDriverStatus('offline');
      setProfile(updated);
      Alert.alert('Success', 'You are now offline');
    } catch (err) {
      Alert.alert('Error', 'Failed to go offline: ' + (err.message || 'Unknown error'));
    } finally {
      setStatusLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (err) {
      Alert.alert('Error', 'Failed to sign out: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Access Denied</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isOnline = profile?.status === 'online';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Driver Status</Text>

        {/* Profile Info */}
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{profile?.full_name || 'Driver'}</Text>
          <Text style={styles.profileEmail}>{profile?.email}</Text>
          <Text style={styles.profilePhone}>{profile?.phone}</Text>

          <View style={styles.statusIndicator}>
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.statusOnline : styles.statusOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Status Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.statusButton,
              isOnline && styles.statusButtonActive,
            ]}
            onPress={handleGoOnline}
            disabled={statusLoading || isOnline}
          >
            {statusLoading && isOnline === false ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.statusButtonText,
                  isOnline && styles.statusButtonTextActive,
                ]}
              >
                Go Online
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusButton,
              !isOnline && styles.statusButtonActive,
            ]}
            onPress={handleGoOffline}
            disabled={statusLoading || !isOnline}
          >
            {statusLoading && isOnline === true ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={[
                  styles.statusButtonText,
                  !isOnline && styles.statusButtonTextActive,
                ]}
              >
                Go Offline
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
