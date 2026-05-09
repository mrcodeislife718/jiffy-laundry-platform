'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import AdminCard from '@/components/AdminCard';
import AdminInput from '@/components/AdminInput';
import AdminTable from '@/components/AdminTable';
import AdminModal from '@/components/AdminModal';
import StatusBadge from '@/components/StatusBadge';
import MetricCard from '@/components/MetricCard';
import AlertBanner from '@/components/AlertBanner';
import AdminButton from '@/components/AdminButton';

export default function SupportPage() {
  const { colors, isDark } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [metrics, setMetrics] = useState({
    openTickets: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  // Load tickets and metrics
  useEffect(() => {
    loadTicketsAndMetrics();
  }, []);

  const loadTicketsAndMetrics = async () => {
    setLoading(true);
    // Mock data - in production, fetch from Supabase
    const mockTickets = [
      {
        id: 'TICKET-001',
        customer: 'Sarah Johnson',
        subject: 'Order delivery delay',
        message: 'My order was supposed to be delivered 2 hours ago but still no sign of the driver.',
        priority: 'high',
        status: 'open',
        created: '2024-01-16T08:30:00Z',
        thread: [
          { role: 'customer', message: 'My order was supposed to be delivered 2 hours ago but still no sign of the driver.', time: '2024-01-16T08:30:00Z' },
        ],
      },
      {
        id: 'TICKET-002',
        customer: 'Mike Chen',
        subject: 'Payment not processed',
        message: 'I was charged twice for the same order. Please refund the duplicate charge.',
        priority: 'urgent',
        status: 'open',
        created: '2024-01-16T07:45:00Z',
        thread: [
          { role: 'customer', message: 'I was charged twice for the same order. Please refund the duplicate charge.', time: '2024-01-16T07:45:00Z' },
        ],
      },
      {
        id: 'TICKET-003',
        customer: 'Emma Davis',
        subject: 'Quality issue with laundry',
        message: 'Some items came back with stains. This is unacceptable.',
        priority: 'high',
        status: 'in-progress',
        created: '2024-01-15T14:20:00Z',
        thread: [
          { role: 'customer', message: 'Some items came back with stains. This is unacceptable.', time: '2024-01-15T14:20:00Z' },
          { role: 'admin', message: 'We apologize for the quality issue. We are investigating this matter immediately.', time: '2024-01-15T15:00:00Z' },
        ],
      },
      {
        id: 'TICKET-004',
        customer: 'James Wilson',
        subject: 'Lost item claim',
        message: 'One of my favorite shirts is missing from the order.',
        priority: 'high',
        status: 'in-progress',
        created: '2024-01-15T10:00:00Z',
        thread: [
          { role: 'customer', message: 'One of my favorite shirts is missing from the order.', time: '2024-01-15T10:00:00Z' },
          { role: 'admin', message: 'We will compensate you with a $50 credit. Please provide a description of the item.', time: '2024-01-15T11:30:00Z' },
        ],
      },
      {
        id: 'TICKET-005',
        customer: 'Lisa Anderson',
        subject: 'General inquiry',
        message: 'Can I get premium service for my wedding dress?',
        priority: 'low',
        status: 'resolved',
        created: '2024-01-14T16:10:00Z',
        thread: [
          { role: 'customer', message: 'Can I get premium service for my wedding dress?', time: '2024-01-14T16:10:00Z' },
          { role: 'admin', message: 'Yes, we offer premium dry cleaning. Please contact our team for pricing.', time: '2024-01-14T16:45:00Z' },
          { role: 'customer', message: 'Thank you for the quick response!', time: '2024-01-14T17:00:00Z' },
        ],
      },
      {
        id: 'TICKET-006',
        customer: 'Robert Brown',
        subject: 'Subscription issue',
        message: 'My subscription renewal failed.',
        priority: 'medium',
        status: 'in-progress',
        created: '2024-01-14T11:55:00Z',
        thread: [
          { role: 'customer', message: 'My subscription renewal failed.', time: '2024-01-14T11:55:00Z' },
          { role: 'admin', message: 'I see the issue. Let me update your payment method.', time: '2024-01-14T12:30:00Z' },
        ],
      },
      {
        id: 'TICKET-007',
        customer: 'Jennifer Martinez',
        subject: 'App crash on login',
        message: 'The app keeps crashing when I try to log in.',
        priority: 'urgent',
        status: 'open',
        created: '2024-01-13T19:20:00Z',
        thread: [
          { role: 'customer', message: 'The app keeps crashing when I try to log in.', time: '2024-01-13T19:20:00Z' },
        ],
      },
      {
        id: 'TICKET-008',
        customer: 'David Taylor',
        subject: 'Complaint resolved',
        message: 'I received my order with wrong items but it was quickly resolved.',
        priority: 'low',
        status: 'resolved',
        created: '2024-01-13T09:00:00Z',
        thread: [
          { role: 'customer', message: 'I received my order with wrong items but it was quickly resolved.', time: '2024-01-13T09:00:00Z' },
          { role: 'admin', message: 'Thank you for your patience. We have sent the correct items.', time: '2024-01-13T10:15:00Z' },
        ],
      },
    ];

    setTickets(mockTickets);
    setMetrics({
      openTickets: mockTickets.filter((t) => t.status === 'open').length,
      inProgress: mockTickets.filter((t) => t.status === 'in-progress').length,
      resolved: mockTickets.filter((t) => t.status === 'resolved').length,
      avgResolutionTime: 2.5,
    });
    setLoading(false);
  };

  // Filter tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowViewModal(true);
  };

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText('');
    setShowResponseModal(true);
  };

  const handleSendResponse = () => {
    if (selectedTicket && responseText.trim()) {
      // Update ticket with new response
      const updatedTickets = tickets.map((t) => {
        if (t.id === selectedTicket.id) {
          return {
            ...t,
            thread: [
              ...t.thread,
              {
                role: 'admin',
                message: responseText,
                time: new Date().toISOString(),
              },
            ],
            status: 'in-progress',
          };
        }
        return t;
      });
      setTickets(updatedTickets);
      setShowResponseModal(false);
      // In production, call API to save response and send notification
    }
  };

  const handleResolveTicket = (ticket) => {
    const updatedTickets = tickets.map((t) =>
      t.id === ticket.id ? { ...t, status: 'resolved' } : t
    );
    setTickets(updatedTickets);
    setShowViewModal(false);
  };

  const getPriorityColor = (priority) => {
    if (priority === 'urgent') return 'text-red-600 font-bold';
    if (priority === 'high') return 'text-orange-600 font-semibold';
    if (priority === 'medium') return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusLabel = (status) => {
    const labels = {
      open: 'Open',
      'in-progress': 'In Progress',
      resolved: 'Resolved',
    };
    return labels[status] || status;
  };

  const columns = [
    { key: 'id', label: 'Ticket ID', width: '12%' },
    { key: 'customer', label: 'Customer', width: '15%' },
    { key: 'subject', label: 'Subject', width: '25%' },
    {
      key: 'priority',
      label: 'Priority',
      width: '12%',
      render: (value) => <span className={getPriorityColor(value)}>{value.charAt(0).toUpperCase() + value.slice(1)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '12%',
      render: (value) => {
        let mappedStatus = 'pending';
        if (value === 'resolved') mappedStatus = 'delivered';
        else if (value === 'in-progress') mappedStatus = 'processing';
        return <StatusBadge status={mappedStatus} />;
      },
    },
    {
      key: 'created',
      label: 'Created',
      width: '12%',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    },
  ];

  const rowActions = [
    {
      label: 'View',
      icon: '👁️',
      onClick: (row) => openTicketModal(row),
    },
    {
      label: 'Respond',
      icon: '💬',
      onClick: (row) => openResponseModal(row),
      visible: (row) => row.status !== 'resolved',
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-gray-200 dark:border-slate-700">
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          💬 Support Center
        </h1>
        <p className={isDark ? 'text-slate-400' : 'text-gray-600'}>
          Manage support tickets and customer inquiries
        </p>
      </div>

      {/* Metrics Row */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            label="Open Tickets"
            value={metrics.openTickets.toString()}
            change={0}
            icon="📬"
            color="#FF5A00"
          />
          <MetricCard
            label="In Progress"
            value={metrics.inProgress.toString()}
            change={0}
            icon="⏳"
            color="#3B82F6"
          />
          <MetricCard
            label="Resolved"
            value={metrics.resolved.toString()}
            change={12.5}
            icon="✓"
            color="#061B3A"
          />
          <MetricCard
            label="Avg Resolution"
            value={`${metrics.avgResolutionTime}h`}
            change={-5.2}
            icon="⏱️"
            color="#8B5CF6"
          />
        </div>

        {/* Alert Banners */}
        {metrics.openTickets > 0 && (
          <AlertBanner severity="warning" message={`${metrics.openTickets} open ticket(s) waiting for response.`} />
        )}
      </div>

      {/* Search and Filter */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <AdminInput
            label="Search Tickets"
            placeholder="Search by ID, customer, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            type="text"
          />
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
              Priority
            </label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border ${
                isDark
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="px-6 pb-6">
        <AdminCard title="Support Tickets" subtitle={`${filteredTickets.length} tickets`}>
          <AdminTable
            columns={columns}
            data={filteredTickets}
            rowActions={rowActions}
            loading={loading}
            emptyMessage="No tickets found"
          />
        </AdminCard>
      </div>

      {/* View Ticket Modal */}
      <AdminModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Ticket Details"
        size="lg"
        actions={[
          selectedTicket?.status !== 'resolved' && {
            label: 'Respond',
            onClick: () => {
              setShowViewModal(false);
              setTimeout(() => openResponseModal(selectedTicket), 100);
            },
            variant: 'primary',
          },
          selectedTicket?.status !== 'resolved' && {
            label: 'Mark Resolved',
            onClick: () => handleResolveTicket(selectedTicket),
            variant: 'success',
          },
          {
            label: 'Close',
            onClick: () => setShowViewModal(false),
            variant: 'secondary',
          },
        ].filter(Boolean)}
      >
        {selectedTicket && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-slate-700">
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Ticket ID</p>
                <p className="font-semibold text-[#FF5A00]">{selectedTicket.id}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Customer</p>
                <p className="font-semibold">{selectedTicket.customer}</p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Priority</p>
                <p className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority.charAt(0).toUpperCase() + selectedTicket.priority.slice(1)}
                </p>
              </div>
              <div>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Status</p>
                <p className="font-semibold">{getStatusLabel(selectedTicket.status)}</p>
              </div>
            </div>

            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2`}>Subject</p>
              <p className="font-semibold text-lg">{selectedTicket.subject}</p>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'} mb-2`}>Conversation</p>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedTicket.thread.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === 'customer'
                        ? isDark
                          ? 'bg-slate-700'
                          : 'bg-white border border-gray-200'
                        : isDark
                          ? 'bg-[#FF5A00]/20'
                          : 'bg-orange-50'
                    }`}
                  >
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      {msg.role === 'customer' ? 'Customer' : 'Support Team'} •{' '}
                      {new Date(msg.time).toLocaleString('en-US', {
                        month: 'short',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className={isDark ? 'text-slate-200' : 'text-gray-800'}>{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Response Modal */}
      <AdminModal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Send Response"
        size="lg"
        actions={[
          {
            label: 'Cancel',
            onClick: () => setShowResponseModal(false),
            variant: 'secondary',
          },
          {
            label: 'Send Response',
            onClick: handleSendResponse,
            variant: 'primary',
          },
        ]}
      >
        {selectedTicket && (
          <div className={`space-y-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Responding to</p>
              <p className="font-semibold">{selectedTicket.customer} - {selectedTicket.subject}</p>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                Your Response
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Type your response here..."
                rows="6"
                className={`w-full px-3 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                } focus:outline-none focus:ring-2 focus:ring-[#FF5A00]`}
              />
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
