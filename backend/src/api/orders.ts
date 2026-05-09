import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Schemas
const createOrderSchema = z.object({
  customer_id: z.string().uuid(),
  pickup_address_id: z.string().uuid(),
  delivery_address_id: z.string().uuid(),
  service_type_id: z.string().uuid(),
  items: z
    .array(
      z.object({
        description: z.string(),
        quantity: z.number().positive(),
        price: z.number().nonnegative(),
      })
    )
    .min(1),
  special_instructions: z.string().optional(),
  scheduled_pickup: z.string().datetime().optional(),
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'on-delivery', 'delivered', 'cancelled']),
  reason: z.string().optional(),
});

// GET /api/orders - List orders
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin.from('orders').select('*', { count: 'exact' });

    // Filter by role
    if (req.user?.role === 'customer') {
      query = query.eq('customer_id', req.user.id);
    } else if (req.user?.role === 'driver') {
      query = query.eq('driver_id', req.user.id);
    }

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data,
      pagination: {
        total: count || 0,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  })
);

// GET /api/orders/:id - Get order details
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    let query = supabaseAdmin.from('orders').select('*').eq('id', id);

    // Restrict access for customers/drivers
    if (req.user?.role === 'customer') {
      query = query.eq('customer_id', req.user.id);
    } else if (req.user?.role === 'driver') {
      query = query.eq('driver_id', req.user.id);
    }

    const { data: order, error } = await query.single();

    if (error || !order) {
      throw new NotFoundError('Order not found');
    }

    // Get order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    res.json({
      success: true,
      data: {
        ...order,
        items: items || [],
      },
    });
  })
);

// POST /api/orders - Create order
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const validated = createOrderSchema.parse(req.body);

    if (req.user?.role === 'customer' && validated.customer_id !== req.user.id) {
      throw new ValidationError('Cannot create order for another customer');
    }

    // Calculate total
    const total = validated.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .insert({
        customer_id: validated.customer_id,
        pickup_address_id: validated.pickup_address_id,
        delivery_address_id: validated.delivery_address_id,
        service_type_id: validated.service_type_id,
        special_instructions: validated.special_instructions,
        scheduled_pickup: validated.scheduled_pickup,
        total,
        status: 'pending',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Create order items
    if (order && validated.items.length > 0) {
      const itemsToInsert = validated.items.map((item) => ({
        order_id: order.id,
        description: item.description,
        quantity: item.quantity,
        price: item.price,
      }));

      await supabaseAdmin.from('order_items').insert(itemsToInsert);
    }

    // Log audit action
    await logAuditAction(req.user?.id || '', 'ORDER_CREATED', `Created order ${order?.id}`, {
      orderId: order?.id,
      customerId: validated.customer_id,
      total,
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  })
);

// PATCH /api/orders/:id/status - Update order status
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin', 'staff'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const validated = updateOrderStatusSchema.parse(req.body);

    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .update({
        status: validated.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !order) {
      throw new NotFoundError('Order not found');
    }

    // Log audit action
    await logAuditAction(req.user?.id || '', 'ORDER_STATUS_CHANGED', `Updated order ${id} status to ${validated.status}`, {
      orderId: id,
      newStatus: validated.status,
      reason: validated.reason,
    });

    res.json({
      success: true,
      data: order,
    });
  })
);

// Helper: Log audit action
async function logAuditAction(userId: string, action: string, description: string, metadata: any) {
  try {
    await supabaseAdmin.from('audit_logs').insert({
      user_id: userId,
      action,
      description,
      metadata,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log audit action:', error);
  }
}

export default router;
