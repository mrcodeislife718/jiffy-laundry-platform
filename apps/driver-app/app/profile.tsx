import { View, Text, ScrollView, SafeAreaView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

export default function ProfileScreen() {
  const router = useRouter();

  // Fetch driver profile
  const { data: profile, isLoading } = useQuery({
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

  // Fetch driver stats
  const { data: stats } = useQuery({
    queryKey: ['driver-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { totalOrders: 0, totalEarnings: 0, rating: 4.9 };

      const { data: orders } = await supabase
        .from('orders')
        .select('total, status')
        .eq('driver_id', user.id)
        .eq('status', 'delivered');

      const total = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      return {
        totalOrders: orders?.length || 0,
        totalEarnings: total,
        rating: 4.9,
      };
    },
  });

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
        style: 'destructive',
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

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-6 py-4 bg-[#FF5A00]">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold mt-2">Profile</Text>
        </View>

        <View className="px-6 py-6 space-y-6">
          {/* Profile Card */}
          <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <View className="items-center mb-4">
              <View className="w-20 h-20 rounded-full bg-[#FF5A00] items-center justify-center mb-3">
                <Ionicons name="person" size={40} color="white" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile?.full_name || 'Driver'}
              </Text>
              <Text className="text-gray-600 dark:text-slate-400 text-sm mt-1">
                {profile?.phone}
              </Text>
            </View>

            <View className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4 space-y-3">
              <View className="flex-row items-center">
                <Ionicons name="mail" size={20} color="#FF5A00" />
                <Text className="text-gray-700 dark:text-slate-300 ml-3 flex-1">
                  {profile?.email}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="location" size={20} color="#FF5A00" />
                <Text className="text-gray-700 dark:text-slate-300 ml-3 flex-1">
                  {profile?.address || 'No address set'}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Ionicons name="call" size={20} color="#FF5A00" />
                <TouchableOpacity className="ml-3 flex-1">
                  <Text className="text-[#FF5A00] font-semibold">
                    {profile?.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Stats</Text>
            
            <View className="space-y-2">
              <View className="flex-row gap-3">
                <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <Text className="text-blue-900 dark:text-blue-300 text-xs font-semibold">Total Orders</Text>
                  <Text className="text-blue-600 dark:text-blue-400 font-bold text-2xl mt-1">
                    {stats?.totalOrders || 0}
                  </Text>
                </View>

                <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
                  <Text className="text-purple-900 dark:text-purple-300 text-xs font-semibold">Total Earned</Text>
                  <Text className="text-purple-600 dark:text-purple-400 font-bold text-2xl mt-1">
                    ${stats?.totalEarnings?.toFixed(2) || '0.00'}
                  </Text>
                </View>
              </View>

              <View className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <Text className="text-yellow-900 dark:text-yellow-300 text-xs font-semibold">Rating</Text>
                <View className="flex-row items-end gap-2 mt-1">
                  <Text className="text-yellow-600 dark:text-yellow-400 font-bold text-2xl">
                    {stats?.rating || 4.9}
                  </Text>
                  <Text className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    ★ (287 reviews)
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Documents & Verification */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Documents</Text>
            
            <View className="space-y-2">
              <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg">
                <Ionicons name="document" size={24} color="#FF5A00" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">Driver License</Text>
                  <Text className="text-xs text-green-600 dark:text-green-400">Verified • Expires 2027</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg">
                <Ionicons name="document" size={24} color="#FF5A00" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">Insurance</Text>
                  <Text className="text-xs text-green-600 dark:text-green-400">Verified • Expires 2025</Text>
                </View>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg">
                <Ionicons name="document" size={24} color="#FF5A00" />
                <View className="ml-3 flex-1">
                  <Text className="font-semibold text-gray-900 dark:text-white">Background Check</Text>
                  <Text className="text-xs text-yellow-600 dark:text-yellow-400">Pending • Expires 2025</Text>
                </View>
                <Ionicons name="alert-circle" size={20} color="#F59E0B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payout Settings */}
          <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-bold text-gray-900 dark:text-white">Payout Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
            <Text className="text-gray-600 dark:text-slate-400 text-sm">
              Bank Account: •••• 4242
            </Text>
            <Text className="text-gray-600 dark:text-slate-400 text-sm mt-1">
              Next payout: Friday, May 10th
            </Text>
          </View>

          {/* Settings Section */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Settings</Text>
            
            <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg mb-2">
              <View className="flex-row items-center">
                <Ionicons name="bell" size={20} color="#FF5A00" />
                <Text className="text-gray-900 dark:text-white font-semibold ml-3">Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg mb-2">
              <View className="flex-row items-center">
                <Ionicons name="lock-closed" size={20} color="#FF5A00" />
                <Text className="text-gray-900 dark:text-white font-semibold ml-3">Change Password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-3 rounded-lg">
              <View className="flex-row items-center">
                <Ionicons name="help-circle" size={20} color="#FF5A00" />
                <Text className="text-gray-900 dark:text-white font-semibold ml-3">Help & Support</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg py-3"
          >
            <Text className="text-red-600 dark:text-red-300 font-bold text-center">Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
