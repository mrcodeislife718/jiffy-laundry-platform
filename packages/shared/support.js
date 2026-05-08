import { supabase } from './supabase';

/**
 * Create a support ticket
 * @param {string} customerId - Customer ID
 * @param {string} subject - Ticket subject
 * @param {string} message - Ticket message
 * @param {string} orderId - Optional order ID
 * @returns {Promise<Object>} Created ticket object
 */
export async function createSupportTicket(customerId, subject, message, orderId = null) {
  const { data, error } = await supabase
    .from('support_tickets')
    .insert([
      {
        customer_id: customerId,
        order_id: orderId,
        subject,
        message,
        status: 'open',
      },
    ])
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Get all support tickets
 * @returns {Promise<Array>} Array of ticket objects
 */
export async function getAllSupportTickets() {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`*,
      customer:customer_id(id, full_name, email, phone),
      order:order_id(id, status, total)`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get customer's support tickets
 * @param {string} customerId - Customer ID
 * @returns {Promise<Array>} Array of customer's ticket objects
 */
export async function getCustomerSupportTickets(customerId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`*,
      order:order_id(id, status, total)`)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Get support ticket by ID
 * @param {string} ticketId - Ticket ID
 * @returns {Promise<Object>} Ticket object
 */
export async function getSupportTicketById(ticketId) {
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`*,
      customer:customer_id(id, full_name, email, phone),
      order:order_id(id, status, total)`)
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update support ticket status
 * @param {string} ticketId - Ticket ID
 * @param {string} status - New status ('open' or 'resolved')
 * @returns {Promise<Object>} Updated ticket object
 */
export async function updateSupportTicketStatus(ticketId, status) {
  if (!['open', 'resolved'].includes(status)) {
    throw new Error('Invalid status. Must be "open" or "resolved".');
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', ticketId)
    .select();

  if (error) throw error;
  return data?.[0];
}

/**
 * Subscribe to support tickets for a customer
 * @param {string} customerId - Customer ID
 * @param {Function} callback - Callback function
 * @returns {Function} Unsubscribe function
 */
export function subscribeToCombinedTickets(customerId, callback) {
  const subscription = supabase
    .from(`support_tickets:customer_id=eq.${customerId}`)
    .on('*', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return () => {
    supabase.removeSubscription(subscription);
  };
}
