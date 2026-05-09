import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './config/env';
import { authenticate } from './middleware/auth';
import { errorHandler, asyncHandler } from './middleware/errorHandler';
import { apiLimiter, publicLimiter } from './middleware/rateLimit';

// Import route handlers
import ordersRouter from './api/orders';
import driversRouter from './api/drivers';
import customersRouter from './api/customers';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  },
});

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Rate limiting
app.use(publicLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
const apiPrefix = '/api';

// Public routes (no auth required)
app.use(`${apiPrefix}/auth`, publicLimiter);

// Protected routes (auth required)
app.use(apiLimiter);

app.use(`${apiPrefix}/orders`, authenticate, ordersRouter);
app.use(`${apiPrefix}/drivers`, authenticate, driversRouter);
app.use(`${apiPrefix}/customers`, authenticate, customersRouter);

// Health check endpoint
app.get(`${apiPrefix}/health`, (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    version: '1.0.0',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join order room
  socket.on('join-order', (orderId: string) => {
    socket.join(`order:${orderId}`);
    console.log(`Socket ${socket.id} joined order:${orderId}`);
  });

  // Leave order room
  socket.on('leave-order', (orderId: string) => {
    socket.leave(`order:${orderId}`);
  });

  // Driver location update
  socket.on('location-update', (data: { orderId: string; lat: number; lng: number }) => {
    io.to(`order:${data.orderId}`).emit('driver-location', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const port = env.port;

httpServer.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health: http://localhost:${port}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${port}`);
  console.log(`📝 Environment: ${env.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

export { app, httpServer, io };
