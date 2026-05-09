import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';


export default function ActiveOrderScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['active-order', orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      return data;
    },
    enabled: !!orderId,
    refetchInterval: 5000,
  });

  const handlePickupComplete = async () => {
    Alert.alert('Confirm Pickup', 'Mark this order as picked up?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          await supabase
            .from('orders')
            .update({ status: 'on-delivery' })
            .eq('id', orderId);
          Alert.alert('Success', 'Order marked as picked up. Head to delivery location.');
        },
      },
    ]);
  };

  const handleDeliveryComplete = async () => {
    Alert.alert('Confirm Delivery', 'Mark this order as delivered?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          await supabase
            .from('orders')
            .update({ 
              status: 'delivered',
              completed_at: new Date().toISOString()
            })
            .eq('id', orderId);
          Alert.alert('Success', 'Order delivered! Earnings updated.');
          router.back();
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5A00" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
        <Text className="text-gray-900 dark:text-white text-lg">Order not found</Text>
      </SafeAreaView>
    );
  }

  const isPickedUp = order.status === 'on-delivery' || order.status === 'delivered';

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-[#FF5A00]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mt-2">Active Delivery</Text>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* Order Summary */}
          <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-gray-600 dark:text-slate-400 text-xs">Order ID</Text>
                <Text className="text-gray-900 dark:text-white font-bold text-lg">
                  {order.id.slice(0, 8).toUpperCase()}
                </Text>
              </View>
              <View className="bg-blue-100 dark:bg-blue-900/40 px-3 py-1 rounded-full">
                <Text className="text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  {order.status.toUpperCase()}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 dark:text-slate-300 text-sm mb-3">
              {order.special_instructions || 'Standard laundry service'}
            </Text>
            <View className="flex-row justify-between items-end pt-3 border-t border-gray-200 dark:border-slate-700">
              <Text className="text-gray-600 dark:text-slate-400 text-sm">Delivery Fee</Text>
              <Text className="text-[#FF5A00] font-bold text-2xl">
                ${order.total?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </View>

          {/* Status Progress */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Delivery Progress</Text>
            
            <View className="space-y-4">
              {/* Pickup */}
              <View className="flex-row items-start">
                <View className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                  isPickedUp
                    ? 'bg-[#FF5A00] border-[#FF5A00]'
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                }`}>
                  <Ionicons 
                    name={isPickedUp ? 'checkmark' : 'bag'} 
                    size={24} 
                    color={isPickedUp ? 'white' : '#9CA3AF'}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className={`font-bold ${isPickedUp ? 'text-[#FF5A00]' : 'text-gray-900 dark:text-white'}`}>
                    Pickup from Laundromat
                  </Text>
                  <Text className="text-gray-600 dark:text-slate-400 text-sm">
                    Collect the order items
                  </Text>
                </View>
              </View>

              {/* Divider */}
              {isPickedUp && <View className="h-6 ml-6 w-1 bg-[#FF5A00]" />}

              {/* Delivery */}
              <View className="flex-row items-start">
                <View className={`w-12 h-12 rounded-full items-center justify-center border-2 ${
                  order.status === 'delivered'
                    ? 'bg-green-500 border-green-500'
                    : isPickedUp
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                }`}>
                  <Ionicons 
                    name={order.status === 'delivered' ? 'checkmark-done' : isPickedUp ? 'car' : 'location'} 
                    size={24} 
                    color={isPickedUp ? 'white' : '#9CA3AF'}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <Text className={`font-bold ${isPickedUp ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                    Deliver to Customer
                  </Text>
                  <Text className="text-gray-600 dark:text-slate-400 text-sm">
                    {isPickedUp ? 'On the way to delivery address' : 'Awaiting pickup'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Customer Info */}
          <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Customer Info</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Customer</Text>
                <Text className="font-semibold text-gray-900 dark:text-white">John Doe</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Phone</Text>
                <TouchableOpacity>
                  <Text className="text-[#FF5A00] font-semibold">+1 (555) 123-4567</Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Address</Text>
                <Text className="font-semibold text-gray-900 dark:text-white text-right max-w-[60%]">
                  123 Main St, Apt 4B
                </Text>
              </View>
            </View>

            <TouchableOpacity className="mt-4 border border-[#FF5A00] rounded-lg py-2 px-3 flex-row items-center justify-center">
              <Ionicons name="call" size={16} color="#FF5A00" />
              <Text className="text-[#FF5A00] font-semibold ml-2">Call Customer</Text>
            </TouchableOpacity>
          </View>

          {/* Special Instructions */}
          {order.special_instructions && (
            <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
              <View className="flex-row items-start">
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
                <View className="ml-3 flex-1">
                  <Text className="text-yellow-900 dark:text-yellow-300 font-semibold text-sm">
                    Special Instructions
                  </Text>
                  <Text className="text-yellow-800 dark:text-yellow-200 text-sm mt-1">
                    {order.special_instructions}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="space-y-3">
            {!isPickedUp && (
              <TouchableOpacity
                onPress={handlePickupComplete}
                className="bg-[#FF5A00] rounded-lg py-3"
              >
                <Text className="text-white font-bold text-center">Picked Up - Ready to Deliver</Text>
              </TouchableOpacity>
            )}

            {isPickedUp && order.status !== 'delivered' && (
              <TouchableOpacity
                onPress={handleDeliveryComplete}
                className="bg-green-500 rounded-lg py-3"
              >
                <Text className="text-white font-bold text-center">Delivered - Complete Order</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity className="border-2 border-red-500 rounded-lg py-3">
              <Text className="text-red-500 font-bold text-center">Report Issue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
