import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Switch, FlatList, Alert } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';


const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';

export default function GoOnlineScreen() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [requestingPermission, setRequestingPermission] = useState(false);

  // Fetch driver profile
  const { data: driver, isLoading: driverLoading } = useQuery({
    queryKey: ['driver-profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      return data;
    },
  });

  // Fetch today's earnings
  const { data: todayStats } = useQuery({
    queryKey: ['today-earnings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { earnings: 0, orders: 0 };

      const today = new Date().toISOString().split('T')[0];
      const { data: orders } = await supabase
        .from('orders')
        .select('delivery_fee, status')
        .eq('driver_id', user.id)
        .gte('created_at', today);

      const completed = orders?.filter(o => o.status === 'delivered') || [];
      const earnings = completed.reduce((sum, order) => sum + (order.delivery_fee || 0), 0);

      return { earnings, orders: completed.length };
    },
    enabled: isOnline,
    refetchInterval: isOnline ? 30000 : false,
  });

  // Fetch available orders (only when online)
  const { data: availableOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending_dispatch')
        .order('created_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: isOnline,
    refetchInterval: isOnline ? 10000 : false,
  });

  const handleToggleOnline = async () => {
    if (!isOnline) {
      // Going online - need location permission
      setRequestingPermission(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('profiles')
            .update({ is_online: true })
            .eq('id', user.id);
          setIsOnline(true);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to go online');
      } finally {
        setRequestingPermission(false);
      }
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ is_online: false })
          .eq('id', user.id);
        setIsOnline(false);
      }
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('orders')
        .update({ 
          driver_id: user.id,
          status: 'accepted'
        })
        .eq('id', orderId);

      Alert.alert('Success', 'Order accepted!');
      router.push(`/active-order?orderId=${orderId}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to accept order');
    }
  };

  if (driverLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5A00" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-[#FF5A00]">
          <View className="flex-row justify-between items-start mb-3">
            <View>
              <Text className="text-white text-3xl font-bold">Drive</Text>
              <Text className="text-orange-100 text-sm">Hi {driver?.full_name?.split(' ')[0] || 'Driver'}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Ionicons name="person-circle" size={48} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* Online Toggle Card */}
          <View className={`p-6 rounded-lg border-2 flex-row justify-between items-center ${
            isOnline
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
          }`}>
            <View>
              <Text className={`text-sm font-semibold ${
                isOnline ? 'text-green-900 dark:text-green-300' : 'text-gray-700 dark:text-slate-300'
              }`}>
                Status
              </Text>
              <Text className={`text-2xl font-bold mt-1 ${
                isOnline ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-slate-400'
              }`}>
                {isOnline ? 'ONLINE' : 'OFFLINE'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              disabled={requestingPermission}
              ios_backgroundColor="#E5E7EB"
              trackColor={{ false: '#E5E7EB', true: '#86EFAC' }}
            />
          </View>

          {/* Today's Stats */}
          {isOnline && (
            <View className="space-y-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Today's Performance</Text>
              
              <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <Text className="text-blue-900 dark:text-blue-300 text-xs font-semibold">Earnings</Text>
                  <Text className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                    ${todayStats?.earnings?.toFixed(2) || '0.00'}
                  </Text>
                </View>

                <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <Text className="text-purple-900 dark:text-purple-300 text-xs font-semibold">Orders</Text>
                  <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                    {todayStats?.orders || 0}
                  </Text>
                </View>
              </View>

              <View className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-orange-900 dark:text-orange-300 text-xs font-semibold">Current Rating</Text>
                  <Ionicons name="star" size={20} color="#F59E0B" />
                </View>
                <Text className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  4.9 ★
                </Text>
                <Text className="text-xs text-orange-700 dark:text-orange-300 mt-1">(287 ratings)</Text>
              </View>
            </View>
          )}

          {/* Available Orders */}
          {isOnline && (
            <View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                {ordersLoading ? 'Loading Orders...' : `Available Orders (${availableOrders?.length || 0})`}
              </Text>

              {ordersLoading ? (
                <ActivityIndicator size="large" color="#FF5A00" />
              ) : availableOrders && availableOrders.length > 0 ? (
                <FlatList
                  data={availableOrders}
                  scrollEnabled={false}
                  keyExtractor={item => item.id}
                  renderItem={({ item: order }) => (
                    <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 mb-3">
                      <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1">
                          <Text className="text-gray-600 dark:text-slate-400 text-xs">Order ID</Text>
                          <Text className="text-gray-900 dark:text-white font-bold">
                            {order.id.slice(0, 8).toUpperCase()}
                          </Text>
                        </View>
                        <Text className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-semibold">
                          ${order.total?.toFixed(2) || '0.00'}
                        </Text>
                      </View>

                      <View className="space-y-2 mb-3 py-2 border-t border-gray-200 dark:border-slate-700">
                        <View className="flex-row items-center">
                          <Ionicons name="location" size={16} color="#FF5A00" />
                          <Text className="text-gray-700 dark:text-slate-300 text-sm ml-2 flex-1">
                            {order.special_instructions || 'Standard service'}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Ionicons name="time" size={16} color="#FF5A00" />
                          <Text className="text-gray-600 dark:text-slate-400 text-sm ml-2">
                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleAcceptOrder(order.id)}
                        className="bg-[#FF5A00] rounded-lg py-3"
                      >
                        <Text className="text-white font-bold text-center">Accept Order</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                />
              ) : (
                <View className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 items-center">
                  <Ionicons name="inbox" size={48} color="#D1D5DB" />
                  <Text className="text-gray-600 dark:text-slate-400 text-center mt-3">
                    No orders available right now
                  </Text>
                  <Text className="text-gray-500 dark:text-slate-500 text-xs text-center mt-1">
                    Check back soon for delivery requests
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Offline Message */}
          {!isOnline && (
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6 items-center">
              <Ionicons name="power" size={48} color="#3B82F6" />
              <Text className="text-blue-900 dark:text-blue-300 font-bold text-center mt-3">
                You're Offline
              </Text>
              <Text className="text-blue-700 dark:text-blue-300 text-sm text-center mt-2">
                Toggle the switch above to go online and start receiving delivery orders
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
