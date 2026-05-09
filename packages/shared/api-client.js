/**
 * JiffyLaundry Backend API Client
 * Handles all HTTP requests to the backend API
 */

const API_URL = process.env.REACT_APP_API_URL || 
                process.env.EXPO_PUBLIC_API_URL || 
                'http://localhost:4000';

class APIClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
    this.userId = null;
    this.userRole = null;
    this.token = null;
  }

  /**
   * Set authentication info
   */
  setAuth(userId, userRole, token = null) {
    this.userId = userId;
    this.userRole = userRole;
    this.token = token;
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-user-id': this.userId || '',
      'x-user-role': this.userRole || '',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error(`API Request failed: ${endpoint}`, err);
      throw err;
    }
  }

  // Orders API
  async getOrders() {
    return this.request('/api/orders');
  }

  async getOrder(orderId) {
    return this.request(`/api/orders/${orderId}`);
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/api/orders/${orderId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Dispatch API
  async assignOrderToDriver(orderId, driverId) {
    return this.request('/api/dispatch/assign', {
      method: 'POST',
      body: JSON.stringify({ orderId, driverId }),
    });
  }

  // Driver Location API
  async updateDriverLocation(driverId, latitude, longitude, orderId = null) {
    return this.request(`/api/drivers/${driverId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude, orderId }),
    });
  }

  // Wallet API
  async getWallet(userId) {
    return this.request(`/api/wallet/${userId}`);
  }

  async topupWallet(userId, amount, paymentMethodId) {
    return this.request(`/api/wallet/${userId}/topup`, {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethodId }),
    });
  }

  // Support Tickets API
  async getSupportTickets() {
    return this.request('/api/support/tickets');
  }

  async updateSupportTicket(ticketId, status) {
    return this.request(`/api/support/tickets/${ticketId}/status`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

// Export singleton
export const apiClient = new APIClient();

// Export class for testing
export default APIClient;
