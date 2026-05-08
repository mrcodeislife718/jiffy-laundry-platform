import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../../../packages/shared/auth';
import { getCustomerSupportTickets, createSupportTicket } from '../../../packages/shared/support';

export default function SupportScreen() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = React.useState(null);
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [orderId, setOrderId] = React.useState('');
  const [isFormVisible, setIsFormVisible] = React.useState(false);

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

  // Fetch customer's tickets
  const {
    data: tickets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['customer-tickets', currentUser?.id],
    queryFn: () => getCustomerSupportTickets(currentUser.id),
    enabled: !!currentUser?.id,
  });

  // Create ticket mutation
  const createMutation = useMutation({
    mutationFn: () =>
      createSupportTicket(
        currentUser.id,
        subject,
        message,
        orderId || null
      ),
    onSuccess: () => {
      setSubject('');
      setMessage('');
      setOrderId('');
      setIsFormVisible(false);
      queryClient.invalidateQueries({
        queryKey: ['customer-tickets', currentUser?.id],
      });
      Alert.alert('Success', 'Support ticket created successfully!');
    },
    onError: (err) => {
      Alert.alert('Error', `Failed to create ticket: ${err.message}`);
    },
  });

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Loading...</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Error loading tickets: {error.message}</Text>
      </View>
    );
  }

  const getStatusColor = (status) => {
    return status === 'open' ? '#FF9500' : '#34C759';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Support</Text>
        {!isFormVisible && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsFormVisible(true)}
          >
            <Text style={styles.createButtonText}>+ New Ticket</Text>
          </TouchableOpacity>
        )}
      </View>

      {isFormVisible && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create Support Ticket</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief subject of your issue"
              value={subject}
              onChangeText={setSubject}
              placeholderTextColor="#ccc"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={5}
              placeholderTextColor="#ccc"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Order ID (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Paste order ID if related to an order"
              value={orderId}
              onChangeText={setOrderId}
              placeholderTextColor="#ccc"
            />
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.formButton, styles.cancelButton]}
              onPress={() => {
                setIsFormVisible(false);
                setSubject('');
                setMessage('');
                setOrderId('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formButton, styles.submitButton]}
              onPress={() => createMutation.mutate()}
              disabled={!subject.trim() || !message.trim() || createMutation.isPending}
            >
              <Text style={styles.submitButtonText}>
                {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.ticketsSection}>
        <Text style={styles.sectionTitle}>
          Your Tickets ({tickets.length})
        </Text>

        {tickets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No support tickets yet</Text>
          </View>
        ) : (
          <View style={styles.ticketsList}>
            {tickets.map((ticket, index) => (
              <View
                key={ticket.id}
                style={[
                  styles.ticketCard,
                  index !== tickets.length - 1 && styles.ticketCardBorder,
                ]}
              >
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) },
                    ]}
                  >
                    <Text style={styles.statusBadgeText}>
                      {ticket.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.ticketMessage}>{ticket.message}</Text>

                {ticket.order && (
                  <View style={styles.ticketOrderInfo}>
                    <Text style={styles.ticketOrderLabel}>
                      Related Order: {ticket.order_id?.slice(0, 8)}...
                    </Text>
                    <Text style={styles.ticketOrderStatus}>
                      Order Status: {ticket.order.status?.replace(/_/g, ' ')}
                    </Text>
                  </View>
                )}

                <Text style={styles.ticketDate}>
                  {new Date(ticket.created_at).toLocaleDateString()}{' '}
                  {new Date(ticket.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  createButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 100,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#007AFF',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  ticketsSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
  },
  ticketsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  ticketCard: {
    padding: 12,
  },
  ticketCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  ticketMessage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  ticketOrderInfo: {
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 8,
  },
  ticketOrderLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  ticketOrderStatus: {
    fontSize: 11,
    color: '#666',
  },
  ticketDate: {
    fontSize: 11,
    color: '#999',
  },
  error: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});
