import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@jiffylaundry/shared';

export default function DriverLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      
      // Check if user is a driver
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role !== 'driver') {
        await supabase.auth.signOut();
        throw new Error('Only drivers can access this app');
      }
      
      router.replace('/go-online');
    } catch (err) {
      setError(err.message || 'Login failed');
      Alert.alert('Login Error', err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo Section */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-[#FF5A00] rounded-full items-center justify-center mb-4">
            <Ionicons name="car" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">JiffyLaundry</Text>
          <Text className="text-gray-600 dark:text-slate-400 text-sm mt-2">Driver App</Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-600 dark:text-red-300 ml-2 flex-1">{error}</Text>
            </View>
          </View>
        )}

        {/* Email Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-slate-300 font-semibold text-sm mb-2">Email</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-slate-600 rounded-lg px-3 bg-white dark:bg-slate-800">
            <Ionicons name="mail" size={20} color="#FF5A00" />
            <TextInput
              className="flex-1 py-3 ml-2 text-gray-900 dark:text-white"
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Input */}
        <View className="mb-4">
          <Text className="text-gray-700 dark:text-slate-300 font-semibold text-sm mb-2">Password</Text>
          <View className="flex-row items-center border border-gray-300 dark:border-slate-600 rounded-lg px-3 bg-white dark:bg-slate-800">
            <Ionicons name="lock-closed" size={20} color="#FF5A00" />
            <TextInput
              className="flex-1 py-3 ml-2 text-gray-900 dark:text-white"
              placeholder="Enter your password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={20} 
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password Link */}
        <TouchableOpacity className="mb-6">
          <Text className="text-[#FF5A00] font-semibold text-sm text-right">
            Forgot Password?
          </Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          className={`py-3 rounded-lg items-center flex-row justify-center ${
            loading
              ? 'bg-gray-400 dark:bg-gray-600'
              : 'bg-[#FF5A00]'
          }`}
        >
          {loading ? (
            <>
              <ActivityIndicator color="white" size="small" />
              <Text className="text-white font-bold ml-2">Signing in...</Text>
            </>
          ) : (
            <Text className="text-white font-bold text-lg">Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Sign Up Link */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600 dark:text-slate-400">Don't have an account? </Text>
          <TouchableOpacity>
            <Text className="text-[#FF5A00] font-bold">Sign Up</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
          <Text className="text-gray-600 dark:text-slate-400 text-xs text-center">
            Need help? Contact our support team at{'\n'}
            <Text className="text-[#FF5A00] font-semibold">support@jiffylaundry.com</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
