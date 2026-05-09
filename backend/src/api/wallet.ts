import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth.ts';
import { asyncHandler, NotFoundError } from '../middleware/errorHandler.ts';
import { supabaseAdmin } from '../config/supabase.ts';

const router = Router();

// Schemas
const createTransactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['payment', 'refund', 'topup', 'payout']),
  description: z.string(),
  reference_id: z.string().optional(),
});

// GET /api/wallets/me - Get current wallet
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { data: wallet, error } = await supabaseAdmin
      .from('wallets')
      .select('*')
      .eq('customer_id', req.user?.id)
      .single();

    if (error) {
      // Create wallet if doesn't exist
      const { data: newWallet } = await supabaseAdmin
        .from('wallets')
        .insert({ customer_id: req.user?.id, balance: 0 })
        .select()
        .single();

      return res.json({ success: true, data: newWallet });
    }

    res.json({ success: true, data: wallet });
  })
);

// GET /api/wallets/:id/transactions - Get wallet transactions
router.get(
  '/:id/transactions',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: transactions, error, count } = await supabaseAdmin
      .from('wallet_transactions')
      .select('*', { count: 'exact' })
      .eq('wallet_id', id)
      .order('created_at', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) throw error;

    res.json({
      success: true,
      data: transactions,
      pagination: { total: count || 0, limit: Number(limit), offset: Number(offset) },
    });
  })
);

// POST /api/wallets/transactions - Create transaction (admin only)
router.post(
  '/transactions',
  authenticate,
  requireRole('admin', 'staff'),
  asyncHandler(async (req: AuthRequest, res) => {
    const validated = createTransactionSchema.parse(req.body);

    // Get wallet
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallets')
      .select('id')
      .eq('customer_id', req.body.customer_id)
      .single();

    if (walletError || !wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // Create transaction
    const { data: transaction, error } = await supabaseAdmin
      .from('wallet_transactions')
      .insert({
        wallet_id: wallet.id,
        amount: validated.type === 'refund' ? -validated.amount : validated.amount,
        type: validated.type,
        description: validated.description,
        reference_id: validated.reference_id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    // Update wallet balance
    const newBalance = validated.type === 'refund' ? -validated.amount : validated.amount;
    await supabaseAdmin
      .from('wallets')
      .update({ balance: supabaseAdmin.rpc('increment', { x: newBalance }).select() })
      .eq('id', wallet.id);

    res.status(201).json({ success: true, data: transaction });
  })
);

export default router;
