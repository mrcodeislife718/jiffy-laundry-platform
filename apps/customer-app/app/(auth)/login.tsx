import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) throw authError;
      router.replace('/(app)/home');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>🚀</Text>
        <Text style={styles.logoName}>Jiffy</Text>
        <Text style={styles.logoNameBold}>Laundry</Text>
      </View>

      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.subtitle}>Welcome back to Jiffy Laundry</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={LIGHT_GRAY}
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={LIGHT_GRAY}
        value={password}
        onChangeText={setPassword}
        editable={!loading}
        secureTextEntry
      />

      {error && <Text style={styles.error}>{error}</Text>}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={styles.link}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: BG,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 48,
    marginBottom: 8,
  },
  logoName: {
    fontSize: 24,
    color: DARK_TEXT,
  },
  logoNameBold: {
    fontSize: 24,
    fontWeight: 'bold',
    color: ORANGE,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: DARK_TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: LIGHT_GRAY,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 16,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: 'white',
    color: DARK_TEXT,
  },
  button: {
    backgroundColor: ORANGE,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: ORANGE,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  error: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 12,
  },
});
