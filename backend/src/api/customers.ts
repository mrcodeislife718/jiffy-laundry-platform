import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.ts';
import { asyncHandler, NotFoundError, ValidationError } from '../middleware/errorHandler.ts';
import { supabaseAdmin } from '../config/supabase.ts';

const router = Router();

// Schemas
const updateCustomerSchema = z.object({
  full_name: z.string().optional(),
  phone_number: z.string().optional(),
  avatar_url: z.string().url().optional(),
  preferences: z.record(z.any()).optional(),
});

// GET /api/customers/me - Get current customer profile
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user?.id)
      .single();

    if (error || !profile) {
      throw new NotFoundError('Customer profile not found');
    }

    // Get wallet info
    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('customer_id', req.user?.id)
      .single();

    res.json({
      success: true,
      data: {
        ...profile,
        wallet: wallet || { balance: 0 },
      },
    });
  })
);

// GET /api/customers/:id - Get customer profile (admin only)
router.get(
  '/:id',
  authenticate,
  requireRole('admin', 'staff'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', id)
      .eq('role', 'customer')
      .single();

    if (error || !profile) {
      throw new NotFoundError('Customer not found');
    }

    // Get customer stats
    const { data: orders } = await supabaseAdmin
      .from('orders')
      .select('total, status, created_at')
      .eq('customer_id', id);

    const { data: wallet } = await supabaseAdmin
      .from('wallets')
      .select('balance')
      .eq('customer_id', id)
      .single();

    const totalSpent = orders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const totalOrders = orders?.length || 0;

    res.json({
      success: true,
      data: {
        ...profile,
        stats: {
          totalOrders,
          totalSpent,
          memberSince: profile.created_at,
        },
        wallet: wallet || { balance: 0 },
      },
    });
  })
);

// PATCH /api/customers/me - Update own profile
router.patch(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const validated = updateCustomerSchema.parse(req.body);

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...validated,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user?.id)
      .select()
      .single();

    if (error || !profile) {
      throw new NotFoundError('Customer profile not found');
    }

    res.json({ success: true, data: profile });
  })
);

export default router;
