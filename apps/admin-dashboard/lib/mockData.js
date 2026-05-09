// Mock data for development
export const mockOrders = [
  {
    id: 'ORD-001',
    customer: 'John Doe',
    items: 3,
    total: 45.99,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: new Date('2026-05-08'),
  },
  {
    id: 'ORD-002',
    customer: 'Jane Smith',
    items: 5,
    total: 78.50,
    status: 'out_for_delivery',
    paymentStatus: 'paid',
    createdAt: new Date('2026-05-07'),
  },
  {
    id: 'ORD-003',
    customer: 'Bob Johnson',
    items: 2,
    total: 32.00,
    status: 'pending_dispatch',
    paymentStatus: 'paid',
    createdAt: new Date('2026-05-07'),
  },
  {
    id: 'ORD-004',
    customer: 'Alice Williams',
    items: 4,
    total: 95.75,
    status: 'washing',
    paymentStatus: 'paid',
    createdAt: new Date('2026-05-06'),
  },
  {
    id: 'ORD-005',
    customer: 'Mike Brown',
    items: 1,
    total: 15.00,
    status: 'picked_up',
    paymentStatus: 'unpaid',
    createdAt: new Date('2026-05-06'),
  },
];

export const mockFinanceData = {
  totalRevenue: 15234.50,
  totalOrders: 256,
  averageOrderValue: 59.50,
  pendingPayments: 1240.00,
};

export const mockServices = [
  { id: 1, name: 'Standard Wash', price: 12.99, active: true },
  { id: 2, name: 'Express Service', price: 19.99, active: true },
  { id: 3, name: 'Premium Fold', price: 24.99, active: true },
  { id: 4, name: 'Dry Cleaning', price: 34.99, active: false },
];

export const mockSLAMetrics = {
  averagePickupTime: '22 min',
  averageDeliveryTime: '145 min',
  completionRate: '98.5%',
  customerSatisfaction: '4.8/5.0',
};

export const mockSupport = [
  { id: 1, orderId: 'ORD-001', subject: 'Lost item', status: 'open', priority: 'high' },
  { id: 2, orderId: 'ORD-002', subject: 'Quality issue', status: 'resolved', priority: 'medium' },
  { id: 3, orderId: 'ORD-003', subject: 'Late delivery', status: 'open', priority: 'low' },
];
