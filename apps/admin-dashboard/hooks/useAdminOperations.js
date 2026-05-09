'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@jiffylaundry/shared';

export function useAdminOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all active orders
  const getActiveOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          id,
          customer_id,
          driver_id,
          status,
          total,
          created_at,
          updated_at,
          estimated_delivery
        `)
        .in('status', ['pending_dispatch', 'accepted', 'heading_to_pickup', 'arrived_at_pickup', 'picked_up', 'in_transit', 'arrived_at_facility'])
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get all active drivers
  const getActiveDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          created_at
        `)
        .eq('role', 'driver')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get driver locations
  const getDriverLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('driver_locations')
        .select(`
          *,
          profiles(name, email)
        `)
        .order('updated_at', { ascending: false })
        .limit(100);

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Get at-risk orders (approaching SLA breach)
  const getAtRiskOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .not('estimated_delivery', 'is', null)
        .lt('estimated_delivery', new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()) // Within 2 hours
        .gte('estimated_delivery', new Date().toISOString())
        .order('estimated_delivery', { ascending: true });

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Update order status
  const updateOrderStatus = useCallback(async (orderId, newStatus, reason = null) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (err) throw err;

      // Log audit trail
      await logAuditAction('ORDER_STATUS_UPDATE', `Updated order ${orderId} to ${newStatus}`, { orderId, newStatus, reason });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Reassign driver
  const reassignDriver = useCallback(async (orderId, newDriverId, reason = null) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({
          driver_id: newDriverId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (err) throw err;

      // Log audit trail
      await logAuditAction('DRIVER_REASSIGNMENT', `Reassigned order ${orderId} to driver ${newDriverId}`, { orderId, newDriverId, reason });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Issue refund
  const issueRefund = useCallback(async (orderId, amount, reason = null) => {
    setLoading(true);
    setError(null);
    try {
      // Update order status to refunded
      const { error: err1 } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (err1) throw err1;

      // Log audit trail
      await logAuditAction('REFUND_ISSUED', `Issued refund of $${amount} for order ${orderId}`, { orderId, amount, reason });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Suspend driver
  const suspendDriver = useCallback(async (driverId, reason = null) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          status: 'suspended',
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (err) throw err;

      // Log audit trail
      await logAuditAction('DRIVER_SUSPENDED', `Suspended driver ${driverId}`, { driverId, reason });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Approve driver
  const approveDriver = useCallback(async (driverId) => {
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', driverId);

      if (err) throw err;

      // Log audit trail
      await logAuditAction('DRIVER_APPROVED', `Approved driver ${driverId}`, { driverId });

      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get support tickets
  const getSupportTickets = useCallback(async (filter = 'open') => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles(name, email)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: err } = await query;

      if (err) throw err;
      return data || [];
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Log audit action
  const logAuditAction = useCallback(async (action, description, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user?.id,
          action,
          description,
          metadata,
          created_at: new Date().toISOString(),
        });
    } catch (err) {
      console.error('Error logging audit action:', err);
    }
  }, []);

  return {
    loading,
    error,
    getActiveOrders,
    getActiveDrivers,
    getDriverLocations,
    getAtRiskOrders,
    updateOrderStatus,
    reassignDriver,
    issueRefund,
    suspendDriver,
    approveDriver,
    getSupportTickets,
    logAuditAction,
  };
}
