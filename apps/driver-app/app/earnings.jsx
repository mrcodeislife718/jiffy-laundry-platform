import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

export default function EarningsScreen() {
  const router = useRouter();
  const [period, setPeriod] = 'today';

  // Fetch earnings data
  const { data: earningsData, isLoading } = useQuery({
    queryKey: ['earnings', period],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, orders: [], breakdown: {} };

      let startDate = new Date();
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setDate(1);
      }

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at, completed_at')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .gte('completed_at', startDate.toISOString())
        .order('completed_at', { ascending: false });

      const total = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
      
      return {
        total,
        orders: orders || [],
        breakdown: {
          pending: 0,
          processing: 0,
          completed: orders?.length || 0,
        },
      };
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#FF5A00" />
      </SafeAreaView>
    );
  }

  const periods = ['today', 'week', 'month'];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-[#FF5A00]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mt-2">Earnings</Text>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* Period Selector */}
          <View className="flex-row gap-2">
            {periods.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className={`flex-1 py-2 rounded-lg border ${
                  period === p
                    ? 'bg-[#FF5A00] border-[#FF5A00]'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                }`}
              >
                <Text className={`font-semibold text-center capitalize ${
                  period === p ? 'text-white' : 'text-gray-700 dark:text-slate-300'
                }`}>
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Total Earnings */}
          <View className="bg-gradient-to-r from-[#FF5A00] to-orange-600 rounded-lg p-6">
            <Text className="text-white/80 text-sm font-semibold">Total Earnings</Text>
            <Text className="text-white text-4xl font-bold mt-2">
              ${earningsData?.total?.toFixed(2) || '0.00'}
            </Text>
            <Text className="text-orange-100 text-sm mt-2">
              {earningsData?.breakdown?.completed || 0} deliveries completed
            </Text>
          </View>

          {/* Stats Cards */}
          <View className="space-y-3">
            <Text className="text-lg font-bold text-gray-900 dark:text-white">Breakdown</Text>
            
            <View className="flex-row gap-3">
              <View className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <Text className="text-green-900 dark:text-green-300 text-xs font-semibold">Completed</Text>
                <Text className="text-green-600 dark:text-green-400 font-bold text-2xl mt-1">
                  {earningsData?.breakdown?.completed || 0}
                </Text>
              </View>

              <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <Text className="text-blue-900 dark:text-blue-300 text-xs font-semibold">Avg/Order</Text>
                <Text className="text-blue-600 dark:text-blue-400 font-bold text-2xl mt-1">
                  ${earningsData?.breakdown?.completed > 0 
                    ? (earningsData.total / earningsData.breakdown.completed).toFixed(2)
                    : '0.00'
                  }
                </Text>
              </View>
            </View>
          </View>

          {/* Earnings History */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
              Order History ({earningsData?.orders?.length || 0})
            </Text>

            {earningsData?.orders && earningsData.orders.length > 0 ? (
              <FlatList
                data={earningsData.orders}
                scrollEnabled={false}
                keyExtractor={item => item.id}
                renderItem={({ item: order }) => (
                  <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 mb-2 flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="text-gray-600 dark:text-slate-400 text-xs">
                        {new Date(order.completed_at).toLocaleDateString()}
                      </Text>
                      <Text className="text-gray-900 dark:text-white font-semibold">
                        Order {order.id.slice(0, 8).toUpperCase()}
                      </Text>
                    </View>
                    <View className="items-end">
                      <View className="bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                        <Text className="text-green-700 dark:text-green-300 font-bold">
                          +${order.total?.toFixed(2)}
                        </Text>
                      </View>
                      <Text className="text-gray-500 dark:text-slate-500 text-xs mt-1">Completed</Text>
                    </View>
                  </View>
                )}
              />
            ) : (
              <View className="bg-gray-50 dark:bg-slate-800 rounded-lg p-6 items-center">
                <Ionicons name="briefcase-outline" size={48} color="#D1D5DB" />
                <Text className="text-gray-600 dark:text-slate-400 text-center mt-3">
                  No earnings yet for {period}
                </Text>
              </View>
            )}
          </View>

          {/* Payout Info */}
          <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-blue-900 dark:text-blue-300 font-bold">Next Payout</Text>
              <Ionicons name="information-circle" size={20} color="#3B82F6" />
            </View>
            <Text className="text-blue-800 dark:text-blue-200 text-sm">
              Scheduled for Friday, May 10th
            </Text>
            <Text className="text-blue-700 dark:text-blue-300 text-xs mt-2">
              Payouts are processed weekly to your bank account
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
