import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Trash2,
  ArrowLeft,
} from 'lucide-react';

type Client = {
  id: number;
  name: string;
};

type Payment = {
  id: number;
  client?: Client;
  amount?: number;
  status?: 'Paid' | 'Pending' | 'Overdue';
  date?: string;
  description?: string;
};

export default function PaymentsPage() {
  // Data state
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');

  // Add payment form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<'Paid' | 'Pending' | 'Overdue'>('Paid');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Fetch clients and payments on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [paymentsRes, clientsRes] = await Promise.all([
          fetch('http://localhost:4000/api/payments'),
          fetch('http://localhost:4000/clients'),
        ]);
        const paymentsData = await paymentsRes.json();
        const clientsData = await clientsRes.json();
        setPayments(paymentsData);
        setClients(clientsData);
      } catch {
        setError('Failed to fetch data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const paidAmount = payments
      .filter((p) => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const overdueAmount = payments
      .filter((p) => p.status === 'Overdue')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

    return { totalRevenue, paidAmount, pendingAmount, overdueAmount };
  }, [payments]);

  // Filtered payments based on search & status filter
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const clientName = p.client?.name ?? '';
      const matchesSearch =
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchTerm, statusFilter]);

  // Status color helper
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleStatusChange = async (
    paymentId: number,
    newStatus: 'Paid' | 'Pending' | 'Overdue'
  ) => {
    try {
      await fetch(`http://localhost:4000/api/payments/${paymentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state for immediate feedback
      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Failed to update payment status', err);
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    try {
      // Optimistic UI update: remove from local state immediately
      setPayments((prev) => prev.filter((p) => p.id !== paymentId));

      // Call backend API to delete payment
      const res = await fetch(`http://localhost:4000/api/payments/${paymentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete payment');
      }
    } catch (error) {
      alert('Error deleting payment. Please try again.');
      console.error(error);

      const paymentsRes = await fetch('http://localhost:4000/api/payments');
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#272727] text-white">
      <div className="mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="mb-[2rem]">
          <h1 className="mb-2 text-3xl font-bold text-white">Payments Dashboard</h1>
          <p className="ml-[2rem] font-[300] text-white">
            Track client payments, revenue, and manage your finances
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="mb-[1rem] grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="hover:shadow-4xl mb-[2rem] ml-[2rem] rounded-2xl border border-white/10 bg-[#3c3c3c] p-6 shadow-xl backdrop-blur-md transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-[1rem] bg-gradient-to-r from-[#2563eb] to-[#6086d7] px-[0.75rem] py-[0.6rem]">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-sm font-medium text-white">Total Revenue</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
          </div>

          <div className="hover:shadow-4xl mb-[2rem] ml-[2rem] rounded-2xl border border-white/10 bg-[#3c3c3c] p-6 shadow-xl backdrop-blur-md transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-gradient-to-r from-[#1e7c42] to-[#4ade80] px-[0.75rem] py-[0.6rem]">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-sm font-medium text-white">Paid Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.paidAmount)}</p>
          </div>

          <div className="hover:shadow-4xl mb-[2rem] ml-[2rem] rounded-2xl border border-white/10 bg-[#3c3c3c] p-6 shadow-xl backdrop-blur-md transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-gradient-to-r from-[#92400e] to-[#fdba74] px-[0.75rem] py-[0.6rem]">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-sm font-medium text-white">Pending Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.pendingAmount)}</p>
          </div>

          <div className="hover:shadow-4xl mb-[2rem] ml-[2rem] rounded-2xl border border-white/10 bg-[#3c3c3c] p-6 shadow-xl backdrop-blur-md transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-xl bg-gradient-to-r from-[#991b1b] to-[#f87171] px-[0.75rem] py-[0.6rem]">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="mb-1 text-sm font-medium text-white">Overdue Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.overdueAmount)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 ml-8 rounded-2xl border border-slate-200 bg-[#3c3c3c] px-4 py-4 shadow-lg">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
            <div className="flex w-full flex-col gap-4 sm:flex-row lg:w-auto">
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-slate-400" />
                <input
                  type="text"
                  placeholder="Search clients or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-10 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:w-80"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | 'Paid' | 'Pending' | 'Overdue')
                }
                className="rounded-xl border border-slate-200 px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-4 ml-8">
          <a
            href="/clients"
            className="inline-flex items-center text-sm text-blue-400 transition-colors hover:text-blue-300"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Clients
          </a>
        </div>

        {/* Payments Table */}
        <div className="ml-8 overflow-x-auto rounded-2xl border border-slate-200 bg-[#3c3c3c] shadow-lg">
          <table className="w-full min-w-[700px]">
            <thead className="border-b border-slate-200 bg-[#3c3c3c]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Client</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="transition-colors hover:bg-[#1a1a1a]">
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">
                      {payment.client?.name || 'Unknown'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={payment.status}
                      onChange={(e) =>
                        handleStatusChange(
                          payment.id,
                          e.target.value as 'Paid' | 'Pending' | 'Overdue'
                        )
                      }
                      className={`rounded-full border px-2 py-1 text-xs font-medium ${getStatusColor(
                        payment.status
                      )} bg-transparent text-white`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-white">{formatDate(payment.date)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-white hover:text-red-600"
                      title="Delete payment"
                      aria-label="Delete payment"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="py-12 text-center text-slate-500">
            <div className="mb-2 text-lg font-medium">No payments found</div>
            <div>Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}
