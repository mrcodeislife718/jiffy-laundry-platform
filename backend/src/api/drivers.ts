import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.ts';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.ts';
import { supabaseAdmin } from '../config/supabase.ts';

const router = Router();

// Schemas
const updateDriverSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  vehicle_info: z.object({ make: z.string(), model: z.string(), year: z.number() }).optional(),
  availability: z.boolean().optional(),
});

// GET /api/drivers - List drivers (admin only)
router.get(
  '/',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('role', 'driver');

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
      pagination: { total: count || 0, limit: Number(limit), offset: Number(offset) },
    });
  })
);

// GET /api/drivers/:id - Get driver profile
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    // Drivers can only view their own profile
    if (req.user?.role === 'driver' && req.user.id !== id && !['admin'].includes(req.user.role)) {
      throw new ValidationError('Cannot view other driver profiles');
    }

    const { data: driver, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'driver')
      .single();

    if (error || !driver) {
      throw new NotFoundError('Driver not found');
    }

    // Get driver stats
    const { data: stats } = await supabaseAdmin
      .from('orders')
      .select('status')
      .eq('driver_id', id);

    const completedOrders = stats?.filter((o) => o.status === 'delivered').length || 0;
    const totalOrders = stats?.length || 0;

    res.json({
      success: true,
      data: {
        ...driver,
        stats: { completedOrders, totalOrders, rating: 4.5 },
      },
    });
  })
);

// PATCH /api/drivers/:id/status - Update driver status (admin only)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('admin'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { status } = z.object({ status: z.enum(['active', 'inactive', 'suspended']) }).parse(req.body);

    const { data: driver, error } = await supabaseAdmin
      .from('profiles')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('role', 'driver')
      .select()
      .single();

    if (error || !driver) {
      throw new NotFoundError('Driver not found');
    }

    // Log audit action
    await logAuditAction(req.user?.id || '', 'DRIVER_STATUS_CHANGED', `Updated driver ${id} status to ${status}`, { driverId: id, status });

    res.json({ success: true, data: driver });
  })
);

// PATCH /api/drivers/:id - Update driver profile
router.patch(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const validated = updateDriverSchema.parse(req.body);

    // Only admin or the driver can update
    if (req.user?.role === 'driver' && req.user.id !== id) {
      throw new ValidationError('Cannot update other driver profiles');
    }

    const { data: driver, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !driver) {
      throw new NotFoundError('Driver not found');
    }

    res.json({ success: true, data: driver });
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
