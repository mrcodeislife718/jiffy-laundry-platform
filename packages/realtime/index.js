import io from 'socket.io-client';

let socket = null;

/**
 * Initialize Socket.io connection to backend API
 * @param {string} userId - Current user ID
 * @param {string} userRole - Current user role (customer, driver, admin, laundromat_operator)
 * @param {string} apiUrl - Backend API URL (e.g., http://localhost:4000)
 * @returns {object} Socket instance
 */
export function initializeRealtimeConnection(userId, userRole, apiUrl = 'http://localhost:4000') {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(apiUrl, {
    auth: {
      userId,
      userRole,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('✅ Connected to realtime backend', { userId, userRole });
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from realtime backend');
  });

  socket.on('error', (error) => {
    console.error('🔴 Socket error:', error);
  });

  return socket;
}

/**
 * Get or create Socket.io connection
 */
export function getRealtimeConnection() {
  if (!socket || !socket.connected) {
    throw new Error('Realtime connection not initialized. Call initializeRealtimeConnection first.');
  }
  return socket;
}

/**
 * Close Socket.io connection
 */
export function closeRealtimeConnection() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Order Events
export const OrderEvents = {
  subscribeToOrder: (orderId, callback) => {
    const s = getRealtimeConnection();
    s.emit('subscribe:order', orderId);
    s.on(`order:${orderId}:updated`, callback);
  },

  unsubscribeFromOrder: (orderId, callback) => {
    const s = getRealtimeConnection();
    s.emit('unsubscribe:order', orderId);
    s.off(`order:${orderId}:updated`, callback);
  },

  onOrderAssigned: (callback) => {
    getRealtimeConnection().on('order:assigned', callback);
  },

  onOrderLocationUpdate: (orderId, callback) => {
    getRealtimeConnection().on(`order:${orderId}:location`, callback);
  },

  onOrderUpdated: (orderId, callback) => {
    getRealtimeConnection().on(`order:${orderId}:updated`, callback);
  },
};

// Driver Events
export const DriverEvents = {
  subscribeToDriver: (driverId, callback) => {
    const s = getRealtimeConnection();
    s.emit('subscribe:driver', driverId);
    s.on(`driver:${driverId}:location`, callback);
  },

  unsubscribeFromDriver: (driverId, callback) => {
    const s = getRealtimeConnection();
    s.leave(`driver:${driverId}`);
    s.off(`driver:${driverId}:location`, callback);
  },

  updateLocation: (driverId, latitude, longitude, orderId = null) => {
    getRealtimeConnection().emit('driver:location', {
      driverId,
      latitude,
      longitude,
      orderId,
    });
  },

  onNewOrder: (driverId, callback) => {
    getRealtimeConnection().on(`driver:${driverId}:new_order`, callback);
  },

  onLocationUpdate: (driverId, callback) => {
    getRealtimeConnection().on(`driver:${driverId}:location`, callback);
  },
};

// Wallet Events
export const WalletEvents = {
  onBalanceUpdated: (userId, callback) => {
    getRealtimeConnection().on(`wallet:${userId}:updated`, callback);
  },

  onPaymentProcessed: (callback) => {
    getRealtimeConnection().on('payment:processed', callback);
  },
};

// Notification Events
export const NotificationEvents = {
  subscribe: () => {
    getRealtimeConnection().emit('subscribe:notifications');
  },

  onNotification: (callback) => {
    getRealtimeConnection().on('notification', callback);
  },

  onUnread: (callback) => {
    getRealtimeConnection().on('notifications:unread', callback);
  },
};

// Support Events
export const SupportEvents = {
  onTicketUpdated: (ticketId, callback) => {
    getRealtimeConnection().on(`ticket:${ticketId}:updated`, callback);
  },

  onTicketCreated: (callback) => {
    getRealtimeConnection().on('ticket:created', callback);
  },
};

// Generic event handlers
export function on(eventName, callback) {
  getRealtimeConnection().on(eventName, callback);
}

export function off(eventName, callback) {
  getRealtimeConnection().off(eventName, callback);
}

export function emit(eventName, data) {
  getRealtimeConnection().emit(eventName, data);
}
