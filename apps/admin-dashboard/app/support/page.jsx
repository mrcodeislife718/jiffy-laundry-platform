'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllSupportTickets,
  updateSupportTicketStatus,
} from '@jiffylaundry/shared/support';
import styles from './support.module.css';

export default function AdminSupportPage() {
  const queryClient = useQueryClient();
  const [expandedTicketId, setExpandedTicketId] = React.useState(null);
  const [filterStatus, setFilterStatus] = React.useState('all'); // 'all', 'open', 'resolved'

  // Fetch all support tickets
  const {
    data: allTickets = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['all-support-tickets'],
    queryFn: () => getAllSupportTickets(),
  });

  // Update ticket status mutation
  const updateMutation = useMutation({
    mutationFn: ({ ticketId, status }) =>
      updateSupportTicketStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['all-support-tickets'],
      });
      alert('Ticket status updated successfully');
    },
    onError: (error) => {
      alert('Error updating ticket: ' + (error.message || 'Unknown error'));
    },
  });

  // Filter tickets based on status filter
  const filteredTickets =
    filterStatus === 'all'
      ? allTickets
      : allTickets.filter((ticket) => ticket.status === filterStatus);

  const openTicketsCount = allTickets.filter(
    (t) => t.status === 'open'
  ).length;
  const resolvedTicketsCount = allTickets.filter(
    (t) => t.status === 'resolved'
  ).length;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading support tickets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>Error loading tickets: {error.message}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Support Tickets</h1>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Tickets</div>
          <div className={styles.statValue}>{allTickets.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Open</div>
          <div style={{ color: '#FF9500', fontSize: '24px', fontWeight: 'bold' }}>
            {openTicketsCount}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Resolved</div>
          <div style={{ color: '#34C759', fontSize: '24px', fontWeight: 'bold' }}>
            {resolvedTicketsCount}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className={styles.filterContainer}>
        <button
          style={{
            ...styles.filterButton,
            backgroundColor: filterStatus === 'all' ? '#007AFF' : '#f0f0f0',
            color: filterStatus === 'all' ? '#fff' : '#333',
          }}
          onClick={() => setFilterStatus('all')}
        >
          All ({allTickets.length})
        </button>
        <button
          style={{
            ...styles.filterButton,
            backgroundColor: filterStatus === 'open' ? '#FF9500' : '#f0f0f0',
            color: filterStatus === 'open' ? '#fff' : '#333',
          }}
          onClick={() => setFilterStatus('open')}
        >
          Open ({openTicketsCount})
        </button>
        <button
          style={{
            ...styles.filterButton,
            backgroundColor:
              filterStatus === 'resolved' ? '#34C759' : '#f0f0f0',
            color: filterStatus === 'resolved' ? '#fff' : '#333',
          }}
          onClick={() => setFilterStatus('resolved')}
        >
          Resolved ({resolvedTicketsCount})
        </button>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No {filterStatus !== 'all' ? filterStatus : ''} tickets</p>
        </div>
      ) : (
        <div className={styles.ticketsContainer}>
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className={styles.ticketCard}>
              <div
                className={styles.ticketHeader}
                onClick={() =>
                  setExpandedTicketId(
                    expandedTicketId === ticket.id ? null : ticket.id
                  )
                }
              >
                <div className={styles.ticketHeaderLeft}>
                  <div className={styles.ticketSubject}>{ticket.subject}</div>
                  <div className={styles.ticketCustomer}>
                    Customer: {ticket.customer?.full_name || 'Unknown'} (
                    {ticket.customer?.email})
                  </div>
                </div>
                <div className={styles.ticketHeaderRight}>
                  <span
                    style={{
                      ...styles.statusBadge,
                      backgroundColor:
                        ticket.status === 'open' ? '#FF9500' : '#34C759',
                    }}
                  >
                    {ticket.status?.toUpperCase()}
                  </span>
                  <span className={styles.expandIcon}>
                    {expandedTicketId === ticket.id ? '▼' : '▶'}
                  </span>
                </div>
              </div>

              {expandedTicketId === ticket.id && (
                <div className={styles.ticketDetails}>
                  <div className={styles.ticketMessage}>
                    <strong>Message:</strong>
                    <p>{ticket.message}</p>
                  </div>

                  {ticket.order && (
                    <div className={styles.ticketOrder}>
                      <strong>Related Order:</strong>
                      <Link href={`/orders/${ticket.order_id}`}>
                        {ticket.order_id?.slice(0, 8)}...
                      </Link>
                      <span className={styles.orderStatus}>
                        Status: {ticket.order.status?.replace(/_/g, ' ')}
                      </span>
                      <span>
                        Amount: ${parseFloat(ticket.order.total || 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className={styles.ticketMeta}>
                    <span>
                      Created: {new Date(ticket.created_at).toLocaleDateString()}{' '}
                      {new Date(ticket.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className={styles.ticketActions}>
                    {ticket.status === 'open' ? (
                      <button
                        className={styles.resolveButton}
                        onClick={() =>
                          updateMutation.mutate({
                            ticketId: ticket.id,
                            status: 'resolved',
                          })
                        }
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending
                          ? 'Updating...'
                          : 'Mark as Resolved'}
                      </button>
                    ) : (
                      <button
                        className={styles.reopenButton}
                        onClick={() =>
                          updateMutation.mutate({
                            ticketId: ticket.id,
                            status: 'open',
                          })
                        }
                        disabled={updateMutation.isPending}
                      >
                        {updateMutation.isPending ? 'Updating...' : 'Reopen'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
