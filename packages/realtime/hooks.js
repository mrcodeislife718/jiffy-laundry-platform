import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  OrderEvents, 
  DriverEvents, 
  NotificationEvents,
  WalletEvents,
  SupportEvents,
  initializeRealtimeConnection,
  getRealtimeConnection
} from './index.js';

/**
 * Hook to subscribe to order updates
 * @param {string} orderId - Order ID to track
 * @returns {object} { order, status, lastUpdate, error }
 */
export function useOrderTracking(orderId) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('pending');
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    try {
      const handleUpdate = (data) => {
        setOrder(data);
        setStatus(data.status);
        setLastUpdate(new Date());
      };

      OrderEvents.onOrderUpdated(orderId, handleUpdate);

      return () => {
        // Cleanup
      };
    } catch (err) {
      setError(err.message);
    }
  }, [orderId]);

  return { order, status, lastUpdate, error };
}

/**
 * Hook to track driver location in realtime
 * @param {string} driverId - Driver ID
 * @returns {object} { location, heading, speed, lastUpdate }
 */
export function useDriverLocation(driverId) {
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(null);
  const [speed, setSpeed] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!driverId) return;

    try {
      const handleLocationUpdate = (data) => {
        setLocation({ lat: data.latitude, lng: data.longitude });
        setHeading(data.heading);
        setSpeed(data.speed);
        setLastUpdate(new Date());
      };

      DriverEvents.onLocationUpdate(driverId, handleLocationUpdate);

      return () => {
        // Cleanup
      };
    } catch (err) {
      console.error('Error tracking driver location:', err);
    }
  }, [driverId]);

  return { location, heading, speed, lastUpdate };
}

/**
 * Hook to broadcast driver location
 * @param {string} driverId - Driver ID
 * @param {string} orderId - Current order ID (optional)
 * @returns {function} updateLocation function
 */
export function useBroadcastDriverLocation(driverId, orderId = null) {
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        DriverEvents.updateLocation(driverId, latitude, longitude, orderId);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [driverId, orderId]);

  return useCallback((latitude, longitude, orderId = null) => {
    DriverEvents.updateLocation(driverId, latitude, longitude, orderId);
  }, [driverId]);
}

/**
 * Hook to listen for new orders (for drivers)
 * @param {string} driverId - Driver ID
 * @returns {object} { newOrder, hasNew }
 */
export function useNewOrders(driverId) {
  const [newOrder, setNewOrder] = useState(null);
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    if (!driverId) return;

    try {
      const handleNewOrder = (order) => {
        setNewOrder(order);
        setHasNew(true);
      };

      DriverEvents.onNewOrder(driverId, handleNewOrder);

      return () => {
        // Cleanup
      };
    } catch (err) {
      console.error('Error listening for new orders:', err);
    }
  }, [driverId]);

  const clearNotification = useCallback(() => {
    setHasNew(false);
  }, []);

  return { newOrder, hasNew, clearNotification };
}

/**
 * Hook to listen for notifications
 * @returns {object} { notifications, unreadCount, markAsRead }
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    try {
      NotificationEvents.subscribe();

      const handleNotification = (notification) => {
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((prev) => prev + 1);
      };

      NotificationEvents.onNotification(handleNotification);

      return () => {
        // Cleanup
      };
    } catch (err) {
      console.error('Error setting up notifications:', err);
    }
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  return { notifications, unreadCount, markAsRead };
}

/**
 * Hook to track wallet balance changes
 * @param {string} userId - User ID
 * @returns {object} { balance, lastUpdate }
 */
export function useWalletBalance(userId) {
  const [balance, setBalance] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!userId) return;

    try {
      const handleBalanceUpdate = (data) => {
        setBalance(data.balance);
        setLastUpdate(new Date());
      };

      WalletEvents.onBalanceUpdated(userId, handleBalanceUpdate);

      return () => {
        // Cleanup
      };
    } catch (err) {
      console.error('Error tracking wallet balance:', err);
    }
  }, [userId]);

  return { balance, lastUpdate };
}

/**
 * Hook to listen for support ticket updates
 * @param {string} ticketId - Support ticket ID
 * @returns {object} { ticket, status, lastUpdate }
 */
export function useSupportTicket(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [status, setStatus] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (!ticketId) return;

    try {
      const handleUpdate = (data) => {
        setTicket(data);
        setStatus(data.status);
        setLastUpdate(new Date());
      };

      SupportEvents.onTicketUpdated(ticketId, handleUpdate);

      return () => {
        // Cleanup
      };
    } catch (err) {
      console.error('Error tracking support ticket:', err);
    }
  }, [ticketId]);

  return { ticket, status, lastUpdate };
}

/**
 * Hook to initialize realtime connection
 * @param {string} userId - Current user ID
 * @param {string} userRole - Current user role
 * @param {string} apiUrl - Backend API URL
 * @returns {object} { connected, error }
 */
export function useRealtimeConnection(userId, userRole, apiUrl = 'http://localhost:4000') {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const socket = initializeRealtimeConnection(userId, userRole, apiUrl);
      
      socket.on('connect', () => setConnected(true));
      socket.on('disconnect', () => setConnected(false));
      socket.on('error', (err) => setError(err));

      return () => {
        // Keep connection alive
      };
    } catch (err) {
      setError(err.message);
    }
  }, [userId, userRole, apiUrl]);

  return { connected, error };
}

/**
 * Context provider for realtime connection
 */
export function RealtimeProvider({ children, userId, userRole, apiUrl = 'http://localhost:4000' }) {
  const { connected, error } = useRealtimeConnection(userId, userRole, apiUrl);

  if (error) {
    console.error('Realtime connection error:', error);
  }

  return children;
}

export default {
  useOrderTracking,
  useDriverLocation,
  useBroadcastDriverLocation,
  useNewOrders,
  useNotifications,
  useWalletBalance,
  useSupportTicket,
  useRealtimeConnection,
  RealtimeProvider,
};
