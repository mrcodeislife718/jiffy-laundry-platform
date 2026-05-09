import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// GET /api/admin/audit-logs - Get audit logs
router.get(
  '/audit-logs',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { action, user, limit = 100, offset = 0 } = req.query;

    let query = supabaseAdmin.from('audit_logs').select('*', { count: 'exact' });

    if (action) query = query.eq('action', action);
    if (user) query = query.eq('user_id', user);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: { total: count || 0, limit: Number(limit), offset: Number(offset) },
    });
  })
);

// GET /api/admin/dashboard - Dashboard metrics
router.get(
  '/dashboard',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    // Get orders count
    const { count: ordersCount } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true });

    // Get revenue
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'delivered');

    const totalRevenue = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

    // Get active drivers
    const { count: driversCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'driver')
      .eq('status', 'active');

    // Get customers count
    const { count: customersCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    res.json({
      success: true,
      data: {
        orders: ordersCount || 0,
        revenue: totalRevenue,
        drivers: driversCount || 0,
        customers: customersCount || 0,
      },
    });
  })
);

// POST /api/admin/refund - Issue refund
router.post(
  '/refund',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { orderId, amount, reason } = z
      .object({
        orderId: z.string(),
        amount: z.number().positive(),
        reason: z.string(),
      })
      .parse(req.body);

    // Get order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new NotFoundError('Order not found');
    }

    // Create refund transaction
    const { data: transaction, error } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        customer_id: order.customer_id,
        amount,
        type: 'refund',
        description: `Refund for order ${orderId}: ${reason}`,
        reference_id: orderId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Log audit action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: req.user?.id,
      action: 'ORDER_REFUND',
      description: `Issued $${amount} refund for order ${orderId}`,
      metadata: { orderId, amount, reason },
      created_at: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: transaction });
  })
);

export default router;
