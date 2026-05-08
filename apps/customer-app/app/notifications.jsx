import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrentUser } from '../../../packages/shared/auth';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../../packages/shared/notifications';

export default function NotificationsScreen() {
  const queryClient = useQueryClient();
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

  // Fetch notifications
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: () => getNotifications(currentUser.id),
    enabled: !!currentUser?.id,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', currentUser?.id],
      });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to mark notification as read: ' + (error.message || 'Unknown error'));
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(currentUser.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications', currentUser?.id],
      });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to mark all notifications as read: ' + (error.message || 'Unknown error'));
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
        <Text style={styles.error}>Error loading notifications: {error.message}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllButton}
            onPress={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
          >
            <Text style={styles.markAllButtonText}>
              {markAllAsReadMutation.isPending ? 'Marking...' : 'Mark all as read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No notifications yet</Text>
        </View>
      ) : (
        <View style={styles.notificationsList}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.notificationCardUnread,
              ]}
              onPress={() => {
                if (!notification.read) {
                  markAsReadMutation.mutate(notification.id);
                }
              }}
            >
              <View style={styles.notificationContent}>
                <View style={styles.titleSection}>
                  <Text
                    style={[
                      styles.notificationTitle,
                      !notification.read && styles.notificationTitleBold,
                    ]}
                  >
                    {notification.title}
                  </Text>
                  {!notification.read && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.notificationBody,
                    !notification.read && styles.notificationBodyBold,
                  ]}
                  numberOfLines={2}
                >
                  {notification.body}
                </Text>
                <Text style={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleDateString()}{' '}
                  {new Date(notification.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
              {!notification.read && (
                <View style={styles.unreadIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  markAllButton: {
    paddingVertical: 8,
  },
  markAllButtonText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  notificationsList: {
    padding: 12,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#e0e0e0',
  },
  notificationCardUnread: {
    backgroundColor: '#f0f7ff',
    borderLeftColor: '#007AFF',
  },
  notificationContent: {
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  notificationTitleBold: {
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationBodyBold: {
    color: '#333',
  },
  notificationTime: {
    fontSize: 11,
    color: '#999',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
    marginLeft: 8,
  },
  error: {
    color: '#FF3B30',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});
