'use client';

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@jiffylaundry/shared';

const ORANGE = '#ff6b35';
const DARK_TEXT = '#111827';
const LIGHT_GRAY = '#6b7280';
const BG = '#f9fafb';
const SUCCESS = '#10b981';
const DANGER = '#ef4444';

export default function WalletScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace('/(auth)/login');
        return;
      }
      setUser(authUser);

      // Get wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', authUser.id)
        .single();
      setWalletBalance(wallet?.balance || 0);

      // Get transactions (last 50)
      const { data: txns } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('wallet_id', wallet?.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setTransactions(txns || []);
    } catch (err) {
      console.error('Error loading wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return '➕';
      case 'debit':
        return '➖';
      case 'refund':
        return '↩️';
      default:
        return '💰';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'credit':
        return SUCCESS;
      case 'refund':
        return '#3b82f6';
      case 'debit':
        return DANGER;
      default:
        return LIGHT_GRAY;
    }
  };

  const formatAmount = (type, amount) => {
    const prefix = type === 'debit' ? '-' : '+';
    return `${prefix}$${Math.abs(amount).toFixed(2)}`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>${walletBalance.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addMoneyBtn}>
          <Text style={styles.addMoneyBtnText}>+ Add Money</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionLabel}>Auto-Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionLabel}>Statement</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      {/* Transactions History */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        ) : (
          transactions.map(txn => (
            <View key={txn.id} style={styles.transactionCard}>
              <View style={[styles.txnIcon, { backgroundColor: getTransactionColor(txn.type) }]}>
                <Text style={styles.txnIconText}>{getTransactionIcon(txn.type)}</Text>
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDescription}>{txn.description}</Text>
                <Text style={styles.txnDate}>
                  {new Date(txn.created_at).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.txnAmount, { color: getTransactionColor(txn.type) }]}>
                {formatAmount(txn.type, txn.amount)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 12,
  },
  backBtn: {
    color: ORANGE,
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DARK_TEXT,
  },
  balanceCard: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  addMoneyBtn: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addMoneyBtnText: {
    color: ORANGE,
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 28,
  },
  actionBtn: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    width: '30%',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    color: DARK_TEXT,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_TEXT,
    marginBottom: 12,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  txnIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txnIconText: {
    fontSize: 20,
  },
  txnInfo: {
    flex: 1,
  },
  txnDescription: {
    fontSize: 13,
    fontWeight: '500',
    color: DARK_TEXT,
  },
  txnDate: {
    fontSize: 11,
    color: LIGHT_GRAY,
    marginTop: 2,
  },
  txnAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 32,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: LIGHT_GRAY,
  },
});
