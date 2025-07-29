import React, { useEffect, useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  CheckCircle,
  Clock,
  DollarSign,
  Trash2,
  ArrowLeft
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
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const pendingAmount = payments
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);
    const overdueAmount = payments
      .filter(p => p.status === 'Overdue')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0);

    return { totalRevenue, paidAmount, pendingAmount, overdueAmount };
  }, [payments]);

  // Filtered payments based on search & status filter
  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
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

  // Handle add payment submit
  async function handleAddPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!clientId || !amount || !date) {
      alert('Please fill all required fields');
      return;
    }
    try {
      const res = await fetch('http://localhost:4000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          amount: parseFloat(amount),
          status,
          date,
          description,
        }),
      });
      if (!res.ok) throw new Error('Failed to add payment');
      const newPayment = await res.json();
      setPayments([...payments, newPayment]);
      // Reset form
      setClientId(null);
      setAmount('');
      setStatus('Paid');
      setDate('');
      setDescription('');
      setShowAddForm(false);
    } catch {
      alert('Failed to add payment.');
    }
  }

  const handleStatusChange = async (paymentId: number, newStatus: 'Paid' | 'Pending' | 'Overdue') => {
  try {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === paymentId ? { ...p, status: newStatus } : p
      )
    );

    await fetch(`http://localhost:4000/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
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
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-[2rem]">
          <h1 className="text-3xl font-bold text-white mb-2">Payments Dashboard</h1>
          <p className="text-white ml-[2rem] font-[300]">
            Track client payments, revenue, and manage your finances
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-[1rem]">
          <div className="bg-[#3c3c3c] rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-4xl transition-all duration-300 ml-[2rem] mb-[2rem]">
            <div className="flex items-center justify-between mb-4">
              <div className="py-[0.6rem] px-[0.75rem] bg-gradient-to-r from-[#2563eb] to-[#6086d7] rounded-[1rem]">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Total Revenue</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</p>
          </div>

          <div className="bg-[#3c3c3c] rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-4xl transition-all duration-300 ml-[2rem] mb-[2rem]">
            <div className="flex items-center justify-between mb-4">
              <div className="py-[0.6rem] px-[0.75rem] bg-gradient-to-r from-[#1e7c42] to-[#4ade80] rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Paid Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.paidAmount)}</p>
          </div>

          <div className="bg-[#3c3c3c] rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-4xl transition-all duration-300 ml-[2rem] mb-[2rem]">
            <div className="flex items-center justify-between mb-4">
              <div className="py-[0.6rem] px-[0.75rem] bg-gradient-to-r from-[#92400e] to-[#fdba74] rounded-xl">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Pending Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.pendingAmount)}</p>
          </div>

          <div className="bg-[#3c3c3c] rounded-2xl p-6 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-4xl transition-all duration-300 ml-[2rem] mb-[2rem]">
            <div className="flex items-center justify-between mb-4">
              <div className="py-[0.6rem] px-[0.75rem] bg-gradient-to-r from-[#991b1b] to-[#f87171] rounded-xl">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-white mb-1">Overdue Amount</h3>
            <p className="text-2xl font-bold text-white">{formatCurrency(metrics.overdueAmount)}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#3c3c3c] rounded-2xl px-4 py-4 shadow-lg border border-slate-200 mb-6 ml-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clients or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full sm:w-80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'all' | 'Paid' | 'Pending' | 'Overdue')
                }
                className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          
          </div>
        </div>


        <div className="ml-8 mt-6 mb-4">
          <a
            href="/clients"
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
          <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Clients
          </a>
        </div>
        
        {/* Payments Table */}
        <div className="bg-[#3c3c3c] rounded-2xl shadow-lg border border-slate-200 overflow-x-auto ml-8">
          <table className="w-full min-w-[700px]">
            <thead className="bg-[#3c3c3c] border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Client</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Date</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-[#1a1a1a] transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-white">{payment.client?.name || 'Unknown'}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-white">{formatCurrency(payment.amount)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <select
                      value={payment.status}
                      onChange={(e) =>
                        handleStatusChange(payment.id, e.target.value as 'Paid' | 'Pending' | 'Overdue')
                      }
                      className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        payment.status,
                      )} bg-transparent text-white`}
                    >
                      < option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-white">{formatDate(payment.date)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => handleDeletePayment(payment.id)}
                      className="text-white hover:text-red-600"
                      title="Delete payment"
                      aria-label="Delete payment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <div className="text-lg font-medium mb-2">No payments found</div>
            <div>Try adjusting your search or filter criteria</div>
          </div>
        )}
      </div>
    </div>
  );
}
