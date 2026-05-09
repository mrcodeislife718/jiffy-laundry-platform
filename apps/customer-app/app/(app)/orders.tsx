import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const statusColors = {
  'pending': '#9CA3AF',
  'accepted': '#3B82F6',
  'processing': '#F59E0B',
  'on-delivery': '#8B5CF6',
  'delivered': '#10B981',
  'cancelled': '#EF4444',
};

const statusLabels = {
  'pending': 'Pending',
  'accepted': 'Accepted',
  'processing': 'Processing',
  'on-delivery': 'On Delivery',
  'delivered': 'Delivered',
  'cancelled': 'Cancelled',
};

export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const statusMap = {
    'all': [],
    'active': ['pending', 'accepted', 'processing', 'on-delivery'],
    'completed': ['delivered'],
    'cancelled': ['cancelled'],
  };

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', activeTab],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      let query = supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });

      if (statusMap[activeTab]?.length > 0) {
        query = query.in('status', statusMap[activeTab]);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      {/* Header */}
      <View className="px-6 py-4 bg-[#FF5A00]">
        <Text className="text-white text-3xl font-bold">My Orders</Text>
        <Text className="text-orange-100 text-sm">Track all your laundry orders</Text>
      </View>

      {/* Filter Tabs */}
      <View className="flex-row px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        {['all', 'active', 'completed', 'cancelled'].map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full mr-2 ${
              activeTab === tab
                ? 'bg-[#FF5A00]'
                : 'bg-gray-200 dark:bg-slate-700'
            }`}
          >
            <Text className={`font-semibold capitalize text-sm ${
              activeTab === tab ? 'text-white' : 'text-gray-700 dark:text-slate-300'
            }`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#FF5A00" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="inbox" size={64} color="#D1D5DB" />
          <Text className="text-xl font-bold text-gray-900 dark:text-white mt-4 text-center">
            No {activeTab === 'all' ? '' : activeTab} orders yet
          </Text>
          <Text className="text-gray-600 dark:text-slate-400 text-center mt-2 mb-6">
            {activeTab === 'all' 
              ? 'Create your first order to get started'
              : `No ${activeTab} orders at this time`
            }
          </Text>
          {activeTab === 'all' && (
            <Link href="/create-order" asChild>
              <TouchableOpacity className="bg-[#FF5A00] rounded-lg px-6 py-3">
                <Text className="text-white font-bold">Create Order</Text>
              </TouchableOpacity>
            </Link>
          )}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={item => item.id}
          renderItem={({ item: order }) => (
            <Link href={`/tracking?orderId=${order.id}`} asChild>
              <TouchableOpacity className="px-6 py-3 border-b border-gray-200 dark:border-slate-700 active:bg-gray-50 dark:active:bg-slate-800">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="text-gray-600 dark:text-slate-400 text-xs">Order ID</Text>
                    <Text className="text-gray-900 dark:text-white font-bold">
                      {order.id.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: statusColors[order.status] }}
                  >
                    <Text className="text-white text-xs font-bold">
                      {statusLabels[order.status]}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-gray-700 dark:text-slate-300 text-sm capitalize mb-1">
                      {order.service_type?.replace('-', ' ')}
                    </Text>
                    <Text className="text-gray-500 dark:text-slate-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[#FF5A00] font-bold text-lg">
                      ${order.total?.toFixed(2) || '0.00'}
                    </Text>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF5A00" />
          }
          scrollEnabled={true}
          ListEmptyComponent={null}
        />
      )}
    </SafeAreaView>
  );
}
