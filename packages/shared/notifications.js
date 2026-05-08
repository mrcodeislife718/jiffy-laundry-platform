import { supabase } from './supabase';

/**
 * Create a notification for a user
 * @param {string} userId - User ID
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @returns {Promise<Object>} Created notification object
 */
export async function createNotification(userId, title, body) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([
      {
        user_id: userId,
        title,
        body,
        read: false,
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Get notification template based on order status
 * @param {string} status - Order status
 * @returns {Object} Object with title and body properties
 */
export function notificationForStatus(status) {
  const templates = {
    pending_payment: {
      title: 'Payment Required',
      body: 'Your laundry order is waiting for payment.',
    },
    pending_dispatch: {
      title: 'Order Confirmed',
      body: 'Your order has been confirmed. We are finding a driver.',
    },
    accepted: {
      title: 'Driver Assigned',
      body: 'A driver has been assigned to your order.',
    },
    heading_to_pickup: {
      title: 'Driver On The Way',
      body: 'Your driver is heading to pick up your laundry.',
    },
    arrived_at_pickup: {
      title: 'Driver Arrived',
      body: 'Your driver has arrived at pickup location.',
    },
    picked_up: {
      title: 'Laundry Picked Up',
      body: 'Your laundry has been picked up and is on the way to the laundromat.',
    },
    received: {
      title: 'Order Received',
      body: 'Your laundry has been received at the laundromat.',
    },
    sorting: {
      title: 'Sorting Started',
      body: 'Your laundry is being sorted.',
    },
    washing: {
      title: 'Washing In Progress',
      body: 'Your laundry is being washed.',
    },
    drying: {
      title: 'Drying In Progress',
      body: 'Your laundry is being dried.',
    },
    folding: {
      title: 'Folding In Progress',
      body: 'Your laundry is being folded.',
    },
    quality_check: {
      title: 'Quality Check',
      body: 'Your laundry is undergoing quality check.',
    },
    packed: {
      title: 'Order Packed',
      body: 'Your laundry has been packed and is ready.',
    },
    ready_for_delivery: {
      title: 'Ready for Delivery',
      body: 'Your order is ready and waiting for delivery.',
    },
    out_for_delivery: {
      title: 'Out for Delivery',
      body: 'Your order is out for delivery.',
    },
    delivered: {
      title: 'Delivery Complete',
      body: 'Your laundry has been delivered. Thank you for using JiffyLaundry!',
    },
    cancelled: {
      title: 'Order Cancelled',
      body: 'Your order has been cancelled.',
    },
    refunded: {
      title: 'Refund Processed',
      body: 'Your refund has been processed.',
    },
  };

  return (
    templates[status] || {
      title: 'Order Update',
      body: `Your order status has been updated to: ${status.replace(/_/g, ' ')}`,
    }
  );
}

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of notification objects
 */
export async function getNotifications(userId) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} Updated notification object
 */
export async function markNotificationAsRead(notificationId) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} Number of rows updated
 */
export async function markAllNotificationsAsRead(userId) {
  const { data, error, count } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false)
    .select();

  if (error) throw error;
  return count;
}

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export async function deleteNotification(notificationId) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) throw error;
}

/**
 * Subscribe to new notifications for a user
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function called with new notification
 * @returns {Function} Unsubscribe function
 */
export function subscribeToNotifications(userId, callback) {
  const subscription = supabase
    .from(`notifications:user_id=eq.${userId}`)
    .on('*', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
}
