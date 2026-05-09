export default function HomeScreen() {
  const { colorScheme } = useColorScheme();

  // Fetch active orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['orders', 'active'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', user.id)
        .in('status', ['pending', 'processing', 'on-delivery'])
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
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

  // Fetch wallet
  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('wallets')
        .select('*')
        .eq('customer_id', user.id)
        .single();
      return data;
    },
  });

  const isLoading = profileLoading || ordersLoading || walletLoading;
  const activeOrder = ordersData?.[0];

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
          <Text className="text-white text-3xl font-bold">JiffyLaundry</Text>
          <Text className="text-orange-100 text-sm">👋 Hi {profile?.full_name?.split(' ')[0] || 'there'}</Text>
        </View>

        {/* Main Content */}
        <View className="px-6 py-6 space-y-6">
          {/* Wallet Card */}
          <View className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
            <View className="flex-row justify-between items-start mb-3">
              <Text className="text-gray-700 dark:text-slate-300 font-semibold">Wallet Balance</Text>
              <Ionicons name="wallet" size={24} color="#FF5A00" />
            </View>
            <Text className="text-4xl font-bold text-[#FF5A00] mb-3">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </Text>
            <Link href="/wallet" asChild>
              <TouchableOpacity className="bg-[#FF5A00] rounded-lg py-2 px-3">
                <Text className="text-white text-sm font-semibold text-center">Add Funds</Text>
              </TouchableOpacity>
            </Link>
          </View>

          {/* Active Order */}
          {activeOrder ? (
            <Link href={`/tracking?orderId=${activeOrder.id}`} asChild>
              <TouchableOpacity className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <View className="flex-row justify-between items-start mb-2">
                  <Text className="text-green-900 dark:text-green-300 font-semibold">Order in Progress</Text>
                  <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
                </View>
                <Text className="text-green-800 dark:text-green-200 text-sm mb-3">
                  {activeOrder.special_instructions || 'Standard laundry service'} • Est. {new Date(activeOrder.created_at).toLocaleDateString()}
                </Text>
                <Text className="text-green-600 dark:text-green-300 text-sm font-semibold">Track Order →</Text>
              </TouchableOpacity>
            </Link>
          ) : (
            <View className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
              <Text className="text-gray-700 dark:text-slate-300 font-semibold mb-3">No Active Orders</Text>
              <Link href="/create-order" asChild>
                <TouchableOpacity className="bg-[#FF5A00] rounded-lg py-3">
                  <Text className="text-white text-sm font-semibold text-center">Create New Order</Text>
                </TouchableOpacity>
              </Link>
            </View>
          )}

          {/* Quick Services */}
          <View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">Services</Text>
            <View className="gap-2">
              <Link href="/create-order" asChild>
                <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <Ionicons name="shirt" size={28} color="#FF5A00" />
                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white">New Order</Text>
                    <Text className="text-xs text-gray-600 dark:text-slate-400">Schedule pickup & delivery</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </Link>

              <Link href="/orders" asChild>
                <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <Ionicons name="list" size={28} color="#3B82F6" />
                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white">My Orders</Text>
                    <Text className="text-xs text-gray-600 dark:text-slate-400">View all your orders</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </Link>

              <Link href="/support" asChild>
                <TouchableOpacity className="flex-row items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700">
                  <Ionicons name="help-circle" size={28} color="#06B6D4" />
                  <View className="ml-4 flex-1">
                    <Text className="font-semibold text-gray-900 dark:text-white">Support</Text>
                    <Text className="text-xs text-gray-600 dark:text-slate-400">Contact us for help</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Promo Banner */}
          <View className="bg-gradient-to-r from-[#FF5A00] to-orange-600 p-4 rounded-lg">
            <Text className="text-white font-bold text-lg">Special Offer</Text>
            <Text className="text-orange-100 text-sm mt-1">Get 20% off your next order with code SAVE20</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
