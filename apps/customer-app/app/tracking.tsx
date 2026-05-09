import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const statusSteps = ['pending', 'accepted', 'processing', 'on-delivery', 'delivered'];

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return '#6B7280';
    case 'accepted':
      return '#3B82F6';
    case 'processing':
      return '#F59E0B';
    case 'on-delivery':
      return '#8B5CF6';
    case 'delivered':
      return '#10B981';
    default:
      return '#6B7280';
  }
};

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending':
      return 'time';
    case 'accepted':
      return 'checkmark-circle';
    case 'processing':
      return 'settings';
    case 'on-delivery':
      return 'car';
    case 'delivered':
      return 'checkmark-done-circle';
    default:
      return 'help-circle';
  }
};

export default function TrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .single();
      return data;
    },
    enabled: !!orderId,
  });

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

  const hours24deadline = new Date(order.created_at).getTime() + 24 * 60 * 60 * 1000;
  const now = Date.now();
  const hoursRemaining = Math.max(0, (hours24deadline - now) / (1000 * 60 * 60));
  const percentComplete = Math.min(100, (statusSteps.indexOf(order.status) / statusSteps.length) * 100);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-[#FF5A00]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="mt-3 flex-row justify-between items-start">
            <View>
              <Text className="text-white/80 text-sm">Order ID</Text>
              <Text className="text-white text-2xl font-bold">{order.id.slice(0, 8).toUpperCase()}</Text>
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white font-semibold text-sm">{order.status.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* 24HR SLA Countdown */}
          <View className={`p-4 rounded-lg border ${
            hoursRemaining > 6 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
              : hoursRemaining > 2
              ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
          }`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className={`text-sm font-semibold ${
                  hoursRemaining > 6 ? 'text-green-900 dark:text-green-300' : 
                  hoursRemaining > 2 ? 'text-yellow-900 dark:text-yellow-300' : 
                  'text-red-900 dark:text-red-300'
                }`}>
                  24 HRS OR IT'S FREE
                </Text>
                <Text className={`text-2xl font-bold mt-1 ${
                  hoursRemaining > 6 ? 'text-green-900 dark:text-green-200' : 
                  hoursRemaining > 2 ? 'text-yellow-900 dark:text-yellow-200' : 
                  'text-red-900 dark:text-red-200'
                }`}>
                  {Math.floor(hoursRemaining)}h {Math.floor((hoursRemaining % 1) * 60)}m
                </Text>
              </View>
              <Ionicons 
                name="time" 
                size={48} 
                color={hoursRemaining > 6 ? '#10b981' : hoursRemaining > 2 ? '#f59e0b' : '#ef4444'} 
              />
            </View>
            <View className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-3 overflow-hidden">
              <View 
                className={`h-full ${hoursRemaining > 6 ? 'bg-green-500' : hoursRemaining > 2 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${percentComplete}%` }}
              />
            </View>
          </View>

          {/* Status Timeline */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Status Timeline</Text>
            {statusSteps.map((step, idx) => {
              const isCompleted = statusSteps.indexOf(order.status) >= idx;
              const isCurrent = order.status === step;

              return (
                <View key={step} className="mb-4">
                  <View className="flex-row items-start">
                    <View className="items-center mr-3">
                      <View className={`w-10 h-10 rounded-full justify-center items-center border-2 ${
                        isCompleted 
                          ? 'bg-[#FF5A00] border-[#FF5A00]'
                          : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600'
                      }`}>
                        <Ionicons 
                          name={getStatusIcon(step)} 
                          size={20} 
                          color={isCompleted ? 'white' : '#9CA3AF'}
                        />
                      </View>
                      {idx < statusSteps.length - 1 && (
                        <View className={`w-1 h-8 mt-1 ${isCompleted ? 'bg-[#FF5A00]' : 'bg-gray-300 dark:bg-slate-600'}`} />
                      )}
                    </View>
                    <View className="flex-1 pt-1">
                      <Text className={`font-semibold capitalize ${
                        isCurrent 
                          ? 'text-[#FF5A00]' 
                          : isCompleted 
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-slate-500'
                      }`}>
                        {step.replace('-', ' ')}
                      </Text>
                      {isCurrent && (
                        <Text className="text-xs text-[#FF5A00] font-semibold mt-1">In Progress</Text>
                      )}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Order Details */}
          <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Order Details</Text>
            
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Service</Text>
                <Text className="font-semibold text-gray-900 dark:text-white capitalize">{order.service_type?.replace('-', ' ')}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Items</Text>
                <Text className="font-semibold text-gray-900 dark:text-white">
                  {order.order_items?.length || 0} items
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600 dark:text-slate-400">Total</Text>
                <Text className="font-bold text-[#FF5A00] text-lg">${order.total?.toFixed(2)}</Text>
              </View>
            </View>

            {order.special_instructions && (
              <View className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <Text className="text-sm text-gray-600 dark:text-slate-400 mb-2">Special Instructions</Text>
                <Text className="text-gray-900 dark:text-white">{order.special_instructions}</Text>
              </View>
            )}
          </View>

          {/* Driver Info (if assigned) */}
          {order.driver_id && (
            <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <Text className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-3">Driver Assigned</Text>
              <View className="flex-row justify-between items-center mb-3">
                <View>
                  <Text className="font-semibold text-gray-900 dark:text-white">Driver #{order.driver_id.slice(0, 6)}</Text>
                  <Text className="text-sm text-gray-600 dark:text-slate-400">★ 4.9 (187 reviews)</Text>
                </View>
              </View>
              <View className="flex-row gap-2">
                <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2">
                  <Text className="text-white font-semibold text-center text-sm">Call Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-blue-500 rounded-lg py-2">
                  <Text className="text-white font-semibold text-center text-sm">Message</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Action Button */}
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <TouchableOpacity className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
              <Text className="text-red-700 dark:text-red-300 font-semibold text-center">Report Issue</Text>
            </TouchableOpacity>
          )}

          {order.status === 'delivered' && (
            <TouchableOpacity className="bg-[#FF5A00] rounded-lg p-3">
              <Text className="text-white font-semibold text-center">Rate This Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
