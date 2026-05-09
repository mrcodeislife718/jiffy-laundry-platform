import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler';
import { supabaseAdmin } from '../config/supabase';

const router = Router();

// Schemas
const createTicketSchema = z.object({
  subject: z.string().min(5),
  message: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
});

const respondTicketSchema = z.object({
  message: z.string().min(1),
});

// GET /api/support - List tickets
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin.from('support_tickets').select('*', { count: 'exact' });

    // Customers see only their tickets
    if (req.user?.role === 'customer') {
      query = query.eq('customer_id', req.user.id);
    }

    if (status) {
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

// POST /api/support - Create ticket
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const validated = createTicketSchema.parse(req.body);

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        customer_id: req.user?.id,
        subject: validated.subject,
        message: validated.message,
        priority: validated.priority,
        status: 'open',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, data: ticket });
  })
);

// PATCH /api/support/:id - Respond to ticket (staff only)
router.patch(
  '/:id',
  authenticate,
  requireRole('admin', 'staff'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const validated = respondTicketSchema.parse(req.body);

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        last_response: validated.message,
        status: 'in-progress',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !ticket) {
      throw new NotFoundError('Ticket not found');
    }

    res.json({ success: true, data: ticket });
  })
);

// PATCH /api/support/:id/resolve - Resolve ticket (staff only)
router.patch(
  '/:id/resolve',
  authenticate,
  requireRole('admin', 'staff'),
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;

    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error || !ticket) {
      throw new NotFoundError('Ticket not found');
    }

    res.json({ success: true, data: ticket });
  })
);

export default router;
