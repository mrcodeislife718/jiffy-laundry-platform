import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../../../packages/shared/auth';
import { getWallet, getWalletTransactions } from '../../../packages/shared/wallet';

export default function WalletScreen() {
  const [currentUser, setCurrentUser] = React.useState(null);

  // Get current user
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to load user:', err);
      }
    };
    loadUser();
  }, []);

  // Fetch wallet
  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ['wallet', currentUser?.id],
    queryFn: () => getWallet(currentUser.id),
    enabled: !!currentUser?.id,
  });

  // Fetch wallet transactions
  const {
    data: transactions = [],
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ['wallet-transactions', currentUser?.id],
    queryFn: () => getWalletTransactions(currentUser.id),
    enabled: !!currentUser?.id,
  });

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Loading...</Text>
      </View>
    );
  }

  if (walletLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (walletError) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error loading wallet: {walletError.message}</Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Wallet not found</Text>
      </View>
    );
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
        return '#34C759';
      case 'debit':
        return '#FF3B30';
      case 'refund':
        return '#007AFF';
      default:
        return '#999';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '+';
      case 'debit':
        return '−';
      case 'refund':
        return '↶';
      default:
        return '•';
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>
          ${parseFloat(wallet.balance || 0).toFixed(2)}
        </Text>
        <View style={styles.balanceFooter}>
          <Text style={styles.balanceSubtext}>
            Total Spent: ${parseFloat(wallet.total_spent || 0).toFixed(2)}
          </Text>
          <Text style={styles.balanceSubtext}>
            Total Credited: ${parseFloat(wallet.total_credited || 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Transactions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {transactionsLoading && (
            <ActivityIndicator size="small" color="#007AFF" />
          )}
        </View>

        {transactionsError && (
          <Text style={styles.error}>
            Error loading transactions: {transactionsError.message}
          </Text>
        )}

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No transactions yet</Text>
          </View>
        ) : (
          <View style={styles.transactionsList}>
            {transactions.map((transaction, index) => (
              <View
                key={transaction.id}
                style={[
                  styles.transactionItem,
                  index !== transactions.length - 1 && styles.transactionItemBorder,
                ]}
              >
                <View style={styles.transactionIcon}>
                  <Text
                    style={[
                      styles.transactionIconText,
                      { color: getTransactionColor(transaction.type) },
                    ]}
                  >
                    {getTransactionIcon(transaction.type)}
                  </Text>
                </View>
                <View style={styles.transactionContent}>
                  <Text style={styles.transactionDescription}>
                    {transaction.description || 'Transaction'}
                  </Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.created_at).toLocaleDateString()}{' '}
                    {new Date(transaction.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    { color: getTransactionColor(transaction.type) },
                  ]}
                >
                  {transaction.type === 'debit' ? '−' : '+'}$
                  {parseFloat(transaction.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Wallet transactions are updated in real-time. Your balance reflects all completed
          orders and credits.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#ffffff99',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  balanceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#ffffff33',
    paddingTop: 12,
  },
  balanceSubtext: {
    fontSize: 12,
    color: '#ffffff99',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  transactionsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  transactionItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionIconText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionContent: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 16,
  },
});
