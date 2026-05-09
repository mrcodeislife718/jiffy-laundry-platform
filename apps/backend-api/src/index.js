import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import Redis from 'ioredis';
import pinoHttp from 'pino-http';
import pino from 'pino';
import { supabase } from '@jiffylaundry/shared';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import Queue from 'bull';

// Configuration
const PORT = process.env.PORT || 4000;
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Logger setup
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: NODE_ENV === 'development' ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
});

const httpLogger = pinoHttp({ logger });

// Initialize app
const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', process.env.FRONTEND_URL],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

// Redis instances
const redis = new Redis(REDIS_URL);
const pubsub = new Redis(REDIS_URL);

// Stripe setup
const stripe = new Stripe(STRIPE_SECRET_KEY || 'sk_test_dummy');

// Job queues
const orderProcessingQueue = new Queue('orderProcessing', REDIS_URL);
const notificationQueue = new Queue('notifications', REDIS_URL);
const auditQueue = new Queue('auditLogs', REDIS_URL);
const paymentQueue = new Queue('payments', REDIS_URL);

// Middleware
app.use(helmet());
app.use(cors({ origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', process.env.FRONTEND_URL] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(httpLogger);

// Audit logging middleware
app.use(async (req, res, next) => {
  const requestId = uuidv4();
  res.locals.requestId = requestId;
  res.locals.userId = req.headers['x-user-id'] || null;
  res.locals.userRole = req.headers['x-user-role'] || null;

  // Log request
  logger.info({
    requestId,
    method: req.method,
    path: req.path,
    userId: res.locals.userId,
    userRole: res.locals.userRole,
    timestamp: new Date().toISOString(),
  }, 'Request received');

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    logger.info({
      requestId,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
    }, 'Response sent');

    // Queue audit log
    auditQueue.add({
      requestId,
      userId: res.locals.userId,
      userRole: res.locals.userRole,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
      body: req.body,
    }).catch(err => logger.error({ err }, 'Failed to queue audit log'));

    return originalSend.call(this, data);
  };

  next();
});

// RBAC middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Order management routes
app.get('/api/orders', async (req, res) => {
  try {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error fetching orders');
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { data, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error fetching order');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders/:orderId/status', requireRole(['admin', 'laundromat_operator', 'driver']), async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    const userId = req.headers['x-user-id'];

    // Validate status
    const validStatuses = [
      'pending_payment', 'pending_dispatch', 'accepted', 'heading_to_pickup',
      'arrived_at_pickup', 'picked_up', 'received', 'sorting', 'washing',
      'drying', 'folding', 'quality_check', 'packed', 'ready_for_delivery',
      'out_for_delivery', 'delivered', 'cancelled', 'refunded'
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update order
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Broadcast order update via Socket.io
    io.emit(`order:${orderId}:updated`, {
      orderId,
      status,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });

    // Publish to Redis for external services
    pubsub.publish('order:updated', JSON.stringify({
      orderId,
      status,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    }));

    // Queue notification
    await notificationQueue.add({
      type: 'order_status_changed',
      orderId,
      status,
      userId,
    });

    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error updating order status');
    res.status(500).json({ error: err.message });
  }
});

// Dispatch management
app.post('/api/dispatch/assign', requireRole(['admin', 'laundromat_operator']), async (req, res) => {
  try {
    const { orderId, driverId } = req.body;
    const adminId = req.headers['x-user-id'];

    // Update order with driver
    const { data, error } = await supabase
      .from('orders')
      .update({ driver_id: driverId, status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    // Broadcast to driver and admin
    io.emit(`driver:${driverId}:new_order`, data);
    io.emit(`order:${orderId}:assigned`, { driverId, assignedBy: adminId });

    // Publish to Redis
    pubsub.publish('dispatch:assigned', JSON.stringify({ orderId, driverId, assignedBy: adminId }));

    // Queue notification to driver
    await notificationQueue.add({
      type: 'new_order_assigned',
      driverId,
      orderId,
      userId: adminId,
    });

    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error assigning order');
    res.status(500).json({ error: err.message });
  }
});

// Driver location tracking
app.post('/api/drivers/:driverId/location', requireRole(['driver', 'admin']), async (req, res) => {
  try {
    const { driverId } = req.params;
    const { latitude, longitude, orderId } = req.body;

    // Insert driver location
    const { data, error } = await supabase
      .from('driver_locations')
      .insert({
        driver_id: driverId,
        order_id: orderId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Broadcast location update
    io.emit(`driver:${driverId}:location`, { latitude, longitude, timestamp: new Date().toISOString() });
    if (orderId) {
      io.emit(`order:${orderId}:location`, { driverId, latitude, longitude, timestamp: new Date().toISOString() });
    }

    // Publish to Redis
    pubsub.publish('driver:location', JSON.stringify({ driverId, orderId, latitude, longitude, timestamp: new Date().toISOString() }));

    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error updating driver location');
    res.status(500).json({ error: err.message });
  }
});

// Wallet operations
app.get('/api/wallet/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error fetching wallet');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/wallet/:userId/topup', async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, paymentMethodId } = req.body;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: { userId, type: 'wallet_topup' },
    });

    // Update wallet on success
    if (paymentIntent.status === 'succeeded') {
      const { data, error } = await supabase
        .from('wallets')
        .update({ balance: supabase.raw(`balance + ${amount}`), updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Broadcast wallet update
      io.emit(`wallet:${userId}:updated`, { balance: data.balance });

      // Queue transaction record
      await paymentQueue.add({
        type: 'wallet_topup',
        userId,
        amount,
        paymentIntentId: paymentIntent.id,
      });

      res.json(data);
    } else {
      res.status(400).json({ error: 'Payment failed', status: paymentIntent.status });
    }
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error processing wallet topup');
    res.status(500).json({ error: err.message });
  }
});

// Support tickets
app.get('/api/support/tickets', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*, profiles(full_name, email)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error fetching support tickets');
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/support/tickets/:ticketId/status', requireRole(['admin', 'support']), async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const userId = req.headers['x-user-id'];

    const { data, error } = await supabase
      .from('support_tickets')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', ticketId)
      .select()
      .single();

    if (error) throw error;

    // Broadcast ticket update
    io.emit(`ticket:${ticketId}:updated`, { status, updatedBy: userId });

    // Publish to Redis
    pubsub.publish('ticket:updated', JSON.stringify({ ticketId, status, updatedBy: userId }));

    res.json(data);
  } catch (err) {
    logger.error({ err, requestId: res.locals.requestId }, 'Error updating support ticket');
    res.status(500).json({ error: err.message });
  }
});

// Socket.io event handlers
io.on('connection', (socket) => {
  const userId = socket.handshake.auth.userId;
  const userRole = socket.handshake.auth.userRole;

  logger.info({ userId, userRole, socketId: socket.id }, 'User connected');

  // Join user-specific room
  socket.join(`user:${userId}`);
  socket.join(`role:${userRole}`);

  // Order tracking
  socket.on('subscribe:order', (orderId) => {
    socket.join(`order:${orderId}`);
    logger.info({ userId, orderId, socketId: socket.id }, 'User subscribed to order');
  });

  socket.on('unsubscribe:order', (orderId) => {
    socket.leave(`order:${orderId}`);
    logger.info({ userId, orderId, socketId: socket.id }, 'User unsubscribed from order');
  });

  // Driver location tracking
  socket.on('subscribe:driver', (driverId) => {
    socket.join(`driver:${driverId}`);
    logger.info({ userId, driverId, socketId: socket.id }, 'User subscribed to driver location');
  });

  socket.on('driver:location', async (data) => {
    try {
      const { driverId, latitude, longitude, orderId } = data;
      
      // Broadcast to all subscribed users
      io.to(`driver:${driverId}`).emit('driver:location:update', {
        driverId,
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      });

      if (orderId) {
        io.to(`order:${orderId}`).emit('order:driver_location', {
          driverId,
          latitude,
          longitude,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info({ driverId, orderId }, 'Driver location broadcast');
    } catch (err) {
      logger.error({ err, userId }, 'Error broadcasting driver location');
    }
  });

  // Notifications
  socket.on('subscribe:notifications', () => {
    socket.join(`notifications:${userId}`);
    logger.info({ userId, socketId: socket.id }, 'User subscribed to notifications');
  });

  // Disconnect
  socket.on('disconnect', () => {
    logger.info({ userId, socketId: socket.id }, 'User disconnected');
  });
});

// Process audit log queue
auditQueue.process(async (job) => {
  try {
    const { requestId, userId, userRole, method, path, statusCode, timestamp, body } = job.data;
    await supabase.from('audit_logs').insert({
      request_id: requestId,
      user_id: userId,
      user_role: userRole,
      method,
      path,
      status_code: statusCode,
      timestamp,
      body_preview: JSON.stringify(body).substring(0, 1000),
    });
    logger.info({ requestId }, 'Audit log recorded');
  } catch (err) {
    logger.error({ err }, 'Failed to process audit log');
  }
});

// Process notification queue
notificationQueue.process(async (job) => {
  try {
    const { type, orderId, driverId, userId, status } = job.data;

    // Queue notification in database
    const notificationText = {
      'order_status_changed': `Order ${orderId} status updated to ${status}`,
      'new_order_assigned': `New order assigned: ${orderId}`,
    }[type];

    const recipientId = driverId || userId;
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type,
      title: type.replace(/_/g, ' ').toUpperCase(),
      message: notificationText,
      metadata: { orderId, driverId, userId, status },
      read: false,
    });

    // Broadcast notification via Socket.io
    io.to(`notifications:${recipientId}`).emit('notification', {
      type,
      message: notificationText,
      orderId,
      timestamp: new Date().toISOString(),
    });

    logger.info({ recipientId, type }, 'Notification sent');
  } catch (err) {
    logger.error({ err }, 'Failed to process notification');
  }
});

// Process payment queue
paymentQueue.process(async (job) => {
  try {
    const { type, userId, amount, paymentIntentId } = job.data;

    // Record transaction
    await supabase.from('wallet_transactions').insert({
      wallet_id: (await supabase.from('wallets').select('id').eq('user_id', userId).single()).data.id,
      type,
      amount,
      reference: paymentIntentId,
      metadata: { paymentIntentId },
    });

    logger.info({ userId, amount, type }, 'Payment transaction recorded');
  } catch (err) {
    logger.error({ err }, 'Failed to process payment');
  }
});

// Error handling
app.use((err, req, res, next) => {
  logger.error({ err, requestId: res.locals.requestId }, 'Unhandled error');
  res.status(500).json({ error: 'Internal server error', requestId: res.locals.requestId });
});

// Start server
httpServer.listen(PORT, () => {
  logger.info({ port: PORT, env: NODE_ENV }, 'Backend API server running');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await redis.quit();
  pubsub.disconnect();
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
